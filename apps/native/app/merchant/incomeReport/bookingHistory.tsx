// app/merchant/reports/bookingHistory.tsx

import { Colors } from "@app/constants/Colors";
import { bookingsService } from "@app/services/merchant/bookings";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  endOfMonth,
  endOfWeek,
  format,
  isToday,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { router, useLocalSearchParams } from "expo-router";
import { useColorScheme } from "nativewind";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/* ---------------- Theme ---------------- */
function useThemeColors() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const p = Colors[isDark ? "dark" : "light"];
  return {
    text: p.text,
    bg: p.background,
    surface: p.surface,
    border: p.border,
    tint: p.tint,
    icon: p.icon,
    state: p.state,
    sub: p.muted ?? (isDark ? "rgba(230,238,242,0.7)" : "rgba(17,24,28,0.7)"),
    ok: "#16A34A",
  };
}

/* ---------------- Types ---------------- */
type BookingDoc = {
  id: string;
  customerName: string;
  status: "Finished" | "Upcoming" | "Cancelled";
  startAt: Date;
  endAt: Date;
  people: number;
  amount: number;
  roomName?: string;
};

/* ---------------- Utils ---------------- */
const toDate = (x: any): Date =>
  x instanceof Date
    ? x
    : typeof x === "string"
      ? parseISO(x)
      : x
        ? new Date(x)
        : new Date();

const fmtRange = (start: Date, end: Date) => {
  const dayStr = isToday(start)
    ? `Today, ${format(start, "d/M, EEE")}`
    : `${format(start, "d/M, EEE")}`;
  return `${dayStr} ${format(start, "h:mmaaa")} - ${format(end, "h:mmaaa")}`;
};

/* ---------------- Row UI (Tailwind) ---------------- */
function BookingRow({ item }: { item: BookingDoc }) {
  const c = useThemeColors();
  return (
    <Pressable
      accessibilityLabel="Open booking details"
      accessibilityRole="button"
      android_ripple={{ color: c.state?.pressed ?? "rgba(0,0,0,0.1)" }}
      className="mb-2.5 overflow-hidden rounded-lg border"
      onPress={() => router.push(`/booking/${item.id}`)}
      style={({ pressed }) => [
        {
          borderColor: c.border,
          backgroundColor: c.surface,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      {/* Top time strip */}
      <View
        className="border-b px-2.5 py-1.5"
        style={{ borderColor: c.border }}
      >
        <Text className="text-xs" style={{ color: c.text }}>
          {fmtRange(item.startAt, item.endAt)}
        </Text>
      </View>

      {/* Main row */}
      <View className="flex-row items-center px-2.5 py-2.5">
        {/* Avatar */}
        <View
          className="mr-2.5 h-[42px] w-[42px] items-center justify-center rounded-full border-2"
          style={{ borderColor: "#22C55E" }}
        >
          <Ionicons color="#22C55E" name="person" size={20} />
        </View>

        {/* Texts */}
        <View className="flex-1">
          <Text
            className="font-semibold"
            numberOfLines={1}
            style={{ color: c.text }}
          >
            {item.customerName}
            {item.roomName ? ` • ${item.roomName}` : ""}
          </Text>

          <View className="mt-0.5 flex-row items-center">
            <Ionicons color={c.sub} name="people" size={14} />
            <Text className="mr-2.5 ml-1 text-xs" style={{ color: c.sub }}>
              {item.people} ppl
            </Text>
            <Ionicons color={c.sub} name="cash" size={14} />
            <Text className="ml-1 text-xs" style={{ color: c.sub }}>
              ${item.amount}
            </Text>
          </View>

          <Text className="mt-1 text-xs" style={{ color: c.ok }}>
            {item.status}
          </Text>
        </View>

        {/* Actions */}
        <View className="flex-row items-center">
          <Pressable
            accessibilityLabel="Open messages"
            accessibilityRole="button"
            android_ripple={{ color: c.state?.pressed ?? "rgba(0,0,0,0.1)" }}
            className="mr-3"
            hitSlop={8}
            onPress={(e) => {
              e.stopPropagation();
              router.push("/messages");
            }}
            style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
          >
            <Ionicons
              color={c.text}
              name="chatbubble-ellipses-outline"
              size={20}
            />
          </Pressable>

          <Ionicons color={c.icon} name="chevron-forward" size={20} />
        </View>
      </View>
    </Pressable>
  );
}

/* ---------------- Screen (Tailwind) ---------------- */
export default function BookingHistoryScreen() {
  const c = useThemeColors();
  const params = useLocalSearchParams();

  const mode = String(params.mode ?? "WEEK") as "WEEK" | "MONTH";
  const label = String(params.label ?? "");

  // Default range if params are missing/invalid
  const now = React.useMemo(() => new Date(), []);
  const defaultStart = React.useMemo(
    () =>
      mode === "WEEK"
        ? startOfWeek(now, { weekStartsOn: 1 })
        : startOfMonth(now),
    [mode, now]
  );
  const defaultEnd = React.useMemo(
    () =>
      mode === "WEEK" ? endOfWeek(now, { weekStartsOn: 1 }) : endOfMonth(now),
    [mode, now]
  );

  const rawStart = React.useMemo(() => toDate(params.start), [params.start]);
  const rawEnd = React.useMemo(() => toDate(params.end), [params.end]);

  const start = Number.isNaN(rawStart.getTime()) ? defaultStart : rawStart;
  const end = Number.isNaN(rawEnd.getTime()) ? defaultEnd : rawEnd;

  const _userId = params.userId ? String(params.userId) : undefined;
  const _merchantId = params.merchantId ? String(params.merchantId) : undefined;

  const [loading, setLoading] = React.useState(true);
  const [rows, setRows] = React.useState<BookingDoc[]>([]);

  React.useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const response = await bookingsService.getMerchantBookings();

        // Filter bookings by date range
        const filtered = (response.bookings || [])
          .filter((b) => {
            const bookingDate = new Date(b.startAt);
            return bookingDate >= start && bookingDate <= end;
          })
          .map((b) => {
            const status: "Finished" | "Upcoming" | "Cancelled" =
              b.status === "completed"
                ? "Finished"
                : b.status === "confirmed"
                  ? "Upcoming"
                  : b.status === "cancelled"
                    ? "Cancelled"
                    : "Upcoming";

            return {
              id: b.id,
              customerName: b.customer.name,
              status,
              startAt: new Date(b.startAt),
              endAt: new Date(b.endAt),
              people: b.guests,
              amount: Number.parseFloat(b.totalPrice),
              roomName: b.room.title,
            };
          });

        setRows(filtered);
      } catch (err) {
        console.error("Failed to fetch bookings:", err);
        setRows([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [start, end]);

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: c.bg }}>
      {/* Header */}
      <View
        className="flex-row items-center border-b px-3 pt-1.5 pb-2"
        style={{ borderColor: c.border, backgroundColor: c.bg }}
      >
        <Pressable accessibilityLabel="Back" onPress={() => router.back()}>
          <Ionicons color={c.text} name="chevron-back" size={26} />
        </Pressable>
        <View className="flex-1 items-center">
          <Text className="text-sm" style={{ color: c.sub }}>
            {label || (mode === "WEEK" ? "This Week" : "This Month")}
          </Text>
        </View>
        <View className="w-[26px]" />
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={c.tint} />
        </View>
      ) : (
        <FlatList
          contentContainerStyle={{ padding: 12, paddingBottom: 24 }}
          data={rows}
          keyExtractor={(it) => it.id}
          ListEmptyComponent={
            <View className="p-4">
              <Text style={{ color: c.sub }}>No bookings in this period.</Text>
            </View>
          }
          renderItem={({ item }) => <BookingRow item={item} />}
        />
      )}
    </SafeAreaView>
  );
}
