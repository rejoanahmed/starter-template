// components/pages/schedule/MonthlyCalendarScreen.tsx

import { HStack } from "@app/components/ui/hstack";
import { Text } from "@app/components/ui/text";
import { useMerchantRooms } from "@app/services/merchant/rooms";
import { scheduleService } from "@app/services/merchant/schedule";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import {
  type DetailedCalendarEvent,
  useScheduleStore,
} from "../schedule/store/useScheduleStore";

export type { CalendarEvent } from "../schedule/store/useScheduleStore";

const formatDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type CellMeta = {
  dayNumber: number;
  dateKey: string;
  isCurrentMonth: boolean;
};

export default function MonthlyCalendarScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const iconColor = isDark ? "#9CA3AF" : "#4B5563";

  const today = new Date();
  const todayKey = formatDateKey(today);

  const [currentMonth, setCurrentMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [selectedDateKey, setSelectedDateKey] = useState(todayKey);

  // Block mode and blocked dates
  const [isBlockMode, setIsBlockMode] = useState(false);
  const [blockedDates, setBlockedDates] = useState<Record<string, boolean>>({});
  const [isBlockingDate, setIsBlockingDate] = useState(false);

  // Fetch merchant rooms
  const { data: rooms, isLoading: roomsLoading } = useMerchantRooms();
  const [selectedRoomId, setSelectedRoomId] = useState<string>("");

  // Set default room when rooms load
  useEffect(() => {
    if (rooms && rooms.length > 0 && !selectedRoomId) {
      setSelectedRoomId(rooms[0].id);
    }
  }, [rooms, selectedRoomId]);

  const { eventsByDate, setEventsForDate } = useScheduleStore();

  const monthMeta = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    // fixed 6x7 grid
    const startOfMonth = new Date(year, month, 1);
    const startDay = startOfMonth.getDay();
    const firstCellDate = new Date(year, month, 1 - startDay);

    const cells: CellMeta[] = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(firstCellDate);
      d.setDate(firstCellDate.getDate() + i);
      cells.push({
        dayNumber: d.getDate(),
        dateKey: formatDateKey(d),
        isCurrentMonth: d.getMonth() === month,
      });
    }

    const weeks: CellMeta[][] = [];
    for (let w = 0; w < 6; w++) {
      weeks.push(cells.slice(w * 7, (w + 1) * 7));
    }

    const monthLabel = currentMonth.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });

    // Calculate the date range for the visible calendar
    const firstVisibleDate = cells[0].dateKey;
    const lastVisibleDate = cells[41].dateKey;

    return { weeks, monthLabel, firstVisibleDate, lastVisibleDate };
  }, [currentMonth]);

  // Fetch schedule data for the entire visible month range
  useEffect(() => {
    if (
      !(
        selectedRoomId &&
        monthMeta.firstVisibleDate &&
        monthMeta.lastVisibleDate
      )
    ) {
      return;
    }

    const fetchMonthSchedule = async () => {
      try {
        const response = await scheduleService.getMonthSchedule(
          selectedRoomId,
          monthMeta.firstVisibleDate,
          monthMeta.lastVisibleDate
        );

        // Group slots by date
        const slotsByDate: Record<string, DetailedCalendarEvent[]> = {};

        for (const slot of response.slots || []) {
          const startDate = new Date(slot.startTime);
          const endDate = new Date(slot.endTime);
          const dateKey = formatDateKey(startDate);

          if (!slotsByDate[dateKey]) {
            slotsByDate[dateKey] = [];
          }

          slotsByDate[dateKey].push({
            id: slot.id,
            date: dateKey,
            title: slot.title,
            color:
              slot.type === "cleaning"
                ? "#1D4ED8"
                : slot.type === "blocked"
                  ? "#EF4444"
                  : "#FDE68A",
            startHour: startDate.getHours() + startDate.getMinutes() / 60,
            endHour: endDate.getHours() + endDate.getMinutes() / 60,
            startTime: slot.startTime,
            endTime: slot.endTime,
            description: "description" in slot ? slot.description : undefined,
            peopleCount: "guestCount" in slot ? slot.guestCount : undefined,
            isCleaning: slot.type === "cleaning",
            cleaningParentId: "bookingId" in slot ? slot.bookingId : undefined,
          });
        }

        // Update store with all dates
        for (const [dateKey, events] of Object.entries(slotsByDate)) {
          setEventsForDate(dateKey, events);
        }

        // Also update blocked dates state for full-day blocks
        const newBlockedDates: Record<string, boolean> = {};
        for (const [dateKey, events] of Object.entries(slotsByDate)) {
          // Check if there's a full-day block (00:00 to 23:59)
          const hasFullDayBlock = events.some(
            (ev) =>
              !ev.isCleaning &&
              ev.startHour === 0 &&
              (ev.endHour === 23 || ev.endHour === 0)
          );
          if (hasFullDayBlock) {
            newBlockedDates[dateKey] = true;
          }
        }
        setBlockedDates(newBlockedDates);
      } catch (err) {
        console.error("Failed to fetch month schedule:", err);
      }
    };

    fetchMonthSchedule();
  }, [
    selectedRoomId,
    monthMeta.firstVisibleDate,
    monthMeta.lastVisibleDate,
    setEventsForDate,
  ]);

  const getEventsForDate = (dateKey: string): DetailedCalendarEvent[] => {
    const events = eventsByDate[dateKey];
    return events ?? [];
  };

  const handlePrevMonth = () => {
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
    );
  };

  const handleToday = () => {
    const now = new Date();
    const key = formatDateKey(now);
    setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDateKey(key);
  };

  const toggleBlockMode = () => {
    setIsBlockMode((prev) => !prev);
  };

  const toggleBlockedDate = async (dateKey: string) => {
    if (!selectedRoomId) {
      console.error("No room selected");
      return;
    }

    const isCurrentlyBlocked = blockedDates[dateKey];

    if (isCurrentlyBlocked) {
      // Unblock: Remove the full-day block
      // For now, just update local state
      // In a full implementation, you'd call an API to delete the block
      setBlockedDates((prev) => {
        const next = { ...prev };
        delete next[dateKey];
        return next;
      });
    } else {
      // Block: Create a full-day block (00:00 to 23:59)
      setIsBlockingDate(true);
      try {
        const startDateTime = new Date(dateKey);
        startDateTime.setHours(0, 0, 0, 0);

        const endDateTime = new Date(dateKey);
        endDateTime.setHours(23, 59, 59, 999);

        await scheduleService.createBlockedTime({
          roomId: selectedRoomId,
          date: dateKey,
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
          title: "Day Blocked",
          description: "Full day unavailable",
          cleaningDuration: 0,
        });

        // Update local state
        setBlockedDates((prev) => ({
          ...prev,
          [dateKey]: true,
        }));

        // Refresh schedule for this date
        const response = await scheduleService.getDaySchedule(
          selectedRoomId,
          dateKey
        );
        const apiEvents: DetailedCalendarEvent[] = (response.slots || []).map(
          (slot: {
            id: string;
            startTime: string;
            endTime: string;
            date: string;
            title: string;
            type: string;
            description?: string;
            guestCount?: number;
            bookingId?: string;
          }) => {
            const startDate = new Date(slot.startTime);
            const endDate = new Date(slot.endTime);

            return {
              id: slot.id,
              date: slot.date,
              title: slot.title,
              color:
                slot.type === "cleaning"
                  ? "#1D4ED8"
                  : slot.type === "blocked"
                    ? "#EF4444"
                    : "#FDE68A",
              startHour: startDate.getHours(),
              endHour: endDate.getHours(),
              description: slot.description,
              peopleCount: slot.guestCount,
              isCleaning: slot.type === "cleaning",
              cleaningParentId: slot.bookingId,
            };
          }
        );
        setEventsForDate(dateKey, apiEvents);
      } catch (error) {
        console.error("Failed to block date:", error);
        // Optionally show error to user
      } finally {
        setIsBlockingDate(false);
      }
    }
  };

  const handlePressDay = (dateKey: string, isBlocked: boolean) => {
    // When not in block mode, blocked dates should not respond
    if (!isBlockMode && isBlocked) {
      return;
    }

    if (isBlockMode) {
      // Block mode: toggle block/unblock only
      toggleBlockedDate(dateKey);
      return;
    }

    // Normal behavior: select + navigate
    setSelectedDateKey(dateKey);
    router.push({
      pathname: "/merchant/schedule/timeline",
      params: { date: dateKey, roomId: selectedRoomId },
    });
  };

  return (
    <View className="flex-1 bg-background-0">
      {/* HEADER */}
      <View className="border-outline-100 border-b px-4 pt-4 pb-3">
        {/* Room selector */}
        {roomsLoading ? (
          <View className="mb-3">
            <ActivityIndicator size="small" />
          </View>
        ) : rooms && rooms.length > 0 ? (
          <ScrollView
            className="mb-3"
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            <HStack className="gap-2">
              {rooms.map((room) => (
                <TouchableOpacity
                  className={`rounded-full border px-4 py-2 ${
                    selectedRoomId === room.id
                      ? "border-sky-500 bg-sky-50"
                      : "border-outline-200 bg-background-0"
                  }`}
                  key={room.id}
                  onPress={() => setSelectedRoomId(room.id)}
                >
                  <Text
                    className={`font-medium text-sm ${
                      selectedRoomId === room.id
                        ? "text-sky-700"
                        : "text-typography-700"
                    }`}
                  >
                    {room.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </HStack>
          </ScrollView>
        ) : (
          <View className="mb-3">
            <Text className="text-typography-500 text-sm">
              No rooms available
            </Text>
          </View>
        )}

        <HStack className="items-center justify-between">
          <HStack className="items-center gap-3">
            <TouchableOpacity
              className="rounded-full p-1"
              onPress={handlePrevMonth}
            >
              <MaterialIcons color={iconColor} name="chevron-left" size={24} />
            </TouchableOpacity>

            <Text className="font-semibold text-2xl text-typography-900">
              {monthMeta.monthLabel}
            </Text>

            <TouchableOpacity
              className="rounded-full p-1"
              onPress={handleNextMonth}
            >
              <MaterialIcons color={iconColor} name="chevron-right" size={24} />
            </TouchableOpacity>
          </HStack>

          <HStack className="items-center gap-2">
            <TouchableOpacity
              className="rounded-full border border-outline-100 px-4 py-2"
              onPress={handleToday}
            >
              <Text className="font-medium text-sm text-typography-900">
                Today
              </Text>
            </TouchableOpacity>

            {/* Block button */}
            <TouchableOpacity
              className={[
                "flex-row items-center rounded-full border px-3 py-1.5",
                isBlockMode
                  ? "border-red-500 bg-red-300"
                  : "border-red-400 bg-transparent",
              ].join(" ")}
              disabled={isBlockingDate || !selectedRoomId}
              onPress={toggleBlockMode}
            >
              {isBlockingDate ? (
                <ActivityIndicator color="#B91C1C" size="small" />
              ) : (
                <>
                  <MaterialIcons
                    color={isBlockMode ? "#B91C1C" : "#DC2626"}
                    name="block"
                    size={16}
                  />
                  <Text
                    className={[
                      "ml-1 font-medium text-sm",
                      isBlockMode ? "text-red-700" : "text-red-500",
                    ].join(" ")}
                  >
                    Block
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </HStack>
        </HStack>
      </View>

      {/* WEEKDAY ROW */}
      <HStack
        className="border-outline-100 border-b px-3 py-2"
        style={{ backgroundColor: isDark ? "#111827" : "#F3F4F6" }}
      >
        {WEEKDAYS.map((d) => (
          <View className="flex-1 items-center" key={d}>
            <Text className="font-medium text-typography-500 text-xs">{d}</Text>
          </View>
        ))}
      </HStack>

      {/* GRID */}
      <ScrollView>
        {monthMeta.weeks.map((week, wIndex) => (
          <HStack
            className="border-outline-50 border-b"
            key={`week-${Math.random()}`}
          >
            {week.map((cell) => {
              const { dayNumber, dateKey, isCurrentMonth } = cell;
              const isSelected = dateKey === selectedDateKey;
              const isToday = dateKey === todayKey;
              const isBlocked = !!blockedDates[dateKey];
              const circleActive = isSelected || isToday;

              const dayEvents = getEventsForDate(dateKey);

              const disabled = !isBlockMode && isBlocked;

              return (
                <TouchableOpacity
                  activeOpacity={disabled ? 1 : 0.8}
                  className={["h-28 flex-1", disabled ? "opacity-70" : ""].join(
                    " "
                  )}
                  disabled={disabled}
                  key={`cell-${wIndex}-${Math.random()}`}
                  onPress={() => handlePressDay(dateKey, isBlocked)}
                >
                  <View
                    className={[
                      "flex-1 border-outline-50 border-l px-1 pt-1",
                      isBlocked
                        ? "border-[2px] border-sky-500 bg-[#E5E7EB]"
                        : "",
                    ].join(" ")}
                    style={
                      isBlocked || isCurrentMonth || circleActive
                        ? undefined
                        : {
                            backgroundColor: isDark ? "#111827" : "#F9FAFB",
                          }
                    }
                  >
                    {/* DAY NUMBER */}
                    <View className="items-center">
                      <View
                        className={[
                          "h-7 w-7 items-center justify-center rounded-full",
                          circleActive && !isBlocked ? "bg-[#333333]" : "",
                        ].join(" ")}
                      >
                        <Text
                          className={[
                            "font-medium text-xs",
                            isBlocked
                              ? "text-red-500"
                              : circleActive && !isBlocked
                                ? "text-white"
                                : isCurrentMonth
                                  ? "text-typography-800"
                                  : "text-typography-300",
                          ].join(" ")}
                        >
                          {dayNumber}
                        </Text>
                      </View>
                    </View>

                    {/* BLOCK ICON */}
                    {isBlocked && (
                      <View className="mt-2 items-center">
                        <MaterialIcons
                          color={isDark ? "#111827" : "#111827"}
                          name="block"
                          size={20}
                        />
                      </View>
                    )}

                    {/* EVENTS (hidden when blocked) */}
                    {!isBlocked && dayEvents.length > 0 && (
                      <View className="mt-1 items-center space-y-[3px]">
                        {dayEvents.slice(0, 3).map((ev) => {
                          const isCleaning = ev.isCleaning;
                          const chipBg =
                            ev.color || (isCleaning ? "#2563EB" : "#34D399");
                          return (
                            <View
                              className="rounded-[6px] px-2 py-[3px]"
                              key={ev.id}
                              style={{ backgroundColor: chipBg }}
                            >
                              <Text
                                className="font-medium text-[10px] text-white"
                                numberOfLines={1}
                              >
                                {ev.title || "Blocked"}
                              </Text>
                            </View>
                          );
                        })}
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </HStack>
        ))}
      </ScrollView>
    </View>
  );
}
