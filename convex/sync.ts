import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";

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
    let processed = 0;
    let inserted = 0;
    let updated = 0;
    
    for (const product of args.products) {
      try {
        const existing = await ctx.db
          .query("products")
          .withIndex("by_upc", (q) => q.eq("upc", product.upc))
          .first();

        if (existing) {
          await ctx.db.patch(existing._id, product);
          updated++;
        } else {
          await ctx.db.insert("products", product);
          inserted++;
        }
        processed++;
      } catch (error) {
        console.error(`Error processing product ${product.upc}:`, error);
        throw error;
      }
    }
    
    console.log(`bulkUpsertProducts: processed ${processed}, inserted ${inserted}, updated ${updated}`);
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

// Modified to support pagination to avoid "Array length is too long" error
export const getProductsPaginated = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    return await ctx.db.query("products").order("asc").paginate(args.paginationOpts);
  },
});

// Kept for backward compatibility if needed, but limited
export const getAllProducts = query({
  args: {},
  handler: async (ctx) => {
    // Warning: This limit is here to prevent crashing. Use getProductsPaginated for full sync.
    return await ctx.db.query("products").take(8000);
  },
});
