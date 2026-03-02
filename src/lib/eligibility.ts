import type { ParticipantType } from "./db";

export interface EligibilityRule {
  category: string;
  allowed: boolean;
  requiredTypes?: string[];
  prohibitedTypes?: string[];
  minAgeMonths?: number;
  maxAgeMonths?: number;
}

export interface FoodBenefit {
  category: string;
  cashValueOunces?: number;
  allowedOunces?: number;
}

export interface EligibilityResult {
  eligible: boolean;
  reason?: string;
  benefit?: FoodBenefit;
}

const CATEGORY_RULES: Record<ParticipantType, EligibilityRule[]> = {
  INFANT_0_6: [
    { category: "infant formula", allowed: true },
    { category: "baby food", allowed: false },
    { category: "juice", allowed: false },
    { category: "produce", allowed: false },
    { category: "milk", allowed: false },
    { category: "yogurt", allowed: false },
    { category: "cheese", allowed: false },
    { category: "cereal", allowed: false },
    { category: "whole grain", allowed: false },
    { category: "egg", allowed: false },
    { category: "peanut", allowed: false },
    { category: "legume", allowed: false },
  ],

  INFANT_6_12: [
    { category: "infant formula", allowed: true },
    { category: "baby food", allowed: true },
    { category: "infant cereal", allowed: true },
    { category: "juice", allowed: false },
    { category: "produce", allowed: true },
    { category: "milk", allowed: false },
    { category: "yogurt", allowed: false },
    { category: "cheese", allowed: false },
    { category: "cereal", allowed: false },
    { category: "whole grain", allowed: false },
    { category: "egg", allowed: false },
    { category: "peanut", allowed: false },
    { category: "legume", allowed: false },
  ],

  CHILD_1_2: [
    { category: "milk", allowed: true, requiredTypes: ["whole"] },
    { category: "baby food", allowed: false },
    { category: "infant cereal", allowed: false },
    { category: "yogurt", allowed: true, requiredTypes: ["whole"] },
    { category: "juice", allowed: true },
    { category: "produce", allowed: true },
    { category: "whole grain", allowed: true },
    { category: "cheese", allowed: true },
    { category: "egg", allowed: true },
    { category: "peanut", allowed: true },
    { category: "legume", allowed: true },
    { category: "cereal", allowed: true },
    { category: "canned fish", allowed: false },
  ],

  CHILD_2_5: [
    { category: "milk", allowed: true, prohibitedTypes: ["whole"] },
    { category: "baby food", allowed: false },
    { category: "infant cereal", allowed: false },
    { category: "yogurt", allowed: true, prohibitedTypes: ["whole"] },
    { category: "juice", allowed: true },
    { category: "produce", allowed: true },
    { category: "whole grain", allowed: true },
    { category: "cheese", allowed: true },
    { category: "egg", allowed: true },
    { category: "peanut", allowed: true },
    { category: "legume", allowed: true },
    { category: "cereal", allowed: true },
    { category: "canned fish", allowed: false },
  ],

  PREGNANT: [
    { category: "milk", allowed: true },
    { category: "yogurt", allowed: true },
    { category: "cheese", allowed: true },
    { category: "juice", allowed: true },
    { category: "produce", allowed: true },
    { category: "whole grain", allowed: true },
    { category: "egg", allowed: true },
    { category: "peanut", allowed: true },
    { category: "legume", allowed: true },
    { category: "cereal", allowed: true },
    { category: "canned fish", allowed: true },
    { category: "baby food", allowed: false },
    { category: "infant formula", allowed: false },
    { category: "infant cereal", allowed: false },
  ],

  PARTIALLY_BREASTFEEDING: [
    { category: "milk", allowed: true },
    { category: "yogurt", allowed: true },
    { category: "cheese", allowed: true },
    { category: "juice", allowed: true },
    { category: "produce", allowed: true },
    { category: "whole grain", allowed: true },
    { category: "egg", allowed: true },
    { category: "peanut", allowed: true },
    { category: "legume", allowed: true },
    { category: "cereal", allowed: true },
    { category: "canned fish", allowed: true },
    { category: "baby food", allowed: false },
    { category: "infant formula", allowed: false },
    { category: "infant cereal", allowed: false },
  ],

  BREASTFEEDING: [
    { category: "milk", allowed: true },
    { category: "yogurt", allowed: true },
    { category: "cheese", allowed: true },
    { category: "juice", allowed: true },
    { category: "produce", allowed: true },
    { category: "whole grain", allowed: true },
    { category: "egg", allowed: true },
    { category: "peanut", allowed: true },
    { category: "legume", allowed: true },
    { category: "cereal", allowed: true },
    { category: "canned fish", allowed: true },
    { category: "baby food", allowed: false },
    { category: "infant formula", allowed: false },
    { category: "infant cereal", allowed: false },
  ],

  POSTPARTUM: [
    { category: "milk", allowed: true },
    { category: "yogurt", allowed: true },
    { category: "cheese", allowed: true },
    { category: "juice", allowed: true },
    { category: "produce", allowed: true },
    { category: "whole grain", allowed: true },
    { category: "egg", allowed: true },
    { category: "peanut", allowed: true },
    { category: "legume", allowed: true },
    { category: "cereal", allowed: true },
    { category: "canned fish", allowed: true },
    { category: "baby food", allowed: false },
    { category: "infant formula", allowed: false },
    { category: "infant cereal", allowed: false },
  ],
};

const PARTICIPANT_BENEFITS: Record<ParticipantType, FoodBenefit[]> = {
  INFANT_0_6: [],
  INFANT_6_12: [
    { category: "produce", cashValueOunces: 8 },
  ],
  CHILD_1_2: [
    { category: "produce", cashValueOunces: 26 },
  ],
  CHILD_2_5: [
    { category: "produce", cashValueOunces: 26 },
  ],
  PREGNANT: [
    { category: "produce", cashValueOunces: 26 },
    { category: "canned fish", allowedOunces: 10 },
  ],
  PARTIALLY_BREASTFEEDING: [
    { category: "produce", cashValueOunces: 26 },
    { category: "canned fish", allowedOunces: 10 },
  ],
  BREASTFEEDING: [
    { category: "produce", cashValueOunces: 26 },
    { category: "canned fish", allowedOunces: 20 },
  ],
  POSTPARTUM: [
    { category: "produce", cashValueOunces: 26 },
    { category: "canned fish", allowedOunces: 10 },
  ],
};

export function checkEligibility(
  category: string,
  subCategory: string,
  participantType: ParticipantType
): EligibilityResult {
  const rules = CATEGORY_RULES[participantType] || [];
  const categoryLower = category.toLowerCase();
  
  // Use partial matching - find rule where category string is contained in the actual category
  const rule = rules.find(
    (r) => categoryLower.includes(r.category.toLowerCase()) || r.category.toLowerCase().includes(categoryLower)
  );

  console.log('Eligibility check:', { category, subCategory, participantType, rule });

  if (!rule) {
    return { eligible: true };
  }

  if (!rule.allowed) {
    return {
      eligible: false,
      reason: `${category} is not allowed for this participant type`,
    };
  }

  if (rule.requiredTypes && rule.requiredTypes.length > 0) {
    const subCategoryLower = subCategory.toLowerCase();
    const isRequired = rule.requiredTypes.some((type) =>
      subCategoryLower.includes(type.toLowerCase())
    );

    if (!isRequired) {
      return {
        eligible: false,
        reason: `Only ${rule.requiredTypes.join(" or ")} is allowed for this participant type`,
      };
    }
  }

  if (rule.prohibitedTypes && rule.prohibitedTypes.length > 0) {
    const subCategoryLower = subCategory.toLowerCase();
    const isProhibited = rule.prohibitedTypes.some((type) =>
      subCategoryLower.includes(type.toLowerCase())
    );

    if (isProhibited) {
      return {
        eligible: false,
        reason: `${rule.prohibitedTypes.join(", ")} is not allowed for this participant type`,
      };
    }
  }

  return { eligible: true };
}

export function getParticipantBenefits(
  participantType: ParticipantType
): FoodBenefit[] {
  return PARTICIPANT_BENEFITS[participantType] || [];
}

export const PARTICIPANT_LABELS: Record<ParticipantType, string> = {
  INFANT_0_6: "Infant (0-6 months)",
  INFANT_6_12: "Infant (6-12 months)",
  CHILD_1_2: "Child (1-2 years)",
  CHILD_2_5: "Child (2-5 years)",
  PREGNANT: "Pregnant Woman",
  PARTIALLY_BREASTFEEDING: "Partially Breastfeeding",
  BREASTFEEDING: "Fully Breastfeeding",
  POSTPARTUM: "Postpartum (Not Breastfeeding)",
};
