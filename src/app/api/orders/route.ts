import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { items, address, payment_method = "cod" } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    if (!address || !address.name || !address.address || !address.city || !address.zip || !address.country) {
      return NextResponse.json({ error: "Complete shipping address is required" }, { status: 400 });
    }

    // Build shipping address string
    const shippingAddress = `${address.name}${address.phone ? `, ${address.phone}` : ""}, ${address.address}, ${address.city}${address.state ? `, ${address.state}` : ""} ${address.zip}, ${address.country}`;

    // Calculate totals (mirror checkout page)
    const subtotal = items.reduce((sum: number, item: { price: number; quantity: number }) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal >= 100 ? 0 : 9.99;
    const tax = subtotal * 0.0875;
    const total = subtotal + shipping + tax;

    // Generate order number
    const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}`;

    // Insert order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        order_number: orderNumber,
        status: "pending",
        subtotal,
        tax,
        shipping_cost: shipping,
        amount: total,
        shipping_address: shippingAddress,
        payment_method,
        payment_status: payment_method === "cod" ? "pending" : "pending",
        notes: `Payment method: ${payment_method === "cod" ? "Cash on Delivery" : "Online Payment"}`,
      })
      .select()
      .single();

    if (orderError) {
      return NextResponse.json({ error: orderError.message }, { status: 500 });
    }

    // Insert order items
    const orderItems = items.map((item: { id: string; name: string; price: number; quantity: number; image?: string }) => ({
      order_id: order.id,
      product_id: item.id,
      product_name: item.name,
      quantity: item.quantity,
      unit_price: item.price,
      total: item.price * item.quantity,
    }));

    const { error: itemsError } = await supabase.from("order_items").insert(orderItems);

    if (itemsError) {
      // Rollback order
      await supabase.from("orders").delete().eq("id", order.id);
      return NextResponse.json({ error: itemsError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      order_id: order.id,
      order_number: orderNumber,
      total,
      payment_method,
    }, { status: 201 });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}