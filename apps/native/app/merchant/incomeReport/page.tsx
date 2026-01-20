// app/merchant/reports/IncomeReport.tsx

import { Colors } from "@app/constants/Colors";
import { useIncomeReport } from "@app/services/merchant/analytics";
import { useMerchantRooms } from "@app/services/merchant/rooms";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
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
  const palette = Colors[isDark ? "dark" : "light"];
  return {
    isDark,
    text: palette.text,
    bg: palette.background,
    tint: palette.tint,
    surface: palette.surface,
    surface2: palette.surface2 ?? palette.surface,
    surface3: palette.surface3 ?? palette.surface,
    border: palette.border,
    primaryBtn: palette.primaryButton ?? "#3F6D85",
    inputBg: palette.inputBg,
    subtext:
      palette.muted ??
      (isDark ? "rgba(230,238,242,0.7)" : "rgba(17,24,28,0.7)"),
    bar: "#3B82F6",
  };
}

/* ---------------- Types ---------------- */
type PeriodMode = "WEEK" | "MONTH";

/* ---------------- UI atoms ---------------- */
const SegButton = ({
  active,
  label,
  onPress,
}: {
  active?: boolean;
  label: string;
  onPress?: () => void;
}) => {
  const c = useThemeColors();
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 999,
        backgroundColor: active ? c.tint : c.surface,
        borderWidth: 1,
        borderColor: active ? c.tint : c.border,
      }}
    >
      <Text
        style={{
          color: active ? "#fff" : c.text,
          fontWeight: "700",
          fontSize: 12,
          letterSpacing: 0.2,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
};

const CheckRow = ({
  label,
  checked,
  onToggle,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
}) => {
  const c = useThemeColors();
  return (
    <Pressable
      onPress={onToggle}
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
      }}
    >
      <View
        style={{
          width: 22,
          height: 22,
          borderRadius: 6,
          borderWidth: 2,
          borderColor: checked ? c.tint : c.border,
          backgroundColor: checked ? c.tint : "transparent",
          marginRight: 12,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {checked ? <Ionicons color="#fff" name="checkmark" size={16} /> : null}
      </View>
      <Text style={{ color: c.text, fontSize: 16 }}>{label}</Text>
    </Pressable>
  );
};

/* ------------- Right Bar Chart WITH labels underneath (compact) ------------- */
const BarsWithLabels = ({
  values,
  labels,
  width = 160,
  height = 46,
  gap = 4,
  radius = 3,
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
  const barW = Math.max(4, (width - gap * (n - 1)) / n);

  return (
    <View style={{ width }}>
      {/* Bars */}
      <Svg
        accessibilityLabel="Period bar chart"
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
          const h = Math.max(2, (v / max) * (height - 2));
          const x = i * (barW + gap);
          const y = height - h;
          return (
            <Rect
              fill="url(#bars)"
              height={h}
              key={`${v}${Math.random()}`}
              rx={radius}
              ry={radius}
              width={barW}
              x={x}
              y={y}
            />
          );
        })}
      </Svg>
      {/* Labels under bars (aligned with bar widths/gaps) */}
      <View style={{ flexDirection: "row", marginTop: 4 }}>
        {labels.map((t, i) => (
          <View
            key={`lbl-${t + i}`}
            style={{
              width: barW,
              marginRight: i === labels.length - 1 ? 0 : gap,
              alignItems: "center",
            }}
          >
            <Text numberOfLines={1} style={{ color: c.subtext, fontSize: 10 }}>
              {t}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

/* ---------------- Screen ---------------- */
export default function IncomeReport() {
  const c = useThemeColors();

  const [mode, setMode] = React.useState<PeriodMode>("WEEK");
  const [filterOpen, setFilterOpen] = React.useState(false);
  const [selectedRoomIds, setSelectedRoomIds] = React.useState<string[]>([]);

  const { data: rooms = [], isLoading: roomsLoading } = useMerchantRooms();

  // Fetch income report using React Query hook
  const {
    data: reportData,
    isLoading: reportLoading,
    error: reportError,
  } = useIncomeReport({
    mode,
    roomIds: selectedRoomIds.length > 0 ? selectedRoomIds : undefined,
    periodsBack: mode === "WEEK" ? 16 : 12,
  });

  const loading = roomsLoading || reportLoading;

  // Transform API data to match UI format
  const items = React.useMemo(() => {
    if (!reportData?.periods) {
      return [];
    }
    // API returns periods array with each period having label, totalRevenue, series, ticks, etc.
    return reportData.periods.map((period, idx) => ({
      key: `${period.label}-${idx}`,
      label: period.label,
      total: period.totalRevenue,
      series: period.series || [],
      ticks: period.ticks || [],
      start: new Date(period.startDate),
      end: new Date(period.endDate),
      bookingCount: period.bookingCount || 0,
    }));
  }, [reportData]);

  const totalLabel =
    selectedRoomIds.length === 1
      ? rooms.find((r) => r.id === selectedRoomIds[0])?.title || "Room"
      : selectedRoomIds.length > 1
        ? `${selectedRoomIds.length} Rooms`
        : "All Rooms";

  const totalAcrossList = reportData?.totalRevenue || 0;

  const toggleRoom = (roomId: string) => {
    setSelectedRoomIds((prev) => {
      if (prev.includes(roomId)) {
        return prev.filter((id) => id !== roomId);
      }
      return [...prev, roomId];
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
      {/* Compact header */}
      <View
        style={{
          paddingHorizontal: 12,
          paddingTop: 6,
          paddingBottom: 8,
          borderBottomWidth: 1,
          borderBottomColor: c.border,
          backgroundColor: c.bg,
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
        }}
      >
        <TouchableOpacity
          accessibilityLabel="Go back"
          onPress={() => router.back()}
        >
          <Ionicons color={c.text} name="chevron-back" size={26} />
        </TouchableOpacity>

        <View style={{ flex: 1 }}>
          <Text
            numberOfLines={1}
            style={{ color: c.text, fontSize: 18, fontWeight: "800" }}
          >
            Income Report
          </Text>
          <Text numberOfLines={1} style={{ color: c.subtext, fontSize: 11 }}>
            {mode === "WEEK" ? "Weekly" : "Monthly"} • {totalLabel}
          </Text>
        </View>

        <View style={{ flexDirection: "row", gap: 6, marginRight: 2 }}>
          <SegButton
            active={mode === "WEEK"}
            label="Week"
            onPress={() => setMode("WEEK")}
          />
          <SegButton
            active={mode === "MONTH"}
            label="Month"
            onPress={() => setMode("MONTH")}
          />
        </View>

        <Pressable
          accessibilityLabel="Filter rooms"
          onPress={() => setFilterOpen(true)}
          style={{
            marginLeft: 2,
            padding: 8,
            borderRadius: 10,
            backgroundColor: c.surface,
            borderWidth: 1,
            borderColor: c.border,
          }}
        >
          <Ionicons color={c.text} name="filter" size={18} />
        </Pressable>
      </View>

      {/* Summary (kept small) */}
      <View
        style={{
          marginHorizontal: 12,
          marginTop: 10,
          backgroundColor: c.surface,
          borderWidth: 1,
          borderColor: c.border,
          borderRadius: 12,
          paddingVertical: 8,
          paddingHorizontal: 12,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text style={{ color: c.text, fontSize: 16, fontWeight: "800" }}>
          HK$ {totalAcrossList.toLocaleString("en-HK")}
        </Text>
        <Text style={{ color: c.subtext, fontSize: 12 }}>Total in view</Text>
      </View>

      {/* List */}
      {loading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator color={c.tint} size="large" />
          <Text style={{ color: c.text, marginTop: 12 }}>
            Loading income data...
          </Text>
        </View>
      ) : reportError ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 24,
          }}
        >
          <Ionicons color={c.subtext} name="alert-circle" size={48} />
          <Text
            style={{
              color: c.text,
              marginTop: 12,
              fontSize: 16,
              fontWeight: "600",
            }}
          >
            Failed to load income report
          </Text>
          <Text style={{ color: c.subtext, marginTop: 4, textAlign: "center" }}>
            {reportError instanceof Error
              ? reportError.message
              : "Unknown error occurred"}
          </Text>
        </View>
      ) : (
        <FlatList
          contentContainerStyle={{ paddingBottom: 16 }}
          data={items}
          keyExtractor={(it) => it.key}
          ListEmptyComponent={
            <View style={{ padding: 24 }}>
              <Text style={{ color: c.subtext }}>
                No income found for the chosen filters.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() => {
                router.push({
                  pathname: "/merchant/incomeReport/monthlyWeeklyReport",
                  params: {
                    mode, // 'WEEK' | 'MONTH'
                    label: item.label,
                    start: item.start.toISOString(),
                    end: item.end.toISOString(),
                    total: String(item.total),
                    series: JSON.stringify(item.series), // pass arrays safely
                    ticks: JSON.stringify(item.ticks),
                    count: String(item.bookingCount), // fallback value
                    roomIds:
                      selectedRoomIds.length > 0
                        ? JSON.stringify(selectedRoomIds)
                        : undefined,
                  },
                });
              }}
              style={{
                marginHorizontal: 12,
                marginTop: 8,
                paddingVertical: 8,
                paddingHorizontal: 10,
                borderRadius: 12,
                backgroundColor: c.surface,
                borderWidth: 1,
                borderColor: c.border,
              }}
            >
              {/* Row content unchanged, keep your BarsWithLabels on the right */}
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text
                    numberOfLines={1}
                    style={{ color: c.text, fontSize: 16, fontWeight: "700" }}
                  >
                    HK$ {item.total.toLocaleString("en-HK")}
                  </Text>
                  <Text
                    numberOfLines={1}
                    style={{ color: c.subtext, fontSize: 11 }}
                  >
                    {item.label}
                  </Text>
                </View>
                <BarsWithLabels
                  height={42}
                  labels={item.ticks}
                  values={item.series}
                  width={160}
                />
              </View>
            </Pressable>
          )}
        />
      )}

      {/* Filter modal */}
      <Modal animationType="slide" transparent visible={filterOpen}>
        <Pressable
          onPress={() => setFilterOpen(false)}
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.35)",
            justifyContent: "flex-end",
          }}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={{
              backgroundColor: c.bg,
              padding: 16,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              borderTopWidth: 1,
              borderColor: c.border,
            }}
          >
            <View
              style={{
                width: 40,
                height: 5,
                borderRadius: 999,
                alignSelf: "center",
                backgroundColor: c.border,
                marginBottom: 12,
              }}
            />
            <Text style={{ color: c.text, fontSize: 18, fontWeight: "700" }}>
              Filter by Room
            </Text>
            <Text style={{ color: c.subtext, marginTop: 4, marginBottom: 12 }}>
              Choose one or multiple rooms. Clear all to show every room.
            </Text>

            {rooms.map((room) => (
              <CheckRow
                checked={selectedRoomIds.includes(room.id)}
                key={room.id}
                label={room.title}
                onToggle={() => toggleRoom(room.id)}
              />
            ))}

            <View style={{ height: 12 }} />
            <View style={{ flexDirection: "row", gap: 10 }}>
              <Pressable
                onPress={() => setSelectedRoomIds([])}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: c.border,
                  backgroundColor: c.surface,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: c.text, fontWeight: "600" }}>Clear</Text>
              </Pressable>
              <Pressable
                onPress={() => setFilterOpen(false)}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 12,
                  backgroundColor: c.primaryBtn,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "700" }}>Apply</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
