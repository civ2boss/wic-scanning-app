import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const participantType = v.union(
  v.literal("INFANT_0_6"),
  v.literal("INFANT_6_12"),
  v.literal("CHILD_1_2"),
  v.literal("CHILD_2_5"),
  v.literal("PREGNANT"),
  v.literal("PARTIALLY_BREASTFEEDING"),
  v.literal("BREASTFEEDING"),
  v.literal("POSTPARTUM")
);

export const participant = v.object({
  id: v.string(),
  type: participantType,
  name: v.optional(v.string()),
  dateOfBirth: v.optional(v.number()),
});

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
    lastSyncDate: v.number(),
    totalProducts: v.number(),
  }),

  userProfile: defineTable({
    selectedParticipantId: v.optional(v.string()),
    participants: v.array(participant),
    updatedAt: v.number(),
  }).index("by_selectedParticipant", ["selectedParticipantId"]),
});

