// components/pages/merchant/history/HistoryScreen.tsx

import { Heading } from "@app/components/ui/heading";
import { HStack } from "@app/components/ui/hstack";
import { Text } from "@app/components/ui/text";
import { VStack } from "@app/components/ui/vstack";
import { Colors } from "@app/constants/Colors";
import { selectedRoomAtom } from "@app/lib/atoms/merchant";
import { type Booking, useBookings } from "@app/services/merchant/history";
import { useAtom } from "jotai";
import { useColorScheme } from "nativewind";
import type React from "react";
import { useMemo, useState } from "react";
import { Platform, SectionList, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BookingItem } from "./BookingItem";
import { FilterMenu } from "./FilterMenu";
import { RoomSelectionMenu } from "./RoomSelectionMenu";

export function HistoryScreen() {
  const [selectedRoomId, setSelectedRoomId] = useAtom(selectedRoomAtom);
  const [filterOptions, setFilterOptions] = useState({
    waiting: true,
    oneWeek: false,
    oneMonth: false,
  });

  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const theme = useMemo(() => (isDark ? Colors.dark : Colors.light), [isDark]);

  const { data, isLoading } = useBookings();

  const toggleFilter = (key: keyof typeof filterOptions) => {
    setFilterOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  /* ----------------------- Filtering & Grouping ----------------------- */
  const filtered = useMemo(() => {
    const list = (data || []).filter((booking) => {
      // Room filter
      if (selectedRoomId && booking.roomId !== selectedRoomId) {
        return false;
      }

      // Waiting states
      if (filterOptions.waiting) {
        const isWaiting =
          booking.status === "waiting_confirmation" ||
          booking.status === "waiting_checkin";
        if (!isWaiting) {
          return false;
        }
      }

      // Time filters
      const bookingDate = new Date(booking.date.split(",")[0]);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (filterOptions.oneWeek) {
        const oneWeekAgo = new Date(today);
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        if (bookingDate < oneWeekAgo) {
          return false;
        }
      }

      if (filterOptions.oneMonth) {
        const oneMonthAgo = new Date(today);
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        if (bookingDate < oneMonthAgo) {
          return false;
        }
      }

      return true;
    });

    // Group by "Mon DD, YYYY" (first 3 tokens) for headers
    const groups: Record<string, Booking[]> = {};
    for (const b of list) {
      const header = b.date.split(" ").slice(0, 3).join(" ");
      if (!groups[header]) {
        groups[header] = [];
      }
      groups[header].push(b);
    }

    return Object.entries(groups)
      .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
      .map(([date, bookings]) => ({ title: date, data: bookings }));
  }, [data, filterOptions, selectedRoomId]);

  /* ----------------------- Helpers / UI bits ------------------------- */
  const Card = ({ children }: { children: React.ReactNode }) => (
    <View
      className="mb-3 rounded-2xl border"
      style={{
        backgroundColor: theme.surface,
        borderColor: theme.border,
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        elevation: Platform.OS === "android" ? 2 : 0,
      }}
    >
      {children}
    </View>
  );

  const Pill = ({ label }: { label: string }) => (
    <View
      className="mr-2 mb-2 rounded-full border px-2 py-1"
      style={{
        backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
        borderColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)",
      }}
    >
      <Text size="sm" style={{ color: theme.text, opacity: 0.8 }}>
        {label}
      </Text>
    </View>
  );

  const barFill = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.08)";

  const LoadingSkeleton = () => (
    <VStack className="px-4 py-6">
      {[...new Array(4)].map((_) => (
        <View className="mb-3" key={`sk-${Math.random()}`}>
          <View
            className="mb-2 h-5 w-28 rounded"
            style={{ backgroundColor: barFill }}
          />
          <Card>
            <View className="p-4">
              <View
                className="mb-2 h-4 w-40 rounded"
                style={{ backgroundColor: barFill }}
              />
              <View
                className="h-4 w-24 rounded"
                style={{ backgroundColor: barFill }}
              />
            </View>
          </Card>
        </View>
      ))}
    </VStack>
  );

  const EmptyState = () => (
    <VStack className="items-center justify-center px-6 py-14">
      <View
        className="mb-3 h-16 w-16 items-center justify-center rounded-full"
        style={{
          backgroundColor: isDark
            ? "rgba(255,255,255,0.06)"
            : "rgba(0,0,0,0.04)",
        }}
      >
        <Text className="text-xl" style={{ color: theme.tint }}>
          📭
        </Text>
      </View>
      <Text
        className="mb-1 font-semibold text-lg"
        style={{ color: theme.text }}
      >
        No bookings found
      </Text>
      <Text className="text-center" style={{ color: theme.text, opacity: 0.7 }}>
        Try adjusting filters or switching rooms.
      </Text>

      {/* Quick glance of active filters */}
      <HStack className="mt-4 flex-wrap">
        {selectedRoomId ? <Pill label={`Room: ${selectedRoomId}`} /> : null}
        {filterOptions.waiting ? <Pill label="Waiting" /> : null}
        {filterOptions.oneWeek ? <Pill label="Last 7 days" /> : null}
        {filterOptions.oneMonth ? <Pill label="Last 30 days" /> : null}
      </HStack>
    </VStack>
  );

  /* ------------------------------ UI -------------------------------- */
  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: theme.background }}
    >
      {/* Header */}
      <HStack
        className="items-center justify-between border-b px-4 py-3"
        style={{ borderColor: theme.border }}
      >
        <HStack className="items-center" space="md">
          <Heading size="xl" style={{ color: theme.text }}>
            History
          </Heading>
          <FilterMenu
            filterOptions={filterOptions}
            onToggleFilter={toggleFilter}
          />
        </HStack>

        <RoomSelectionMenu
          onRoomSelect={(roomId) => setSelectedRoomId(roomId || null)}
          selectedRoomId={selectedRoomId || undefined}
        />
      </HStack>

      {/* List */}
      {isLoading ? (
        <LoadingSkeleton />
      ) : filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <SectionList
          contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 12 }}
          keyExtractor={(item) => item.id}
          ListFooterComponent={<View className="h-4" />}
          renderItem={({ item }) => (
            <Card>
              <BookingItem booking={item} />
            </Card>
          )}
          renderSectionHeader={({ section }) => {
            const isFirst =
              filtered.length > 0 && section.title === filtered[0].title;

            return (
              <View
                className="w-full rounded-md border px-3 py-2"
                style={{
                  backgroundColor: isDark
                    ? "rgba(255,255,255,0.06)"
                    : theme.surface,
                  borderColor: theme.border,
                  marginTop: isFirst ? 8 : 28,
                  marginBottom: 8,
                }}
              >
                <Text bold size="lg" style={{ color: theme.text }}>
                  {section.title}
                </Text>
              </View>
            );
          }}
          sections={filtered}
          stickySectionHeadersEnabled
        />
      )}
    </SafeAreaView>
  );
}
