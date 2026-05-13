import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/utils/supabase/lib";

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

  return NextResponse.json({
    message: "Check your email to confirm your account",
    user: data.user ? { id: data.user.id, email: data.user.email } : null,
  });
}
