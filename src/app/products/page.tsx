"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, X, ChevronDown, SlidersHorizontal } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { cn } from "@/lib/utils";
import { MOCK_PRODUCTS, type Product } from "@/lib/products";

export type { Product };

// ─── URL Params Sync Hook ──────────────────────────────────────────────────────
function useFilterParams() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const getParam = (key: string): string | null => searchParams.get(key);
  const getParamArray = (key: string): string[] => {
    const val = getParam(key);
    return val ? val.split(",").filter(Boolean) : [];
  };

  const selectedCategories = getParamArray("categories");
  const selectedBrands = getParamArray("brands");
  const selectedPriceRange = getParam("price");
  const selectedRating = getParam("rating");
  const sortBy = getParam("sort") ?? "newest";

  const updateParams = (updates: Record<string, string | string[] | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || (Array.isArray(value) && value.length === 0)) {
        params.delete(key);
      } else if (Array.isArray(value)) {
        params.set(key, value.join(","));
      } else {
        params.set(key, value);
      }
    });
    router.push(`/products?${params.toString()}`, { scroll: false });
  };

  return { selectedCategories, selectedBrands, selectedPriceRange, selectedRating, sortBy, updateParams };
}

const CATEGORIES = ["Electronics","Clothing","Accessories","Footwear","Home"];
const BRANDS = ["SoundMax","UrbanCarry","FitTech","EcoWear","BrewCraft","RunFast","KeyMaster","WoolCraft","BreezyWear","HydroLife","RayLux"];
const PRICE_RANGES = [
  { label: "Under $50", min: 0, max: 50 },
  { label: "$50 – $100", min: 50, max: 100 },
  { label: "$100 – $200", min: 100, max: 200 },
  { label: "$200 – $500", min: 200, max: 500 },
  { label: "Above $500", min: 500, max: Infinity },
];
const RATINGS = [4, 3, 2, 1];
const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
];

// ─── Filter Sidebar ───────────────────────────────────────────────────────────
function FilterSidebar({
  selectedCategories,
  selectedBrands,
  selectedPriceRange,
  selectedRating,
  onCategoryChange,
  onBrandChange,
  onPriceRangeChange,
  onRatingChange,
  onReset,
}: {
  selectedCategories: string[];
  selectedBrands: string[];
  selectedPriceRange: number | null;
  selectedRating: number | null;
  onCategoryChange: (c: string) => void;
  onBrandChange: (b: string) => void;
  onPriceRangeChange: (i: number | null) => void;
  onRatingChange: (r: number | null) => void;
  onReset: () => void;
}) {
  return (
    <aside className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Filters</h3>
        <button onClick={onReset} className="text-xs text-white/40 hover:text-white/70 transition-colors underline underline-offset-2">
          Reset all
        </button>
      </div>

      <div>
        <h4 className="text-xs font-semibold text-white/60 uppercase tracking-widest mb-3">Category</h4>
        <div className="space-y-2">
          {CATEGORIES.map((cat) => (
            <label key={cat} className="flex items-center gap-2.5 cursor-pointer group">
              <div className="relative flex items-center">
                <input type="checkbox" checked={selectedCategories.includes(cat)} onChange={() => onCategoryChange(cat)} className="peer sr-only" />
                <div className="w-4 h-4 border border-white/20 rounded-[4px] peer-checked:bg-white peer-checked:border-white transition-all group-hover:border-white/50" />
                <svg className="absolute inset-0 m-auto w-2.5 h-2.5 text-black opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-sm text-white/70 group-hover:text-white transition-colors">{cat}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-xs font-semibold text-white/60 uppercase tracking-widest mb-3">Price Range</h4>
        <div className="space-y-2">
          {PRICE_RANGES.map((range, i) => (
            <label key={range.label} className="flex items-center gap-2.5 cursor-pointer group">
              <div className="relative flex items-center">
                <input type="radio" name="price" checked={selectedPriceRange === i} onChange={() => onPriceRangeChange(selectedPriceRange === i ? null : i)} className="peer sr-only" />
                <div className="w-4 h-4 rounded-full border border-white/20 peer-checked:bg-white peer-checked:border-white transition-all group-hover:border-white/50 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-black opacity-0 peer-checked:opacity-100 transition-opacity" />
                </div>
              </div>
              <span className="text-sm text-white/70 group-hover:text-white transition-colors">{range.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-xs font-semibold text-white/60 uppercase tracking-widest mb-3">Rating</h4>
        <div className="space-y-2">
          {RATINGS.map((r) => (
            <label key={r} className="flex items-center gap-2.5 cursor-pointer group">
              <div className="relative flex items-center">
                <input type="radio" name="rating" checked={selectedRating === r} onChange={() => onRatingChange(selectedRating === r ? null : r)} className="peer sr-only" />
                <div className="w-4 h-4 rounded-full border border-white/20 peer-checked:bg-white peer-checked:border-white transition-all group-hover:border-white/50 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-black opacity-0 peer-checked:opacity-100 transition-opacity" />
                </div>
              </div>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} className={cn("w-3.5 h-3.5", i < r ? "text-yellow-400" : "text-white/20")} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
                <span className="text-xs text-white/40">& Up</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-xs font-semibold text-white/60 uppercase tracking-widest mb-3">Brand</h4>
        <div className="space-y-2">
          {BRANDS.map((brand) => (
            <label key={brand} className="flex items-center gap-2.5 cursor-pointer group">
              <div className="relative flex items-center">
                <input type="checkbox" checked={selectedBrands.includes(brand)} onChange={() => onBrandChange(brand)} className="peer sr-only" />
                <div className="w-4 h-4 border border-white/20 rounded-[4px] peer-checked:bg-white peer-checked:border-white transition-all group-hover:border-white/50" />
                <svg className="absolute inset-0 m-auto w-2.5 h-2.5 text-black opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-sm text-white/70 group-hover:text-white transition-colors">{brand}</span>
            </label>
          ))}
        </div>
      </div>
    </aside>
  );
}

// ─── Mobile Filter Modal ─────────────────────────────────────────────────────
function MobileFilterModal({
  open, onClose, selectedCategories, selectedBrands, selectedPriceRange, selectedRating,
  onCategoryChange, onBrandChange, onPriceRangeChange, onRatingChange, onReset,
}: {
  open: boolean; onClose: () => void;
  selectedCategories: string[]; selectedBrands: string[];
  selectedPriceRange: number | null; selectedRating: number | null;
  onCategoryChange: (c: string) => void; onBrandChange: (b: string) => void;
  onPriceRangeChange: (i: number | null) => void; onRatingChange: (r: number | null) => void;
  onReset: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={onClose} />
          <motion.div
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-50 bg-[#0d0d0d] border-t border-white/10 rounded-t-3xl max-h-[85vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-[#0d0d0d] border-b border-white/5 p-4 flex items-center justify-between z-10">
              <h3 className="text-base font-semibold text-white">Filters</h3>
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-white/60 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5">
              <FilterSidebar
                selectedCategories={selectedCategories} selectedBrands={selectedBrands}
                selectedPriceRange={selectedPriceRange} selectedRating={selectedRating}
                onCategoryChange={onCategoryChange} onBrandChange={onBrandChange}
                onPriceRangeChange={onPriceRangeChange} onRatingChange={onRatingChange} onReset={onReset}
              />
            </div>
            <div className="sticky bottom-0 bg-[#0d0d0d] border-t border-white/5 p-4">
              <button onClick={onClose} className="w-full py-3.5 bg-white text-black font-semibold rounded-full hover:bg-white/90 active:scale-[0.98] transition-all">
                Show Results
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Products Page Content (uses useSearchParams - must be inside Suspense) ─────
function ProductsPageContent() {
  const { selectedCategories, selectedBrands, selectedPriceRange, selectedRating, sortBy, updateParams } = useFilterParams();
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Parse URL params to local state for filtering
  const [activeCategories, setActiveCategories] = useState<string[]>(selectedCategories);
  const [activeBrands, setActiveBrands] = useState<string[]>(selectedBrands);
  const [activePriceRange, setActivePriceRange] = useState<number | null>(selectedPriceRange !== null ? parseInt(selectedPriceRange) : null);
  const [activeRating, setActiveRating] = useState<number | null>(selectedRating !== null ? parseInt(selectedRating) : null);
  const [activeSort, setActiveSort] = useState(sortBy);

  // Sync local state when URL params change
  useEffect(() => {
    setActiveCategories(selectedCategories);
    setActiveBrands(selectedBrands);
    setActivePriceRange(selectedPriceRange !== null ? parseInt(selectedPriceRange) : null);
    setActiveRating(selectedRating !== null ? parseInt(selectedRating) : null);
    setActiveSort(sortBy);
  }, [selectedCategories, selectedBrands, selectedPriceRange, selectedRating, sortBy]);

  const toggleCategory = (cat: string) => {
    const newCategories = activeCategories.includes(cat)
      ? activeCategories.filter((c) => c !== cat)
      : [...activeCategories, cat];
    setActiveCategories(newCategories);
    updateParams({ categories: newCategories });
  };

  const toggleBrand = (brand: string) => {
    const newBrands = activeBrands.includes(brand)
      ? activeBrands.filter((b) => b !== brand)
      : [...activeBrands, brand];
    setActiveBrands(newBrands);
    updateParams({ brands: newBrands });
  };

  const handlePriceRangeChange = (i: number | null) => {
    setActivePriceRange(i);
    updateParams({ price: i !== null ? i.toString() : null });
  };

  const handleRatingChange = (r: number | null) => {
    setActiveRating(r);
    updateParams({ rating: r !== null ? r.toString() : null });
  };

  const handleSortChange = (newSort: string) => {
    setActiveSort(newSort);
    updateParams({ sort: newSort });
  };

  const resetFilters = () => {
    setActiveCategories([]);
    setActiveBrands([]);
    setActivePriceRange(null);
    setActiveRating(null);
    setActiveSort("newest");
    updateParams({ categories: null, brands: null, price: null, rating: null, sort: "newest" });
  };

  const filteredProducts = useMemo(() => {
    let result = [...MOCK_PRODUCTS];
    if (activeCategories.length > 0) result = result.filter((p) => activeCategories.includes(p.category));
    if (activeBrands.length > 0) result = result.filter((p) => activeBrands.includes(p.brand));
    if (activePriceRange !== null) { const range = PRICE_RANGES[activePriceRange]; result = result.filter((p) => p.price >= range.min && p.price < range.max); }
    if (activeRating !== null) result = result.filter((p) => p.rating >= activeRating);
    switch (activeSort) {
      case "price-asc": result.sort((a, b) => a.price - b.price); break;
      case "price-desc": result.sort((a, b) => b.price - a.price); break;
      case "rating": result.sort((a, b) => b.rating - a.rating); break;
    }
    return result;
  }, [activeCategories, activeBrands, activePriceRange, activeRating, activeSort]);

  const hasActiveFilters = activeCategories.length > 0 || activeBrands.length > 0 || activePriceRange !== null || activeRating !== null;

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-2">All Products</h1>
          <p className="text-white/40 text-sm">{filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""} found</p>
        </div>

        <div className="flex items-center justify-between mb-6 gap-4">
          <button onClick={() => setMobileFilterOpen(true)} className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-full text-sm text-white/70 hover:text-white hover:bg-white/10 transition-all">
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {hasActiveFilters && (
              <span className="w-5 h-5 bg-white text-black text-[10px] font-bold rounded-full flex items-center justify-center">
                {activeCategories.length + activeBrands.length + (activePriceRange !== null ? 1 : 0) + (activeRating !== null ? 1 : 0)}
              </span>
            )}
          </button>
          <div className="hidden lg:block" />
          <div className="relative">
            <select value={activeSort} onChange={(e) => handleSortChange(e.target.value)} className="appearance-none bg-[#0d0d0d] border border-white/10 text-white text-sm rounded-xl px-4 py-2.5 pr-10 cursor-pointer hover:border-white/20 transition-colors focus:outline-none focus:border-white/30">
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-[#0d0d0d] text-white">{opt.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
          </div>
        </div>

        <div className="flex gap-8">
          <div className="hidden lg:block w-56 shrink-0">
            <div className="sticky top-8">
              <FilterSidebar
                selectedCategories={activeCategories} selectedBrands={activeBrands}
                selectedPriceRange={activePriceRange} selectedRating={activeRating}
                onCategoryChange={toggleCategory} onBrandChange={toggleBrand}
                onPriceRangeChange={handlePriceRangeChange} onRatingChange={handleRatingChange} onReset={resetFilters}
              />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            {filteredProducts.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                  <Filter className="w-7 h-7 text-white/20" />
                </div>
                <h3 className="text-white font-medium mb-2">No products found</h3>
                <p className="text-white/40 text-sm mb-6">Try adjusting your filters</p>
                <button onClick={resetFilters} className="px-6 py-2.5 bg-white text-black text-sm font-semibold rounded-full hover:bg-white/90 transition-all">Clear Filters</button>
              </motion.div>
            ) : (
              <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-5">
                {filteredProducts.map((product, index) => (
                  <motion.div key={product.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06, duration: 0.4, ease: "easeOut" }}>
                    <ProductCard
                      id={product.id} name={product.name} price={product.price} originalPrice={product.originalPrice}
                      image={product.image} rating={product.rating} reviewCount={product.reviewCount} category={product.category}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>

      <MobileFilterModal
        open={mobileFilterOpen} onClose={() => setMobileFilterOpen(false)}
        selectedCategories={activeCategories} selectedBrands={activeBrands}
        selectedPriceRange={activePriceRange} selectedRating={activeRating}
        onCategoryChange={toggleCategory} onBrandChange={toggleBrand}
        onPriceRangeChange={handlePriceRangeChange} onRatingChange={handleRatingChange} onReset={resetFilters}
      />
    </div>
  );
}

// ─── Main Page with Suspense Boundary ─────────────────────────────────────────
export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-white/10 border-t-white rounded-full animate-spin" />
          <p className="text-white/40 text-sm">Loading products...</p>
        </div>
      </div>
    }>
      <ProductsPageContent />
    </Suspense>
  );
}
