"use client";
import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { DollarSign, ShoppingCart, BarChart2, Users, Zap, Banknote } from "lucide-react";

type DateRange = 7 | 30 | 90 | 365;

// ─── Types ────────────────────────────────────────────────────────────
interface StatCard {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  change?: number;
  prefix?: string;
}

interface RevenueData { date: string; total: number; }
interface OrderData { status: string; count: number; }
interface ProductData { product_id: string; name: string; price: number; category: string; units_sold: number; revenue: number; }
interface CustomerData { date: string; count: number; }
interface TopCustomer { user_id: string; full_name: string; email: string; total_spent: number; order_count: number; }
interface TimeSeries { date: string; count: number; }

// ─── SVG Chart Components ─────────────────────────────────────────────
function LineChart({ data, color = "#3b82f6", height = 200, label = "" }: { data: { date: string; total?: number; count?: number }[]; color?: string; height?: number; label?: string }) {
  if (!data.length) return <div style={{ height, display: "flex", alignItems: "center", justifyContent: "center", color: "#6B6B67", fontSize: "14px" }}>No data</div>;
  const max = Math.max(...data.map(d => d.total || d.count || 0));
  const min = Math.min(...data.map(d => d.total || d.count || 0), 0);
  const range = max - min || 1;
  const W = 600, H = height, padL = 50, padB = 30, padR = 20, padT = 20;
  const cW = W - padL - padR, cH = H - padB - padT;
  const xStep = cW / Math.max(data.length - 1, 1);

  const toY = (v: number) => padT + cH - ((v - min) / range) * cH;
  const toX = (i: number) => padL + i * xStep;

  const points = data.map((d, i) => ({ x: toX(i), y: toY((d.total || d.count || 0) as number) }));

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaD = pathD + ` L ${points[points.length - 1].x} ${padT + cH} L ${padL} ${padT + cH} Z`;

  const yTicks = [min, min + range * 0.25, min + range * 0.5, min + range * 0.75, max].map(v => Math.round(v));
  const xLabels = data.length <= 7 ? data : data.filter((_, i) => i % Math.ceil(data.length / 6) === 0);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height, overflow: "visible" }}>
      <defs>
        <linearGradient id={`lg-${label}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Y axis */}
      {yTicks.map((t, i) => {
        const y = toY(t);
        return (
          <g key={i}>
            <line x1={padL} y1={y} x2={padL + cW} y2={y} stroke="#E5E5E0" strokeWidth="1" strokeDasharray="4,4" />
            <text x={padL - 8} y={y + 4} textAnchor="end" fontSize="11" fill="#6B6B67">{t >= 1000 ? `${(t / 1000).toFixed(1)}k` : t}</text>
          </g>
        );
      })}
      {/* X labels */}
      {xLabels.map((d, i) => {
        const idx = data.indexOf(d);
        return <text key={i} x={toX(idx)} y={padT + cH + 16} textAnchor="middle" fontSize="10" fill="#6B6B67">{d.date.slice(5)}</text>;
      })}
      {/* Area */}
      <path d={areaD} fill={`url(#lg-${label})`} />
      {/* Line */}
      <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {/* Dots */}
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="4" fill={color} opacity="0.8"
          onMouseEnter={e => { (e.target as SVGCircleElement).setAttribute("r", "6"); }}
          onMouseLeave={e => { (e.target as SVGCircleElement).setAttribute("r", "4"); }}
        />
      ))}
    </svg>
  );
}

function BarChart({ data, color = "#a855f7", height = 200, horizontal = false }: { data: { name: string; value: number }[]; color?: string; height?: number; horizontal?: boolean }) {
  if (!data.length) return <div style={{ height, display: "flex", alignItems: "center", justifyContent: "center", color: "#6B6B67", fontSize: "14px" }}>No data</div>;
  const max = Math.max(...data.map(d => d.value));
  if (horizontal) {
    const rowH = Math.min(40, height / data.length);
    return (
      <svg viewBox={`0 0 600 ${rowH * data.length + 20}`} style={{ width: "100%", overflow: "visible" }}>
        {data.map((d, i) => {
          const barW = (d.value / max) * 480;
          const y = i * rowH + 4;
          return (
            <g key={i}>
              <text x="0" y={y + 16} fontSize="12" fill="#141413" textAnchor="start">{d.name.length > 18 ? d.name.slice(0, 18) + "…" : d.name}</text>
              <rect x="140" y={y + 6} width={barW} height={rowH - 14} rx="4" fill={color} opacity={0.8 - i * 0.05} />
              <text x={150 + barW} y={y + 16} fontSize="11" fill="#6B6B67">{d.value}</text>
            </g>
          );
        })}
      </svg>
    );
  }
  const barW = Math.min(50, 500 / data.length);
  const xStep = 600 / data.length;
  return (
    <svg viewBox={`0 0 600 ${height}`} style={{ width: "100%", height, overflow: "visible" }}>
      {data.map((d, i) => {
        const barH = (d.value / max) * (height - 40);
        const x = i * xStep + (xStep - barW) / 2;
        return (
          <g key={i}>
            <rect x={x} y={height - 30 - barH} width={barW} height={barH} rx="4" fill={color} opacity={0.7 + 0.3 * (d.value / max)} />
            <text x={x + barW / 2} y={height - 10} textAnchor="middle" fontSize="10" fill="#6B6B67">{d.name.slice(0, 8)}</text>
            <text x={x + barW / 2} y={height - 35 - barH} textAnchor="middle" fontSize="11" fill="#141413">{d.value}</text>
          </g>
        );
      })}
    </svg>
  );
}

function DonutChart({ data, height = 260 }: { data: { name: string; revenue: number }[]; height?: number }) {
  if (!data.length) return <div style={{ height, display: "flex", alignItems: "center", justifyContent: "center", color: "#6B6B67", fontSize: "14px" }}>No data</div>;
  const colors = ["#3b82f6", "#a855f7", "#22c55e", "#f59e0b", "#ef4444", "#06b6d4", "#ec4899", "#8b5cf6"];
  const total = data.reduce((s, d) => s + d.revenue, 0);
  const R = 90, CX = 110, CY = height / 2;
  let startAngle = -90;
  const slices = data.map((d, i) => {
    const angle = (d.revenue / total) * 360;
    const start = startAngle;
    startAngle += angle;
    return { ...d, start, angle, color: colors[i % colors.length] };
  });

  const arcPath = (startDeg: number, endDeg: number, r: number) => {
    const s = (startDeg * Math.PI) / 180, e = (endDeg * Math.PI) / 180;
    const x1 = CX + r * Math.cos(s), y1 = CY + r * Math.sin(s);
    const x2 = CX + r * Math.cos(e), y2 = CY + r * Math.sin(e);
    const large = endDeg - startDeg > 180 ? 1 : 0;
    return `M ${CX} ${CY} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "24px", flexWrap: "wrap" }}>
      <svg viewBox={`0 0 220 ${height}`} style={{ width: "180px", height, flexShrink: 0 }}>
        {slices.map((s, i) => (
          <path key={i} d={arcPath(s.start, s.start + s.angle - 0.5, R)} fill={s.color} opacity="0.85"
            onMouseEnter={e => { (e.target as SVGPathElement).setAttribute("opacity", "1"); }}
            onMouseLeave={e => { (e.target as SVGPathElement).setAttribute("opacity", "0.85"); }}
          />
        ))}
        <circle cx={CX} cy={CY} r={R - 18} fill="white" />
        <text x={CX} y={CY - 8} textAnchor="middle" fontSize="12" fill="#6B6B67">Total</text>
        <text x={CX} y={CY + 10} textAnchor="middle" fontSize="14" fontWeight="700" fill="#141413">${(total / 1000).toFixed(1)}k</text>
      </svg>
      <div style={{ flex: 1, minWidth: "140px" }}>
        {slices.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: s.color, flexShrink: 0 }} />
            <span style={{ fontSize: "12px", color: "#141413", flex: 1 }}>{s.name}</span>
            <span style={{ fontSize: "12px", color: "#6B6B67" }}>${(s.revenue / 1000).toFixed(1)}k</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Chart Card ────────────────────────────────────────────────────────
function ChartCard({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div style={{
      background: "white", border: "1px solid #E5E5E0",
      borderRadius: "12px", padding: "24px",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h3 style={{ fontSize: "15px", fontWeight: "600", color: "#141413", margin: 0 }}>{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}

// ─── Change Indicator ──────────────────────────────────────────────────
function ChangeIndicator({ pct }: { pct: number }) {
  const positive = pct >= 0;
  return (
    <span style={{
      fontSize: "12px", fontWeight: "600",
      color: positive ? "#22c55e" : "#ef4444",
      display: "inline-flex", alignItems: "center", gap: "2px",
    }}>
      {positive ? "↑" : "↓"} {Math.abs(pct).toFixed(1)}%
    </span>
  );
}

// ─── Main Component ────────────────────────────────────────────────────
export default function AnalyticsDashboard() {
  const supabase = createClient();
  const [range, setRange] = useState<DateRange>(30);
  const [summary, setSummary] = useState({ totalRevenue: 0, totalOrders: 0, avgOrderValue: 0, totalCustomers: 0 });
  const [revenue, setRevenue] = useState<RevenueData[]>([]);
  const [revenueTotal, setRevenueTotal] = useState(0);
  const [revenueChange, setRevenueChange] = useState(0);
  const [orderData, setOrderData] = useState<{ statusChart: OrderData[]; timeSeries: TimeSeries[]; total: number; pctChange: number }>({ statusChart: [], timeSeries: [], total: 0, pctChange: 0 });
  const [productData, setProductData] = useState<ProductData[]>([]);
  const [categoryData, setCategoryData] = useState<{ name: string; revenue: number }[]>([]);
  const [customerData, setCustomerData] = useState<CustomerData[]>([]);
  const [customerChange, setCustomerChange] = useState(0);
  const [realtime, setRealtime] = useState({ ordersToday: 0, revenueToday: 0 });
  const [topCustomers, setTopCustomers] = useState<TopCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const params = `?days=${range}`;
    const [sumRes, revRes, ordRes, prodRes, custRes, rtRes, topRes] = await Promise.all([
      fetch("/api/analytics/summary").then(r => r.json()),
      fetch(`/api/analytics/revenue${params}`).then(r => r.json()),
      fetch(`/api/analytics/orders${params}`).then(r => r.json()),
      fetch(`/api/analytics/products`).then(r => r.json()),
      fetch(`/api/analytics/customers${params}`).then(r => r.json()),
      fetch("/api/analytics/realtime").then(r => r.json()),
      fetch("/api/analytics/customers/top").then(r => r.json()),
    ]);
    setSummary(sumRes);
    setRevenue(revRes.series || []);
    setRevenueTotal(revRes.total || 0);
    setRevenueChange(revRes.pctChange || 0);
    setOrderData(ordRes);
    setProductData(prodRes.topProducts || []);
    setCategoryData(prodRes.categoryChart || []);
    setCustomerData(custRes.series || []);
    setCustomerChange(custRes.pctChange || 0);
    setRealtime(rtRes);
    setTopCustomers(topRes.topCustomers || []);
    setLoading(false);
  }, [range]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const exportCSV = async () => {
    setExporting(true);
    const rows = [["Date", "Revenue"]];
    revenue.forEach(r => rows.push([r.date, r.total.toString()]));
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `analytics-${range}d.csv`; a.click();
    URL.revokeObjectURL(url);
    setExporting(false);
  };

  const fmt = (n: number, prefix = "$") => prefix + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const statCards: StatCard[] = [
    { label: "Total Revenue", value: fmt(summary.totalRevenue), icon: <Banknote size={28} />, color: "#22c55e", change: revenueChange },
    { label: "Total Orders", value: summary.totalOrders.toLocaleString(), icon: <ShoppingCart size={28} />, color: "#3b82f6", change: orderData.pctChange },
    { label: "Avg Order Value", value: fmt(summary.avgOrderValue), icon: <BarChart2 size={28} />, color: "#a855f7" },
    { label: "Total Customers", value: summary.totalCustomers.toLocaleString(), icon: <Users size={28} />, color: "#f59e0b", change: customerChange },
  ];

  if (loading) return (
    <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "32px" }}>
        {[...Array(4)].map((_, i) => (
          <div key={i} style={{ background: "white", border: "1px solid #E5E5E0", borderRadius: "12px", padding: "24px", height: "120px" }} />
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: "600", color: "#141413", margin: "0 0 4px" }}>Analytics</h1>
          <p style={{ color: "#6B6B67", margin: 0, fontSize: "14px" }}>Overview of your store performance</p>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {/* Date Range Picker */}
          {([7, 30, 90, 365] as DateRange[]).map(d => (
            <button key={d} onClick={() => setRange(d)} style={{
              padding: "6px 14px", borderRadius: "6px", border: "1px solid",
              borderColor: range === d ? "#3b82f6" : "#E5E5E0",
              background: range === d ? "rgba(59,130,246,0.1)" : "transparent",
              color: range === d ? "#3b82f6" : "#6B6B67",
              fontSize: "13px", fontWeight: "500", cursor: "pointer",
            }}>{d === 365 ? "1Y" : `${d}D`}</button>
          ))}
          <button onClick={exportCSV} disabled={exporting} style={{
            padding: "6px 14px", borderRadius: "6px", border: "1px solid #E5E5E0",
            background: "transparent", color: "#6B6B67",
            fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px",
          }}>
            {exporting ? "Exporting…" : "📥 Export CSV"}
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "24px" }}>
        {statCards.map((card, i) => (
          <div key={i} style={{
            background: "white", border: "1px solid #E5E5E0",
            borderRadius: "12px", padding: "20px 24px",
            transition: "border-color 0.2s",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
              <span style={{ fontSize: "28px" }}>{card.icon}</span>
              {card.change !== undefined && <ChangeIndicator pct={card.change} />}
            </div>
            <div style={{ fontSize: "28px", fontWeight: "700", color: card.color, lineHeight: 1 }}>{card.value}</div>
            <div style={{ fontSize: "13px", color: "#6B6B67", marginTop: "6px" }}>{card.label}</div>
          </div>
        ))}
      </div>

      {/* Real-time metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px", marginBottom: "24px" }}>
        {[
          { label: "Orders (24h)", value: realtime.ordersToday.toLocaleString(), icon: <Zap size={18} color="#f59e0b" />, color: "#f59e0b" },
          { label: "Revenue Today", value: fmt(realtime.revenueToday), icon: <DollarSign size={18} color="#22c55e" />, color: "#22c55e" },
        ].map((m, i) => (
          <div key={i} style={{
            background: "white", border: "1px solid #E5E5E0",
            borderRadius: "10px", padding: "16px 20px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              {m.icon}
              <span style={{ fontSize: "12px", color: "#6B6B67", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: "600" }}>Live</span>
            </div>
            <div style={{ fontSize: "22px", fontWeight: "700", color: m.color }}>{m.value}</div>
            <div style={{ fontSize: "12px", color: "#6B6B67", marginTop: "4px" }}>{m.label}</div>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
        <ChartCard title="Revenue Over Time">
          <div style={{ color: "#6B6B67", fontSize: "13px", marginBottom: "12px" }}>
            {fmt(revenueTotal)} total · {range}d period
          </div>
          <LineChart data={revenue.map(r => ({ date: r.date, total: r.total }))} color="#22c55e" height={180} label="rev" />
        </ChartCard>
        <ChartCard title="Orders by Status">
          <BarChart data={orderData.statusChart.map(s => ({ name: s.status, value: s.count }))} color="#3b82f6" height={180} />
        </ChartCard>
      </div>

      {/* Charts Row 2 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px", marginBottom: "20px" }}>
        <ChartCard title="Top Selling Products">
          <BarChart data={productData.slice(0, 8).map(p => ({ name: p.name.length > 14 ? p.name.slice(0, 14) + "…" : p.name, value: p.units_sold }))} color="#a855f7" height={200} horizontal />
        </ChartCard>
        <ChartCard title="Sales by Category">
          <DonutChart data={categoryData} height={200} />
        </ChartCard>
        <ChartCard title="Customer Growth">
          <LineChart data={customerData.map(c => ({ date: c.date, count: c.count }))} color="#f59e0b" height={180} label="cust" />
        </ChartCard>
      </div>

      {/* Top Customers Table */}
      <ChartCard title="Top Customers by Lifetime Value">
        {topCustomers.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px", color: "#6B6B67" }}>No customer data yet</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "500px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #E5E5E0" }}>
                  {["#", "Customer", "Email", "Orders", "Lifetime Value"].map(h => (
                    <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: "12px", color: "#6B6B67", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {topCustomers.map((c, i) => (
                  <tr key={c.user_id} style={{ borderBottom: "1px solid #E5E5E0" }}>
                    <td style={{ padding: "12px 14px", fontSize: "13px", color: "#6B6B67", fontWeight: "600" }}>{i + 1}</td>
                    <td style={{ padding: "12px 14px", fontSize: "14px", fontWeight: "500", color: "#141413" }}>{c.full_name}</td>
                    <td style={{ padding: "12px 14px", fontSize: "13px", color: "#6B6B67" }}>{c.email}</td>
                    <td style={{ padding: "12px 14px", fontSize: "14px", color: "#141413" }}>{c.order_count}</td>
                    <td style={{ padding: "12px 14px", fontSize: "14px", fontWeight: "600", color: "#22c55e" }}>{fmt(c.total_spent)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ChartCard>

      <style jsx global>{`
        @media (max-width: 900px) {
          div[style*="gridTemplateColumns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
          div[style*="gridTemplateColumns: 1fr 1fr 1fr"] { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 600px) {
          div[style*="repeat(auto-fit"] { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </div>
  );
}