"use client";
import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";

interface Category {
  id: string;
  name: string;
  slug: string;
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
  categories: { name: string } | null;
}

interface ProductFormData {
  name: string;
  slug: string;
  description: string;
  short_description: string;
  price: string;
  original_price: string;
  sku: string;
  stock_quantity: string;
  category_id: string;
  image_url: string;
  featured: boolean;
  trending: boolean;
  is_active: boolean;
}

const initialFormData: ProductFormData = {
  name: "",
  slug: "",
  description: "",
  short_description: "",
  price: "",
  original_price: "",
  sku: "",
  stock_quantity: "0",
  category_id: "",
  image_url: "",
  featured: false,
  trending: false,
  is_active: true,
};

export default function ProductsPage() {
  const supabase = createClient();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>(initialFormData);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [productsRes, categoriesRes] = await Promise.all([
      supabase
        .from("products")
        .select("*, categories(name)")
        .order("created_at", { ascending: false }),
      supabase.from("categories").select("id, name, slug").eq("is_active", true).order("name"),
    ]);
    setProducts((productsRes.data || []) as Product[]);
    setCategories((categoriesRes.data || []) as Category[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: editingProduct ? prev.slug : generateSlug(name),
    }));
  };

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
      image_url: product.image_url || "",
      featured: product.featured,
      trending: product.trending,
      is_active: product.is_active,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price) {
      showToast("Name and price are required", "error");
      return;
    }

    setSaving(true);
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
      image_url: formData.image_url || null,
      featured: formData.featured,
      trending: formData.trending,
      is_active: formData.is_active,
    };

    let result;
    if (editingProduct) {
      result = await supabase
        .from("products")
        .update(productData)
        .eq("id", editingProduct.id)
        .select()
        .single();
    } else {
      result = await supabase
        .from("products")
        .insert([productData])
        .select()
        .single();
    }

    setSaving(false);

    if (result.error) {
      showToast(`Failed to ${editingProduct ? "update" : "add"} product: ${result.error.message}`, "error");
    } else {
      showToast(`Product ${editingProduct ? "updated" : "added"} successfully!`, "success");
      setShowModal(false);
      loadData();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      showToast(`Failed to delete product: ${error.message}`, "error");
    } else {
      showToast("Product deleted successfully!", "success");
      setDeleteConfirm(null);
      loadData();
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sku?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: "600", color: "var(--text)", margin: "0 0 4px" }}>Products</h1>
          <p style={{ color: "var(--text-secondary)", margin: 0 }}>{products.length} total products</p>
        </div>
        <button onClick={openAddModal} style={{
          display: "flex", alignItems: "center", gap: "8px",
          padding: "12px 20px", borderRadius: "8px", border: "none",
          background: "#22c55e", color: "#fff", fontSize: "14px",
          fontWeight: "600", cursor: "pointer", transition: "all 0.15s ease"
        }}
        onMouseOver={(e) => e.currentTarget.style.background = "#16a34a"}
        onMouseOut={(e) => e.currentTarget.style.background = "#22c55e"}>
          <span>➕</span> Add Product
        </button>
      </div>

      {/* Search */}
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Search products by name or SKU..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: "100%", maxWidth: "400px", padding: "12px 16px",
            borderRadius: "8px", border: "1px solid var(--border)",
            background: "var(--bg-card)", color: "var(--text)",
            fontSize: "14px", outline: "none"
          }}
        />
      </div>

      {/* Table */}
      <div style={{
        background: "var(--bg-card)", border: "1px solid var(--border)",
        borderRadius: "12px", overflow: "hidden"
      }}>
        {loading ? (
          <div style={{ padding: "48px", textAlign: "center", color: "var(--text-secondary)" }}>
            Loading products...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div style={{ padding: "48px", textAlign: "center", color: "var(--text-secondary)" }}>
            {searchQuery ? "No products found matching your search" : "No products yet. Add your first product!"}
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "800px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["Image", "Name", "Category", "Price", "Stock", "Status", "Actions"].map(h => (
                    <th key={h} style={{
                      padding: "14px 16px", textAlign: "left", fontSize: "12px",
                      color: "var(--text-secondary)", fontWeight: "600",
                      textTransform: "uppercase", letterSpacing: "0.5px"
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map(product => (
                  <tr key={product.id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "12px 16px" }}>
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name}
                          style={{ width: "48px", height: "48px", objectFit: "cover", borderRadius: "8px" }}
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            (e.currentTarget.nextElementSibling as HTMLElement)!.style.display = "flex";
                          }}
                        />
                      ) : null}
                      <div style={{
                        width: "48px", height: "48px", borderRadius: "8px",
                        background: "var(--bg-secondary)", display: product.image_url ? "none" : "flex",
                        alignItems: "center", justifyContent: "center", fontSize: "20px"
                      }}>📦</div>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ fontSize: "14px", fontWeight: "500", color: "var(--text)" }}>{product.name}</div>
                      <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                        {product.featured && <span style={{ color: "#f59e0b" }}>⭐</span>}
                        {product.trending && <span style={{ color: "#ef4444" }}> 🔥</span>}
                        {product.sku && `SKU: ${product.sku}`}
                      </div>
                    </td>
                    <td style={{ padding: "14px 16px", fontSize: "14px", color: "var(--text-secondary)" }}>
                      {product.categories?.name || "—"}
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ fontSize: "14px", fontWeight: "600", color: "var(--text)" }}>
                        {formatCurrency(product.price)}
                      </div>
                      {product.original_price && product.original_price > product.price && (
                        <div style={{ fontSize: "12px", color: "var(--text-secondary)", textDecoration: "line-through" }}>
                          {formatCurrency(product.original_price)}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{
                        padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: "600",
                        background: product.stock_quantity > 10 ? "rgba(34,197,94,0.1)" :
                          product.stock_quantity > 0 ? "rgba(234,179,8,0.1)" : "rgba(239,68,68,0.1)",
                        color: product.stock_quantity > 10 ? "#22c55e" :
                          product.stock_quantity > 0 ? "#eab308" : "#ef4444"
                      }}>
                        {product.stock_quantity}
                      </span>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{
                        padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: "600",
                        background: product.is_active ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
                        color: product.is_active ? "#22c55e" : "#ef4444"
                      }}>
                        {product.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button onClick={() => openEditModal(product)} style={{
                          padding: "6px 12px", borderRadius: "6px", border: "1px solid var(--border)",
                          background: "transparent", color: "var(--text)", fontSize: "12px",
                          cursor: "pointer", transition: "all 0.15s ease"
                        }}>
                          Edit
                        </button>
                        {deleteConfirm === product.id ? (
                          <div style={{ display: "flex", gap: "4px" }}>
                            <button onClick={() => handleDelete(product.id)} style={{
                              padding: "6px 10px", borderRadius: "6px", border: "none",
                              background: "#ef4444", color: "#fff", fontSize: "12px", cursor: "pointer"
                            }}>
                              Delete
                            </button>
                            <button onClick={() => setDeleteConfirm(null)} style={{
                              padding: "6px 10px", borderRadius: "6px", border: "1px solid var(--border)",
                              background: "transparent", color: "var(--text)", fontSize: "12px", cursor: "pointer"
                            }}>
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => setDeleteConfirm(product.id)} style={{
                            padding: "6px 12px", borderRadius: "6px", border: "1px solid rgba(239,68,68,0.3)",
                            background: "transparent", color: "#ef4444", fontSize: "12px",
                            cursor: "pointer", transition: "all 0.15s ease"
                          }}>
                            Delete
                          </button>
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

      {/* Modal */}
      {showModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 100, padding: "20px"
        }}
        onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div style={{
            background: "var(--bg-card)", border: "1px solid var(--border)",
            borderRadius: "12px", width: "100%", maxWidth: "600px", maxHeight: "90vh",
            overflow: "auto"
          }}>
            <div style={{
              padding: "20px 24px", borderBottom: "1px solid var(--border)",
              display: "flex", justifyContent: "space-between", alignItems: "center"
            }}>
              <h2 style={{ fontSize: "18px", fontWeight: "600", color: "var(--text)", margin: 0 }}>
                {editingProduct ? "Edit Product" : "Add Product"}
              </h2>
              <button onClick={() => setShowModal(false)} style={{
                padding: "8px", border: "none", background: "transparent",
                color: "var(--text-secondary)", cursor: "pointer", fontSize: "18px"
              }}>✕</button>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: "24px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", color: "var(--text-secondary)", marginBottom: "6px" }}>
                    Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    required
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "13px", color: "var(--text-secondary)", marginBottom: "6px" }}>
                    Slug
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ marginTop: "16px" }}>
                <label style={{ display: "block", fontSize: "13px", color: "var(--text-secondary)", marginBottom: "6px" }}>
                  Short Description
                </label>
                <input
                  type="text"
                  value={formData.short_description}
                  onChange={(e) => setFormData(prev => ({ ...prev, short_description: e.target.value }))}
                  style={inputStyle}
                  placeholder="Brief product tagline"
                />
              </div>

              <div style={{ marginTop: "16px" }}>
                <label style={{ display: "block", fontSize: "13px", color: "var(--text-secondary)", marginBottom: "6px" }}>
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  style={{ ...inputStyle, resize: "vertical" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginTop: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", color: "var(--text-secondary)", marginBottom: "6px" }}>
                    Price *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    required
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "13px", color: "var(--text-secondary)", marginBottom: "6px" }}>
                    Original Price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.original_price}
                    onChange={(e) => setFormData(prev => ({ ...prev, original_price: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "13px", color: "var(--text-secondary)", marginBottom: "6px" }}>
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData(prev => ({ ...prev, stock_quantity: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginTop: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", color: "var(--text-secondary)", marginBottom: "6px" }}>
                    SKU
                  </label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                    style={inputStyle}
                    placeholder="Product SKU"
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "13px", color: "var(--text-secondary)", marginBottom: "6px" }}>
                    Category
                  </label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value }))}
                    style={inputStyle}
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ marginTop: "16px" }}>
                <label style={{ display: "block", fontSize: "13px", color: "var(--text-secondary)", marginBottom: "6px" }}>
                  Image URL
                </label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                  style={inputStyle}
                  placeholder="https://..."
                />
              </div>

              <div style={{ display: "flex", gap: "24px", marginTop: "20px" }}>
                {[
                  { key: "featured", label: "Featured" },
                  { key: "trending", label: "Trending" },
                  { key: "is_active", label: "Active" },
                ].map(item => (
                  <label key={item.key} style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={formData[item.key as keyof ProductFormData] as boolean}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        [item.key]: e.target.checked
                      }))}
                      style={{ width: "16px", height: "16px", accentColor: "#22c55e" }}
                    />
                    <span style={{ fontSize: "14px", color: "var(--text)" }}>{item.label}</span>
                  </label>
                ))}
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    flex: "1", padding: "12px", borderRadius: "8px", border: "none",
                    background: "#22c55e", color: "#fff", fontSize: "14px",
                    fontWeight: "600", cursor: saving ? "not-allowed" : "pointer",
                    opacity: saving ? 0.6 : 1
                  }}
                >
                  {saving ? "Saving..." : (editingProduct ? "Update Product" : "Add Product")}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: "12px 24px", borderRadius: "8px", border: "1px solid var(--border)",
                    background: "transparent", color: "var(--text)", fontSize: "14px",
                    fontWeight: "500", cursor: "pointer"
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
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
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        input::placeholder, textarea::placeholder {
          color: var(--text-secondary);
        }
        select option {
          background: var(--bg);
          color: var(--text);
        }
        @media (max-width: 640px) {
          div[style*="gridTemplateColumns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
          div[style*="gridTemplateColumns: 1fr 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
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
