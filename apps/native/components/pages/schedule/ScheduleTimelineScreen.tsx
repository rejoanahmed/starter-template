// components/pages/schedule/ScheduleTimelineScreen.tsx

import { HStack } from "@app/components/ui/hstack";
import { Text } from "@app/components/ui/text";
import { type Room, useMerchantRooms } from "@app/services/merchant/rooms";
import { scheduleService } from "@app/services/merchant/schedule";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router, useLocalSearchParams } from "expo-router";
import { useColorScheme } from "nativewind";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  type DetailedCalendarEvent,
  useScheduleStore,
} from "../schedule/store/useScheduleStore";

type Params = {
  date?: string;
  roomId?: string;
};

// 0–23 hours
const HOURS_24 = Array.from({ length: 24 }, (_, h) => h);

// Cleaning time options in minutes (15-minute increments)
const CLEANING_OPTIONS_MINUTES = [
  0, 15, 30, 45, 60, 75, 90, 105, 120, 150, 180,
];

type PendingRange = {
  startHour: number;
  endHour: number; // exclusive
};

type EventDraft = {
  startHour: number;
  endHour: number;
  title: string;
  description: string;
  peopleCount: number;
  cleaningMinutes: number; // Changed from cleaningHours to cleaningMinutes
};

const formatHourLabel = (hour: number): string => {
  let suffix = "am";
  let displayHour = hour;

  if (hour === 0 || hour === 24) {
    displayHour = 12;
    suffix = "am";
  } else if (hour < 12) {
    displayHour = hour;
    suffix = "am";
  } else if (hour === 12) {
    displayHour = 12;
    suffix = "pm";
  } else {
    displayHour = hour - 12;
    suffix = "pm";
  }

  return `${displayHour}:00 ${suffix}`;
};

export default function ScheduleTimelineScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const iconColor = isDark ? "#9CA3AF" : "#4B5563";

  const params = useLocalSearchParams<Params>();
  const dateParam = typeof params.date === "string" ? params.date : "";
  const roomIdParam = typeof params.roomId === "string" ? params.roomId : "";

  // Fetch merchant rooms
  const { data: rooms, isLoading: roomsLoading } = useMerchantRooms();

  // State for selected room and date
  const [selectedRoomId, setSelectedRoomId] = useState<string>(roomIdParam);
  const [selectedDate, setSelectedDate] = useState<string>(
    dateParam || new Date().toISOString().slice(0, 10)
  );
  const [isLoadingSchedule, setIsLoadingSchedule] = useState(false);

  // Update selected room when rooms load
  useEffect(() => {
    if (rooms && rooms.length > 0 && !selectedRoomId) {
      setSelectedRoomId(rooms[0].id);
    }
  }, [rooms, selectedRoomId]);

  // Update from params
  useEffect(() => {
    if (roomIdParam) {
      setSelectedRoomId(roomIdParam);
    }
    if (dateParam) {
      setSelectedDate(dateParam);
    }
  }, [roomIdParam, dateParam]);

  const effectiveDate = selectedDate;

  const dateLabel = useMemo(() => {
    const d = new Date(selectedDate);
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
    });
  }, [selectedDate]);

  const { eventsByDate, setEventsForDate } = useScheduleStore();

  const events: DetailedCalendarEvent[] = eventsByDate[effectiveDate] ?? [];

  console.log("[ScheduleTimeline] Rendering with events:", events);
  console.log(
    "[ScheduleTimeline] Cleaning events:",
    events.filter((e) => e.isCleaning)
  );

  // Fetch schedule data from API
  useEffect(() => {
    if (!selectedRoomId) {
      return;
    }

    const fetchSchedule = async () => {
      setIsLoadingSchedule(true);
      try {
        const response = await scheduleService.getDaySchedule(
          selectedRoomId,
          effectiveDate
        );
        const apiEvents: DetailedCalendarEvent[] = (response.slots || []).map(
          (slot: any) => {
            // Parse ISO datetime strings and convert to local time
            const startDate = new Date(slot.startTime);
            const endDate = new Date(slot.endTime);

            // Calculate fractional hours for minute-level precision
            // e.g., 14:30 = 14.5, 15:45 = 15.75
            const startHour =
              startDate.getHours() + startDate.getMinutes() / 60;
            const endHour = endDate.getHours() + endDate.getMinutes() / 60;

            console.log(`[ScheduleTimeline] Slot ${slot.id}:`, {
              type: slot.type,
              startTime: slot.startTime,
              endTime: slot.endTime,
              startHour,
              endHour,
            });

            return {
              id: slot.id,
              date: slot.date || effectiveDate,
              title: slot.title,
              color:
                slot.type === "cleaning"
                  ? "#1D4ED8"
                  : slot.type === "blocked"
                    ? "#EF4444"
                    : "#FDE68A",
              startHour,
              endHour,
              startTime: slot.startTime,
              endTime: slot.endTime,
              description: slot.description,
              peopleCount: slot.guestCount,
              isCleaning: slot.type === "cleaning",
              cleaningParentId: slot.bookingId,
            };
          }
        );
        console.log("[ScheduleTimeline] Fetched events:", apiEvents);
        console.log(
          "[ScheduleTimeline] Cleaning slots:",
          apiEvents.filter((e) => e.isCleaning)
        );
        setEventsForDate(effectiveDate, apiEvents);
      } catch (err) {
        console.error("Failed to fetch schedule:", err);
      } finally {
        setIsLoadingSchedule(false);
      }
    };

    fetchSchedule();
  }, [effectiveDate, selectedRoomId, setEventsForDate]);

  const [pendingRange, setPendingRange] = useState<PendingRange | null>(null);
  const [draft, setDraft] = useState<EventDraft | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const durationMinutes =
    draft && draft.endHour > draft.startHour
      ? (draft.endHour - draft.startHour) * 60
      : 60;

  // ---- selection flow ----
  const handleSelectHour = (hour: number) => {
    const hasEvent = events.some(
      (ev) => ev.startHour <= hour && ev.endHour > hour
    );
    if (hasEvent) {
      return;
    }

    setPendingRange({ startHour: hour, endHour: hour + 1 });
    setDraft(null);
  };

  const handleCancelPending = () => {
    setPendingRange(null);
  };

  const handleConfirmPending = () => {
    if (!pendingRange) {
      return;
    }

    setDraft({
      startHour: pendingRange.startHour,
      endHour: pendingRange.endHour,
      title: "",
      description: "",
      peopleCount: 6,
      cleaningMinutes: 60, // Default to 1 hour
    });
    setPendingRange(null);
  };

  const handleCancelDraft = () => {
    setDraft(null);
    setErrorMessage(null);
  };

  // ---- save booking + cleaning ----
  const handleSaveDraft = async () => {
    if (!(draft && selectedRoomId)) {
      return;
    }

    const cleaningMinutes = Math.max(0, Math.min(180, draft.cleaningMinutes));
    const clampedStart = Math.max(0, Math.min(23, draft.startHour));
    const clampedEnd = Math.min(24, draft.endHour);

    setIsSaving(true);
    setErrorMessage(null);

    try {
      // Create proper datetime objects in user's local timezone
      const startDateTime = new Date(effectiveDate);
      startDateTime.setHours(clampedStart, 0, 0, 0);

      const endDateTime = new Date(effectiveDate);
      endDateTime.setHours(clampedEnd, 0, 0, 0);

      // Save to API with ISO strings that include timezone
      await scheduleService.createBlockedTime({
        roomId: selectedRoomId,
        date: effectiveDate,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        title: draft.title.trim() || "Blocked",
        description: draft.description.trim(),
        cleaningDuration: cleaningMinutes,
      });

      // Refresh schedule from API
      const response = await scheduleService.getDaySchedule(
        selectedRoomId,
        effectiveDate
      );
      const apiEvents: DetailedCalendarEvent[] = (response.slots || []).map(
        (slot: any) => {
          // Parse ISO datetime strings and convert to local time
          const startDate = new Date(slot.startTime);
          const endDate = new Date(slot.endTime);

          // Calculate fractional hours for minute-level precision
          const startHour = startDate.getHours() + startDate.getMinutes() / 60;
          const endHour = endDate.getHours() + endDate.getMinutes() / 60;

          return {
            id: slot.id,
            date: slot.date || effectiveDate,
            title: slot.title,
            color:
              slot.type === "cleaning"
                ? "#1D4ED8"
                : slot.type === "blocked"
                  ? "#EF4444"
                  : "#FDE68A",
            startHour,
            endHour,
            startTime: slot.startTime,
            endTime: slot.endTime,
            description: slot.description,
            peopleCount: slot.guestCount,
            isCleaning: slot.type === "cleaning",
            cleaningParentId: slot.bookingId,
          };
        }
      );
      setEventsForDate(effectiveDate, apiEvents);

      // Close form on success
      setDraft(null);
    } catch (err) {
      console.error("Failed to save blocked time:", err);

      // Display error to user
      const error = err as Error & { conflictingItems?: unknown[] };
      setErrorMessage(error.message || "Failed to create block");
    } finally {
      setIsSaving(false);
    }
  };

  // ---- popup helpers ----
  const adjustDraftTime = (type: "start" | "end", delta: number) => {
    if (!draft) {
      return;
    }
    let { startHour, endHour } = draft;

    if (type === "start") {
      startHour = Math.max(0, Math.min(23, startHour + delta));
      if (startHour >= endHour) {
        endHour = Math.min(24, startHour + 1);
      }
    } else {
      endHour = Math.max(1, Math.min(24, endHour + delta));
      if (endHour <= startHour) {
        startHour = Math.max(0, endHour - 1);
      }
    }

    setDraft({ ...draft, startHour, endHour });
  };

  const setCleaningMinutes = (minutes: number) => {
    if (!draft) {
      return;
    }
    setDraft({ ...draft, cleaningMinutes: minutes });
  };

  const formatCleaningTime = (minutes: number): string => {
    if (minutes === 0) return "No cleaning";
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) return `${hours} hr${hours > 1 ? "s" : ""}`;
    return `${hours}h ${mins}m`;
  };

  const adjustPeopleCount = (delta: number) => {
    setDraft((prev) =>
      prev
        ? {
            ...prev,
            peopleCount: Math.max(0, prev.peopleCount + delta),
          }
        : prev
    );
  };

  // Date navigation
  const handlePreviousDay = () => {
    const currentDate = new Date(selectedDate);
    currentDate.setDate(currentDate.getDate() - 1);
    setSelectedDate(currentDate.toISOString().slice(0, 10));
  };

  const handleNextDay = () => {
    const currentDate = new Date(selectedDate);
    currentDate.setDate(currentDate.getDate() + 1);
    setSelectedDate(currentDate.toISOString().slice(0, 10));
  };

  const handleToday = () => {
    setSelectedDate(new Date().toISOString().slice(0, 10));
  };

  // Room selection
  const handleRoomChange = (roomId: string) => {
    setSelectedRoomId(roomId);
  };

  return (
    <SafeAreaView className="flex-1 bg-background-0">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        {/* Header */}
        <View className="border-outline-100 border-b bg-background-0">
          {/* Top row - Back button and room selector */}
          <HStack className="items-center justify-between px-4 py-3">
            <HStack className="flex-1 items-center">
              <TouchableOpacity className="pr-3" onPress={() => router.back()}>
                <MaterialIcons
                  color={iconColor}
                  name="chevron-left"
                  size={24}
                />
              </TouchableOpacity>

              {/* Room selector */}
              {roomsLoading ? (
                <ActivityIndicator size="small" />
              ) : rooms && rooms.length > 0 ? (
                <ScrollView
                  className="flex-1"
                  horizontal
                  showsHorizontalScrollIndicator={false}
                >
                  <HStack className="gap-2">
                    {rooms.map((room: Room) => (
                      <TouchableOpacity
                        className={`rounded-full border px-4 py-2 ${
                          selectedRoomId === room.id
                            ? "border-sky-500 bg-sky-50"
                            : "border-outline-200 bg-background-0"
                        }`}
                        key={room.id}
                        onPress={() => handleRoomChange(room.id)}
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
                <Text className="text-typography-500 text-sm">
                  No rooms available
                </Text>
              )}
            </HStack>
          </HStack>

          {/* Bottom row - Date navigation */}
          <HStack className="items-center justify-between border-outline-100 border-t px-4 py-3">
            <HStack className="items-center gap-2">
              <TouchableOpacity
                className="rounded-full p-1"
                onPress={handlePreviousDay}
              >
                <MaterialIcons
                  color={iconColor}
                  name="chevron-left"
                  size={20}
                />
              </TouchableOpacity>

              <Text className="font-semibold text-base text-typography-900">
                {dateLabel}
              </Text>

              <TouchableOpacity
                className="rounded-full p-1"
                onPress={handleNextDay}
              >
                <MaterialIcons
                  color={iconColor}
                  name="chevron-right"
                  size={20}
                />
              </TouchableOpacity>

              <TouchableOpacity
                className="ml-2 rounded-full border border-outline-200 px-3 py-1"
                onPress={handleToday}
              >
                <Text className="font-medium text-xs text-typography-700">
                  Today
                </Text>
              </TouchableOpacity>
            </HStack>

            <Text className="text-[11px] text-typography-500">
              {events.filter((e) => !e.isCleaning).length
                ? `${events.filter((e) => !e.isCleaning).length} booking(s)`
                : "No bookings"}
            </Text>
          </HStack>
        </View>

        {/* Loading indicator */}
        {isLoadingSchedule && (
          <View className="items-center justify-center py-4">
            <ActivityIndicator color="#0EA5E9" size="large" />
            <Text className="mt-2 text-typography-500 text-sm">
              Loading schedule...
            </Text>
          </View>
        )}

        {/* No room selected message */}
        {!(selectedRoomId || roomsLoading) && (
          <View className="flex-1 items-center justify-center px-4">
            <MaterialIcons color="#9CA3AF" name="meeting-room" size={64} />
            <Text className="mt-4 text-center font-semibold text-typography-900 text-lg">
              No Room Selected
            </Text>
            <Text className="mt-2 text-center text-typography-500 text-sm">
              {rooms && rooms.length > 0
                ? "Select a room above to view its schedule"
                : "You don't have any rooms yet"}
            </Text>
          </View>
        )}

        {/* Timeline */}
        {selectedRoomId && !isLoadingSchedule && (
          <View className="flex-1">
            <ScrollView contentContainerStyle={{ paddingBottom: 140 }}>
              {HOURS_24.map((hour) => {
                const label = formatHourLabel(hour);

                const eventForHour = events.find(
                  (ev) => ev.startHour <= hour && ev.endHour > hour
                );

                const inPending =
                  pendingRange &&
                  hour >= pendingRange.startHour &&
                  hour < pendingRange.endHour;

                const isPendingLastRow =
                  !!pendingRange && hour === pendingRange.endHour - 1;

                const isEventStart =
                  !!eventForHour && eventForHour.startHour === hour;

                const rowIsFree = !eventForHour;

                const isCleaning =
                  (eventForHour as DetailedCalendarEvent | undefined)
                    ?.isCleaning === true;

                return (
                  <View
                    className="h-14 flex-row border-outline-100 border-b"
                    key={hour}
                  >
                    {/* Time label */}
                    <View className="w-24 justify-center pl-3">
                      <Text className="text-typography-500 text-xs">
                        {label}
                      </Text>
                    </View>

                    {/* Track cell */}
                    <TouchableOpacity
                      activeOpacity={rowIsFree ? 0.8 : 1}
                      className="flex-1 pr-3"
                      onPress={() => rowIsFree && handleSelectHour(hour)}
                    >
                      {inPending ? (
                        <View className="h-full justify-center rounded-md bg-amber-100 px-3">
                          {isPendingLastRow && (
                            <HStack className="justify-end gap-3">
                              <TouchableOpacity
                                className="h-9 w-9 items-center justify-center rounded-full bg-red-100"
                                onPress={handleCancelPending}
                              >
                                <MaterialIcons
                                  color="#DC2626"
                                  name="close"
                                  size={18}
                                />
                              </TouchableOpacity>
                              <TouchableOpacity
                                className="h-9 w-9 items-center justify-center rounded-full bg-emerald-100"
                                onPress={handleConfirmPending}
                              >
                                <MaterialIcons
                                  color="#059669"
                                  name="check"
                                  size={18}
                                />
                              </TouchableOpacity>
                            </HStack>
                          )}
                        </View>
                      ) : eventForHour ? (
                        <View
                          className="h-full justify-center rounded-md px-3"
                          style={{
                            backgroundColor: eventForHour.color,
                          }}
                        >
                          {isEventStart && !isCleaning && (
                            <>
                              <Text className="font-semibold text-typography-900 text-xs">
                                {eventForHour.title || "Add info"}
                              </Text>
                              <Text className="mt-0.5 text-[11px] text-typography-700">
                                {formatHourLabel(eventForHour.startHour)} –{" "}
                                {formatHourLabel(
                                  eventForHour.endHour === 24
                                    ? 0
                                    : eventForHour.endHour
                                )}
                              </Text>
                            </>
                          )}

                          {isEventStart && isCleaning && (
                            <Text className="text-center font-semibold text-white text-xs">
                              Cleaning
                            </Text>
                          )}
                        </View>
                      ) : (
                        <View className="h-full" />
                      )}
                    </TouchableOpacity>
                  </View>
                );
              })}
            </ScrollView>

            {/* Bottom popup card */}
            {draft && (
              <View className="absolute right-4 bottom-4 left-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_18px_45px_rgba(15,23,42,0.28)]">
                {/* drag handle */}
                <View className="mb-3 items-center">
                  <View className="h-1 w-10 rounded-full bg-slate-300" />
                </View>

                {/* Header row */}
                <HStack className="mb-3 items-center justify-between">
                  <TouchableOpacity onPress={handleCancelDraft}>
                    <Text className="text-slate-500 text-sm">Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    disabled={isSaving}
                    onPress={handleSaveDraft}
                  >
                    <Text
                      className={`font-semibold text-sm ${isSaving ? "text-slate-400" : "text-sky-600"}`}
                    >
                      {isSaving ? "Saving..." : "Save"}
                    </Text>
                  </TouchableOpacity>
                </HStack>

                {/* Error message */}
                {errorMessage && (
                  <View className="mb-3 rounded-lg bg-red-50 border border-red-200 p-3">
                    <HStack className="items-start gap-2">
                      <MaterialIcons
                        color="#DC2626"
                        name="error-outline"
                        size={20}
                      />
                      <Text className="flex-1 text-red-700 text-sm">
                        {errorMessage}
                      </Text>
                    </HStack>
                  </View>
                )}

                {/* Title & description */}
                <View className="mb-4">
                  <TextInput
                    className="mb-2 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 font-semibold text-base text-slate-900"
                    onChangeText={(text) =>
                      setDraft((d) => (d ? { ...d, title: text } : d))
                    }
                    placeholder="Block title (e.g., Maintenance, Private Event)"
                    placeholderTextColor="#9CA3AF"
                    value={draft.title}
                  />
                  <TextInput
                    className="min-h-[80px] rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-slate-800 text-sm"
                    multiline
                    numberOfLines={4}
                    onChangeText={(text) =>
                      setDraft((d) => (d ? { ...d, description: text } : d))
                    }
                    placeholder="Add description or notes..."
                    placeholderTextColor="#6B7280"
                    textAlignVertical="top"
                    value={draft.description}
                  />
                </View>

                {/* People with +/- */}
                <HStack className="mb-3 items-center">
                  <MaterialIcons color="#4B5563" name="group" size={16} />

                  <TouchableOpacity
                    className="ml-3 h-7 w-7 items-center justify-center rounded-full bg-slate-100"
                    onPress={() => adjustPeopleCount(-1)}
                  >
                    <MaterialIcons color="#4B5563" name="remove" size={16} />
                  </TouchableOpacity>

                  <TextInput
                    className="mx-2 min-w-[40px] rounded-md border border-slate-300 px-2 py-1 text-center text-slate-900 text-sm"
                    keyboardType="numeric"
                    onChangeText={(text) =>
                      setDraft((d) =>
                        d
                          ? {
                              ...d,
                              peopleCount:
                                Number(text.replace(/[^0-9]/g, "")) || 0,
                            }
                          : d
                      )
                    }
                    value={String(draft.peopleCount)}
                  />

                  <TouchableOpacity
                    className="h-7 w-7 items-center justify-center rounded-full bg-slate-100"
                    onPress={() => adjustPeopleCount(1)}
                  >
                    <MaterialIcons color="#4B5563" name="add" size={16} />
                  </TouchableOpacity>

                  <Text className="ml-2 text-slate-700 text-sm">ppl</Text>
                </HStack>

                {/* Date & time with adjustable chips */}
                <HStack className="mb-3 items-start">
                  <MaterialIcons
                    color="#4B5563"
                    name="access-time"
                    size={16}
                    style={{ marginTop: 2 }}
                  />
                  <View className="ml-2 flex-1">
                    <Text className="mb-2 text-slate-800 text-sm">
                      {dateLabel}
                    </Text>

                    <HStack className="items-center justify-between">
                      {/* Start time */}
                      <HStack className="items-center gap-1">
                        <TouchableOpacity
                          className="h-7 w-7 items-center justify-center rounded-full bg-slate-100"
                          onPress={() => adjustDraftTime("start", -1)}
                        >
                          <MaterialIcons
                            color="#4B5563"
                            name="chevron-left"
                            size={18}
                          />
                        </TouchableOpacity>
                        <View className="rounded-full border border-slate-300 bg-slate-100 px-3 py-1">
                          <Text className="text-slate-900 text-xs">
                            {formatHourLabel(draft.startHour)}
                          </Text>
                        </View>
                        <TouchableOpacity
                          className="h-7 w-7 items-center justify-center rounded-full bg-slate-100"
                          onPress={() => adjustDraftTime("start", 1)}
                        >
                          <MaterialIcons
                            color="#4B5563"
                            name="chevron-right"
                            size={18}
                          />
                        </TouchableOpacity>
                      </HStack>

                      {/* End time */}
                      <HStack className="items-center gap-1">
                        <TouchableOpacity
                          className="h-7 w-7 items-center justify-center rounded-full bg-slate-100"
                          onPress={() => adjustDraftTime("end", -1)}
                        >
                          <MaterialIcons
                            color="#4B5563"
                            name="chevron-left"
                            size={18}
                          />
                        </TouchableOpacity>
                        <View className="rounded-full border border-slate-300 bg-slate-100 px-3 py-1">
                          <Text className="text-slate-900 text-xs">
                            {formatHourLabel(
                              draft.endHour === 24 ? 0 : draft.endHour
                            )}
                          </Text>
                        </View>
                        <TouchableOpacity
                          className="h-7 w-7 items-center justify-center rounded-full bg-slate-100"
                          onPress={() => adjustDraftTime("end", 1)}
                        >
                          <MaterialIcons
                            color="#4B5563"
                            name="chevron-right"
                            size={18}
                          />
                        </TouchableOpacity>
                      </HStack>
                    </HStack>
                  </View>
                </HStack>

                {/* Cleaning duration selector */}
                <HStack className="mb-2 items-center">
                  <MaterialIcons
                    color="#4B5563"
                    name="cleaning-services"
                    size={16}
                  />
                  <Text className="ml-2 text-slate-800 text-sm">
                    Cleaning time
                  </Text>
                </HStack>
                <ScrollView
                  className="mb-3"
                  horizontal
                  showsHorizontalScrollIndicator={false}
                >
                  <HStack className="gap-2">
                    {CLEANING_OPTIONS_MINUTES.map((minutes) => {
                      const selected = draft.cleaningMinutes === minutes;
                      return (
                        <TouchableOpacity
                          className={`rounded-full border px-3 py-1.5 ${
                            selected
                              ? "border-sky-500 bg-sky-500"
                              : "border-slate-300 bg-slate-50"
                          }`}
                          key={minutes}
                          onPress={() => setCleaningMinutes(minutes)}
                        >
                          <Text
                            className={`text-xs ${
                              selected ? "text-white" : "text-slate-800"
                            }`}
                          >
                            {formatCleaningTime(minutes)}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </HStack>
                </ScrollView>

                {/* Duration pill */}
                <HStack className="items-center">
                  <MaterialIcons color="#4B5563" name="timer" size={16} />
                  <View className="ml-2 flex-row items-center rounded-md border border-slate-300 bg-slate-50 px-3 py-1">
                    <Text className="mr-1 text-slate-900 text-xs">
                      {durationMinutes} mins
                    </Text>
                    <MaterialIcons
                      color="#6B7280"
                      name="arrow-drop-down"
                      size={18}
                    />
                  </View>
                </HStack>
              </View>
            )}
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
