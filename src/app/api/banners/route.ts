import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/utils/supabase/lib";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const supabase = createRouteHandlerClient(cookieStore);

  // Auth check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Role check
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
    text_color,
    button_style,
    position,
    sort_order,
    is_active,
    show_from,
    show_until,
  } = body;

  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("banners")
    .insert({
      title,
      subtitle,
      description,
      cta_text: cta_text ?? "Shop Now",
      cta_link: cta_link ?? "/products",
      background_image,
      text_color: text_color ?? "white",
      button_style: button_style ?? "primary",
      position: position ?? "hero",
      sort_order: sort_order ?? 0,
      is_active: is_active ?? false,
      show_from,
      show_until,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ banner: data }, { status: 201 });
}