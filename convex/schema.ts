import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  products: defineTable({
    upc: v.string(),
    categoryDescription: v.string(),
    subCategoryDescription: v.string(),
    brandName: v.string(),
    foodDescription: v.string(),
    packageSize: v.string(),
    uom: v.string(),
  }).index("by_upc", ["upc"]),

  syncMetadata: defineTable({
    lastSyncDate: v.number(), // Storing as timestamp (ms)
    totalProducts: v.number(),
  }),
});

