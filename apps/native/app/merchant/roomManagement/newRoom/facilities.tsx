// app/merchant/roomManagement/newRoom/facilities.tsx (or keep your current file name)

import { Colors } from "@app/constants/Colors";
import { roomDraftAtom } from "@app/lib/atoms/roomDraft";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { router } from "expo-router";
import { useAtom } from "jotai";
import { useColorScheme } from "nativewind";
import type React from "react";
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

type Amenity = {
  key: string;
  label: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
};

const BASIC: Amenity[] = [
  { key: "wifi", label: "Wi-Fi", icon: "wifi" },
  { key: "aircon", label: "Air-con", icon: "air-conditioner" },
  { key: "toilet", label: "Toilet", icon: "toilet" },
  { key: "sofa", label: "Sofa", icon: "sofa" },
  { key: "fridge", label: "Refrigerator", icon: "fridge-outline" },
  { key: "drinks", label: "Drinks", icon: "cup" },
];

const ENTERTAINMENT: Amenity[] = [
  { key: "mahjong", label: "Mahjong Table", icon: "grid" },
  { key: "poker", label: "Poker", icon: "cards" },
  { key: "dice", label: "Dice", icon: "dice-multiple-outline" },
  { key: "chips", label: "Chips", icon: "chip" },
  { key: "board", label: "Board Game", icon: "puzzle" },
  { key: "ps", label: "PS4/ PS5", icon: "sony-playstation" },
  { key: "switch", label: "Switch", icon: "nintendo-switch" },
];

const AV: Amenity[] = [
  { key: "tv", label: "Television", icon: "television-classic" },
  { key: "speaker", label: "Speaker", icon: "speaker" },
  { key: "mic", label: "Microphone", icon: "microphone-outline" },
];

export default function AddRoomFacilities() {
  const { colorScheme } = useColorScheme();
  const palette = Colors[colorScheme === "dark" ? "dark" : "light"];
  const tintBg =
    colorScheme === "dark" ? "rgba(149,198,226,0.14)" : "rgba(10,126,164,0.12)";

  // Use Jotai atom
  const [draft, setDraft] = useAtom(roomDraftAtom);

  // Store selected facility keys
  const [selected, setSelected] = useState<Set<string>>(
    new Set(draft.facilities || [])
  );
  const [customInput, setCustomInput] = useState("");
  const [customList, setCustomList] = useState<string[]>([]);

  const canNext = selected.size > 0 || customList.length > 0;

  // Load existing facilities from atom
  useEffect(() => {
    if (draft.facilities) {
      setSelected(new Set(draft.facilities));
    }
  }, [draft.facilities]);

  const toggle = (k: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(k)) {
        next.delete(k);
      } else {
        next.add(k);
      }
      return next;
    });

  const addCustom = () => {
    const val = customInput.trim();
    if (!val) {
      return;
    }
    if (!customList.includes(val)) {
      setCustomList((l) => [...l, val]);
    }
    setCustomInput("");
  };

  const removeCustom = (val: string) =>
    setCustomList((l) => l.filter((x) => x !== val));

  const goBack = () => {
    // Just navigate back - data is already in atom
    router.back();
  };

  const onNext = () => {
    // Build facilities object with icons grouped by category
    const facilitiesData: Record<
      string,
      Array<{ name: string; icon?: string }>
    > = {};

    // Group selected facilities by category
    const allFacilities = [...BASIC, ...ENTERTAINMENT, ...AV];
    selected.forEach((key) => {
      const facility = allFacilities.find((f) => f.key === key);
      if (facility) {
        // Determine category
        let category = "basic";
        if (ENTERTAINMENT.some((f) => f.key === key)) {
          category = "entertainment";
        } else if (AV.some((f) => f.key === key)) {
          category = "av";
        }

        if (!facilitiesData[category]) {
          facilitiesData[category] = [];
        }
        facilitiesData[category].push({
          name: facility.label,
          icon: facility.icon,
        });
      }
    });

    // Add custom facilities to a "custom" category
    if (customList.length > 0) {
      facilitiesData.custom = customList.map((name) => ({ name }));
    }

    // Update atom with facilities data (still store keys for backward compatibility)
    setDraft({
      ...draft,
      facilities: Array.from(selected),
      facilitiesData, // Store the full data structure
    });

    console.log("AddRoomFacilities - Saved to atom:", {
      facilities: Array.from(selected),
      facilitiesData,
      customAmenities: customList,
    });

    // Navigate to pricing step
    router.push("/merchant/roomManagement/newRoom/pricing");
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
          <Text
            className="mt-2 font-extrabold text-2xl"
            style={{ color: palette.text }}
          >
            Add new room
          </Text>

          {/* BASIC */}
          <Text className="mt-4 text-base" style={{ color: palette.text }}>
            Does your room include these basic facilities?
          </Text>
          <View className="mt-3 flex-row flex-wrap gap-3">
            {BASIC.map((a) => {
              const isOn = selected.has(a.key);
              return (
                <Pressable
                  className="w-[31%] items-center rounded-xl border p-3"
                  key={a.key}
                  onPress={() => toggle(a.key)}
                  style={{
                    borderColor: isOn ? palette.tint : palette.border,
                    backgroundColor: isOn ? tintBg : palette.surface,
                  }}
                >
                  <MaterialCommunityIcons
                    color={isOn ? palette.tint : palette.text}
                    name={a.icon}
                    size={22}
                  />
                  <Text
                    className="mt-2 text-center text-sm"
                    style={{ color: palette.text }}
                  >
                    {a.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* ENTERTAINMENT */}
          <Text className="mt-6 text-base" style={{ color: palette.text }}>
            Does your room include these entertainment facilities?
          </Text>
          <View className="mt-3 flex-row flex-wrap gap-3">
            {ENTERTAINMENT.map((a) => {
              const isOn = selected.has(a.key);
              return (
                <Pressable
                  className="w-[31%] items-center rounded-xl border p-3"
                  key={a.key}
                  onPress={() => toggle(a.key)}
                  style={{
                    borderColor: isOn ? palette.tint : palette.border,
                    backgroundColor: isOn ? tintBg : palette.surface,
                  }}
                >
                  <MaterialCommunityIcons
                    color={isOn ? palette.tint : palette.text}
                    name={a.icon}
                    size={22}
                  />
                  <Text
                    className="mt-2 text-center text-sm"
                    style={{ color: palette.text }}
                  >
                    {a.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* A/V */}
          <Text className="mt-6 text-base" style={{ color: palette.text }}>
            Does your room include these A/V equipment?
          </Text>
          <View className="mt-3 flex-row flex-wrap gap-3">
            {AV.map((a) => {
              const isOn = selected.has(a.key);
              return (
                <Pressable
                  className="w-[31%] items-center rounded-xl border p-3"
                  key={a.key}
                  onPress={() => toggle(a.key)}
                  style={{
                    borderColor: isOn ? palette.tint : palette.border,
                    backgroundColor: isOn ? tintBg : palette.surface,
                  }}
                >
                  <MaterialCommunityIcons
                    color={isOn ? palette.tint : palette.text}
                    name={a.icon}
                    size={22}
                  />
                  <Text
                    className="mt-2 text-center text-sm"
                    style={{ color: palette.text }}
                  >
                    {a.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Custom facility input */}
          <Text className="mt-6 text-base" style={{ color: palette.text }}>
            Any special facilities?
          </Text>
          <View className="mt-2 flex-row items-center gap-2">
            <View
              className="flex-1 rounded-full border px-4 py-2"
              style={{ borderColor: palette.border }}
            >
              <TextInput
                className="text-sm"
                onChangeText={setCustomInput}
                onSubmitEditing={addCustom}
                placeholder="e.g., Karaoke room"
                placeholderTextColor={palette.icon}
                returnKeyType="done"
                style={{ color: palette.text }}
                value={customInput}
              />
            </View>
            <Pressable
              className="rounded-full px-4 py-2"
              onPress={addCustom}
              style={{ backgroundColor: palette.primaryButton }}
            >
              <Text className="font-semibold text-sm text-white">Add</Text>
            </Pressable>
          </View>

          {/* Render custom tags */}
          {customList.length > 0 && (
            <View className="mt-3 flex-row flex-wrap gap-2">
              {customList.map((val) => (
                <Pressable
                  className="flex-row items-center rounded-full border px-3 py-1"
                  key={val}
                  onPress={() => removeCustom(val)}
                  style={{
                    borderColor: palette.border,
                    backgroundColor: palette.surface,
                  }}
                >
                  <Text
                    className="mr-1 text-sm"
                    style={{ color: palette.text }}
                  >
                    {val}
                  </Text>
                  <Ionicons color={palette.icon} name="close" size={14} />
                </Pressable>
              ))}
            </View>
          )}

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
