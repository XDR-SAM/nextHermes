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
    .select("id, created_at, total, status, user_id")
    .gte("created_at", startDate.toISOString())
    .lte("created_at", endDate.toISOString())
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const statusCounts: Record<string, number> = {};
  for (const order of data || []) {
    statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
  }

  const statusChart = Object.entries(statusCounts).map(([status, count]) => ({ status, count }));

  const dailyOrders: Record<string, number> = {};
  for (const order of data || []) {
    const date = order.created_at.split("T")[0];
    dailyOrders[date] = (dailyOrders[date] || 0) + 1;
  }
  const timeSeries = Object.entries(dailyOrders).map(([date, count]) => ({ date, count })).sort((a, b) => a.date.localeCompare(b.date));

  const total = (data || []).length;

  const prevEndDate = new Date(startDate);
  prevEndDate.setDate(prevEndDate.getDate() - 1);
  const prevStartDate = new Date(prevEndDate);
  prevStartDate.setDate(prevStartDate.getDate() - days);

  const { data: prevData } = await supabase
    .from("orders")
    .select("id")
    .gte("created_at", prevStartDate.toISOString())
    .lte("created_at", prevEndDate.toISOString());

  const prevTotal = (prevData || []).length;
  const pctChange = prevTotal > 0 ? ((total - prevTotal) / prevTotal) * 100 : 0;

  return NextResponse.json({
    total,
    statusChart,
    timeSeries,
    prevTotal,
    pctChange: Math.round(pctChange * 10) / 10,
  });
}