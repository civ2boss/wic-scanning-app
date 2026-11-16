import {
  AlertTriangle,
  Apple,
  Baby,
  Check,
  ChevronDown,
  ChevronRight,
  Egg,
  GlassWater,
  Info,
  Milk,
  Salad,
  Wheat,
  X,
} from "lucide-react";
import { useRef, useState } from "react";
import type { ParticipantType } from "../lib/db";
import {
  getHouseholdCvbTotal,
  PARTICIPANT_CVB_DOLLARS,
  PARTICIPANT_LABELS,
} from "../lib/eligibility";
import type { WicFoodCategory, WicFoodSubCategory } from "../lib/wicFoodsGuide";
import { getCategoryById, WIC_FOODS_GUIDE } from "../lib/wicFoodsGuide";
import { BackLink, EmptyState, SearchField, Sheet } from "./Sheet";

interface WicFoodsGuideProps {
  onClose: () => void;
  initialCategoryId?: string;
  initialSubCategoryId?: string;
  household?: ParticipantType[];
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Milk,
  Apple,
  Egg,
  Wheat,
  Baby,
  GlassWater,
  Salad,
};

function CategoryIcon({
  iconName,
  className,
}: {
  iconName: string;
  className?: string;
}) {
  const Icon = ICON_MAP[iconName];
  if (Icon) return <Icon className={className} />;
  return <Salad className={className} />;
}

function SubCategorySection({
  sub,
  defaultOpen,
}: {
  sub: WicFoodSubCategory;
  defaultOpen: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [showBrands, setShowBrands] = useState(false);

  return (
    <div className="border border-wic-border rounded-2xl overflow-hidden bg-wic-card">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-wic-bg/50 transition-colors"
      >
        <span className="font-semibold text-wic-text text-left">
          {sub.name}
        </span>
        {isOpen ? (
          <ChevronDown className="w-5 h-5 text-wic-text/40" />
        ) : (
          <ChevronRight className="w-5 h-5 text-wic-text/40" />
        )}
      </button>

      {isOpen && (
        <div className="px-4 pb-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          {sub.approved.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                WIC Approved
              </h4>
              <ul className="space-y-1.5">
                {sub.approved.map((item, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-wic-text/80"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {sub.doNotBuy.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-red-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <X className="w-3.5 h-3.5" />
                Do Not Buy
              </h4>
              <ul className="space-y-1.5">
                {sub.doNotBuy.map((item, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-wic-text/80"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {sub.shoppingTips.length > 0 && (
            <div className="bg-wic-yellow/10 border border-wic-yellow/20 rounded-xl p-3">
              <h4
                className="text-xs font-bold text-wic-yellow uppercase tracking-wider mb-2 flex items-center gap-1.5"
                style={{ filter: "brightness(0.7)" }}
              >
                <Info className="w-3.5 h-3.5" />
                Shopping Tips
              </h4>
              <ul className="space-y-1.5">
                {sub.shoppingTips.map((tip, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-wic-text/80"
                  >
                    <span
                      className="text-wic-yellow mt-0.5 shrink-0"
                      style={{ filter: "brightness(0.7)" }}
                    >
                      &#8226;
                    </span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {sub.approvedBrands.length > 0 && (
            <div>
              <button
                onClick={() => setShowBrands(!showBrands)}
                className="flex items-center gap-2 text-xs font-bold text-wic-sage uppercase tracking-wider mb-2 hover:text-wic-sage-dark transition-colors"
              >
                <span>Approved Brands ({sub.approvedBrands.length})</span>
                {showBrands ? (
                  <ChevronDown className="w-3.5 h-3.5" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5" />
                )}
              </button>
              {showBrands && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  {sub.approvedBrands.map((brand, i) => (
                    <div
                      key={i}
                      className="bg-wic-bg rounded-xl p-3 border border-wic-border/50"
                    >
                      <div className="font-semibold text-sm text-wic-text mb-1">
                        {brand.brand}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {brand.products.map((product, j) => (
                          <span
                            key={j}
                            className="text-xs text-wic-text/60 bg-wic-card px-2 py-0.5 rounded-lg border border-wic-border/30"
                          >
                            {product}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function WicFoodsGuide({
  onClose,
  initialCategoryId,
  initialSubCategoryId,
  household = [],
}: WicFoodsGuideProps) {
  const totalCvb = getHouseholdCvbTotal(household);
  const [selectedCategory, setSelectedCategory] =
    useState<WicFoodCategory | null>(() => {
      if (initialCategoryId) return getCategoryById(initialCategoryId) || null;
      return null;
    });
  const [searchQuery, setSearchQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredCategories = searchQuery.trim()
    ? WIC_FOODS_GUIDE.map((cat) => ({
        ...cat,
        subCategories: cat.subCategories.filter(
          (sub) =>
            sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            sub.approved.some((a) =>
              a.toLowerCase().includes(searchQuery.toLowerCase()),
            ) ||
            sub.doNotBuy.some((d) =>
              d.toLowerCase().includes(searchQuery.toLowerCase()),
            ) ||
            sub.approvedBrands.some(
              (b) =>
                b.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
                b.products.some((p) =>
                  p.toLowerCase().includes(searchQuery.toLowerCase()),
                ),
            ),
        ),
      })).filter((cat) => cat.subCategories.length > 0)
    : WIC_FOODS_GUIDE;

  return (
    <Sheet
      title="WIC Foods Guide"
      closeLabel="Close guide"
      onClose={onClose}
      initialFocusRef={inputRef}
      header={
        <SearchField
          inputRef={inputRef}
          value={searchQuery}
          onChange={(value) => {
            setSearchQuery(value);
            setSelectedCategory(null);
          }}
          onClear={() => {
            setSearchQuery("");
            setSelectedCategory(null);
          }}
          placeholder="Search categories, brands, products..."
        />
      }
    >
      {selectedCategory ? (
        /* Category Detail View */
        <div className="max-w-md mx-auto animate-in slide-in-from-right-8 duration-300">
          <BackLink onClick={() => setSelectedCategory(null)}>
            All Categories
          </BackLink>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-wic-sage/10 flex items-center justify-center text-wic-sage border border-wic-sage/20">
              <CategoryIcon
                iconName={selectedCategory.icon}
                className="w-6 h-6"
              />
            </div>
            <h3 className="text-2xl font-serif font-bold text-wic-text">
              {selectedCategory.name}
            </h3>
          </div>

          <div className="space-y-3">
            {selectedCategory.subCategories.map((sub) => (
              <SubCategorySection
                key={sub.id}
                sub={sub}
                defaultOpen={
                  !!initialSubCategoryId && sub.id === initialSubCategoryId
                }
              />
            ))}
          </div>

          <div className="mt-6 p-4 bg-wic-card rounded-2xl border border-wic-border text-xs text-wic-text/60">
            <p className="font-semibold text-wic-text/80 mb-1">Source</p>
            <p>
              Data from the NY WIC Foods Guide. Last updated February 20, 2026.
            </p>
            <a
              href="https://nyswicvendors.com/wic-foods-guide/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-wic-sage hover:text-wic-sage-dark font-medium mt-1 inline-block"
            >
              View official guide &rarr;
            </a>
          </div>
        </div>
      ) : (
        /* Category Grid */
        <div className="space-y-6 pb-8 max-w-7xl w-full mx-auto">
          {!searchQuery && totalCvb > 0 && (
            <div className="bg-wic-sage/10 border border-wic-sage/25 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-wic-sage">
                  Household Cash Value Benefit (CVB)
                </div>
                <div className="text-xs text-wic-text/75 mt-0.5">
                  {household
                    .filter((t) => (PARTICIPANT_CVB_DOLLARS[t] || 0) > 0)
                    .map(
                      (t) =>
                        `${PARTICIPANT_LABELS[t]} (${PARTICIPANT_CVB_DOLLARS[t]})`,
                    )
                    .join(" + ")}
                </div>
              </div>
              <div className="text-lg font-bold text-wic-sage shrink-0">
                ${totalCvb}.00/mo for Fruits & Vegetables
              </div>
            </div>
          )}
          {filteredCategories.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 animate-in fade-in duration-300">
              {filteredCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat)}
                  className="flex flex-col items-center gap-3 p-5 bg-wic-card rounded-2xl border border-wic-border hover:border-wic-sage/40 hover:shadow-md transition-all duration-200 active:scale-[0.97] group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-wic-sage/10 flex items-center justify-center text-wic-sage group-hover:bg-wic-sage/20 transition-colors border border-wic-sage/20">
                    <CategoryIcon iconName={cat.icon} className="w-7 h-7" />
                  </div>
                  <span className="font-semibold text-sm text-wic-text text-center leading-tight group-hover:text-wic-sage transition-colors">
                    {cat.name}
                  </span>
                  <span className="text-[10px] text-wic-text/50">
                    {cat.subCategories.length}{" "}
                    {cat.subCategories.length === 1 ? "item" : "items"}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No matches found"
              icon={<AlertTriangle className="w-8 h-8" />}
            >
              <p className="text-sm text-wic-text/60">
                Try a different search term.
              </p>
            </EmptyState>
          )}

          {/* Quick Reference */}
          {!searchQuery && (
            <div className="bg-wic-card rounded-2xl border border-wic-border p-5">
              <h4 className="text-xs font-bold text-wic-sage uppercase tracking-widest mb-3">
                Quick Reference
              </h4>
              <div className="space-y-2 text-sm text-wic-text/80">
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <span>
                    <strong className="text-emerald-700">Green</strong> items
                    are WIC approved rules
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <X className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                  <span>
                    <strong className="text-red-700">Red</strong> items are Do
                    Not Buy restrictions
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Info
                    className="w-4 h-4 mt-0.5 shrink-0"
                    style={{ color: "#CCA25F" }}
                  />
                  <span>
                    <strong style={{ color: "#CCA25F" }}>Yellow</strong> items
                    are Shopping Tips
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </Sheet>
  );
}
