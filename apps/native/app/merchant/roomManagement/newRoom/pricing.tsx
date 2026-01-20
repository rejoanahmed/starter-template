import { Colors } from "@app/constants/Colors";
import { roomDraftAtom } from "@app/lib/atoms/roomDraft";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { useAtom } from "jotai";
import { useColorScheme } from "nativewind";
import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type HourlyTier = {
  hours: number;
  price: number;
};

export default function AddRoomPricing() {
  const { colorScheme } = useColorScheme();
  const palette = Colors[colorScheme === "dark" ? "dark" : "light"];

  // Use Jotai atom
  const [draft, setDraft] = useAtom(roomDraftAtom);

  const [includedGuests, setIncludedGuests] = useState(
    draft.includedGuests?.toString() || "1"
  );
  const [hourlyTiers, setHourlyTiers] = useState<HourlyTier[]>(
    draft.hourlyTiers || []
  );
  const [extraPersonCharge, setExtraPersonCharge] = useState(
    draft.extraPersonChargePerHour?.toString() || "0"
  );

  // Local state for adding new tier
  const [newTierHours, setNewTierHours] = useState("");
  const [newTierPrice, setNewTierPrice] = useState("");

  // Load existing pricing from atom
  useEffect(() => {
    if (draft.includedGuests) {
      setIncludedGuests(draft.includedGuests.toString());
    }
    if (draft.hourlyTiers) {
      setHourlyTiers(draft.hourlyTiers);
    }
    if (draft.extraPersonChargePerHour) {
      setExtraPersonCharge(draft.extraPersonChargePerHour.toString());
    }
  }, [draft]);

  const addTier = () => {
    const hours = Number.parseFloat(newTierHours);
    const price = Number.parseFloat(newTierPrice);

    if (hours > 0 && price >= 0) {
      // Check if tier with same hours already exists
      const existingIndex = hourlyTiers.findIndex((t) => t.hours === hours);
      if (existingIndex >= 0) {
        // Update existing tier
        const updated = [...hourlyTiers];
        updated[existingIndex] = { hours, price };
        setHourlyTiers(updated);
      } else {
        // Add new tier and sort by hours
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

  const canNext =
    Number.parseInt(includedGuests, 10) >= 1 &&
    hourlyTiers.length > 0 &&
    Number.parseFloat(extraPersonCharge) >= 0;

  const goBack = () => {
    router.back();
  };

  const onNext = () => {
    // Update atom with pricing data
    setDraft({
      ...draft,
      includedGuests: Number.parseInt(includedGuests, 10) || 1,
      hourlyTiers,
      extraPersonChargePerHour: Number.parseFloat(extraPersonCharge) || 0,
    });

    console.log("AddRoomPricing - Saved to atom:", {
      includedGuests: Number.parseInt(includedGuests, 10) || 1,
      hourlyTiers,
      extraPersonChargePerHour: Number.parseFloat(extraPersonCharge) || 0,
    });

    // Navigate to photos step
    router.push("/merchant/roomManagement/newRoom/addRoomPhotos");
  };

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: palette.background }}
    >
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: "padding" })}
        className="flex-1"
      >
        <ScrollView
          className="flex-1 px-4"
          contentContainerStyle={{ paddingBottom: 24 }}
        >
          {/* Header */}
          <View className="flex-row items-center gap-2 pt-1 pb-2">
            <Pressable
              accessibilityLabel="Go back"
              accessibilityRole="button"
              className="rounded-full p-1"
              hitSlop={10}
              onPress={goBack}
              style={{
                backgroundColor:
                  colorScheme === "dark"
                    ? "rgba(255,255,255,0.06)"
                    : "rgba(0,0,0,0.04)",
              }}
            >
              <Ionicons color={palette.text} name="chevron-back" size={22} />
            </Pressable>
            <Text
              className="font-semibold text-lg"
              style={{ color: palette.text }}
            >
              Add new room
            </Text>
          </View>

          <Text
            className="mt-2 font-extrabold text-2xl"
            style={{ color: palette.text }}
          >
            Pricing
          </Text>

          {/* Included Guests */}
          <View className="mt-6">
            <Text
              className="mb-2 text-base font-medium"
              style={{ color: palette.text }}
            >
              Included guests *
            </Text>
            <Text className="mb-2 text-xs" style={{ color: palette.icon }}>
              Number of people included in the base price
            </Text>
            <View
              className="rounded-xl border px-4 py-3"
              style={{ borderColor: palette.border }}
            >
              <TextInput
                className="text-base"
                keyboardType="number-pad"
                onChangeText={setIncludedGuests}
                placeholder="1"
                placeholderTextColor={palette.icon}
                style={{ color: palette.text }}
                value={includedGuests}
              />
            </View>
          </View>

          {/* Hourly Tiers */}
          <View className="mt-6">
            <Text
              className="mb-2 text-base font-medium"
              style={{ color: palette.text }}
            >
              Hourly pricing tiers *
            </Text>
            <Text className="mb-2 text-xs" style={{ color: palette.icon }}>
              Set different prices for different booking durations (e.g., 4
              hours = $180, 6 hours = $230)
            </Text>

            {/* Existing tiers */}
            {hourlyTiers.length > 0 && (
              <View className="mb-3 gap-2">
                {hourlyTiers.map((tier, index) => (
                  <View
                    className="flex-row items-center justify-between rounded-xl border p-3"
                    key={`${tier.hours}-${tier.price}-${index}`}
                    style={{ borderColor: palette.border }}
                  >
                    <Text style={{ color: palette.text }}>
                      {tier.hours} {tier.hours === 1 ? "hour" : "hours"}: $
                      {tier.price}
                    </Text>
                    <Pressable
                      className="rounded-full p-1"
                      onPress={() => removeTier(index)}
                    >
                      <Ionicons color={palette.icon} name="close" size={20} />
                    </Pressable>
                  </View>
                ))}
              </View>
            )}

            {/* Add new tier */}
            <View className="gap-2">
              <View className="flex-row gap-2">
                <View
                  className="flex-1 rounded-xl border px-4 py-3"
                  style={{ borderColor: palette.border }}
                >
                  <TextInput
                    className="text-base"
                    keyboardType="decimal-pad"
                    onChangeText={setNewTierHours}
                    placeholder="Hours"
                    placeholderTextColor={palette.icon}
                    style={{ color: palette.text }}
                    value={newTierHours}
                  />
                </View>
                <View
                  className="flex-1 rounded-xl border px-4 py-3"
                  style={{ borderColor: palette.border }}
                >
                  <TextInput
                    className="text-base"
                    keyboardType="decimal-pad"
                    onChangeText={setNewTierPrice}
                    placeholder="Price"
                    placeholderTextColor={palette.icon}
                    style={{ color: palette.text }}
                    value={newTierPrice}
                  />
                </View>
                <Pressable
                  className="rounded-xl px-4 py-3"
                  onPress={addTier}
                  style={{ backgroundColor: palette.primaryButton }}
                >
                  <Text className="font-semibold text-sm text-white">Add</Text>
                </Pressable>
              </View>
            </View>
          </View>

          {/* Extra Person Charge */}
          <View className="mt-6">
            <Text
              className="mb-2 text-base font-medium"
              style={{ color: palette.text }}
            >
              Extra person charge per hour *
            </Text>
            <Text className="mb-2 text-xs" style={{ color: palette.icon }}>
              Additional charge per person per hour for guests beyond included
              count
            </Text>
            <View
              className="rounded-xl border px-4 py-3"
              style={{ borderColor: palette.border }}
            >
              <TextInput
                className="text-base"
                keyboardType="decimal-pad"
                onChangeText={setExtraPersonCharge}
                placeholder="0.00"
                placeholderTextColor={palette.icon}
                style={{ color: palette.text }}
                value={extraPersonCharge}
              />
            </View>
          </View>

          {/* Informational Message */}
          <View
            className="mt-6 rounded-xl border p-4"
            style={{
              borderColor: palette.tint,
              backgroundColor:
                colorScheme === "dark"
                  ? "rgba(149,198,226,0.14)"
                  : "rgba(10,126,164,0.12)",
            }}
          >
            <View className="flex-row items-start gap-2">
              <Ionicons
                color={palette.tint}
                name="information-circle"
                size={20}
              />
              <Text className="flex-1 text-sm" style={{ color: palette.text }}>
                Special pricing rates for different dates or times can be
                managed in the pricing screen after room creation.
              </Text>
            </View>
          </View>

          {/* Footer buttons */}
          <View className="mt-8 flex-row justify-between">
            <Pressable
              className="rounded-full border px-6 py-3"
              onPress={goBack}
              style={{ borderColor: palette.border }}
            >
              <Text className="text-base" style={{ color: palette.text }}>
                Back
              </Text>
            </Pressable>

            <Pressable
              className="rounded-full px-6 py-3"
              disabled={!canNext}
              onPress={onNext}
              style={{
                backgroundColor: palette.primaryButton,
                opacity: canNext ? 1 : 0.5,
              }}
            >
              <Text className="font-semibold text-base text-white">Next</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
