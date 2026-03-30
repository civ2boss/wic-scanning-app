import { useState, useRef, useEffect } from 'react';
import { WIC_FOODS_GUIDE, getCategoryById } from '../lib/wicFoodsGuide';
import type { WicFoodCategory, WicFoodSubCategory } from '../lib/wicFoodsGuide';
import {
  Milk, Apple, Egg, Wheat, Baby, GlassWater, Salad,
  ChevronRight, ChevronDown, X, Search, Check, AlertTriangle, Info
} from 'lucide-react';

interface WicFoodsGuideProps {
  onClose: () => void;
  initialCategoryId?: string;
  initialSubCategoryId?: string;
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

function CategoryIcon({ iconName, className }: { iconName: string; className?: string }) {
  const Icon = ICON_MAP[iconName];
  if (Icon) return <Icon className={className} />;
  return <Salad className={className} />;
}

function SubCategorySection({ sub, defaultOpen }: { sub: WicFoodSubCategory; defaultOpen: boolean }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [showBrands, setShowBrands] = useState(false);

  return (
    <div className="border border-wic-border rounded-2xl overflow-hidden bg-wic-card">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-wic-bg/50 transition-colors"
      >
        <span className="font-semibold text-wic-text text-left">{sub.name}</span>
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
                  <li key={i} className="flex items-start gap-2 text-sm text-wic-text/80">
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
                  <li key={i} className="flex items-start gap-2 text-sm text-wic-text/80">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {sub.shoppingTips.length > 0 && (
            <div className="bg-wic-yellow/10 border border-wic-yellow/20 rounded-xl p-3">
              <h4 className="text-xs font-bold text-wic-yellow uppercase tracking-wider mb-2 flex items-center gap-1.5" style={{ filter: 'brightness(0.7)' }}>
                <Info className="w-3.5 h-3.5" />
                Shopping Tips
              </h4>
              <ul className="space-y-1.5">
                {sub.shoppingTips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-wic-text/80">
                    <span className="text-wic-yellow mt-0.5 shrink-0" style={{ filter: 'brightness(0.7)' }}>&#8226;</span>
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
                    <div key={i} className="bg-wic-bg rounded-xl p-3 border border-wic-border/50">
                      <div className="font-semibold text-sm text-wic-text mb-1">{brand.brand}</div>
                      <div className="flex flex-wrap gap-1">
                        {brand.products.map((product, j) => (
                          <span key={j} className="text-xs text-wic-text/60 bg-wic-card px-2 py-0.5 rounded-lg border border-wic-border/30">
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

export function WicFoodsGuide({ onClose, initialCategoryId, initialSubCategoryId }: WicFoodsGuideProps) {
  const [selectedCategory, setSelectedCategory] = useState<WicFoodCategory | null>(() => {
    if (initialCategoryId) return getCategoryById(initialCategoryId) || null;
    return null;
  });
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timeout);
  }, []);

  const filteredCategories = searchQuery.trim()
    ? WIC_FOODS_GUIDE.map(cat => ({
        ...cat,
        subCategories: cat.subCategories.filter(sub =>
          sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          sub.approved.some(a => a.toLowerCase().includes(searchQuery.toLowerCase())) ||
          sub.doNotBuy.some(d => d.toLowerCase().includes(searchQuery.toLowerCase())) ||
          sub.approvedBrands.some(b =>
            b.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
            b.products.some(p => p.toLowerCase().includes(searchQuery.toLowerCase()))
          )
        ),
      })).filter(cat => cat.subCategories.length > 0)
    : WIC_FOODS_GUIDE;

  return (
    <div className="fixed inset-0 z-50 bg-wic-bg/95 backdrop-blur-md flex flex-col animate-in slide-in-from-bottom-full duration-300 shadow-2xl overflow-hidden text-wic-text">
      {/* Header */}
      <div className="pt-12 pb-4 px-6 bg-wic-card shadow-sm border-b border-wic-border flex flex-col gap-4 relative z-20 shrink-0 rounded-b-[2rem]">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-serif font-bold text-wic-sage">WIC Foods Guide</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center bg-wic-bg rounded-full text-wic-text/60 hover:text-wic-text hover:bg-wic-border transition-colors active:scale-95"
            aria-label="Close guide"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-wic-text/40" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSelectedCategory(null);
            }}
            placeholder="Search categories, brands, products..."
            className="w-full pl-12 pr-12 py-4 bg-wic-bg border-2 border-wic-border focus:border-wic-sage rounded-2xl outline-none text-base placeholder:text-wic-text/40 font-medium transition-colors shadow-inner drop-shadow-sm"
          />
          {searchQuery.length > 0 && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory(null);
                inputRef.current?.focus();
              }}
              className="absolute inset-y-0 right-4 flex items-center justify-center text-wic-text/40 hover:text-wic-text/80 transition-colors"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto z-10 p-6 bg-wic-bg relative">
        {selectedCategory ? (
          /* Category Detail View */
          <div className="max-w-md mx-auto animate-in slide-in-from-right-8 duration-300">
            <button
              onClick={() => setSelectedCategory(null)}
              className="flex items-center gap-2 text-sm font-semibold text-wic-text/60 hover:text-wic-text mb-6 pl-1 transition-colors w-max"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"></path><path d="M12 19l-7-7 7-7"></path></svg>
              All Categories
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-wic-sage/10 flex items-center justify-center text-wic-sage border border-wic-sage/20">
                <CategoryIcon iconName={selectedCategory.icon} className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-serif font-bold text-wic-text">{selectedCategory.name}</h3>
            </div>

            <div className="space-y-3">
              {selectedCategory.subCategories.map(sub => (
                <SubCategorySection
                  key={sub.id}
                  sub={sub}
                  defaultOpen={!!initialSubCategoryId && sub.id === initialSubCategoryId}
                />
              ))}
            </div>

            <div className="mt-6 p-4 bg-wic-card rounded-2xl border border-wic-border text-xs text-wic-text/60">
              <p className="font-semibold text-wic-text/80 mb-1">Source</p>
              <p>Data from the NY WIC Foods Guide. Last updated February 20, 2026.</p>
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
            {filteredCategories.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 animate-in fade-in duration-300">
                {filteredCategories.map(cat => (
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
                      {cat.subCategories.length} {cat.subCategories.length === 1 ? 'item' : 'items'}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                <div className="w-16 h-16 bg-wic-terracotta/10 text-wic-terracotta rounded-full flex items-center justify-center mb-2">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <h3 className="font-semibold text-wic-text text-lg">No matches found</h3>
                <p className="text-sm text-wic-text/60">Try a different search term.</p>
              </div>
            )}

            {/* Quick Reference */}
            {!searchQuery && (
              <div className="bg-wic-card rounded-2xl border border-wic-border p-5">
                <h4 className="text-xs font-bold text-wic-sage uppercase tracking-widest mb-3">Quick Reference</h4>
                <div className="space-y-2 text-sm text-wic-text/80">
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <span><strong className="text-emerald-700">Green</strong> items are WIC approved rules</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <X className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                    <span><strong className="text-red-700">Red</strong> items are Do Not Buy restrictions</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#CCA25F' }} />
                    <span><strong style={{ color: '#CCA25F' }}>Yellow</strong> items are Shopping Tips</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
