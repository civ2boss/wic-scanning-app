import { db } from "./db";

export interface AplCategoryOption {
  /** Canonical key, as produced by `aplCategoryKey`. */
  key: string;
  /** Shopper-readable label. */
  label: string;
}

const LABEL_OVERRIDES: Record<string, string> = {
  "MILK WHOLE": "Milk, Whole",
  "MILK FAT REDUCED": "Milk, Fat Reduced",
  "FRUITS AND VEGETABLES CASH VALUE BENEFIT":
    "Fruits and Vegetables (Cash Value Benefit)",
};

const LOWERCASE_WORDS = new Set(["AND", "OR", "OF", "FOR"]);

/**
 * Canonical key for an APL Category: the spreadsheet's value with whitespace
 * collapsed and upper-cased, so cosmetic variants compare equal.
 */
export function aplCategoryKey(categoryDescription: string): string {
  return categoryDescription.trim().replace(/\s+/g, " ").toUpperCase();
}

function aplCategoryLabel(key: string): string {
  const override = LABEL_OVERRIDES[key];
  if (override) return override;

  return key
    .split(" ")
    .map((word, index) => {
      const ounces = word.match(/^(\d+(?:\.\d+)?)OZ$/);
      if (ounces) return `${ounces[1]} oz`;
      if (index > 0 && LOWERCASE_WORDS.has(word)) return word.toLowerCase();
      return word.charAt(0) + word.slice(1).toLowerCase();
    })
    .join(" ");
}

/** Lists the APL Categories present in the local APL, sorted by label. */
export async function listAplCategories(): Promise<AplCategoryOption[]> {
  const rawCategories = await db.products
    .orderBy("categoryDescription")
    .uniqueKeys();

  const keys = new Set(
    rawCategories
      .map((raw) => aplCategoryKey(String(raw)))
      .filter((key) => key.length > 0),
  );

  return Array.from(keys, (key) => ({
    key,
    label: aplCategoryLabel(key),
  })).sort((a, b) => a.label.localeCompare(b.label));
}
