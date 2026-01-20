/**
 * TanStack Query hooks for review-related API calls
 * Provides caching, automatic refetching, and mutations
 */

import { api } from "@app/lib/api-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { InferResponseType } from "hono/client";
import { parseResponse } from "hono/client";

// Infer response types from API endpoints
// Using a workaround for nested route types
type RoomReviewsResponse = InferResponseType<
  (typeof api.api.reviews)["room"][":roomId"]["$get"]
>;

export type Review = NonNullable<
  Extract<RoomReviewsResponse, { reviews: unknown }>["reviews"]
>[number];

/**
 * Get reviews for a specific room
 */
export function useRoomReviews(roomId: string, enabled = true) {
  return useQuery({
    queryKey: ["reviews", "room", roomId],
    queryFn: async () => {
      const result = await parseResponse(
        api.api.reviews.room[":roomId"].$get({
          param: { roomId },
        })
      ).catch((e) => {
        console.error("Failed to fetch room reviews:", e);
        throw new Error(
          e instanceof Error ? e.message : "Failed to fetch room reviews"
        );
      });
      return result;
    },
    enabled: enabled && !!roomId,
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
  });
}

/**
 * Create a review for a booking
 */
export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reviewData: {
      bookingId: string;
      rating: number;
      cleanliness: number;
      accuracy: number;
      communication: number;
      location: number;
      value: number;
      comment: string;
    }) => {
      const result = await parseResponse(
        api.api.reviews.$post({
          json: reviewData,
        })
      ).catch((e) => {
        console.error("Failed to create review:", e);
        throw new Error(
          e instanceof Error ? e.message : "Failed to create review"
        );
      });
      return result.review;
    },
    onSuccess: (review) => {
      // Invalidate room reviews to refetch with new review
      queryClient.invalidateQueries({
        queryKey: ["reviews", "room", review.roomId],
      });
      // Also invalidate room details to update average rating
      queryClient.invalidateQueries({
        queryKey: ["room", review.roomId],
      });
    },
  });
}
