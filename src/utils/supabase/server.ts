import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

// ─── Authenticated client (uses anon key — respects RLS) ──────────────────────
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const createClient = async () => {
  const cookieStore = await cookies();
  return createServerClient(supabaseUrl, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookieStore.set(cookiesToSet[0]);
        } catch {
          // Server Component — ignore, middleware refreshes session.
        }
      },
    },
  });
};

// ─── Service role client (bypasses RLS — for admin API routes) ───────────────
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const createServiceClient = async () => {
  const cookieStore = await cookies();
  return createServerClient(supabaseUrl, serviceKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookieStore.set(cookiesToSet[0]);
        } catch {
          // Server Component — ignore.
        }
      },
    },
  });
};