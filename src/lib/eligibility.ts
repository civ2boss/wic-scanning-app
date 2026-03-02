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
    { category: "Infant Formula", allowed: true },
    { category: "Baby Food", allowed: false },
    { category: "Infant Cereal", allowed: false },
    { category: "Juice", allowed: false },
    { category: "Fresh Produce", allowed: false },
    { category: "Whole Grains", allowed: false },
    { category: "Milk", allowed: false },
    { category: "Yogurt", allowed: false },
    { category: "Cheese or Tofu", allowed: false },
  ],

  INFANT_6_12: [
    { category: "Infant Formula", allowed: true },
    { category: "Baby Food", allowed: true },
    { category: "Infant Cereal", allowed: true },
    { category: "Fresh Produce", allowed: true },
    { category: "Juice", allowed: false },
    { category: "Whole Grains", allowed: false },
    { category: "Milk", allowed: false },
    { category: "Yogurt", allowed: false },
    { category: "Cheese or Tofu", allowed: false },
  ],

  CHILD_1_2: [
    { category: "Milk", allowed: true, requiredTypes: ["Whole Milk"] },
    { category: "Baby Food", allowed: false },
    { category: "Infant Cereal", allowed: false },
    { category: "Yogurt", allowed: true, requiredTypes: ["Whole"] },
    { category: "Juice", allowed: true },
    { category: "Fresh Produce", allowed: true },
    { category: "Whole Grains", allowed: true },
    { category: "Cheese or Tofu", allowed: true },
    { category: "Eggs", allowed: true },
    { category: "Peanut Butter", allowed: true },
    { category: "Beans/Peas/Lentils", allowed: true },
    { category: "Cereal", allowed: true },
  ],

  CHILD_2_5: [
    { category: "Milk", allowed: true, prohibitedTypes: ["Whole Milk"] },
    { category: "Baby Food", allowed: false },
    { category: "Infant Cereal", allowed: false },
    { category: "Yogurt", allowed: true, prohibitedTypes: ["Whole"] },
    { category: "Juice", allowed: true },
    { category: "Fresh Produce", allowed: true },
    { category: "Whole Grains", allowed: true },
    { category: "Cheese or Tofu", allowed: true },
    { category: "Eggs", allowed: true },
    { category: "Peanut Butter", allowed: true },
    { category: "Beans/Peas/Lentils", allowed: true },
    { category: "Cereal", allowed: true },
  ],

  PREGNANT: [
    { category: "Milk", allowed: true },
    { category: "Yogurt", allowed: true },
    { category: "Cheese or Tofu", allowed: true },
    { category: "Juice", allowed: true },
    { category: "Fresh Produce", allowed: true },
    { category: "Whole Grains", allowed: true },
    { category: "Eggs", allowed: true },
    { category: "Peanut Butter", allowed: true },
    { category: "Beans/Peas/Lentils", allowed: true },
    { category: "Cereal", allowed: true },
    { category: "Canned Fish", allowed: true },
    { category: "Baby Food", allowed: false },
    { category: "Infant Formula", allowed: false },
    { category: "Infant Cereal", allowed: false },
  ],

  PARTIALLY_BREASTFEEDING: [
    { category: "Milk", allowed: true },
    { category: "Yogurt", allowed: true },
    { category: "Cheese or Tofu", allowed: true },
    { category: "Juice", allowed: true },
    { category: "Fresh Produce", allowed: true },
    { category: "Whole Grains", allowed: true },
    { category: "Eggs", allowed: true },
    { category: "Peanut Butter", allowed: true },
    { category: "Beans/Peas/Lentils", allowed: true },
    { category: "Cereal", allowed: true },
    { category: "Canned Fish", allowed: true },
    { category: "Baby Food", allowed: false },
    { category: "Infant Formula", allowed: false },
    { category: "Infant Cereal", allowed: false },
  ],

  BREASTFEEDING: [
    { category: "Milk", allowed: true },
    { category: "Yogurt", allowed: true },
    { category: "Cheese or Tofu", allowed: true },
    { category: "Juice", allowed: true },
    { category: "Fresh Produce", allowed: true },
    { category: "Whole Grains", allowed: true },
    { category: "Eggs", allowed: true },
    { category: "Peanut Butter", allowed: true },
    { category: "Beans/Peas/Lentils", allowed: true },
    { category: "Cereal", allowed: true },
    { category: "Canned Fish", allowed: true },
    { category: "Baby Food", allowed: false },
    { category: "Infant Formula", allowed: false },
    { category: "Infant Cereal", allowed: false },
  ],

  POSTPARTUM: [
    { category: "Milk", allowed: true },
    { category: "Yogurt", allowed: true },
    { category: "Cheese or Tofu", allowed: true },
    { category: "Juice", allowed: true },
    { category: "Fresh Produce", allowed: true },
    { category: "Whole Grains", allowed: true },
    { category: "Eggs", allowed: true },
    { category: "Peanut Butter", allowed: true },
    { category: "Beans/Peas/Lentils", allowed: true },
    { category: "Cereal", allowed: true },
    { category: "Canned Fish", allowed: true },
    { category: "Baby Food", allowed: false },
    { category: "Infant Formula", allowed: false },
    { category: "Infant Cereal", allowed: false },
  ],
};

const PARTICIPANT_BENEFITS: Record<ParticipantType, FoodBenefit[]> = {
  INFANT_0_6: [],
  INFANT_6_12: [
    { category: "Fresh Produce", cashValueOunces: 8 },
  ],
  CHILD_1_2: [
    { category: "Fresh Produce", cashValueOunces: 26 },
  ],
  CHILD_2_5: [
    { category: "Fresh Produce", cashValueOunces: 26 },
  ],
  PREGNANT: [
    { category: "Fresh Produce", cashValueOunces: 26 },
    { category: "Canned Fish", allowedOunces: 10 },
  ],
  PARTIALLY_BREASTFEEDING: [
    { category: "Fresh Produce", cashValueOunces: 26 },
    { category: "Canned Fish", allowedOunces: 10 },
  ],
  BREASTFEEDING: [
    { category: "Fresh Produce", cashValueOunces: 26 },
    { category: "Canned Fish", allowedOunces: 20 },
  ],
  POSTPARTUM: [
    { category: "Fresh Produce", cashValueOunces: 26 },
    { category: "Canned Fish", allowedOunces: 10 },
  ],
};

export function checkEligibility(
  category: string,
  subCategory: string,
  participantType: ParticipantType
): EligibilityResult {
  const rules = CATEGORY_RULES[participantType] || [];
  
  const rule = rules.find(
    (r) => r.category.toLowerCase() === category.toLowerCase()
  );

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
