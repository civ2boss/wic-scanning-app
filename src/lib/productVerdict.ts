import type { Household, Product } from "./db";
import {
  checkHouseholdEligibility,
  type HouseholdMemberEligibility,
} from "./eligibility";
import {
  getGuideInfoForProduct,
  type WicFoodSubCategory,
} from "./wicFoodsGuide";

/**
 * - `eligible`: on the APL, and at least one Household member qualifies.
 * - `ineligible`: on the APL, but no Household member qualifies.
 * - `approved`: on the APL, but the Household is empty, so Eligibility is unknown.
 * - `not-found`: not on the APL.
 */
export type VerdictStatus =
  | "eligible"
  | "ineligible"
  | "approved"
  | "not-found";

export interface ProductVerdict {
  status: VerdictStatus;
  reason: string | null;
  members: HouseholdMemberEligibility[];
  guide: WicFoodSubCategory | null;
}

export function productVerdict(
  product: Product | null,
  household: Household,
): ProductVerdict {
  if (!product) {
    return { status: "not-found", reason: null, members: [], guide: null };
  }

  const guide = getGuideInfoForProduct(
    product.categoryDescription,
    product.subCategoryDescription,
  );

  if (household.length === 0) {
    return { status: "approved", reason: null, members: [], guide };
  }

  const result = checkHouseholdEligibility(
    product.categoryDescription,
    product.subCategoryDescription,
    household,
  );

  return {
    status: result.eligible ? "eligible" : "ineligible",
    reason: result.reason || null,
    members: result.members,
    guide,
  };
}
