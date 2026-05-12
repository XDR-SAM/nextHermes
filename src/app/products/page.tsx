"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, X, ChevronDown, SlidersHorizontal, Star } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { cn } from "@/lib/utils";

// Types
interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  compare_at_price?: number;
  primary_image?: string;
  avg_rating?: number;
  stock_quantity?: number;
  is_active: boolean;
  created_at: string;
  category?: { id: string; name: string; slug: string };
  brand?: { id: string; name: string };
}

interface Category {
  id: string;
  name: string;
  slug: string;
  product_count?: number;
}

// Filter and sort types
type SortOption = "newest" | "price_asc" | "price_desc" | "rating";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
];

const ITEMS_PER_PAGE = 12;

// Skeleton loader
function ProductSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="bg-[var(--bg-card)] rounded-2xl overflow-hidden border border-[var(--border)]">
        <div className="aspect-square bg-white/5" />
        <div className="p-4 space-y-3">
          <div className="h-3 bg-white/5 rounded w-3/4" />
          <div className="h-3 bg-white/5 rounded w-1/2" />
          <div className="h-4 bg-white/5 rounded w-1/3 mt-4" />
        </div>
      </div>
    </div>
  );
}

// Filter Sidebar Component
function FilterSidebar({
  categories,
  selectedCategories,
  minPrice,
  maxPrice,
  onCategoryChange,
  onPriceChange,
  onReset,
  isOpen,
  onClose,
}: {
  categories: Category[];
  selectedCategories: string[];
  minPrice: string;
  maxPrice: string;
  onCategoryChange: (category: string) => void;
  onPriceChange: (min: string, max: string) => void;
  onReset: () => void;
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:relative inset-y-0 left-0 z-50 lg:z-auto w-80 bg-[var(--bg-card)] border-r border-[var(--border)] transform transition-transform duration-300 lg:transform-none",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="h-full overflow-y-auto p-6 lg:p-0 lg:pr-6">
          <div className="flex items-center justify-between mb-6 lg:hidden">
            <h3 className="text-lg font-semibold text-[var(--text)] uppercase tracking-wider">Filters</h3>
            <button onClick={onClose} className="text-[var(--text-secondary)] hover:text-[var(--text)]">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Categories */}
            <div>
              <h4 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-widest mb-3">Category</h4>
              <div className="space-y-2">
                {categories.length === 0 ? (
                  <p className="text-sm text-[var(--text-secondary)]">Loading categories...</p>
                ) : (
                  categories.map((cat) => (
                    <label key={cat.id} className="flex items-center gap-2.5 cursor-pointer group">
                      <div className="relative flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(cat.slug)}
                          onChange={() => onCategoryChange(cat.slug)}
                          className="peer sr-only"
                        />
                        <div className="w-5 h-5 border border-white/20 rounded flex items-center justify-center peer-checked:bg-white peer-checked:border-white transition-colors">
                          <svg className="w-3 h-3 text-black opacity-0 peer-checked:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                      <span className="text-sm text-[var(--text-secondary)] group-hover:text-[var(--text)] transition-colors">
                        {cat.name}
                        {cat.product_count !== undefined && (
                          <span className="ml-1 text-xs opacity-50">({cat.product_count})</span>
                        )}
                      </span>
                    </label>
                  ))
                )}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <h4 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-widest mb-3">Price Range</h4>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => onPriceChange(e.target.value, maxPrice)}
                    className="w-full bg-white/5 border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-[var(--text-secondary)] transition-colors"
                  />
                </div>
                <span className="text-[var(--text-secondary)]">—</span>
                <div className="flex-1">
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => onPriceChange(minPrice, e.target.value)}
                    className="w-full bg-white/5 border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-[var(--text-secondary)] transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Reset */}
            <button
              onClick={onReset}
              className="w-full text-xs text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors underline underline-offset-2"
            >
              Reset all filters
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

// Main Page Component
export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");

  // Pagination
  const [page, setPage] = useState(1);

  // Build URL params from filters
  const buildParams = useCallback((pageNum: number) => {
    const params = new URLSearchParams();
    params.set("limit", String(ITEMS_PER_PAGE));
    params.set("offset", String((pageNum - 1) * ITEMS_PER_PAGE));
    params.set("sort", sortBy);
    if (minPrice) params.set("min_price", minPrice);
    if (maxPrice) params.set("max_price", maxPrice);
    if (selectedCategories.length === 1) params.set("category_slug", selectedCategories[0]);
    return params;
  }, [sortBy, minPrice, maxPrice, selectedCategories]);

  // Sync URL search params to state on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get("category");
    const search = params.get("search");
    const sort = params.get("sort") as SortOption | null;
    const min = params.get("min_price") || "";
    const max = params.get("max_price") || "";
    const pageParam = params.get("page");

    if (cat) setSelectedCategories([cat]);
    if (sort && SORT_OPTIONS.some(o => o.value === sort)) setSortBy(sort);
    if (min) setMinPrice(min);
    if (max) setMaxPrice(max);
    if (pageParam) setPage(parseInt(pageParam, 10) || 1);
  }, []);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedCategories.length === 1) params.set("category", selectedCategories[0]);
    if (minPrice) params.set("min_price", minPrice);
    if (maxPrice) params.set("max_price", maxPrice);
    if (sortBy !== "newest") params.set("sort", sortBy);
    if (page > 1) params.set("page", String(page));

    const query = params.toString();
    const newUrl = query ? `${window.location.pathname}?${query}` : window.location.pathname;
    window.history.replaceState({}, "", newUrl);
  }, [selectedCategories, minPrice, maxPrice, sortBy, page]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        if (data.categories) setCategories(data.categories);
      } catch {
        // Silently fail, categories are optional
      }
    };
    fetchCategories();
  }, []);

  // Fetch products from API route
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = buildParams(page);
        const res = await fetch(`/api/products?${params.toString()}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Failed to load products");
          return;
        }

        setProducts(data.products || []);
      } catch {
        setError("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [buildParams, page]);

  // Filter handlers
  const handleCategoryChange = (slug: string) => {
    setSelectedCategories((prev) =>
      prev.includes(slug) ? prev.filter((c) => c !== slug) : [...prev, slug]
    );
    setPage(1);
  };

  const handlePriceChange = (min: string, max: string) => {
    setMinPrice(min);
    setMaxPrice(max);
    setPage(1);
  };

  const handleSortChange = (sort: SortOption) => {
    setSortBy(sort);
    setPage(1);
  };

  const handleReset = () => {
    setSelectedCategories([]);
    setMinPrice("");
    setMaxPrice("");
    setSortBy("newest");
    setPage(1);
  };

  const totalPages = Math.ceil((products.length || 0) / ITEMS_PER_PAGE);

  return (
    <main className="min-h-screen bg-[var(--bg)]">
      {/* Header */}
      <div className="bg-[var(--bg-card)] border-b border-[var(--border)]">
        <div className="container mx-auto px-6 py-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-[var(--text)] mb-2">All Products</h1>
          <p className="text-[var(--text-secondary)]">
            {loading ? "Loading..." : `${products.length} products found`}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* Filter Sidebar */}
          <FilterSidebar
            categories={categories}
            selectedCategories={selectedCategories}
            minPrice={minPrice}
            maxPrice={maxPrice}
            onCategoryChange={handleCategoryChange}
            onPriceChange={handlePriceChange}
            onReset={handleReset}
            isOpen={filterOpen}
            onClose={() => setFilterOpen(false)}
          />

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6">
              {/* Mobile Filter Button */}
              <button
                onClick={() => setFilterOpen(true)}
                className="lg:hidden flex items-center gap-2 bg-white/5 border border-[var(--border)] rounded-full px-4 py-2 text-sm text-[var(--text)] hover:bg-white/10 transition-colors"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
                {(selectedCategories.length > 0 || minPrice || maxPrice) && (
                  <span className="w-5 h-5 bg-[var(--accent)] text-[var(--bg)] rounded-full text-xs flex items-center justify-center">
                    {selectedCategories.length + (minPrice ? 1 : 0) + (maxPrice ? 1 : 0)}
                  </span>
                )}
              </button>

              <div className="hidden lg:block text-sm text-[var(--text-secondary)]">
                {loading ? "" : `Showing ${products.length} products`}
              </div>

              {/* Sort */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value as SortOption)}
                  className="appearance-none bg-white/5 border border-[var(--border)] rounded-full px-4 py-2 pr-10 text-sm text-[var(--text)] focus:outline-none focus:border-[var(--text-secondary)] cursor-pointer hover:bg-white/10 transition-colors"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value} className="bg-zinc-950">
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)] pointer-events-none" />
              </div>
            </div>

            {/* Active Filters */}
            {selectedCategories.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {selectedCategories.map((slug) => {
                  const cat = categories.find((c) => c.slug === slug);
                  return (
                    <button
                      key={slug}
                      onClick={() => handleCategoryChange(slug)}
                      className="flex items-center gap-1 bg-white/10 text-sm text-[var(--text)] px-3 py-1 rounded-full hover:bg-white/20 transition-colors"
                    >
                      {cat?.name || slug}
                      <X className="w-3 h-3" />
                    </button>
                  );
                })}
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-center py-12">
                <p className="text-[var(--text-secondary)] mb-4">{error}</p>
                <button
                  onClick={() => setPage(page)}
                  className="text-[var(--text)] underline underline-offset-2 hover:text-[var(--text-secondary)] transition-colors"
                >
                  Try again
                </button>
              </div>
            )}

            {/* Product Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                  <ProductSkeleton key={i} />
                ))}
              </div>
            ) : !error && products.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-[var(--text-secondary)] mb-4">No products found matching your criteria.</p>
                <button
                  onClick={handleReset}
                  className="text-[var(--text)] underline underline-offset-2 hover:text-[var(--text-secondary)] transition-colors"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <>
                <motion.div
                  layout
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6"
                >
                  <AnimatePresence mode="popLayout">
                    {products.map((product) => (
                      <motion.div
                        key={product.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ProductCard
                          id={product.id}
                          name={product.name}
                          price={product.price}
                          originalPrice={product.compare_at_price}
                          image={product.primary_image || "https://picsum.photos/400"}
                          rating={product.avg_rating}
                          category={product.category?.name}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-12">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="w-10 h-10 rounded-full border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text)] hover:border-[var(--text-secondary)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>

                    {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                      const pageNum = i + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={cn(
                            "w-10 h-10 rounded-full text-sm font-medium transition-colors",
                            page === pageNum
                              ? "bg-[var(--accent)] text-[var(--bg)]"
                              : "border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text)] hover:border-[var(--text-secondary)]"
                          )}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="w-10 h-10 rounded-full border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text)] hover:border-[var(--text-secondary)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
