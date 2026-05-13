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
    .from("profiles")
    .select("created_at")
    .gte("created_at", startDate.toISOString())
    .lte("created_at", endDate.toISOString())
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const dailyNew: Record<string, number> = {};
  for (const p of data || []) {
    const date = p.created_at.split("T")[0];
    dailyNew[date] = (dailyNew[date] || 0) + 1;
  }
  const series = Object.entries(dailyNew).map(([date, count]) => ({ date, count }));

  const total = (data || []).length;

  const prevEndDate = new Date(startDate);
  prevEndDate.setDate(prevEndDate.getDate() - 1);
  const prevStartDate = new Date(prevEndDate);
  prevStartDate.setDate(prevStartDate.getDate() - days);

  const { data: prevData } = await supabase
    .from("profiles")
    .select("id")
    .gte("created_at", prevStartDate.toISOString())
    .lte("created_at", prevEndDate.toISOString());

  const prevTotal = (prevData || []).length;
  const pctChange = prevTotal > 0 ? ((total - prevTotal) / prevTotal) * 100 : 0;

  return NextResponse.json({
    series,
    total,
    prevTotal,
    pctChange: Math.round(pctChange * 10) / 10,
  });
}