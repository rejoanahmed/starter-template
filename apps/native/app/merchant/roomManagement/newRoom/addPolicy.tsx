// app/merchant/roomManagement/newRoom/cancellation.tsx

import { Colors } from "@app/constants/Colors";
import { roomDraftAtom } from "@app/lib/atoms/roomDraft";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { useAtom } from "jotai";
import { useColorScheme } from "nativewind";
import type React from "react";
import { useState } from "react";
import { Platform, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type PolicyKey = "lenient" | "strict";

export default function CancellationPolicyScreen() {
  const { colorScheme } = useColorScheme();
  const palette = Colors[colorScheme === "dark" ? "dark" : "light"];

  // Use Jotai atom
  const [draft, setDraft] = useAtom(roomDraftAtom);

  const [selected, setSelected] = useState<PolicyKey | null>("lenient");
  const canNext = !!selected;

  const goBack = () => {
    // Just navigate back - data is in atom
    router.back();
  };

  const onNext = () => {
    const policy:
      | { type: "lenient"; rules: { cutoff: string; refund: string }[] }
      | { type: "strict"; rules: { cutoff: string; refund: string }[] } =
      selected === "lenient"
        ? {
            type: "lenient",
            rules: [
              {
                cutoff: "5 days before check-in",
                refund: "Full refund (room + deposit)",
              },
              {
                cutoff: "24 hours before check-in",
                refund: "50% room + 100% deposit",
              },
            ],
          }
        : {
            type: "strict",
            rules: [{ cutoff: "Any period", refund: "No refund" }],
          };

    // Update atom with policy
    setDraft({
      ...draft,
      // Add cancellationPolicy to the type if needed
      cancellationPolicy: policy,
    });

    console.log("CancellationPolicy - Saved to atom:", {
      cancellationPolicy: policy,
    });

    // Navigate to success page
    router.push("/merchant/roomManagement/newRoom/success");
  };

  const Check = ({ checked }: { checked: boolean }) => (
    <View
      className="h-6 w-6 items-center justify-center rounded-md"
      style={{
        borderWidth: 2,
        borderColor: checked ? palette.tint : palette.border,
        backgroundColor: checked ? palette.tint : "transparent",
      }}
    >
      {checked ? <Ionicons color="#fff" name="checkmark" size={16} /> : null}
    </View>
  );

  const Rule = ({
    left,
    title,
    desc,
  }: {
    left: string;
    title: string;
    desc: string;
  }) => (
    <View className="mt-5 flex-row">
      <View className="w-28 pr-3">
        <Text className="text-sm" style={{ color: palette.icon }}>
          {left}
        </Text>
      </View>
      <View className="flex-1">
        <Text className="font-semibold text-lg" style={{ color: palette.text }}>
          {title}
        </Text>
        <Text className="mt-1 text-base" style={{ color: palette.text }}>
          {desc}
        </Text>
      </View>
    </View>
  );

  const Section = ({
    heading,
    checked,
    onPress,
    children,
  }: {
    heading: string;
    checked: boolean;
    onPress: () => void;
    children: React.ReactNode;
  }) => (
    <Pressable
      className="mt-5 rounded-2xl border p-4"
      onPress={onPress}
      style={{
        borderColor: checked ? palette.tint : palette.border,
        backgroundColor: checked
          ? Platform.select({
              ios:
                colorScheme === "dark"
                  ? "rgba(149,198,226,0.14)"
                  : "rgba(10,126,164,0.08)",
              default:
                colorScheme === "dark"
                  ? "rgba(149,198,226,0.14)"
                  : "rgba(10,126,164,0.08)",
            })
          : palette.surface,
      }}
    >
      <View className="flex-row items-center justify-between">
        <Text
          className="font-extrabold text-xl"
          style={{ color: palette.text }}
        >
          {heading}
        </Text>
        <Check checked={checked} />
      </View>
      {children}
    </Pressable>
  );

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: palette.background }}
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
        <Text className="mt-2 text-base" style={{ color: palette.text }}>
          Choose the most suitable cancellation policy from below
        </Text>

        {/* Lenient */}
        <Section
          checked={selected === "lenient"}
          heading="Lenient"
          onPress={() => setSelected("lenient")}
        >
          <Rule
            desc="The entire amount (including room price and deposit) is returned to you."
            left="5 Days before check-in"
            title="Full Refund"
          />
          <Rule
            desc="50% of the room price and full amount of the deposit are returned to you."
            left="24 Hours before check-in"
            title="Partial Refund"
          />
        </Section>

        {/* Strict */}
        <Section
          checked={selected === "strict"}
          heading="Strict"
          onPress={() => setSelected("strict")}
        >
          <Rule
            desc="No refund can be made"
            left="Any period"
            title="No Refund"
          />
        </Section>

        {/* Footer */}
        <View className="mt-10 flex-row justify-between">
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
            <Text className="font-semibold text-base text-white">Submit</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
