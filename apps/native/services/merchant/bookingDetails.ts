import { api } from "@app/lib/api-client";
import { useQuery } from "@tanstack/react-query";

// Types
export type BookingStatus =
  | "waiting_confirmation"
  | "waiting_checkin"
  | "finished";

export type BookingClient = {
  name: string;
  phone: string;
  email: string;
};

export type BookingRoom = {
  id: string;
  name: string;
  address: string;
  imageUrl: string;
  capacity: string;
  rating: number;
  reviewCount: number;
  latitude: number;
  longitude: number;
};

export type BookingPayment = {
  roomPrice: number;
  deposit: number;
  totalCost: number;
  currency: string;
};

export type BookingDetails = {
  id: string;
  status: BookingStatus;
  statusText: string;
  room: BookingRoom;
  checkIn: {
    date: string;
    time: string;
  };
  checkOut: {
    date: string;
    time: string;
  };
  numberOfGuests: number;
  client: BookingClient;
  confirmationCode: string;
  cancellationPolicy: {
    summary: string;
    fullDetails: string;
  };
  depositPolicy: string;
  payment: BookingPayment;
};

// Format date and time for display
const formatDate = (date: Date) => {
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
  });
};

const formatTime = (date: Date) => {
  return date
    .toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
    .toLowerCase();
};

// Map API booking to component format
const mapApiBookingToDetails = (apiBooking: {
  id: string;
  startAt: string | Date;
  endAt: string | Date;
  guests: number;
  totalPrice: string | number;
  status: string;
  room?: {
    id?: string;
    title?: string;
    description?: string;
    district?: string;
    address?: string;
    photos?: string[] | Array<{ url: string }> | unknown;
    latitude?: string | number | null;
    longitude?: string | number | null;
    policies?: {
      cancellationPolicy?: {
        type?: string;
        daysBefore?: number;
        refund?: string;
      };
      depositPolicy?: string;
    } | null;
    includedGuests?: number;
  };
  customer?: {
    id?: string;
    name?: string;
    email?: string;
  };
}): BookingDetails => {
  const startAt = new Date(apiBooking.startAt);
  const endAt = new Date(apiBooking.endAt);
  const now = new Date();

  // Determine status based on API status and dates
  let status: BookingStatus;
  let statusText: string;

  if (apiBooking.status === "cancelled") {
    status = "finished";
    statusText = "Cancelled";
  } else if (apiBooking.status === "completed") {
    status = "finished";
    statusText = "Finished";
  } else if (apiBooking.status === "pending") {
    // Pending bookings that have ended are waiting for confirmation
    if (endAt.getTime() < now.getTime()) {
      status = "waiting_confirmation";
      statusText = "Finished, waiting for confirmation";
    } else {
      status = "waiting_checkin";
      statusText = "Pending confirmation";
    }
  } else if (apiBooking.status === "confirmed") {
    // Confirmed bookings
    if (endAt.getTime() < now.getTime()) {
      status = "waiting_confirmation";
      statusText = "Finished, waiting for confirmation";
    } else if (
      startAt.getTime() <= now.getTime() &&
      endAt.getTime() >= now.getTime()
    ) {
      status = "waiting_checkin";
      statusText = "In progress";
    } else {
      status = "waiting_checkin";
      statusText = "Waiting for check-in";
    }
  } else {
    // Default fallback
    if (endAt.getTime() < now.getTime()) {
      status = "waiting_confirmation";
      statusText = "Finished, waiting for confirmation";
    } else {
      status = "waiting_checkin";
      statusText = "Waiting for check-in";
    }
  }

  // Extract photos
  const photos = apiBooking.room?.photos || [];
  let imageUrl =
    "https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=1400&auto=format&fit=crop";

  if (Array.isArray(photos) && photos.length > 0) {
    const firstPhoto = photos[0];
    if (typeof firstPhoto === "string") {
      imageUrl = firstPhoto;
    } else if (
      firstPhoto &&
      typeof firstPhoto === "object" &&
      "url" in firstPhoto
    ) {
      imageUrl = (firstPhoto as { url: string }).url;
    }
  }

  // Extract policies
  const policies = apiBooking.room?.policies as
    | {
        cancellationPolicy?: {
          type?: string;
          daysBefore?: number;
          refund?: string;
        };
        depositPolicy?: string;
      }
    | null
    | undefined;

  let cancellationSummary =
    "Full refund 5 days before, half refund 24 hours before.";
  let cancellationFull =
    "Full refund if cancelled 5 days or more before check-in. Half refund if cancelled 24 hours or more before check-in. No refund if cancelled less than 24 hours before check-in.";

  if (policies?.cancellationPolicy) {
    const cp = policies.cancellationPolicy;
    const daysBefore = cp.daysBefore;
    const refund = cp.refund || "Full refund";
    if (daysBefore) {
      cancellationSummary = `${refund} ${daysBefore} days before booking.`;
      cancellationFull = `${refund} if cancelled ${daysBefore} days or more before check-in.`;
    } else {
      cancellationSummary = refund;
      cancellationFull = refund;
    }
  }

  const depositPolicy =
    policies?.depositPolicy ||
    "Deposit will be refunded within 24 hours after confirming all the equipments are fine.";

  // Extract coordinates
  const latitude = apiBooking.room?.latitude
    ? Number.parseFloat(String(apiBooking.room.latitude))
    : 22.3193; // Default Hong Kong coordinates
  const longitude = apiBooking.room?.longitude
    ? Number.parseFloat(String(apiBooking.room.longitude))
    : 114.1694;

  // Format payment
  const totalPrice = apiBooking.totalPrice
    ? typeof apiBooking.totalPrice === "string"
      ? Number.parseFloat(apiBooking.totalPrice)
      : apiBooking.totalPrice
    : 0;

  const includedGuests = apiBooking.room?.includedGuests || 1;
  const capacityText = `${includedGuests} ${includedGuests === 1 ? "person" : "people"} included`;

  return {
    id: apiBooking.id,
    status,
    statusText,
    room: {
      id: apiBooking.room?.id || "",
      name: apiBooking.room?.title || "Unknown Room",
      address: apiBooking.room?.address || "Address not available",
      imageUrl,
      capacity: capacityText,
      rating: 4.5, // TODO: Get from reviews
      reviewCount: 0, // TODO: Get from reviews
      latitude,
      longitude,
    },
    checkIn: {
      date: formatDate(startAt),
      time: formatTime(startAt),
    },
    checkOut: {
      date: formatDate(endAt),
      time: formatTime(endAt),
    },
    numberOfGuests: apiBooking.guests,
    client: {
      name: apiBooking.customer?.name || "Unknown Customer",
      phone: "+852 0000 0000", // TODO: Get from user profile if available
      email: apiBooking.customer?.email || "unknown@example.com",
    },
    confirmationCode: apiBooking.id,
    cancellationPolicy: {
      summary: cancellationSummary,
      fullDetails: cancellationFull,
    },
    depositPolicy,
    payment: {
      roomPrice: totalPrice,
      deposit: 0, // TODO: Get from booking if deposit is tracked
      totalCost: totalPrice,
      currency: "HKD",
    },
  };
};

// Real API function for booking details
const fetchBookingDetailsApi = async (
  bookingId: string
): Promise<BookingDetails> => {
  const res = await api.api.merchant.bookings[":id"].$get({
    param: { id: bookingId },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(
      error.error || `Failed to fetch booking details: ${res.status}`
    );
  }

  const result = await res.json();
  return mapApiBookingToDetails(result);
};

// React Query hook for fetching booking details
export const useBookingDetails = (bookingId: string) => {
  return useQuery({
    queryKey: ["merchant", "booking", bookingId],
    queryFn: () => fetchBookingDetailsApi(bookingId),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
};
