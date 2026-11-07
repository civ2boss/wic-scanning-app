import type { Product } from "./db";

/**
 * The shopper-facing name of a Product. The APL's Food Description already
 * carries the brand ("Raskins Chunk Light Tuna in Water 6oz"), and produce has
 * the placeholder brand "Not Available", so the brand is never prefixed.
 */
export function productDisplayName(
  product: Pick<Product, "brandName" | "foodDescription">,
): string {
  return product.foodDescription.trim() || product.brandName.trim();
}
