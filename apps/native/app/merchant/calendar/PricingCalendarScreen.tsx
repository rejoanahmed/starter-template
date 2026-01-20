import { ThemedText } from "@app/components/ThemedText";
import { Colors } from "@app/constants/Colors";
import { useMerchantRooms } from "@app/services/merchant/rooms";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { Calendar, type DateData } from "react-native-calendars";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

/* ---------------- Helpers ---------------- */
const pad = (n: number) => String(n).padStart(2, "0");
const ymd = (y: number, m1: number, d: number) => `${y}-${pad(m1)}-${pad(d)}`;
const isToday = (y: number, m1: number, d: number) => {
  const t = new Date();
  return t.getFullYear() === y && t.getMonth() + 1 === m1 && t.getDate() === d;
};
const isHolidayDow = (dow: number, list: number[]) => list.includes(dow);

/* ---------------- Types ---------------- */
type PricePlan = {
  weekdayPrice: number;
  holidayPrice: number;
  overrides?: Record<string, number>;
  holidayDow?: number[];
};

/* ---------------- Day Cell ---------------- */
const DayCell = memo(function DayCell({
  date,
  state,
  plan,
  palette,
  width,
  colors,
  onPressDay,
}: {
  date?: DateData;
  state?: string;
  plan: PricePlan;
  palette: typeof Colors.light;
  width: number;
  colors: {
    holidayBg: string;
    weekdayBg: string;
    disabledText: string;
    pricePillBg: string;
    pricePillBorder: string;
    labelColor: string;
  };
  onPressDay: (info: {
    year: number;
    month: number;
    day: number;
    price: number;
  }) => void;
}) {
  if (!date) {
    return null;
  }

  const d = new Date(date.year, date.month - 1, date.day);
  const dow = d.getDay();
  const id = ymd(date.year, date.month, date.day);

  const inactive = state === "disabled" || state === "inactive";
  const holiday = isHolidayDow(dow, plan.holidayDow ?? [0, 5, 6]);
  const price =
    plan.overrides?.[id] ?? (holiday ? plan.holidayPrice : plan.weekdayPrice);
  const bg = inactive
    ? "transparent"
    : holiday
      ? colors.holidayBg
      : colors.weekdayBg;

  const handlePress = () => {
    if (inactive) {
      return;
    }
    onPressDay({ year: date.year, month: date.month, day: date.day, price });
  };

  return (
    <Pressable
      onPress={handlePress}
      style={{
        width,
        height: 92, // fixed row height; overall calendar height grows -> scrollable
        borderRadius: 8,
        backgroundColor: bg,
        alignItems: "center",
        justifyContent: "flex-start",
        marginVertical: 1,
        marginHorizontal: 0.5,
        overflow: "hidden",
      }}
    >
      {/* Day number */}
      <View style={{ alignSelf: "flex-start", paddingLeft: 6, paddingTop: 4 }}>
        <ThemedText
          style={{
            fontSize: 16,
            fontWeight: isToday(date.year, date.month, date.day)
              ? "800"
              : "600",
            color: inactive ? colors.disabledText : palette.text,
          }}
        >
          {date.day}
        </ThemedText>
      </View>

      {/* Price pill */}
      <View
        style={{
          marginTop: 6,
          paddingHorizontal: 8,
          paddingVertical: Platform.OS === "ios" ? 2 : 1,
          borderRadius: 12,
          backgroundColor: colors.pricePillBg,
          borderWidth: 0.8,
          borderColor: colors.pricePillBorder,
          minWidth: 45,
          alignItems: "center",
        }}
      >
        <ThemedText
          style={{
            fontSize: 12,
            fontWeight: "700",
            color: inactive ? colors.disabledText : palette.text,
          }}
        >
          ${price}
        </ThemedText>
      </View>

      {/* Label */}
      <View style={{ marginTop: 6 }}>
        <ThemedText
          style={{
            fontSize: 11,
            fontWeight: "700",
            color: inactive ? colors.disabledText : colors.labelColor,
          }}
        >
          {inactive ? "" : holiday ? "Holidays" : "Weekday"}
        </ThemedText>
      </View>
    </Pressable>
  );
});

/* ---------------- Screen ---------------- */
export default function PricingCalendarScreen() {
  const { colorScheme } = useColorScheme();
  const palette = Colors[colorScheme === "dark" ? "dark" : "light"];
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const win = Dimensions.get("window");
  const isDark = colorScheme === "dark";

  const now = new Date();
  const [month, setMonth] = useState({
    year: now.getFullYear(),
    month: now.getMonth() + 1,
  });

  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  const {
    data: rooms = [],
    isLoading: loading,
    error: queryError,
  } = useMerchantRooms();

  const error = queryError
    ? queryError instanceof Error
      ? queryError.message
      : "Failed to load rooms"
    : null;

  // Set selected room when rooms are loaded
  useEffect(() => {
    if (rooms.length > 0 && !selectedRoomId) {
      setSelectedRoomId(rooms[0].id);
    }
  }, [rooms, selectedRoomId]);

  // Calculate pricing plan from room base price
  const plan = useMemo<PricePlan>(() => {
    const _selectedRoom = rooms.find((r) => r.id === selectedRoomId);
    // Default base price since rooms don't have a basePrice field anymore
    const basePrice = 45;

    return {
      weekdayPrice: basePrice,
      holidayPrice: basePrice * 1.2, // 20% markup for holidays
      holidayDow: [0, 5, 6], // Sunday, Friday, Saturday
      overrides: {},
    };
  }, [rooms, selectedRoomId]);

  const colors = useMemo(
    () => ({
      holidayBg: isDark ? "rgba(0, 200, 120, 0.28)" : "rgba(0, 200, 120, 0.24)",
      weekdayBg: isDark ? "rgba(245, 200, 0, 0.28)" : "rgba(255, 215, 0, 0.22)",
      disabledText: "rgba(150,150,150,0.5)",
      pricePillBg: palette.background,
      pricePillBorder: palette.border,
      labelColor: palette.text,
    }),
    [isDark, palette]
  );

  const headerHeight = 52;
  const cellWidth = (win.width - 24) / 7; // exact 7 columns

  // ✅ Route from the screen (NOT from the DayCell)
  const handleDayPress = useCallback(
    (info: { year: number; month: number; day: number; price: number }) => {
      console.log(
        `Pressed → Year:${info.year}, Month:${info.month}, Day:${info.day}, Price:$${info.price}`
      );
      router.push({
        pathname: "/merchant/calendar/addPricing",
        params: {
          day: String(info.day),
          month: String(info.month),
          year: String(info.year),
          price: String(info.price),
        },
      });
    },
    [router]
  );

  const Header = () => (
    <View
      style={{
        height: headerHeight,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        borderBottomWidth: 1,
        borderBottomColor: palette.border,
        backgroundColor: palette.surface,
      }}
    >
      <Pressable hitSlop={10} onPress={() => router.back()}>
        <Ionicons color={palette.text} name="chevron-back" size={22} />
      </Pressable>
      <View style={{ flex: 1, alignItems: "center" }}>
        <ThemedText style={{ fontSize: 16, fontWeight: "700" }}>
          Pricing Calendar
        </ThemedText>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: palette.background }}>
        <Header />
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator color={palette.tint} size="large" />
          <ThemedText style={{ marginTop: 12, color: palette.text }}>
            Loading pricing data...
          </ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: palette.background }}>
        <Header />
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ThemedText style={{ color: palette.text }}>{error}</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.background }}>
      <Header />

      {/* Room selector */}
      {rooms.length > 1 && (
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 8 }}
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          {rooms.map((room) => (
            <Pressable
              key={room.id}
              onPress={() => setSelectedRoomId(room.id)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                marginRight: 8,
                borderRadius: 20,
                backgroundColor:
                  selectedRoomId === room.id ? palette.tint : palette.surface,
                borderWidth: 1,
                borderColor: palette.border,
              }}
            >
              <ThemedText
                style={{
                  color: selectedRoomId === room.id ? "#FFFFFF" : palette.text,
                  fontWeight: "600",
                }}
              >
                {room.title}
              </ThemedText>
            </Pressable>
          ))}
        </ScrollView>
      )}

      {/* Scrollable content */}
      <ScrollView
        contentContainerStyle={{
          paddingTop: 6,
          paddingBottom: insets.bottom + 16,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Calendar
          current={ymd(month.year, month.month, 1)}
          dayComponent={(props) => (
            <DayCell
              {...props}
              colors={colors}
              onPressDay={handleDayPress}
              palette={palette}
              plan={plan}
              width={cellWidth}
            />
          )}
          enableSwipeMonths
          firstDay={0}
          hideExtraDays={false}
          onMonthChange={(m) => setMonth({ year: m.year, month: m.month })}
          style={{
            // no fixed height -> calendar grows, ScrollView handles overflow
            marginHorizontal: 12,
            borderRadius: 16,
            overflow: "hidden",
            backgroundColor: palette.surface,
            borderWidth: 1,
            borderColor: palette.border,
          }}
          theme={{
            backgroundColor: palette.background,
            calendarBackground: palette.background,
            monthTextColor: palette.text,
            textMonthFontSize: 22,
            textMonthFontWeight: "800",
            arrowColor: palette.text,
            textSectionTitleColor: palette.icon,
            textDayHeaderFontWeight: "700",
            textDayHeaderFontSize: 13,
            dayTextColor: palette.text,
            textDayFontSize: 12,
            textDayFontWeight: "600",
            textDisabledColor: "rgba(150,150,150,0.5)",
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
