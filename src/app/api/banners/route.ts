import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/utils/supabase/lib";
import { cookies } from "next/headers";

// Map internal field names to promo_banners column names
const FIELD_MAP_TO_DB = {
  title: "title",
  subtitle: "subtitle",
  description: "subtitle",
  cta_text: "link_text",
  cta_link: "link",
  background_image: "background_image",
  text_color: "text_color",
  sort_order: "sort_order",
  is_active: "is_active",
  show_from: "starts_at",
  show_until: "ends_at",
};

// GET — public, returns active promo_banners
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const position = searchParams.get("position"); // hero | promo | hero,promo | all

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  let query = `${supabaseUrl}/rest/v1/promo_banners?is_active=eq.true&select=*&order=sort_order.asc`;

  const res = await fetch(query, {
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
    },
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    return NextResponse.json({ error: "Failed to fetch banners" }, { status: 502 });
  }

  const rows: DbBanner[] = await res.json();

  // Map DB columns → API field names
  const banners = rows.map((r) => ({
    id: r.id,
    title: r.title,
    subtitle: r.subtitle,
    description: r.subtitle,
    cta_text: r.link_text,
    cta_link: r.link,
    background_image: r.background_image,
    background_color: r.background_color,
    text_color: r.text_color,
    sort_order: r.sort_order,
    is_active: r.is_active,
    show_from: r.starts_at,
    show_until: r.ends_at,
    created_at: r.created_at,
  }));

  // Filter by position if requested
  let filtered = banners;
  if (position && position !== "all") {
    const positions = position.split(",");
    filtered = banners.filter((b) => positions.includes(getPosition(b)));
  }

  return NextResponse.json({ banners: filtered });
}

// POST — admin only, create banner in promo_banners
export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const supabase = createRouteHandlerClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!["admin", "super_admin"].includes(profile?.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const {
    title,
    subtitle,
    description,
    cta_text,
    cta_link,
    background_image,
    background_color,
    text_color,
    sort_order,
    is_active,
    show_from,
    show_until,
  } = body;

  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  // Map to promo_banners columns
  const dbPayload: Record<string, unknown> = {
    title,
    subtitle: subtitle || description || "",
    link_text: cta_text || "Shop Now",
    link: cta_link || "/products",
    background_image: background_image || null,
    background_color: background_color || "#0a0a0a",
    text_color: text_color || "#ffffff",
    sort_order: sort_order ?? 0,
    is_active: is_active ?? false,
    starts_at: show_from || null,
    ends_at: show_until || null,
  };

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  const res = await fetch(`${supabaseUrl}/rest/v1/promo_banners`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      Prefer: "return=representation",
    },
    body: JSON.stringify(dbPayload),
  });

  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json({ error: err }, { status: 500 });
  }

  const [data] = await res.json();
  return NextResponse.json({ banner: data }, { status: 201 });
}

interface DbBanner {
  id: string;
  title: string;
  subtitle: string;
  link: string;
  link_text: string;
  background_image: string | null;
  background_color: string | null;
  text_color: string | null;
  is_active: boolean;
  sort_order: number;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
}

function getPosition(banner: { background_image?: string | null; background_color?: string | null }): string {
  // If it has a background image, treat as hero; otherwise promo
  return banner.background_image ? "hero" : "promo";
}
