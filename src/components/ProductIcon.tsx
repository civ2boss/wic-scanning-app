import {
  Apple,
  Baby,
  Bean,
  CakeSlice,
  Carrot,
  Coffee,
  Egg,
  Fish,
  GlassWater,
  Milk,
  Nut,
  Package,
  Salad,
  ShoppingBag,
  Wheat,
} from "lucide-react";

interface ProductIconProps {
  category: string;
  subCategory?: string;
  className?: string;
}

export function ProductIcon({
  category,
  subCategory = "",
  className = "w-6 h-6 text-wic-sage",
}: ProductIconProps) {
  const cat = category.toLowerCase();
  const sub = subCategory.toLowerCase();

  // Combine category and subcategory for robust matching
  const combined = `${cat} ${sub}`;

  if (combined.includes("milk")) {
    return <Milk className={className} />;
  }
  if (combined.includes("cheese")) {
    return <CakeSlice className={className} />; // Lucide has no cheese icon; the wedge reads as one
  }
  if (combined.includes("yogurt") || combined.includes("butter")) {
    return <Coffee className={className} />; // Represents a cup/tub
  }
  if (combined.includes("egg")) {
    return <Egg className={className} />;
  }
  if (
    combined.includes("fish") ||
    combined.includes("salmon") ||
    combined.includes("tuna")
  ) {
    return <Fish className={className} />;
  }
  if (
    combined.includes("bread") ||
    combined.includes("tortilla") ||
    combined.includes("cereal") ||
    combined.includes("wheat") ||
    combined.includes("grain")
  ) {
    return <Wheat className={className} />;
  }
  if (combined.includes("juice")) {
    return <GlassWater className={className} />;
  }
  if (
    combined.includes("fruit") ||
    combined.includes("apple") ||
    combined.includes("banana")
  ) {
    return <Apple className={className} />;
  }
  if (combined.includes("vegetable") || combined.includes("carrot")) {
    return <Carrot className={className} />;
  }
  if (combined.includes("produce") || combined.includes("salad")) {
    return <Salad className={className} />;
  }
  if (
    combined.includes("infant") ||
    combined.includes("baby") ||
    combined.includes("formula")
  ) {
    return <Baby className={className} />;
  }
  if (
    combined.includes("peanut") ||
    combined.includes("nut") ||
    combined.includes("butter")
  ) {
    return <Nut className={className} />;
  }
  if (
    combined.includes("bean") ||
    combined.includes("legume") ||
    combined.includes("peas")
  ) {
    return <Bean className={className} />;
  }
  if (combined.includes("tofu")) {
    return <Package className={className} />;
  }

  // Default fallback icon for generic grocery items
  return <ShoppingBag className={className} />;
}
