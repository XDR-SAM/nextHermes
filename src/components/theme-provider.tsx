"use client";

import { useEffect } from "react";
import { useThemeStore } from "@/store/theme-store";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Subscribe to theme changes — update .dark class on <html>
  useEffect(() => {
    // Sync .dark class whenever store changes
    const unsub = useThemeStore.subscribe((state) => {
      document.documentElement.classList.toggle("dark", state.theme === "dark");
    });

    // Initial sync (in case SSR class and store differ)
    const theme = useThemeStore.getState().theme;
    document.documentElement.classList.toggle("dark", theme === "dark");

    return unsub;
  }, []);

  return <>{children}</>;
}