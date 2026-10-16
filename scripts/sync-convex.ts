/**
 * Standalone script to sync APL product data to Convex (with stale product purge)
 * Run with: node --env-file=.env.local --import tsx scripts/sync-convex.ts
 *
 * Make sure PUBLIC_CONVEX_URL is set in your .env file
 */

import { ConvexHttpClient } from "convex/browser";
import { parseExcel } from "../src/lib/excelParser";
import { downloadAPLFile, findCurrentAPLUrl } from "../src/lib/scraper";

const convexUrl = process.env.PUBLIC_CONVEX_URL || process.env.CONVEX_URL;

if (!convexUrl) {
  console.error(
    "❌ Error: PUBLIC_CONVEX_URL or CONVEX_URL environment variable is not set",
  );
  process.exit(1);
}

console.log(`🔗 Using Convex URL: ${convexUrl.substring(0, 30)}...`);

const convex = new ConvexHttpClient(convexUrl);
const { api } = await import("../convex/_generated/api.js");

async function syncToConvex() {
  try {
    console.log("🚀 Starting Convex snapshot sync...\n");

    console.log("📡 Finding APL URL...");
    const aplUrl = await findCurrentAPLUrl();
    console.log(`   Found: ${aplUrl}\n`);

    console.log("📥 Downloading APL file...");
    const fileBuffer = await downloadAPLFile(aplUrl);
    console.log(
      `   Downloaded: ${(fileBuffer.byteLength / 1024 / 1024).toFixed(2)} MB\n`,
    );

    console.log("📊 Parsing and normalizing Excel file...");
    const products = await parseExcel(fileBuffer);
    console.log(
      `   Found: ${products.length.toLocaleString()} unique normalized products\n`,
    );

    if (products.length === 0) {
      console.error("❌ No products found in the Excel file");
      process.exit(1);
    }

    const syncTimestamp = Date.now();
    const BATCH_SIZE = 500;
    let processedCount = 0;

    console.log("⬆️  Uploading snapshot to Convex...");

    for (let i = 0; i < products.length; i += BATCH_SIZE) {
      const batch = products.slice(i, i + BATCH_SIZE);
      const batchNum = Math.floor(i / BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(products.length / BATCH_SIZE);

      process.stdout.write(
        `   Batch ${batchNum}/${totalBatches} (${batch.length} products)...`,
      );

      await convex.mutation(api.sync.bulkUpsertProducts, {
        products: batch,
        syncTimestamp,
      });
      processedCount += batch.length;

      console.log(" ✅");
    }

    console.log("\n🧹 Purging discontinued/stale products...");
    let cursor: string | null = null;
    let isDone = false;
    let purgedCount = 0;
    while (!isDone) {
      const purgeRes: {
        deletedCount: number;
        continueCursor: string;
        isDone: boolean;
      } = await convex.mutation(api.sync.purgeStaleProducts, {
        syncTimestamp,
        cursor,
        batchSize: 1000,
      });
      purgedCount += purgeRes.deletedCount;
      cursor = purgeRes.continueCursor;
      isDone = purgeRes.isDone;
    }
    console.log(`   Purged ${purgedCount.toLocaleString()} stale products ✅`);

    console.log("\n📝 Updating sync metadata...");
    await convex.mutation(api.sync.updateSyncMetadata, {
      totalProducts: products.length,
      syncTimestamp,
      sourceUrl: aplUrl,
    });

    console.log("\n✨ Snapshot sync completed successfully!");
    console.log(
      `   Total active products: ${processedCount.toLocaleString()} (purged: ${purgedCount.toLocaleString()})`,
    );
  } catch (error) {
    console.error(
      "\n❌ Sync failed:",
      error instanceof Error ? error.message : String(error),
    );
    if (error instanceof Error && error.stack) {
      console.error("\nStack trace:", error.stack);
    }
    process.exit(1);
  }
}

syncToConvex();
