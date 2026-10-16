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
    lastSyncedAt: v.optional(v.number()),
  })
    .index("by_upc", ["upc"])
    .index("by_lastSyncedAt", ["lastSyncedAt"]),

  syncMetadata: defineTable({
    lastSyncDate: v.number(),
    totalProducts: v.number(),
    sourceUrl: v.optional(v.string()),
  }),
});
