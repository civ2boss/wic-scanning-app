import { Dexie, type EntityTable } from "dexie";

/**
 * UPC/PLU Number
 * Category Description
 * Sub-Category Description
 * Brand Name
 * Food Description
 * Package Size
 * Unit of Measure (UOM)
  */

interface Product {
  upc: string;
  categoryDescription: string;
  subCategoryDescription: string;
  brandName: string;
  foodDescription: string;
  packageSize: string;
  uom: string;
}

interface SyncMetadata {
  id: "current"; // Single record, always use "current" as key
  lastSyncDate: Date;
  totalProducts: number;
}

const db = new Dexie("ProductsDatabase") as Dexie & {
  products: EntityTable<Product, "upc">;
  syncMetadata: EntityTable<SyncMetadata, "id">;
};

// Scheme declaration
db.version(1).stores({
  products: "upc, categoryDescription, subCategoryDescription, brandName, foodDescription, packageSize, uom",
  syncMetadata: "id", // Single record with id="current"
});

export type { Product, SyncMetadata };
export { db };