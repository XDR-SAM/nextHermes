import { NextResponse } from "next/server";

// GET products with service role (bypasses RLS)
export async function GET(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  const url = new URL(request.url);
  const categoryId = url.searchParams.get("category_id");
  const search = url.searchParams.get("search");
  const sort = url.searchParams.get("sort") || "created_at.desc";
  const limit = url.searchParams.get("limit") || "50";

  let query = `${supabaseUrl}/rest/v1/products?select=*&order=${sort}&limit=${limit}`;

  if (categoryId) {
    query += `&category_id=eq.${categoryId}`;
  }

  if (search) {
    query += `&name=ilike.*${encodeURIComponent(search)}*`;
  }

  const res = await fetch(query, {
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json({ error: err }, { status: 502 });
  }

  const data = await res.json();
  return NextResponse.json({ products: data });
}

// POST — create product (admin only)
export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  // Validate required fields from JSON body
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { name, price, description, category_id } = body;

  if (!name || !price) {
    return NextResponse.json({ error: "name and price are required" }, { status: 400 });
  }

  const res = await fetch(`${supabaseUrl}/rest/v1/products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      name,
      slug: String(name).toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
      price: Number(price),
      description: description || "",
      category_id: category_id || null,
      stock_quantity: Number(body.stock_quantity) || 0,
      is_active: body.is_active !== false,
      primary_image: body.primary_image || null,
      avg_rating: 0,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json({ error: err }, { status: 500 });
  }

  const data = await res.json();
  return NextResponse.json({ product: data }, { status: 201 });
}