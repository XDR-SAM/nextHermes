"use client";
import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { Plus, Tag } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  product_count?: number;
}

interface CategoryFormData {
  name: string;
  slug: string;
  description: string;
  icon: string;
  image_url: string;
  is_active: boolean;
}

const initialFormData: CategoryFormData = {
  name: "",
  slug: "",
  description: "",
  icon: "",
  image_url: "",
  is_active: true,
};

export default function CategoriesPage() {
  const supabase = createClient();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>(initialFormData);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    setLoading(true);
    // Get categories with product count
    const { data: categoriesData, error } = await supabase
      .from("categories")
      .select("*")
      .order("name");

    if (error) {
      showToast(`Failed to load categories: ${error.message}`, "error");
      setLoading(false);
      return;
    }

    // Get product counts per category
    const { data: productsData } = await supabase
      .from("products")
      .select("category_id");

    const categoriesWithCount = (categoriesData || []).map((cat: { id: string;[key: string]: unknown }) => ({
      ...cat,
      product_count: (productsData || []).filter((p: { category_id: string }) => p.category_id === cat.id).length
    })) as Category[];

    setCategories(categoriesWithCount);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

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
      slug: editingCategory ? prev.slug : generateSlug(name),
    }));
  };

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const openAddModal = () => {
    setEditingCategory(null);
    setFormData(initialFormData);
    setShowModal(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || "",
      icon: category.icon || "",
      image_url: category.image_url || "",
      is_active: category.is_active,
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
    const categoryData = {
      name: formData.name,
      slug: formData.slug || generateSlug(formData.name),
      description: formData.description || null,
      icon: formData.icon || null,
      image_url: formData.image_url || null,
      is_active: formData.is_active,
    };

    let result;
    if (editingCategory) {
      result = await supabase
        .from("categories")
        .update(categoryData)
        .eq("id", editingCategory.id)
        .select()
        .single();
    } else {
      result = await supabase
        .from("categories")
        .insert([categoryData])
        .select()
        .single();
    }

    setSaving(false);

    if (result.error) {
      showToast(`Failed to ${editingCategory ? "update" : "add"} category: ${result.error.message}`, "error");
    } else {
      showToast(`Category ${editingCategory ? "updated" : "added"} successfully!`, "success");
      setShowModal(false);
      loadCategories();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) {
      showToast(`Failed to delete category: ${error.message}`, "error");
    } else {
      showToast("Category deleted successfully!", "success");
      setDeleteConfirm(null);
      loadCategories();
    }
  };

  const toggleActive = async (category: Category) => {
    const { error } = await supabase
      .from("categories")
      .update({ is_active: !category.is_active })
      .eq("id", category.id);

    if (error) {
      showToast(`Failed to update status: ${error.message}`, "error");
    } else {
      showToast(`Category ${category.is_active ? "deactivated" : "activated"}!`, "success");
      loadCategories();
    }
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: "600", color: "#141413", margin: "0 0 4px" }}>Categories</h1>
          <p style={{ color: "#6B6B67", margin: 0 }}>{categories.length} total categories</p>
        </div>
        <button onClick={openAddModal} style={{
          display: "flex", alignItems: "center", gap: "8px",
          padding: "12px 20px", borderRadius: "8px", border: "none",
          background: "#a855f7", color: "#fff", fontSize: "14px",
          fontWeight: "600", cursor: "pointer", transition: "all 0.15s ease"
        }}
        onMouseOver={(e) => e.currentTarget.style.background = "#9333ea"}
        onMouseOut={(e) => e.currentTarget.style.background = "#a855f7"}>
          <Plus size={16} /> Add Category
        </button>
      </div>

      {/* Table */}
      <div style={{
        background: "white", border: "1px solid #E5E5E0",
        borderRadius: "12px", overflow: "hidden"
      }}>
        {loading ? (
          <div style={{ padding: "48px", textAlign: "center", color: "#6B6B67" }}>
            Loading categories...
          </div>
        ) : categories.length === 0 ? (
          <div style={{ padding: "48px", textAlign: "center", color: "#6B6B67" }}>
            No categories yet. Add your first category!
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "600px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #E5E5E0" }}>
                  {["Category", "Slug", "Products", "Status", "Actions"].map(h => (
                    <th key={h} style={{
                      padding: "14px 16px", textAlign: "left", fontSize: "12px",
                      color: "#6B6B67", fontWeight: "600",
                      textTransform: "uppercase", letterSpacing: "0.5px"
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {categories.map(category => (
                  <tr key={category.id} style={{ borderBottom: "1px solid #E5E5E0" }}>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        {category.image_url ? (
                          <img src={category.image_url} alt={category.name}
                            style={{ width: "40px", height: "40px", objectFit: "cover", borderRadius: "8px" }}
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                              (e.currentTarget.nextElementSibling as HTMLElement)!.style.display = "flex";
                            }}
                          />
                        ) : null}
                        <div style={{
                          width: "40px", height: "40px", borderRadius: "8px",
                          background: "#F4F4F1", display: category.image_url ? "none" : "flex",
                          alignItems: "center", justifyContent: "center"
                        }}>
                          {category.icon ? <Tag size={20} /> : <Tag size={20} />}
                        </div>
                        <div>
                          <div style={{ fontSize: "14px", fontWeight: "500", color: "#141413" }}>
                            {category.name}
                          </div>
                          {category.description && (
                            <div style={{ fontSize: "12px", color: "#6B6B67", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {category.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <code style={{
                        fontSize: "12px", padding: "4px 8px", borderRadius: "4px",
                        background: "#F4F4F1", color: "#6B6B67"
                      }}>
                        {category.slug}
                      </code>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{
                        padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: "600",
                        background: category.product_count && category.product_count > 0 ? "rgba(59,130,246,0.1)" : "rgba(137,137,137,0.1)",
                        color: category.product_count && category.product_count > 0 ? "#3b82f6" : "#6B6B67"
                      }}>
                        {category.product_count || 0} products
                      </span>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <button onClick={() => toggleActive(category)} style={{
                        padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: "600",
                        border: "none", cursor: "pointer",
                        background: category.is_active ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
                        color: category.is_active ? "#22c55e" : "#ef4444",
                        transition: "all 0.15s ease"
                      }}>
                        {category.is_active ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button onClick={() => openEditModal(category)} style={{
                          padding: "6px 12px", borderRadius: "6px", border: "1px solid #E5E5E0",
                          background: "transparent", color: "#141413", fontSize: "12px",
                          cursor: "pointer", transition: "all 0.15s ease"
                        }}>
                          Edit
                        </button>
                        {deleteConfirm === category.id ? (
                          <div style={{ display: "flex", gap: "4px" }}>
                            <button onClick={() => handleDelete(category.id)} style={{
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
                          <button onClick={() => setDeleteConfirm(category.id)} style={{
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
            background: "white", border: "1px solid #E5E5E0",
            borderRadius: "12px", width: "100%", maxWidth: "500px"
          }}>
            <div style={{
              padding: "20px 24px", borderBottom: "1px solid #E5E5E0",
              display: "flex", justifyContent: "space-between", alignItems: "center"
            }}>
              <h2 style={{ fontSize: "18px", fontWeight: "600", color: "#141413", margin: 0 }}>
                {editingCategory ? "Edit Category" : "Add Category"}
              </h2>
              <button onClick={() => setShowModal(false)} style={{
                padding: "8px", border: "none", background: "transparent",
                color: "#6B6B67", cursor: "pointer", fontSize: "18px"
              }}>✕</button>
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
                    placeholder="Category name"
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
                    placeholder="category-slug"
                  />
                </div>
              </div>

              <div style={{ marginTop: "16px" }}>
                <label style={{ display: "block", fontSize: "13px", color: "#6B6B67", marginBottom: "6px" }}>
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  style={{ ...inputStyle, resize: "vertical" }}
                  placeholder="Category description..."
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginTop: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", color: "#6B6B67", marginBottom: "6px" }}>
                    Icon (emoji)
                  </label>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                    style={inputStyle}
                    placeholder="🏷️"
                    maxLength={2}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "13px", color: "#6B6B67", marginBottom: "6px" }}>
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
              </div>

              <div style={{ marginTop: "20px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                    style={{ width: "16px", height: "16px", accentColor: "#a855f7" }}
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
                    background: "#a855f7", color: "#fff", fontSize: "14px",
                    fontWeight: "600", cursor: saving ? "not-allowed" : "pointer",
                    opacity: saving ? 0.6 : 1
                  }}
                >
                  {saving ? "Saving..." : (editingCategory ? "Update Category" : "Add Category")}
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

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 14px", borderRadius: "8px",
  border: "1px solid #E5E5E0", background: "#F4F4F1",
  color: "#141413", fontSize: "14px", outline: "none", boxSizing: "border-box"
};
