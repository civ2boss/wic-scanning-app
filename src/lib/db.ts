import { Dexie, type EntityTable } from "dexie";

export type ParticipantType = 
  | 'INFANT_0_6'            // Package I/II - formula only
  | 'INFANT_6_12'          // Package III - baby food + fresh produce sub
  | 'CHILD_1_2'            // Package IV - whole milk, no baby food
  | 'CHILD_2_5'            // Package IV - 1% milk
  | 'PREGNANT'             // Package V
  | 'PARTIALLY_BREASTFEEDING'  // Package VI - partially breastfeeding
  | 'BREASTFEEDING'        // Package VI - fully breastfeeding
  | 'POSTPARTUM';          // Package VII - non-breastfeeding

interface Participant {
  id: string;
  type: ParticipantType;
  name?: string;
  dateOfBirth?: Date;
}

interface UserProfile {
  id: string;
  selectedParticipantId: string | null;
  participants: Participant[];
  updatedAt: Date;
}

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
  userProfile: EntityTable<UserProfile, "id">;
};

// Scheme declaration
db.version(2).stores({
  products: "upc, categoryDescription, subCategoryDescription, brandName, foodDescription, packageSize, uom",
  syncMetadata: "id", // Single record with id="current"
  userProfile: "id, selectedParticipantId",
});

export type { Product, SyncMetadata, Participant, UserProfile };
export type { ParticipantType };
export { db };