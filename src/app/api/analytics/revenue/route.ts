import { createRouteHandlerClient } from "@/utils/supabase/lib";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const supabase = createRouteHandlerClient(cookieStore);

  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get("days") || "30");

  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await supabase
    .from("orders")
    .select("created_at, subtotal")
    .eq("status", "delivered")
    .gte("created_at", startDate.toISOString())
    .lte("created_at", endDate.toISOString())
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const byDate: Record<string, number> = {};
  for (const order of data || []) {
    const date = order.created_at.split("T")[0];
    byDate[date] = (byDate[date] || 0) + (order.subtotal || 0);
  }

  const series = Object.entries(byDate).map(([date, total]) => ({ date, total: Math.round(total * 100) / 100 }));

  const prevEndDate = new Date(startDate);
  prevEndDate.setDate(prevEndDate.getDate() - 1);
  const prevStartDate = new Date(prevEndDate);
  prevStartDate.setDate(prevStartDate.getDate() - days);

  const { data: prevData } = await supabase
    .from("orders")
    .select("subtotal")
    .eq("status", "delivered")
    .gte("created_at", prevStartDate.toISOString())
    .lte("created_at", prevEndDate.toISOString());

  const prevTotal = (prevData || []).reduce((sum, o) => sum + (o.subtotal || 0), 0);
  const currentTotal = (data || []).reduce((sum, o) => sum + (o.subtotal || 0), 0);
  const pctChange = prevTotal > 0 ? ((currentTotal - prevTotal) / prevTotal) * 100 : 0;

  return NextResponse.json({
    series,
    total: Math.round(currentTotal * 100) / 100,
    prevTotal: Math.round(prevTotal * 100) / 100,
    pctChange: Math.round(pctChange * 10) / 10,
  });
}