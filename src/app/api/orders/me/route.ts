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
      .select("id, status, amount, subtotal, tax, shipping_cost, shipping_address, payment_method, payment_status, invoice_number, created_at, updated_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq("status", status);
    }

    const { data: ordersData, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const orderIds = (ordersData || []).map((o) => o.id);
    let itemsByOrder: Record<string, { id: string; quantity: number; unit_price: number; product_name: string }[]> = {};
    if (orderIds.length > 0) {
      const { data: allItems } = await supabase
        .from("order_items")
        .select("order_id, id, product_name, quantity, unit_price")
        .in("order_id", orderIds);
      if (allItems) {
        for (const item of allItems) {
          if (!itemsByOrder[item.order_id]) itemsByOrder[item.order_id] = [];
          itemsByOrder[item.order_id].push(item);
        }
      }
    }

    const formatted = (ordersData || []).map((order) => ({
      id: order.id,
      order_number: order.invoice_number || `ORD-${order.id.slice(0, 8).toUpperCase()}`,
      status: order.status,
      total: order.amount,
      subtotal: order.subtotal,
      tax: order.tax,
      shipping_cost: order.shipping_cost,
      created_at: order.created_at,
      items: (itemsByOrder[order.id] || []).map((item) => ({
        id: item.id,
        name: item.product_name || "Unknown Product",
        quantity: item.quantity,
        price: item.unit_price,
        image: "https://picsum.photos/100",
      })),
      item_count: (itemsByOrder[order.id] || []).length,
    }));

    return NextResponse.json({ orders: formatted }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
