import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import type { Profile } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 401 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: "Authentication failed" },
        { status: 401 }
      );
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, email, full_name, role, avatar_url, tenant_id")
      .eq("id", authData.user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "Failed to fetch profile" },
        { status: 500 }
      );
    }

    const role = profile.role;
    const redirectUrl =
      role === "super_admin" || role === "admin" || role === "moderator"
        ? "/admin"
        : "/dashboard";

    return NextResponse.json(
      {
        user: {
          id: authData.user.id,
          email: authData.user.email,
          ...profile,
        },
        session: {
          access_token: authData.session?.access_token,
          expires_at: authData.session?.expires_at,
        },
        redirect_url: redirectUrl,
      },
      {
        status: 200,
        headers: {
          "Set-Cookie": `session=${authData.session?.access_token}; HttpOnly; Path=/; ${
            process.env.NODE_ENV === "production" ? "Secure; " : ""
          }SameSite=Lax`,
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
