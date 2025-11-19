import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";
import { db } from "./db";

// Initialize Convex Client
// Using import.meta.env for Vite/Astro environment variables
const convexUrl = import.meta.env.PUBLIC_CONVEX_URL || import.meta.env.NEXT_PUBLIC_CONVEX_URL;
const convex = new ConvexHttpClient(convexUrl);

export async function syncAPLData() {
  try {
    console.log("Starting sync from Convex...");

    // Step 1: Get metadata from Convex to check if we need to sync
    // For now, we'll force a sync, but in the future you could compare dates
    const remoteMetadata = await convex.query(api.sync.getSyncMetadata);
    
    if (!remoteMetadata) {
      throw new Error("No data available on server yet.");
    }

    console.log(`Server has ${remoteMetadata.totalProducts} products, last updated: ${new Date(remoteMetadata.lastSyncDate).toLocaleString()}`);

    // Step 2: Download all products from Convex
    // Note: For very large datasets, you might want to paginate this
    const products = await convex.query(api.sync.getAllProducts);
    
    console.log(`Downloaded ${products.length} products from Convex`);

    if (products.length === 0) {
      throw new Error("No products received from server");
    }

    // Step 3: Store in IndexedDB
    await db.transaction("rw", db.products, db.syncMetadata, async () => {
      // Clear existing products
      await db.products.clear();

      // Add new products (map Convex shape to Dexie shape if needed)
      // Currently they match, but we strip system fields like _id, _creationTime just in case
      const cleanProducts = products.map(p => ({
        upc: p.upc,
        categoryDescription: p.categoryDescription,
        subCategoryDescription: p.subCategoryDescription,
        brandName: p.brandName,
        foodDescription: p.foodDescription,
        packageSize: p.packageSize,
        uom: p.uom
      }));

      try {
        await db.products.bulkAdd(cleanProducts);
      } catch (error: unknown) {
        // If bulkAdd fails due to duplicates, try bulkPut instead
        if (
          error &&
          typeof error === "object" &&
          "name" in error &&
          error.name === "ConstraintError"
        ) {
          console.log("Duplicate keys detected, using bulkPut instead...");
          await db.products.bulkPut(cleanProducts);
        } else {
          throw error;
        }
      }

      // Update sync metadata
      await db.syncMetadata.put({
        id: "current",
        lastSyncDate: new Date(), // Local sync time
        totalProducts: cleanProducts.length,
      });
    });

    return { success: true, productCount: products.length };
  } catch (error) {
    console.error("Sync failed:", error);
    throw error;
  }
}
