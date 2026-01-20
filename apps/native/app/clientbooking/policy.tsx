// app/(tabs)/history/cancellation-policy.tsx

import { Colors } from "@app/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type PolicySection = {
  id: string;
  title: string;
  description: string;
  rules: {
    cutoff: string;
    refund: string;
    details: string;
  }[];
};

const POLICY_SECTIONS: PolicySection[] = [
  {
    id: "hourly-room",
    title: "Hourly Room Booking",
    description: "For private room rentals by the hour (e.g., mahjong rooms).",
    rules: [
      {
        cutoff: "More than 5 days before",
        refund: "100%",
        details: "Full refund of room price and deposit.",
      },
      {
        cutoff: "2–5 days before",
        refund: "50%",
        details: "50% of room price + full deposit.",
      },
      {
        cutoff: "Less than 2 days before",
        refund: "0%",
        details: "No refund available.",
      },
    ],
  },
  {
    id: "hotel-nightly",
    title: "Overnight Stay",
    description: "For bookings spanning one or more nights.",
    rules: [
      {
        cutoff: "7+ days before check-in",
        refund: "100%",
        details: "Full refund, no fees.",
      },
      {
        cutoff: "3–6 days before",
        refund: "50%",
        details: "Half of total amount refunded.",
      },
      { cutoff: "Within 48 hours", refund: "0%", details: "Non-refundable." },
    ],
  },
  {
    id: "experience",
    title: "Experiences & Events",
    description: "Cooking classes, tours, workshops.",
    rules: [
      {
        cutoff: "14+ days before",
        refund: "100%",
        details: "Full refund if cancelled early.",
      },
      {
        cutoff: "7–13 days before",
        refund: "75%",
        details: "Partial refund with small fee.",
      },
      {
        cutoff: "Less than 7 days",
        refund: "0%",
        details: "No refunds; rescheduling may be possible.",
      },
    ],
  },
  {
    id: "promotional",
    title: "Promotional Bookings",
    description: "Discounted or flash-sale rates.",
    rules: [
      {
        cutoff: "Any time",
        refund: "0%",
        details:
          "Non-refundable by design. Rescheduling at venue’s discretion.",
      },
    ],
  },
];

export default function CancellationPolicyPage() {
  const { colorScheme } = useColorScheme();
  const palette = Colors[colorScheme === "dark" ? "dark" : "light"];
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.background }}>
      <ScrollView
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 16,
            paddingBottom: 12,
            borderBottomWidth: 1,
            borderBottomColor: palette.border,
          }}
        >
          <Pressable
            accessibilityLabel="Go back"
            accessibilityRole="button"
            hitSlop={12}
            onPress={() => router.back()}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: palette.state?.hover,
            }}
          >
            <Ionicons color={palette.text} name="chevron-back" size={20} />
          </Pressable>

          <View style={{ marginLeft: 10, flex: 1 }}>
            <Text
              style={{ fontSize: 22, fontWeight: "700", color: palette.text }}
            >
              Party App Policies
            </Text>
            <Text style={{ color: palette.muted, marginTop: 2, fontSize: 13 }}>
              Cancellations & refunds by booking type
            </Text>
          </View>
        </View>

        {/* Intro */}
        <View
          style={{
            backgroundColor: palette.surface,
            borderColor: palette.border,
            borderWidth: 1,
            borderRadius: 12,
            padding: 12,
            marginBottom: 18,
          }}
        >
          <Text style={{ color: palette.muted, lineHeight: 20 }}>
            The refund you get depends on when you cancel and your booking type.
          </Text>
        </View>

        {/* Policy Cards */}
        <View style={{ gap: 16 }}>
          {POLICY_SECTIONS.map((section) => (
            <View
              key={section.id}
              style={{
                backgroundColor: palette.surface,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: palette.border,
                padding: 18,
              }}
            >
              {/* Section Title */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <View
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: palette.state?.hover,
                    marginRight: 8,
                  }}
                >
                  <Ionicons
                    color={palette.tint}
                    name="document-text-outline"
                    size={16}
                  />
                </View>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "600",
                    color: palette.text,
                  }}
                >
                  {section.title}
                </Text>
              </View>
              <Text
                style={{
                  color: palette.muted,
                  fontSize: 14,
                  marginBottom: 14,
                  lineHeight: 20,
                }}
              >
                {section.description}
              </Text>

              {/* Rules */}
              <View style={{ gap: 12 }}>
                {section.rules.map((rule) => (
                  <View
                    key={`${section.id}-${rule.cutoff}`}
                    style={{ flexDirection: "row", gap: 12 }}
                  >
                    {/* Dot */}
                    <View
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: palette.tint,
                        marginTop: 10,
                      }}
                    />
                    <View style={{ flex: 1 }}>
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Text
                          style={{
                            color: palette.text,
                            fontWeight: "600",
                            fontSize: 15,
                          }}
                        >
                          {rule.cutoff}
                        </Text>

                        {/* Refund chip */}
                        <View
                          style={{
                            paddingHorizontal: 10,
                            paddingVertical: 4,
                            borderRadius: 999,
                            backgroundColor: palette.state?.hover,
                            borderWidth: 1,
                            borderColor: palette.border,
                          }}
                        >
                          <Text
                            style={{
                              color: palette.tint,
                              fontWeight: "700",
                              fontSize: 12,
                            }}
                          >
                            {rule.refund}
                          </Text>
                        </View>
                      </View>

                      <Text
                        style={{
                          color: palette.muted,
                          fontSize: 14,
                          marginTop: 4,
                          lineHeight: 20,
                        }}
                      >
                        {rule.details}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>

        {/* Footer Note */}
        <View
          style={{
            marginTop: 20,
            padding: 12,
            borderRadius: 12,
            backgroundColor: palette.surface,
            borderWidth: 1,
            borderColor: palette.border,
          }}
        >
          <Text
            style={{
              color: palette.muted,
              fontSize: 13,
              lineHeight: 20,
              fontStyle: "italic",
            }}
          >
            All times are based on local venue time (HKT). Refunds are processed
            within 5–7 business days.
          </Text>
        </View>

        {/* Help CTA */}
        <View style={{ alignItems: "center", marginTop: 16, marginBottom: 24 }}>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push("/")}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 10,
              borderRadius: 12,
              backgroundColor: palette.primaryButton ?? palette.tint,
            }}
          >
            <Text style={{ color: "#FFFFFF", fontWeight: "600" }}>
              Need help? Contact Support
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
