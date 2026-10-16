import { Dexie, type EntityTable } from "dexie";

export type ParticipantType =
  | "INFANT_0_6" // Package I/II - infant formula only
  | "INFANT_6_12" // Package II/III - infant formula, infant cereal, baby foods, $22 CVB
  | "CHILD_1_2" // Package IV-A - whole milk, whole yogurt, $27 CVB
  | "CHILD_2_5" // Package IV-B - 1%/nonfat milk, lowfat/nonfat yogurt, $27 CVB
  | "PREGNANT" // Package V - $48 CVB
  | "PARTIALLY_BREASTFEEDING" // Package V/VI - $53 CVB
  | "BREASTFEEDING" // Package VI - $53 CVB
  | "POSTPARTUM"; // Package VII - non-breastfeeding, $48 CVB

export type Household = ParticipantType[];

export const PARTICIPANT_LABELS: Record<ParticipantType, string> = {
  INFANT_0_6: "Infant (0-6 months)",
  INFANT_6_12: "Infant (6-12 months)",
  CHILD_1_2: "Child (1-2 years)",
  CHILD_2_5: "Child (2-5 years)",
  PREGNANT: "Pregnant",
  PARTIALLY_BREASTFEEDING: "Partially Breastfeeding",
  BREASTFEEDING: "Fully Breastfeeding",
  POSTPARTUM: "Postpartum (not breastfeeding)",
};

export const ALL_PARTICIPANT_TYPES: readonly ParticipantType[] = [
  "INFANT_0_6",
  "INFANT_6_12",
  "CHILD_1_2",
  "CHILD_2_5",
  "PREGNANT",
  "PARTIALLY_BREASTFEEDING",
  "BREASTFEEDING",
  "POSTPARTUM",
];

export const HOUSEHOLD_STORAGE_KEY = "wic-household";
export const LEGACY_PARTICIPANT_STORAGE_KEY = "wic-participant";

export function isValidParticipantType(value: unknown): value is ParticipantType {
  return (
    typeof value === "string" &&
    (ALL_PARTICIPANT_TYPES as readonly string[]).includes(value)
  );
}

/**
 * Loads the device-local Household (ParticipantType[]) from localStorage,
 * migrating seamlessly from the legacy single "wic-participant" key if present.
 */
export function loadHousehold(): Household {
  if (typeof window === "undefined" || !window.localStorage) {
    return [];
  }

  const rawHousehold = localStorage.getItem(HOUSEHOLD_STORAGE_KEY);
  if (rawHousehold) {
    try {
      const parsed = JSON.parse(rawHousehold);
      if (Array.isArray(parsed)) {
        return Array.from(new Set(parsed.filter(isValidParticipantType)));
      }
    } catch {
      // Fall through to legacy key
    }
  }

  const legacy = localStorage.getItem(LEGACY_PARTICIPANT_STORAGE_KEY);
  if (legacy) {
    if (isValidParticipantType(legacy)) {
      return [legacy];
    }
    try {
      const parsed = JSON.parse(legacy);
      if (Array.isArray(parsed)) {
        return Array.from(new Set(parsed.filter(isValidParticipantType)));
      }
    } catch {
      // Ignore invalid legacy value
    }
  }

  return [];
}

/**
 * Saves the device-local Household (ParticipantType[]) to localStorage.
 */
export function saveHousehold(household: Household): void {
  if (typeof window === "undefined" || !window.localStorage) {
    return;
  }

  const unique = Array.from(new Set(household.filter(isValidParticipantType)));
  if (unique.length === 0) {
    localStorage.removeItem(HOUSEHOLD_STORAGE_KEY);
    localStorage.removeItem(LEGACY_PARTICIPANT_STORAGE_KEY);
  } else {
    localStorage.setItem(HOUSEHOLD_STORAGE_KEY, JSON.stringify(unique));
    localStorage.setItem(LEGACY_PARTICIPANT_STORAGE_KEY, unique[0]);
  }
}

export interface Product {
  upc: string;
  categoryDescription: string;
  subCategoryDescription: string;
  brandName: string;
  foodDescription: string;
  packageSize: string;
  uom: string;
}

export interface SyncMetadata {
  id: "current";
  lastSyncDate: Date;
  totalProducts: number;
}

const db = new Dexie("ProductsDatabase") as Dexie & {
  products: EntityTable<Product, "upc">;
  syncMetadata: EntityTable<SyncMetadata, "id">;
};

db.version(3).stores({
  products:
    "upc, categoryDescription, subCategoryDescription, brandName, foodDescription, packageSize, uom",
  syncMetadata: "id",
  userProfile: null, // Drop unused legacy table
});

export { db };
