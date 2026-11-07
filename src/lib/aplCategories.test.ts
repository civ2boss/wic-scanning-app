import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it } from "vitest";
import { listAplCategories } from "./aplCategories";
import { db, type Product } from "./db";

function product(upc: string, categoryDescription: string): Product {
  return {
    upc,
    categoryDescription,
    subCategoryDescription: categoryDescription,
    brandName: "Brand",
    foodDescription: "Food",
    packageSize: "1",
    uom: "EA",
  };
}

beforeEach(async () => {
  await db.products.clear();
});

describe("listAplCategories", () => {
  it("lists each synced APL Category once, alphabetically by its readable label", async () => {
    await db.products.bulkAdd([
      product("1", "MILK WHOLE"),
      product("2", "Milk  Whole "),
      product("3", "JUICE 48OZ"),
      product("4", "BREAD AND WHOLE GRAINS"),
      product("5", "CHEESE OR TOFU"),
      product("6", "FRUITS AND VEGETABLES CASH VALUE BENEFIT"),
    ]);

    expect(await listAplCategories()).toEqual([
      { key: "BREAD AND WHOLE GRAINS", label: "Bread and Whole Grains" },
      { key: "CHEESE OR TOFU", label: "Cheese or Tofu" },
      {
        key: "FRUITS AND VEGETABLES CASH VALUE BENEFIT",
        label: "Fruits and Vegetables (Cash Value Benefit)",
      },
      { key: "JUICE 48OZ", label: "Juice 48 oz" },
      { key: "MILK WHOLE", label: "Milk, Whole" },
    ]);
  });

  it("is empty before the first Snapshot Sync", async () => {
    expect(await listAplCategories()).toEqual([]);
  });
});
