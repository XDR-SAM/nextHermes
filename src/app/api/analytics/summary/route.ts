import { createRouteHandlerClient } from "@/utils/supabase/lib";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const supabase = createRouteHandlerClient(cookieStore);

  // Summary stats: total revenue, total orders, avg order value, total customers
  const { data: orders, error } = await supabase
    .from("orders")
    .select("subtotal")
    .eq("status", "delivered");

  const { count: customerCount } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const totalRevenue = (orders || []).reduce((sum, o) => sum + (o.subtotal || 0), 0);
  const totalOrders = (orders || []).length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  return NextResponse.json({
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    totalOrders,
    avgOrderValue: Math.round(avgOrderValue * 100) / 100,
    totalCustomers: customerCount || 0,
  });
}