"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { X, Plus, Edit2, Trash2, Eye, EyeOff, ArrowUp, ArrowDown, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  cta_text?: string;
  cta_link?: string;
  background_image?: string;
  text_color?: string;
  button_style?: string;
  position?: string;
  sort_order?: number;
  is_active?: boolean;
  show_from?: string;
  show_until?: string;
  click_count?: number;
  impression_count?: number;
  created_at: string;
  updated_at: string;
}

const POSITIONS = ["hero", "promo", "announcement", "footer"];
const POSITION_LABELS: Record<string, string> = {
  hero: "Hero Section",
  promo: "Promo Banner",
  announcement: "Announcement",
  footer: "Footer Banner",
};
const BUTTON_STYLES = ["primary", "secondary", "outline"];
const TEXT_COLORS = ["white", "black", "dark"];

const initialForm: Partial<Banner> = {
  title: "",
  subtitle: "",
  description: "",
  cta_text: "Shop Now",
  cta_link: "/products",
  background_image: "",
  text_color: "white",
  button_style: "primary",
  position: "hero",
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
    const { data, error } = await supabase
      .from("banners")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (!error) setBanners(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchBanners(); }, []);

  const openCreate = () => {
    setForm(initialForm);
    setEditingId(null);
    setShowModal(true);
  };

  const openEdit = (banner: Banner) => {
    setForm({ ...banner });
    setEditingId(banner.id);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title?.trim()) { showToast("Title is required", "error"); return; }
    setSaving(true);
    try {
      if (editingId) {
        const { error } = await supabase
          .from("banners")
          .update(form)
          .eq("id", editingId);
        if (error) throw error;
        showToast("Banner updated", "success");
      } else {
        const { error } = await supabase.from("banners").insert(form);
        if (error) throw error;
        showToast("Banner created", "success");
      }
      setShowModal(false);
      fetchBanners();
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
      const { error } = await supabase.from("banners").delete().eq("id", id);
      if (error) throw error;
      showToast("Banner deleted", "success");
      fetchBanners();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete";
      showToast(msg, "error");
    } finally {
      setDeletingId(null);
    }
  };

  const toggleActive = async (banner: Banner) => {
    const { error } = await supabase
      .from("banners")
      .update({ is_active: !banner.is_active })
      .eq("id", banner.id);
    if (!error) fetchBanners();
  };

  const moveOrder = async (banner: Banner, direction: "up" | "down") => {
    const others = banners.filter((b) => b.position === banner.position);
    const idx = others.findIndex((b) => b.id === banner.id);
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= others.length) return;
    const target = others[targetIdx];
    await supabase.from("banners").update({ sort_order: banner.sort_order }).eq("id", target.id);
    await supabase.from("banners").update({ sort_order: target.sort_order }).eq("id", banner.id);
    fetchBanners();
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

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
          <h2 style={{ fontSize: "24px", fontWeight: 700, color: "var(--text)", margin: 0 }}>Banners</h2>
          <p style={{ color: "var(--text-secondary)", marginTop: "4px", fontSize: "14px" }}>
            Manage hero, promo, and announcement banners
          </p>
        </div>
        <button
          onClick={openCreate}
          style={{
            display: "flex", alignItems: "center", gap: "8px",
            padding: "10px 20px", borderRadius: "8px",
            background: "#fff", color: "#000", fontWeight: 600, fontSize: "14px",
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
          { label: "Hero Banners", value: banners.filter((b) => b.position === "hero").length },
          { label: "Total Impressions", value: banners.reduce((s, b) => s + (b.impression_count || 0), 0).toLocaleString() },
        ].map((stat) => (
          <div key={stat.label} style={{
            padding: "20px", borderRadius: "12px",
            background: "var(--bg-card)", border: "1px solid var(--border)",
          }}>
            <p style={{ color: "var(--text-secondary)", fontSize: "12px", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>{stat.label}</p>
            <p style={{ color: "var(--text)", fontSize: "28px", fontWeight: 700, margin: 0 }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: "var(--bg-card)", borderRadius: "12px", border: "1px solid var(--border)", overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: "48px", textAlign: "center", color: "var(--text-secondary)" }}>Loading...</div>
        ) : banners.length === 0 ? (
          <div style={{ padding: "48px", textAlign: "center" }}>
            <p style={{ color: "var(--text-secondary)", marginBottom: "16px" }}>No banners yet</p>
            <button onClick={openCreate} style={{
              padding: "10px 20px", borderRadius: "8px",
              background: "#fff", color: "#000", fontWeight: 600, border: "none", cursor: "pointer",
            }}>Create your first banner</button>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["Status", "Title", "Position", "CTA", "Order", "Impressions", "Updated", "Actions"].map((h) => (
                    <th key={h} style={{
                      padding: "12px 16px", textAlign: "left",
                      fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)",
                      textTransform: "uppercase", letterSpacing: "0.5px",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {banners.map((banner) => (
                  <tr key={banner.id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "12px 16px" }}>
                      <button
                        onClick={() => toggleActive(banner)}
                        title={banner.is_active ? "Deactivate" : "Activate"}
                        style={{
                          padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 600,
                          border: "1px solid",
                          background: banner.is_active ? "rgba(34,197,94,0.15)" : "transparent",
                          borderColor: banner.is_active ? "#22c55e" : "var(--border)",
                          color: banner.is_active ? "#22c55e" : "var(--text-secondary)",
                          cursor: "pointer",
                        }}
                      >
                        {banner.is_active ? "Active" : "Draft"}
                      </button>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ fontWeight: 500, color: "var(--text)", marginBottom: "2px" }}>{banner.title}</div>
                      {banner.subtitle && (
                        <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{banner.subtitle}</div>
                      )}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{
                        padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 600,
                        background: "rgba(255,255,255,0.08)", color: "var(--text-secondary)",
                      }}>
                        {POSITION_LABELS[banner.position || "hero"]}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{banner.cta_text || "Shop Now"}</span>
                      <br />
                      <span style={{ fontSize: "12px", color: "var(--text-secondary)", opacity: 0.6 }}>{banner.cta_link || "/products"}</span>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <span style={{ fontSize: "14px", color: "var(--text-secondary)", minWidth: "20px" }}>{banner.sort_order}</span>
                        <button onClick={() => moveOrder(banner, "up")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)", padding: "2px" }}><ArrowUp size={14} /></button>
                        <button onClick={() => moveOrder(banner, "down")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)", padding: "2px" }}><ArrowDown size={14} /></button>
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ fontSize: "14px", color: "var(--text)" }}>{banner.impression_count || 0}</span>
                      <br />
                      <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Clicks: {banner.click_count || 0}</span>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{formatDate(banner.updated_at)}</span>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button onClick={() => openEdit(banner)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)", padding: "4px" }}><Edit2 size={16} /></button>
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
            background: "var(--bg-card)", border: "1px solid var(--border)",
            borderRadius: "16px", width: "100%", maxWidth: "600px", maxHeight: "90vh", overflowY: "auto",
          }}>
            {/* Modal Header */}
            <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text)", margin: 0 }}>
                {editingId ? "Edit Banner" : "Create Banner"}
              </h3>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)", padding: "4px" }}><X size={20} /></button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Title */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--text)", marginBottom: "6px" }}>
                  Title <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="text"
                  value={form.title || ""}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Summer Sale 2025"
                  style={{
                    width: "100%", padding: "10px 14px", borderRadius: "8px",
                    border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)",
                    fontSize: "14px", outline: "none",
                  }}
                  required
                />
              </div>

              {/* Subtitle */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--text)", marginBottom: "6px" }}>Subtitle</label>
                <input
                  type="text"
                  value={form.subtitle || ""}
                  onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                  placeholder="Short tagline"
                  style={{
                    width: "100%", padding: "10px 14px", borderRadius: "8px",
                    border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)",
                    fontSize: "14px", outline: "none",
                  }}
                />
              </div>

              {/* Description */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--text)", marginBottom: "6px" }}>Description</label>
                <textarea
                  value={form.description || ""}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Full description text"
                  rows={3}
                  style={{
                    width: "100%", padding: "10px 14px", borderRadius: "8px",
                    border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)",
                    fontSize: "14px", outline: "none", resize: "vertical",
                  }}
                />
              </div>

              {/* Two column: Position + Sort Order */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--text)", marginBottom: "6px" }}>Position</label>
                  <select
                    value={form.position || "hero"}
                    onChange={(e) => setForm({ ...form, position: e.target.value })}
                    style={{
                      width: "100%", padding: "10px 14px", borderRadius: "8px",
                      border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)",
                      fontSize: "14px", outline: "none",
                    }}
                  >
                    {POSITIONS.map((p) => (
                      <option key={p} value={p}>{POSITION_LABELS[p]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--text)", marginBottom: "6px" }}>Sort Order</label>
                  <input
                    type="number"
                    value={form.sort_order ?? 0}
                    onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
                    style={{
                      width: "100%", padding: "10px 14px", borderRadius: "8px",
                      border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)",
                      fontSize: "14px", outline: "none",
                    }}
                  />
                </div>
              </div>

              {/* CTA */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--text)", marginBottom: "6px" }}>CTA Text</label>
                  <input
                    type="text"
                    value={form.cta_text || ""}
                    onChange={(e) => setForm({ ...form, cta_text: e.target.value })}
                    placeholder="Shop Now"
                    style={{
                      width: "100%", padding: "10px 14px", borderRadius: "8px",
                      border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)",
                      fontSize: "14px", outline: "none",
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--text)", marginBottom: "6px" }}>CTA Link</label>
                  <input
                    type="text"
                    value={form.cta_link || ""}
                    onChange={(e) => setForm({ ...form, cta_link: e.target.value })}
                    placeholder="/products"
                    style={{
                      width: "100%", padding: "10px 14px", borderRadius: "8px",
                      border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)",
                      fontSize: "14px", outline: "none",
                    }}
                  />
                </div>
              </div>

              {/* Background Image */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--text)", marginBottom: "6px" }}>Background Image URL</label>
                <input
                  type="url"
                  value={form.background_image || ""}
                  onChange={(e) => setForm({ ...form, background_image: e.target.value })}
                  placeholder="https://..."
                  style={{
                    width: "100%", padding: "10px 14px", borderRadius: "8px",
                    border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)",
                    fontSize: "14px", outline: "none",
                  }}
                />
                {form.background_image && (
                  <img src={form.background_image} alt="Preview" style={{ marginTop: "8px", width: "100%", height: "120px", objectFit: "cover", borderRadius: "8px", border: "1px solid var(--border)" }} />
                )}
              </div>

              {/* Style options */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--text)", marginBottom: "6px" }}>Text Color</label>
                  <select
                    value={form.text_color || "white"}
                    onChange={(e) => setForm({ ...form, text_color: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)", fontSize: "14px", outline: "none" }}
                  >
                    {TEXT_COLORS.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--text)", marginBottom: "6px" }}>Button Style</label>
                  <select
                    value={form.button_style || "primary"}
                    onChange={(e) => setForm({ ...form, button_style: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)", fontSize: "14px", outline: "none" }}
                  >
                    {BUTTON_STYLES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--text)", marginBottom: "6px" }}>Active?</label>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, is_active: !form.is_active })}
                      style={{
                        width: "44px", height: "24px", borderRadius: "12px", position: "relative",
                        background: form.is_active ? "#22c55e" : "var(--border)", border: "none", cursor: "pointer",
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
                    <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}>{form.is_active ? "Yes" : "No"}</span>
                  </div>
                </div>
              </div>

              {/* Schedule */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--text)", marginBottom: "6px" }}>Show From</label>
                  <input
                    type="datetime-local"
                    value={form.show_from?.slice(0, 16) || ""}
                    onChange={(e) => setForm({ ...form, show_from: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)", fontSize: "14px", outline: "none" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--text)", marginBottom: "6px" }}>Show Until</label>
                  <input
                    type="datetime-local"
                    value={form.show_until?.slice(0, 16) || ""}
                    onChange={(e) => setForm({ ...form, show_until: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)", fontSize: "14px", outline: "none" }}
                  />
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: "12px", marginTop: "8px", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: "10px 20px", borderRadius: "8px",
                    border: "1px solid var(--border)", background: "transparent",
                    color: "var(--text-secondary)", fontSize: "14px", fontWeight: 600, cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    padding: "10px 24px", borderRadius: "8px",
                    background: "#fff", color: "#000", fontSize: "14px", fontWeight: 600,
                    border: "none", cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.6 : 1,
                  }}
                >
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