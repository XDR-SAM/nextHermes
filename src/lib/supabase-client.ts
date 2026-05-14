/* eslint-disable @typescript-eslint/no-explicit-any */
import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

const MOCK_URL = "https://placeholder.supabase.co";
const MOCK_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2MDAwMDAwMDAsImV4cCI6MjAwMDAwMDAwMH0.placeholder";

// Lazy singleton — only creates client when first accessed
let _client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (!_client) {
    _client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || MOCK_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || MOCK_KEY
    );
  }
  return _client;
}

// Properly typed Proxy — forwards ALL properties to the real Supabase client
// This preserves all method signatures including onAuthStateChange's callback types
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getClient() as any;
    const val = client[prop as string];
    if (typeof val === "function") {
      return val.bind(client);
    }
    return val;
  },
});
