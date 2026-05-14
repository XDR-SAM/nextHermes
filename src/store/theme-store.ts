"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type Theme = "dark" | "light";

interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: "dark",

      toggleTheme: () => {
        const current = get().theme;
        const next = current === "dark" ? "light" : "dark";
        set({ theme: next });

        // Apply to <html> element — both class (Tailwind dark:) and attr (CSS vars)
        if (typeof document !== "undefined") {
          document.documentElement.classList.toggle("dark", next === "dark");
          document.documentElement.setAttribute("data-theme", next);
        }
      },

      setTheme: (theme: Theme) => {
        set({ theme });
        if (typeof document !== "undefined") {
          document.documentElement.setAttribute("data-theme", theme);
        }
      },
    }),
    {
      name: "hermes-theme",
      onRehydrateStorage: () => (state) => {
        // On load, sync BOTH .dark class and data-theme attribute with stored value
        if (state && typeof document !== "undefined") {
          document.documentElement.classList.toggle("dark", state.theme === "dark");
          document.documentElement.setAttribute("data-theme", state.theme);
        }
      },
    }
  )
);

// Export toggleTheme as a standalone function for use outside React components
export const toggleTheme = () => useThemeStore.getState().toggleTheme();
