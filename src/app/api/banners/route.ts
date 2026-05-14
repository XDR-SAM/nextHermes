import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/utils/supabase/lib";
import { cookies } from "next/headers";

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

// GET — public, returns active promo_banners
// Uses service role key internally so RLS doesn't block reads
export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  // Service role bypasses RLS — safe for public read
  const res = await fetch(
    `${supabaseUrl}/rest/v1/promo_banners?is_active=eq.true&select=*&order=sort_order.asc`,
    {
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
      },
      cache: "force-cache",
    }
  );

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

  return NextResponse.json({ banners });
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

  if (!["admin", "super_admin"].includes(profile?.role ?? "")) {
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

// PUT — admin only, update existing banner
export async function PUT(request: NextRequest) {
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

  if (!["admin", "super_admin"].includes(profile?.role ?? "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const {
    id,
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

  if (!id) {
    return NextResponse.json({ error: "Banner ID is required" }, { status: 400 });
  }

  const dbPayload: Record<string, unknown> = {
    ...(title !== undefined && { title }),
    ...(subtitle !== undefined && { subtitle: subtitle || description || "" }),
    ...(cta_text !== undefined && { link_text: cta_text }),
    ...(cta_link !== undefined && { link: cta_link }),
    ...(background_image !== undefined && { background_image: background_image || null }),
    ...(background_color !== undefined && { background_color: background_color || "#0a0a0a" }),
    ...(text_color !== undefined && { text_color: text_color || "#ffffff" }),
    ...(sort_order !== undefined && { sort_order }),
    ...(is_active !== undefined && { is_active }),
    ...(show_from !== undefined && { starts_at: show_from || null }),
    ...(show_until !== undefined && { ends_at: show_until || null }),
  };

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  const res = await fetch(`${supabaseUrl}/rest/v1/promo_banners?id=eq.${id}`, {
    method: "PATCH",
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
  return NextResponse.json({ banner: data });
}

// DELETE — admin only, delete banner
export async function DELETE(request: NextRequest) {
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

  if (!["admin", "super_admin"].includes(profile?.role ?? "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Banner ID is required" }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  const res = await fetch(`${supabaseUrl}/rest/v1/promo_banners?id=eq.${id}`, {
    method: "DELETE",
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
    },
  });

  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json({ error: err }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
