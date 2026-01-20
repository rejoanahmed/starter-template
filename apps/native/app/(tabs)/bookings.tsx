import BookingCardClient, {
  type Booking as BookingType,
} from "@app/components/pages/history/BookingCardClient";
import { ThemedText } from "@app/components/ThemedText";
import { Colors } from "@app/constants/Colors";
import { bookingsService } from "@app/services/bookings";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import { useCallback, useMemo, useState } from "react";
import {
  Pressable,
  RefreshControl,
  SectionList,
  StatusBar,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/* ---------- Helpers ---------- */
const withAlpha = (hex: string, alpha: number) => {
  const a = Math.round(Math.min(1, Math.max(0, alpha)) * 255);
  const aa = a.toString(16).padStart(2, "0");
  return hex.length === 7 ? `${hex}${aa}` : hex;
};
const isFinished = (end: Date) => end.getTime() < Date.now();

/* ---------- Types ---------- */
type Booking = BookingType;
type Section = { title: string; data: Booking[] };

// Map API booking to UI booking format
const mapApiBookingToUI = (apiBooking: {
  id: string;
  startAt?: string;
  startDate?: string;
  endAt?: string;
  endDate?: string;
  room?: {
    title?: string;
    photos?: Array<{ url?: string }>;
    merchantId?: string;
  };
  guests?: number;
}): Booking => {
  // API returns startAt and endAt (not startDate/endDate)
  const startAt = apiBooking.startAt || apiBooking.startDate;
  const endAt = apiBooking.endAt || apiBooking.endDate;

  // Validate and parse dates
  let startDate: Date;
  let endDate: Date;

  try {
    startDate = new Date(startAt);
    endDate = new Date(endAt);

    // Check if dates are valid
    if (Number.isNaN(startDate.getTime())) {
      console.warn("Invalid start date:", startAt);
      startDate = new Date(); // Fallback to current date
    }
    if (Number.isNaN(endDate.getTime())) {
      console.warn("Invalid end date:", endAt);
      endDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // Fallback to tomorrow
    }
  } catch (error) {
    console.error("Error parsing booking dates:", error, { startAt, endAt });
    // Fallback dates
    startDate = new Date();
    endDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
  }

  const photos = apiBooking.room?.photos || [];
  const image =
    Array.isArray(photos) && photos.length > 0
      ? photos[0]
      : "https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=1400";

  return {
    id: apiBooking.id,
    roomName: apiBooking.room?.title || "Unknown Room",
    image,
    start: startDate.toISOString(),
    end: endDate.toISOString(),
    people: apiBooking.guests,
    hostId: apiBooking.room?.merchantId,
    finished: isFinished(endDate),
  };
};

/* ---------- Themed Bits ---------- */
function SectionTitle({ title }: { title: string }) {
  const { colorScheme } = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  return (
    <View className="px-4 pt-6 pb-2">
      <Text className="font-semibold text-base" style={{ color: theme.text }}>
        {title}
      </Text>
      <View
        style={{
          height: 1,
          backgroundColor: withAlpha(theme.icon, 0.25),
          marginTop: 8,
        }}
      />
    </View>
  );
}

/* ---------- Main Screen ---------- */
export default function BookingsScreen() {
  const { colorScheme } = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<"all" | "upcoming" | "finished">("all");

  const {
    data: apiBookings = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["user", "bookings"],
    queryFn: () => bookingsService.getUserBookings(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const bookings: Booking[] = useMemo(
    () => apiBookings.map(mapApiBookingToUI),
    [apiBookings]
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const sections: Section[] = useMemo(() => {
    const upcoming = bookings.filter((b) => !b.finished);
    const finished = bookings.filter((b) => b.finished);

    if (filter === "upcoming") {
      return [{ title: "Upcoming Bookings", data: upcoming }];
    }
    if (filter === "finished") {
      return [{ title: "Past Bookings", data: finished }];
    }

    return [
      ...(upcoming.length
        ? [{ title: "Upcoming Bookings", data: upcoming }]
        : []),
      ...(finished.length ? [{ title: "Past Bookings", data: finished }] : []),
    ];
  }, [filter, bookings.filter]);

  const emptyText = useMemo(() => {
    if (filter === "all") {
      return "You don't have any bookings yet.";
    }
    if (filter === "upcoming") {
      return "No upcoming bookings.";
    }
    return "No past bookings.";
  }, [filter]);

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: theme.background }}
    >
      <StatusBar
        barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
      />

      <View className="px-4 pt-2 pb-4">
        <ThemedText type="title">My Bookings</ThemedText>

        <View className="mt-4 flex-row">
          {(["all", "upcoming", "finished"] as const).map((key) => {
            const isActive = filter === key;
            const labels = {
              all: "All",
              upcoming: "Upcoming",
              finished: "Past",
            };
            return (
              <Pressable
                className="mr-3 items-center justify-center rounded-full px-4 py-2"
                key={key}
                onPress={() => setFilter(key)}
                style={{
                  backgroundColor: isActive ? theme.tint : "transparent",
                  borderColor: isActive
                    ? theme.tint
                    : withAlpha(theme.icon, 0.25),
                  borderWidth: 1,
                }}
              >
                <Text
                  style={{
                    color: isActive ? Colors.dark.background : theme.text,
                    fontWeight: isActive ? "600" : "500",
                    fontSize: 14,
                  }}
                >
                  {labels[key]}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {isLoading && !refreshing ? (
        <View className="flex-1 items-center justify-center">
          <View
            className="mb-4 h-16 w-16 items-center justify-center rounded-full"
            style={{ backgroundColor: withAlpha(theme.tint, 0.12) }}
          >
            <Ionicons color={theme.tint} name="hourglass-outline" size={32} />
          </View>
          <Text style={{ color: theme.text, fontWeight: "500" }}>
            Loading bookings...
          </Text>
        </View>
      ) : (
        <SectionList
          contentContainerStyle={{ paddingBottom: 32 }}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <View className="items-center px-6 py-20">
              <View
                className="mb-4 h-16 w-16 items-center justify-center rounded-full"
                style={{ backgroundColor: withAlpha(theme.tint, 0.12) }}
              >
                <Ionicons
                  color={theme.tint}
                  name="calendar-outline"
                  size={32}
                />
              </View>
              <Text
                className="text-center text-lg"
                style={{ color: theme.text, fontWeight: "500" }}
              >
                {emptyText}
              </Text>
            </View>
          }
          refreshControl={
            <RefreshControl onRefresh={onRefresh} refreshing={refreshing} />
          }
          renderItem={({ item }) => (
            <BookingCardClient
              item={item}
              onPressMessage={
                item.hostId
                  ? () =>
                      router.push({
                        pathname: "/messages/[id]",
                        params: { id: String(item.hostId) },
                      })
                  : undefined
              }
              onPressOpen={() =>
                router.push({
                  pathname: "/clientbooking/[id]",
                  params: { id: item.id },
                })
              }
              onPressReview={
                item.finished
                  ? () =>
                      router.push({
                        pathname: "/clientbooking/[id]/review",
                        params: { id: item.id },
                      })
                  : undefined
              }
            />
          )}
          renderSectionHeader={({ section }) =>
            section.data.length ? <SectionTitle title={section.title} /> : null
          }
          sections={sections}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
        />
      )}
    </SafeAreaView>
  );
}
