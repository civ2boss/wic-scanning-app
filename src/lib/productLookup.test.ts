import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "./db";
import { isWICApproved, lookupProduct, searchProducts } from "./productLookup";

const { mockOffset, mockCount } = vi.hoisted(() => {
  const mockToArray = vi.fn();
  const mockLimit = vi.fn().mockReturnValue({ toArray: mockToArray });
  return {
    mockOffset: vi.fn().mockReturnValue({ limit: mockLimit }),
    mockCount: vi.fn().mockResolvedValue(1),
  };
});

vi.mock("./db", () => ({
  db: {
    products: {
      get: vi.fn(),
      filter: vi.fn().mockReturnValue({
        offset: mockOffset,
        count: mockCount,
      }),
    },
  },
}));

const mockDb = db as unknown as {
  products: {
    get: ReturnType<typeof vi.fn>;
    filter: ReturnType<typeof vi.fn>;
  };
};

describe("lookupProduct", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("normalizes UPC-A, EAN-13 leading-0, and short UPCs before querying IndexedDB", async () => {
    const mockProduct = {
      upc: "000123456789",
      categoryDescription: "Milk Whole",
      subCategoryDescription: "Milk Whole",
      brandName: "BrandX",
      foodDescription: "Whole Milk",
      packageSize: "1",
      uom: "Gallon",
    };

    mockDb.products.get.mockResolvedValue(mockProduct);

    // 9-digit input is zero-padded to 12-digit UPC-A
    const result = await lookupProduct("123456789");
    expect(result).toEqual(mockProduct);
    expect(mockDb.products.get).toHaveBeenCalledWith("000123456789");

    // 13-digit EAN-13 with leading 0 strips the leading 0 to 12-digit UPC-A
    await lookupProduct("0036514237175");
    expect(mockDb.products.get).toHaveBeenCalledWith("036514237175");
  });

  it("should return null when product not found", async () => {
    mockDb.products.get.mockResolvedValue(undefined);

    const result = await lookupProduct("999999999");
    expect(result).toBeNull();
  });

  it("should return null on error", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mockDb.products.get.mockRejectedValue(new Error("Database error"));

    const result = await lookupProduct("123456789");
    expect(result).toBeNull();
    consoleSpy.mockRestore();
  });
});

describe("isWICApproved", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return true when product exists", async () => {
    mockDb.products.get.mockResolvedValue({
      upc: "000123456789",
      categoryDescription: "Milk Whole",
      subCategoryDescription: "Milk Whole",
      brandName: "BrandX",
      foodDescription: "Whole Milk",
      packageSize: "1",
      uom: "Gallon",
    });

    const result = await isWICApproved("123456789");
    expect(result).toBe(true);
  });

  it("should return false when product does not exist", async () => {
    mockDb.products.get.mockResolvedValue(undefined);

    const result = await isWICApproved("999999999");
    expect(result).toBe(false);
  });

  it("should return false on error", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mockDb.products.get.mockRejectedValue(new Error("Database error"));

    const result = await isWICApproved("123456789");
    expect(result).toBe(false);
    consoleSpy.mockRestore();
  });
});

describe("searchProducts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return empty array for empty query", async () => {
    const result = await searchProducts("");
    expect(result).toEqual({ products: [], totalCount: 0 });
    expect(mockDb.products.filter).not.toHaveBeenCalled();
  });

  it("should return empty array on whitespace query", async () => {
    const result = await searchProducts("   ");
    expect(result).toEqual({ products: [], totalCount: 0 });
    expect(mockDb.products.filter).not.toHaveBeenCalled();
  });

  it("should filter and return products matching the query and household eligibility", async () => {
    const mockProducts = [
      {
        upc: "1",
        brandName: "BrandX",
        foodDescription: "Whole Milk",
        categoryDescription: "Milk Whole",
        subCategoryDescription: "Milk Whole",
      },
    ];

    const mockToArrayLocal = vi.fn().mockResolvedValue(mockProducts);
    mockOffset.mockReturnValue({
      limit: vi.fn().mockReturnValue({ toArray: mockToArrayLocal }),
    });
    mockCount.mockResolvedValue(1);

    const result = await searchProducts("whole milk", 30, 0, [
      "PREGNANT",
      "CHILD_1_2",
    ]);

    expect(result).toEqual({ products: mockProducts, totalCount: 1 });
    expect(mockDb.products.filter).toHaveBeenCalled();

    const filterFn = mockDb.products.filter.mock.calls[0][0];

    // Eligible because CHILD_1_2 is in the household
    expect(
      filterFn({
        brandName: "BrandX",
        foodDescription: "Whole Milk",
        categoryDescription: "Milk Whole",
        subCategoryDescription: "Milk Whole",
      }),
    ).toBe(true);

    // Should not match because it lacks 'whole'
    expect(
      filterFn({
        brandName: "BrandY",
        foodDescription: "Skim Milk",
        categoryDescription: "Milk Fat Reduced",
        subCategoryDescription: "Milk Nonfat and 1% Lowfat",
      }),
    ).toBe(false);
  });

  it("should handle database errors gracefully", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mockDb.products.filter.mockImplementation(() => {
      throw new Error("Database error");
    });

    const result = await searchProducts("cheese");
    expect(result).toEqual({ products: [], totalCount: 0 });
    consoleSpy.mockRestore();
  });
});
