import { ThemedText } from "@app/components/ThemedText";
import { Colors } from "@app/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import { View } from "react-native";

type AppliedOverride = {
  id: string;
  name: string;
  type: "pricing_override";
};

type PriceBreakdown = {
  basePrice: number;
  extraPersonCharge: number;
  totalDiscounts: number;
  totalSurcharges: number;
};

type PricingQuote = {
  basePrice: number;
  appliedOverride: AppliedOverride | null;
  finalPrice: number;
  breakdown: PriceBreakdown;
  calculatedAt: string;
};

type PriceBreakdownProps = {
  quote: PricingQuote;
  loading?: boolean;
};

export function PriceBreakdownComponent({
  quote,
  loading = false,
}: PriceBreakdownProps) {
  const { colorScheme } = useColorScheme();
  const palette = Colors[colorScheme === "dark" ? "dark" : "light"];

  if (loading) {
    return (
      <View
        style={{
          padding: 16,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: palette.border,
          backgroundColor: palette.surface,
        }}
      >
        <ThemedText style={{ color: palette.icon, textAlign: "center" }}>
          Calculating price...
        </ThemedText>
      </View>
    );
  }

  const { breakdown, appliedOverride, finalPrice } = quote;

  return (
    <View
      style={{
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: palette.border,
        backgroundColor: palette.surface,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <Ionicons
          color={palette.tint}
          name="receipt-outline"
          size={20}
          style={{ marginRight: 8 }}
        />
        <ThemedText style={{ fontSize: 16, fontWeight: "700" }}>
          Price Breakdown
        </ThemedText>
      </View>

      {/* Applied Override */}
      {appliedOverride && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 12,
            padding: 8,
            borderRadius: 8,
            backgroundColor: palette.surface2 ?? palette.surface,
          }}
        >
          <Ionicons
            color={palette.tint}
            name="information-circle-outline"
            size={16}
            style={{ marginRight: 8 }}
          />
          <ThemedText style={{ fontSize: 13, color: palette.text }}>
            Special pricing: {appliedOverride.name}
          </ThemedText>
        </View>
      )}

      {/* Base Price */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <ThemedText style={{ fontSize: 14, color: palette.text }}>
          Base price
        </ThemedText>
        <ThemedText style={{ fontSize: 14, color: palette.text }}>
          ${breakdown.basePrice.toFixed(2)}
        </ThemedText>
      </View>

      {/* Extra Person Charge */}
      {breakdown.extraPersonCharge > 0 && (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 8,
          }}
        >
          <ThemedText style={{ fontSize: 14, color: palette.text }}>
            Extra person charge
          </ThemedText>
          <ThemedText style={{ fontSize: 14, color: palette.text }}>
            ${breakdown.extraPersonCharge.toFixed(2)}
          </ThemedText>
        </View>
      )}

      {/* Discounts */}
      {breakdown.totalDiscounts > 0 && (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 8,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
            <Ionicons
              color="#10B981"
              name="arrow-down-circle-outline"
              size={14}
              style={{ marginRight: 4 }}
            />
            <ThemedText style={{ fontSize: 13, color: palette.icon, flex: 1 }}>
              Discounts
            </ThemedText>
          </View>
          <ThemedText style={{ fontSize: 13, color: "#10B981" }}>
            -${breakdown.totalDiscounts.toFixed(2)}
          </ThemedText>
        </View>
      )}

      {/* Surcharges */}
      {breakdown.totalSurcharges > 0 && (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 8,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
            <Ionicons
              color="#EF4444"
              name="arrow-up-circle-outline"
              size={14}
              style={{ marginRight: 4 }}
            />
            <ThemedText style={{ fontSize: 13, color: palette.icon, flex: 1 }}>
              Surcharges
            </ThemedText>
          </View>
          <ThemedText style={{ fontSize: 13, color: "#EF4444" }}>
            +${breakdown.totalSurcharges.toFixed(2)}
          </ThemedText>
        </View>
      )}

      {/* Divider */}
      <View
        style={{
          height: 1,
          backgroundColor: palette.border,
          marginVertical: 12,
        }}
      />

      {/* Total */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <ThemedText style={{ fontSize: 16, fontWeight: "700" }}>
          Total
        </ThemedText>
        <ThemedText
          style={{ fontSize: 20, fontWeight: "700", color: palette.tint }}
        >
          ${finalPrice.toFixed(2)}
        </ThemedText>
      </View>

      {/* Summary */}
      {(breakdown.totalDiscounts > 0 || breakdown.totalSurcharges > 0) && (
        <View style={{ marginTop: 8 }}>
          <ThemedText style={{ fontSize: 12, color: palette.icon }}>
            {breakdown.totalDiscounts > 0 &&
              `Saved $${breakdown.totalDiscounts.toFixed(2)}`}
            {breakdown.totalDiscounts > 0 &&
              breakdown.totalSurcharges > 0 &&
              " • "}
            {breakdown.totalSurcharges > 0 &&
              `+$${breakdown.totalSurcharges.toFixed(2)} surcharge`}
          </ThemedText>
        </View>
      )}
    </View>
  );
}
