"use client";
import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import type { Profile, UserRole } from "@/lib/types";
import { ROLE_LABELS, ROLE_COLORS } from "@/lib/types";

const PAGE_SIZE = 20;

export default function UsersPage() {
  const supabase = createClient();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<Profile | null>(null);
  const [editForm, setEditForm] = useState({ full_name: "", role: "user" as UserRole, is_active: true });
  const [userStats, setUserStats] = useState<{ order_count: number; total_spend: number } | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deactivateConfirm, setDeactivateConfirm] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    let query = supabase.from("profiles").select("*").order("created_at", { ascending: false });
    if (filter !== "all") query = query.eq("role", filter);
    const { data } = await query;
    setUsers((data || []) as Profile[]);
    setLoading(false);
  }, [supabase, filter]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const loadUserStats = useCallback(async (userId: string) => {
    // Separate queries - no FK joins
    const ordersRes = await supabase.from("orders").select("id, total_amount").eq("user_id", userId);
    const count = (ordersRes.data || []).length;
    const total = (ordersRes.data || []).reduce((sum: number, o: { total_amount?: number }) => sum + (o.total_amount || 0), 0);
    setUserStats({ order_count: count, total_spend: total });
  }, [supabase]);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const openDetail = async (user: Profile) => {
    setShowDetailModal(user.id);
    await loadUserStats(user.id);
  };

  const openEditModal = (user: Profile) => {
    setEditingUser(user);
    setEditForm({ full_name: user.full_name || "", role: user.role, is_active: user.is_active });
    setShowEditModal(true);
  };

  const handleEditSave = async () => {
    if (!editingUser) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      full_name: editForm.full_name,
      role: editForm.role,
      is_active: editForm.is_active,
    }).eq("id", editingUser.id);
    setSaving(false);
    if (error) {
      showToast(`Failed: ${error.message}`, "error");
    } else {
      showToast("User updated successfully!", "success");
      setShowEditModal(false);
      setEditingUser(null);
      loadUsers();
    }
  };

  const handleToggleActive = async (user: Profile) => {
    const { error } = await supabase.from("profiles").update({ is_active: !user.is_active }).eq("id", user.id);
    if (error) showToast(`Failed: ${error.message}`, "error");
    else {
      showToast(`User ${user.is_active ? "deactivated" : "activated"}!`, "success");
      setDeactivateConfirm(null);
      loadUsers();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("profiles").delete().eq("id", id);
    if (error) showToast(`Failed: ${error.message}`, "error");
    else {
      showToast("User deleted!", "success");
      setDeleteConfirm(null);
      loadUsers();
    }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const formatCurrency = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

  const filtered = users.filter(u => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (u.full_name || "").toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const canChangeRole = (role: UserRole) => role !== "super_admin";

  return (
    <div style={{ padding: "32px", maxWidth: "1200px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: "600", color: "#fafafa", margin: "0" }}>Users</h1>
          <p style={{ color: "#898989", margin: "4px 0 0" }}>{users.length} total users</p>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setPage(1); }}
            style={{ padding: "8px 14px", borderRadius: "8px", border: "1px solid #363636", background: "#1e1e1e", color: "#fafafa", fontSize: "13px", outline: "none" }}
          />
          {["all", "super_admin", "admin", "moderator", "user"].map(f => (
            <button key={f} onClick={() => { setFilter(f); setPage(1); }}
              style={{ padding: "6px 14px", borderRadius: "6px", border: "1px solid", borderColor: filter === f ? "#3ecf8e" : "#363636", background: filter === f ? "rgba(62,207,142,0.1)" : "transparent", color: filter === f ? "#3ecf8e" : "#898989", fontSize: "13px", cursor: "pointer", textTransform: "capitalize" }}>
              {f.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      <div style={{ background: "#1e1e1e", border: "1px solid #2e2e2e", borderRadius: "12px", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #2e2e2e" }}>
              {["User", "Role", "Status", "Joined", "Actions"].map(h => (
                <th key={h} style={{ padding: "14px 20px", textAlign: "left", fontSize: "12px", color: "#898989", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ padding: "48px", textAlign: "center", color: "#898989" }}>Loading...</td></tr>
            ) : paginated.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: "48px", textAlign: "center", color: "#898989" }}>No users found</td></tr>
            ) : paginated.map(u => (
              <tr key={u.id} style={{ borderBottom: "1px solid #242424" }}>
                <td style={{ padding: "14px 20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#363636", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", color: "#fafafa", fontWeight: "600" }}>
                      {u.full_name?.[0]?.toUpperCase() || u.email[0].toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: "14px", color: "#fafafa", fontWeight: "500" }}>{u.full_name || "—"}</div>
                      <div style={{ fontSize: "12px", color: "#898989" }}>{u.email}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: "14px 20px" }}>
                  <span style={{ padding: "4px 10px", borderRadius: "4px", fontSize: "12px", fontWeight: "600", background: ROLE_COLORS[u.role] + "20", color: ROLE_COLORS[u.role], textTransform: "uppercase" }}>
                    {ROLE_LABELS[u.role]}
                  </span>
                </td>
                <td style={{ padding: "14px 20px" }}>
                  <span style={{ padding: "4px 10px", borderRadius: "4px", fontSize: "12px", background: u.is_active ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)", color: u.is_active ? "#22c55e" : "#ef4444", border: "1px solid", borderColor: u.is_active ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)" }}>
                    {u.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td style={{ padding: "14px 20px", fontSize: "13px", color: "#898989" }}>{formatDate(u.created_at)}</td>
                <td style={{ padding: "14px 20px" }}>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button onClick={() => openDetail(u)} style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid #363636", background: "transparent", color: "#b4b4b4", fontSize: "12px", cursor: "pointer" }}>View</button>
                    <button onClick={() => openEditModal(u)} style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid #363636", background: "transparent", color: "#b4b4b4", fontSize: "12px", cursor: "pointer" }}>Edit</button>
                    {deactivateConfirm === u.id ? (
                      <div style={{ display: "flex", gap: "4px" }}>
                        <button onClick={() => handleToggleActive(u)} style={{ padding: "6px 10px", borderRadius: "6px", border: "none", background: u.is_active ? "#ef4444" : "#22c55e", color: "#fff", fontSize: "12px", cursor: "pointer" }}>
                          {u.is_active ? "Deactivate" : "Activate"}
                        </button>
                        <button onClick={() => setDeactivateConfirm(null)} style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid #363636", background: "transparent", color: "#b4b4b4", fontSize: "12px", cursor: "pointer" }}>Cancel</button>
                      </div>
                    ) : (
                      <button onClick={() => setDeactivateConfirm(u.id)} style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid rgba(168,85,247,0.3)", background: "transparent", color: "#a855f7", fontSize: "12px", cursor: "pointer" }}>
                        {u.is_active ? "Deactivate" : "Activate"}
                      </button>
                    )}
                    {deleteConfirm === u.id ? (
                      <div style={{ display: "flex", gap: "4px" }}>
                        <button onClick={() => handleDelete(u.id)} style={{ padding: "6px 10px", borderRadius: "6px", border: "none", background: "#ef4444", color: "#fff", fontSize: "12px", cursor: "pointer" }}>Delete</button>
                        <button onClick={() => setDeleteConfirm(null)} style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid #363636", background: "transparent", color: "#b4b4b4", fontSize: "12px", cursor: "pointer" }}>Cancel</button>
                      </div>
                    ) : (
                      <button onClick={() => setDeleteConfirm(u.id)} style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid rgba(239,68,68,0.3)", background: "transparent", color: "#ef4444", fontSize: "12px", cursor: "pointer" }}>Delete</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "20px", flexWrap: "wrap", gap: "12px" }}>
          <span style={{ fontSize: "13px", color: "#898989" }}>Page {page} of {totalPages} — {filtered.length} users</span>
          <div style={{ display: "flex", gap: "8px" }}>
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} style={{ padding: "8px 16px", borderRadius: "6px", border: "1px solid #363636", background: "#1e1e1e", color: page === 1 ? "#898989" : "#fafafa", fontSize: "13px", cursor: page === 1 ? "not-allowed" : "pointer", opacity: page === 1 ? 0.5 : 1 }}>← Prev</button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = page <= 3 ? i + 1 : page + i - 2;
              if (p < 1 || p > totalPages) return null;
              return <button key={p} onClick={() => setPage(p)} style={{ padding: "8px 14px", borderRadius: "6px", border: "1px solid", borderColor: p === page ? "#3ecf8e" : "#363636", background: p === page ? "rgba(62,207,142,0.1)" : "#1e1e1e", color: p === page ? "#3ecf8e" : "#fafafa", fontSize: "13px", cursor: "pointer" }}>{p}</button>;
            })}
            <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} style={{ padding: "8px 16px", borderRadius: "6px", border: "1px solid #363636", background: "#1e1e1e", color: page === totalPages ? "#898989" : "#fafafa", fontSize: "13px", cursor: page === totalPages ? "not-allowed" : "pointer", opacity: page === totalPages ? 0.5 : 1 }}>Next →</button>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingUser && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "20px" }}
          onClick={e => e.target === e.currentTarget && setShowEditModal(false)}>
          <div style={{ background: "#1e1e1e", border: "1px solid #2e2e2e", borderRadius: "12px", width: "100%", maxWidth: "480px", padding: "28px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "600", color: "#fafafa", margin: 0 }}>Edit User</h2>
              <button onClick={() => setShowEditModal(false)} style={{ padding: "8px", border: "none", background: "transparent", color: "#898989", cursor: "pointer", fontSize: "18px" }}>✕</button>
            </div>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "13px", color: "#898989", marginBottom: "6px" }}>Email</label>
              <div style={{ padding: "10px 14px", borderRadius: "8px", border: "1px solid #363636", background: "#252525", color: "#898989", fontSize: "14px" }}>{editingUser.email}</div>
            </div>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "13px", color: "#898989", marginBottom: "6px" }}>Full Name</label>
              <input type="text" value={editForm.full_name} onChange={e => setEditForm(prev => ({ ...prev, full_name: e.target.value }))}
                style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #363636", background: "#252525", color: "#fafafa", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
            </div>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "13px", color: "#898989", marginBottom: "6px" }}>Role</label>
              <select value={editForm.role} onChange={e => setEditForm(prev => ({ ...prev, role: e.target.value as UserRole }))}
                disabled={!canChangeRole(editingUser.role)}
                style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #363636", background: "#252525", color: "#fafafa", fontSize: "14px", outline: "none", boxSizing: "border-box", opacity: canChangeRole(editingUser.role) ? 1 : 0.5 }}>
                {(Object.keys(ROLE_LABELS) as UserRole[]).map(r => (
                  <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                ))}
              </select>
              {editingUser.role === "super_admin" && <p style={{ color: "#898989", fontSize: "11px", marginTop: "4px" }}>Super admin role cannot be changed</p>}
            </div>
            <div style={{ marginBottom: "24px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
                <input type="checkbox" checked={editForm.is_active} onChange={e => setEditForm(prev => ({ ...prev, is_active: e.target.checked }))}
                  style={{ width: "18px", height: "18px", accentColor: "#22c55e" }} />
                <span style={{ fontSize: "14px", color: "#fafafa" }}>Active</span>
              </label>
            </div>
            <div style={{ display: "flex", gap: "12px" }}>
              <button onClick={handleEditSave} disabled={saving} style={{ flex: 1, padding: "12px", borderRadius: "8px", border: "none", background: "#22c55e", color: "#fff", fontSize: "14px", fontWeight: "600", cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.6 : 1 }}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <button onClick={() => setShowEditModal(false)} style={{ padding: "12px 24px", borderRadius: "8px", border: "1px solid #363636", background: "transparent", color: "#b4b4b4", fontSize: "14px", cursor: "pointer" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "20px" }}
          onClick={e => e.target === e.currentTarget && setShowDetailModal(null)}>
          <div style={{ background: "#1e1e1e", border: "1px solid #2e2e2e", borderRadius: "12px", width: "100%", maxWidth: "520px", padding: "28px" }}>
            {(() => {
              const u = users.find(x => x.id === showDetailModal);
              if (!u) return null;
              return (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                    <h2 style={{ fontSize: "18px", fontWeight: "600", color: "#fafafa", margin: 0 }}>User Details</h2>
                    <button onClick={() => setShowDetailModal(null)} style={{ padding: "8px", border: "none", background: "transparent", color: "#898989", cursor: "pointer", fontSize: "18px" }}>✕</button>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
                    <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "#363636", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", color: "#fafafa", fontWeight: "600" }}>
                      {u.full_name?.[0]?.toUpperCase() || u.email[0].toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: "16px", fontWeight: "600", color: "#fafafa" }}>{u.full_name || "—"}</div>
                      <div style={{ fontSize: "13px", color: "#898989" }}>{u.email}</div>
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    {[
                      { label: "Role", value: <span style={{ padding: "3px 10px", borderRadius: "4px", fontSize: "12px", fontWeight: "600", background: ROLE_COLORS[u.role] + "20", color: ROLE_COLORS[u.role], textTransform: "uppercase" }}>{ROLE_LABELS[u.role]}</span> },
                      { label: "Status", value: <span style={{ padding: "3px 10px", borderRadius: "4px", fontSize: "12px", background: u.is_active ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)", color: u.is_active ? "#22c55e" : "#ef4444" }}>{u.is_active ? "Active" : "Inactive"}</span> },
                      { label: "Joined", value: <span style={{ fontSize: "14px", color: "#fafafa" }}>{formatDate(u.created_at)}</span> },
                      { label: "Tenant ID", value: <span style={{ fontSize: "14px", color: "#898989" }}>{u.tenant_id || "None"}</span> },
                      { label: "Orders", value: <span style={{ fontSize: "14px", color: "#fafafa", fontWeight: "600" }}>{userStats?.order_count ?? "—"}</span> },
                      { label: "Total Spend", value: <span style={{ fontSize: "14px", color: "#22c55e", fontWeight: "600" }}>{userStats ? formatCurrency(userStats.total_spend) : "—"}</span> },
                    ].map(({ label, value }) => (
                      <div key={label} style={{ padding: "14px", borderRadius: "8px", background: "#252525", border: "1px solid #363636" }}>
                        <div style={{ fontSize: "11px", color: "#898989", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>{label}</div>
                        <div>{value}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
                    <button onClick={() => { setShowDetailModal(null); openEditModal(u); }} style={{ flex: 1, padding: "12px", borderRadius: "8px", border: "1px solid #363636", background: "transparent", color: "#fafafa", fontSize: "14px", cursor: "pointer" }}>Edit User</button>
                    <button onClick={() => setShowDetailModal(null)} style={{ padding: "12px 24px", borderRadius: "8px", border: "1px solid #363636", background: "transparent", color: "#b4b4b4", fontSize: "14px", cursor: "pointer" }}>Close</button>
                  </div>
                </>
              );
            })()}
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
        input::placeholder { color: #898989; }
        select option { background: #1e1e1e; color: #fafafa; }
      `}</style>
    </div>
  );
}