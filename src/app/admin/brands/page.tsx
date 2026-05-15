"use client";
import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { Plus, Edit2, Trash2, Tag } from "lucide-react";

interface Brand {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  is_active: boolean;
  created_at: string;
  product_count?: number;
}

interface BrandFormData {
  name: string;
  slug: string;
  logo_url: string;
  is_active: boolean;
}

const initialFormData: BrandFormData = {
  name: "",
  slug: "",
  logo_url: "",
  is_active: true,
};

export default function BrandsPage() {
  const supabase = createClient();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [formData, setFormData] = useState<BrandFormData>(initialFormData);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const loadBrands = useCallback(async () => {
    setLoading(true);
    const { data: brandsData, error } = await supabase
      .from("brands")
      .select("*")
      .order("name");

    if (error) {
      showToast(`Failed to load brands: ${error.message}`, "error");
      setLoading(false);
      return;
    }

    // Get product counts per brand
    const { data: productsData } = await supabase
      .from("products")
      .select("brand_id");

    const brandsWithCount = (brandsData || []).map((brand: { id: string;[key: string]: unknown }) => ({
      ...brand,
      product_count: (productsData || []).filter((p: { brand_id: string }) => p.brand_id === brand.id).length
    })) as Brand[];

    setBrands(brandsWithCount);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    loadBrands();
  }, [loadBrands]);

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
      slug: editingBrand ? prev.slug : generateSlug(name),
    }));
  };

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const openAddModal = () => {
    setEditingBrand(null);
    setFormData(initialFormData);
    setShowModal(true);
  };

  const openEditModal = (brand: Brand) => {
    setEditingBrand(brand);
    setFormData({
      name: brand.name,
      slug: brand.slug,
      logo_url: brand.logo_url || "",
      is_active: brand.is_active,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      showToast("Name is required", "error");
      return;
    }

    setSaving(true);
    const brandData = {
      name: formData.name,
      slug: formData.slug || generateSlug(formData.name),
      logo_url: formData.logo_url || null,
      is_active: formData.is_active,
    };

    let result;
    if (editingBrand) {
      result = await supabase
        .from("brands")
        .update(brandData)
        .eq("id", editingBrand.id)
        .select()
        .single();
    } else {
      result = await supabase
        .from("brands")
        .insert([brandData])
        .select()
        .single();
    }

    setSaving(false);

    if (result.error) {
      showToast(`Failed to ${editingBrand ? "update" : "add"} brand: ${result.error.message}`, "error");
    } else {
      showToast(`Brand ${editingBrand ? "updated" : "added"} successfully!`, "success");
      setShowModal(false);
      loadBrands();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("brands").delete().eq("id", id);
    if (error) {
      showToast(`Failed to delete brand: ${error.message}`, "error");
    } else {
      showToast("Brand deleted successfully!", "success");
      setDeleteConfirm(null);
      loadBrands();
    }
  };

  const toggleActive = async (brand: Brand) => {
    const { error } = await supabase
      .from("brands")
      .update({ is_active: !brand.is_active })
      .eq("id", brand.id);

    if (error) {
      showToast(`Failed to update status: ${error.message}`, "error");
    } else {
      showToast(`Brand ${brand.is_active ? "deactivated" : "activated"}!`, "success");
      loadBrands();
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "10px 14px",
    borderRadius: "8px",
    border: "1px solid #E5E5E0",
    background: "#FAFAF8",
    color: "#141413",
    fontSize: "14px",
    outline: "none",
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: "600", color: "#141413", margin: "0 0 4px" }}>Brands</h1>
          <p style={{ color: "#6B6B67", margin: 0, fontSize: "14px" }}>{brands.length} total brands</p>
        </div>
        <button onClick={openAddModal} style={{
          display: "flex", alignItems: "center", gap: "8px",
          padding: "12px 20px", borderRadius: "8px", border: "none",
          background: "#141413", color: "#FAFAF8", fontSize: "14px",
          fontWeight: "600", cursor: "pointer", transition: "all 0.15s ease"
        }}>
          <Plus size={16} /> Add Brand
        </button>
      </div>

      {/* Table */}
      <div style={{
        background: "white", border: "1px solid #E5E5E0",
        borderRadius: "12px", overflow: "hidden"
      }}>
        {loading ? (
          <div style={{ padding: "48px", textAlign: "center", color: "#6B6B67" }}>
            Loading brands...
          </div>
        ) : brands.length === 0 ? (
          <div style={{ padding: "48px", textAlign: "center", color: "#6B6B67" }}>
            <div style={{ marginBottom: "16px" }}>
              <Tag size={48} style={{ color: "#E5E5E0" }} />
            </div>
            <p>No brands yet. Add your first brand!</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "600px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #E5E5E0" }}>
                  {["Brand", "Slug", "Products", "Status", "Actions"].map(h => (
                    <th key={h} style={{
                      padding: "14px 16px", textAlign: "left", fontSize: "12px",
                      color: "#6B6B67", fontWeight: "600",
                      textTransform: "uppercase", letterSpacing: "0.5px"
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {brands.map(brand => (
                  <tr key={brand.id} style={{ borderBottom: "1px solid #E5E5E0" }}>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        {brand.logo_url ? (
                          <img
                            src={brand.logo_url}
                            alt={brand.name}
                            style={{ width: "48px", height: "48px", objectFit: "contain", borderRadius: "8px", background: "#F4F4F1" }}
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                              const fallback = (e.target as HTMLImageElement).nextElementSibling as HTMLElement;
                              if (fallback) fallback.style.display = "flex";
                            }}
                          />
                        ) : null}
                        <div style={{
                          width: "48px", height: "48px", borderRadius: "8px",
                          background: "#F4F4F1", display: brand.logo_url ? "none" : "flex",
                          alignItems: "center", justifyContent: "center",
                          border: "1px solid #E5E5E0"
                        }}>
                          <Tag size={20} style={{ color: "#6B6B67" }} />
                        </div>
                        <div style={{ fontSize: "14px", fontWeight: "500", color: "#141413" }}>
                          {brand.name}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <code style={{
                        fontSize: "12px", padding: "4px 8px", borderRadius: "4px",
                        background: "#F4F4F1", color: "#6B6B67"
                      }}>
                        {brand.slug}
                      </code>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{
                        padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: "600",
                        background: brand.product_count && brand.product_count > 0 ? "rgba(59,130,246,0.1)" : "rgba(137,137,137,0.1)",
                        color: brand.product_count && brand.product_count > 0 ? "#3b82f6" : "#6B6B67"
                      }}>
                        {brand.product_count || 0} products
                      </span>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <button onClick={() => toggleActive(brand)} style={{
                        padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: "600",
                        border: "none", cursor: "pointer",
                        background: brand.is_active ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
                        color: brand.is_active ? "#22c55e" : "#ef4444",
                        transition: "all 0.15s ease"
                      }}>
                        {brand.is_active ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button onClick={() => openEditModal(brand)} style={{
                          padding: "6px 12px", borderRadius: "6px", border: "1px solid #E5E5E0",
                          background: "transparent", color: "#141413", fontSize: "12px",
                          cursor: "pointer", transition: "all 0.15s ease",
                          display: "flex", alignItems: "center", gap: "4px"
                        }}>
                          <Edit2 size={14} /> Edit
                        </button>
                        {deleteConfirm === brand.id ? (
                          <div style={{ display: "flex", gap: "4px" }}>
                            <button onClick={() => handleDelete(brand.id)} style={{
                              padding: "6px 10px", borderRadius: "6px", border: "none",
                              background: "#ef4444", color: "#fff", fontSize: "12px", cursor: "pointer"
                            }}>
                              Delete
                            </button>
                            <button onClick={() => setDeleteConfirm(null)} style={{
                              padding: "6px 10px", borderRadius: "6px", border: "1px solid #E5E5E0",
                              background: "transparent", color: "#141413", fontSize: "12px", cursor: "pointer"
                            }}>
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => setDeleteConfirm(brand.id)} style={{
                            padding: "6px 12px", borderRadius: "6px", border: "1px solid rgba(239,68,68,0.3)",
                            background: "transparent", color: "#ef4444", fontSize: "12px",
                            cursor: "pointer", transition: "all 0.15s ease",
                            display: "flex", alignItems: "center", gap: "4px"
                          }}>
                            <Trash2 size={14} /> Delete
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
            background: "white", border: "1px solid #E5E5E0",
            borderRadius: "12px", width: "100%", maxWidth: "500px"
          }}>
            <div style={{
              padding: "20px 24px", borderBottom: "1px solid #E5E5E0",
              display: "flex", justifyContent: "space-between", alignItems: "center"
            }}>
              <h2 style={{ fontSize: "18px", fontWeight: "600", color: "#141413", margin: 0 }}>
                {editingBrand ? "Edit Brand" : "Add Brand"}
              </h2>
              <button onClick={() => setShowModal(false)} style={{
                padding: "8px", border: "none", background: "transparent",
                color: "#6B6B67", cursor: "pointer", fontSize: "18px"
              }}>X</button>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: "24px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", color: "#6B6B67", marginBottom: "6px" }}>
                    Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    required
                    style={inputStyle}
                    placeholder="Brand name"
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "13px", color: "#6B6B67", marginBottom: "6px" }}>
                    Slug
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    style={inputStyle}
                    placeholder="brand-slug"
                  />
                </div>
              </div>

              <div style={{ marginTop: "16px" }}>
                <label style={{ display: "block", fontSize: "13px", color: "#6B6B67", marginBottom: "6px" }}>
                  Logo URL
                </label>
                <input
                  type="url"
                  value={formData.logo_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, logo_url: e.target.value }))}
                  style={inputStyle}
                  placeholder="https://example.com/logo.png"
                />
                {formData.logo_url && (
                  <div style={{ marginTop: "12px" }}>
                    <p style={{ fontSize: "12px", color: "#6B6B67", marginBottom: "8px" }}>Preview:</p>
                    <div style={{
                      width: "80px", height: "80px", borderRadius: "8px",
                      background: "#F4F4F1", border: "1px solid #E5E5E0",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      overflow: "hidden"
                    }}>
                      <img
                        src={formData.logo_url}
                        alt="Logo preview"
                        style={{ width: "100%", height: "100%", objectFit: "contain" }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div style={{ marginTop: "20px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                    style={{ width: "16px", height: "16px", accentColor: "#141413" }}
                  />
                  <span style={{ fontSize: "14px", color: "#141413" }}>Active</span>
                </label>
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    flex: "1", padding: "12px", borderRadius: "8px", border: "none",
                    background: "#141413", color: "#FAFAF8", fontSize: "14px",
                    fontWeight: "600", cursor: saving ? "not-allowed" : "pointer",
                    opacity: saving ? 0.6 : 1
                  }}
                >
                  {saving ? "Saving..." : (editingBrand ? "Update Brand" : "Add Brand")}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: "12px 24px", borderRadius: "8px", border: "1px solid #E5E5E0",
                    background: "transparent", color: "#141413", fontSize: "14px",
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
          zIndex: 200, animation: "slideIn 0.3s ease",
          boxShadow: "0 4px 20px rgba(0,0,0,0.2)"
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
          color: #6B6B67;
        }
        @media (max-width: 640px) {
          div[style*="gridTemplateColumns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}