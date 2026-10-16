import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { read, utils } from "xlsx";
import { api } from "./_generated/api";
import { action, mutation, query } from "./_generated/server";

const NYS_WIC_APL_PAGE = "https://nyswicvendors.com/upc-resources/";
const NYS_WIC_BASE_URL = "https://nyswicvendors.com";

function expandUpcE(upcE8: string): string {
  const ns = upcE8[0];
  const d1 = upcE8[1];
  const d2 = upcE8[2];
  const d3 = upcE8[3];
  const d4 = upcE8[4];
  const d5 = upcE8[5];
  const d6 = upcE8[6];
  const check = upcE8[7];

  let body: string;
  if (d6 === "0" || d6 === "1" || d6 === "2") {
    body = `${ns}${d1}${d2}${d6}0000${d3}${d4}${d5}`;
  } else if (d6 === "3") {
    body = `${ns}${d1}${d2}${d3}00000${d4}${d5}`;
  } else if (d6 === "4") {
    body = `${ns}${d1}${d2}${d3}${d4}00000${d5}`;
  } else {
    body = `${ns}${d1}${d2}${d3}${d4}${d5}0000${d6}`;
  }

  return `${body}${check}`;
}

function normalizeUpc(raw: string | number | null | undefined): string {
  if (raw === null || raw === undefined) return "";
  const digits = String(raw).trim().replace(/\D+/g, "");
  if (!digits) return "";
  if (digits.length === 4) return digits;
  if (digits.length === 5 && digits.startsWith("9")) return digits;
  if (digits.length === 13 && digits.startsWith("0")) return digits.slice(1);
  if (digits.length === 8 && (digits.startsWith("0") || digits.startsWith("1"))) {
    return expandUpcE(digits);
  }
  if (digits.length >= 6 && digits.length <= 11) {
    return digits.padStart(12, "0");
  }
  return digits;
}

// === Mutations ===

export const bulkUpsertProducts = mutation({
  args: {
    products: v.array(
      v.object({
        upc: v.string(),
        categoryDescription: v.string(),
        subCategoryDescription: v.string(),
        brandName: v.string(),
        foodDescription: v.string(),
        packageSize: v.string(),
        uom: v.string(),
      }),
    ),
    syncTimestamp: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const stampedAt = args.syncTimestamp ?? Date.now();
    let processed = 0;
    let inserted = 0;
    let updated = 0;

    for (const product of args.products) {
      const normalizedUpc = normalizeUpc(product.upc);
      if (!normalizedUpc) continue;

      const record = {
        ...product,
        upc: normalizedUpc,
        lastSyncedAt: stampedAt,
      };

      const existing = await ctx.db
        .query("products")
        .withIndex("by_upc", (q) => q.eq("upc", normalizedUpc))
        .first();

      if (existing) {
        await ctx.db.patch(existing._id, record);
        updated++;
      } else {
        await ctx.db.insert("products", record);
        inserted++;
      }
      processed++;
    }

    console.log(
      `bulkUpsertProducts: processed ${processed}, inserted ${inserted}, updated ${updated}`,
    );
    return { processed, inserted, updated };
  },
});

export const purgeStaleProducts = mutation({
  args: {
    syncTimestamp: v.number(),
    cursor: v.optional(v.union(v.string(), v.null())),
    batchSize: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const page = await ctx.db
      .query("products")
      .paginate({
        numItems: args.batchSize ?? 1000,
        cursor: args.cursor ?? null,
      });

    let deletedCount = 0;
    for (const doc of page.page) {
      if (doc.lastSyncedAt !== args.syncTimestamp) {
        await ctx.db.delete(doc._id);
        deletedCount++;
      }
    }

    return {
      deletedCount,
      continueCursor: page.continueCursor,
      isDone: page.isDone,
    };
  },
});

export const updateSyncMetadata = mutation({
  args: {
    totalProducts: v.number(),
    syncTimestamp: v.optional(v.number()),
    sourceUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("syncMetadata").first();
    const lastSyncDate = args.syncTimestamp ?? Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        lastSyncDate,
        totalProducts: args.totalProducts,
        ...(args.sourceUrl ? { sourceUrl: args.sourceUrl } : {}),
      });
    } else {
      await ctx.db.insert("syncMetadata", {
        lastSyncDate,
        totalProducts: args.totalProducts,
        ...(args.sourceUrl ? { sourceUrl: args.sourceUrl } : {}),
      });
    }
  },
});

// === Queries ===

export const getSyncMetadata = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("syncMetadata").first();
  },
});

export const getProductsPaginated = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("products")
      .order("asc")
      .paginate(args.paginationOpts);
  },
});

export const getAllProducts = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("products").take(8000);
  },
});

// === Actions (Scheduled Snapshot Sync) ===

function extractAplExcelUrl(html: string): string {
  const linkRegex = /<a\b[^>]*href=["']([^"']+\.xlsx?)["'][^>]*>([\s\S]*?)<\/a>/gi;
  const candidates: Array<{ href: string; text: string }> = [];
  let match: RegExpExecArray | null;

  while ((match = linkRegex.exec(html)) !== null) {
    candidates.push({
      href: match[1].trim(),
      text: match[2].replace(/<[^>]+>/g, " ").trim().toLowerCase(),
    });
  }

  const chosen =
    candidates.find(
      (c) =>
        c.text.includes("approved product list") ||
        c.text.includes("apl") ||
        c.href.toLowerCase().includes("apl"),
    ) || candidates[0];

  if (!chosen) {
    throw new Error("Could not find APL Excel link on NYS WIC vendor page");
  }

  return chosen.href.startsWith("http")
    ? chosen.href
    : new URL(chosen.href, NYS_WIC_BASE_URL).toString();
}

export const syncFromNysApl = action({
  args: {},
  handler: async (ctx) => {
    const pageResponse = await fetch(NYS_WIC_APL_PAGE);
    if (!pageResponse.ok) {
      throw new Error(
        `Failed to fetch NYS WIC APL page: ${pageResponse.status}`,
      );
    }
    const html = await pageResponse.text();
    const excelUrl = extractAplExcelUrl(html);

    const fileResponse = await fetch(excelUrl);
    if (!fileResponse.ok) {
      throw new Error(`Failed to download APL Excel file: ${fileResponse.status}`);
    }
    const arrayBuffer = await fileResponse.arrayBuffer();

    const workbook = read(arrayBuffer, { type: "array" });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawData = utils.sheet_to_json(worksheet, { header: 1 }) as unknown[][];

    let headerRowIndex = -1;
    let headers: string[] = [];
    for (let i = 0; i < Math.min(20, rawData.length); i++) {
      const row = rawData[i];
      if (!Array.isArray(row)) continue;
      const rowStr = row.map((c) => String(c || "").toLowerCase()).join(" ");
      if (
        rowStr.includes("upc") ||
        rowStr.includes("plu") ||
        (rowStr.includes("category") && rowStr.includes("description"))
      ) {
        headerRowIndex = i;
        headers = row.map((c) => String(c || "").trim());
        break;
      }
    }

    if (headerRowIndex === -1) {
      throw new Error("Could not find header row in NYS APL Excel file");
    }

    const findCol = (patterns: string[], exclude: string[] = []) =>
      headers.findIndex((h) => {
        const lower = h.toLowerCase();
        if (exclude.some((ex) => lower.includes(ex))) return false;
        return patterns.some((p) => lower.includes(p));
      });

    const upcIdx = findCol(["upc", "plu"]);
    const catIdx = findCol(["category description", "category"], ["sub"]);
    const subIdx = findCol(["sub-category", "subcategory", "sub category"]);
    const brandIdx = findCol(["brand"]);
    const foodIdx = findCol(["food description", "food", "item description"]);
    const sizeIdx = findCol(["package size", "size"]);
    const uomIdx = findCol(["uom", "unit of measure", "unit"]);

    const deduped = new Map<
      string,
      {
        upc: string;
        categoryDescription: string;
        subCategoryDescription: string;
        brandName: string;
        foodDescription: string;
        packageSize: string;
        uom: string;
      }
    >();

    for (const row of rawData.slice(headerRowIndex + 1)) {
      if (!Array.isArray(row)) continue;
      const upc = normalizeUpc(String(row[upcIdx] ?? ""));
      if (!upc) continue;

      deduped.set(upc, {
        upc,
        categoryDescription:
          catIdx !== -1 ? String(row[catIdx] || "").trim() : "",
        subCategoryDescription:
          subIdx !== -1 ? String(row[subIdx] || "").trim() : "",
        brandName: brandIdx !== -1 ? String(row[brandIdx] || "").trim() : "",
        foodDescription: foodIdx !== -1 ? String(row[foodIdx] || "").trim() : "",
        packageSize: sizeIdx !== -1 ? String(row[sizeIdx] || "").trim() : "",
        uom: uomIdx !== -1 ? String(row[uomIdx] || "").trim() : "",
      });
    }

    const products = Array.from(deduped.values());
    if (products.length === 0) {
      throw new Error("Parsed 0 products from NYS APL Excel file");
    }

    const syncTimestamp = Date.now();
    const BATCH_SIZE = 500;
    for (let i = 0; i < products.length; i += BATCH_SIZE) {
      const batch = products.slice(i, i + BATCH_SIZE);
      await ctx.runMutation(api.sync.bulkUpsertProducts, {
        products: batch,
        syncTimestamp,
      });
    }

    let cursor: string | null = null;
    let isDone = false;
    let purgedCount = 0;
    while (!isDone) {
      const purgeRes: {
        deletedCount: number;
        continueCursor: string;
        isDone: boolean;
      } = await ctx.runMutation(api.sync.purgeStaleProducts, {
        syncTimestamp,
        cursor,
        batchSize: 1000,
      });
      purgedCount += purgeRes.deletedCount;
      cursor = purgeRes.continueCursor;
      isDone = purgeRes.isDone;
    }

    await ctx.runMutation(api.sync.updateSyncMetadata, {
      totalProducts: products.length,
      syncTimestamp,
      sourceUrl: excelUrl,
    });

    return {
      success: true,
      totalProducts: products.length,
      purgedCount,
      sourceUrl: excelUrl,
    };
  },
});
