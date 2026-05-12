"use client";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import type { Profile } from "@/lib/types";

export function useAuth() {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      setProfile(data as Profile | null);
      setLoading(false);
    };
    getProfile();
  }, [pathname]);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return { profile, loading, signOut };
}
