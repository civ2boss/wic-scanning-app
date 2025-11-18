import { db, type Product } from "./db";

/**
 * Looks up a product by UPC/barcode in the database
 * @param upc - The UPC/barcode to search for
 * @returns The product if found, null otherwise
 */
export async function lookupProduct(upc: string): Promise<Product | null> {
  try {
    const product = await db.products.get(upc);
    return product || null;
  } catch (error) {
    console.error("Error looking up product:", error);
    return null;
  }
}

/**
 * Checks if a product is WIC approved (exists in the database)
 * @param upc - The UPC/barcode to check
 * @returns true if the product is approved, false otherwise
 */
export async function isWICApproved(upc: string): Promise<boolean> {
  const product = await lookupProduct(upc);
  return product !== null;
}

