"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface WishlistState {
  wishlistItems: string[];
  toggleWishlist: (id: string) => void;
  isInWishlist: (id: string) => boolean;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      wishlistItems: [],

      toggleWishlist: (id: string) => {
        set((state) => {
          const exists = state.wishlistItems.includes(id);
          return {
            wishlistItems: exists
              ? state.wishlistItems.filter((item) => item !== id)
              : [...state.wishlistItems, id],
          };
        });
      },

      isInWishlist: (id: string) => {
        return get().wishlistItems.includes(id);
      },
    }),
    {
      name: "hermes-wishlist",
    }
  )
);
