import { aplCategoryKey } from "./aplCategories";
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

export interface ProductSearchCriteria {
  /** Free text matched against UPC, brand, description, and categories. */
  text?: string;
  /** APL Category key (see `aplCategoryKey`); omit for all categories. */
  category?: string | null;
  /** When non-empty, keep only Products at least one member is eligible for. */
  household?: ParticipantType[];
}

export interface ProductSearchResult {
  /** The requested page, sorted by brand, then description. */
  products: Product[];
  /** Products matching every criterion, including Eligibility. */
  totalCount: number;
  /** Products matching text and category, ignoring Eligibility. */
  matchCount: number;
}

function compareProducts(a: Product, b: Product): number {
  return (
    a.brandName.localeCompare(b.brandName, undefined, {
      sensitivity: "base",
    }) ||
    a.foodDescription.localeCompare(b.foodDescription, undefined, {
      sensitivity: "base",
    }) ||
    a.upc.localeCompare(b.upc)
  );
}

function matchesText(product: Product, searchTerms: string[]): boolean {
  const searchableText =
    `${product.upc || ""} ${product.brandName} ${product.foodDescription} ${product.categoryDescription} ${product.subCategoryDescription}`.toLowerCase();
  return searchTerms.every((term) => {
    if (searchableText.includes(term)) return true;
    const normalizedTerm = normalizeUpc(term);
    return Boolean(normalizedTerm && product.upc === normalizedTerm);
  });
}

/**
 * Searches the local APL. With no criteria, browses every Product.
 * @param criteria - Text, APL Category, and Household to match
 * @param limit - Max number of results (default 30)
 * @param offset - Number of results to skip (default 0)
 */
export async function searchProducts(
  criteria: ProductSearchCriteria,
  limit: number = 30,
  offset: number = 0,
): Promise<ProductSearchResult> {
  const searchTerms = (criteria.text ?? "")
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
  const category = criteria.category ? aplCategoryKey(criteria.category) : null;

  try {
    const matches = await db.products
      .filter(
        (product) =>
          (!category ||
            aplCategoryKey(product.categoryDescription) === category) &&
          matchesText(product, searchTerms),
      )
      .toArray();
    const household = criteria.household ?? [];
    const eligibleMatches =
      household.length > 0
        ? matches.filter(
            (product) =>
              checkHouseholdEligibility(
                product.categoryDescription,
                product.subCategoryDescription,
                household,
              ).eligible,
          )
        : matches;
    eligibleMatches.sort(compareProducts);

    return {
      products: eligibleMatches.slice(offset, offset + limit),
      totalCount: eligibleMatches.length,
      matchCount: matches.length,
    };
  } catch (error) {
    console.error("Error searching products:", error);
    return { products: [], totalCount: 0, matchCount: 0 };
  }
}
