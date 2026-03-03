import { db, type Product, type ParticipantType } from "./db";
import { checkEligibility } from "./eligibility";

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

/**
 * Searches for products by text query
 * @param query - The search string
 * @param limit - Max number of results (default 30)
 * @param offset - Number of results to skip (default 0)
 * @param eligibleFor - Optional participant type to filter only eligible products
 * @returns Array of matching products and total count
 */
export async function searchProducts(
  query: string, 
  limit: number = 30,
  offset: number = 0,
  eligibleFor?: ParticipantType | null
): Promise<{ products: Product[]; totalCount: number }> {
  if (!query || query.trim().length === 0) return { products: [], totalCount: 0 };
  
  const searchTerms = query.toLowerCase().split(/\s+/).filter(Boolean);
  
  try {
    const collection = db.products
      .filter((product) => {
        const searchableText = `${product.brandName} ${product.foodDescription} ${product.categoryDescription} ${product.subCategoryDescription}`.toLowerCase();
        const matchesQuery = searchTerms.every(term => searchableText.includes(term));
        if (!matchesQuery) return false;
        
        if (eligibleFor) {
          const { eligible } = checkEligibility(
            product.categoryDescription, 
            product.subCategoryDescription, 
            eligibleFor
          );
          if (!eligible) return false;
        }
        
        return true;
      });
      
    // Count matches to show the full number and for pagination
    const totalCount = await collection.count();
    
    // Fetch the actual page of results
    const products = await collection.offset(offset).limit(limit).toArray();
      
    return { products, totalCount };
  } catch (error) {
    console.error("Error searching products:", error);
    return { products: [], totalCount: 0 };
  }
}

