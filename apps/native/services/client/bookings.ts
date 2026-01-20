/**
 * TanStack Query hooks for booking-related API calls
 */

import { api } from "@app/lib/api-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { InferResponseType } from "hono/client";
import { parseResponse } from "hono/client";

// Infer response types from the API endpoints
type BookingsListResponse = InferResponseType<typeof api.api.bookings.$get>;
export type Booking = NonNullable<
  Extract<BookingsListResponse, { bookings: unknown }>["bookings"]
>[number];

type BookingResponse = InferResponseType<
  (typeof api.api.bookings)[":id"]["$get"]
>;
export type BookingDetail = NonNullable<
  Extract<BookingResponse, { booking: unknown }>["booking"]
>;

export type CreateBookingRequest = {
  roomId: string;
  startDate: string; // ISO 8601 date string
  endDate: string; // ISO 8601 date string
  guests: number;
  specialRequests?: string;
};

/**
 * Get all bookings for the authenticated user
 */
export function useBookings() {
  return useQuery({
    queryKey: ["bookings"],
    queryFn: async () => {
      const result = await parseResponse(api.api.bookings.$get()).catch((e) => {
        console.error("Failed to fetch bookings:", e);
        throw new Error(
          e instanceof Error ? e.message : "Failed to fetch bookings"
        );
      });
      return result;
    },
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
  });
}

/**
 * Get a specific booking by ID
 */
export function useBooking(bookingId: string, enabled = true) {
  return useQuery({
    queryKey: ["booking", bookingId],
    queryFn: async () => {
      const result = await parseResponse(
        api.api.bookings[":id"].$get({
          param: { id: bookingId },
        })
      ).catch((e) => {
        console.error("Failed to fetch booking:", e);
        throw new Error(
          e instanceof Error ? e.message : "Failed to fetch booking"
        );
      });
      return result.booking;
    },
    enabled: enabled && !!bookingId,
    staleTime: 1000 * 60 * 10, // Booking details stay fresh for 10 minutes
  });
}

/**
 * Create a new booking
 */
export function useCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookingData: CreateBookingRequest) => {
      const result = await parseResponse(
        api.api.bookings.$post({
          json: bookingData,
        })
      ).catch((e) => {
        console.error("Failed to create booking:", e);
        throw new Error(
          e instanceof Error ? e.message : "Failed to create booking"
        );
      });
      return result.booking;
    },
    onSuccess: () => {
      // Invalidate bookings list to refetch
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
}
