import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/utils/supabase/server";

// Allow GET for edge cases (e.g., direct URL access), but require auth
export async function GET(request: NextRequest) {
  return NextResponse.json({ error: "Method not allowed. Use POST to create orders." }, { status: 405 });
}

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

    // Calculate totals
    const subtotal = items.reduce((sum: number, item: { price: number; quantity: number }) => sum + (item.price * item.quantity), 0);

    // Generate tracking number
    const ts = Date.now().toString(36).toUpperCase();
    const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
    const trackingNumber = `TRK-${ts}-${rand}`;
    const trackingLink = `https://next-hermes.vercel.app/track/${trackingNumber}`;
    const orderNumber = `ORD-${ts}`;

    // Build full shipping address from parts
    const shippingAddress = `${address.name}${address.phone ? `, ${address.phone}` : ""}, ${address.address}, ${address.city}${address.state ? `, ${address.state}` : ""} ${address.zip}, ${address.country}`;

    // Use service client to bypass RLS for writes
    const svc = await createServiceClient();

    // Insert order using actual DB columns
    const { data: order, error: orderError } = await svc
      .from("orders")
      .insert({
        user_id: user.id,
        order_number: orderNumber,
        status: "pending",
        subtotal,
        tax_amount: 0,
        shipping_amount: subtotal >= 100 ? 0 : 9.99,
        total_amount: subtotal + (subtotal >= 100 ? 0 : 9.99),
        currency: "USD",
        shipping_name: address.name,
        shipping_address: shippingAddress,
        shipping_city: address.city,
        shipping_state: address.state || null,
        shipping_postal: address.zip,
        shipping_country: address.country,
        shipping_phone: address.phone || null,
        tracking_number: trackingNumber,
        tracking_link: trackingLink,
        notes: `Payment: ${payment_method === "cod" ? "Cash on Delivery" : "Online Payment"}`,
      })
      .select("id")
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: orderError?.message || "Failed to create order" }, { status: 500 });
    }

    // Insert order items — use actual DB columns: name, price, quantity, total
    const orderItems = items.map((item: { id: string; name: string; price: number; quantity: number; image?: string }) => ({
      order_id: order!.id,
      product_id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      total: item.price * item.quantity,
    }));

    const { error: itemsError } = await svc.from("order_items").insert(orderItems);

    if (itemsError) {
      await svc.from("orders").delete().eq("id", order.id);
      return NextResponse.json({ error: itemsError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      order_id: order.id,
      order_number: orderNumber,
      tracking_number: trackingNumber,
      tracking_link: trackingLink,
      total: subtotal,
      payment_method,
    }, { status: 201 });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}