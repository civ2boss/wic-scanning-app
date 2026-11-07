import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it } from "vitest";
import { db, type Product } from "./db";
import { searchProducts } from "./productLookup";

function product(overrides: Partial<Product>): Product {
  return {
    upc: "000000000000",
    categoryDescription: "MILK WHOLE",
    subCategoryDescription: "MILK WHOLE",
    brandName: "Brand",
    foodDescription: "Food",
    packageSize: "1",
    uom: "GAL",
    ...overrides,
  };
}

const describeOf = (products: Product[]) =>
  products.map((p) => `${p.brandName} ${p.foodDescription}`);

beforeEach(async () => {
  await db.products.clear();
});

describe("searchProducts", () => {
  it("browses every Product sorted by brand, then description, when given no criteria", async () => {
    await db.products.bulkAdd([
      product({ upc: "1", brandName: "Quaker", foodDescription: "Oats" }),
      product({ upc: "2", brandName: "Cheerios", foodDescription: "Original" }),
      product({
        upc: "3",
        brandName: "Cheerios",
        foodDescription: "Honey Nut",
      }),
    ]);

    const result = await searchProducts({});

    expect(describeOf(result.products)).toEqual([
      "Cheerios Honey Nut",
      "Cheerios Original",
      "Quaker Oats",
    ]);
    expect(result.totalCount).toBe(3);
  });

  it("narrows to one APL Category, regardless of how the spreadsheet cased or spaced it, and combines with text", async () => {
    await db.products.bulkAdd([
      product({
        upc: "1",
        categoryDescription: "BREAKFAST CEREAL",
        brandName: "Quaker",
        foodDescription: "Oat Squares",
      }),
      product({
        upc: "2",
        categoryDescription: " Breakfast  Cereal",
        brandName: "Cheerios",
        foodDescription: "Oat Crunch",
      }),
      product({
        upc: "3",
        categoryDescription: "BREAKFAST CEREAL",
        brandName: "Kix",
        foodDescription: "Original",
      }),
      product({
        upc: "4",
        categoryDescription: "BREAD AND WHOLE GRAINS",
        brandName: "Quaker",
        foodDescription: "Oat Bread",
      }),
    ]);

    const result = await searchProducts({
      category: "BREAKFAST CEREAL",
      text: "oat",
    });

    expect(describeOf(result.products)).toEqual([
      "Cheerios Oat Crunch",
      "Quaker Oat Squares",
    ]);
    expect(result.totalCount).toBe(2);
  });

  it("pages through the sorted results", async () => {
    await db.products.bulkAdd([
      product({ upc: "1", brandName: "D" }),
      product({ upc: "2", brandName: "A" }),
      product({ upc: "3", brandName: "C" }),
      product({ upc: "4", brandName: "B" }),
    ]);

    const result = await searchProducts({}, 2, 2);

    expect(result.products.map((p) => p.brandName)).toEqual(["C", "D"]);
    expect(result.totalCount).toBe(4);
  });

  describe("with a Household (eligible only)", () => {
    beforeEach(async () => {
      await db.products.bulkAdd([
        product({
          upc: "1",
          categoryDescription: "INFANT CEREAL",
          subCategoryDescription: "INFANT CEREAL",
          brandName: "Gerber",
          foodDescription: "Oatmeal Cereal",
        }),
        product({
          upc: "2",
          categoryDescription: "BREAKFAST CEREAL",
          subCategoryDescription: "HOT CEREAL",
          brandName: "Quaker",
          foodDescription: "Oatmeal",
        }),
      ]);
    });

    it("keeps a Product when any Household member is eligible, not just the first", async () => {
      const result = await searchProducts({
        text: "oatmeal",
        household: ["PREGNANT", "INFANT_6_12"],
      });

      expect(describeOf(result.products)).toEqual([
        "Gerber Oatmeal Cereal",
        "Quaker Oatmeal",
      ]);
    });

    it("drops Products no member is eligible for, but still counts every text and category match", async () => {
      const result = await searchProducts({
        category: "INFANT CEREAL",
        household: ["PREGNANT"],
      });

      expect(result.products).toEqual([]);
      expect(result.totalCount).toBe(0);
      expect(result.matchCount).toBe(1);
    });
  });
});
