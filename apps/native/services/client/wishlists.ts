/**
 * TanStack Query hooks for wishlist-related API calls
 * Provides caching, automatic refetching, and mutations
 */

import { api } from "@app/lib/api-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { InferResponseType } from "hono/client";
import { parseResponse } from "hono/client";

// Infer response types from API endpoints
type WishlistResponse = InferResponseType<typeof api.api.wishlists.$get>;
export type WishlistItem = NonNullable<
  Extract<WishlistResponse, { wishlist: unknown }>["wishlist"]
>[number];

/**
 * Get user's wishlist
 */
export function useWishlist() {
  return useQuery({
    queryKey: ["wishlist"],
    queryFn: async () => {
      const result = await parseResponse(api.api.wishlists.$get()).catch(
        (e) => {
          console.error("Failed to fetch wishlist:", e);
          throw new Error(
            e instanceof Error ? e.message : "Failed to fetch wishlist"
          );
        }
      );
      return result.wishlist || [];
    },
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
  });
}

/**
 * Check if a room is in the wishlist
 */
export function useWishlistStatus(roomId: string, enabled = true) {
  return useQuery({
    queryKey: ["wishlist", "check", roomId],
    queryFn: async () => {
      const result = await parseResponse(
        api.api.wishlists.check[":roomId"].$get({
          param: { roomId },
        })
      ).catch((e) => {
        console.error("Failed to check wishlist status:", e);
        throw new Error(
          e instanceof Error ? e.message : "Failed to check wishlist status"
        );
      });
      return result.inWishlist;
    },
    enabled: enabled && !!roomId,
    staleTime: 1000 * 60 * 2, // Consider data fresh for 2 minutes
  });
}

/**
 * Add room to wishlist
 */
export function useAddToWishlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (roomId: string) => {
      const result = await parseResponse(
        api.api.wishlists.$post({
          json: { roomId },
        })
      ).catch((e) => {
        console.error("Failed to add to wishlist:", e);
        throw new Error(
          e instanceof Error ? e.message : "Failed to add to wishlist"
        );
      });

      return result.wishlistItem;
    },
    onSuccess: (_, roomId) => {
      // Invalidate wishlist queries
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      queryClient.invalidateQueries({
        queryKey: ["wishlist", "check", roomId],
      });
    },
  });
}

/**
 * Remove room from wishlist
 */
export function useRemoveFromWishlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (roomId: string) => {
      await parseResponse(
        api.api.wishlists[":roomId"].$delete({
          param: { roomId },
        })
      ).catch((e) => {
        console.error("Failed to remove from wishlist:", e);
        throw new Error(
          e instanceof Error ? e.message : "Failed to remove from wishlist"
        );
      });
      return roomId;
    },
    onSuccess: (roomId) => {
      // Invalidate wishlist queries
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      queryClient.invalidateQueries({
        queryKey: ["wishlist", "check", roomId],
      });
    },
  });
}
