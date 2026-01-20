import { Colors } from "@app/constants/Colors";
import { useCreateBooking } from "@app/services/client/bookings";
import { useRoomPricing } from "@app/services/client/pricing";
import { useRoom } from "@app/services/client/rooms";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { Calendar, type DateData } from "react-native-calendars";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

/* ---------------- Utils ---------------- */
const withAlpha = (hex: string, a: number) =>
  `${hex}${Math.round(Math.min(1, Math.max(0, a)) * 255)
    .toString(16)
    .padStart(2, "0")}`;

const startOfDay = (d: Date) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

/* ---------------- Time Picker ---------------- */
const ALL_TIMES = (() => {
  const out: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const hh = ((h + 11) % 12) + 1;
      const mm = m.toString().padStart(2, "0");
      const ampm = h < 12 ? "AM" : "PM";
      out.push(`${hh}:${mm} ${ampm}`);
    }
  }
  return out;
})();

function TimePickerModal({
  visible,
  onClose,
  value,
  onSelect,
  title,
  theme,
}: {
  visible: boolean;
  onClose: () => void;
  value: string;
  onSelect: (v: string) => void;
  title: string;
  theme: { tint: string; text: string; background: string; icon: string };
}) {
  const overlayBg = withAlpha(theme.text, 0.33);
  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      transparent
      visible={visible}
    >
      <View
        className="flex-1 justify-end"
        style={{ backgroundColor: overlayBg }}
      >
        <View
          className="max-h-[70%] rounded-t-2xl pt-3 pb-6"
          style={{ backgroundColor: theme.background }}
        >
          <View className="mb-2 flex-row items-center px-4">
            <Text
              className="flex-1 font-bold text-base"
              style={{ color: theme.text }}
            >
              {title}
            </Text>
            <Pressable hitSlop={10} onPress={onClose}>
              <Ionicons color={theme.text} name="close" size={22} />
            </Pressable>
          </View>

          <FlatList
            data={ALL_TIMES}
            getItemLayout={(_, index) => ({
              length: 44,
              offset: 44 * index,
              index,
            })}
            initialScrollIndex={Math.max(
              0,
              Math.min(ALL_TIMES.length - 1, ALL_TIMES.indexOf(value))
            )}
            keyExtractor={(t) => `time-${t}`}
            renderItem={({ item }) => {
              const selected = item === value;
              return (
                <Pressable
                  android_ripple={
                    Platform.OS === "android"
                      ? { color: withAlpha(theme.icon, 0.08) }
                      : undefined
                  }
                  className="h-11 items-start justify-center px-4"
                  onPress={() => {
                    onSelect(item);
                    onClose();
                  }}
                  style={{
                    backgroundColor: selected
                      ? withAlpha(theme.tint, 0.08)
                      : "transparent",
                  }}
                >
                  <Text
                    className={selected ? "font-bold" : "font-medium"}
                    style={{ color: selected ? theme.tint : theme.text }}
                  >
                    {item}
                  </Text>
                </Pressable>
              );
            }}
          />
        </View>
      </View>
    </Modal>
  );
}

/* ---------------- Screen ---------------- */
export default function BookingScreen() {
  const { colorScheme = "light" } = useColorScheme();
  const theme = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{
    id?: string;
    people?: string;
    startDate?: string;
    endDate?: string;
    startTime?: string;
    endTime?: string;
  }>();

  // Fetch room data
  const {
    data: room,
    isLoading: roomLoading,
    error: roomError,
  } = useRoom(params.id || "");

  // Fetch all pricing data (default + overrides)
  const { data: pricingData } = useRoomPricing(params.id || "", !!params.id);

  console.log("[Reserve] Pricing data:", pricingData);
  // Date
  const [selectedDate, setSelectedDate] = useState<Date | null>(() => {
    if (params.startDate) {
      const [y, m, d] = params.startDate.split("-").map((x) => Number(x));
      if (Number.isFinite(y) && Number.isFinite(m) && Number.isFinite(d)) {
        return startOfDay(new Date(y, (m ?? 1) - 1, d ?? 1));
      }
    }
    return null;
  });

  // Check-in time
  const [checkInTime, setCheckInTime] = useState(params.startTime || "2:00 PM");
  const [pickTimeOpen, setPickTimeOpen] = useState(false);

  // Selected hourly tier
  const [selectedTier, setSelectedTier] = useState<{
    hours: number;
    price: number;
  } | null>(null);

  // People
  const initialPeople =
    (params.people && Number(params.people)) || room?.includedGuests || 1;
  const [people, setPeople] = useState(initialPeople);

  // Update people when room data loads
  useEffect(() => {
    if (room && !params.people) {
      setPeople(room.includedGuests || 1);
    }
  }, [room, params.people]);

  // Create booking
  const createBookingMutation = useCreateBooking();

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get applicable pricing (tiers + extra person charge) based on selected date/time
  const applicablePricing = useMemo<{
    hourlyTiers: Array<{ hours: number; price: number }>;
    extraPersonChargePerHour: number;
    includedGuests: number;
  } | null>(() => {
    // If pricing data not loaded yet, return null (will use room data as fallback)
    if (!pricingData) {
      return null;
    }

    // Find matching override based on selected date and time
    if (!selectedDate) {
      const defaultTiers = pricingData.defaultPricing.hourlyTiers || [];
      return {
        hourlyTiers: defaultTiers.sort((a, b) => a.hours - b.hours),
        extraPersonChargePerHour: Number.parseFloat(
          pricingData.defaultPricing.extraPersonChargePerHour || "0"
        ),
        includedGuests: pricingData.defaultPricing.includedGuests,
      };
    }
    if (!checkInTime) {
      const defaultTiers = pricingData.defaultPricing.hourlyTiers || [];
      return {
        hourlyTiers: defaultTiers.sort((a, b) => a.hours - b.hours),
        extraPersonChargePerHour: Number.parseFloat(
          pricingData.defaultPricing.extraPersonChargePerHour || "0"
        ),
        includedGuests: pricingData.defaultPricing.includedGuests,
      };
    }

    // Parse check-in time to HH:mm format
    const parseTimeToHHmm = (timeStr: string): string => {
      const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (!match) {
        return "14:00";
      }
      let hours = Number.parseInt(match[1], 10);
      const minutes = Number.parseInt(match[2], 10);
      const period = match[3].toUpperCase();

      if (period === "PM" && hours !== 12) {
        hours += 12;
      } else if (period === "AM" && hours === 12) {
        hours = 0;
      }

      return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
    };

    const bookingTime = parseTimeToHHmm(checkInTime);
    const dayOfWeek = selectedDate.getDay(); // 0 = Sunday, 6 = Saturday
    const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`;

    // Check for matching override
    for (const override of pricingData.overrides) {
      if (override.type === "day") {
        // Check day-based override
        if (
          override.startDayOfWeek !== null &&
          override.startTime !== null &&
          override.endDayOfWeek !== null &&
          override.endTime !== null
        ) {
          const startDay = override.startDayOfWeek;
          const endDay = override.endDayOfWeek;

          // Check if day is in range
          let dayMatches = false;
          if (startDay <= endDay) {
            dayMatches = dayOfWeek >= startDay && dayOfWeek <= endDay;
          } else {
            // Wrap-around (e.g., Friday to Monday)
            dayMatches = dayOfWeek >= startDay || dayOfWeek <= endDay;
          }

          // Check if time is in range
          if (!dayMatches) continue;

          // Handle time range - check if it wraps around midnight
          const startTime = override.startTime;
          const endTime = override.endTime;
          let timeMatches = false;

          if (startTime <= endTime) {
            // Normal time range (e.g., 09:00 to 17:00)
            timeMatches = bookingTime >= startTime && bookingTime <= endTime;
          } else if (dayOfWeek === startDay) {
            // Wrap-around: On start day, time must be >= startTime
            timeMatches = bookingTime >= startTime;
          } else if (dayOfWeek === endDay) {
            // Wrap-around: On end day, time must be <= endTime
            timeMatches = bookingTime <= endTime;
          } else {
            // Wrap-around: Days between start and end, any time matches
            timeMatches = true;
          }

          if (!timeMatches) continue;

          // Use override pricing if available
          if (override.hourlyTiers && override.hourlyTiers.length > 0) {
            return {
              hourlyTiers: override.hourlyTiers.sort(
                (a, b) => a.hours - b.hours
              ),
              extraPersonChargePerHour: override.extraPersonChargePerHour
                ? Number.parseFloat(override.extraPersonChargePerHour)
                : Number.parseFloat(
                    pricingData.defaultPricing.extraPersonChargePerHour || "0"
                  ),
              includedGuests: pricingData.defaultPricing.includedGuests,
            };
          }
        }
      } else if (override.type === "date") {
        // Check date-based override
        if (!override.startDate) continue;
        if (!override.endDate) continue;
        if (dateStr < override.startDate) continue;
        if (dateStr > override.endDate) continue;

        // Use override pricing if available
        if (override.hourlyTiers && override.hourlyTiers.length > 0) {
          return {
            hourlyTiers: override.hourlyTiers.sort((a, b) => a.hours - b.hours),
            extraPersonChargePerHour: override.extraPersonChargePerHour
              ? Number.parseFloat(override.extraPersonChargePerHour)
              : Number.parseFloat(
                  pricingData.defaultPricing.extraPersonChargePerHour || "0"
                ),
            includedGuests: pricingData.defaultPricing.includedGuests,
          };
        }
      }
    }

    // No matching override, use default pricing
    const defaultTiers = pricingData.defaultPricing.hourlyTiers || [];
    return {
      hourlyTiers: defaultTiers.sort((a, b) => a.hours - b.hours),
      extraPersonChargePerHour: Number.parseFloat(
        pricingData.defaultPricing.extraPersonChargePerHour || "0"
      ),
      includedGuests: pricingData.defaultPricing.includedGuests,
    };
  }, [pricingData, selectedDate, checkInTime]);

  // Extract hourly tiers for display
  const hourlyTiers = useMemo(() => {
    if (!applicablePricing) {
      if (!(room?.hourlyTiers && Array.isArray(room.hourlyTiers))) {
        return [];
      }
      return (room.hourlyTiers as Array<{ hours: number; price: number }>).sort(
        (a, b) => a.hours - b.hours
      );
    }
    return applicablePricing.hourlyTiers;
  }, [applicablePricing, room?.hourlyTiers]);

  // Calculate total price including extra person charge
  const totalPrice = useMemo(() => {
    if (!(selectedTier && applicablePricing)) {
      return selectedTier?.price || 0;
    }

    const basePrice = selectedTier.price;
    const includedGuests = applicablePricing.includedGuests;
    const extraPersonChargePerHour = applicablePricing.extraPersonChargePerHour;

    const extraGuests = Math.max(0, people - includedGuests);
    const extraPersonCharge =
      extraGuests * extraPersonChargePerHour * selectedTier.hours;

    return basePrice + extraPersonCharge;
  }, [selectedTier, applicablePricing, people]);

  // Calculate end time based on selected tier
  const endTime = useMemo(() => {
    if (!selectedDate) return null;
    if (!checkInTime) return null;
    if (!selectedTier) return null;

    const parseTime = (timeStr: string) => {
      const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (!match) {
        return { hours: 14, minutes: 0 };
      }
      let hours = Number.parseInt(match[1], 10);
      const minutes = Number.parseInt(match[2], 10);
      const period = match[3].toUpperCase();

      if (period === "PM" && hours !== 12) {
        hours += 12;
      } else if (period === "AM" && hours === 12) {
        hours = 0;
      }

      return { hours, minutes };
    };

    const startTimeObj = parseTime(checkInTime);
    const startAt = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      startTimeObj.hours,
      startTimeObj.minutes,
      0,
      0
    );

    const endAt = new Date(
      startAt.getTime() + selectedTier.hours * 60 * 60 * 1000
    );

    // Format end time for display
    const endHours = endAt.getHours();
    const endMinutes = endAt.getMinutes();
    const endPeriod = endHours >= 12 ? "PM" : "AM";
    const displayHours =
      endHours > 12 ? endHours - 12 : endHours === 0 ? 12 : endHours;

    return {
      date: endAt,
      display: `${displayHours}:${endMinutes.toString().padStart(2, "0")} ${endPeriod}`,
    };
  }, [selectedDate, checkInTime, selectedTier]);

  const canConfirm =
    !!room &&
    !!selectedDate &&
    !!checkInTime &&
    !!selectedTier &&
    !isSubmitting &&
    !createBookingMutation.isPending;
  const displayPrice = totalPrice;

  // Handle booking confirmation
  const handleConfirm = async () => {
    if (
      !(
        canConfirm &&
        room &&
        selectedDate &&
        checkInTime &&
        selectedTier &&
        endTime
      )
    ) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Convert time strings to 24-hour format for API
      const parseTime = (timeStr: string) => {
        const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
        if (!match) {
          return { hours: 14, minutes: 0 };
        }
        let hours = Number.parseInt(match[1], 10);
        const minutes = Number.parseInt(match[2], 10);
        const period = match[3].toUpperCase();

        if (period === "PM" && hours !== 12) {
          hours += 12;
        } else if (period === "AM" && hours === 12) {
          hours = 0;
        }

        return { hours, minutes };
      };

      const startTimeObj = parseTime(checkInTime);

      // Create start date/time
      const startAt = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        startTimeObj.hours,
        startTimeObj.minutes,
        0,
        0
      );

      // End time is already calculated in endTime memo
      const endAt = endTime.date;

      // Create booking
      await createBookingMutation.mutateAsync({
        roomId: room.id,
        startDate: startAt.toISOString(),
        endDate: endAt.toISOString(),
        guests: people,
      });

      // Navigate to success page
      router.replace("/reserve/bookingSuccess");
    } catch (error) {
      console.error("Failed to create booking:", error);
      Alert.alert(
        "Booking Failed",
        error instanceof Error
          ? error.message
          : "Failed to create booking. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const borderHair = withAlpha(theme.icon, 0.35);
  const dividerHair = withAlpha(theme.icon, 0.25);
  const surfaceSubtle = withAlpha(theme.icon, 0.05);

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: theme.background }}
    >
      {/* Header */}
      <View
        className="flex-row items-center border-b px-4 pb-2"
        style={{ borderBottomColor: dividerHair }}
      >
        <Pressable className="pr-2" hitSlop={10} onPress={() => router.back()}>
          <Ionicons color={theme.text} name="chevron-back" size={22} />
        </Pressable>
        <Text
          className="flex-1 font-extrabold text-lg"
          style={{ color: theme.text }}
        >
          Reserve
        </Text>
      </View>

      {/* Loading State */}
      {roomLoading && (
        <View className="flex-1 items-center justify-center p-8">
          <ActivityIndicator color={theme.tint} size="large" />
          <Text className="mt-4 text-center" style={{ color: theme.text }}>
            Loading room details...
          </Text>
        </View>
      )}

      {/* Error State */}
      {roomError && !roomLoading && (
        <View className="flex-1 items-center justify-center p-8">
          <Ionicons color="#EF4444" name="alert-circle-outline" size={48} />
          <Text
            className="mt-4 text-center font-bold"
            style={{ color: theme.text }}
          >
            Failed to load room
          </Text>
          <Text className="mt-2 text-center" style={{ color: theme.icon }}>
            {roomError instanceof Error ? roomError.message : "Unknown error"}
          </Text>
          <Pressable
            className="mt-6 rounded-xl px-6 py-3"
            onPress={() => router.back()}
            style={{ backgroundColor: theme.tint }}
          >
            <Text style={{ color: "#FFFFFF", fontWeight: "600" }}>Go Back</Text>
          </Pressable>
        </View>
      )}

      {/* Main Content */}
      {!(roomLoading || roomError) && room && (
        <ScrollView
          contentContainerStyle={{ paddingBottom: insets.bottom + 160 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Date Selection */}
          <View className="mx-4 mt-4">
            <Text className="mb-2 font-extrabold" style={{ color: theme.text }}>
              Select Date
            </Text>
            <View
              className="rounded-2xl border overflow-hidden"
              style={{
                borderColor: borderHair,
                backgroundColor: theme.background,
              }}
            >
              <Calendar
                enableSwipeMonths
                firstDay={1}
                hideExtraDays
                markedDates={
                  selectedDate
                    ? {
                        [`${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`]:
                          {
                            selected: true,
                            selectedColor: theme.tint,
                            selectedTextColor: Colors.dark.background,
                          },
                      }
                    : {}
                }
                minDate={new Date().toISOString().split("T")[0]}
                onDayPress={(day: DateData) => {
                  // Create date directly from calendar day data (already in local timezone)
                  const selected = new Date(day.year, day.month - 1, day.day);
                  selected.setHours(0, 0, 0, 0);
                  setSelectedDate(selected);
                }}
                style={{ borderRadius: 12, paddingVertical: 4 }}
                theme={{
                  backgroundColor: theme.background,
                  calendarBackground: theme.background,
                  monthTextColor: theme.text,
                  textMonthFontWeight: "700",
                  textMonthFontSize: 14,
                  arrowColor: theme.tint,
                  textSectionTitleColor: theme.icon,
                  textDayHeaderFontWeight: "600",
                  textDayHeaderFontSize: 11,
                  dayTextColor: theme.text,
                  textDayFontWeight: "500",
                  textDayFontSize: 13,
                  textDisabledColor: withAlpha(theme.icon, 0.5),
                  todayTextColor: theme.tint,
                  selectedDayBackgroundColor: theme.tint,
                  selectedDayTextColor: Colors.dark.background,
                }}
              />
            </View>
          </View>

          {/* Check-in Time */}
          <View
            className="mx-4 mt-3.5 overflow-hidden rounded-2xl border"
            style={{
              borderColor: borderHair,
              backgroundColor: theme.background,
            }}
          >
            <View className="px-3.5 pt-3 pb-2">
              <Text className="font-extrabold" style={{ color: theme.text }}>
                Check-in Time
              </Text>
            </View>

            <Pressable
              android_ripple={
                Platform.OS === "android"
                  ? { color: withAlpha(theme.icon, 0.08) }
                  : undefined
              }
              className="mx-3.5 mb-3 h-12 flex-row items-center justify-between rounded-xl border px-3"
              onPress={() => setPickTimeOpen(true)}
              style={{ borderColor: borderHair }}
            >
              <Text className="font-semibold" style={{ color: theme.text }}>
                {checkInTime}
              </Text>
              <Ionicons color={theme.text} name="time-outline" size={18} />
            </Pressable>
          </View>

          {/* Hourly Tier Selection */}
          {hourlyTiers.length > 0 && (
            <View
              className="mx-4 mt-3.5 overflow-hidden rounded-2xl border"
              style={{
                borderColor: borderHair,
                backgroundColor: theme.background,
              }}
            >
              <View className="px-3.5 pt-3 pb-2">
                <Text className="font-extrabold" style={{ color: theme.text }}>
                  Duration & Price
                </Text>
              </View>

              <View className="px-3.5 pb-3">
                {hourlyTiers.map((tier: { hours: number; price: number }) => {
                  const isSelected = selectedTier?.hours === tier.hours;
                  return (
                    <Pressable
                      android_ripple={
                        Platform.OS === "android"
                          ? { color: withAlpha(theme.icon, 0.08) }
                          : undefined
                      }
                      className="mb-2 h-14 flex-row items-center justify-between rounded-xl border px-4"
                      key={`${tier.hours}-${tier.price}`}
                      onPress={() => setSelectedTier(tier)}
                      style={{
                        borderColor: isSelected ? theme.tint : borderHair,
                        backgroundColor: isSelected
                          ? withAlpha(theme.tint, 0.1)
                          : surfaceSubtle,
                      }}
                    >
                      <View>
                        <Text
                          className="font-semibold"
                          style={{ color: theme.text }}
                        >
                          {tier.hours} {tier.hours === 1 ? "hour" : "hours"}
                        </Text>
                        {endTime && selectedTier?.hours === tier.hours && (
                          <Text
                            className="text-xs mt-0.5"
                            style={{ color: theme.icon }}
                          >
                            Until {endTime.display}
                          </Text>
                        )}
                      </View>
                      <View className="flex-row items-center gap-2">
                        <Text
                          className="font-bold text-lg"
                          style={{ color: theme.tint }}
                        >
                          ${tier.price}
                        </Text>
                        {isSelected && (
                          <Ionicons
                            color={theme.tint}
                            name="checkmark-circle"
                            size={20}
                          />
                        )}
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          )}

          {/* People */}
          <View
            className="mx-4 mt-3.5 overflow-hidden rounded-2xl border"
            style={{
              borderColor: borderHair,
              backgroundColor: theme.background,
            }}
          >
            <View className="px-3.5 pt-3 pb-2">
              <Text className="font-extrabold" style={{ color: theme.text }}>
                No. People
              </Text>
            </View>

            <View className="flex-row items-center px-3.5 pb-3">
              <Pressable
                accessibilityLabel="Decrease people"
                accessibilityRole="button"
                className="h-11 w-11 items-center justify-center rounded-xl border"
                onPress={() => setPeople((p: number) => Math.max(1, p - 1))}
                style={{
                  borderColor: borderHair,
                  backgroundColor: surfaceSubtle,
                }}
              >
                <Ionicons color={theme.text} name="remove" size={18} />
              </Pressable>

              <Text
                className="mx-4 font-extrabold text-lg"
                style={{ color: theme.text }}
              >
                {people}
              </Text>

              <Pressable
                accessibilityLabel="Increase people"
                accessibilityRole="button"
                className="h-11 w-11 items-center justify-center rounded-xl border"
                onPress={() => setPeople((p: number) => Math.min(20, p + 1))}
                style={{
                  borderColor: borderHair,
                  backgroundColor: surfaceSubtle,
                }}
              >
                <Ionicons color={theme.text} name="add" size={18} />
              </Pressable>
            </View>
          </View>

          {/* Room Summary */}
          {room && (
            <View className="mx-4 mt-3">
              <View
                className="rounded-xl border p-3 mb-3"
                style={{
                  borderColor: borderHair,
                  backgroundColor: surfaceSubtle,
                }}
              >
                <Text className="font-extrabold" style={{ color: theme.text }}>
                  {room.title}
                </Text>
                <Text className="mt-0.5" style={{ color: theme.text }}>
                  {room.district}
                </Text>
              </View>

              {/* Booking Summary */}
              {selectedTier && endTime && (
                <View
                  className="rounded-xl border p-4"
                  style={{
                    borderColor: borderHair,
                    backgroundColor: surfaceSubtle,
                  }}
                >
                  <View className="flex-row justify-between mb-2">
                    <Text style={{ color: theme.text }}>Duration:</Text>
                    <Text style={{ color: theme.text }}>
                      {selectedTier.hours}{" "}
                      {selectedTier.hours === 1 ? "hour" : "hours"}
                    </Text>
                  </View>
                  <View className="flex-row justify-between mb-2">
                    <Text style={{ color: theme.text }}>Check-out:</Text>
                    <Text style={{ color: theme.text }}>{endTime.display}</Text>
                  </View>
                  {applicablePricing &&
                    people > applicablePricing.includedGuests && (
                      <View className="flex-row justify-between mb-2">
                        <Text style={{ color: theme.text }}>
                          Extra person charge (
                          {people - applicablePricing.includedGuests} × $
                          {applicablePricing.extraPersonChargePerHour.toFixed(
                            2
                          )}
                          /hr × {selectedTier.hours}hrs):
                        </Text>
                        <Text style={{ color: theme.text }}>
                          $
                          {(
                            (people - applicablePricing.includedGuests) *
                            applicablePricing.extraPersonChargePerHour *
                            selectedTier.hours
                          ).toFixed(2)}
                        </Text>
                      </View>
                    )}
                  <View
                    className="mt-3 pt-3 border-t"
                    style={{ borderTopColor: borderHair }}
                  >
                    <View className="flex-row justify-between items-center">
                      <Text
                        className="font-bold text-lg"
                        style={{ color: theme.text }}
                      >
                        Total:
                      </Text>
                      <Text
                        className="font-bold text-xl"
                        style={{ color: theme.tint }}
                      >
                        ${totalPrice.toFixed(2)}
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              <Pressable onPress={() => router.push("/clientbooking/policy")}>
                <Text
                  className="ml-auto py-5 font-medium underline"
                  style={{ color: theme.tint }}
                >
                  Booking Policies
                </Text>
              </Pressable>
            </View>
          )}
        </ScrollView>
      )}

      {/* Confirm bar with total */}
      {!(roomLoading || roomError) && room && (
        <View
          className="absolute right-0 bottom-0 left-0 px-4 pt-3 pb-6"
          style={{
            borderTopColor: dividerHair,
            backgroundColor: theme.background,
          }}
        >
          <Pressable
            accessibilityState={{ disabled: !canConfirm }}
            className="h-[50px] items-center justify-center rounded-xl pt-2"
            disabled={!canConfirm}
            onPress={handleConfirm}
            style={{
              backgroundColor: canConfirm
                ? theme.tint
                : withAlpha(theme.tint, 0.33),
              paddingBottom: insets.bottom ? 12 : 0,
            }}
          >
            {createBookingMutation.isPending || isSubmitting ? (
              <ActivityIndicator color={Colors.dark.background} />
            ) : (
              <Text
                className="justify-center text-center font-extrabold"
                style={{ color: Colors.dark.background }}
              >
                {canConfirm
                  ? `Confirm • $${displayPrice.toFixed(2)}`
                  : "Confirm"}
              </Text>
            )}
          </Pressable>
        </View>
      )}

      {/* Time picker */}
      <TimePickerModal
        onClose={() => setPickTimeOpen(false)}
        onSelect={setCheckInTime}
        theme={theme}
        title="Check-in Time"
        value={checkInTime}
        visible={pickTimeOpen}
      />
    </SafeAreaView>
  );
}
