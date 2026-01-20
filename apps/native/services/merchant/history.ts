import { api } from "@app/lib/api-client";
import { useQuery } from "@tanstack/react-query";

export type BookingStatus =
  | "waiting_confirmation"
  | "waiting_checkin"
  | "finished";

export type Booking = {
  id: string;
  roomId: string;
  customerName: string;
  peopleCount: number;
  price: number;
  status: BookingStatus;
  statusText: string;
  date: string;
  time: string;
  roomName?: string;
  currency?: string;
  customerAvatar?: string;
};

// Map API status to UI status
const mapStatus = (
  apiStatus: "pending" | "confirmed" | "cancelled" | "completed",
  startDate: string
): { status: BookingStatus; statusText: string } => {
  const now = new Date();
  const start = new Date(startDate);
  const isPast = start < now;

  if (apiStatus === "cancelled") {
    return { status: "finished", statusText: "Cancelled" };
  }

  if (apiStatus === "completed") {
    return { status: "finished", statusText: "Finished" };
  }

  if (apiStatus === "pending") {
    return isPast
      ? {
          status: "waiting_confirmation",
          statusText: "Finished, waiting for confirmation",
        }
      : { status: "waiting_checkin", statusText: "Waiting for check-in" };
  }

  if (apiStatus === "confirmed") {
    return isPast
      ? {
          status: "waiting_confirmation",
          statusText: "Finished, waiting for confirmation",
        }
      : { status: "waiting_checkin", statusText: "Waiting for check-in" };
  }

  return { status: "finished", statusText: "Finished" };
};

// Format date for display
const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const bookingDate = new Date(date);
  bookingDate.setHours(0, 0, 0, 0);

  const isToday = bookingDate.getTime() === today.getTime();

  if (isToday) {
    return `Today, ${date.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit" })}, ${date.toLocaleDateString("en-US", { weekday: "short" })}`;
  }

  return `${date.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit" })}, ${date.toLocaleDateString("en-US", { weekday: "short" })}`;
};

// Format time range
const formatTimeRange = (startDate: string, endDate: string): string => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const formatTime = (d: Date): string =>
    d.toLocaleString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

  return `${formatTime(start)} - ${formatTime(end)}`;
};

// Fetch bookings from API
const fetchBookingsApi = async (): Promise<Booking[]> => {
  const res = await api.api.merchant.bookings.$get();

  if (!res.ok) {
    throw new Error(`Failed to fetch bookings: ${res.status}`);
  }

  const data = await res.json();
  const apiBookings = data.bookings || [];

  return apiBookings.map((booking) => {
    const { status, statusText } = mapStatus(booking.status, booking.startAt);
    const startDate = booking.startAt;
    const endDate = booking.endAt;

    return {
      id: booking.id,
      roomId: booking.roomId,
      customerName: booking.customer?.name || "Unknown Customer",
      peopleCount: booking.guests,
      price: Number.parseFloat(booking.totalPrice),
      status,
      statusText,
      date: formatDate(startDate),
      time: formatTimeRange(startDate, endDate),
      roomName: booking.room?.title,
      currency: "HKD",
      customerAvatar: undefined, // Could be added to user schema later
    };
  });
};

// React Query hook for fetching bookings
export const useBookings = () => {
  return useQuery({
    queryKey: ["merchant", "bookings"],
    queryFn: fetchBookingsApi,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
  });
};
