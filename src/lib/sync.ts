import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";
import type { Product } from "./db";
import { db } from "./db";
import { normalizeUpc } from "./upc";

function getConvexHttpClient(): ConvexHttpClient {
  const convexUrl =
    import.meta.env.PUBLIC_CONVEX_URL || import.meta.env.NEXT_PUBLIC_CONVEX_URL;

  if (!convexUrl) {
    throw new Error(
      "PUBLIC_CONVEX_URL environment variable is not set. Please add it to your .env file.",
    );
  }

  return new ConvexHttpClient(convexUrl);
}

export async function syncAPLData() {
  try {
    console.log("Starting sync from Convex...");
    const convex = getConvexHttpClient();

    // Step 1: Get metadata from Convex
    const remoteMetadata = await convex.query(api.sync.getSyncMetadata);

    if (!remoteMetadata) {
      throw new Error("No data available on server yet.");
    }

    console.log(
      `Server has ${remoteMetadata.totalProducts} products, last updated: ${new Date(remoteMetadata.lastSyncDate).toLocaleString()}`,
    );

    // Step 2: Download all products from Convex using pagination BEFORE modifying IndexedDB
    const dedupedProducts = new Map<string, Product>();
    let isDone = false;
    let cursor = null;
    const BATCH_SIZE = 1000;

    console.log("Downloading products...");

    while (!isDone) {
      // @ts-expect-error - Pagination types are tricky with raw client
      const result = await convex.query(api.sync.getProductsPaginated, {
        paginationOpts: {
          numItems: BATCH_SIZE,
          cursor: cursor,
        },
      });

      for (const p of result.page as any[]) {
        const upc = normalizeUpc(p.upc) || String(p.upc || "").trim();
        if (!upc) continue;
        dedupedProducts.set(upc, {
          upc,
          categoryDescription: p.categoryDescription,
          subCategoryDescription: p.subCategoryDescription,
          brandName: p.brandName,
          foodDescription: p.foodDescription,
          packageSize: p.packageSize,
          uom: p.uom,
        });
      }

      cursor = result.continueCursor;
      isDone = result.isDone;

      console.log(
        `Fetched ${dedupedProducts.size} / ${remoteMetadata.totalProducts} products...`,
      );
    }

    const allProducts = Array.from(dedupedProducts.values());
    console.log(`Downloaded total ${allProducts.length} products from Convex`);

    if (allProducts.length === 0) {
      throw new Error("No products received from server");
    }

    // Step 3: Atomically swap IndexedDB catalog inside a single readwrite transaction
    await db.transaction("rw", db.products, db.syncMetadata, async () => {
      await db.products.clear();
      await db.products.bulkPut(allProducts);
      await db.syncMetadata.put({
        id: "current",
        lastSyncDate: new Date(remoteMetadata.lastSyncDate),
        totalProducts: allProducts.length,
      });
    });

    return { success: true, productCount: allProducts.length };
  } catch (error) {
    console.error("Sync failed:", error);
    throw error;
  }
}
