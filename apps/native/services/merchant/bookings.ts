/**
 * Bookings service for merchant booking management
 */

import { api } from "@app/lib/api-client";

export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";

export type Booking = {
  id: string;
  roomId: string;
  userId: string;
  startDate: string;
  endDate: string;
  guests: number;
  totalPrice: string;
  status: BookingStatus;
  cancellationReason?: string;
  specialRequests?: string;
  createdAt: string;
  updatedAt: string;
};

export type BookingWithDetails = Booking & {
  room: {
    id: string;
    title: string;
    description: string;
    district: string;
    address: string;
    basePrice: string;
    cleaningFee?: string;
    photos: Array<{
      id: string;
      url: string;
      width: number;
      height: number;
      isCover: boolean;
      order: number;
    }>;
    merchantId: string;
  };
  customer: {
    id: string;
    name: string;
    email: string;
  };
  paymentBreakdown: {
    basePrice: number;
    nights: number;
    subtotal: number;
    cleaningFee: number;
    total: number;
  };
};

export type BookingListItem = {
  id: string;
  roomId: string;
  userId: string;
  startDate: string;
  endDate: string;
  guests: number;
  totalPrice: string;
  status: BookingStatus;
  cancellationReason?: string;
  specialRequests?: string;
  createdAt: string;
  updatedAt: string;
  room: {
    id: string;
    title: string;
    district: string;
    address: string;
  };
  customer: {
    id: string;
    name: string;
    email: string;
  };
};

export const bookingsService = {
  /**
   * Get all bookings for the authenticated merchant
   */
  async getMerchantBookings() {
    const res = await api.api.merchant.bookings.$get();
    if (!res.ok) {
      throw new Error(`API Error: ${res.status}`);
    }
    return await res.json();
  },

  /**
   * Get booking details by ID
   */
  async getBookingDetails(bookingId: string) {
    const res = await api.api.merchant.bookings[":id"].$get({
      param: { id: bookingId },
    });
    if (!res.ok) {
      throw new Error(res.statusText);
    }
    return await res.json();
  },

  /**
   * Update booking status
   */
  async updateBookingStatus(
    bookingId: string,
    _status: BookingStatus,
    _cancellationReason?: string
  ) {
    const res = await api.api.merchant.bookings[":id"].status.$patch({
      param: { id: bookingId },
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || `API Error: ${res.status}`);
    }
    return await res.json();
  },

  /**
   * Format date for display
   */
  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  },

  /**
   * Calculate nights between dates
   */
  calculateNights(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  },
};

export default bookingsService;
