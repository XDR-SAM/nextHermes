import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  const url = new URL(request.url);
  const categoryId = url.searchParams.get("category_id");
  const search = url.searchParams.get("search");
  const sortParam = url.searchParams.get("sort") || "created_at.desc";
  const limitParam = url.searchParams.get("limit") || "50";
  const offsetParam = url.searchParams.get("offset") || "0";
  const minPrice = url.searchParams.get("min_price");
  const maxPrice = url.searchParams.get("max_price");

  // Map sort param → Supabase column + direction
  // Real columns: created_at, price, name, stock_quantity, updated_at
  const SORT_MAP: Record<string, string> = {
    newest: "created_at.desc",
    price_asc: "price.asc",
    price_desc: "price.desc",
    rating: "name.asc", // no rating column, fallback to name
    "created_at.desc": "created_at.desc",
    "created_at.asc": "created_at.asc",
    "price.asc": "price.asc",
    "price.desc": "price.desc",
    "name.asc": "name.asc",
  };
  const sort = SORT_MAP[sortParam] || "created_at.desc";
  const [sortCol, sortDir] = sort.split(".");

  // Build Supabase query params
  const queryParts: string[] = [];
  queryParts.push(`select=*`);
  queryParts.push(`order=${sortCol}.${sortDir}`);
  queryParts.push(`limit=${limitParam}`);
  queryParts.push(`offset=${offsetParam}`);

  if (categoryId) queryParts.push(`category_id=eq.${categoryId}`);
  if (search) queryParts.push(`name=ilike.*${encodeURIComponent(search)}*`);
  if (minPrice) queryParts.push(`price=gte.${minPrice}`);
  if (maxPrice) queryParts.push(`price=lte.${maxPrice}`);

  const query = `${supabaseUrl}/rest/v1/products?${queryParts.join("&")}`;

  const res = await fetch(query, {
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      Prefer: "count=exact",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json({ error: err }, { status: 502 });
  }

  // Total count from header
  const total = res.headers.get("content-range")
    ? parseInt(res.headers.get("content-range")!.split("/")[1] || "0", 10)
    : 0;

  const data = await res.json();
  return NextResponse.json({ products: data, total });
}

// POST — create product (admin only, currently unused by seed)
export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { name, price, description } = body;
  if (!name || !price) {
    return NextResponse.json({ error: "name and price are required" }, { status: 400 });
  }

  const slug = String(name)
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

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
      slug,
      price: Number(price),
      description: description || "",
      category_id: body.category_id || null,
      stock_quantity: Number(body.stock_quantity) || 0,
      is_active: body.is_active !== false,
      primary_image: body.primary_image || null,
      short_description: body.short_description || "",
      original_price: body.original_price || null,
      sku: body.sku || null,
      stock_status: body.stock_status || "in_stock",
      is_featured: body.is_featured ?? false,
      is_trending: body.is_trending ?? false,
      brand_id: null,
      metadata: {},
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json({ error: err }, { status: 500 });
  }

  const data = await res.json();
  return NextResponse.json({ product: data }, { status: 201 });
}