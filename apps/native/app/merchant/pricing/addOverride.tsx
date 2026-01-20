import { ThemedText } from "@app/components/ThemedText";
import { Colors } from "@app/constants/Colors";
import { pricingService } from "@app/services/merchant/pricing";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from "react-native";
import { Calendar, type DateData } from "react-native-calendars";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

type OverrideType = "day" | "date";
type HourlyTier = {
  hours: number;
  price: number;
};

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

// Generate time options in HH:mm format
const ALL_TIMES_24H = (() => {
  const out: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const hh = h.toString().padStart(2, "0");
      const mm = m.toString().padStart(2, "0");
      out.push(`${hh}:${mm}`);
    }
  }
  return out;
})();

// Convert 24h time to 12h display format
const formatTime12h = (time24h: string): string => {
  const [hours, minutes] = time24h.split(":").map(Number);
  const hh = ((hours + 11) % 12) + 1;
  const mm = minutes.toString().padStart(2, "0");
  const ampm = hours < 12 ? "AM" : "PM";
  return `${hh}:${mm} ${ampm}`;
};

const withAlpha = (hex: string, a: number) =>
  `${hex}${Math.round(Math.min(1, Math.max(0, a)) * 255)
    .toString(16)
    .padStart(2, "0")}`;

export default function AddPricingOverrideScreen() {
  const { colorScheme } = useColorScheme();
  const palette = Colors[colorScheme === "dark" ? "dark" : "light"];
  const inset = useSafeAreaInsets();
  const router = useRouter();
  const { roomId, overrideId } = useLocalSearchParams<{
    roomId: string;
    overrideId?: string;
  }>();
  const [loading, setLoading] = useState(!!overrideId);

  const [overrideType, setOverrideType] = useState<OverrideType>("day");
  const [saving, setSaving] = useState(false);

  // Day type fields
  const [startDayOfWeek, setStartDayOfWeek] = useState<number>(5); // Friday
  const [startTime, setStartTime] = useState("17:30");
  const [endDayOfWeek, setEndDayOfWeek] = useState<number>(1); // Monday
  const [endTime, setEndTime] = useState("01:00");
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  // Date type fields
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  // Pricing fields (optional - uses room default if not set)
  const [hourlyTiers, setHourlyTiers] = useState<HourlyTier[]>([]);
  const [newTierHours, setNewTierHours] = useState("");
  const [newTierPrice, setNewTierPrice] = useState("");
  const [extraPersonChargePerHour, setExtraPersonChargePerHour] = useState("");

  const addTier = () => {
    const hours = Number.parseFloat(newTierHours);
    const price = Number.parseFloat(newTierPrice);

    if (hours > 0 && price >= 0) {
      const existingIndex = hourlyTiers.findIndex((t) => t.hours === hours);
      if (existingIndex >= 0) {
        const updated = [...hourlyTiers];
        updated[existingIndex] = { hours, price };
        setHourlyTiers(updated);
      } else {
        const updated = [...hourlyTiers, { hours, price }].sort(
          (a, b) => a.hours - b.hours
        );
        setHourlyTiers(updated);
      }
      setNewTierHours("");
      setNewTierPrice("");
    }
  };

  const removeTier = (index: number) => {
    setHourlyTiers(hourlyTiers.filter((_, i) => i !== index));
  };

  const formatDate = (date: Date | null): string => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatDateDisplay = (date: Date | null): string => {
    if (!date) return "";
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Load override data when editing
  useEffect(() => {
    if (overrideId && roomId) {
      const loadOverride = async () => {
        try {
          setLoading(true);
          const response = await pricingService.getPricingOverrides(roomId);
          const override = response.overrides?.find((o) => o.id === overrideId);
          if (override) {
            setOverrideType(override.type);
            if (override.type === "day") {
              setStartDayOfWeek(override.startDayOfWeek ?? 5);
              setStartTime(override.startTime ?? "17:30");
              setEndDayOfWeek(override.endDayOfWeek ?? 1);
              setEndTime(override.endTime ?? "01:00");
            } else {
              if (override.startDate) {
                setStartDate(new Date(override.startDate));
              }
              if (override.endDate) {
                setEndDate(new Date(override.endDate));
              }
            }
            if (override.hourlyTiers) {
              setHourlyTiers(override.hourlyTiers);
            }
            if (override.extraPersonChargePerHour) {
              setExtraPersonChargePerHour(override.extraPersonChargePerHour);
            }
          }
        } catch (error) {
          console.error("Failed to load override:", error);
          Alert.alert("Error", "Failed to load override data");
        } finally {
          setLoading(false);
        }
      };
      loadOverride();
    }
  }, [overrideId, roomId]);

  const validate = (): { ok: boolean; msg?: string } => {
    if (overrideType === "day") {
      if (
        startDayOfWeek === null ||
        startTime === "" ||
        endDayOfWeek === null ||
        endTime === ""
      ) {
        return { ok: false, msg: "Please fill in all day and time fields" };
      }
    } else {
      if (!(startDate && endDate)) {
        return { ok: false, msg: "Please select start and end dates" };
      }
      if (startDate > endDate) {
        return { ok: false, msg: "End date must be after start date" };
      }
    }

    // Note: Pricing fields are optional - if not provided, room default will be used

    return { ok: true };
  };

  const handleSave = async () => {
    const validation = validate();
    if (!validation.ok) {
      Alert.alert("Validation Error", validation.msg);
      return;
    }

    if (!roomId) {
      Alert.alert("Error", "Room ID is required");
      return;
    }

    try {
      setSaving(true);

      const payload: Parameters<
        typeof pricingService.createPricingOverride
      >[0] = {
        roomId,
        type: overrideType,
        ...(overrideType === "day"
          ? {
              startDayOfWeek,
              startTime,
              endDayOfWeek,
              endTime,
            }
          : {
              startDate: formatDate(startDate),
              endDate: formatDate(endDate),
            }),
        // Pricing fields are optional - if not provided, room default will be used
        ...(hourlyTiers.length > 0
          ? {
              hourlyTiers,
              extraPersonChargePerHour:
                extraPersonChargePerHour &&
                Number.parseFloat(extraPersonChargePerHour) > 0
                  ? Number.parseFloat(extraPersonChargePerHour)
                  : undefined,
            }
          : {
              extraPersonChargePerHour:
                extraPersonChargePerHour &&
                Number.parseFloat(extraPersonChargePerHour) > 0
                  ? Number.parseFloat(extraPersonChargePerHour)
                  : undefined,
            }),
      };

      if (overrideId) {
        await pricingService.updatePricingOverride(overrideId, payload);
      } else {
        await pricingService.createPricingOverride(payload);
      }
      router.back();
    } catch (error) {
      console.error("Failed to save pricing override:", error);
      Alert.alert(
        "Error",
        error instanceof Error
          ? error.message
          : "Failed to save pricing override"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView
        className="flex-1"
        style={{ backgroundColor: palette.background }}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ActivityIndicator color={palette.tint} size="large" />
          <ThemedText style={{ marginTop: 16, color: palette.icon }}>
            Loading override...
          </ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: palette.background }}
    >
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: "padding" })}
        className="flex-1"
      >
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingTop: inset.top,
            paddingBottom: 12,
            borderBottomWidth: 1,
            borderBottomColor: palette.border,
          }}
        >
          <Pressable
            hitSlop={10}
            onPress={() => router.back()}
            style={{ marginRight: 12 }}
          >
            <Ionicons color={palette.text} name="chevron-back" size={24} />
          </Pressable>
          <ThemedText style={{ fontSize: 18, fontWeight: "600", flex: 1 }}>
            {overrideId ? "Edit Special Pricing" : "Add Special Pricing"}
          </ThemedText>
          <Pressable
            disabled={saving}
            onPress={handleSave}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 8,
              backgroundColor: palette.tint,
              opacity: saving ? 0.5 : 1,
            }}
          >
            {saving ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <ThemedText style={{ color: "#fff", fontWeight: "600" }}>
                Save
              </ThemedText>
            )}
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={{
            padding: 16,
            paddingBottom: Math.max(inset.bottom, 24),
          }}
        >
          {/* Override Type Selection */}
          <View
            style={{
              marginBottom: 24,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: palette.border,
              backgroundColor: palette.surface,
              overflow: "hidden",
            }}
          >
            <View
              style={{
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderBottomColor: palette.border,
              }}
            >
              <ThemedText style={{ fontSize: 16, fontWeight: "700" }}>
                Override Type
              </ThemedText>
            </View>

            <Pressable
              onPress={() => setOverrideType("day")}
              style={{
                flexDirection: "row",
                alignItems: "center",
                padding: 16,
                borderBottomWidth: 1,
                borderBottomColor: palette.border,
                backgroundColor:
                  overrideType === "day" ? `${palette.tint}10` : "transparent",
              }}
            >
              <View
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  borderWidth: 2,
                  borderColor:
                    overrideType === "day" ? palette.tint : palette.border,
                  backgroundColor:
                    overrideType === "day" ? palette.tint : "transparent",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 12,
                }}
              >
                {overrideType === "day" && (
                  <View
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: 6,
                      backgroundColor: "#fff",
                    }}
                  />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText style={{ fontSize: 15, fontWeight: "600" }}>
                  Recurring (Weekly)
                </ThemedText>
                <ThemedText
                  style={{ fontSize: 13, color: palette.icon, marginTop: 2 }}
                >
                  e.g., Friday 5:30 PM - Monday 1 AM
                </ThemedText>
              </View>
            </Pressable>

            <Pressable
              onPress={() => setOverrideType("date")}
              style={{
                flexDirection: "row",
                alignItems: "center",
                padding: 16,
                backgroundColor:
                  overrideType === "date" ? `${palette.tint}10` : "transparent",
              }}
            >
              <View
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  borderWidth: 2,
                  borderColor:
                    overrideType === "date" ? palette.tint : palette.border,
                  backgroundColor:
                    overrideType === "date" ? palette.tint : "transparent",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 12,
                }}
              >
                {overrideType === "date" && (
                  <View
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: 6,
                      backgroundColor: "#fff",
                    }}
                  />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText style={{ fontSize: 15, fontWeight: "600" }}>
                  Date Range
                </ThemedText>
                <ThemedText
                  style={{ fontSize: 13, color: palette.icon, marginTop: 2 }}
                >
                  e.g., Dec 23 - Dec 26
                </ThemedText>
              </View>
            </Pressable>
          </View>

          {/* Day Type Fields */}
          {overrideType === "day" && (
            <View
              style={{
                marginBottom: 24,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: palette.border,
                backgroundColor: palette.surface,
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: palette.border,
                }}
              >
                <ThemedText style={{ fontSize: 16, fontWeight: "700" }}>
                  Day & Time Range
                </ThemedText>
              </View>

              <View style={{ padding: 16, gap: 16 }}>
                {/* Start Day */}
                <View>
                  <ThemedText
                    style={{
                      fontSize: 14,
                      marginBottom: 8,
                      color: palette.icon,
                    }}
                  >
                    Start Day *
                  </ThemedText>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={{ flexDirection: "row", gap: 8 }}>
                      {DAY_NAMES.map((day, index) => (
                        <Pressable
                          key={`start-day-${day}`}
                          onPress={() => setStartDayOfWeek(index)}
                          style={{
                            paddingHorizontal: 16,
                            paddingVertical: 10,
                            borderRadius: 8,
                            borderWidth: 1,
                            borderColor:
                              startDayOfWeek === index
                                ? palette.tint
                                : palette.border,
                            backgroundColor:
                              startDayOfWeek === index
                                ? `${palette.tint}15`
                                : palette.background,
                          }}
                        >
                          <ThemedText
                            style={{
                              fontSize: 14,
                              fontWeight:
                                startDayOfWeek === index ? "600" : "400",
                              color:
                                startDayOfWeek === index
                                  ? palette.tint
                                  : palette.text,
                            }}
                          >
                            {day.slice(0, 3)}
                          </ThemedText>
                        </Pressable>
                      ))}
                    </View>
                  </ScrollView>
                </View>

                {/* Start Time */}
                <View>
                  <ThemedText
                    style={{
                      fontSize: 14,
                      marginBottom: 8,
                      color: palette.icon,
                    }}
                  >
                    Start Time *
                  </ThemedText>
                  <Pressable
                    onPress={() => setShowStartTimePicker(true)}
                    style={{
                      borderWidth: 1,
                      borderColor: palette.border,
                      borderRadius: 8,
                      paddingHorizontal: 12,
                      paddingVertical: 12,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <ThemedText
                      style={{
                        color: startTime ? palette.text : palette.icon,
                        fontSize: 16,
                      }}
                    >
                      {startTime
                        ? formatTime12h(startTime)
                        : "Select start time"}
                    </ThemedText>
                    <Ionicons
                      color={palette.icon}
                      name="time-outline"
                      size={20}
                    />
                  </Pressable>
                </View>

                {/* End Day */}
                <View>
                  <ThemedText
                    style={{
                      fontSize: 14,
                      marginBottom: 8,
                      color: palette.icon,
                    }}
                  >
                    End Day *
                  </ThemedText>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={{ flexDirection: "row", gap: 8 }}>
                      {DAY_NAMES.map((day, index) => (
                        <Pressable
                          key={`end-day-${day}`}
                          onPress={() => setEndDayOfWeek(index)}
                          style={{
                            paddingHorizontal: 16,
                            paddingVertical: 10,
                            borderRadius: 8,
                            borderWidth: 1,
                            borderColor:
                              endDayOfWeek === index
                                ? palette.tint
                                : palette.border,
                            backgroundColor:
                              endDayOfWeek === index
                                ? `${palette.tint}15`
                                : palette.background,
                          }}
                        >
                          <ThemedText
                            style={{
                              fontSize: 14,
                              fontWeight:
                                endDayOfWeek === index ? "600" : "400",
                              color:
                                endDayOfWeek === index
                                  ? palette.tint
                                  : palette.text,
                            }}
                          >
                            {day.slice(0, 3)}
                          </ThemedText>
                        </Pressable>
                      ))}
                    </View>
                  </ScrollView>
                </View>

                {/* End Time */}
                <View>
                  <ThemedText
                    style={{
                      fontSize: 14,
                      marginBottom: 8,
                      color: palette.icon,
                    }}
                  >
                    End Time *
                  </ThemedText>
                  <Pressable
                    onPress={() => setShowEndTimePicker(true)}
                    style={{
                      borderWidth: 1,
                      borderColor: palette.border,
                      borderRadius: 8,
                      paddingHorizontal: 12,
                      paddingVertical: 12,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <ThemedText
                      style={{
                        color: endTime ? palette.text : palette.icon,
                        fontSize: 16,
                      }}
                    >
                      {endTime ? formatTime12h(endTime) : "Select end time"}
                    </ThemedText>
                    <Ionicons
                      color={palette.icon}
                      name="time-outline"
                      size={20}
                    />
                  </Pressable>
                </View>
              </View>
            </View>
          )}

          {/* Date Type Fields */}
          {overrideType === "date" && (
            <View
              style={{
                marginBottom: 24,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: palette.border,
                backgroundColor: palette.surface,
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: palette.border,
                }}
              >
                <ThemedText style={{ fontSize: 16, fontWeight: "700" }}>
                  Date Range
                </ThemedText>
              </View>

              <View style={{ padding: 16, gap: 16 }}>
                {/* Start Date */}
                <View>
                  <ThemedText
                    style={{
                      fontSize: 14,
                      marginBottom: 8,
                      color: palette.icon,
                    }}
                  >
                    Start Date *
                  </ThemedText>
                  <Pressable
                    onPress={() => setShowStartDatePicker(true)}
                    style={{
                      borderWidth: 1,
                      borderColor: palette.border,
                      borderRadius: 8,
                      paddingHorizontal: 12,
                      paddingVertical: 12,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <ThemedText
                      style={{
                        color: startDate ? palette.text : palette.icon,
                        fontSize: 16,
                      }}
                    >
                      {startDate
                        ? formatDateDisplay(startDate)
                        : "Select start date"}
                    </ThemedText>
                    <Ionicons
                      color={palette.icon}
                      name="calendar-outline"
                      size={20}
                    />
                  </Pressable>
                </View>

                {/* End Date */}
                <View>
                  <ThemedText
                    style={{
                      fontSize: 14,
                      marginBottom: 8,
                      color: palette.icon,
                    }}
                  >
                    End Date *
                  </ThemedText>
                  <Pressable
                    onPress={() => setShowEndDatePicker(true)}
                    style={{
                      borderWidth: 1,
                      borderColor: palette.border,
                      borderRadius: 8,
                      paddingHorizontal: 12,
                      paddingVertical: 12,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <ThemedText
                      style={{
                        color: endDate ? palette.text : palette.icon,
                        fontSize: 16,
                      }}
                    >
                      {endDate ? formatDateDisplay(endDate) : "Select end date"}
                    </ThemedText>
                    <Ionicons
                      color={palette.icon}
                      name="calendar-outline"
                      size={20}
                    />
                  </Pressable>
                </View>
              </View>
            </View>
          )}

          {/* Pricing Override Fields */}
          <View
            style={{
              marginBottom: 24,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: palette.border,
              backgroundColor: palette.surface,
              overflow: "hidden",
            }}
          >
            <View
              style={{
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderBottomColor: palette.border,
              }}
            >
              <ThemedText style={{ fontSize: 16, fontWeight: "700" }}>
                Pricing Override
              </ThemedText>
              <ThemedText
                style={{ fontSize: 13, color: palette.icon, marginTop: 4 }}
              >
                Leave empty to use room's default pricing
              </ThemedText>
            </View>

            <View style={{ padding: 16, gap: 16 }}>
              {/* Hourly Tiers */}
              <View>
                <ThemedText
                  style={{ fontSize: 14, marginBottom: 8, color: palette.icon }}
                >
                  Hourly Tiers
                </ThemedText>

                {hourlyTiers.length > 0 && (
                  <View style={{ marginBottom: 12, gap: 8 }}>
                    {hourlyTiers.map((tier, index) => (
                      <View
                        key={`${tier.hours}-${tier.price}-${index}`}
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: 12,
                          borderWidth: 1,
                          borderColor: palette.border,
                          borderRadius: 8,
                        }}
                      >
                        <ThemedText>
                          {tier.hours} {tier.hours === 1 ? "hour" : "hours"}: $
                          {tier.price}
                        </ThemedText>
                        <Pressable onPress={() => removeTier(index)}>
                          <Ionicons
                            color={palette.icon}
                            name="close"
                            size={20}
                          />
                        </Pressable>
                      </View>
                    ))}
                  </View>
                )}

                <View style={{ flexDirection: "row", gap: 8 }}>
                  <View
                    style={{
                      flex: 1,
                      borderWidth: 1,
                      borderColor: palette.border,
                      borderRadius: 8,
                      paddingHorizontal: 12,
                      paddingVertical: 12,
                    }}
                  >
                    <TextInput
                      keyboardType="decimal-pad"
                      onChangeText={setNewTierHours}
                      placeholder="Hours"
                      placeholderTextColor={palette.icon}
                      style={{ color: palette.text, fontSize: 16 }}
                      value={newTierHours}
                    />
                  </View>
                  <View
                    style={{
                      flex: 1,
                      borderWidth: 1,
                      borderColor: palette.border,
                      borderRadius: 8,
                      paddingHorizontal: 12,
                      paddingVertical: 12,
                    }}
                  >
                    <TextInput
                      keyboardType="decimal-pad"
                      onChangeText={setNewTierPrice}
                      placeholder="Price"
                      placeholderTextColor={palette.icon}
                      style={{ color: palette.text, fontSize: 16 }}
                      value={newTierPrice}
                    />
                  </View>
                  <Pressable
                    onPress={addTier}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      borderRadius: 8,
                      backgroundColor: palette.tint,
                    }}
                  >
                    <ThemedText style={{ color: "#fff", fontWeight: "600" }}>
                      Add
                    </ThemedText>
                  </Pressable>
                </View>
              </View>

              {/* Extra Person Charge */}
              <View>
                <ThemedText
                  style={{ fontSize: 14, marginBottom: 8, color: palette.icon }}
                >
                  Extra Person Charge Per Hour
                </ThemedText>
                <View
                  style={{
                    borderWidth: 1,
                    borderColor: palette.border,
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    paddingVertical: 12,
                  }}
                >
                  <TextInput
                    keyboardType="decimal-pad"
                    onChangeText={setExtraPersonChargePerHour}
                    placeholder="0.00"
                    placeholderTextColor={palette.icon}
                    style={{ color: palette.text, fontSize: 16 }}
                    value={extraPersonChargePerHour}
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Info Message */}
          <View
            style={{
              padding: 16,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: palette.tint,
              backgroundColor:
                colorScheme === "dark"
                  ? "rgba(149,198,226,0.14)"
                  : "rgba(10,126,164,0.12)",
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "flex-start", gap: 8 }}
            >
              <Ionicons
                color={palette.tint}
                name="information-circle"
                size={20}
              />
              <View style={{ flex: 1 }}>
                <ThemedText style={{ fontSize: 13, color: palette.text }}>
                  Pricing overrides allow you to set different rates for
                  specific periods. If pricing fields are left empty, the room's
                  default pricing will be used.
                </ThemedText>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Start Date Picker Modal */}
        <Modal
          animationType="slide"
          onRequestClose={() => setShowStartDatePicker(false)}
          transparent
          visible={showStartDatePicker}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.5)",
              justifyContent: "flex-end",
            }}
          >
            <View
              style={{
                backgroundColor: palette.background,
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                paddingTop: inset.top,
                paddingBottom: inset.bottom,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: palette.border,
                }}
              >
                <ThemedText style={{ fontSize: 18, fontWeight: "600" }}>
                  Select Start Date
                </ThemedText>
                <Pressable
                  hitSlop={10}
                  onPress={() => setShowStartDatePicker(false)}
                >
                  <Ionicons color={palette.text} name="close" size={24} />
                </Pressable>
              </View>
              <Calendar
                markedDates={
                  startDate
                    ? {
                        [formatDate(startDate)]: {
                          selected: true,
                          selectedColor: palette.tint,
                          selectedTextColor: "#fff",
                        },
                      }
                    : {}
                }
                minDate={new Date().toISOString().split("T")[0]}
                onDayPress={(day: DateData) => {
                  const selectedDate = new Date(
                    day.year,
                    day.month - 1,
                    day.day
                  );
                  setStartDate(selectedDate);
                  setShowStartDatePicker(false);
                }}
                theme={{
                  backgroundColor: palette.background,
                  calendarBackground: palette.background,
                  textSectionTitleColor: palette.text,
                  selectedDayBackgroundColor: palette.tint,
                  selectedDayTextColor: "#fff",
                  todayTextColor: palette.tint,
                  dayTextColor: palette.text,
                  textDisabledColor: palette.icon,
                  dotColor: palette.tint,
                  selectedDotColor: "#fff",
                  arrowColor: palette.tint,
                  monthTextColor: palette.text,
                  indicatorColor: palette.tint,
                  textDayFontWeight: "400",
                  textMonthFontWeight: "600",
                  textDayHeaderFontWeight: "600",
                  textDayFontSize: 16,
                  textMonthFontSize: 16,
                  textDayHeaderFontSize: 13,
                }}
              />
            </View>
          </View>
        </Modal>

        {/* End Date Picker Modal */}
        <Modal
          animationType="slide"
          onRequestClose={() => setShowEndDatePicker(false)}
          transparent
          visible={showEndDatePicker}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.5)",
              justifyContent: "flex-end",
            }}
          >
            <View
              style={{
                backgroundColor: palette.background,
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                paddingTop: inset.top,
                paddingBottom: inset.bottom,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: palette.border,
                }}
              >
                <ThemedText style={{ fontSize: 18, fontWeight: "600" }}>
                  Select End Date
                </ThemedText>
                <Pressable
                  hitSlop={10}
                  onPress={() => setShowEndDatePicker(false)}
                >
                  <Ionicons color={palette.text} name="close" size={24} />
                </Pressable>
              </View>
              <Calendar
                markedDates={
                  endDate
                    ? {
                        [formatDate(endDate)]: {
                          selected: true,
                          selectedColor: palette.tint,
                          selectedTextColor: "#fff",
                        },
                      }
                    : {}
                }
                minDate={
                  startDate
                    ? formatDate(startDate)
                    : new Date().toISOString().split("T")[0]
                }
                onDayPress={(day: DateData) => {
                  const selectedDate = new Date(
                    day.year,
                    day.month - 1,
                    day.day
                  );
                  setEndDate(selectedDate);
                  setShowEndDatePicker(false);
                }}
                theme={{
                  backgroundColor: palette.background,
                  calendarBackground: palette.background,
                  textSectionTitleColor: palette.text,
                  selectedDayBackgroundColor: palette.tint,
                  selectedDayTextColor: "#fff",
                  todayTextColor: palette.tint,
                  dayTextColor: palette.text,
                  textDisabledColor: palette.icon,
                  dotColor: palette.tint,
                  selectedDotColor: "#fff",
                  arrowColor: palette.tint,
                  monthTextColor: palette.text,
                  indicatorColor: palette.tint,
                  textDayFontWeight: "400",
                  textMonthFontWeight: "600",
                  textDayHeaderFontWeight: "600",
                  textDayFontSize: 16,
                  textMonthFontSize: 16,
                  textDayHeaderFontSize: 13,
                }}
              />
            </View>
          </View>
        </Modal>

        {/* Start Time Picker Modal */}
        <Modal
          animationType="slide"
          onRequestClose={() => setShowStartTimePicker(false)}
          transparent
          visible={showStartTimePicker}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.5)",
              justifyContent: "flex-end",
            }}
          >
            <View
              style={{
                backgroundColor: palette.background,
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                paddingTop: inset.top,
                paddingBottom: inset.bottom,
                maxHeight: "70%",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: palette.border,
                }}
              >
                <ThemedText style={{ fontSize: 18, fontWeight: "600" }}>
                  Select Start Time
                </ThemedText>
                <Pressable
                  hitSlop={10}
                  onPress={() => setShowStartTimePicker(false)}
                >
                  <Ionicons color={palette.text} name="close" size={24} />
                </Pressable>
              </View>
              <FlatList
                data={ALL_TIMES_24H}
                getItemLayout={(_, index) => ({
                  length: 44,
                  offset: 44 * index,
                  index,
                })}
                initialScrollIndex={Math.max(
                  0,
                  Math.min(
                    ALL_TIMES_24H.length - 1,
                    ALL_TIMES_24H.indexOf(startTime)
                  )
                )}
                keyExtractor={(t) => `time-start-${t}`}
                renderItem={({ item }) => {
                  const selected = item === startTime;
                  return (
                    <Pressable
                      onPress={() => {
                        setStartTime(item);
                        setShowStartTimePicker(false);
                      }}
                      style={{
                        height: 44,
                        alignItems: "flex-start",
                        justifyContent: "center",
                        paddingHorizontal: 16,
                        backgroundColor: selected
                          ? withAlpha(palette.tint, 0.08)
                          : "transparent",
                      }}
                    >
                      <ThemedText
                        style={{
                          fontWeight: selected ? "600" : "400",
                          color: selected ? palette.tint : palette.text,
                        }}
                      >
                        {formatTime12h(item)}
                      </ThemedText>
                    </Pressable>
                  );
                }}
              />
            </View>
          </View>
        </Modal>

        {/* End Time Picker Modal */}
        <Modal
          animationType="slide"
          onRequestClose={() => setShowEndTimePicker(false)}
          transparent
          visible={showEndTimePicker}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.5)",
              justifyContent: "flex-end",
            }}
          >
            <View
              style={{
                backgroundColor: palette.background,
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                paddingTop: inset.top,
                paddingBottom: inset.bottom,
                maxHeight: "70%",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: palette.border,
                }}
              >
                <ThemedText style={{ fontSize: 18, fontWeight: "600" }}>
                  Select End Time
                </ThemedText>
                <Pressable
                  hitSlop={10}
                  onPress={() => setShowEndTimePicker(false)}
                >
                  <Ionicons color={palette.text} name="close" size={24} />
                </Pressable>
              </View>
              <FlatList
                data={ALL_TIMES_24H}
                getItemLayout={(_, index) => ({
                  length: 44,
                  offset: 44 * index,
                  index,
                })}
                initialScrollIndex={Math.max(
                  0,
                  Math.min(
                    ALL_TIMES_24H.length - 1,
                    ALL_TIMES_24H.indexOf(endTime)
                  )
                )}
                keyExtractor={(t) => `time-end-${t}`}
                renderItem={({ item }) => {
                  const selected = item === endTime;
                  return (
                    <Pressable
                      onPress={() => {
                        setEndTime(item);
                        setShowEndTimePicker(false);
                      }}
                      style={{
                        height: 44,
                        alignItems: "flex-start",
                        justifyContent: "center",
                        paddingHorizontal: 16,
                        backgroundColor: selected
                          ? withAlpha(palette.tint, 0.08)
                          : "transparent",
                      }}
                    >
                      <ThemedText
                        style={{
                          fontWeight: selected ? "600" : "400",
                          color: selected ? palette.tint : palette.text,
                        }}
                      >
                        {formatTime12h(item)}
                      </ThemedText>
                    </Pressable>
                  );
                }}
              />
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
