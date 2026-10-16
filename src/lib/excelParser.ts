import { read, utils } from "xlsx";
import type { Product } from "./db";
import { normalizeUpc } from "./upc";

export async function parseExcel(fileBuffer: ArrayBuffer): Promise<Product[]> {
  const workbook = read(fileBuffer, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  // Convert to JSON with header row
  const rawData = utils.sheet_to_json(sheet, {
    header: 1, // Get raw array format to see headers
    defval: "", // Default value for empty cells
  }) as unknown[][];

  if (rawData.length < 2) {
    throw new Error("Excel file appears to be empty or missing headers");
  }

  // Find the actual header row by searching for common column names
  let headerRowIndex = -1;
  const headerPatterns = ["upc", "plu", "upc/plu"];

  for (let i = 0; i < Math.min(20, rawData.length); i++) {
    const row = rawData[i] as string[];
    const rowText = row.join(" ").toLowerCase();

    if (headerPatterns.some((pattern) => rowText.includes(pattern))) {
      headerRowIndex = i;
      break;
    }
  }

  if (headerRowIndex === -1) {
    throw new Error(
      "Could not find header row in Excel file. Searched first 20 rows.",
    );
  }

  // Get header row
  const headers = rawData[headerRowIndex] as string[];

  // Find column indices by matching header names (exact match first, then substring)
  const findColumnIndex = (
    patterns: string[],
    excludePatterns: string[] = [],
  ): number => {
    for (const pattern of patterns) {
      const exactIndex = headers.findIndex(
        (h) =>
          h &&
          typeof h === "string" &&
          h.trim().toLowerCase() === pattern.toLowerCase(),
      );
      if (exactIndex !== -1) return exactIndex;
    }

    for (const pattern of patterns) {
      const index = headers.findIndex((h) => {
        if (!h || typeof h !== "string") return false;
        const lower = h.toLowerCase();
        if (excludePatterns.some((ex) => lower.includes(ex.toLowerCase()))) {
          return false;
        }
        return lower.includes(pattern.toLowerCase());
      });
      if (index !== -1) return index;
    }
    return -1;
  };

  const upcIndex = findColumnIndex(["upc/plu number", "upc/plu", "upc", "plu"]);
  const categoryIndex = findColumnIndex(
    ["category description", "category"],
    ["sub-category", "subcategory", "sub category"],
  );
  const subCategoryIndex = findColumnIndex([
    "sub-category description",
    "sub-category",
    "subcategory",
    "sub category",
  ]);
  const brandIndex = findColumnIndex(["brand name", "brand"]);
  const foodIndex = findColumnIndex([
    "food description",
    "food",
    "description",
  ]);
  const packageSizeIndex = findColumnIndex(["package size", "size", "package"]);
  const uomIndex = findColumnIndex([
    "unit of measure (uom)",
    "uom",
    "unit of measure",
    "unit",
  ]);

  if (upcIndex === -1) {
    throw new Error(
      "Could not find UPC/PLU column in Excel file. Headers found: " +
        headers.join(", "),
    );
  }

  // Process data rows (start after header row) and deduplicate by canonical UPC
  const productsByUpc = new Map<string, Product>();

  for (let i = headerRowIndex + 1; i < rawData.length; i++) {
    const row = rawData[i];
    const upcString = normalizeUpc(
      row[upcIndex] as string | number | undefined,
    );

    if (!upcString) {
      continue;
    }

    const product: Product = {
      upc: upcString,
      categoryDescription:
        categoryIndex !== -1 ? String(row[categoryIndex] || "").trim() : "",
      subCategoryDescription:
        subCategoryIndex !== -1
          ? String(row[subCategoryIndex] || "").trim()
          : "",
      brandName: brandIndex !== -1 ? String(row[brandIndex] || "").trim() : "",
      foodDescription:
        foodIndex !== -1 ? String(row[foodIndex] || "").trim() : "",
      packageSize:
        packageSizeIndex !== -1
          ? String(row[packageSizeIndex] || "").trim()
          : "",
      uom: uomIndex !== -1 ? String(row[uomIndex] || "").trim() : "",
    };

    productsByUpc.set(upcString, product);
  }

  return Array.from(productsByUpc.values());
}
