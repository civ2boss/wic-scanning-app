import { db } from "./db";
import { parseExcel } from "./excelParser";
import { downloadAPLFile, findCurrentAPLUrl } from "./scraper";

export async function syncAPLData() {
  try {
    // Step 1: Find the current APL URL
    const aplUrl = await findCurrentAPLUrl();
    console.log("Found APL URL:", aplUrl);

    // Step 2: Download the Excel file
    const fileBuffer = await downloadAPLFile(aplUrl);
    console.log("Downloaded APL file");

    // Step 3: Parse the Excel file
    const products = await parseExcel(fileBuffer);
    console.log(`Parsed ${products.length} products`);

    // Validate that we have products before attempting to save
    if (products.length === 0) {
      throw new Error("No valid products found in Excel file");
    }

    // Step 4: Store in IndexedDB
    await db.transaction("rw", db.products, db.syncMetadata, async () => {
      // Clear existing products
      await db.products.clear();

      // Add new products (with error handling for duplicates)
      try {
        await db.products.bulkAdd(products);
      } catch (error: unknown) {
        // If bulkAdd fails due to duplicates, try bulkPut instead
        if (
          error &&
          typeof error === "object" &&
          "name" in error &&
          error.name === "ConstraintError"
        ) {
          console.log("Duplicate keys detected, using bulkPut instead...");
          await db.products.bulkPut(products);
        } else {
          throw error;
        }
      }

      // Update sync metadata
      await db.syncMetadata.put({
        id: "current",
        lastSyncDate: new Date(),
        totalProducts: products.length,
      });
    });

    return { success: true, productCount: products.length };
  } catch (error) {
    console.error("Sync failed:", error);
    throw error;
  }
}
