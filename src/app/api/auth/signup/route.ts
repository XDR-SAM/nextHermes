import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient, createServiceRouteHandlerClient } from "@/utils/supabase/lib";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  const { email, password, fullName } = await request.json();

  if (!email || !password || !fullName) {
    return NextResponse.json(
      { error: "Email, password, and full name are required." },
      { status: 400 }
    );
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters." },
      { status: 400 }
    );
  }

  const cookieStore = await cookies();
  const supabase = createRouteHandlerClient(cookieStore);

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }

  // Create profile row using service client to bypass RLS
  if (data.user) {
    const svc = createServiceRouteHandlerClient(cookieStore);
    const { error: profileError } = await svc.from("profiles").upsert({
      id: data.user.id,
      email: data.user.email,
      full_name: fullName,
      role: "user",
      is_active: true,
    });
    if (profileError) {
      console.error("Profile creation failed:", profileError.message);
    }
  }

  return NextResponse.json({
    message: "Check your email to confirm your account",
    user: data.user ? { id: data.user.id, email: data.user.email } : null,
  });
}
