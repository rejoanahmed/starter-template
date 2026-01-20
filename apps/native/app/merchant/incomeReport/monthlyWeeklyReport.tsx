// app/merchant/reports/weeklyReport.tsx

import { Colors } from "@app/constants/Colors";
import { usePeriodStatistics } from "@app/services/merchant/analytics";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useLocalSearchParams } from "expo-router";
import { useColorScheme } from "nativewind";
import React from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Defs,
  Rect,
  Stop,
  Svg,
  LinearGradient as SvgLinearGradient,
} from "react-native-svg";

/* ---------------- Theme ---------------- */
function useThemeColors() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const p = Colors[isDark ? "dark" : "light"];
  return {
    isDark,
    text: p.text,
    bg: p.background,
    surface: p.surface,
    border: p.border,
    tint: p.tint,
    sub: p.muted ?? (isDark ? "rgba(230,238,242,0.7)" : "rgba(17,24,28,0.7)"),
    bar: "#3B82F6",
    primaryBtn: p.primaryButton ?? "#3F6D85",
  };
}

/* ---------------- Mini chart ---------------- */
const BarsWithLabels = ({
  values,
  labels,
  width = 280,
  height = 120,
  gap = 6,
  radius = 4,
}: {
  values: number[];
  labels: string[];
  width?: number;
  height?: number;
  gap?: number;
  radius?: number;
}) => {
  const c = useThemeColors();
  const n = Math.max(1, values.length);
  const max = Math.max(1, ...values);
  const barW = Math.max(6, (width - gap * (n - 1)) / n);

  return (
    <View className="items-center">
      <Svg
        accessibilityLabel="Weekly bars"
        accessible
        height={height}
        width={width}
      >
        <Defs>
          <SvgLinearGradient id="bars" x1="0" x2="0" y1="0" y2="1">
            <Stop offset="0" stopColor={c.bar} stopOpacity="1" />
            <Stop offset="1" stopColor={c.tint} stopOpacity="1" />
          </SvgLinearGradient>
        </Defs>
        {values.map((v, i) => {
          const h = Math.max(2, (v / max) * (height - 10));
          const x = i * (barW + gap);
          const y = height - h;
          return (
            <Rect
              fill="url(#bars)"
              height={h}
              key={`bar-${v}`}
              rx={radius}
              ry={radius}
              width={barW}
              x={x}
              y={y}
            />
          );
        })}
      </Svg>

      <View className="mt-1.5 flex-row">
        {labels.map((t, i) => (
          <View
            className="items-center"
            key={`lbl-${i}-${t}`}
            style={{
              width: barW,
              marginRight: i === labels.length - 1 ? 0 : gap,
            }}
          >
            <Text className="text-[11px]" style={{ color: c.sub }}>
              {t}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

/* ---------------- Screen ---------------- */
export default function WeeklyReport() {
  const c = useThemeColors();
  const params = useLocalSearchParams();

  const label = String(params.label ?? "");
  const total = Number(params.total ?? 0);

  const series = React.useMemo<number[]>(() => {
    try {
      return JSON.parse(String(params.series ?? "[]"));
    } catch {
      return [];
    }
  }, [params.series]);

  const ticks = React.useMemo<string[]>(() => {
    try {
      return JSON.parse(String(params.ticks ?? "[]"));
    } catch {
      return [];
    }
  }, [params.ticks]);

  const mode = String(params.mode ?? "WEEK");
  const startIso = String(params.start ?? "");
  const endIso = String(params.end ?? "");
  const roomIdsParam = params.roomIds ? String(params.roomIds) : undefined;

  // Parse room IDs if provided
  const roomIds = React.useMemo<string[] | undefined>(() => {
    if (!roomIdsParam) return undefined;
    try {
      return JSON.parse(roomIdsParam);
    } catch {
      return undefined;
    }
  }, [roomIdsParam]);

  // Extract date strings from ISO dates (YYYY-MM-DD format)
  const startDate = React.useMemo(() => {
    if (!startIso) return "";
    try {
      const date = new Date(startIso);
      return date.toISOString().split("T")[0];
    } catch {
      return "";
    }
  }, [startIso]);

  const endDate = React.useMemo(() => {
    if (!endIso) return "";
    try {
      const date = new Date(endIso);
      return date.toISOString().split("T")[0];
    } catch {
      return "";
    }
  }, [endIso]);

  // Fetch period statistics
  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
  } = usePeriodStatistics({
    startDate,
    endDate,
    roomIds,
    enabled: !!startDate && !!endDate,
  });

  // Use stats from API or fallback to params
  // Type guard: check if stats is the success response (has bookingCount property)
  const hasStats = stats && "bookingCount" in stats;
  const count = hasStats ? stats.bookingCount : Number(params.count ?? 0);
  const avgGuests = hasStats
    ? stats.avgGuestsPerBooking
    : Number(params.avgGuests ?? 0);
  const avgHours = hasStats
    ? stats.avgHoursPerBooking
    : Number(params.avgHours ?? 0);
  const avgIncome = hasStats
    ? stats.avgIncomePerBooking
    : Number(params.avgIncome ?? 0);

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: c.bg }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Header */}
        <View className="mb-3 flex-row items-center">
          <Pressable accessibilityLabel="Back" onPress={() => router.back()}>
            <Ionicons color={c.text} name="chevron-back" size={26} />
          </Pressable>

          <View className="flex-1 items-center">
            <Text className="text-sm" style={{ color: c.sub }}>
              {label}
            </Text>
            <Text className="font-extrabold text-2xl" style={{ color: c.text }}>
              HK$ {total.toLocaleString("en-HK")}
            </Text>
          </View>

          <View style={{ width: 26 }} />
        </View>

        {/* Chart */}
        <View
          className="items-center border-y py-2"
          style={{ borderColor: c.border }}
        >
          <BarsWithLabels labels={ticks} values={series} />
        </View>

        {/* Statistics */}
        <View className="mt-3.5">
          <Text
            className="mb-2 font-extrabold text-lg"
            style={{ color: c.text }}
          >
            Statistics
          </Text>

          {statsLoading ? (
            <View className="py-8 items-center">
              <ActivityIndicator color={c.tint} size="small" />
              <Text className="mt-2 text-sm" style={{ color: c.sub }}>
                Loading statistics...
              </Text>
            </View>
          ) : statsError ? (
            <View className="py-4">
              <Text className="text-sm" style={{ color: c.sub }}>
                Failed to load statistics. Showing available data.
              </Text>
            </View>
          ) : (
            <>
              <Row label="Number of bookings" value={count} />
              <Row
                label="Average number of guests"
                value={avgGuests.toFixed(1)}
              />
              <Row label="Average hour" value={avgHours.toFixed(0)} />
              <Row
                label="Average income"
                value={`HK$${avgIncome.toFixed(0)}`}
              />

              <View className="h-2" />
              <Row
                bold
                label="Total income"
                value={`HK$${total.toLocaleString("en-HK")}`}
              />
            </>
          )}
        </View>

        {/* CTA */}
        <Pressable
          className="mt-6 self-center rounded-xl border px-4.5 py-2.5"
          onPress={() =>
            router.push({
              pathname: "/merchant/incomeReport/bookingHistory",
              params: { mode, label, start: startIso, end: endIso },
            })
          }
          style={{ backgroundColor: c.primaryBtn, borderColor: c.border }}
        >
          <Text className="px-5 font-bold text-white">
            View booking history
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ---------------- Row ---------------- */
function Row({
  label,
  value,
  bold,
}: {
  label: string;
  value: string | number;
  bold?: boolean;
}) {
  const c = useThemeColors();
  return (
    <View
      className="flex-row justify-between border-b py-2"
      style={{ borderColor: c.border }}
    >
      <Text
        className={bold ? "font-extrabold" : "font-normal"}
        style={{ color: c.text }}
      >
        {label}
      </Text>
      <Text
        className={bold ? "font-extrabold" : "font-normal"}
        style={{ color: c.text }}
      >
        {String(value)}
      </Text>
    </View>
  );
}
