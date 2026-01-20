// app/clientBooking/[id].tsx

import ClientBookingDetails, {
  type ClientBookingDetailsData,
} from "@app/components/pages/history/ClientBookingDetailsScreen";
import { Colors } from "@app/constants/Colors";
import { bookingsService } from "@app/services/bookings";
import { useQuery } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { useColorScheme } from "nativewind";
import { useMemo } from "react";
import { ActivityIndicator, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Format date and time for display
const formatDate = (date: Date) => {
  return date.toLocaleDateString(undefined, {
    day: "numeric",
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

// Map API booking to component data format
const mapBookingToDetailsData = (apiBooking: {
  id: string;
  startAt: string | Date;
  endAt: string | Date;
  guests: number;
  totalPrice: string | number;
  status: string;
  room?: {
    title?: string;
    address?: string;
    photos?: string[] | unknown;
    includedGuests?: number;
    merchantId?: string;
    latitude?: string | number | null;
    longitude?: string | number | null;
    policies?: unknown;
  };
}): ClientBookingDetailsData => {
  const startAt = new Date(apiBooking.startAt);
  const endAt = new Date(apiBooking.endAt);

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

  // Format payment
  const totalPrice = apiBooking.totalPrice
    ? typeof apiBooking.totalPrice === "string"
      ? Number.parseFloat(apiBooking.totalPrice)
      : apiBooking.totalPrice
    : 0;
  const formattedPrice = `$${totalPrice.toFixed(2)}`;

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
  const cancellationPolicy = policies?.cancellationPolicy;
  let cancellationSummary =
    "Full refund 5 days before, half refund 24 hours before.";

  if (cancellationPolicy) {
    const daysBefore = cancellationPolicy.daysBefore;
    const refund = cancellationPolicy.refund || "Full refund";
    if (daysBefore) {
      cancellationSummary = `${refund} ${daysBefore} days before booking.`;
    } else {
      cancellationSummary = refund;
    }
  }

  const depositPolicy =
    policies?.depositPolicy ||
    "Deposit will be refunded within 24 hours after confirming all the equipments are fine.";

  // Extract coordinates
  const latitude = apiBooking.room?.latitude
    ? Number.parseFloat(String(apiBooking.room.latitude))
    : undefined;
  const longitude = apiBooking.room?.longitude
    ? Number.parseFloat(String(apiBooking.room.longitude))
    : undefined;

  return {
    statusText:
      apiBooking.status === "cancelled"
        ? "Booking cancelled"
        : "Your booking is starting soon",
    room: {
      name: apiBooking.room?.title || "Unknown Room",
      address: apiBooking.room?.address || "Address not available",
      imageUrl,
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
    numberOfGuestsText: `${apiBooking.guests} ${apiBooking.guests === 1 ? "guest" : "guests"}`,
    confirmationCode: apiBooking.id || "N/A",
    cancellationPolicy: {
      summary: cancellationSummary,
    },
    depositPolicy,
    payment: {
      roomPrice: formattedPrice,
      deposit: "$0.00", // TODO: Get from booking if deposit is tracked
      totalCost: formattedPrice,
    },
  };
};

export default function ClientBookingDetailsPage() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { colorScheme } = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  const {
    data: apiBooking,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["booking", id],
    queryFn: () => {
      if (!id) {
        throw new Error("Booking ID is required");
      }
      return bookingsService.getBooking(id);
    },
    enabled: !!id,
  });

  const bookingData = useMemo(() => {
    if (!apiBooking?.booking) return null;
    return mapBookingToDetailsData(apiBooking.booking);
  }, [apiBooking]);

  const isFinished = useMemo(() => {
    if (!apiBooking?.booking) return false;
    const endAt = new Date(apiBooking.booking.endAt);
    return endAt.getTime() < Date.now();
  }, [apiBooking]);

  const hostId = apiBooking?.booking?.room?.merchantId;

  if (!id) {
    return null;
  }

  if (isLoading) {
    return (
      <SafeAreaView
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: theme.background }}
      >
        <ActivityIndicator color={theme.tint} size="large" />
        <Text className="mt-4" style={{ color: theme.text }}>
          Loading booking details...
        </Text>
      </SafeAreaView>
    );
  }

  if (error || !bookingData) {
    return (
      <SafeAreaView
        className="flex-1 items-center justify-center px-6"
        style={{ backgroundColor: theme.background }}
      >
        <Text
          className="text-center text-lg font-bold"
          style={{ color: theme.text }}
        >
          {error instanceof Error ? error.message : "Failed to load booking"}
        </Text>
        <Text className="mt-4 text-center" style={{ color: theme.icon }}>
          Please try again later.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <ClientBookingDetails
      data={bookingData}
      isFinished={isFinished}
      onCancel={() => router.push(`/clientbooking/${id}/cancelBooking`)}
      onEdit={() => router.push(`/clientbooking/${id}/editBooking`)}
      onLeaveReview={() => router.push(`/clientbooking/${id}/review`)}
      onMessageHost={
        hostId ? () => router.push(`/messages/${hostId}`) : undefined
      }
    />
  );
}
