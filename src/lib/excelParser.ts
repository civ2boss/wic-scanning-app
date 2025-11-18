import { read, utils } from "xlsx";
import type { Product } from "./db";

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
  // The header row should contain "UPC" or "PLU" or similar
  let headerRowIndex = -1;
  const headerPatterns = ["upc", "plu", "upc/plu"];

  for (let i = 0; i < Math.min(20, rawData.length); i++) {
    const row = rawData[i] as string[];
    const rowText = row.join(" ").toLowerCase();

    // Check if this row contains header patterns
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

  // Find column indices by matching header names (case-insensitive, flexible matching)
  const findColumnIndex = (patterns: string[]): number => {
    for (const pattern of patterns) {
      const index = headers.findIndex(
        (h) =>
          h &&
          typeof h === "string" &&
          h.toLowerCase().includes(pattern.toLowerCase()),
      );
      if (index !== -1) return index;
    }
    return -1;
  };

  const upcIndex = findColumnIndex(["upc", "plu", "upc/plu number"]);
  const categoryIndex = findColumnIndex(["category description", "category"]);
  const subCategoryIndex = findColumnIndex([
    "sub-category",
    "subcategory",
    "sub category",
    "sub-category description",
  ]);
  const brandIndex = findColumnIndex(["brand name", "brand"]);
  const foodIndex = findColumnIndex([
    "food description",
    "food",
    "description",
  ]);
  const packageSizeIndex = findColumnIndex(["package size", "size", "package"]);
  const uomIndex = findColumnIndex(["uom", "unit of measure", "unit"]);

  // Validate that we found the required UPC column
  if (upcIndex === -1) {
    throw new Error(
      "Could not find UPC/PLU column in Excel file. Headers found: " +
        headers.join(", "),
    );
  }

  console.log("Column indices:", {
    upc: upcIndex,
    category: categoryIndex,
    subCategory: subCategoryIndex,
    brand: brandIndex,
    food: foodIndex,
    packageSize: packageSizeIndex,
    uom: uomIndex,
  });

  // Process data rows (start after header row)
  const products: Product[] = [];

  for (let i = headerRowIndex + 1; i < rawData.length; i++) {
    const row = rawData[i];

    // Extract UPC - required field
    const upc = row[upcIndex];
    const upcString = upc ? String(upc).trim() : "";

    // Skip rows with empty/missing UPC
    if (!upcString) {
      continue;
    }

    // Build product object
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

    products.push(product);
  }

  console.log(
    `Parsed ${products.length} valid products (skipped ${rawData.length - headerRowIndex - 1 - products.length} rows with missing UPC)`,
  );

  return products;
}
