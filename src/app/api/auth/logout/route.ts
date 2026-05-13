import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/utils/supabase/lib";

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const supabase = createRouteHandlerClient(cookieStore);

  const { error } = await supabase.auth.signOut();

  if (error) {
    return NextResponse.json(
      { error: "Failed to sign out. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
