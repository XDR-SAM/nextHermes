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
        const next = get().theme === "dark" ? "light" : "dark";
        set({ theme: next });
      },

      setTheme: (theme: Theme) => {
        set({ theme });
      },
    }),
    {
      name: "hermes-theme",
    }
  )
);

// Standalone function — toggles the stored theme and applies .dark class
export function toggleTheme() {
  const next = useThemeStore.getState().theme === "dark" ? "light" : "dark";
  useThemeStore.getState().setTheme(next);
  document.documentElement.classList.toggle("dark", next === "dark");
}