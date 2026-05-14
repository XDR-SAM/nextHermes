import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import type { UserRole } from "@/lib/types";

async function verifyAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return { authorized: false, status: 401, error: "Unauthorized" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !["admin", "super_admin"].includes(profile.role)) {
    return { authorized: false, status: 403, error: "Forbidden: Admin access required" };
  }

  return { authorized: true, userId: user.id, role: profile.role as UserRole };
}

async function verifyAuth(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return { authorized: false, status: 401, error: "Unauthorized" };
  }

  return { authorized: true, userId: user.id };
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const auth = await verifyAdmin(supabase);

    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);
    const status = searchParams.get("status");

    let query = supabase
      .from("orders")
.select("id, status, amount, subtotal, tax, shipping_cost, user_id, shipping_address, payment_method, payment_status, invoice_number, created_at, updated_at")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq("status", status);
    }

    const { data: ordersData, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Fetch profiles separately to avoid FK join schema cache issues
    const userIds = [...new Set((ordersData || []).map((o) => o.user_id).filter(Boolean))];
    let profileMap: Record<string, { full_name: string | null; email: string }> = {};
    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", userIds);
      if (profiles) {
        for (const p of profiles) {
          profileMap[p.id] = { full_name: p.full_name, email: p.email };
        }
      }
    }

    // Fetch order items separately
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

    const orders = (ordersData || []).map((o) => ({
      id: o.id,
      status: o.status,
      amount: o.amount,
      subtotal: o.subtotal,
      tax: o.tax,
      shipping_cost: o.shipping_cost,
      payment_method: o.payment_method,
      payment_status: o.payment_status,
      shipping_address: o.shipping_address,
      invoice_number: o.invoice_number,
      order_number: o.invoice_number || `ORD-${o.id.slice(0, 8).toUpperCase()}`,
      created_at: o.created_at,
      updated_at: o.updated_at,
      profile: profileMap[o.user_id] || null,
      items: (itemsByOrder[o.id] || []).map((item) => ({
        id: item.id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        product_name: item.product_name,
      })),
    }));

    return NextResponse.json({ orders }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const auth = await verifyAuth(supabase);

    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();

    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { error: "Order must contain at least one item" },
        { status: 400 }
      );
    }

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: auth.userId,
        status: "pending",
        subtotal: body.subtotal || 0,
        tax: body.tax || 0,
        shipping_cost: body.shipping_cost || 0,
        amount: body.amount || 0,
        shipping_address: body.shipping_address || null,
        billing_address: body.billing_address || null,
      })
      .select()
      .single();

    if (orderError) {
      return NextResponse.json({ error: orderError.message }, { status: 400 });
    }

    const orderItems = body.items.map((item: Record<string, unknown>) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      product_name: item.product_name || "Product",
      total: (item.quantity as number) * (item.unit_price as number),
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      await supabase.from("orders").delete().eq("id", order.id);
      return NextResponse.json({ error: itemsError.message }, { status: 400 });
    }

    return NextResponse.json(
      { order, message: "Order created successfully" },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}