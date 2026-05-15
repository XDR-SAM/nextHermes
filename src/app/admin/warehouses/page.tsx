"use client";
import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { Warehouse, Plus, Pencil, Trash2, X, MapPin, Phone, User, ToggleLeft, ToggleRight, Building2 } from "lucide-react";

interface Warehouse {
  id: string;
  name: string;
  location: string | null;
  capacity: number | null;
  manager_name: string | null;
  contact_phone: string | null;
  is_active: boolean;
  created_at: string;
}

interface WarehouseFormData {
  name: string;
  location: string;
  capacity: string;
  manager_name: string;
  contact_phone: string;
  is_active: boolean;
}

const emptyForm: WarehouseFormData = {
  name: "",
  location: "",
  capacity: "",
  manager_name: "",
  contact_phone: "",
  is_active: true,
};

export default function WarehousesPage() {
  const supabase = createClient();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<WarehouseFormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const loadWarehouses = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("warehouses")
      .select("id, name, location, capacity, manager_name, contact_phone, is_active, created_at")
      .order("name");
    if (!error && data) {
      setWarehouses(data as Warehouse[]);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => { loadWarehouses(); }, [loadWarehouses]);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const openCreate = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setShowModal(true);
  };

  const openEdit = (w: Warehouse) => {
    setEditingId(w.id);
    setFormData({
      name: w.name,
      location: w.location || "",
      capacity: w.capacity ? String(w.capacity) : "",
      manager_name: w.manager_name || "",
      contact_phone: w.contact_phone || "",
      is_active: w.is_active,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) { showToast("Warehouse name is required", "error"); return; }
    setSaving(true);
    const payload = {
      name: formData.name.trim(),
      location: formData.location.trim() || null,
      capacity: formData.capacity ? parseInt(formData.capacity) : null,
      manager_name: formData.manager_name.trim() || null,
      contact_phone: formData.contact_phone.trim() || null,
      is_active: formData.is_active,
    };
    let result;
    if (editingId) {
      result = await supabase.from("warehouses").update(payload).eq("id", editingId).select().single();
    } else {
      result = await supabase.from("warehouses").insert([payload]).select().single();
    }
    setSaving(false);
    if (result.error) { showToast(`Failed: ${result.error.message}`, "error"); }
    else {
      showToast(editingId ? "Warehouse updated!" : "Warehouse created!", "success");
      setShowModal(false);
      setEditingId(null);
      setFormData(emptyForm);
      loadWarehouses();
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    const { error } = await supabase.from("warehouses").delete().eq("id", deleteId);
    setDeleting(false);
    if (error) { showToast(`Delete failed: ${error.message}`, "error"); }
    else { showToast("Warehouse deleted!", "success"); setDeleteId(null); loadWarehouses(); }
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: "600", color: "#141413", margin: "0 0 4px", display: "flex", alignItems: "center", gap: "12px" }}>
            <Warehouse size={28} color="#141413" />
            Warehouses
          </h1>
          <p style={{ color: "#6B6B67", margin: 0, fontSize: "13px" }}>
            {loading ? "Loading..." : `${warehouses.length} warehouse${warehouses.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <button onClick={openCreate} style={{
          padding: "10px 20px", borderRadius: "8px", border: "none",
          background: "#141413", color: "#fff", fontSize: "14px", fontWeight: "600",
          cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "8px"
        }}>
          <Plus size={18} />
          Add Warehouse
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "24px" }}>
        {[
          { label: "Total Warehouses", value: warehouses.length.toString(), color: "#141413" },
          { label: "Active", value: warehouses.filter(w => w.is_active).length.toString(), color: "#22c55e" },
          { label: "Inactive", value: warehouses.filter(w => !w.is_active).length.toString(), color: "#898989" },
          { label: "With Managers", value: warehouses.filter(w => w.manager_name).length.toString(), color: "#60a5fa" },
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
          <div style={{ padding: "48px", textAlign: "center", color: "#6B6B67" }}>
            <div style={{ marginBottom: "12px" }}>
              <Building2 size={32} color="#E5E5E0" style={{ animation: "spin 1s linear infinite" }} />
            </div>
            Loading warehouses...
          </div>
        ) : warehouses.length === 0 ? (
          <div style={{ padding: "64px", textAlign: "center", color: "#6B6B67" }}>
            <Warehouse size={48} color="#E5E5E0" style={{ marginBottom: "16px" }} />
            <div style={{ fontSize: "16px", fontWeight: "500", color: "#141413", marginBottom: "8px" }}>No warehouses yet</div>
            <div style={{ fontSize: "14px", marginBottom: "20px" }}>Add your first warehouse to get started</div>
            <button onClick={openCreate} style={{
              padding: "10px 20px", borderRadius: "8px", border: "none",
              background: "#141413", color: "#fff", fontSize: "14px", fontWeight: "600",
              cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "8px"
            }}>
              <Plus size={16} /> Add Warehouse
            </button>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "800px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #E5E5E0", background: "#FAFAF8" }}>
                  {["Name", "Location", "Capacity", "Manager", "Phone", "Status", "Created", "Actions"].map(h => (
                    <th key={h} style={{ padding: "14px 16px", textAlign: "left", fontSize: "12px", color: "#6B6B67", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {warehouses.map(w => (
                  <tr key={w.id} style={{ borderBottom: "1px solid #E5E5E0", transition: "background 0.15s" }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#FAFAF8"}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "rgba(20,20,19,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Warehouse size={18} color="#141413" />
                        </div>
                        <span style={{ fontSize: "14px", fontWeight: "600", color: "#141413" }}>{w.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      {w.location ? (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "13px", color: "#6B6B67" }}>
                          <MapPin size={12} color="#6B6B67" />
                          {w.location}
                        </span>
                      ) : <span style={{ color: "#BDBDBD", fontSize: "13px" }}>—</span>}
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      {w.capacity != null ? (
                        <span style={{ fontSize: "13px", color: "#141413", fontWeight: "500" }}>{w.capacity.toLocaleString()} units</span>
                      ) : <span style={{ color: "#BDBDBD", fontSize: "13px" }}>—</span>}
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      {w.manager_name ? (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "13px", color: "#141413" }}>
                          <User size={12} color="#6B6B67" />
                          {w.manager_name}
                        </span>
                      ) : <span style={{ color: "#BDBDBD", fontSize: "13px" }}>Unassigned</span>}
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      {w.contact_phone ? (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "13px", color: "#6B6B67" }}>
                          <Phone size={12} color="#6B6B67" />
                          {w.contact_phone}
                        </span>
                      ) : <span style={{ color: "#BDBDBD", fontSize: "13px" }}>—</span>}
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{
                        padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: "600",
                        background: w.is_active ? "rgba(34,197,94,0.1)" : "rgba(137,137,137,0.1)",
                        color: w.is_active ? "#22c55e" : "#898989",
                      }}>
                        {w.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td style={{ padding: "14px 16px", fontSize: "12px", color: "#6B6B67" }}>
                      {w.created_at ? new Date(w.created_at).toLocaleDateString() : "—"}
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button onClick={() => openEdit(w)} style={{
                          padding: "6px 10px", borderRadius: "6px", border: "1px solid #E5E5E0",
                          background: "transparent", color: "#141413", fontSize: "12px", cursor: "pointer",
                          display: "inline-flex", alignItems: "center", gap: "4px"
                        }}>
                          <Pencil size={13} />
                          Edit
                        </button>
                        <button onClick={() => setDeleteId(w.id)} style={{
                          padding: "6px 10px", borderRadius: "6px", border: "1px solid rgba(239,68,68,0.3)",
                          background: "transparent", color: "#ef4444", fontSize: "12px", cursor: "pointer",
                          display: "inline-flex", alignItems: "center", gap: "4px"
                        }}>
                          <Trash2 size={13} />
                          Delete
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
                {editingId ? "Edit Warehouse" : "Add Warehouse"}
              </h2>
              <button onClick={() => { setShowModal(false); setEditingId(null); }} style={{ padding: "8px", border: "none", background: "transparent", color: "#6B6B67", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", color: "#6B6B67", marginBottom: "6px", fontWeight: "500" }}>
                  Warehouse Name <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input type="text" value={formData.name} onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Main Distribution Center" style={inputStyle} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "13px", color: "#6B6B67", marginBottom: "6px", fontWeight: "500" }}>Location</label>
                <input type="text" value={formData.location} onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="e.g. 123 Industrial Ave, Los Angeles, CA" style={inputStyle} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "13px", color: "#6B6B67", marginBottom: "6px", fontWeight: "500" }}>Storage Capacity (units)</label>
                <input type="number" min="0" value={formData.capacity} onChange={e => setFormData(prev => ({ ...prev, capacity: e.target.value }))}
                  placeholder="e.g. 10000" style={inputStyle} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "13px", color: "#6B6B67", marginBottom: "6px", fontWeight: "500" }}>Manager Name</label>
                <input type="text" value={formData.manager_name} onChange={e => setFormData(prev => ({ ...prev, manager_name: e.target.value }))}
                  placeholder="e.g. John Smith" style={inputStyle} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "13px", color: "#6B6B67", marginBottom: "6px", fontWeight: "500" }}>Contact Phone</label>
                <input type="text" value={formData.contact_phone} onChange={e => setFormData(prev => ({ ...prev, contact_phone: e.target.value }))}
                  placeholder="e.g. +1 (555) 123-4567" style={inputStyle} />
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px", borderRadius: "8px", background: "#FAFAF8", border: "1px solid #E5E5E0" }}>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: "500", color: "#141413" }}>Active Status</div>
                  <div style={{ fontSize: "12px", color: "#6B6B67", marginTop: "2px" }}>Warehouse is operational</div>
                </div>
                <button type="button" onClick={() => setFormData(prev => ({ ...prev, is_active: !prev.is_active }))}
                  style={{ padding: "8px", border: "none", background: "transparent", cursor: "pointer" }}>
                  {formData.is_active
                    ? <ToggleRight size={32} color="#22c55e" />
                    : <ToggleLeft size={32} color="#BDBDBD" />}
                </button>
              </div>
            </div>
            <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
              <button onClick={handleSave} disabled={saving} style={{
                flex: 1, padding: "12px", borderRadius: "8px", border: "none",
                background: "#141413", color: "#fff", fontSize: "14px", fontWeight: "600",
                cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.6 : 1
              }}>
                {saving ? (editingId ? "Updating..." : "Creating...") : (editingId ? "Update Warehouse" : "Create Warehouse")}
              </button>
              <button onClick={() => { setShowModal(false); setEditingId(null); }} style={{
                padding: "12px 24px", borderRadius: "8px", border: "1px solid #E5E5E0",
                background: "transparent", color: "#141413", fontSize: "14px", cursor: "pointer"
              }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "20px" }}
          onClick={e => e.target === e.currentTarget && setDeleteId(null)}>
          <div style={{ background: "white", border: "1px solid #E5E5E0", borderRadius: "12px", width: "100%", maxWidth: "400px", padding: "28px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "600", color: "#141413", margin: 0 }}>Delete Warehouse</h2>
              <button onClick={() => setDeleteId(null)} style={{ padding: "8px", border: "none", background: "transparent", color: "#6B6B67", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>
            <p style={{ fontSize: "14px", color: "#6B6B67", margin: "0 0 24px", lineHeight: "1.6" }}>
              Are you sure you want to delete this warehouse? This action cannot be undone and may affect inventory records.
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
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        input::placeholder, select option { background: #FAFAF8; color: #6B6B67; }
        input, select { transition: border-color 0.15s ease; }
        input:focus, select:focus { outline: none; border-color: #141413 !important; }
      `}</style>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 14px", borderRadius: "8px",
  border: "1px solid #E5E5E0", background: "#F4F4F1",
  color: "#141413", fontSize: "14px", outline: "none", boxSizing: "border-box"
};