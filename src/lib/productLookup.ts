import { db, type ParticipantType, type Product } from "./db";
import { checkHouseholdEligibility } from "./eligibility";
import { normalizeUpc } from "./upc";

/**
 * Looks up a product by UPC/PLU barcode in IndexedDB using canonical UPC normalization.
 * @param upc - The raw UPC/PLU/EAN barcode string
 * @returns The product if found, null otherwise
 */
export async function lookupProduct(upc: string): Promise<Product | null> {
  try {
    const normalized = normalizeUpc(upc);
    if (!normalized) {
      return null;
    }

    const product = await db.products.get(normalized);
    if (product) {
      return product;
    }

    // Fallback for any pre-existing unnormalized key in local IndexedDB
    const rawTrimmed = upc.trim();
    if (rawTrimmed && rawTrimmed !== normalized) {
      const fallback = await db.products.get(rawTrimmed);
      return fallback || null;
    }

    return null;
  } catch (error) {
    console.error("Error looking up product:", error);
    return null;
  }
}

/**
 * Checks if a product is WIC approved (exists in the local APL database)
 * @param upc - The UPC/barcode to check
 * @returns true if the product is approved, false otherwise
 */
export async function isWICApproved(upc: string): Promise<boolean> {
  const product = await lookupProduct(upc);
  return product !== null;
}

/**
 * Searches for products by text or barcode query, optionally filtering by household eligibility.
 * @param query - The search string
 * @param limit - Max number of results (default 30)
 * @param offset - Number of results to skip (default 0)
 * @param eligibleFor - Optional ParticipantType or Household (ParticipantType[]) to filter eligible products
 * @returns Array of matching products and total count
 */
export async function searchProducts(
  query: string,
  limit: number = 30,
  offset: number = 0,
  eligibleFor?: ParticipantType | ParticipantType[] | null,
): Promise<{ products: Product[]; totalCount: number }> {
  if (!query || query.trim().length === 0)
    return { products: [], totalCount: 0 };

  const searchTerms = query.toLowerCase().split(/\s+/).filter(Boolean);
  const household: ParticipantType[] = Array.isArray(eligibleFor)
    ? eligibleFor
    : eligibleFor
      ? [eligibleFor]
      : [];

  try {
    const collection = db.products.filter((product) => {
      const searchableText =
        `${product.upc || ""} ${product.brandName} ${product.foodDescription} ${product.categoryDescription} ${product.subCategoryDescription}`.toLowerCase();
      const matchesQuery = searchTerms.every((term) => {
        if (searchableText.includes(term)) return true;
        const normalizedTerm = normalizeUpc(term);
        return Boolean(normalizedTerm && product.upc === normalizedTerm);
      });
      if (!matchesQuery) return false;

      if (household.length > 0) {
        const { eligible } = checkHouseholdEligibility(
          product.categoryDescription,
          product.subCategoryDescription,
          household,
        );
        if (!eligible) return false;
      }

      return true;
    });

    const totalCount = await collection.count();
    const products = await collection.offset(offset).limit(limit).toArray();

    return { products, totalCount };
  } catch (error) {
    console.error("Error searching products:", error);
    return { products: [], totalCount: 0 };
  }
}
