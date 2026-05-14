"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { updateProfile } from "@/lib/auth";
import type { Profile } from "@/lib/types";
import { ROLE_LABELS, ROLE_COLORS } from "@/lib/types";

export default function SettingsPage() {
  const supabase = createClient();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      setProfile(data as Profile);
      setFullName(data?.full_name || "");
      setLoading(false);
    };
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    const { error } = await updateProfile(profile.id, { full_name: fullName });
    setSaving(false);
    setMsg(error ? "Failed to save" : "Profile updated!");
    setTimeout(() => setMsg(""), 3000);
  };

  if (loading) return <div style={{ padding: "32px", color: "#6B6B67" }}>Loading...</div>;

return (
    <div style={{ padding: "32px", maxWidth: "600px", background: "#FAFAF8", minHeight: "100vh" }}>
      <h1 style={{ fontSize: "28px", fontWeight: "600", color: "#141413", margin: "0 0 8px" }}>Settings</h1>
      <p style={{ color: "#6B6B67", margin: "0 0 32px" }}>Manage your profile and preferences</p>
      <div style={{ background: "white", border: "1px solid #E5E5E0", borderRadius: "12px", padding: "24px", marginBottom: "20px" }}>
        <h2 style={{ fontSize: "16px", fontWeight: "600", color: "#141413", margin: "0 0 20px" }}>Profile Information</h2>
        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "13px", color: "#6B6B67", marginBottom: "6px" }}>Full Name</label>
            <input value={fullName} onChange={e => setFullName(e.target.value)} style={{ width: "100%", padding: "12px 16px", borderRadius: "8px", border: "1px solid #E5E5E0", background: "#FAFAF8", color: "#141413", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "13px", color: "#6B6B67", marginBottom: "6px" }}>Email</label>
            <input value={profile?.email || ""} disabled style={{ width: "100%", padding: "12px 16px", borderRadius: "8px", border: "1px solid #E5E5E0", background: "#F4F4F1", color: "#6B6B67", fontSize: "14px", boxSizing: "border-box" }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "13px", color: "#6B6B67", marginBottom: "6px" }}>Role</label>
            <div style={{ padding: "12px 16px", borderRadius: "8px", border: "1px solid #E5E5E0", background: "#FAFAF8" }}>
              <span style={{ padding: "4px 10px", borderRadius: "4px", fontSize: "12px", fontWeight: "600", background: ROLE_COLORS[profile?.role || "user"] + "20", color: ROLE_COLORS[profile?.role || "user"], textTransform: "uppercase" }}>{ROLE_LABELS[profile?.role || "user"]}</span>
            </div>
          </div>
          {msg && <div style={{ padding: "12px", borderRadius: "8px", background: msg.includes("Failed") ? "rgba(239,68,68,0.1)" : "rgba(34,197,94,0.1)", border: "1px solid", borderColor: msg.includes("Failed") ? "rgba(239,68,68,0.3)" : "rgba(34,197,94,0.3)", color: msg.includes("Failed") ? "#ef4444" : "#22c55e", fontSize: "13px" }}>{msg}</div>}
          <button type="submit" disabled={saving} style={{ padding: "12px", borderRadius: "8px", border: "none", background: "#3ecf8e", color: "#0f0f0f", fontSize: "14px", fontWeight: "600", cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.6 : 1 }}>{saving ? "Saving..." : "Save Changes"}</button>
        </form>
      </div>
    </div>
  );
}
