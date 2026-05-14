import { createRouteHandlerClient } from "@/utils/supabase/lib";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const supabase = createRouteHandlerClient(cookieStore);

  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const dayAgo = new Date(now);
  dayAgo.setHours(dayAgo.getHours() - 24);

  const [{ data: ordersToday }, { data: orders24h }, { data: revenueToday }] = await Promise.all([
    supabase.from("orders").select("id, amount").gte("created_at", todayStart.toISOString()),
    supabase.from("orders").select("id, created_at").gte("created_at", dayAgo.toISOString()),
    supabase.from("orders").select("amount").eq("status", "delivered").gte("created_at", todayStart.toISOString()),
  ]);

  const ordersCount = (orders24h || []).length;
  const revenue = (revenueToday || []).reduce((sum, o) => sum + (o.amount || 0), 0);

  return NextResponse.json({
    ordersToday: ordersCount,
    revenueToday: Math.round(revenue * 100) / 100,
  });
}