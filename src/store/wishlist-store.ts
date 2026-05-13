"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "@/lib/supabase-client";

interface WishlistState {
  wishlistItems: string[];
  isSyncing: boolean;
  toggleWishlist: (id: string) => Promise<void>;
  removeFromWishlist: (id: string) => void;
  isInWishlist: (id: string) => boolean;
  syncWithSupabase: () => Promise<void>;
  setWishlistItems: (items: string[]) => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      wishlistItems: [],
      isSyncing: false,

      toggleWishlist: async (id: string) => {
        const { wishlistItems } = get();
        const exists = wishlistItems.includes(id);
        
        set((state) => ({
          wishlistItems: exists
            ? state.wishlistItems.filter((item) => item !== id)
            : [...state.wishlistItems, id],
        }));

        // Sync with Supabase
        try {
          const { data: { user } } = await supabase.auth.getUser();
          
          if (user) {
            if (exists) {
              await supabase
                .from("wishlists")
                .delete()
                .eq("user_id", user.id)
                .eq("product_id", id);
            } else {
              await supabase.from("wishlists").insert({
                user_id: user.id,
                product_id: id,
              });
            }
          }
        } catch (error) {
          console.error("Error syncing wishlist:", error);
        }
      },

      removeFromWishlist: (id: string) => {
        set((state) => ({
          wishlistItems: state.wishlistItems.filter((item) => item !== id),
        }));

        // Sync with Supabase (non-blocking)
        supabase.auth.getUser().then(({ data: { user } }) => {
          if (user) {
            supabase
              .from("wishlists")
              .delete()
              .eq("user_id", user.id)
              .eq("product_id", id);
          }
        }).catch((error) => {
          console.error("Error removing from wishlist:", error);
        });
      },

      isInWishlist: (id: string) => {
        return get().wishlistItems.includes(id);
      },

      syncWithSupabase: async () => {
        set({ isSyncing: true });
        try {
          const { data: { user } } = await supabase.auth.getUser();
          
          if (user) {
            const { data: wishlists } = await supabase
              .from("wishlists")
              .select("product_id")
              .eq("user_id", user.id);
            
            if (wishlists) {
              const productIds = wishlists.map((w: { product_id: string }) => w.product_id);
              set({ wishlistItems: productIds });
            }
          }
        } catch (error) {
          console.error("Error syncing with Supabase:", error);
        } finally {
          set({ isSyncing: false });
        }
      },

      setWishlistItems: (items: string[]) => {
        set({ wishlistItems: items });
      },
    }),
    {
      name: "hermes-wishlist",
    }
  )
);
