"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { X, Plus, Edit2, Trash2, Building2, ExternalLink } from "lucide-react";

interface TenantFormData {
  name: string;
  slug: string;
  domain: string;
  logo_url: string;
  brand_color: string;
  is_active: boolean;
}

const emptyForm: TenantFormData = {
  name: "",
  slug: "",
  domain: "",
  logo_url: "",
  brand_color: "#3ecf8e",
  is_active: true,
};

export default function TenantsPage() {
  const supabase = createClient();
  const [tenants, setTenants] = useState<Array<{
    id: string;
    name: string;
    slug: string;
    domain: string | null;
    logo_url: string | null;
    brand_color: string;
    is_active: boolean;
    created_at: string;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<TenantFormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("tenants")
      .select("id, name, slug, domain, logo_url, brand_color, is_active, created_at")
      .order("created_at", { ascending: false });
    setTenants((data || []) as typeof tenants);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const generateSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (t: typeof tenants[0]) => {
    setEditingId(t.id);
    setForm({
      name: t.name,
      slug: t.slug,
      domain: t.domain || "",
      logo_url: t.logo_url || "",
      brand_color: t.brand_color || "#3ecf8e",
      is_active: t.is_active,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { showToast("Store name is required", "error"); return; }
    if (!form.slug.trim()) { showToast("Slug is required", "error"); return; }
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      domain: form.domain.trim() || null,
      logo_url: form.logo_url.trim() || null,
      brand_color: form.brand_color,
      is_active: form.is_active,
    };
    let result;
    if (editingId) {
      result = await supabase.from("tenants").update(payload).eq("id", editingId).select().single();
    } else {
      result = await supabase.from("tenants").insert([payload]).select().single();
    }
    setSaving(false);
    if (result.error) { showToast(`Failed: ${result.error.message}`, "error"); }
    else {
      showToast(editingId ? "Tenant updated!" : "Tenant created!", "success");
      setShowModal(false);
      setEditingId(null);
      setForm(emptyForm);
      load();
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    const { error } = await supabase.from("tenants").delete().eq("id", deleteId);
    setDeleting(false);
    if (error) { showToast(`Delete failed: ${error.message}`, "error"); }
    else { showToast("Tenant deleted!", "success"); setDeleteId(null); load(); }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 14px", borderRadius: "8px",
    border: "1px solid #E5E5E0", background: "#FAFAF8",
    color: "#141413", fontSize: "14px", outline: "none", boxSizing: "border-box" as const,
  };

  return (
    <div style={{ padding: "32px", maxWidth: "1200px", background: "#FAFAF8", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: "600", color: "#141413", margin: "0 0 4px", display: "flex", alignItems: "center", gap: "12px" }}>
            <Building2 size={28} color="#141413" />
            Tenants
          </h1>
          <p style={{ color: "#6B6B67", margin: 0, fontSize: "13px" }}>
            {loading ? "Loading..." : `${tenants.length} store${tenants.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <button onClick={openCreate} style={{
          padding: "10px 20px", borderRadius: "8px", border: "none",
          background: "#141413", color: "#fff", fontSize: "14px", fontWeight: "600",
          cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "8px"
        }}>
          <Plus size={18} /> Create Tenant
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", marginBottom: "24px" }}>
        {[
          { label: "Total Stores", value: tenants.length, color: "#141413" },
          { label: "Active", value: tenants.filter(t => t.is_active).length, color: "#22c55e" },
          { label: "Inactive", value: tenants.filter(t => !t.is_active).length, color: "#898989" },
          { label: "With Domain", value: tenants.filter(t => t.domain).length, color: "#60a5fa" },
        ].map(s => (
          <div key={s.label} style={{ padding: "20px", borderRadius: "12px", background: "white", border: "1px solid #E5E5E0" }}>
            <div style={{ fontSize: "11px", color: "#6B6B67", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>{s.label}</div>
            <div style={{ fontSize: "28px", fontWeight: "700", color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: "white", border: "1px solid #E5E5E0", borderRadius: "12px", overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: "48px", textAlign: "center", color: "#6B6B67" }}>Loading...</div>
        ) : tenants.length === 0 ? (
          <div style={{ padding: "64px", textAlign: "center", color: "#6B6B67" }}>
            <Building2 size={48} color="#E5E5E0" style={{ marginBottom: "16px" }} />
            <div style={{ fontSize: "16px", fontWeight: "500", color: "#141413", marginBottom: "8px" }}>No tenants yet</div>
            <div style={{ fontSize: "14px", marginBottom: "20px" }}>Create your first tenant to get started</div>
            <button onClick={openCreate} style={{
              padding: "10px 20px", borderRadius: "8px", border: "none",
              background: "#141413", color: "#fff", fontSize: "14px", fontWeight: "600",
              cursor: "pointer"
            }}>Create First Tenant</button>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "700px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #E5E5E0", background: "#FAFAF8" }}>
                  {["Logo", "Name", "Slug", "Domain", "Brand Color", "Status", "Actions"].map(h => (
                    <th key={h} style={{ padding: "14px 16px", textAlign: "left", fontSize: "12px", color: "#6B6B67", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tenants.map(t => (
                  <tr key={t.id} style={{ borderBottom: "1px solid #E5E5E0", transition: "background 0.15s" }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#FAFAF8"}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}>
                    {/* Logo */}
                    <td style={{ padding: "14px 16px" }}>
                      {t.logo_url ? (
                        <img src={t.logo_url} alt="" style={{ width: "36px", height: "36px", borderRadius: "8px", objectFit: "cover" }} />
                      ) : (
                        <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: t.brand_color + "20", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Building2 size={18} color={t.brand_color} />
                        </div>
                      )}
                    </td>
                    {/* Name */}
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{ fontSize: "14px", fontWeight: "600", color: "#141413" }}>{t.name}</span>
                    </td>
                    {/* Slug */}
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{ fontSize: "13px", color: "#6B6B67", fontFamily: "monospace" }}>/{t.slug}</span>
                    </td>
                    {/* Domain */}
                    <td style={{ padding: "14px 16px" }}>
                      {t.domain ? (
                        <a href={`https://${t.domain}`} target="_blank" rel="noopener noreferrer" style={{
                          fontSize: "13px", color: "#60a5fa", display: "inline-flex",
                          alignItems: "center", gap: "4px", textDecoration: "none"
                        }}>
                          {t.domain} <ExternalLink size={12} />
                        </a>
                      ) : <span style={{ color: "#BDBDBD", fontSize: "13px" }}>—</span>}
                    </td>
                    {/* Color swatch */}
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ width: "24px", height: "24px", borderRadius: "6px", background: t.brand_color, border: "1px solid #E5E5E0" }} />
                        <span style={{ fontSize: "12px", color: "#6B6B67", fontFamily: "monospace" }}>{t.brand_color}</span>
                      </div>
                    </td>
                    {/* Status */}
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{
                        padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: "600",
                        background: t.is_active ? "rgba(34,197,94,0.1)" : "rgba(137,137,137,0.1)",
                        color: t.is_active ? "#22c55e" : "#898989",
                      }}>
                        {t.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    {/* Actions */}
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button onClick={() => openEdit(t)} style={{
                          padding: "6px 10px", borderRadius: "6px", border: "1px solid #E5E5E0",
                          background: "transparent", color: "#141413", fontSize: "12px", cursor: "pointer",
                          display: "inline-flex", alignItems: "center", gap: "4px"
                        }}>
                          <Edit2 size={13} /> Edit
                        </button>
                        <button onClick={() => setDeleteId(t.id)} style={{
                          padding: "6px 10px", borderRadius: "6px", border: "1px solid rgba(239,68,68,0.3)",
                          background: "transparent", color: "#ef4444", fontSize: "12px", cursor: "pointer",
                          display: "inline-flex", alignItems: "center", gap: "4px"
                        }}>
                          <Trash2 size={13} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "20px" }}
          onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div style={{ background: "white", border: "1px solid #E5E5E0", borderRadius: "12px", width: "100%", maxWidth: "520px", padding: "28px", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "600", color: "#141413", margin: 0 }}>
                {editingId ? "Edit Tenant" : "Create Tenant"}
              </h2>
              <button onClick={() => { setShowModal(false); setEditingId(null); }} style={{ padding: "8px", border: "none", background: "transparent", color: "#6B6B67", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Name */}
              <div>
                <label style={{ display: "block", fontSize: "13px", color: "#6B6B67", marginBottom: "6px", fontWeight: "500" }}>
                  Store Name <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => {
                    setForm(prev => ({ ...prev, name: e.target.value, slug: generateSlug(e.target.value) }));
                  }}
                  placeholder="e.g. Acme Corp"
                  style={inputStyle}
                />
              </div>
              {/* Slug */}
              <div>
                <label style={{ display: "block", fontSize: "13px", color: "#6B6B67", marginBottom: "6px", fontWeight: "500" }}>
                  Slug <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={e => setForm(prev => ({ ...prev, slug: e.target.value.replace(/\s+/g, "-").toLowerCase() }))}
                  placeholder="acme-corp"
                  style={inputStyle}
                />
              </div>
              {/* Domain */}
              <div>
                <label style={{ display: "block", fontSize: "13px", color: "#6B6B67", marginBottom: "6px", fontWeight: "500" }}>
                  Domain
                </label>
                <input
                  type="text"
                  value={form.domain}
                  onChange={e => setForm(prev => ({ ...prev, domain: e.target.value }))}
                  placeholder="store.example.com"
                  style={inputStyle}
                />
              </div>
              {/* Logo URL */}
              <div>
                <label style={{ display: "block", fontSize: "13px", color: "#6B6B67", marginBottom: "6px", fontWeight: "500" }}>
                  Logo URL
                </label>
                <input
                  type="url"
                  value={form.logo_url}
                  onChange={e => setForm(prev => ({ ...prev, logo_url: e.target.value }))}
                  placeholder="https://example.com/logo.png"
                  style={inputStyle}
                />
                {form.logo_url && (
                  <img src={form.logo_url} alt="Preview" style={{ marginTop: "8px", width: "60px", height: "60px", borderRadius: "8px", objectFit: "cover", border: "1px solid #E5E5E0" }} />
                )}
              </div>
              {/* Brand Color */}
              <div>
                <label style={{ display: "block", fontSize: "13px", color: "#6B6B67", marginBottom: "6px", fontWeight: "500" }}>
                  Brand Color
                </label>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <input
                    type="color"
                    value={form.brand_color}
                    onChange={e => setForm(prev => ({ ...prev, brand_color: e.target.value }))}
                    style={{ width: "44px", height: "40px", borderRadius: "8px", border: "1px solid #E5E5E0", cursor: "pointer" }}
                  />
                  <input
                    type="text"
                    value={form.brand_color}
                    onChange={e => setForm(prev => ({ ...prev, brand_color: e.target.value }))}
                    placeholder="#3ecf8e"
                    style={{ ...inputStyle, flex: "1" }}
                  />
                </div>
              </div>
              {/* Active toggle */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px", borderRadius: "8px", background: "#FAFAF8", border: "1px solid #E5E5E0" }}>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: "500", color: "#141413" }}>Active Status</div>
                  <div style={{ fontSize: "12px", color: "#6B6B67", marginTop: "2px" }}>Tenant is operational</div>
                </div>
                <button
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, is_active: !prev.is_active }))}
                  style={{ padding: "8px", border: "none", background: "transparent", cursor: "pointer" }}
                >
                  {form.is_active ? (
                    <div style={{ width: "44px", height: "24px", borderRadius: "12px", background: "#22c55e", position: "relative" }}>
                      <span style={{ position: "absolute", top: "2px", left: "22px", width: "20px", height: "20px", borderRadius: "50%", background: "#fff" }} />
                    </div>
                  ) : (
                    <div style={{ width: "44px", height: "24px", borderRadius: "12px", background: "#E5E5E0", position: "relative" }}>
                      <span style={{ position: "absolute", top: "2px", left: "2px", width: "20px", height: "20px", borderRadius: "50%", background: "#fff" }} />
                    </div>
                  )}
                </button>
              </div>
            </div>
            <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
              <button onClick={handleSave} disabled={saving} style={{
                flex: 1, padding: "12px", borderRadius: "8px", border: "none",
                background: "#141413", color: "#fff", fontSize: "14px", fontWeight: "600",
                cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.6 : 1
              }}>
                {saving ? (editingId ? "Updating..." : "Creating...") : (editingId ? "Update Tenant" : "Create Tenant")}
              </button>
              <button onClick={() => { setShowModal(false); setEditingId(null); }} style={{
                padding: "12px 24px", borderRadius: "8px", border: "1px solid #E5E5E0",
                background: "transparent", color: "#141413", fontSize: "14px", cursor: "pointer"
              }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteId && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "20px" }}
          onClick={e => e.target === e.currentTarget && setDeleteId(null)}>
          <div style={{ background: "white", border: "1px solid #E5E5E0", borderRadius: "12px", width: "100%", maxWidth: "400px", padding: "28px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "600", color: "#141413", margin: 0 }}>Delete Tenant</h2>
              <button onClick={() => setDeleteId(null)} style={{ padding: "8px", border: "none", background: "transparent", color: "#6B6B67", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>
            <p style={{ fontSize: "14px", color: "#6B6B67", margin: "0 0 24px", lineHeight: "1.6" }}>
              Are you sure you want to delete this tenant? This action cannot be undone.
            </p>
            <div style={{ display: "flex", gap: "12px" }}>
              <button onClick={handleDelete} disabled={deleting} style={{
                flex: 1, padding: "12px", borderRadius: "8px", border: "none",
                background: "#ef4444", color: "#fff", fontSize: "14px", fontWeight: "600",
                cursor: deleting ? "not-allowed" : "pointer", opacity: deleting ? 0.6 : 1
              }}>
                {deleting ? "Deleting..." : "Delete"}
              </button>
              <button onClick={() => setDeleteId(null)} style={{
                padding: "12px 24px", borderRadius: "8px", border: "1px solid #E5E5E0",
                background: "transparent", color: "#141413", fontSize: "14px", cursor: "pointer"
              }}>Cancel</button>
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
          zIndex: 200, animation: "slideIn 0.3s ease", boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
        }}>
          {toast.message}
        </div>
      )}

      <style jsx global>{`
        @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        input::placeholder, select option { background: #FAFAF8; color: #6B6B67; }
        input:focus { outline: none; border-color: #141413 !important; }
      `}</style>
    </div>
  );
}