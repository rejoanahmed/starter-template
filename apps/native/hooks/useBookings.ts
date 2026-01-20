/**
 * TanStack Query hooks for booking-related API calls
 * Provides caching, automatic refetching, and optimistic updates
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api-client";

/**
 * Create a new booking
 * Automatically invalidates bookings list on success
 */
export function useCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookingData: {
      roomId: string;
      startDate: string; // ISO date string (YYYY-MM-DD)
      endDate: string; // ISO date string (YYYY-MM-DD)
      guests: number;
      specialRequests?: string;
    }) => {
      const res = await api.api.bookings.$post({
        json: bookingData,
      });
      if (!res.ok) {
        throw new Error(`API Error: ${res.status}`);
      }
      const result = await res.json();
      if (!result) {
        throw new Error("No data returned");
      }
      return result;
    },
    onSuccess: (data) => {
      // Add new booking to cache
      if (data && typeof data === "object" && "booking" in data) {
        const bookingData = data as { booking: { id: string } };
        queryClient.setQueryData(["booking", bookingData.booking.id], data);
      }
      // Invalidate bookings list to refetch
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      // Invalidate room availability
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
  });
}

/**
 * Optimistic booking creation
 * Updates UI immediately before server confirms
 */
export function useOptimisticBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookingData: {
      roomId: string;
      startDate: string;
      endDate: string;
      guests: number;
      specialRequests?: string;
    }) => {
      const res = await api.api.bookings.$post({
        json: bookingData,
      });
      if (!res.ok) {
        throw new Error(`API Error: ${res.status}`);
      }
      const result = await res.json();
      if (!result) {
        throw new Error("No data returned");
      }
      return result;
    },

    // Optimistically update the UI before the mutation succeeds
    onMutate: async (newBooking) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["bookings"] });

      // Snapshot the previous value
      const previousBookings = queryClient.getQueryData(["bookings"]);

      // Optimistically update to the new value
      queryClient.setQueryData(["bookings"], (old: unknown) => {
        if (!old || typeof old !== "object") {
          return old;
        }
        const oldData = old as { bookings?: unknown[] };
        return {
          ...oldData,
          bookings: [
            ...(oldData.bookings || []),
            {
              id: `temp-${Date.now()}`,
              ...newBooking,
              status: "pending",
              createdAt: new Date().toISOString(),
            },
          ],
        };
      });

      // Return context with the snapshot
      return { previousBookings };
    },

    // If mutation fails, use the context to roll back
    onError: (_err, _newBooking, context) => {
      if (context?.previousBookings) {
        queryClient.setQueryData(["bookings"], context.previousBookings);
      }
    },

    // Always refetch after error or success
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
}
