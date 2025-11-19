import type { APIRoute } from "astro";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../convex/_generated/api.js";
import { parseExcel } from "../../lib/excelParser";
import { downloadAPLFile, findCurrentAPLUrl } from "../../lib/scraper";

// Initialize Convex Client
const convexUrl = import.meta.env.CONVEX_URL || import.meta.env.NEXT_PUBLIC_CONVEX_URL;
const convex = new ConvexHttpClient(convexUrl);

export const POST: APIRoute = async ({ request }) => {
  try {
    // Check for secret key to prevent unauthorized access (optional but recommended)
    const authHeader = request.headers.get("Authorization");
    if (authHeader !== `Bearer ${import.meta.env.CRON_SECRET}`) {
      // Allow local development without secret, or if CRON_SECRET is not set
      if (import.meta.env.CRON_SECRET) {
         return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
      }
    }

    console.log("Starting server-side sync...");

    // Step 1: Find the current APL URL
    const aplUrl = await findCurrentAPLUrl();
    console.log("Found APL URL:", aplUrl);

    // Step 2: Download the Excel file
    const fileBuffer = await downloadAPLFile(aplUrl);
    console.log("Downloaded APL file, size:", fileBuffer.byteLength);

    // Step 3: Parse the Excel file
    const products = await parseExcel(fileBuffer);
    console.log(`Parsed ${products.length} products`);

    if (products.length === 0) {
      return new Response(JSON.stringify({ error: "No products found" }), { status: 500 });
    }

    // Step 4: Push to Convex in batches
    const BATCH_SIZE = 1000; // Adjust based on Convex limits
    let processedCount = 0;

    for (let i = 0; i < products.length; i += BATCH_SIZE) {
      const batch = products.slice(i, i + BATCH_SIZE);
      console.log(`Uploading batch ${i / BATCH_SIZE + 1} (${batch.length} products)...`);
      
      // @ts-ignore - Types might be tricky in Astro + Convex setup
      await convex.mutation(api.sync.bulkUpsertProducts, { products: batch });
      processedCount += batch.length;
    }

    // Step 5: Update metadata
    // @ts-ignore
    await convex.mutation(api.sync.updateSyncMetadata, { totalProducts: products.length });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Sync completed successfully",
        productsProcessed: processedCount,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Sync failed:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500 }
    );
  }
};

