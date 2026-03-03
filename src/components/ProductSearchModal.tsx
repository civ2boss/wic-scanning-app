import { useState, useEffect, useRef, useCallback } from 'react';
import { searchProducts } from '../lib/productLookup';
import { checkEligibility } from '../lib/eligibility';
import type { Product, ParticipantType } from '../lib/db';
import { ProductIcon } from './ProductIcon';

interface ProductSearchModalProps {
  onClose: () => void;
  selectedParticipant: ParticipantType | null;
}

export function ProductSearchModal({ onClose, selectedParticipant }: ProductSearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [page, setPage] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  const [eligibleOnly, setEligibleOnly] = useState(false);
  
  const [isEligible, setIsEligible] = useState<boolean | null>(null);
  const [eligibilityReason, setEligibilityReason] = useState<string | null>(null);
  
  const [productImage, setProductImage] = useState<string | null | 'loading'>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<number | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-focus input on mount
  useEffect(() => {
    // Small delay to ensure modal is rendered
    const timeout = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timeout);
  }, []);

  // Handle autocomplete search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      window.clearTimeout(searchTimeoutRef.current);
    }

    const trimmedQuery = query.trim();
    if (trimmedQuery.length === 0) {
      setResults([]);
      setTotalResults(0);
      setPage(0);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    
    // Debounce search requests
    searchTimeoutRef.current = window.setTimeout(async () => {
      try {
        const { products, totalCount } = await searchProducts(
           trimmedQuery, 
           30, 
           0, 
           eligibleOnly ? selectedParticipant : null
        );
        setResults(products);
        setTotalResults(totalCount);
        setPage(0);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        window.clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query, eligibleOnly, selectedParticipant]);

  // Handle infinite scroll loading
  const loadMore = useCallback(async () => {
    if (isLoadingMore || results.length >= totalResults) return;
    
    setIsLoadingMore(true);
    const nextPage = page + 1;
    
    try {
      const trimmedQuery = query.trim();
      const { products } = await searchProducts(
        trimmedQuery, 
        30, 
        nextPage * 30, 
        eligibleOnly ? selectedParticipant : null
      );
      setResults(prev => [...prev, ...products]);
      setPage(nextPage);
    } catch (error) {
      console.error("Load more error:", error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, results.length, totalResults, page, query, eligibleOnly, selectedParticipant]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
    // Load more when user scrolls to within 1.5 screen lengths of the bottom
    if (scrollHeight - scrollTop <= clientHeight * 1.5) {
       loadMore();
    }
  };

  // Auto-load more if results don't fill the container enough to trigger a scroll
  useEffect(() => {
    if (!isLoadingMore && !isSearching && results.length > 0 && results.length < totalResults) {
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

  // Check eligibility when a product is selected
  useEffect(() => {
    if (selectedProduct) {
      if (selectedParticipant) {
        const eligibility = checkEligibility(
          selectedProduct.categoryDescription,
          selectedProduct.subCategoryDescription,
          selectedParticipant
        );
        setIsEligible(eligibility.eligible);
        setEligibilityReason(eligibility.reason || null);
      } else {
        setIsEligible(null);
        setEligibilityReason(null);
      }
    } else {
      setIsEligible(null);
      setEligibilityReason(null);
    }
  }, [selectedProduct, selectedParticipant]);

  // Fetch product image when a product is selected
  useEffect(() => {
    if (selectedProduct) {
      setProductImage('loading');
      fetch(`https://world.openfoodfacts.org/api/v0/product/${selectedProduct.upc}.json`)
        .then(res => res.json())
        .then(data => {
          if (data.status === 1 && data.product && data.product.image_url) {
            setProductImage(data.product.image_url);
          } else {
            setProductImage(null);
          }
        })
        .catch(err => {
          console.error("Failed to fetch product image:", err);
          setProductImage(null);
        });
    } else {
      setProductImage(null);
    }
  }, [selectedProduct]);

  return (
    <div className="fixed inset-0 z-50 bg-wic-bg/95 backdrop-blur-md flex flex-col animate-in slide-in-from-bottom-full duration-300 shadow-2xl overflow-hidden text-wic-text">
      {/* Header / Search Bar */}
      <div className="pt-12 pb-4 px-6 bg-wic-card shadow-sm border-b border-wic-border flex flex-col gap-4 relative z-20 shrink-0 rounded-b-[2rem]">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-serif font-bold text-wic-sage">Search Products</h2>
          <button 
             onClick={onClose}
             className="w-10 h-10 flex items-center justify-center bg-wic-bg rounded-full text-wic-text/60 hover:text-wic-text hover:bg-wic-border transition-colors active:scale-95"
             aria-label="Close search"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div className="relative">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-wic-text/40">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedProduct(null); // Clear selection on new typing
              // Additional state reset for rapid typing before debounce fires
              setResults([]);
              setTotalResults(0);
              setPage(0);
            }}
            placeholder="Type product name or brand..."
            className="w-full pl-12 pr-12 py-4 bg-wic-bg border-2 border-wic-border focus:border-wic-sage rounded-2xl outline-none text-base placeholder:text-wic-text/40 font-medium transition-colors shadow-inner drop-shadow-sm"
          />
          {query.length > 0 && (
            <button
              onClick={() => {
                setQuery('');
                setSelectedProduct(null);
                inputRef.current?.focus();
              }}
              className="absolute inset-y-0 right-4 flex items-center justify-center text-wic-text/40 hover:text-wic-text/80 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
              </svg>
            </button>
          )}
        </div>
        
        {/* Filter Toggle */}
        {selectedParticipant && (
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
      </div>

      {/* Results Area */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto z-10 p-6 bg-wic-bg relative"
        onScroll={handleScroll}
      >
        {!selectedProduct ? (
          <div className="space-y-3 pb-8 max-w-7xl w-full mx-auto">
            {isSearching ? (
              <div className="flex flex-col items-center justify-center py-12 gap-4 animate-pulse">
                <div className="w-8 h-8 rounded-full border-4 border-wic-sage/30 border-t-wic-sage animate-spin"></div>
                <p className="text-wic-text/50 font-medium">Searching products...</p>
              </div>
            ) : query.trim().length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-center opacity-60">
                <div className="w-16 h-16 bg-wic-sage/10 text-wic-sage rounded-full flex items-center justify-center mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                </div>
                <h3 className="font-semibold text-wic-text text-lg">Find a Product</h3>
                <p className="text-sm text-wic-text/70 max-w-[250px]">Start typing to manually search for products in the WIC database.</p>
              </div>
            ) : results.length > 0 ? (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                <h3 className="text-xs font-bold text-wic-sage uppercase tracking-widest mb-4 ml-1 flex items-center gap-2">
                   {totalResults} Results
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-4">
                  {results.map((item) => {
                    let isItemEligible: boolean | null = null;
                    if (selectedParticipant) {
                      isItemEligible = checkEligibility(
                        item.categoryDescription,
                        item.subCategoryDescription,
                        selectedParticipant
                      ).eligible;
                    }
                    
                    return (
                    <button
                      key={item.upc}
                      onClick={() => setSelectedProduct(item)}
                      className="text-left w-full bg-wic-card p-4 rounded-2xl border border-wic-border hover:border-wic-sage/40 hover:shadow-md transition-all duration-200 active:scale-[0.98] group flex flex-col items-start gap-2 h-full"
                    >
                      <div className="flex items-start gap-3 w-full mb-3">
                        <div className="w-12 h-12 shrink-0 bg-wic-sage/10 rounded-xl flex items-center justify-center border border-wic-sage/20 text-wic-sage">
                          <ProductIcon category={item.categoryDescription} subCategory={item.subCategoryDescription} className="w-7 h-7" />
                        </div>
                        <div className="flex-1 w-full min-w-0">
                          <div className="font-semibold text-wic-text text-[14px] leading-snug mb-1 line-clamp-2 group-hover:text-wic-sage transition-colors">
                            {item.brandName} {item.foodDescription}
                          </div>
                          <div className="text-[11px] text-wic-text/60 line-clamp-1">
                            {item.categoryDescription} • {item.packageSize} {item.uom}
                          </div>
                        </div>
                      </div>
                      
                      <div className="w-full flex justify-between items-end mt-auto">
                        <div>
                          {isItemEligible === true && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200/50">
                              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                              APPROVED
                            </span>
                          )}
                          {isItemEligible === false && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-200/50">
                              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                              NOT ELIGIBLE
                            </span>
                          )}
                        </div>
                        <div className="w-7 h-7 rounded-full bg-wic-bg flex items-center justify-center text-wic-sage group-hover:bg-wic-sage/10 transition-colors shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"></path></svg>
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
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                <div className="w-16 h-16 bg-wic-terracotta/10 text-wic-terracotta rounded-full flex items-center justify-center mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                </div>
                <h3 className="font-semibold text-wic-text text-lg">No matches found</h3>
                <p className="text-sm text-wic-text/60">Try checking your spelling or using fewer words.</p>
              </div>
            )}
          </div>
        ) : (
          /* Selected Product Detail Card */
          <div className="max-w-md mx-auto h-full flex flex-col justify-start pt-6 mb-10 pb-8 animate-in slide-in-from-right-8 duration-300">
            <button 
              onClick={() => setSelectedProduct(null)}
              className="flex items-center gap-2 text-sm font-semibold text-wic-text/60 hover:text-wic-text mb-6 pl-1 transition-colors w-max"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"></path><path d="M12 19l-7-7 7-7"></path></svg>
              Back to results
            </button>
            
            <div className={`rounded-[2rem] border overflow-hidden bg-wic-card shadow-lg ${
               isEligible === false 
                 ? 'border-amber-500/30'
                 : isEligible === true 
                    ? 'border-emerald-500/30' 
                    : 'border-wic-border'
            }`}>
              
              {/* Status Header */}
              <div className={`p-6 pb-5 ${
                isEligible === false 
                  ? 'bg-amber-50' 
                  : isEligible === true 
                    ? 'bg-emerald-50' 
                    : 'bg-wic-bg border-b border-wic-border'
              }`}>
                <div className={`flex items-center gap-3 font-bold text-lg ${
                  isEligible === false ? 'text-amber-800' : isEligible === true ? 'text-emerald-800' : 'text-wic-text/80'
                }`}>
                  <div className={`p-2 rounded-full ${
                    isEligible === false ? 'bg-amber-200/50' : isEligible === true ? 'bg-emerald-200/50' : 'bg-wic-border'
                  }`}>
                    {isEligible === false ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                    ) : isEligible === true ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-wic-text/60"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                    )}
                  </div>
                  {isEligible === false ? 'NOT ELIGIBLE' : isEligible === true ? 'WIC APPROVED' : 'UNVERIFIED'}
                </div>
              </div>

              {/* Product Details */}
              <div className="p-6 flex flex-col gap-4">
                
                {/* Product Image / Icon Fallback */}
                <div className="w-full flex justify-center mb-2">
                   {productImage === 'loading' ? (
                     <div className="w-32 h-32 bg-wic-sage/5 rounded-2xl flex items-center justify-center animate-pulse border border-wic-sage/10">
                       <ProductIcon category={selectedProduct.categoryDescription} subCategory={selectedProduct.subCategoryDescription} className="w-16 h-16 text-wic-sage/20" />
                     </div>
                   ) : productImage ? (
                     <div className="w-32 h-32 rounded-2xl bg-white border border-wic-border overflow-hidden flex items-center justify-center p-2 shadow-sm drop-shadow-sm">
                       <img src={productImage} alt={selectedProduct.foodDescription} className="max-w-full max-h-full object-contain" />
                     </div>
                   ) : (
                     <div className="w-32 h-32 bg-wic-sage/10 rounded-2xl flex flex-col items-center justify-center border border-wic-sage/20 text-wic-sage shadow-inner">
                       <ProductIcon category={selectedProduct.categoryDescription} subCategory={selectedProduct.subCategoryDescription} className="w-14 h-14 opacity-80" />
                     </div>
                   )}
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-wic-text leading-tight mb-2">
                    {selectedProduct.brandName} {selectedProduct.foodDescription}
                  </h3>
                  <div className="inline-flex space-x-2 flex-wrap gap-y-2">
                     <span className="px-2.5 py-1 bg-wic-bg border border-wic-border rounded-lg text-xs font-semibold text-wic-text/70">{selectedProduct.packageSize} {selectedProduct.uom}</span>
                     <span className="px-2.5 py-1 bg-wic-bg border border-wic-border rounded-lg text-xs font-mono text-wic-text/60">UPC: {selectedProduct.upc}</span>
                  </div>
                </div>

                <div className="bg-wic-bg/50 p-4 rounded-xl border border-wic-border/50 text-sm flex flex-col gap-1.5 mt-2">
                  <div className="flex justify-between">
                     <span className="text-wic-text/50 font-medium">Category</span>
                     <span className="text-wic-text font-semibold text-right">{selectedProduct.categoryDescription}</span>
                  </div>
                  <div className="w-full h-px bg-wic-border/50 my-1"></div>
                  <div className="flex justify-between">
                     <span className="text-wic-text/50 font-medium">Sub-Category</span>
                     <span className="text-wic-text font-semibold text-right">{selectedProduct.subCategoryDescription}</span>
                  </div>
                </div>

                {/* Eligibility Reason / Instructions */}
                {(eligibilityReason || !selectedParticipant) && (
                  <div className={`mt-2 p-4 rounded-xl border ${
                     !selectedParticipant ? 'bg-wic-border/40 border-wic-border/60 text-wic-text/80' :
                     isEligible === false ? 'bg-amber-50/50 border-amber-200 text-amber-900' : 'bg-emerald-50/50 border-emerald-200 text-emerald-900'
                  }`}>
                    {!selectedParticipant ? (
                       <div className="flex gap-3">
                         <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-wic-text/60 shrink-0"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                         <p className="text-sm font-medium">Please select a participant type in settings to check if this product is eligible.</p>
                       </div>
                    ) : (
                       <div className="flex gap-3">
                         <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={isEligible === false ? 'text-amber-500 shrink-0' : 'text-emerald-500 shrink-0'}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                         <p className="text-sm font-medium leading-relaxed">{eligibilityReason}</p>
                       </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
