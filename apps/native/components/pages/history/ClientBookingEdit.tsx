import { Button } from "@app/components/ui/button";
import { Heading } from "@app/components/ui/heading";
import { HStack } from "@app/components/ui/hstack";
import { Text } from "@app/components/ui/text";
import { VStack } from "@app/components/ui/vstack";
import { Colors } from "@app/constants/Colors";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useColorScheme } from "nativewind";
import type React from "react";
import { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/* ---- Types ---- */
export type ClientBookingEditData = {
  bookingId: string;
  current: {
    dateRangeText: string;
    timeRangeText: string;
    people: number;
    baseHours: number;
  };
  limits: {
    availableExtraHours: number;
    peopleMin: number;
    peopleMax: number;
  };
  pricing: {
    hourlyRateHKD: number;
    currencySuffix: string;
    extraPersonPerDayHKD: number;
  };
};

export type ClientBookingEditConfirmPayload = {
  bookingId: string;
  newPeople: number;
  addHours: number;
  newTotalHours: number;
  priceHKD: number;
  extraPersonCostHKD: number;
};

export type ClientBookingEditProps = {
  data: ClientBookingEditData;
  onConfirm: (payload: ClientBookingEditConfirmPayload) => void;
  onCancel: () => void;
};

/* ---- Helpers ---- */
const withAlpha = (hex: string, alpha: number) => {
  const h = (hex ?? "").trim().toLowerCase();
  const norm = /^#([0-9a-f]{6})$/.test(h)
    ? h
    : /^#([0-9a-f]{3})$/.test(h)
      ? `#${h[1]}${h[1]}${h[2]}${h[2]}${h[3]}${h[3]}`
      : "#000000";
  const a = Math.round(Math.min(1, Math.max(0, alpha)) * 255);
  const aa = a.toString(16).padStart(2, "0");
  return `${norm}${aa}`;
};

const Divider = ({ color }: { color: string }) => (
  <View style={{ height: 1, backgroundColor: color, marginVertical: 12 }} />
);

/* ---- Themed subcomponents ---- */
const Chip: React.FC<{
  label: string;
  active?: boolean;
  onPress?: () => void;
  primary: string;
  text: string;
  border: string;
}> = ({ label, active, onPress, primary, text, border }) => (
  <TouchableOpacity
    className="mr-2 mb-2 h-9 items-center justify-center rounded-full px-3"
    onPress={onPress}
    style={{
      backgroundColor: active ? primary : "transparent",
      borderWidth: 1,
      borderColor: active ? primary : border,
    }}
  >
    <Text
      style={{
        color: active ? "#ffffff" : text,
        fontWeight: active ? "700" : "500",
      }}
    >
      {label}
    </Text>
  </TouchableOpacity>
);

const Stepper: React.FC<{
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
  primary: string;
  text: string;
}> = ({ value, min, max, onChange, primary, text }) => {
  const dec = () => onChange(Math.max(min, value - 1));
  const inc = () => onChange(Math.min(max, value + 1));
  return (
    <HStack className="items-center">
      <TouchableOpacity
        className="mr-3 h-10 w-10 items-center justify-center rounded-full"
        onPress={dec}
        style={{ borderColor: primary, borderWidth: 1 }}
      >
        <MaterialIcons color={primary} name="remove" size={20} />
      </TouchableOpacity>
      <Text className="text-xl" style={{ color: text }}>
        {value}
      </Text>
      <TouchableOpacity
        className="ml-3 h-10 w-10 items-center justify-center rounded-full"
        onPress={inc}
        style={{ backgroundColor: primary }}
      >
        <MaterialIcons color="#fff" name="add" size={20} />
      </TouchableOpacity>
    </HStack>
  );
};

/* ---- Component ---- */
export default function ClientBookingEdit({
  data,
  onConfirm,
  onCancel,
}: ClientBookingEditProps) {
  const { colorScheme } = useColorScheme();
  const palette = Colors[colorScheme ?? "light"];
  const isDark = colorScheme === "dark";

  // Core tokens
  const bg = palette.background;
  const text = palette.text;
  const icon = palette.icon;
  const _tint = palette.tint;
  const border =
    (palette as any).border ??
    (isDark ? withAlpha("#fff", 0.16) : withAlpha("#000", 0.12));
  const surface =
    (palette as any).surface ??
    (isDark ? withAlpha("#fff", 0.04) : withAlpha("#000", 0.02));

  // ✅ Primary action color (from screenshot) or theme token if present
  const primary =
    (palette as any).primaryButton /* optional token */ ?? "#3F6D85";

  const [addHours, setAddHours] = useState<number>(0);
  const [people, setPeople] = useState<number>(data.current.people);
  const [customHours, setCustomHours] = useState<string>("");

  const parsedCustom = useMemo(() => {
    const n = Number(customHours.replace(/[^\d]/g, ""));
    if (Number.isNaN(n)) {
      return 0;
    }
    return Math.max(0, Math.min(n, data.limits.availableExtraHours));
  }, [customHours, data.limits.availableExtraHours]);

  const hours = addHours;
  const totalHours = data.current.baseHours + hours;

  // ---- Price math ----
  const basePrice = data.current.baseHours * data.pricing.hourlyRateHKD;
  const extraHoursPrice = hours * data.pricing.hourlyRateHKD;
  const days = Math.max(1, Math.ceil(totalHours / 24));
  const extraPersons = Math.max(0, people - data.current.people);
  const extraPersonCost =
    extraPersons * data.pricing.extraPersonPerDayHKD * days;
  const totalPrice = basePrice + extraHoursPrice + extraPersonCost;

  const canConfirm =
    hours >= 0 &&
    hours <= data.limits.availableExtraHours &&
    people >= data.limits.peopleMin &&
    people <= data.limits.peopleMax;

  const applyCustomHours = () => setAddHours(parsedCustom);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === "ios" ? 84 : 0}
      >
        {/* Header */}
        <HStack
          className="items-center px-4 py-3"
          style={{ borderBottomWidth: 1, borderBottomColor: border }}
        >
          <Heading size="xl" style={{ color: text }}>
            Edit Booking
          </Heading>
        </HStack>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 140 }}
        >
          <VStack className="px-4 py-4" space="lg">
            {/* Current Booking */}
            <VStack space="xs">
              <Text bold className="text-lg" style={{ color: text }}>
                Current Booking
              </Text>
              <Text style={{ color: icon }}>
                Date: {data.current.dateRangeText}
              </Text>
              <Text style={{ color: icon }}>
                Time: {data.current.timeRangeText}
              </Text>
              <Text style={{ color: icon }}>
                Number of people: {data.current.people}
              </Text>
            </VStack>

            <Divider color={border} />

            {/* Add Hours */}
            <VStack space="xs">
              <Text bold className="text-lg" style={{ color: text }}>
                Add Hours
              </Text>
              <Text style={{ color: icon }}>
                Available Additional Hours: {data.limits.availableExtraHours}{" "}
                Hours
              </Text>

              <HStack className="mt-2 flex-wrap">
                {[0, 1, 2, 4, 6, 8]
                  .filter((h) => h <= data.limits.availableExtraHours)
                  .map((h) => (
                    <Chip
                      active={addHours === h}
                      border={border}
                      key={h}
                      label={`${h}h`}
                      onPress={() => setAddHours(h)}
                      primary={primary}
                      text={text}
                    />
                  ))}
              </HStack>

              <HStack className="mt-2 items-end">
                <VStack className="flex-1" space="xs">
                  <Text style={{ color: icon }}>Additional Hours:</Text>
                  <HStack className="items-center">
                    <TextInput
                      className="flex-1 rounded-xl px-3 py-2"
                      keyboardType="number-pad"
                      onChangeText={setCustomHours}
                      placeholder="Enter: e.g. 4"
                      placeholderTextColor={withAlpha(icon, 0.6)}
                      style={{
                        borderWidth: 1,
                        borderColor: border,
                        color: text,
                        backgroundColor: surface,
                      }}
                      value={customHours}
                    />
                    <TouchableOpacity
                      className="ml-2 h-10 items-center justify-center rounded-xl px-3"
                      onPress={applyCustomHours}
                      style={{ backgroundColor: primary }}
                    >
                      <Text className="text-white">Select</Text>
                    </TouchableOpacity>
                  </HStack>
                  <Text style={{ color: icon }}>
                    Enter: {parsedCustom} Hours
                  </Text>
                </VStack>
              </HStack>
            </VStack>

            <Divider color={border} />

            {/* Number of People */}
            <VStack space="xs">
              <Text bold className="text-lg" style={{ color: text }}>
                Number of People
              </Text>
              <Stepper
                max={data.limits.peopleMax}
                min={data.limits.peopleMin}
                onChange={setPeople}
                primary={primary}
                text={text}
                value={people}
              />
            </VStack>

            <Divider color={border} />

            {/* Payment details */}
            <VStack space="sm">
              <Text bold className="text-lg" style={{ color: text }}>
                Payment details
              </Text>

              <HStack className="justify-between">
                <Text style={{ color: icon }}>Room Price</Text>
                <Text style={{ color: icon }}>
                  ${totalPrice}
                  {data.pricing.currencySuffix}
                </Text>
              </HStack>

              <VStack className="mt-1" space="xs">
                <HStack className="justify-between">
                  <Text style={{ color: icon }}>
                    Base hours: {data.pricing.hourlyRateHKD} ×{" "}
                    {data.current.baseHours}h
                  </Text>
                  <Text style={{ color: icon }}>
                    ${basePrice}
                    {data.pricing.currencySuffix}
                  </Text>
                </HStack>

                <HStack className="justify-between">
                  <Text style={{ color: icon }}>
                    Extra hours: {data.pricing.hourlyRateHKD} × {hours}h
                  </Text>
                  <Text style={{ color: icon }}>
                    ${extraHoursPrice}
                    {data.pricing.currencySuffix}
                  </Text>
                </HStack>

                {extraPersons > 0 && (
                  <HStack className="justify-between">
                    <Text style={{ color: icon }}>
                      Extra people ({extraPersons}) × $
                      {data.pricing.extraPersonPerDayHKD}
                      {data.pricing.currencySuffix} × {days} day
                      {days > 1 ? "s" : ""}
                    </Text>
                    <Text style={{ color: icon }}>
                      ${extraPersonCost}
                      {data.pricing.currencySuffix}
                    </Text>
                  </HStack>
                )}
              </VStack>
            </VStack>
          </VStack>
        </ScrollView>

        {/* Bottom bar */}
        <View
          className="absolute right-0 bottom-0 left-0 px-4 py-4"
          style={{
            backgroundColor: surface,
            borderTopWidth: 1,
            borderTopColor: border,
          }}
        >
          <HStack className="items-center justify-between">
            <VStack>
              <Text style={{ color: icon }}>New total</Text>
              <Text bold className="text-xl" style={{ color: text }}>
                ${totalPrice}
                {data.pricing.currencySuffix}
              </Text>
            </VStack>

            <HStack space="sm">
              <Button
                className="rounded-full"
                onPress={onCancel}
                style={{ borderColor: primary }}
                variant="outline"
              >
                <Text style={{ color: primary }}>Cancel</Text>
              </Button>

              <Button
                className="rounded-full"
                disabled={!canConfirm}
                onPress={() =>
                  onConfirm({
                    bookingId: data.bookingId,
                    newPeople: people,
                    addHours,
                    newTotalHours: totalHours,
                    priceHKD: totalPrice,
                    extraPersonCostHKD: extraPersonCost,
                  })
                }
                style={{
                  backgroundColor: canConfirm ? primary : withAlpha(text, 0.25),
                }}
              >
                <Text className="font-semibold text-white">Confirm</Text>
              </Button>
            </HStack>
          </HStack>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
