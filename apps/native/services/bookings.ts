/**
 * Booking service using Hono RPC for type-safe API calls
 * This replaces the old Firebase-based booking service
 */

import { api } from "../lib/api-client";

export const bookingsService = {
  /**
   * Create a new booking
   */
  async createBooking(bookingData: {
    roomId: string;
    startDate: string; // ISO date string (YYYY-MM-DD)
    endDate: string; // ISO date string (YYYY-MM-DD)
    guests: number;
    specialRequests?: string;
  }) {
    const res = await api.api.bookings.$post({
      json: bookingData,
    });
    if (!res.ok) {
      throw new Error(`API Error: ${res.status}`);
    }
    return await res.json();
  },

  /**
   * Get all bookings for the authenticated user
   */
  async getUserBookings() {
    const res = await api.api.bookings.$get();
    if (!res.ok) {
      throw new Error(`API Error: ${res.status}`);
    }
    const data = await res.json();
    return data.bookings || [];
  },

  /**
   * Get a specific booking by ID
   */
  async getBooking(bookingId: string) {
    const res = await api.api.bookings[":id"].$get({
      param: { id: bookingId },
    });
    if (!res.ok) {
      throw new Error(`API Error: ${res.status}`);
    }
    return await res.json();
  },

  /**
   * Update a booking
   */
  async updateBooking(
    bookingId: string,
    updates: {
      startDate?: string;
      endDate?: string;
      guests?: number;
      specialRequests?: string;
    }
  ) {
    const res = await api.api.bookings[":id"].$patch({
      param: { id: bookingId },
      json: updates,
    });
    if (!res.ok) {
      throw new Error(`API Error: ${res.status}`);
    }
    return await res.json();
  },

  /**
   * Cancel a booking
   */
  async cancelBooking(bookingId: string) {
    const res = await api.api.bookings[":id"].$delete({
      param: { id: bookingId },
    });
    if (!res.ok) {
      throw new Error(`API Error: ${res.status}`);
    }
    return await res.json();
  },
};

export default bookingsService;
