"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import type { Tenant } from "@/lib/types";

export default function TenantsPage() {
  const supabase = createClient();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", slug: "", brand_color: "#3ecf8e" });

  const load = async () => {
    const { data } = await supabase.from("tenants").select("*").order("created_at", { ascending: false });
    setTenants((data || []) as Tenant[]);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.from("tenants").insert([form]);
    setShowModal(false);
    setForm({ name: "", slug: "", brand_color: "#3ecf8e" });
    load();
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const inputStyle: React.CSSProperties = { width: "100%", padding: "12px 16px", borderRadius: "8px", border: "1px solid #E5E5E0", background: "#FAFAF8", color: "#141413", fontSize: "14px", outline: "none", boxSizing: "border-box" as const };

  return (
    <div style={{ padding: "32px", maxWidth: "1200px", background: "#FAFAF8", minHeight: "100vh" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: "600", color: "#141413", margin: "0" }}>Tenants</h1>
          <p style={{ color: "#6B6B67", margin: "4px 0 0" }}>{tenants.length} stores</p>
        </div>
        <button onClick={() => setShowModal(true)} style={{ padding: "10px 20px", borderRadius: "8px", border: "none", background: "#3ecf8e", color: "#0f0f0f", fontSize: "14px", fontWeight: "600", cursor: "pointer" }}>+ Create Tenant</button>
      </div>
      {loading ? (
        <div style={{ textAlign: "center", color: "#6B6B67", padding: "48px" }}>Loading...</div>
      ) : tenants.length === 0 ? (
        <div style={{ textAlign: "center", padding: "64px", background: "white", border: "1px solid #E5E5E0", borderRadius: "12px" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🏢</div>
          <h2 style={{ fontSize: "18px", color: "#141413", margin: "0 0 8px" }}>No tenants yet</h2>
          <p style={{ color: "#6B6B67", margin: "0 0 24px" }}>Create your first tenant to get started</p>
          <button onClick={() => setShowModal(true)} style={{ padding: "10px 20px", borderRadius: "8px", border: "none", background: "#3ecf8e", color: "#0f0f0f", fontSize: "14px", fontWeight: "600", cursor: "pointer" }}>Create First Tenant</button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
          {tenants.map(t => (
            <div key={t.id} style={{ background: "white", border: "1px solid #E5E5E0", borderRadius: "12px", padding: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: t.brand_color + "20", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: "20px" }}>🏢</span></div>
                <span style={{ padding: "4px 10px", borderRadius: "4px", fontSize: "12px", background: t.is_active ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)", color: t.is_active ? "#22c55e" : "#ef4444", border: "1px solid", borderColor: t.is_active ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)" }}>{t.is_active ? "Active" : "Inactive"}</span>
              </div>
              <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#141413", margin: "0 0 4px" }}>{t.name}</h3>
              <p style={{ fontSize: "13px", color: "#6B6B67", margin: "0 0 12px" }}>/{t.slug}</p>
              <div style={{ fontSize: "12px", color: "#6B6B67" }}>Created {formatDate(t.created_at)}</div>
            </div>
          ))}
        </div>
      )}
      {showModal && (
        <div style={{ position: "fixed", inset: "0", background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: "1000" }}>
          <div style={{ width: "100%", maxWidth: "480px", background: "white", border: "1px solid #E5E5E0", borderRadius: "16px", padding: "32px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: "600", color: "#141413", margin: "0 0 24px" }}>Create Tenant</h2>
            <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", color: "#6B6B67", marginBottom: "6px" }}>Store Name</label>
                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required placeholder="Acme Corp" style={inputStyle} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "13px", color: "#6B6B67", marginBottom: "6px" }}>Slug</label>
                <input value={form.slug} onChange={e => setForm({...form, slug: e.target.value.replace(/\s+/g, "-").toLowerCase()})} required placeholder="acme-corp" style={inputStyle} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "13px", color: "#6B6B67", marginBottom: "6px" }}>Brand Color</label>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <input type="color" value={form.brand_color} onChange={e => setForm({...form, brand_color: e.target.value})} style={{ width: "40px", height: "40px", borderRadius: "8px", border: "1px solid #E5E5E0", cursor: "pointer" }} />
                  <input value={form.brand_color} onChange={e => setForm({...form, brand_color: e.target.value})} placeholder="#3ecf8e" style={{ ...inputStyle, flex: "1" }} />
                </div>
              </div>
              <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: "1", padding: "12px", borderRadius: "8px", border: "1px solid #E5E5E0", background: "transparent", color: "#6B6B67", fontSize: "14px", cursor: "pointer" }}>Cancel</button>
                <button type="submit" style={{ flex: "1", padding: "12px", borderRadius: "8px", border: "none", background: "#3ecf8e", color: "#0f0f0f", fontSize: "14px", fontWeight: "600", cursor: "pointer" }}>Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
