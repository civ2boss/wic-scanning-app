import { useCallback, useEffect, useRef, useState } from "react";
import {
  type AplCategoryOption,
  listAplCategories,
} from "../lib/aplCategories";
import type { Household, Product } from "../lib/db";
import {
  type ProductSearchCriteria,
  searchProducts,
} from "../lib/productLookup";
import { productDisplayName } from "../lib/productName";
import { productVerdict } from "../lib/productVerdict";
import { ProductIcon } from "./ProductIcon";
import { ProductVerdict, VerdictBadge } from "./ProductVerdict";
import { BackLink, EmptyState, SearchField, Sheet } from "./Sheet";

interface ProductSearchModalProps {
  onClose: () => void;
  household: Household;
}

export function ProductSearchModal({
  onClose,
  household,
}: ProductSearchModalProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState<AplCategoryOption[]>([]);
  const [isBrowsing, setIsBrowsing] = useState(false);
  const [results, setResults] = useState<Product[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [matchCount, setMatchCount] = useState(0);
  const [page, setPage] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [eligibleOnly, setEligibleOnly] = useState(false);

  const [productImage, setProductImage] = useState<string | null | "loading">(
    null,
  );

  const inputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<number | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listAplCategories()
      .then(setCategories)
      .catch((error) => console.error("Failed to load categories:", error));
  }, []);

  const trimmedQuery = query.trim();
  const isListing = trimmedQuery.length > 0 || category !== "" || isBrowsing;
  // Bumped whenever the criteria change so responses to stale searches are dropped.
  const searchGenerationRef = useRef(0);

  const buildCriteria = useCallback(
    (): ProductSearchCriteria => ({
      text: trimmedQuery,
      category: category || null,
      household: eligibleOnly ? household : [],
    }),
    [trimmedQuery, category, eligibleOnly, household],
  );

  // Handle autocomplete search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      window.clearTimeout(searchTimeoutRef.current);
    }
    const generation = ++searchGenerationRef.current;

    if (!isListing) {
      setResults([]);
      setTotalResults(0);
      setMatchCount(0);
      setPage(0);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    // Debounce search requests
    searchTimeoutRef.current = window.setTimeout(async () => {
      try {
        const { products, totalCount, matchCount } = await searchProducts(
          buildCriteria(),
          30,
          0,
        );
        if (generation !== searchGenerationRef.current) return;
        setResults(products);
        setTotalResults(totalCount);
        setMatchCount(matchCount);
        setPage(0);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        if (generation === searchGenerationRef.current) {
          setIsSearching(false);
        }
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        window.clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [isListing, buildCriteria]);

  // Handle infinite scroll loading
  const loadMore = useCallback(async () => {
    if (isLoadingMore || results.length >= totalResults) return;

    setIsLoadingMore(true);
    const nextPage = page + 1;
    const generation = searchGenerationRef.current;

    try {
      const { products } = await searchProducts(
        buildCriteria(),
        30,
        nextPage * 30,
      );
      if (generation !== searchGenerationRef.current) return;
      setResults((prev) => [...prev, ...products]);
      setPage(nextPage);
    } catch (error) {
      console.error("Load more error:", error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, results.length, totalResults, page, buildCriteria]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
    // Load more when user scrolls to within 1.5 screen lengths of the bottom
    if (scrollHeight - scrollTop <= clientHeight * 1.5) {
      loadMore();
    }
  };

  // Auto-load more if results don't fill the container enough to trigger a scroll
  useEffect(() => {
    if (
      !isLoadingMore &&
      !isSearching &&
      results.length > 0 &&
      results.length < totalResults
    ) {
      const container = scrollContainerRef.current;
      if (container && container.scrollHeight <= container.clientHeight * 1.5) {
        // Small timeout ensures DOM painted the previous set of results
        const timer = setTimeout(() => {
          loadMore();
        }, 100);
        return () => clearTimeout(timer);
      }
    }
  }, [results, isLoadingMore, isSearching, totalResults, loadMore]);

  // Fetch product image when a product is selected
  useEffect(() => {
    if (selectedProduct) {
      setProductImage("loading");
      fetch(
        `https://world.openfoodfacts.org/api/v0/product/${selectedProduct.upc}.json`,
      )
        .then((res) => res.json())
        .then((data) => {
          if (data.status === 1 && data.product && data.product.image_url) {
            setProductImage(data.product.image_url);
          } else {
            setProductImage(null);
          }
        })
        .catch((err) => {
          console.error("Failed to fetch product image:", err);
          setProductImage(null);
        });
    } else {
      setProductImage(null);
    }
  }, [selectedProduct]);

  return (
    <Sheet
      title="Search Products"
      closeLabel="Close search"
      onClose={onClose}
      initialFocusRef={inputRef}
      bodyRef={scrollContainerRef}
      onBodyScroll={handleScroll}
      header={
        <>
          <SearchField
            inputRef={inputRef}
            value={query}
            onChange={(value) => {
              setQuery(value);
              setSelectedProduct(null); // Clear selection on new typing
              // Additional state reset for rapid typing before debounce fires
              setResults([]);
              setTotalResults(0);
              setPage(0);
            }}
            onClear={() => {
              setQuery("");
              setSelectedProduct(null);
            }}
            placeholder="Type product name or brand..."
          />
          <label className="flex items-center gap-3 px-1 text-sm font-medium text-wic-text/80">
            Category
            <div className="relative flex-1 min-w-0">
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setSelectedProduct(null);
                }}
                className="w-full appearance-none pl-4 pr-11 py-2.5 bg-wic-bg border-2 border-wic-border focus:border-wic-sage rounded-xl outline-none text-base text-wic-text font-medium transition-colors cursor-pointer"
              >
                <option value="">All</option>
                {categories.map((option) => (
                  <option key={option.key} value={option.key}>
                    {option.label}
                  </option>
                ))}
              </select>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-wic-text/50 pointer-events-none"
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
          </label>

          {/* Filter Toggle */}
          {household.length > 0 && (
            <div className="flex items-center gap-2 mt-1 px-1">
              <label className="flex items-center gap-2.5 cursor-pointer text-sm font-medium text-wic-text/80 hover:text-wic-text transition-colors">
                <input
                  type="checkbox"
                  checked={eligibleOnly}
                  onChange={(e) => setEligibleOnly(e.target.checked)}
                  className="w-4 h-4 rounded border-wic-border text-wic-sage focus:ring-wic-sage/30 bg-wic-bg drop-shadow-sm cursor-pointer"
                />
                Show WIC eligible only
              </label>
            </div>
          )}
        </>
      }
    >
      {!selectedProduct ? (
        <div className="space-y-3 pb-8 max-w-7xl w-full mx-auto">
          {isSearching ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4 animate-pulse">
              <div className="w-8 h-8 rounded-full border-4 border-wic-sage/30 border-t-wic-sage animate-spin"></div>
              <p className="text-wic-text/50 font-medium">
                Searching products...
              </p>
            </div>
          ) : !isListing ? (
            <EmptyState
              tone="sage"
              title="Find a Product"
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              }
            >
              <p className="text-sm text-wic-text/70 max-w-[250px]">
                Search by name, brand or UPC, or pick a category.
              </p>
              <button
                type="button"
                onClick={() => setIsBrowsing(true)}
                className="mt-3 px-5 py-2.5 rounded-xl bg-wic-sage text-white text-sm font-semibold shadow-sm hover:bg-wic-sage/90 transition-colors active:scale-95"
              >
                {eligibleOnly
                  ? "Browse all eligible products"
                  : "Browse all products"}
              </button>
            </EmptyState>
          ) : results.length > 0 ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              <h3 className="text-xs font-bold text-wic-sage uppercase tracking-widest mb-4 ml-1 flex items-center gap-2">
                {totalResults} Results
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-4">
                {results.map((item) => {
                  return (
                    <button
                      key={item.upc}
                      onClick={() => setSelectedProduct(item)}
                      className="text-left w-full bg-wic-card p-4 rounded-2xl border border-wic-border hover:border-wic-sage/40 hover:shadow-md transition-all duration-200 active:scale-[0.98] group flex flex-col items-start gap-2 h-full"
                    >
                      <div className="flex items-start gap-3 w-full mb-3">
                        <div className="w-12 h-12 shrink-0 bg-wic-sage/10 rounded-xl flex items-center justify-center border border-wic-sage/20 text-wic-sage">
                          <ProductIcon
                            category={item.categoryDescription}
                            subCategory={item.subCategoryDescription}
                            className="w-7 h-7"
                          />
                        </div>
                        <div className="flex-1 w-full min-w-0">
                          <div className="font-semibold text-wic-text text-[14px] leading-snug mb-1 line-clamp-2 group-hover:text-wic-sage transition-colors">
                            {productDisplayName(item)}
                          </div>
                          <div className="text-[11px] text-wic-text/60 line-clamp-1">
                            {item.categoryDescription} • {item.packageSize}{" "}
                            {item.uom}
                          </div>
                        </div>
                      </div>

                      <div className="w-full flex justify-between items-end mt-auto">
                        <div>
                          <VerdictBadge
                            status={productVerdict(item, household).status}
                          />
                        </div>
                        <div className="w-7 h-7 rounded-full bg-wic-bg flex items-center justify-center text-wic-sage group-hover:bg-wic-sage/10 transition-colors shrink-0">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M9 18l6-6-6-6"></path>
                          </svg>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              {isLoadingMore && (
                <div className="py-6 flex justify-center">
                  <div className="w-6 h-6 rounded-full border-2 border-wic-sage/30 border-t-wic-sage animate-spin"></div>
                </div>
              )}
            </div>
          ) : (
            <EmptyState
              title={
                eligibleOnly && matchCount > 0
                  ? "No eligible products"
                  : "No matches found"
              }
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
              }
            >
              {eligibleOnly && matchCount > 0 ? (
                <p className="text-sm text-wic-text/60 max-w-[280px]">
                  {matchCount}{" "}
                  {matchCount === 1 ? "product matches" : "products match"}, but
                  none are eligible for your household. Uncheck "Show WIC
                  eligible only" to see {matchCount === 1 ? "it" : "them"}.
                </p>
              ) : (
                <p className="text-sm text-wic-text/60">
                  Try checking your spelling or using fewer words.
                </p>
              )}
            </EmptyState>
          )}
        </div>
      ) : (
        /* Selected Product Detail Card */
        <div className="max-w-md mx-auto h-full flex flex-col justify-start pt-6 mb-10 pb-8 animate-in slide-in-from-right-8 duration-300">
          <BackLink onClick={() => setSelectedProduct(null)}>
            Back to results
          </BackLink>

          <ProductVerdict
            key={selectedProduct.upc}
            verdict={productVerdict(selectedProduct, household)}
            variant="card"
          >
            {/* Product Image / Icon Fallback */}
            <div className="w-full flex justify-center mb-2">
              {productImage === "loading" ? (
                <div className="w-32 h-32 bg-wic-sage/5 rounded-2xl flex items-center justify-center animate-pulse border border-wic-sage/10">
                  <ProductIcon
                    category={selectedProduct.categoryDescription}
                    subCategory={selectedProduct.subCategoryDescription}
                    className="w-16 h-16 text-wic-sage/20"
                  />
                </div>
              ) : productImage ? (
                <div className="w-32 h-32 rounded-2xl bg-white border border-wic-border overflow-hidden flex items-center justify-center p-2 shadow-sm drop-shadow-sm">
                  <img
                    src={productImage}
                    alt={selectedProduct.foodDescription}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              ) : (
                <div className="w-32 h-32 bg-wic-sage/10 rounded-2xl flex flex-col items-center justify-center border border-wic-sage/20 text-wic-sage shadow-inner">
                  <ProductIcon
                    category={selectedProduct.categoryDescription}
                    subCategory={selectedProduct.subCategoryDescription}
                    className="w-14 h-14 opacity-80"
                  />
                </div>
              )}
            </div>

            <div>
              <h3 className="text-2xl font-bold text-wic-text leading-tight mb-2">
                {productDisplayName(selectedProduct)}
              </h3>
              <div className="inline-flex space-x-2 flex-wrap gap-y-2">
                <span className="px-2.5 py-1 bg-wic-bg border border-wic-border rounded-lg text-xs font-semibold text-wic-text/70">
                  {selectedProduct.packageSize} {selectedProduct.uom}
                </span>
                <span className="px-2.5 py-1 bg-wic-bg border border-wic-border rounded-lg text-xs font-mono text-wic-text/60">
                  UPC: {selectedProduct.upc}
                </span>
              </div>
            </div>

            <div className="bg-wic-bg/50 p-4 rounded-xl border border-wic-border/50 text-sm flex flex-col gap-1.5 mt-2">
              <div className="flex justify-between">
                <span className="text-wic-text/50 font-medium">Category</span>
                <span className="text-wic-text font-semibold text-right">
                  {selectedProduct.categoryDescription}
                </span>
              </div>
              <div className="w-full h-px bg-wic-border/50 my-1"></div>
              <div className="flex justify-between">
                <span className="text-wic-text/50 font-medium">
                  Sub-Category
                </span>
                <span className="text-wic-text font-semibold text-right">
                  {selectedProduct.subCategoryDescription}
                </span>
              </div>
            </div>
          </ProductVerdict>
        </div>
      )}
    </Sheet>
  );
}
