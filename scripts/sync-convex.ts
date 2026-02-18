/**
 * Standalone script to sync APL product data to Convex
 * Run with: pnpm tsx --env-file=.env.local scripts/sync-convex.ts
 * 
 * Make sure PUBLIC_CONVEX_URL is set in your .env file
 */

import { ConvexHttpClient } from "convex/browser";
import { parseExcel } from "../src/lib/excelParser";
import { downloadAPLFile, findCurrentAPLUrl } from "../src/lib/scraper";

// Get Convex URL from environment
const convexUrl = process.env.PUBLIC_CONVEX_URL || process.env.CONVEX_URL;

if (!convexUrl) {
  console.error("❌ Error: PUBLIC_CONVEX_URL or CONVEX_URL environment variable is not set");
  console.error("   Run with: pnpm tsx --env-file=.env.local scripts/sync-convex.ts");
  console.error("   Or create a .env file with: PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud");
  process.exit(1);
}

console.log(`🔗 Using Convex URL: ${convexUrl.substring(0, 30)}...`);

const convex = new ConvexHttpClient(convexUrl);

// Import API dynamically to avoid build issues
const { api } = await import("../convex/_generated/api.js");

async function syncToConvex() {
  try {
    console.log("🚀 Starting Convex sync...\n");

    // Step 1: Find the current APL URL
    console.log("📡 Finding APL URL...");
    const aplUrl = await findCurrentAPLUrl();
    console.log(`   Found: ${aplUrl}\n`);

    // Step 2: Download the Excel file
    console.log("📥 Downloading APL file...");
    const fileBuffer = await downloadAPLFile(aplUrl);
    console.log(`   Downloaded: ${(fileBuffer.byteLength / 1024 / 1024).toFixed(2)} MB\n`);

    // Step 3: Parse the Excel file
    console.log("📊 Parsing Excel file...");
    const products = await parseExcel(fileBuffer);
    console.log(`   Found: ${products.length.toLocaleString()} products\n`);

    if (products.length === 0) {
      console.error("❌ No products found in the Excel file");
      process.exit(1);
    }

    // Step 4: Push to Convex in batches
    const BATCH_SIZE = 1000;
    let processedCount = 0;

    console.log("⬆️  Uploading to Convex...");
    
    for (let i = 0; i < products.length; i += BATCH_SIZE) {
      const batch = products.slice(i, i + BATCH_SIZE);
      const batchNum = Math.floor(i / BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(products.length / BATCH_SIZE);
      
      process.stdout.write(`   Batch ${batchNum}/${totalBatches} (${batch.length} products)...`);
      
      await convex.mutation(api.sync.bulkUpsertProducts, { products: batch });
      processedCount += batch.length;
      
      console.log(" ✅");
    }

    // Step 5: Update metadata
    console.log("\n📝 Updating sync metadata...");
    await convex.mutation(api.sync.updateSyncMetadata, { totalProducts: products.length });

    console.log("\n✨ Sync completed successfully!");
    console.log(`   Total products processed: ${processedCount.toLocaleString()}`);
    
  } catch (error) {
    console.error("\n❌ Sync failed:", error instanceof Error ? error.message : String(error));
    if (error instanceof Error && error.stack) {
      console.error("\nStack trace:", error.stack);
    }
    process.exit(1);
  }
}

syncToConvex();
