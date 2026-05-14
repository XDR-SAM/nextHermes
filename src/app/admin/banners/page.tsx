"use client";
import { useState, useEffect } from "react";
import { X, Plus, Edit2, Trash2, ArrowUp, ArrowDown, Image as ImageIcon } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

// promo_banners table fields
interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  link?: string;
  link_text?: string;
  background_image?: string | null;
  background_color?: string | null;
  text_color?: string | null;
  is_active?: boolean;
  sort_order?: number;
  starts_at?: string | null;
  ends_at?: string | null;
  created_at: string;
}

const initialForm: Partial<Banner> = {
  title: "",
  subtitle: "",
  link_text: "Shop Now",
  link: "/products",
  background_image: "",
  background_color: "#0a0a0a",
  text_color: "#ffffff",
  sort_order: 0,
  is_active: false,
};

export default function AdminBannersPage() {
  const supabase = createClient();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Banner>>(initialForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchBanners = async () => {
    setLoading(true);
    // Use service role via a direct fetch to avoid RLS
    const res = await fetch("/api/banners?position=all", {
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });
    const data = await res.json();
    // If the public endpoint returns nothing due to RLS, use admin fetch
    const bannersData = data.banners?.length > 0 ? data.banners : [];
    setBanners(bannersData);
    setLoading(false);
  };

  // Admin fetch — bypasses RLS via service role
  const fetchBannersAdmin = async () => {
    const { data, error } = await supabase
      .from("promo_banners")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (!error && data) setBanners(data);
    setLoading(false);
  };

  useEffect(() => { fetchBannersAdmin(); }, []);

  const openCreate = () => {
    setForm(initialForm);
    setEditingId(null);
    setShowModal(true);
  };

  const openEdit = (banner: Banner) => {
    setForm({
      title: banner.title,
      subtitle: banner.subtitle || "",
      link_text: banner.link_text || "Shop Now",
      link: banner.link || "/products",
      background_image: banner.background_image || "",
      background_color: banner.background_color || "#0a0a0a",
      text_color: banner.text_color || "#ffffff",
      sort_order: banner.sort_order ?? 0,
      is_active: banner.is_active ?? false,
      starts_at: banner.starts_at || null,
      ends_at: banner.ends_at || null,
    });
    setEditingId(banner.id);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title?.trim()) { showToast("Title is required", "error"); return; }
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        subtitle: form.subtitle || "",
        link_text: form.link_text || "Shop Now",
        link: form.link || "/products",
        background_image: form.background_image || null,
        background_color: form.background_color || "#0a0a0a",
        text_color: form.text_color || "#ffffff",
        sort_order: form.sort_order ?? 0,
        is_active: form.is_active ?? false,
        starts_at: form.starts_at || null,
        ends_at: form.ends_at || null,
      };

      if (editingId) {
        const { error } = await supabase
          .from("promo_banners")
          .update(payload)
          .eq("id", editingId);
        if (error) throw error;
        showToast("Banner updated", "success");
      } else {
        const { error } = await supabase
          .from("promo_banners")
          .insert(payload);
        if (error) throw error;
        showToast("Banner created", "success");
      }
      setShowModal(false);
      fetchBannersAdmin();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save banner";
      showToast(msg, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this banner?")) return;
    setDeletingId(id);
    try {
      const { error } = await supabase.from("promo_banners").delete().eq("id", id);
      if (error) throw error;
      showToast("Banner deleted", "success");
      fetchBannersAdmin();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete";
      showToast(msg, "error");
    } finally {
      setDeletingId(null);
    }
  };

  const toggleActive = async (banner: Banner) => {
    const { error } = await supabase
      .from("promo_banners")
      .update({ is_active: !banner.is_active })
      .eq("id", banner.id);
    if (!error) fetchBannersAdmin();
  };

  const moveOrder = async (banner: Banner, direction: "up" | "down") => {
    const idx = banners.findIndex((b) => b.id === banner.id);
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= banners.length) return;
    const target = banners[targetIdx];
    await supabase.from("promo_banners").update({ sort_order: banner.sort_order }).eq("id", target.id);
    await supabase.from("promo_banners").update({ sort_order: target.sort_order }).eq("id", banner.id);
    fetchBannersAdmin();
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const bgStyle = {
    background: "white",
    border: "1px solid #E5E5E0",
    color: "#141413",
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
    <div>
      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: "20px", right: "20px", zIndex: 9999,
          padding: "12px 20px", borderRadius: "8px",
          background: toast.type === "success" ? "#22c55e" : "#ef4444",
          color: "#fff", fontWeight: 500, fontSize: "14px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
        }}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h2 style={{ fontSize: "24px", fontWeight: 700, color: "#141413", margin: 0 }}>Banners</h2>
          <p style={{ color: "#6B6B67", marginTop: "4px", fontSize: "14px" }}>
            Manage hero banners and promotional banners — controlled from <strong>promo_banners</strong> table
          </p>
        </div>
        <button
          onClick={openCreate}
          style={{
            display: "flex", alignItems: "center", gap: "8px",
            padding: "10px 20px", borderRadius: "8px",
            background: "#141413", color: "#FAFAF8", fontWeight: 600, fontSize: "14px",
            border: "none", cursor: "pointer",
          }}
        >
          <Plus size={16} /> Add Banner
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "32px" }}>
        {[
          { label: "Total Banners", value: banners.length },
          { label: "Active", value: banners.filter((b) => b.is_active).length },
          { label: "With Image", value: banners.filter((b) => b.background_image).length },
          { label: "Color Banners", value: banners.filter((b) => !b.background_image).length },
        ].map((stat) => (
          <div key={stat.label} style={{
            padding: "20px", borderRadius: "12px", ...bgStyle,
          }}>
            <p style={{ color: "#6B6B67", fontSize: "12px", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>{stat.label}</p>
            <p style={{ color: "#141413", fontSize: "28px", fontWeight: 700, margin: 0 }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: "white", borderRadius: "12px", border: "1px solid #E5E5E0", overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: "48px", textAlign: "center", color: "#6B6B67" }}>Loading...</div>
        ) : banners.length === 0 ? (
          <div style={{ padding: "48px", textAlign: "center" }}>
            <p style={{ color: "#6B6B67", marginBottom: "16px" }}>No banners yet</p>
            <button onClick={openCreate} style={{
              padding: "10px 20px", borderRadius: "8px",
              background: "#141413", color: "#FAFAF8", fontWeight: 600, border: "none", cursor: "pointer",
            }}>Create your first banner</button>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #E5E5E0" }}>
                  {["Status", "Title / Subtitle", "CTA", "Style", "Order", "Created", "Actions"].map((h) => (
                    <th key={h} style={{
                      padding: "12px 16px", textAlign: "left",
                      fontSize: "12px", fontWeight: 600, color: "#6B6B67",
                      textTransform: "uppercase", letterSpacing: "0.5px",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {banners.map((banner) => (
                  <tr key={banner.id} style={{ borderBottom: "1px solid #E5E5E0" }}>
                    {/* Status */}
                    <td style={{ padding: "12px 16px" }}>
                      <button
                        onClick={() => toggleActive(banner)}
                        title={banner.is_active ? "Deactivate" : "Activate"}
                        style={{
                          padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 600,
                          border: "1px solid",
                          background: banner.is_active ? "rgba(34,197,94,0.15)" : "transparent",
                          borderColor: banner.is_active ? "#22c55e" : "#E5E5E0",
                          color: banner.is_active ? "#22c55e" : "#6B6B67",
                          cursor: "pointer",
                        }}
                      >
                        {banner.is_active ? "Active" : "Draft"}
                      </button>
                    </td>
                    {/* Title / Subtitle */}
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ fontWeight: 600, color: "#141413", marginBottom: "2px" }}>{banner.title}</div>
                      {banner.subtitle && (
                        <div style={{ fontSize: "12px", color: "#6B6B67", maxWidth: "280px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {banner.subtitle}
                        </div>
                      )}
                    </td>
                    {/* CTA */}
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ fontSize: "13px", color: "#141413" }}>{banner.link_text || "Shop Now"}</span>
                      <br />
                      <span style={{ fontSize: "12px", color: "#6B6B67", opacity: 0.6 }}>{banner.link || "/products"}</span>
                    </td>
                    {/* Style Preview */}
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        {banner.background_image ? (
                          <div style={{ width: "32px", height: "32px", borderRadius: "6px", overflow: "hidden", border: "1px solid #E5E5E0" }}>
                            <img src={banner.background_image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          </div>
                        ) : (
                          <div style={{ width: "32px", height: "32px", borderRadius: "6px", background: banner.background_color || "#0a0a0a", border: "1px solid #E5E5E0" }} />
                        )}
                        <div style={{ fontSize: "12px", color: "#6B6B67" }}>
                          <span style={{ color: banner.text_color || "#fff" }}>■</span> {banner.background_image ? "Image" : "Color"}
                        </div>
                      </div>
                    </td>
                    {/* Order */}
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <span style={{ fontSize: "14px", color: "#6B6B67", minWidth: "20px" }}>{banner.sort_order ?? 0}</span>
                        <button onClick={() => moveOrder(banner, "up")} style={{ background: "none", border: "none", cursor: "pointer", color: "#6B6B67", padding: "2px" }}><ArrowUp size={14} /></button>
                        <button onClick={() => moveOrder(banner, "down")} style={{ background: "none", border: "none", cursor: "pointer", color: "#6B6B67", padding: "2px" }}><ArrowDown size={14} /></button>
                      </div>
                    </td>
                    {/* Created */}
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ fontSize: "12px", color: "#6B6B67" }}>{formatDate(banner.created_at)}</span>
                    </td>
                    {/* Actions */}
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button onClick={() => openEdit(banner)} style={{ background: "none", border: "none", cursor: "pointer", color: "#6B6B67", padding: "4px" }}><Edit2 size={16} /></button>
                        <button onClick={() => handleDelete(banner.id)} disabled={deletingId === banner.id} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", padding: "4px", opacity: deletingId === banner.id ? 0.5 : 1 }}><Trash2 size={16} /></button>
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
          position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.7)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: "20px",
        }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div style={{
            background: "white", border: "1px solid #E5E5E0",
            borderRadius: "16px", width: "100%", maxWidth: "600px", maxHeight: "90vh", overflowY: "auto",
          }}>
            {/* Modal Header */}
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #E5E5E0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#141413", margin: 0 }}>
                {editingId ? "Edit Banner" : "Create Banner"}
              </h3>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#6B6B67", padding: "4px" }}><X size={20} /></button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>

              {/* Title */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#141413", marginBottom: "6px" }}>
                  Title <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input type="text" value={form.title || ""} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Summer Sale" style={inputStyle} required />
              </div>

              {/* Subtitle */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#141413", marginBottom: "6px" }}>Subtitle / Description</label>
                <textarea value={form.subtitle || ""} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} placeholder="e.g. Up to 40% off on premium items" rows={2} style={{ ...inputStyle, resize: "vertical" }} />
              </div>

              {/* CTA */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#141413", marginBottom: "6px" }}>CTA Text</label>
                  <input type="text" value={form.link_text || ""} onChange={(e) => setForm({ ...form, link_text: e.target.value })} placeholder="Shop Now" style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#141413", marginBottom: "6px" }}>CTA Link</label>
                  <input type="text" value={form.link || ""} onChange={(e) => setForm({ ...form, link: e.target.value })} placeholder="/products" style={inputStyle} />
                </div>
              </div>

              {/* Background */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#141413", marginBottom: "6px" }}>Background Image URL (optional — leave empty for color banner)</label>
                <input type="url" value={form.background_image || ""} onChange={(e) => setForm({ ...form, background_image: e.target.value || null })} placeholder="https://..." style={inputStyle} />
                {form.background_image && (
                  <img src={form.background_image} alt="Preview" style={{ marginTop: "8px", width: "100%", height: "120px", objectFit: "cover", borderRadius: "8px", border: "1px solid #E5E5E0" }} />
                )}
              </div>

              {/* Colors */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#141413", marginBottom: "6px" }}>Background Color</label>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <input type="color" value={form.background_color || "#0a0a0a"} onChange={(e) => setForm({ ...form, background_color: e.target.value })} style={{ width: "44px", height: "38px", border: "none", background: "none", cursor: "pointer", borderRadius: "6px" }} />
                    <input type="text" value={form.background_color || ""} onChange={(e) => setForm({ ...form, background_color: e.target.value })} placeholder="#0a0a0a" style={inputStyle} />
                  </div>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#141413", marginBottom: "6px" }}>Text Color</label>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <input type="color" value={form.text_color || "#ffffff"} onChange={(e) => setForm({ ...form, text_color: e.target.value })} style={{ width: "44px", height: "38px", border: "none", background: "none", cursor: "pointer", borderRadius: "6px" }} />
                    <input type="text" value={form.text_color || ""} onChange={(e) => setForm({ ...form, text_color: e.target.value })} placeholder="#ffffff" style={inputStyle} />
                  </div>
                </div>
              </div>

              {/* Sort Order */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#141413", marginBottom: "6px" }}>Sort Order</label>
                <input type="number" value={form.sort_order ?? 0} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} style={{ ...inputStyle, maxWidth: "160px" }} />
              </div>

              {/* Schedule */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#141413", marginBottom: "6px" }}>Show From</label>
                  <input type="datetime-local" value={form.starts_at?.slice(0, 16) || ""} onChange={(e) => setForm({ ...form, starts_at: e.target.value ? new Date(e.target.value).toISOString() : null })} style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#141413", marginBottom: "6px" }}>Show Until</label>
                  <input type="datetime-local" value={form.ends_at?.slice(0, 16) || ""} onChange={(e) => setForm({ ...form, ends_at: e.target.value ? new Date(e.target.value).toISOString() : null })} style={inputStyle} />
                </div>
              </div>

              {/* Active Toggle */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px", borderRadius: "8px", border: "1px solid #E5E5E0" }}>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, is_active: !form.is_active })}
                  style={{
                    width: "44px", height: "24px", borderRadius: "12px", position: "relative",
                    background: form.is_active ? "#22c55e" : "#E5E5E0", border: "none", cursor: "pointer",
                    transition: "background 0.2s",
                  }}
                >
                  <span style={{
                    position: "absolute", top: "2px",
                    left: form.is_active ? "22px" : "2px",
                    width: "20px", height: "20px", borderRadius: "50%",
                    background: "#fff", transition: "left 0.2s",
                  }} />
                </button>
                <span style={{ fontSize: "14px", color: "#141413", fontWeight: 500 }}>
                  {form.is_active ? "✅ Active (visible on site)" : "Draft (hidden from site)"}
                </span>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: "12px", marginTop: "8px", justifyContent: "flex-end" }}>
                <button type="button" onClick={() => setShowModal(false)} style={{
                  padding: "10px 20px", borderRadius: "8px",
                  border: "1px solid #E5E5E0", background: "transparent",
                  color: "#6B6B67", fontSize: "14px", fontWeight: 600, cursor: "pointer",
                }}>Cancel</button>
                <button type="submit" disabled={saving} style={{
                  padding: "10px 24px", borderRadius: "8px",
                  background: "#141413", color: "#FAFAF8", fontSize: "14px", fontWeight: 600,
                  border: "none", cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.6 : 1,
                }}>
                  {saving ? "Saving..." : editingId ? "Update Banner" : "Create Banner"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
