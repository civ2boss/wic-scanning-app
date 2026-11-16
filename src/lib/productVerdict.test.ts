import { describe, expect, it } from "vitest";
import type { Product } from "./db";
import { productVerdict } from "./productVerdict";

function product(overrides: Partial<Product> = {}): Product {
  return {
    upc: "041303001806",
    categoryDescription: "MILK WHOLE",
    subCategoryDescription: "MILK WHOLE",
    brandName: "Any",
    foodDescription: "Whole Milk",
    packageSize: "128",
    uom: "OZ",
    ...overrides,
  };
}

const infantFormula = product({
  categoryDescription: "Infant Formula",
  subCategoryDescription: "Enfamil Infant Powder",
});

describe("productVerdict", () => {
  it("is not-found when the Product is not on the APL", () => {
    const verdict = productVerdict(null, ["PREGNANT"]);
    expect(verdict.status).toBe("not-found");
    expect(verdict.members).toEqual([]);
    expect(verdict.guide).toBeNull();
  });

  it("is approved, with Eligibility unknown, when the Household is empty", () => {
    const verdict = productVerdict(product(), []);
    expect(verdict.status).toBe("approved");
    expect(verdict.reason).toBeNull();
    expect(verdict.members).toEqual([]);
  });

  it("is eligible when at least one Household member qualifies", () => {
    const verdict = productVerdict(product(), ["PREGNANT", "CHILD_1_2"]);
    expect(verdict.status).toBe("eligible");
  });

  it("is ineligible when no Household member qualifies, joining their reasons", () => {
    const verdict = productVerdict(infantFormula, ["CHILD_2_5", "POSTPARTUM"]);
    expect(verdict.status).toBe("ineligible");
    expect(verdict.reason).toContain("not eligible");
  });

  it("lists members in Household order", () => {
    const verdict = productVerdict(product(), [
      "PREGNANT",
      "CHILD_1_2",
      "POSTPARTUM",
    ]);
    expect(verdict.members.map((m) => [m.type, m.eligible])).toEqual([
      ["PREGNANT", false],
      ["CHILD_1_2", true],
      ["POSTPARTUM", false],
    ]);
  });

  it("looks up the WIC Foods Guide entry for the Product", () => {
    const verdict = productVerdict(product(), []);
    expect(verdict.guide?.name).toBe("Milk");
  });
});
