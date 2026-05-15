import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/utils/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const svc = await createServiceClient();

  const { data, error } = await svc
    .from("product_images")
    .select("*")
    .eq("product_id", id)
    .order("sort_order");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const svc = await createServiceClient();

  const { data, error } = await svc
    .from("product_images")
    .insert({ ...body, product_id: id })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const svc = await createServiceClient();

  const imageId = body.id;
  const { id: _imgId, product_id: _pid, ...updateData } = body;

  const { data, error } = await svc
    .from("product_images")
    .update(updateData)
    .eq("id", imageId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const svc = await createServiceClient();

  const url = new URL(request.url);
  const imageId = url.searchParams.get("imageId");

  if (!imageId) return NextResponse.json({ error: "imageId required" }, { status: 400 });

  const { error } = await svc
    .from("product_images")
    .delete()
    .eq("id", imageId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}