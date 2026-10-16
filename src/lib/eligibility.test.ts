import { describe, expect, it } from "vitest";
import type { ParticipantType } from "./db";
import {
  checkEligibility,
  checkHouseholdEligibility,
  getHouseholdCvbTotal,
  getParticipantBenefits,
  PARTICIPANT_CVB_DOLLARS,
  PARTICIPANT_LABELS,
} from "./eligibility";

describe("checkEligibility (Canonical NYS WIC APL Categories)", () => {
  describe("INFANT_0_6", () => {
    const participantType: ParticipantType = "INFANT_0_6";

    it("allows Infant Formula and Exempt Formula (with medical note)", () => {
      expect(
        checkEligibility(
          "Infant Formula",
          "Enfamil Infant Powder",
          participantType,
        ).eligible,
      ).toBe(true);

      const exempt = checkEligibility(
        "Exempt Formula",
        "Nutramigen Powder",
        participantType,
      );
      expect(exempt.eligible).toBe(true);
      expect(exempt.reason).toContain("medical documentation");
    });

    it("rejects Infant Cereal, Infant Fruits & Vegetables, Infant Meats, and adult foods", () => {
      expect(
        checkEligibility(
          "Infant Cereal",
          "GERBER Infant Cereal",
          participantType,
        ).eligible,
      ).toBe(false);
      expect(
        checkEligibility(
          "Infant Fruits and Vegetables",
          "Infant Fruits",
          participantType,
        ).eligible,
      ).toBe(false);
      expect(
        checkEligibility("Infant Meats", "Infant meats", participantType)
          .eligible,
      ).toBe(false);
      expect(
        checkEligibility(
          "Fruits and Vegetables Cash Value Benefit",
          "Fresh",
          participantType,
        ).eligible,
      ).toBe(false);
      expect(
        checkEligibility("Milk Whole", "Milk Whole", participantType).eligible,
      ).toBe(false);
    });
  });

  describe("INFANT_6_12", () => {
    const participantType: ParticipantType = "INFANT_6_12";

    it("allows Infant Formula, Infant Cereal, Infant Fruits & Vegetables, and CVB Produce", () => {
      expect(
        checkEligibility(
          "Infant Formula",
          "Enfamil Infant Powder",
          participantType,
        ).eligible,
      ).toBe(true);
      expect(
        checkEligibility(
          "Infant Cereal",
          "GERBER Infant Cereal",
          participantType,
        ).eligible,
      ).toBe(true);
      expect(
        checkEligibility(
          "Infant Fruits and Vegetables",
          "Infant Fruits or Vegetables Combinations",
          participantType,
        ).eligible,
      ).toBe(true);
      expect(
        checkEligibility(
          "Fruits and Vegetables Cash Value Benefit",
          "Fresh",
          participantType,
        ).eligible,
      ).toBe(true);
    });

    it("allows Infant Meats with breastfeeding note", () => {
      const res = checkEligibility(
        "Infant Meats",
        "Infant meats",
        participantType,
      );
      expect(res.eligible).toBe(true);
      expect(res.reason).toContain("fully breastfeeding");
    });

    it("rejects cow's milk, adult cereal, juice, and whole grains", () => {
      expect(
        checkEligibility("Milk Whole", "Milk Whole", participantType).eligible,
      ).toBe(false);
      expect(
        checkEligibility("Breakfast Cereal", "Cereal", participantType)
          .eligible,
      ).toBe(false);
      expect(
        checkEligibility("Juice 64oz", "Juice Shelf Stable", participantType)
          .eligible,
      ).toBe(false);
    });
  });

  describe("CHILD_1_2", () => {
    const participantType: ParticipantType = "CHILD_1_2";

    it("allows all Milk Whole subcategories (including Goat's Milk Evaporated) and Soy Beverage", () => {
      expect(
        checkEligibility("Milk Whole", "Milk Whole", participantType).eligible,
      ).toBe(true);
      expect(
        checkEligibility(
          "Milk Whole",
          "Goat's Milk Evaporated",
          participantType,
        ).eligible,
      ).toBe(true);
      expect(
        checkEligibility(
          "Milk Fat Reduced",
          "Soy Beverage",
          participantType,
        ).eligible,
      ).toBe(true);
    });

    it("rejects reduced-fat/nonfat dairy milk and lowfat/nonfat yogurt", () => {
      const milkRes = checkEligibility(
        "Milk Fat Reduced",
        "Milk Nonfat and 1% Lowfat",
        participantType,
      );
      expect(milkRes.eligible).toBe(false);
      expect(milkRes.reason).toContain("whole milk");

      const yogurtRes = checkEligibility(
        "Yogurt",
        "Yogurt Lowfat and Nonfat",
        participantType,
      );
      expect(yogurtRes.eligible).toBe(false);
      expect(yogurtRes.reason).toContain("whole milk yogurt");
    });

    it("allows Yogurt Whole Milk, Cheese or Tofu, Eggs, Legumes, Fish, Breakfast Cereal, Whole Grains, and CVB", () => {
      expect(
        checkEligibility("Yogurt", "Yogurt Whole Milk", participantType)
          .eligible,
      ).toBe(true);
      expect(
        checkEligibility("Cheese or Tofu", "Cheese", participantType).eligible,
      ).toBe(true);
      expect(
        checkEligibility("Cheese or Tofu", "Tofu", participantType).eligible,
      ).toBe(true);
      expect(
        checkEligibility("Eggs", "Eggs", participantType).eligible,
      ).toBe(true);
      expect(
        checkEligibility("Legumes", "Peanut Butter", participantType).eligible,
      ).toBe(true);
      expect(
        checkEligibility("Fish", "Light Tuna", participantType).eligible,
      ).toBe(true);
      expect(
        checkEligibility("Breakfast Cereal", "Cereal", participantType)
          .eligible,
      ).toBe(true);
      expect(
        checkEligibility(
          "Bread and  Whole Grains",
          "Bread 100% Whole Wheat or Whole Grain",
          participantType,
        ).eligible,
      ).toBe(true);
      expect(
        checkEligibility(
          "Fruits and Vegetables Cash Value Benefit",
          "Frozen",
          participantType,
        ).eligible,
      ).toBe(true);
    });

    it("allows 64oz juice and 48oz Juice Boxes, but rejects 48oz women's concentrate", () => {
      expect(
        checkEligibility("Juice 64oz", "Juice Shelf Stable", participantType)
          .eligible,
      ).toBe(true);
      expect(
        checkEligibility("Juice 48oz", "Juice Boxes", participantType).eligible,
      ).toBe(true);
      expect(
        checkEligibility(
          "Juice 48oz",
          "Juice Frozen Concentrate",
          participantType,
        ).eligible,
      ).toBe(false);
    });

    it("rejects infant formula, infant cereal, and baby food", () => {
      expect(
        checkEligibility(
          "Infant Cereal",
          "GERBER Infant Cereal",
          participantType,
        ).eligible,
      ).toBe(false);
      expect(
        checkEligibility(
          "Infant Fruits and Vegetables",
          "Infant Fruits",
          participantType,
        ).eligible,
      ).toBe(false);
    });
  });

  describe("CHILD_2_5", () => {
    const participantType: ParticipantType = "CHILD_2_5";

    it("allows Milk Fat Reduced and Lowfat/Nonfat Yogurt, and rejects Whole Milk and Whole Yogurt", () => {
      expect(
        checkEligibility(
          "Milk Fat Reduced",
          "Milk Nonfat and 1% Lowfat",
          participantType,
        ).eligible,
      ).toBe(true);
      expect(
        checkEligibility("Yogurt", "Yogurt Lowfat and Nonfat", participantType)
          .eligible,
      ).toBe(true);
      expect(
        checkEligibility("Milk Whole", "Milk Whole", participantType).eligible,
      ).toBe(false);
      expect(
        checkEligibility("Yogurt", "Yogurt Whole Milk", participantType)
          .eligible,
      ).toBe(false);
    });
  });

  describe("Adult Women (PREGNANT, PARTIALLY_BREASTFEEDING, BREASTFEEDING, POSTPARTUM)", () => {
    it("enforces low-fat/nonfat milk and yogurt for all adult women packages", () => {
      for (const type of [
        "PREGNANT",
        "PARTIALLY_BREASTFEEDING",
        "BREASTFEEDING",
        "POSTPARTUM",
      ] as ParticipantType[]) {
        expect(
          checkEligibility(
            "Milk Fat Reduced",
            "Milk Nonfat and 1% Lowfat",
            type,
          ).eligible,
        ).toBe(true);
        expect(checkEligibility("Milk Whole", "Milk Whole", type).eligible).toBe(
          false,
        );
        expect(
          checkEligibility("Yogurt", "Yogurt Lowfat and Nonfat", type).eligible,
        ).toBe(true);
        expect(
          checkEligibility("Yogurt", "Yogurt Whole Milk", type).eligible,
        ).toBe(false);
      }
    });

    it("allows Whole Grains for Pregnant and Breastfeeding, but rejects for non-breastfeeding Postpartum", () => {
      expect(
        checkEligibility(
          "Bread and  Whole Grains",
          "Whole Wheat Pasta",
          "PREGNANT",
        ).eligible,
      ).toBe(true);
      expect(
        checkEligibility(
          "Bread and  Whole Grains",
          "Brown Rice",
          "PARTIALLY_BREASTFEEDING",
        ).eligible,
      ).toBe(true);
      expect(
        checkEligibility(
          "Bread and  Whole Grains",
          "Whole Wheat Tortilla",
          "BREASTFEEDING",
        ).eligible,
      ).toBe(true);
      expect(
        checkEligibility(
          "Bread and  Whole Grains",
          "Whole Wheat Pasta",
          "POSTPARTUM",
        ).eligible,
      ).toBe(false);
    });

    it("allows 48oz concentrate juice for women, and rejects 64oz children's juice and juice boxes", () => {
      expect(
        checkEligibility(
          "Juice 48oz",
          "Juice Frozen Concentrate",
          "PREGNANT",
        ).eligible,
      ).toBe(true);
      expect(
        checkEligibility("Juice 48oz", "Juice Boxes", "PREGNANT").eligible,
      ).toBe(false);
      expect(
        checkEligibility("Juice 64oz", "Juice Shelf Stable", "PREGNANT")
          .eligible,
      ).toBe(false);
    });

    it("rejects Infant Cereal for all adult packages", () => {
      for (const type of [
        "PREGNANT",
        "PARTIALLY_BREASTFEEDING",
        "BREASTFEEDING",
        "POSTPARTUM",
      ] as ParticipantType[]) {
        expect(
          checkEligibility("Infant Cereal", "GERBER Infant Cereal", type)
            .eligible,
        ).toBe(false);
      }
    });
  });
});

describe("checkHouseholdEligibility", () => {
  it("marks Whole Milk eligible when Household has both PREGNANT and CHILD_1_2, identifying which member qualifies", () => {
    const res = checkHouseholdEligibility("Milk Whole", "Milk Whole", [
      "PREGNANT",
      "CHILD_1_2",
    ]);
    expect(res.eligible).toBe(true);
    expect(res.eligibleMembers.map((m) => m.type)).toEqual(["CHILD_1_2"]);
    expect(res.ineligibleMembers.map((m) => m.type)).toEqual(["PREGNANT"]);
  });

  it("marks Infant Formula ineligible when Household only has CHILD_2_5 and POSTPARTUM", () => {
    const res = checkHouseholdEligibility(
      "Infant Formula",
      "Enfamil Infant Powder",
      ["CHILD_2_5", "POSTPARTUM"],
    );
    expect(res.eligible).toBe(false);
    expect(res.eligibleMembers).toHaveLength(0);
    expect(res.ineligibleMembers).toHaveLength(2);
    expect(res.reason).toContain("not eligible");
  });
});

describe("CVB Benefits & Labels", () => {
  it("defines accurate NYS WIC Cash Value Benefit dollar amounts", () => {
    expect(PARTICIPANT_CVB_DOLLARS).toEqual({
      INFANT_0_6: 0,
      INFANT_6_12: 22,
      CHILD_1_2: 27,
      CHILD_2_5: 27,
      PREGNANT: 48,
      PARTIALLY_BREASTFEEDING: 53,
      BREASTFEEDING: 53,
      POSTPARTUM: 48,
    });
  });

  it("calculates household CVB total across multiple participants", () => {
    expect(
      getHouseholdCvbTotal(["BREASTFEEDING", "INFANT_6_12", "CHILD_2_5"]),
    ).toBe(53 + 22 + 27);
  });

  it("returns benefits and labels for all 8 participant types", () => {
    expect(Object.keys(PARTICIPANT_LABELS)).toHaveLength(8);
    expect(getParticipantBenefits("PREGNANT")[0].cvbDollars).toBe(48);
  });
});
