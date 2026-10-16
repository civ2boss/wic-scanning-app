import type { ParticipantType } from "./db";

export interface EligibilityResult {
  eligible: boolean;
  reason?: string;
}

export interface HouseholdMemberEligibility {
  type: ParticipantType;
  label: string;
  eligible: boolean;
  reason?: string;
}

export interface HouseholdEligibilityResult {
  eligible: boolean;
  reason?: string;
  eligibleMembers: HouseholdMemberEligibility[];
  ineligibleMembers: HouseholdMemberEligibility[];
}

export interface FoodBenefit {
  category: string;
  cvbDollars?: number;
  allowedOunces?: number;
  description: string;
}

export const PARTICIPANT_LABELS: Record<ParticipantType, string> = {
  INFANT_0_6: "Infant (0-6 months)",
  INFANT_6_12: "Infant (6-12 months)",
  CHILD_1_2: "Child (1-2 years)",
  CHILD_2_5: "Child (2-5 years)",
  PREGNANT: "Pregnant",
  PARTIALLY_BREASTFEEDING: "Partially Breastfeeding",
  BREASTFEEDING: "Breastfeeding",
  POSTPARTUM: "Postpartum",
};

/**
 * Monthly NYS WIC Cash Value Benefit (CVB) dollar amounts for fruits & vegetables.
 */
export const PARTICIPANT_CVB_DOLLARS: Record<ParticipantType, number> = {
  INFANT_0_6: 0,
  INFANT_6_12: 22,
  CHILD_1_2: 27,
  CHILD_2_5: 27,
  PREGNANT: 48,
  PARTIALLY_BREASTFEEDING: 53,
  BREASTFEEDING: 53,
  POSTPARTUM: 48,
};

export const PARTICIPANT_BENEFITS: Record<ParticipantType, FoodBenefit[]> = {
  INFANT_0_6: [
    {
      category: "Infant Formula",
      description: "Infant formula based on breastfeeding status",
    },
  ],
  INFANT_6_12: [
    {
      category: "Fruits & Vegetables (CVB)",
      cvbDollars: 22,
      description:
        "Up to $22/month Cash Value Benefit option for fresh, frozen, or canned fruits & vegetables",
    },
    {
      category: "Infant Foods",
      description:
        "Infant formula, infant cereal, jarred baby fruits & vegetables, and jarred baby meats (for fully breastfeeding infants)",
    },
  ],
  CHILD_1_2: [
    {
      category: "Fruits & Vegetables (CVB)",
      cvbDollars: 27,
      description:
        "$27/month Cash Value Benefit for fresh, frozen, or canned fruits & vegetables",
    },
    {
      category: "Dairy & Whole Grains",
      description:
        "Whole milk (or soy/cheese/whole yogurt/tofu), eggs, beans/peanut butter, canned fish, whole grain cereal & bread/grains, 64oz or box juice",
    },
  ],
  CHILD_2_5: [
    {
      category: "Fruits & Vegetables (CVB)",
      cvbDollars: 27,
      description:
        "$27/month Cash Value Benefit for fresh, frozen, or canned fruits & vegetables",
    },
    {
      category: "Dairy & Whole Grains",
      description:
        "Low-fat (1%) or nonfat milk (or soy/cheese/lowfat yogurt/tofu), eggs, beans/peanut butter, canned fish, whole grain cereal & bread/grains, 64oz or box juice",
    },
  ],
  PREGNANT: [
    {
      category: "Fruits & Vegetables (CVB)",
      cvbDollars: 48,
      description:
        "$48/month Cash Value Benefit for fresh, frozen, or canned fruits & vegetables",
    },
    {
      category: "Adult Package",
      description:
        "Low-fat (1%) or nonfat milk (or soy/cheese/lowfat yogurt/tofu), eggs, beans/peanut butter, canned fish, whole grain cereal & bread/grains, 48oz concentrate juice",
    },
  ],
  PARTIALLY_BREASTFEEDING: [
    {
      category: "Fruits & Vegetables (CVB)",
      cvbDollars: 53,
      description:
        "$53/month Cash Value Benefit for fresh, frozen, or canned fruits & vegetables",
    },
    {
      category: "Breastfeeding Package",
      description:
        "Low-fat (1%) or nonfat milk (or soy/cheese/lowfat yogurt/tofu), eggs, beans/peanut butter, canned fish, whole grain cereal & bread/grains, 48oz concentrate juice",
    },
  ],
  BREASTFEEDING: [
    {
      category: "Fruits & Vegetables (CVB)",
      cvbDollars: 53,
      description:
        "$53/month Cash Value Benefit for fresh, frozen, or canned fruits & vegetables",
    },
    {
      category: "Fully Breastfeeding Package",
      description:
        "Low-fat (1%) or nonfat milk (or soy/cheese/lowfat yogurt/tofu), eggs, beans/peanut butter, canned fish, whole grain cereal & bread/grains, 48oz concentrate juice",
    },
  ],
  POSTPARTUM: [
    {
      category: "Fruits & Vegetables (CVB)",
      cvbDollars: 48,
      description:
        "$48/month Cash Value Benefit for fresh, frozen, or canned fruits & vegetables",
    },
    {
      category: "Postpartum Package",
      description:
        "Low-fat (1%) or nonfat milk (or soy/cheese/lowfat yogurt/tofu), eggs, beans/peanut butter, canned fish, whole grain cereal, 48oz concentrate juice",
    },
  ],
};

/**
 * Canonical NYS WIC APL categories (normalized from the 18 Category Description values).
 */
export type CanonicalAplCategory =
  | "BREAD_AND_WHOLE_GRAINS"
  | "BREAKFAST_CEREAL"
  | "CHEESE_OR_TOFU"
  | "EGGS"
  | "EXEMPT_FORMULA"
  | "FISH"
  | "FRUITS_AND_VEGETABLES_CVB"
  | "INFANT_CEREAL"
  | "INFANT_FORMULA"
  | "INFANT_FRUITS_AND_VEGETABLES"
  | "INFANT_MEATS"
  | "JUICE_48OZ"
  | "JUICE_64OZ"
  | "LEGUMES"
  | "MILK_FAT_REDUCED"
  | "MILK_WHOLE"
  | "WIC_NUTRITIONALS"
  | "YOGURT"
  | "UNKNOWN";

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim().toUpperCase();
}

/**
 * Resolves an APL Category Description + Sub-Category Description into one of the
 * 18 canonical NYS WIC APL categories.
 */
export function resolveCanonicalCategory(
  category: string,
  subCategory: string = "",
): CanonicalAplCategory {
  const cat = normalizeWhitespace(category);
  const sub = normalizeWhitespace(subCategory);

  switch (cat) {
    case "BREAD AND WHOLE GRAINS":
      return "BREAD_AND_WHOLE_GRAINS";
    case "BREAKFAST CEREAL":
      return "BREAKFAST_CEREAL";
    case "CHEESE OR TOFU":
      return "CHEESE_OR_TOFU";
    case "EGGS":
      return "EGGS";
    case "EXEMPT FORMULA":
      return "EXEMPT_FORMULA";
    case "FISH":
      return "FISH";
    case "FRUITS AND VEGETABLES CASH VALUE BENEFIT":
      return "FRUITS_AND_VEGETABLES_CVB";
    case "INFANT CEREAL":
      return "INFANT_CEREAL";
    case "INFANT FORMULA":
      return "INFANT_FORMULA";
    case "INFANT FRUITS AND VEGETABLES":
      return "INFANT_FRUITS_AND_VEGETABLES";
    case "INFANT MEATS":
      return "INFANT_MEATS";
    case "JUICE 48OZ":
      return "JUICE_48OZ";
    case "JUICE 64OZ":
      return "JUICE_64OZ";
    case "LEGUMES":
      return "LEGUMES";
    case "MILK FAT REDUCED":
      return "MILK_FAT_REDUCED";
    case "MILK WHOLE":
      return "MILK_WHOLE";
    case "WIC NUTRITIONALS":
      return "WIC_NUTRITIONALS";
    case "YOGURT":
      return "YOGURT";
  }

  // Fallback mapping for legacy/test category strings
  if (cat.includes("EXEMPT FORMULA")) return "EXEMPT_FORMULA";
  if (cat.includes("WIC NUTRITIONALS")) return "WIC_NUTRITIONALS";
  if (cat.includes("INFANT FORMULA") || sub.includes("INFANT FORMULA") || cat === "FORMULA") {
    return "INFANT_FORMULA";
  }
  if (cat.includes("INFANT CEREAL") || sub.includes("INFANT CEREAL")) {
    return "INFANT_CEREAL";
  }
  if (cat.includes("INFANT MEAT") || sub.includes("INFANT MEAT") || sub === "BABY MEATS") {
    return "INFANT_MEATS";
  }
  if (
    cat.includes("INFANT FRUITS") ||
    cat === "INFANT" ||
    sub === "BABY FOOD" ||
    sub.includes("INFANT FRUITS") ||
    sub.includes("INFANT VEGETABLES")
  ) {
    return "INFANT_FRUITS_AND_VEGETABLES";
  }
  if (
    cat.includes("CASH VALUE") ||
    cat === "PRODUCE" ||
    cat === "VEGETABLE" ||
    cat === "FRUIT" ||
    cat.includes("FRUITS AND VEGETABLES")
  ) {
    return "FRUITS_AND_VEGETABLES_CVB";
  }
  if (cat.includes("MILK")) {
    if (cat.includes("WHOLE") || (sub.includes("WHOLE") && !sub.includes("SOY"))) {
      return "MILK_WHOLE";
    }
    return "MILK_FAT_REDUCED";
  }
  if (cat.includes("YOGURT")) return "YOGURT";
  if (cat.includes("CHEESE") || cat.includes("TOFU")) return "CHEESE_OR_TOFU";
  if (cat.includes("EGG")) return "EGGS";
  if (cat.includes("FISH")) return "FISH";
  if (cat.includes("LEGUME") || cat.includes("BEAN") || cat.includes("PEANUT")) {
    return "LEGUMES";
  }
  if (cat.includes("BREAD") || cat.includes("WHOLE GRAIN") || cat.includes("TORTILLA") || cat.includes("PASTA") || cat.includes("RICE")) {
    return "BREAD_AND_WHOLE_GRAINS";
  }
  if (cat.includes("CEREAL")) return "BREAKFAST_CEREAL";
  if (cat.includes("JUICE")) {
    if (cat.includes("48") || sub.includes("WOMEN")) return "JUICE_48OZ";
    return "JUICE_64OZ";
  }

  return "UNKNOWN";
}

function isWholeYogurtSubCategory(subCategory: string): boolean {
  return normalizeWhitespace(subCategory).includes("WHOLE");
}

function isSoyBeverageSubCategory(subCategory: string): boolean {
  return normalizeWhitespace(subCategory).includes("SOY");
}

function isJuiceBoxSubCategory(subCategory: string): boolean {
  return normalizeWhitespace(subCategory).includes("BOX");
}

/**
 * Checks whether an APL product (by Category Description and Sub-Category Description)
 * is eligible for a single WIC ParticipantType under NYS WIC rules.
 */
export function checkEligibility(
  category: string,
  subCategory: string,
  participantType: ParticipantType,
  options?: { householdHasFullyBreastfeeding?: boolean },
): EligibilityResult {
  const canonical = resolveCanonicalCategory(category, subCategory);
  const participantLabel = PARTICIPANT_LABELS[participantType];

  // Medical formulas and nutritionals require explicit prescription on the WIC Shopping List
  if (canonical === "EXEMPT_FORMULA") {
    return {
      eligible: true,
      reason:
        "Exempt formula requires special medical documentation on your WIC Shopping List",
    };
  }

  if (canonical === "WIC_NUTRITIONALS") {
    if (participantType === "INFANT_0_6" || participantType === "INFANT_6_12") {
      return {
        eligible: false,
        reason: `WIC Nutritionals are not eligible for ${participantLabel}`,
      };
    }
    return {
      eligible: true,
      reason:
        "WIC Nutritionals require special medical documentation on your WIC Shopping List",
    };
  }

  // 1. INFANT_0_6: Formula only
  if (participantType === "INFANT_0_6") {
    if (canonical === "INFANT_FORMULA") {
      return { eligible: true };
    }
    return {
      eligible: false,
      reason:
        "Infants (0-6 months) are only eligible for infant formula",
    };
  }

  // 2. INFANT_6_12: Infant formula, infant cereal, jarred baby fruits/vegetables, CVB ($22), and infant meats (fully breastfeeding)
  if (participantType === "INFANT_6_12") {
    switch (canonical) {
      case "INFANT_FORMULA":
      case "INFANT_CEREAL":
      case "INFANT_FRUITS_AND_VEGETABLES":
      case "FRUITS_AND_VEGETABLES_CVB":
        return { eligible: true };
      case "INFANT_MEATS":
        return {
          eligible: true,
          reason: options?.householdHasFullyBreastfeeding
            ? "Eligible for your fully breastfeeding infant (6-12 months)"
            : "Infant meats are eligible for fully breastfeeding infants (6-12 months)",
        };
      default:
        return {
          eligible: false,
          reason: `${category || "This category"} is not eligible for ${participantLabel}`,
        };
    }
  }

  // Infants-only categories are never eligible for children or adults
  if (
    canonical === "INFANT_FORMULA" ||
    canonical === "INFANT_CEREAL" ||
    canonical === "INFANT_FRUITS_AND_VEGETABLES" ||
    canonical === "INFANT_MEATS"
  ) {
    return {
      eligible: false,
      reason: `Infant foods and formulas are not eligible for ${participantLabel}`,
    };
  }

  // 3. CHILD_1_2: Whole milk (or Soy Beverage), Whole milk yogurt, Cheese/Tofu, Eggs, Legumes, Fish, Breakfast Cereal, Whole Grains, CVB ($27), Juice 64oz or Juice Boxes
  if (participantType === "CHILD_1_2") {
    switch (canonical) {
      case "MILK_WHOLE":
        return { eligible: true };
      case "MILK_FAT_REDUCED":
        if (isSoyBeverageSubCategory(subCategory)) {
          return { eligible: true };
        }
        return {
          eligible: false,
          reason:
            "Children (1-2 years) must get whole milk (or approved soy beverage), not 1% or nonfat milk",
        };
      case "YOGURT":
        if (isWholeYogurtSubCategory(subCategory)) {
          return { eligible: true };
        }
        return {
          eligible: false,
          reason:
            "Children (1-2 years) must get whole milk yogurt, not low-fat or nonfat yogurt",
        };
      case "JUICE_64OZ":
        return { eligible: true };
      case "JUICE_48OZ":
        if (isJuiceBoxSubCategory(subCategory)) {
          return { eligible: true };
        }
        return {
          eligible: false,
          reason:
            "48oz concentrate juice is for women's packages; children receive 64oz juice, 16oz frozen concentrate, or juice boxes",
        };
      case "CHEESE_OR_TOFU":
      case "EGGS":
      case "LEGUMES":
      case "FISH":
      case "BREAKFAST_CEREAL":
      case "BREAD_AND_WHOLE_GRAINS":
      case "FRUITS_AND_VEGETABLES_CVB":
        return { eligible: true };
      default:
        return { eligible: true };
    }
  }

  // 4. CHILD_2_5: Low-fat (1%) or nonfat milk (or Soy Beverage), Low-fat/nonfat yogurt, Cheese/Tofu, Eggs, Legumes, Fish, Breakfast Cereal, Whole Grains, CVB ($27), Juice 64oz or Juice Boxes
  if (participantType === "CHILD_2_5") {
    switch (canonical) {
      case "MILK_WHOLE":
        return {
          eligible: false,
          reason:
            "Children (2-5 years) must get low-fat (1%) or nonfat milk, not whole milk",
        };
      case "MILK_FAT_REDUCED":
        return { eligible: true };
      case "YOGURT":
        if (isWholeYogurtSubCategory(subCategory)) {
          return {
            eligible: false,
            reason:
              "Children (2-5 years) must get low-fat or nonfat yogurt, not whole milk yogurt",
          };
        }
        return { eligible: true };
      case "JUICE_64OZ":
        return { eligible: true };
      case "JUICE_48OZ":
        if (isJuiceBoxSubCategory(subCategory)) {
          return { eligible: true };
        }
        return {
          eligible: false,
          reason:
            "48oz concentrate juice is for women's packages; children receive 64oz juice, 16oz frozen concentrate, or juice boxes",
        };
      case "CHEESE_OR_TOFU":
      case "EGGS":
      case "LEGUMES":
      case "FISH":
      case "BREAKFAST_CEREAL":
      case "BREAD_AND_WHOLE_GRAINS":
      case "FRUITS_AND_VEGETABLES_CVB":
        return { eligible: true };
      default:
        return { eligible: true };
    }
  }

  // 5. Adult packages: PREGNANT, PARTIALLY_BREASTFEEDING, BREASTFEEDING, POSTPARTUM
  switch (canonical) {
    case "MILK_WHOLE":
      return {
        eligible: false,
        reason: `${participantLabel} participants must get low-fat (1%) or nonfat milk, not whole milk`,
      };
    case "MILK_FAT_REDUCED":
      return { eligible: true };
    case "YOGURT":
      if (isWholeYogurtSubCategory(subCategory)) {
        return {
          eligible: false,
          reason: `${participantLabel} participants must get low-fat or nonfat yogurt, not whole milk yogurt`,
        };
      }
      return { eligible: true };
    case "BREAD_AND_WHOLE_GRAINS":
      if (participantType === "POSTPARTUM") {
        return {
          eligible: false,
          reason:
            "Whole grains are eligible for children, pregnant, and breastfeeding participants (not non-breastfeeding postpartum)",
        };
      }
      return { eligible: true };
    case "JUICE_64OZ":
      return {
        eligible: false,
        reason:
          "64oz juice is for children's packages; women receive 11.5-12oz (48oz reconstituted) concentrate",
      };
    case "JUICE_48OZ":
      if (isJuiceBoxSubCategory(subCategory)) {
        return {
          eligible: false,
          reason:
            "Juice boxes are for children's packages; women receive 11.5-12oz (48oz reconstituted) concentrate",
        };
      }
      return { eligible: true };
    case "CHEESE_OR_TOFU":
    case "EGGS":
    case "LEGUMES":
    case "FISH":
    case "BREAKFAST_CEREAL":
    case "FRUITS_AND_VEGETABLES_CVB":
      return { eligible: true };
    default:
      return { eligible: true };
  }
}

/**
 * Evaluates product eligibility across an entire Household (ParticipantType[]).
 * A product is eligible for the household if at least one member qualifies.
 */
export function checkHouseholdEligibility(
  category: string,
  subCategory: string,
  household: ParticipantType[],
): HouseholdEligibilityResult {
  if (household.length === 0) {
    return {
      eligible: true,
      eligibleMembers: [],
      ineligibleMembers: [],
    };
  }

  const householdHasFullyBreastfeeding = household.includes("BREASTFEEDING");

  const eligibleMembers: HouseholdMemberEligibility[] = [];
  const ineligibleMembers: HouseholdMemberEligibility[] = [];

  for (const memberType of household) {
    const res = checkEligibility(category, subCategory, memberType, {
      householdHasFullyBreastfeeding,
    });
    const entry: HouseholdMemberEligibility = {
      type: memberType,
      label: PARTICIPANT_LABELS[memberType],
      eligible: res.eligible,
      reason: res.reason,
    };
    if (res.eligible) {
      eligibleMembers.push(entry);
    } else {
      ineligibleMembers.push(entry);
    }
  }

  const eligible = eligibleMembers.length > 0;
  let reason: string | undefined;

  if (eligible) {
    // Surface any conditional note from eligible members (e.g., Infant Meats or Medical Formula)
    const noteMember = eligibleMembers.find((m) => m.reason);
    reason = noteMember?.reason;
  } else {
    // Summarize why it's ineligible across the household
    const uniqueReasons = Array.from(
      new Set(ineligibleMembers.map((m) => m.reason).filter(Boolean)),
    );
    reason =
      uniqueReasons.length === 1
        ? uniqueReasons[0]
        : uniqueReasons.join(" • ");
  }

  return {
    eligible,
    reason,
    eligibleMembers,
    ineligibleMembers,
  };
}

export function getParticipantBenefits(
  participantType: ParticipantType,
): FoodBenefit[] {
  return PARTICIPANT_BENEFITS[participantType] || [];
}

export function getHouseholdCvbTotal(household: ParticipantType[]): number {
  return household.reduce(
    (sum, type) => sum + (PARTICIPANT_CVB_DOLLARS[type] || 0),
    0,
  );
}
