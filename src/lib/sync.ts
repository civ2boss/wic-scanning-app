import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";
import { db } from "./db";
import type { Product } from "./db";

// Initialize Convex Client
// Using import.meta.env for Vite/Astro environment variables
const convexUrl = import.meta.env.PUBLIC_CONVEX_URL || import.meta.env.NEXT_PUBLIC_CONVEX_URL;

if (!convexUrl) {
  throw new Error("PUBLIC_CONVEX_URL environment variable is not set. Please add it to your .env file.");
}

const convex = new ConvexHttpClient(convexUrl);

export async function syncAPLData() {
  try {
    console.log("Starting sync from Convex...");

    // Step 1: Get metadata from Convex
    const remoteMetadata = await convex.query(api.sync.getSyncMetadata);
    
    if (!remoteMetadata) {
      throw new Error("No data available on server yet.");
    }

    console.log(`Server has ${remoteMetadata.totalProducts} products, last updated: ${new Date(remoteMetadata.lastSyncDate).toLocaleString()}`);

    // Step 2: Download all products from Convex using pagination
    const allProducts: Product[] = [];
    let isDone = false;
    let cursor = null;
    const BATCH_SIZE = 1000; // Safe batch size

    console.log("Downloading products...");

    while (!isDone) {
        // @ts-ignore - Pagination types are tricky with raw client
        const result = await convex.query(api.sync.getProductsPaginated, {
            paginationOpts: {
                numItems: BATCH_SIZE,
                cursor: cursor,
            },
        });

        // Map to our local Product type
        const batch = result.page.map((p: any) => ({
            upc: p.upc,
            categoryDescription: p.categoryDescription,
            subCategoryDescription: p.subCategoryDescription,
            brandName: p.brandName,
            foodDescription: p.foodDescription,
            packageSize: p.packageSize,
            uom: p.uom
        }));

        allProducts.push(...batch);
        cursor = result.continueCursor;
        isDone = result.isDone;

        console.log(`Fetched ${allProducts.length} / ${remoteMetadata.totalProducts} products...`);
    }
    
    console.log(`Downloaded total ${allProducts.length} products from Convex`);

    if (allProducts.length === 0) {
      throw new Error("No products received from server");
    }

    // Step 3: Store in IndexedDB
    await db.transaction("rw", db.products, db.syncMetadata, async () => {
      // Clear existing products
      await db.products.clear();

      try {
        await db.products.bulkAdd(allProducts);
      } catch (error: unknown) {
        // If bulkAdd fails due to duplicates, try bulkPut instead
        if (
          error &&
          typeof error === "object" &&
          "name" in error &&
          error.name === "ConstraintError"
        ) {
          console.log("Duplicate keys detected, using bulkPut instead...");
          await db.products.bulkPut(allProducts);
        } else {
          throw error;
        }
      }

      // Update sync metadata
      await db.syncMetadata.put({
        id: "current",
        lastSyncDate: new Date(), // Local sync time
        totalProducts: allProducts.length,
      });
    });

    return { success: true, productCount: allProducts.length };
  } catch (error) {
    console.error("Sync failed:", error);
    throw error;
  }
}
