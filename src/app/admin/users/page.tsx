"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import type { Profile } from "@/lib/types";
import { ROLE_LABELS, ROLE_COLORS } from "@/lib/types";

export default function UsersPage() {
  const supabase = createClient();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    const load = async () => {
      let query = supabase.from("profiles").select("*").order("created_at", { ascending: false });
      if (filter !== "all") query = query.eq("role", filter);
      const { data } = await query;
      setUsers((data || []) as Profile[]);
      setLoading(false);
    };
    load();
  }, [filter]);

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div style={{ padding:"32px", maxWidth:"1200px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"24px" }}>
        <div>
          <h1 style={{ fontSize:"28px", fontWeight:"600", color:"#fafafa", margin:"0" }}>Users</h1>
          <p style={{ color:"#898989", margin:"4px 0 0" }}>{users.length} total users</p>
        </div>
        <div style={{ display:"flex", gap:"8px" }}>
          {["all","super_admin","admin","moderator","user"].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding:"6px 14px", borderRadius:"6px", border:"1px solid", borderColor: filter===f ? "#3ecf8e" : "#363636", background: filter===f ? "rgba(62,207,142,0.1)" : "transparent", color: filter===f ? "#3ecf8e" : "#898989", fontSize:"13px", cursor:"pointer", textTransform:"capitalize" }}>{f.replace("_"," ")}</button>
          ))}
        </div>
      </div>
      <div style={{ background:"#1e1e1e", border:"1px solid #2e2e2e", borderRadius:"12px", overflow:"hidden" }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ borderBottom:"1px solid #2e2e2e" }}>
              {["User","Role","Status","Joined","Actions"].map(h => (
                <th key={h} style={{ padding:"14px 20px", textAlign:"left", fontSize:"12px", color:"#898989", fontWeight:"600", textTransform:"uppercase", letterSpacing:"0.5px" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ padding:"48px", textAlign:"center", color:"#898989" }}>Loading...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={5} style={{ padding:"48px", textAlign:"center", color:"#898989" }}>No users found</td></tr>
            ) : users.map(u => (
              <tr key={u.id} style={{ borderBottom:"1px solid #242424" }}>
                <td style={{ padding:"14px 20px" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
                    <div style={{ width:"36px", height:"36px", borderRadius:"50%", background:"#363636", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"14px", color:"#fafafa", fontWeight:"600" }}>{u.full_name?.[0]?.toUpperCase() || u.email[0].toUpperCase()}</div>
                    <div>
                      <div style={{ fontSize:"14px", color:"#fafafa", fontWeight:"500" }}>{u.full_name || "—"}</div>
                      <div style={{ fontSize:"12px", color:"#898989" }}>{u.email}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding:"14px 20px" }}>
                  <span style={{ padding:"4px 10px", borderRadius:"4px", fontSize:"12px", fontWeight:"600", background: ROLE_COLORS[u.role] + "20", color: ROLE_COLORS[u.role], textTransform:"uppercase" }}>{ROLE_LABELS[u.role]}</span>
                </td>
                <td style={{ padding:"14px 20px" }}>
                  <span style={{ padding:"4px 10px", borderRadius:"4px", fontSize:"12px", background: u.is_active ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)", color: u.is_active ? "#22c55e" : "#ef4444", border:"1px solid", borderColor: u.is_active ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)" }}>{u.is_active ? "Active" : "Inactive"}</span>
                </td>
                <td style={{ padding:"14px 20px", fontSize:"13px", color:"#898989" }}>{formatDate(u.created_at)}</td>
                <td style={{ padding:"14px 20px" }}>
                  <button style={{ padding:"6px 12px", borderRadius:"6px", border:"1px solid #363636", background:"transparent", color:"#b4b4b4", fontSize:"12px", cursor:"pointer" }}>Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
