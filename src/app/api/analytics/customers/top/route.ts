import { createRouteHandlerClient } from "@/utils/supabase/lib";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const supabase = createRouteHandlerClient(cookieStore);

  // Top customers by lifetime value (sum of order totals) — no FK join
  const { data, error } = await supabase
    .from("orders")
    .select("user_id, amount, payment_status, status, created_at")
    .eq("status", "delivered")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Aggregate by user_id — fetch profile names separately
  const userIds = [...new Set((data || []).map((o) => o.user_id).filter(Boolean))];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .in("id", userIds);

  const profileMap: Record<string, { full_name: string; email: string }> = {};
  if (profiles) {
    for (const p of profiles) {
      profileMap[p.id] = { full_name: p.full_name || "Unknown", email: p.email || "—" };
    }
  }

  const customerLV: Record<string, { user_id: string; full_name: string; email: string; total_spent: number; order_count: number }> = {};

  for (const order of data || []) {
    if (!order.user_id) continue;
    if (!customerLV[order.user_id]) {
      customerLV[order.user_id] = {
        user_id: order.user_id,
        full_name: profileMap[order.user_id]?.full_name || "Unknown",
        email: profileMap[order.user_id]?.email || "—",
        total_spent: 0,
        order_count: 0,
      };
    }
    customerLV[order.user_id].total_spent += order.amount || 0;
    customerLV[order.user_id].order_count += 1;
  }

  const topCustomers = Object.values(customerLV)
    .sort((a, b) => b.total_spent - a.total_spent)
    .slice(0, 20)
    .map(c => ({ ...c, total_spent: Math.round(c.total_spent * 100) / 100 }));

  return NextResponse.json({ topCustomers });
}