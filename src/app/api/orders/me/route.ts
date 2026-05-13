import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);
    const status = searchParams.get("status");

    let query = supabase
      .from("orders")
      .select(
        `id, status, total, subtotal, tax, shipping_cost, order_number, shipping_address, created_at, updated_at,
        items:order_items(id, quantity, unit_price, product:products(id, name, slug, primary_image))`
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq("status", status);
    }

    const { data: orders, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const formatted = (orders || []).map((order) => ({
      id: order.id,
      order_number: order.order_number || `ORD-${order.id.slice(0, 8).toUpperCase()}`,
      status: order.status,
      total: order.total,
      subtotal: order.subtotal,
      tax: order.tax,
      shipping_cost: order.shipping_cost,
      created_at: order.created_at,
      items: (order.items || []).map((item: Record<string, unknown>) => ({
        id: item.id,
        name: (item.product as Record<string, unknown>)?.name || "Unknown Product",
        quantity: item.quantity,
        price: item.unit_price,
        image: (item.product as Record<string, unknown>)?.primary_image || "https://picsum.photos/100",
      })),
      item_count: (order.items || []).length,
    }));

    return NextResponse.json({ orders: formatted }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
