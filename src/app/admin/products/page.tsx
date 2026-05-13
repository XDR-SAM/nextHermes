"use client";
import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";

interface Category { id: string; name: string; slug: string; }
interface Warehouse { id: string; name: string; location: string | null; }

interface ProductVariant {
  id: string;
  product_id: string;
  name: string; // e.g. "Red / Large"
  sku: string | null;
  price_modifier: number;
  stock_quantity: number;
  is_active: boolean;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  price: number;
  original_price: number | null;
  sku: string | null;
  stock_quantity: number;
  image_url: string | null;
  category_id: string | null;
  featured: boolean;
  trending: boolean;
  is_active: boolean;
  created_at: string;
  metadata: Record<string, unknown> | null;
  categories: { name: string } | null;
}

interface ProductFormData {
  name: string; slug: string; description: string; short_description: string;
  price: string; original_price: string; sku: string; stock_quantity: string;
  category_id: string; image_url: string; featured: boolean; trending: boolean; is_active: boolean;
}

const initialFormData: ProductFormData = {
  name: "", slug: "", description: "", short_description: "",
  price: "", original_price: "", sku: "", stock_quantity: "0",
  category_id: "", image_url: "", featured: false, trending: false, is_active: true,
};

const PAGE_SIZE = 20;

export default function ProductsPage() {
  const supabase = createClient();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [variants, setVariants] = useState<Record<string, ProductVariant[]>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showVariantModal, setShowVariantModal] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>(initialFormData);
  const [variantForm, setVariantForm] = useState<Partial<ProductVariant>>({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkAction, setBulkAction] = useState<"delete" | "activate" | "deactivate">("delete");
  const [page, setPage] = useState(1);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [productsRes, categoriesRes, warehousesRes] = await Promise.all([
      supabase.from("products").select("*, categories(name)").order("created_at", { ascending: false }),
      supabase.from("categories").select("id, name, slug").eq("is_active", true).order("name"),
      supabase.from("warehouses").select("id, name, location").eq("is_active", true).order("name"),
    ]);
    setProducts((productsRes.data || []) as Product[]);
    setCategories((categoriesRes.data || []) as Category[]);
    setWarehouses((warehousesRes.data || []) as Warehouse[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { loadData(); }, [loadData]);

  const loadVariants = useCallback(async (productId: string) => {
    const { data } = await supabase
      .from("product_variants")
      .select("*")
      .eq("product_id", productId)
      .order("name");
    return (data || []) as ProductVariant[];
  }, [supabase]);

  const openVariantModal = async (productId: string) => {
    const vars = await loadVariants(productId);
    setVariants(prev => ({ ...prev, [productId]: vars }));
    setVariantForm({ name: "", sku: "", price_modifier: 0, stock_quantity: 0, is_active: true });
    setShowVariantModal(productId);
  };

  const generateSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData(initialFormData);
    setShowModal(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      slug: product.slug,
      description: product.description || "",
      short_description: product.short_description || "",
      price: product.price.toString(),
      original_price: product.original_price?.toString() || "",
      sku: product.sku || "",
      stock_quantity: product.stock_quantity.toString(),
      category_id: product.category_id || "",
      image_url: (product.metadata as Record<string, string>)?.image_url || product.image_url || "",
      featured: product.featured,
      trending: product.trending,
      is_active: product.is_active,
    });
    setShowModal(true);
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev, name,
      slug: editingProduct ? prev.slug : generateSlug(name),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price) {
      showToast("Name and price are required", "error"); return;
    }
    setSaving(true);
    const imageUrl = formData.image_url;
    const productData = {
      name: formData.name,
      slug: formData.slug || generateSlug(formData.name),
      description: formData.description || null,
      short_description: formData.short_description || null,
      price: parseFloat(formData.price),
      original_price: formData.original_price ? parseFloat(formData.original_price) : null,
      sku: formData.sku || null,
      stock_quantity: parseInt(formData.stock_quantity) || 0,
      category_id: formData.category_id || null,
      image_url: imageUrl || null,
      metadata: imageUrl ? { image_url: imageUrl } : null,
      featured: formData.featured,
      trending: formData.trending,
      is_active: formData.is_active,
    };
    let result;
    if (editingProduct) {
      result = await supabase.from("products").update(productData).eq("id", editingProduct.id).select().single();
    } else {
      result = await supabase.from("products").insert([productData]).select().single();
    }
    setSaving(false);
    if (result.error) {
      showToast(`Failed: ${result.error.message}`, "error");
    } else {
      showToast(`Product ${editingProduct ? "updated" : "added"} successfully!`, "success");
      setShowModal(false);
      loadData();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) { showToast(`Failed: ${error.message}`, "error"); }
    else { showToast("Product deleted!", "success"); setDeleteConfirm(null); loadData(); }
  };

  const handleVariantSave = async (productId: string) => {
    if (!variantForm.name) { showToast("Variant name is required", "error"); return; }
    setSaving(true);
    const data = {
      product_id: productId,
      name: variantForm.name,
      sku: variantForm.sku || null,
      price_modifier: variantForm.price_modifier || 0,
      stock_quantity: variantForm.stock_quantity || 0,
      is_active: variantForm.is_active !== false,
    };
    let result;
    if (variantForm.id) {
      result = await supabase.from("product_variants").update(data).eq("id", variantForm.id).select().single();
    } else {
      result = await supabase.from("product_variants").insert([data]).select().single();
    }
    setSaving(false);
    if (result.error) { showToast(`Failed: ${result.error.message}`, "error"); }
    else {
      showToast("Variant saved!", "success");
      const vars = await loadVariants(productId);
      setVariants(prev => ({ ...prev, [productId]: vars }));
      setVariantForm({ name: "", sku: "", price_modifier: 0, stock_quantity: 0, is_active: true });
    }
  };

  const handleVariantDelete = async (productId: string, variantId: string) => {
    const { error } = await supabase.from("product_variants").delete().eq("id", variantId);
    if (error) showToast(`Failed: ${error.message}`, "error");
    else {
      showToast("Variant deleted!", "success");
      const vars = await loadVariants(productId);
      setVariants(prev => ({ ...prev, [productId]: vars }));
    }
  };

  const handleBulkAction = async () => {
    if (selectedIds.size === 0) return;
    setSaving(true);
    let error: string | null = null;
    const ids = Array.from(selectedIds);
    if (bulkAction === "delete") {
      const res = await supabase.from("products").delete().in("id", ids);
      error = res.error?.message || null;
    } else {
      const res = await supabase.from("products")
        .update({ is_active: bulkAction === "activate" })
        .in("id", ids);
      error = res.error?.message || null;
    }
    setSaving(false);
    if (error) showToast(`Bulk action failed: ${error}`, "error");
    else {
      showToast(`${selectedIds.size} product(s) ${bulkAction}d!`, "success");
      setSelectedIds(new Set());
      setShowBulkModal(false);
      loadData();
    }
  };

  const filteredProducts = products.filter(p => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const catName = (p.categories?.name || "").toLowerCase();
    return p.name.toLowerCase().includes(q) ||
      (p.sku || "").toLowerCase().includes(q) ||
      catName.includes(q);
  });

  const lowStockCount = products.filter(p => p.stock_quantity > 0 && p.stock_quantity < 10).length;
  const outOfStockCount = products.filter(p => p.stock_quantity === 0).length;
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const paginated = filteredProducts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const allSelected = paginated.length > 0 && paginated.every(p => selectedIds.has(p.id));

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: "600", color: "var(--text)", margin: "0 0 4px" }}>Products</h1>
          <p style={{ color: "var(--text-secondary)", margin: 0, fontSize: "13px" }}>
            {products.length} total
            {lowStockCount > 0 && <span style={{ color: "#eab308", marginLeft: "12px" }}>⚠️ {lowStockCount} low stock</span>}
            {outOfStockCount > 0 && <span style={{ color: "#ef4444", marginLeft: "8px" }}>⛔ {outOfStockCount} out of stock</span>}
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          {selectedIds.size > 0 && (
            <>
              <button onClick={() => { setBulkAction("activate"); setShowBulkModal(true); }}
                style={{ padding: "10px 16px", borderRadius: "8px", border: "1px solid rgba(34,197,94,0.4)", background: "rgba(34,197,94,0.1)", color: "#22c55e", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>
                Activate ({selectedIds.size})
              </button>
              <button onClick={() => { setBulkAction("deactivate"); setShowBulkModal(true); }}
                style={{ padding: "10px 16px", borderRadius: "8px", border: "1px solid rgba(239,68,68,0.4)", background: "rgba(239,68,68,0.1)", color: "#ef4444", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>
                Deactivate ({selectedIds.size})
              </button>
              <button onClick={() => { setBulkAction("delete"); setShowBulkModal(true); }}
                style={{ padding: "10px 16px", borderRadius: "8px", border: "1px solid rgba(239,68,68,0.4)", background: "rgba(239,68,68,0.1)", color: "#ef4444", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>
                Delete ({selectedIds.size})
              </button>
            </>
          )}
          <button onClick={openAddModal} style={{
            display: "flex", alignItems: "center", gap: "8px",
            padding: "10px 20px", borderRadius: "8px", border: "none",
            background: "#22c55e", color: "#fff", fontSize: "14px",
            fontWeight: "600", cursor: "pointer",
          }}>
            ➕ Add Product
          </button>
        </div>
      </div>

      {/* Search */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
        <input type="text" placeholder="Search by name, SKU, or category..."
          value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setPage(1); }}
          style={{ flex: 1, maxWidth: "400px", padding: "12px 16px", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--bg-card)", color: "var(--text)", fontSize: "14px", outline: "none" }} />
      </div>

      {/* Table */}
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "12px", overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: "48px", textAlign: "center", color: "var(--text-secondary)" }}>Loading products...</div>
        ) : paginated.length === 0 ? (
          <div style={{ padding: "48px", textAlign: "center", color: "var(--text-secondary)" }}>
            {searchQuery ? "No products found" : "No products yet. Add your first product!"}
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "900px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  <th style={{ padding: "12px 16px", width: "40px" }}>
                    <input type="checkbox" checked={allSelected} onChange={e => {
                      if (e.target.checked) setSelectedIds(prev => { const n = new Set(prev); paginated.forEach(p => n.add(p.id)); return n; });
                      else setSelectedIds(prev => { const n = new Set(prev); paginated.forEach(p => n.delete(p.id)); return n; });
                    }} style={{ width: "16px", height: "16px", accentColor: "#22c55e", cursor: "pointer" }} />
                  </th>
                  {["Image", "Name", "Category", "Price", "Stock", "Variants", "Status", "Actions"].map(h => (
                    <th key={h} style={{ padding: "14px 16px", textAlign: "left", fontSize: "12px", color: "var(--text-secondary)", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map(product => (
                  <tr key={product.id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "12px 16px" }}>
                      <input type="checkbox" checked={selectedIds.has(product.id)}
                        onChange={e => setSelectedIds(prev => { const n = new Set(prev); e.target.checked ? n.add(product.id) : n.delete(product.id); return n; })}
                        style={{ width: "16px", height: "16px", accentColor: "#22c55e", cursor: "pointer" }} />
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name}
                          style={{ width: "48px", height: "48px", objectFit: "cover", borderRadius: "8px" }}
                          onError={e => { e.currentTarget.style.display = "none"; (e.currentTarget.nextElementSibling as HTMLElement).style.display = "flex"; }} />
                      ) : null}
                      <div style={{ width: "48px", height: "48px", borderRadius: "8px", background: "var(--bg-secondary)", display: product.image_url ? "none" : "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>📦</div>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ fontSize: "14px", fontWeight: "500", color: "var(--text)" }}>{product.name}</div>
                      <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                        {product.featured && <span style={{ color: "#f59e0b" }}>⭐</span>}
                        {product.trending && <span style={{ color: "#ef4444" }}>🔥</span>}
                        {product.sku && `SKU: ${product.sku}`}
                      </div>
                    </td>
                    <td style={{ padding: "14px 16px", fontSize: "14px", color: "var(--text-secondary)" }}>
                      {product.categories?.name || "—"}
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ fontSize: "14px", fontWeight: "600" }}>{formatCurrency(product.price)}</div>
                      {product.original_price && product.original_price > product.price && (
                        <div style={{ fontSize: "12px", color: "var(--text-secondary)", textDecoration: "line-through" }}>{formatCurrency(product.original_price)}</div>
                      )}
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      {product.stock_quantity === 0 ? (
                        <span style={{ padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: "600", background: "rgba(239,68,68,0.1)", color: "#ef4444" }}>Out</span>
                      ) : product.stock_quantity < 10 ? (
                        <span style={{ padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: "600", background: "rgba(234,179,8,0.1)", color: "#eab308" }}>{product.stock_quantity} ⚠️</span>
                      ) : (
                        <span style={{ padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: "600", background: "rgba(34,197,94,0.1)", color: "#22c55e" }}>{product.stock_quantity}</span>
                      )}
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <button onClick={() => openVariantModal(product.id)}
                        style={{ padding: "5px 10px", borderRadius: "6px", border: "1px solid var(--border)", background: "rgba(167,139,250,0.1)", color: "#a78bfa", fontSize: "12px", cursor: "pointer" }}>
                        Variants
                      </button>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{ padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: "600", background: product.is_active ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)", color: product.is_active ? "#22c55e" : "#ef4444" }}>
                        {product.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        <button onClick={() => openEditModal(product)} style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid var(--border)", background: "transparent", color: "var(--text)", fontSize: "12px", cursor: "pointer" }}>Edit</button>
                        {deleteConfirm === product.id ? (
                          <div style={{ display: "flex", gap: "4px" }}>
                            <button onClick={() => handleDelete(product.id)} style={{ padding: "6px 10px", borderRadius: "6px", border: "none", background: "#ef4444", color: "#fff", fontSize: "12px", cursor: "pointer" }}>Confirm</button>
                            <button onClick={() => setDeleteConfirm(null)} style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid var(--border)", background: "transparent", color: "var(--text)", fontSize: "12px", cursor: "pointer" }}>Cancel</button>
                          </div>
                        ) : (
                          <button onClick={() => setDeleteConfirm(product.id)} style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid rgba(239,68,68,0.3)", background: "transparent", color: "#ef4444", fontSize: "12px", cursor: "pointer" }}>Delete</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "20px", flexWrap: "wrap", gap: "12px" }}>
          <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
            Page {page} of {totalPages} — {filteredProducts.length} products
          </span>
          <div style={{ display: "flex", gap: "8px" }}>
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} style={{ padding: "8px 16px", borderRadius: "6px", border: "1px solid var(--border)", background: "var(--bg-card)", color: page === 1 ? "var(--text-secondary)" : "var(--text)", fontSize: "13px", cursor: page === 1 ? "not-allowed" : "pointer", opacity: page === 1 ? 0.5 : 1 }}>← Prev</button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = page <= 3 ? i + 1 : page + i - 2;
              if (p < 1 || p > totalPages) return null;
              return <button key={p} onClick={() => setPage(p)} style={{ padding: "8px 14px", borderRadius: "6px", border: "1px solid", borderColor: p === page ? "#22c55e" : "var(--border)", background: p === page ? "rgba(34,197,94,0.1)" : "var(--bg-card)", color: p === page ? "#22c55e" : "var(--text)", fontSize: "13px", cursor: "pointer" }}>{p}</button>;
            })}
            <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} style={{ padding: "8px 16px", borderRadius: "6px", border: "1px solid var(--border)", background: "var(--bg-card)", color: page === totalPages ? "var(--text-secondary)" : "var(--text)", fontSize: "13px", cursor: page === totalPages ? "not-allowed" : "pointer", opacity: page === totalPages ? 0.5 : 1 }}>Next →</button>
          </div>
        </div>
      )}

      {/* Product Modal */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "20px" }}
          onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "12px", width: "100%", maxWidth: "600px", maxHeight: "90vh", overflow: "auto" }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "600", color: "var(--text)", margin: 0 }}>{editingProduct ? "Edit Product" : "Add Product"}</h2>
              <button onClick={() => setShowModal(false)} style={{ padding: "8px", border: "none", background: "transparent", color: "var(--text-secondary)", cursor: "pointer", fontSize: "18px" }}>✕</button>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: "24px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", color: "var(--text-secondary)", marginBottom: "6px" }}>Name *</label>
                  <input type="text" value={formData.name} onChange={e => handleNameChange(e.target.value)} required style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "13px", color: "var(--text-secondary)", marginBottom: "6px" }}>Slug</label>
                  <input type="text" value={formData.slug} onChange={e => setFormData(prev => ({ ...prev, slug: e.target.value }))} style={inputStyle} />
                </div>
              </div>
              <div style={{ marginTop: "16px" }}>
                <label style={{ display: "block", fontSize: "13px", color: "var(--text-secondary)", marginBottom: "6px" }}>Short Description</label>
                <input type="text" value={formData.short_description} onChange={e => setFormData(prev => ({ ...prev, short_description: e.target.value }))} style={inputStyle} placeholder="Brief tagline" />
              </div>
              <div style={{ marginTop: "16px" }}>
                <label style={{ display: "block", fontSize: "13px", color: "var(--text-secondary)", marginBottom: "6px" }}>Description</label>
                <textarea value={formData.description} onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))} rows={3} style={{ ...inputStyle, resize: "vertical" }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginTop: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", color: "var(--text-secondary)", marginBottom: "6px" }}>Price *</label>
                  <input type="number" step="0.01" min="0" value={formData.price} onChange={e => setFormData(prev => ({ ...prev, price: e.target.value }))} required style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "13px", color: "var(--text-secondary)", marginBottom: "6px" }}>Original Price</label>
                  <input type="number" step="0.01" min="0" value={formData.original_price} onChange={e => setFormData(prev => ({ ...prev, original_price: e.target.value }))} style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "13px", color: "var(--text-secondary)", marginBottom: "6px" }}>Stock Quantity</label>
                  <input type="number" min="0" value={formData.stock_quantity} onChange={e => setFormData(prev => ({ ...prev, stock_quantity: e.target.value }))} style={inputStyle} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginTop: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", color: "var(--text-secondary)", marginBottom: "6px" }}>SKU</label>
                  <input type="text" value={formData.sku} onChange={e => setFormData(prev => ({ ...prev, sku: e.target.value }))} style={inputStyle} placeholder="Product SKU" />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "13px", color: "var(--text-secondary)", marginBottom: "6px" }}>Category</label>
                  <select value={formData.category_id} onChange={e => setFormData(prev => ({ ...prev, category_id: e.target.value }))} style={inputStyle}>
                    <option value="">Select Category</option>
                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ marginTop: "16px" }}>
                <label style={{ display: "block", fontSize: "13px", color: "var(--text-secondary)", marginBottom: "6px" }}>Image URL</label>
                <input type="url" value={formData.image_url} onChange={e => setFormData(prev => ({ ...prev, image_url: e.target.value }))} style={inputStyle} placeholder="https://..." />
              </div>
              <div style={{ display: "flex", gap: "24px", marginTop: "20px" }}>
                {[{ key: "featured", label: "Featured" }, { key: "trending", label: "Trending" }, { key: "is_active", label: "Active" }].map(item => (
                  <label key={item.key} style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                    <input type="checkbox" checked={formData[item.key as keyof ProductFormData] as boolean}
                      onChange={e => setFormData(prev => ({ ...prev, [item.key]: e.target.checked }))}
                      style={{ width: "16px", height: "16px", accentColor: "#22c55e" }} />
                    <span style={{ fontSize: "14px", color: "var(--text)" }}>{item.label}</span>
                  </label>
                ))}
              </div>
              <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
                <button type="submit" disabled={saving} style={{ flex: "1", padding: "12px", borderRadius: "8px", border: "none", background: "#22c55e", color: "#fff", fontSize: "14px", fontWeight: "600", cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.6 : 1 }}>
                  {saving ? "Saving..." : (editingProduct ? "Update Product" : "Add Product")}
                </button>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: "12px 24px", borderRadius: "8px", border: "1px solid var(--border)", background: "transparent", color: "var(--text)", fontSize: "14px", fontWeight: "500", cursor: "pointer" }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Variant Modal */}
      {showVariantModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "20px" }}
          onClick={e => e.target === e.currentTarget && setShowVariantModal(null)}>
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "12px", width: "100%", maxWidth: "700px", maxHeight: "90vh", overflow: "auto" }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "600", color: "var(--text)", margin: 0 }}>Product Variants</h2>
              <button onClick={() => setShowVariantModal(null)} style={{ padding: "8px", border: "none", background: "transparent", color: "var(--text-secondary)", cursor: "pointer", fontSize: "18px" }}>✕</button>
            </div>
            <div style={{ padding: "24px" }}>
              {/* Existing variants */}
              {(variants[showVariantModal] || []).length > 0 && (
                <div style={{ marginBottom: "24px" }}>
                  <h3 style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "12px" }}>Existing Variants</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {(variants[showVariantModal] || []).map(v => (
                      <div key={v.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px", background: "var(--bg-secondary)", borderRadius: "8px", border: "1px solid var(--border)" }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: "14px", fontWeight: "500", color: "var(--text)" }}>{v.name}</div>
                          <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                            {v.sku && `SKU: ${v.sku} · `}Modifier: {v.price_modifier >= 0 ? "+" : ""}{formatCurrency(v.price_modifier)} · Stock: {v.stock_quantity}
                          </div>
                        </div>
                        <span style={{ padding: "3px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "600", background: v.is_active ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)", color: v.is_active ? "#22c55e" : "#ef4444" }}>{v.is_active ? "Active" : "Inactive"}</span>
                        <button onClick={() => setVariantForm(v)} style={{ padding: "5px 10px", borderRadius: "6px", border: "1px solid var(--border)", background: "transparent", color: "var(--text)", fontSize: "12px", cursor: "pointer" }}>Edit</button>
                        <button onClick={() => handleVariantDelete(showVariantModal, v.id)} style={{ padding: "5px 10px", borderRadius: "6px", border: "1px solid rgba(239,68,68,0.3)", background: "transparent", color: "#ef4444", fontSize: "12px", cursor: "pointer" }}>Delete</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Add / Edit variant form */}
              <div style={{ background: "var(--bg-secondary)", borderRadius: "8px", border: "1px solid var(--border)", padding: "20px" }}>
                <h3 style={{ fontSize: "14px", fontWeight: "600", color: "var(--text)", marginBottom: "16px" }}>
                  {variantForm.id ? "Edit Variant" : "Add Variant"}
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", color: "var(--text-secondary)", marginBottom: "4px" }}>Name * (e.g. Red / Large)</label>
                    <input type="text" value={variantForm.name || ""} onChange={e => setVariantForm(prev => ({ ...prev, name: e.target.value }))} style={inputStyle} placeholder="Color / Size" />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", color: "var(--text-secondary)", marginBottom: "4px" }}>SKU</label>
                    <input type="text" value={variantForm.sku || ""} onChange={e => setVariantForm(prev => ({ ...prev, sku: e.target.value }))} style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", color: "var(--text-secondary)", marginBottom: "4px" }}>Price Modifier ($)</label>
                    <input type="number" step="0.01" value={variantForm.price_modifier || 0} onChange={e => setVariantForm(prev => ({ ...prev, price_modifier: parseFloat(e.target.value) || 0 }))} style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", color: "var(--text-secondary)", marginBottom: "4px" }}>Stock Quantity</label>
                    <input type="number" min="0" value={variantForm.stock_quantity || 0} onChange={e => setVariantForm(prev => ({ ...prev, stock_quantity: parseInt(e.target.value) || 0 }))} style={inputStyle} />
                  </div>
                </div>
                <div style={{ marginTop: "12px" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                    <input type="checkbox" checked={variantForm.is_active !== false} onChange={e => setVariantForm(prev => ({ ...prev, is_active: e.target.checked }))} style={{ width: "16px", height: "16px", accentColor: "#22c55e" }} />
                    <span style={{ fontSize: "13px", color: "var(--text)" }}>Active</span>
                  </label>
                </div>
                <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
                  <button onClick={() => handleVariantSave(showVariantModal)} disabled={saving} style={{ padding: "10px 20px", borderRadius: "8px", border: "none", background: "#22c55e", color: "#fff", fontSize: "13px", fontWeight: "600", cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.6 : 1 }}>
                    {saving ? "Saving..." : (variantForm.id ? "Update Variant" : "Add Variant")}
                  </button>
                  {variantForm.id && (
                    <button onClick={() => setVariantForm({ name: "", sku: "", price_modifier: 0, stock_quantity: 0, is_active: true })} style={{ padding: "10px 16px", borderRadius: "8px", border: "1px solid var(--border)", background: "transparent", color: "var(--text)", fontSize: "13px", cursor: "pointer" }}>New Variant</button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Action Confirm Modal */}
      {showBulkModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "20px" }}
          onClick={e => e.target === e.currentTarget && setShowBulkModal(false)}>
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "12px", width: "100%", maxWidth: "420px", padding: "28px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: "600", color: "var(--text)", margin: "0 0 12px" }}>
              Confirm Bulk {bulkAction.charAt(0).toUpperCase() + bulkAction.slice(1)}
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "14px", margin: "0 0 24px" }}>
              Are you sure you want to {bulkAction} <strong style={{ color: "var(--text)" }}>{selectedIds.size} product(s)</strong>?
              {bulkAction === "delete" && " This action cannot be undone."}
            </p>
            <div style={{ display: "flex", gap: "12px" }}>
              <button onClick={handleBulkAction} disabled={saving} style={{ flex: 1, padding: "12px", borderRadius: "8px", border: "none", background: bulkAction === "delete" ? "#ef4444" : "#22c55e", color: "#fff", fontSize: "14px", fontWeight: "600", cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.6 : 1 }}>
                {saving ? "Processing..." : `Yes, ${bulkAction} all`}
              </button>
              <button onClick={() => setShowBulkModal(false)} style={{ padding: "12px 24px", borderRadius: "8px", border: "1px solid var(--border)", background: "transparent", color: "var(--text)", fontSize: "14px", cursor: "pointer" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", bottom: "24px", right: "24px",
          padding: "14px 20px", borderRadius: "8px",
          background: toast.type === "success" ? "#22c55e" : "#ef4444",
          color: "#fff", fontSize: "14px", fontWeight: "500",
          zIndex: 200, animation: "slideIn 0.3s ease"
        }}>
          {toast.message}
        </div>
      )}

      <style jsx global>{`
        @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        input::placeholder, textarea::placeholder { color: var(--text-secondary); }
        select option { background: var(--bg); color: var(--text); }
        @media (max-width: 640px) {
          div[style*="gridTemplateColumns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
          div[style*="gridTemplateColumns: 1fr 1fr 1fr"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 14px", borderRadius: "8px",
  border: "1px solid var(--border)", background: "var(--bg-secondary)",
  color: "var(--text)", fontSize: "14px", outline: "none", boxSizing: "border-box"
};
