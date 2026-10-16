import { describe, expect, it } from "vitest";
import { getGuideInfoForProduct } from "./wicFoodsGuide";

describe("getGuideInfoForProduct (NYS WIC APL Categories)", () => {
  it("resolves all 18 canonical NYS APL categories and key subcategories to guide entries", () => {
    const cases: Array<[string, string, string]> = [
      [
        "Bread and  Whole Grains",
        "Bread 100% Whole Wheat or Whole Grain",
        "whole-grain-bread",
      ],
      ["Bread and  Whole Grains", "Brown Rice", "brown-rice"],
      ["Bread and  Whole Grains", "Soft Corn Tortilla", "tortillas"],
      ["Bread and  Whole Grains", "Whole Wheat Tortilla", "tortillas"],
      ["Bread and  Whole Grains", "Whole Wheat Pasta", "whole-wheat-pasta"],
      ["Breakfast Cereal", "Cereal", "breakfast-cereal"],
      ["Cheese or Tofu", "Cheese", "cheese"],
      ["Cheese or Tofu", "Cheese Kosher", "cheese"],
      ["Cheese or Tofu", "Tofu", "tofu"],
      ["Eggs", "Eggs", "eggs"],
      ["Exempt Formula", "Nutramigen Powder", "infant-formula"],
      ["Fish", "Light Tuna", "canned-fish"],
      ["Fish", "Salmon", "canned-fish"],
      ["Fish", "Sardines", "canned-fish"],
      [
        "Fruits and Vegetables Cash Value Benefit",
        "Fresh",
        "fresh-fruits-vegetables",
      ],
      ["Fruits and Vegetables Cash Value Benefit", "Canned", "canned-fruits"],
      ["Fruits and Vegetables Cash Value Benefit", "Frozen", "frozen-fruits"],
      ["Infant Cereal", "GERBER Infant Cereal", "infant-cereal"],
      ["Infant Formula", "Enfamil Infant Powder", "infant-formula"],
      [
        "Infant Fruits and Vegetables",
        "Infant Fruits or Vegetables Combinations",
        "baby-fruits-vegetables",
      ],
      ["Infant Meats", "Infant meats", "baby-meats"],
      ["Juice 48oz", "Juice Boxes", "juice-children"],
      ["Juice 48oz", "Juice Frozen Concentrate", "juice-women"],
      ["Juice 64oz", "Juice Shelf Stable", "juice-children"],
      ["Legumes", "Canned beans", "canned-beans"],
      ["Legumes", "Dry legumes or Dry peas", "dried-beans"],
      ["Legumes", "Peanut Butter", "peanut-butter"],
      ["Milk Fat Reduced", "Milk Nonfat and 1% Lowfat", "milk"],
      ["Milk Fat Reduced", "Soy Beverage", "soy-beverages"],
      ["Milk Whole", "Milk Whole", "milk"],
      ["Milk Whole", "Goat's Milk Evaporated", "milk"],
      ["WIC Nutritionals", "PediaSure Ready to Feed", "infant-formula"],
      ["Yogurt", "Yogurt Whole Milk", "yogurt"],
      ["Yogurt", "Yogurt Lowfat and Nonfat", "yogurt"],
    ];

    for (const [cat, sub, expectedId] of cases) {
      const info = getGuideInfoForProduct(cat, sub);
      expect(info, `Expected guide info for ${cat} -> ${sub}`).not.toBeNull();
      expect(info?.id).toBe(expectedId);
    }
  });

  it("returns null for unknown categories", () => {
    expect(getGuideInfoForProduct("Unknown Category", "Unknown Sub")).toBeNull();
    expect(getGuideInfoForProduct("", "")).toBeNull();
  });
});
