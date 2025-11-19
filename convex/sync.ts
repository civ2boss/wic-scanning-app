import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// === Mutations ===

export const bulkUpsertProducts = mutation({
  args: {
    products: v.array(
      v.object({
        upc: v.string(),
        categoryDescription: v.string(),
        subCategoryDescription: v.string(),
        brandName: v.string(),
        foodDescription: v.string(),
        packageSize: v.string(),
        uom: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    for (const product of args.products) {
      const existing = await ctx.db
        .query("products")
        .withIndex("by_upc", (q) => q.eq("upc", product.upc))
        .first();

      if (existing) {
        await ctx.db.patch(existing._id, product);
      } else {
        await ctx.db.insert("products", product);
      }
    }
  },
});

export const updateSyncMetadata = mutation({
  args: {
    totalProducts: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("syncMetadata").first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        lastSyncDate: Date.now(),
        totalProducts: args.totalProducts,
      });
    } else {
      await ctx.db.insert("syncMetadata", {
        lastSyncDate: Date.now(),
        totalProducts: args.totalProducts,
      });
    }
  },
});

// === Queries ===

export const getSyncMetadata = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("syncMetadata").first();
  },
});

export const getAllProducts = query({
  args: {},
  handler: async (ctx) => {
    // Warning: This might return a lot of data if the database grows large.
    // For initial sync, this is fine, but consider pagination for larger datasets.
    return await ctx.db.query("products").collect();
  },
});
