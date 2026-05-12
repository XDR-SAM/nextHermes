"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) { setError(error.message); return; }
    router.push("/admin");
  };

  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"100vh", background:"#171717", fontFamily:"sans-serif" }}>
      <div style={{ width:"100%", maxWidth:"400px", padding:"32px" }}>
        <div style={{ textAlign:"center", marginBottom:"40px" }}>
          <div style={{ fontSize:"40px", marginBottom:"12px" }}>🛒</div>
          <h1 style={{ fontSize:"24px", fontWeight:"600", color:"#fafafa", margin:"0 0 8px" }}>nextHermes</h1>
          <p style={{ color:"#898989", margin:"0" }}>Sign in to your admin panel</p>
        </div>
        <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
          <div>
            <label style={{ display:"block", fontSize:"13px", color:"#b4b4b4", marginBottom:"6px" }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              placeholder="admin@example.com"
              style={{ width:"100%", padding:"12px 16px", borderRadius:"8px", border:"1px solid #363636", background:"#0f0f0f", color:"#fafafa", fontSize:"14px", outline:"none", boxSizing:"border-box" }} />
          </div>
          <div>
            <label style={{ display:"block", fontSize:"13px", color:"#b4b4b4", marginBottom:"6px" }}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
              placeholder="••••••••"
              style={{ width:"100%", padding:"12px 16px", borderRadius:"8px", border:"1px solid #363636", background:"#0f0f0f", color:"#fafafa", fontSize:"14px", outline:"none", boxSizing:"border-box" }} />
          </div>
          {error && (
            <div style={{ padding:"12px", borderRadius:"8px", background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.3)", color:"#ef4444", fontSize:"13px" }}>{error}</div>
          )}
          <button type="submit" disabled={loading} style={{ padding:"12px", borderRadius:"8px", border:"none", background:"#3ecf8e", color:"#0f0f0f", fontSize:"14px", fontWeight:"600", cursor: loading?"not-allowed":"pointer", opacity: loading?0.6:1, transition:"150ms ease" }}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
        <p style={{ textAlign:"center", color:"#898989", fontSize:"13px", marginTop:"24px" }}>
          No account? <a href="/signup" style={{ color:"#00c573", textDecoration:"none" }}>Sign up</a>
        </p>
      </div>
    </div>
  );
}
