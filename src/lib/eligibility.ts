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
    { category: "infant", allowed: true },
    { category: "formula", allowed: true },
    { category: "juice", allowed: false },
    { category: "vegetable", allowed: false },
    { category: "fruit", allowed: false },
    { category: "produce", allowed: false },
    { category: "milk", allowed: false },
    { category: "yogurt", allowed: false },
    { category: "cheese", allowed: false },
    { category: "cereal", allowed: false },
    { category: "egg", allowed: false },
    { category: "peanut", allowed: false },
    { category: "legume", allowed: false },
    { category: "bread", allowed: false },
    { category: "fish", allowed: false },
  ],

  INFANT_6_12: [
    { category: "infant", allowed: true },
    { category: "formula", allowed: true },
    { category: "juice", allowed: false },
    { category: "produce", allowed: true },
    { category: "milk", allowed: false },
    { category: "yogurt", allowed: false },
    { category: "cheese", allowed: false },
    { category: "cereal", allowed: false },
    { category: "egg", allowed: false },
    { category: "peanut", allowed: false },
    { category: "legume", allowed: false },
    { category: "bread", allowed: false },
    { category: "fish", allowed: false },
  ],

  CHILD_1_2: [
    { category: "milk", allowed: true, requiredTypes: ["whole"] },
    { category: "infant", allowed: false },
    { category: "yogurt", allowed: true, requiredTypes: ["whole"] },
    { category: "juice", allowed: true },
    { category: "produce", allowed: true },
    { category: "bread", allowed: true },
    { category: "cheese", allowed: true },
    { category: "egg", allowed: true },
    { category: "peanut", allowed: true },
    { category: "legume", allowed: true },
    { category: "cereal", allowed: true },
    { category: "fish", allowed: false },
  ],

  CHILD_2_5: [
    { category: "milk", allowed: true, prohibitedTypes: ["whole"] },
    { category: "infant", allowed: false },
    { category: "yogurt", allowed: true, prohibitedTypes: ["whole"] },
    { category: "juice", allowed: true },
    { category: "produce", allowed: true },
    { category: "bread", allowed: true },
    { category: "cheese", allowed: true },
    { category: "egg", allowed: true },
    { category: "peanut", allowed: true },
    { category: "legume", allowed: true },
    { category: "cereal", allowed: true },
    { category: "fish", allowed: false },
  ],

  PREGNANT: [
    { category: "milk", allowed: true },
    { category: "yogurt", allowed: true },
    { category: "cheese", allowed: true },
    { category: "juice", allowed: true },
    { category: "produce", allowed: true },
    { category: "bread", allowed: true },
    { category: "egg", allowed: true },
    { category: "peanut", allowed: true },
    { category: "legume", allowed: true },
    { category: "cereal", allowed: true },
    { category: "fish", allowed: true },
    { category: "infant", allowed: false },
  ],

  PARTIALLY_BREASTFEEDING: [
    { category: "milk", allowed: true },
    { category: "yogurt", allowed: true },
    { category: "cheese", allowed: true },
    { category: "juice", allowed: true },
    { category: "produce", allowed: true },
    { category: "bread", allowed: true },
    { category: "egg", allowed: true },
    { category: "peanut", allowed: true },
    { category: "legume", allowed: true },
    { category: "cereal", allowed: true },
    { category: "fish", allowed: true },
    { category: "infant", allowed: false },
  ],

  BREASTFEEDING: [
    { category: "milk", allowed: true },
    { category: "yogurt", allowed: true },
    { category: "cheese", allowed: true },
    { category: "juice", allowed: true },
    { category: "produce", allowed: true },
    { category: "bread", allowed: true },
    { category: "egg", allowed: true },
    { category: "peanut", allowed: true },
    { category: "legume", allowed: true },
    { category: "cereal", allowed: true },
    { category: "fish", allowed: true },
    { category: "infant", allowed: false },
  ],

  POSTPARTUM: [
    { category: "milk", allowed: true },
    { category: "yogurt", allowed: true },
    { category: "cheese", allowed: true },
    { category: "juice", allowed: true },
    { category: "produce", allowed: true },
    { category: "bread", allowed: true },
    { category: "egg", allowed: true },
    { category: "peanut", allowed: true },
    { category: "legume", allowed: true },
    { category: "cereal", allowed: true },
    { category: "fish", allowed: true },
    { category: "infant", allowed: false },
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
  const subCategoryLower = subCategory.toLowerCase();
  
  // Check both category and subCategory for baby food related items
  const combinedText = categoryLower + " " + subCategoryLower;
  
  // Use partial matching - find rule where category string is contained in the actual category or subCategory
  const rule = rules.find(
    (r) => 
      categoryLower.includes(r.category.toLowerCase()) || 
      r.category.toLowerCase().includes(categoryLower) ||
      subCategoryLower.includes(r.category.toLowerCase()) ||
      r.category.toLowerCase().includes(subCategoryLower)
  );

  // console.log('Eligibility check:', { category, subCategory, participantType, rule, combinedText });

  // Special check: if subCategory contains "infant" or "baby food", treat as baby food
  const isBabyFoodRelated = subCategoryLower.includes('infant') || 
                            subCategoryLower.includes('baby food');
  
  // Find baby food rule specifically
  const babyFoodRule = rules.find(r => r.category === 'baby food');

  if (isBabyFoodRelated && babyFoodRule && !babyFoodRule.allowed) {
    return {
      eligible: false,
      reason: `${subCategory} is not allowed for this participant type`,
    };
  }

  // Also check for infant cereal specifically
  const isInfantCereal = subCategoryLower.includes('infant cereal');
  const infantCerealRule = rules.find(r => r.category === 'infant cereal');

  if (isInfantCereal && infantCerealRule && !infantCerealRule.allowed) {
    return {
      eligible: false,
      reason: `${subCategory} is not allowed for this participant type`,
    };
  }

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
