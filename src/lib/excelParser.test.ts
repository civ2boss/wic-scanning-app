import { beforeEach, describe, expect, it, vi } from "vitest";
import { parseExcel } from "./excelParser";

vi.mock("xlsx", () => ({
  read: vi.fn(),
  utils: {
    sheet_to_json: vi.fn(),
  },
}));

import { read, utils } from "xlsx";

const mockRead = read as ReturnType<typeof vi.fn>;
const mockSheetToJson = utils.sheet_to_json as ReturnType<typeof vi.fn>;

describe("parseExcel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should throw error if Excel file is empty", async () => {
    mockRead.mockReturnValue({
      SheetNames: ["Sheet1"],
      Sheets: { Sheet1: {} },
    });
    mockSheetToJson.mockReturnValue([]);

    await expect(parseExcel(new ArrayBuffer(100))).rejects.toThrow(
      "Excel file appears to be empty or missing headers",
    );
  });

  it("should throw error if header row cannot be found", async () => {
    mockRead.mockReturnValue({
      SheetNames: ["Sheet1"],
      Sheets: { Sheet1: {} },
    });
    mockSheetToJson.mockReturnValue([
      ["Col1", "Col2"],
      ["Data1", "Data2"],
    ]);

    await expect(parseExcel(new ArrayBuffer(100))).rejects.toThrow(
      "Could not find header row in Excel file",
    );
  });

  it("should find header row with UPC pattern and preserve PLUs", async () => {
    mockRead.mockReturnValue({
      SheetNames: ["Sheet1"],
      Sheets: { Sheet1: {} },
    });
    mockSheetToJson.mockReturnValue([
      ["Some", "Data"],
      ["UPC", "Category", "SubCategory"],
      ["4098", "Fruits and Vegetables Cash Value Benefit", "Fresh"],
    ]);

    const products = await parseExcel(new ArrayBuffer(100));
    expect(products).toHaveLength(1);
    expect(products[0].upc).toBe("4098");
  });

  it("should parse products with all fields and normalize UPCs", async () => {
    mockRead.mockReturnValue({
      SheetNames: ["Sheet1"],
      Sheets: { Sheet1: {} },
    });
    mockSheetToJson.mockReturnValue([
      ["Random", "Row"],
      ["UPC", "Category", "SubCategory", "Brand", "Food", "Size", "UOM"],
      ["123456789", "Milk Whole", "Milk Whole", "BrandX", "Whole Milk", "1", "Gallon"],
    ]);

    const products = await parseExcel(new ArrayBuffer(100));
    expect(products).toHaveLength(1);
    expect(products[0]).toEqual({
      upc: "000123456789",
      categoryDescription: "Milk Whole",
      subCategoryDescription: "Milk Whole",
      brandName: "BrandX",
      foodDescription: "Whole Milk",
      packageSize: "1",
      uom: "Gallon",
    });
  });

  it("should deduplicate products by canonical UPC", async () => {
    mockRead.mockReturnValue({
      SheetNames: ["Sheet1"],
      Sheets: { Sheet1: {} },
    });
    mockSheetToJson.mockReturnValue([
      ["UPC/PLU Number", "Category Description", "Sub-Category Description"],
      ["036514237175", "Cheese or Tofu", "Cheese"],
      ["36514237175", "Cheese or Tofu", "Cheese"],
    ]);

    const products = await parseExcel(new ArrayBuffer(100));
    expect(products).toHaveLength(1);
    expect(products[0].upc).toBe("036514237175");
  });

  it("should skip rows with empty UPC", async () => {
    mockRead.mockReturnValue({
      SheetNames: ["Sheet1"],
      Sheets: { Sheet1: {} },
    });
    mockSheetToJson.mockReturnValue([
      ["UPC", "Category"],
      ["4011", "Milk"],
      ["", "Cheese"],
      ["4098", "Yogurt"],
    ]);

    const products = await parseExcel(new ArrayBuffer(100));
    expect(products).toHaveLength(2);
    expect(products[0].upc).toBe("4011");
    expect(products[1].upc).toBe("4098");
  });

  it("should handle flexible column matching without confusing Sub-Category with Category", async () => {
    mockRead.mockReturnValue({
      SheetNames: ["Sheet1"],
      Sheets: { Sheet1: {} },
    });
    mockSheetToJson.mockReturnValue([
      [
        "UPC/PLU Number",
        "Sub-Category Description",
        "Category Description",
        "Brand Name",
        "Food Description",
        "Package Size",
        "UOM",
      ],
      ["036514237175", "Sub", "Cat", "B", "F", "S", "U"],
    ]);

    const products = await parseExcel(new ArrayBuffer(100));
    expect(products).toHaveLength(1);
    expect(products[0].upc).toBe("036514237175");
    expect(products[0].categoryDescription).toBe("Cat");
    expect(products[0].subCategoryDescription).toBe("Sub");
  });

  it("should throw error if UPC column is missing", async () => {
    mockRead.mockReturnValue({
      SheetNames: ["Sheet1"],
      Sheets: { Sheet1: {} },
    });
    mockSheetToJson.mockReturnValue([
      ["Category", "Description"],
      ["Milk", "Whole"],
    ]);

    await expect(parseExcel(new ArrayBuffer(100))).rejects.toThrow(
      "Could not find header row in Excel file",
    );
  });

  it("should parse multiple products", async () => {
    mockRead.mockReturnValue({
      SheetNames: ["Sheet1"],
      Sheets: { Sheet1: {} },
    });
    mockSheetToJson.mockReturnValue([
      ["UPC", "Category"],
      ["4001", "Milk"],
      ["4002", "Cheese"],
      ["4003", "Yogurt"],
    ]);

    const products = await parseExcel(new ArrayBuffer(100));
    expect(products).toHaveLength(3);
  });
});
