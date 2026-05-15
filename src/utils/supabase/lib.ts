import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/** Shared Supabase client factory for Route Handlers (server-side API routes) */
export function createRouteHandlerClient(
  cookieStore: Awaited<ReturnType<typeof cookies>>
) {
  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const cookie of cookiesToSet) {
            cookieStore.set(cookie.name, cookie.value, cookie.options as Record<string, unknown>);
          }
        } catch {
          // Server Component context — cookies are managed by middleware.
        }
      },
    },
  });
}

/** Shared Supabase client factory for Next.js Middleware (Edge runtime) */
export function createMiddlewareClient(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
          supabaseResponse.cookies.set(name, value, options as Record<string, unknown>);
        });
      },
    },
  });

  return { supabase, supabaseResponse };
}

/** Admin role verification helper */
export async function verifyAdmin(
  supabase: Awaited<ReturnType<typeof createRouteHandlerClient>>
) {
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return { authorized: false, status: 401, error: "Unauthorized" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !["admin", "super_admin"].includes(profile.role)) {
    return { authorized: false, status: 403, error: "Forbidden: Admin access required" };
  }

  return { authorized: true, userId: user.id, role: profile.role };
}

/** Basic auth verification helper */
export async function verifyAuth(
  supabase: Awaited<ReturnType<typeof createRouteHandlerClient>>
) {
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return { authorized: false, status: 401, error: "Unauthorized" };
  }

  return { authorized: true, userId: user.id };
}

/** Service role client factory for Route Handlers — bypasses RLS */
export function createServiceRouteHandlerClient(
  cookieStore: Awaited<ReturnType<typeof cookies>>
) {
  return createServerClient(supabaseUrl, serviceKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const cookie of cookiesToSet) {
            cookieStore.set(cookie.name, cookie.value, cookie.options as Record<string, unknown>);
          }
        } catch {
          // Server Component context.
        }
      },
    },
  });
}