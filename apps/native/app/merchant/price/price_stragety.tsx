// app/merchant/PricingStrategyScreen.tsx

import { ThemedText } from "@app/components/ThemedText";
import { Colors } from "@app/constants/Colors";
import {
  type PricingModifier,
  pricingService,
} from "@app/services/merchant/pricing";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  Switch,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

/* ---------------- Modifier Row ---------------- */
const ModifierRow = memo(function ModifierRow({
  item,
  onToggle,
  onDelete,
  palette,
}: {
  item: PricingModifier;
  onToggle: (id: string, next: boolean) => void;
  onDelete: (id: string) => void;
  palette: typeof Colors.light;
}) {
  const getModifierLabel = () => {
    if (item.type === "duration_discount") {
      const minHours = item.minDurationMinutes
        ? Math.floor(item.minDurationMinutes / 60)
        : 0;
      const maxHours = item.maxDurationMinutes
        ? Math.floor(item.maxDurationMinutes / 60)
        : null;
      return maxHours ? `${minHours}-${maxHours} hours` : `${minHours}+ hours`;
    }
    const minG = item.minGuests || 0;
    const maxG = item.maxGuests || null;
    return maxG ? `${minG}-${maxG} guests` : `${minG}+ guests`;
  };

  const getModifierValue = () => {
    const value = item.discountValue;
    const isPercentage = item.discountType === "percentage";
    return isPercentage ? `${value}%` : `$${value}`;
  };

  const getModifierType = () => {
    if (item.type === "duration_discount") {
      return "Duration Discount";
    }
    return item.type === "guest_discount"
      ? "Group Discount"
      : "Group Surcharge";
  };

  const getIcon = (): keyof typeof Ionicons.glyphMap => {
    if (item.type === "duration_discount") {
      return "time-outline";
    }
    return "people-outline";
  };

  return (
    <View>
      <View style={{ height: 1, backgroundColor: palette.divider }} />
      <View className="flex-row items-center gap-3 py-4">
        {/* emblem */}
        <View
          className="h-10 w-10 items-center justify-center rounded-full"
          style={{ backgroundColor: palette.state?.hover }}
        >
          <Ionicons color={palette.tint} name={getIcon()} size={18} />
        </View>

        {/* text */}
        <View className="flex-1">
          <ThemedText
            className="font-semibold text-base"
            numberOfLines={1}
            style={{ color: palette.text }}
          >
            {getModifierLabel()}
          </ThemedText>
          <ThemedText
            className="mt-0.5 text-xs"
            numberOfLines={1}
            style={{ color: palette.muted ?? palette.icon }}
          >
            {getModifierType()} • {getModifierValue()} off
          </ThemedText>
        </View>

        {/* delete */}
        <Pressable
          className="px-2 py-1.5"
          hitSlop={8}
          onPress={() => onDelete(item.id)}
        >
          <Ionicons color="#EF4444" name="trash-outline" size={18} />
        </Pressable>

        {/* toggle */}
        <Switch
          onValueChange={(v) => onToggle(item.id, v)}
          thumbColor={palette.surface2 ?? "#FFFFFF"}
          trackColor={{
            false: palette.border as string,
            true: palette.tint as string,
          }}
          value={item.isActive}
        />
      </View>
    </View>
  );
});

/* ---------------- PillButton ---------------- */
const PillButton = memo(function PillButton({
  title,
  icon,
  onPress,
  palette,
  variant = "filled",
}: {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  palette: typeof Colors.light;
  variant?: "filled" | "ghost";
}) {
  const filled = variant === "filled";
  return (
    <Pressable
      className="flex-row items-center rounded-full px-4 py-2"
      hitSlop={6}
      onPress={onPress}
      style={{
        backgroundColor: filled ? palette.state?.hover : "transparent",
        borderColor: palette.border,
        borderWidth: 1,
      }}
    >
      <Ionicons
        color={filled ? palette.tint : palette.text}
        name={icon}
        size={16}
        style={{ marginRight: 8 }}
      />
      <ThemedText
        className="font-semibold text-sm"
        style={{ color: palette.text }}
      >
        {title}
      </ThemedText>
    </Pressable>
  );
});

/* ---------------- Screen ---------------- */
export default function PricingStrategyScreen() {
  console.log("hello");
  const { colorScheme } = useColorScheme();
  const inset = useSafeAreaInsets();
  const palette = Colors[colorScheme === "dark" ? "dark" : "light"];
  const router = useRouter();
  const { roomId } = useLocalSearchParams<{ roomId: string }>();

  const [modifiers, setModifiers] = useState<PricingModifier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch modifiers
  const fetchModifiers = useCallback(async () => {
    if (!roomId) {
      setError("Room ID is required");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await pricingService.getPricingModifiers(roomId);
      setModifiers(response.modifiers || []);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch modifiers:", err);
      setError("Failed to load pricing modifiers");
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    fetchModifiers();
  }, [fetchModifiers]);

  const onToggle = async (id: string, next: boolean) => {
    try {
      await pricingService.updatePricingModifier(id, { isActive: next });
      setModifiers((s) =>
        s.map((it) => (it.id === id ? { ...it, isActive: next } : it))
      );
    } catch (err) {
      console.error("Failed to toggle modifier:", err);
    }
  };

  const onDelete = async (id: string) => {
    try {
      await pricingService.deletePricingModifier(id);
      setModifiers((s) => s.filter((it) => it.id !== id));
    } catch (err) {
      console.error("Failed to delete modifier:", err);
    }
  };

  // Group modifiers by type
  const durationModifiers = useMemo(
    () =>
      modifiers
        .filter((m) => m.type === "duration_discount")
        .sort(
          (a, b) => (a.minDurationMinutes || 0) - (b.minDurationMinutes || 0)
        ),
    [modifiers]
  );

  const guestModifiers = useMemo(
    () =>
      modifiers
        .filter(
          (m) => m.type === "guest_discount" || m.type === "guest_surcharge"
        )
        .sort((a, b) => (a.minGuests || 0) - (b.minGuests || 0)),
    [modifiers]
  );

  const cardStyle = useMemo(
    () => ({
      backgroundColor: palette.surface,
      borderColor: palette.border,
      ...(Platform.OS === "android" ? { elevation: 2 } : {}),
    }),
    [palette]
  );

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: palette.background }}
    >
      {/* Header at absolute top */}
      <View
        className="px-4"
        style={{
          paddingTop: 10,
          paddingBottom: 12,
          borderBottomWidth: 1,
          borderBottomColor: palette.border,
          backgroundColor: palette.background,
        }}
      >
        <View className="flex-row items-center">
          <Pressable
            className="mr-2 py-1"
            hitSlop={12}
            onPress={() => router.back()}
          >
            <Ionicons color={palette.text} name="chevron-back" size={24} />
          </Pressable>
          <ThemedText
            className="flex-1 font-bold text-xl"
            style={{ color: palette.text }}
          >
            Pricing Modifiers
          </ThemedText>
        </View>

        <View className="mt-4 flex-row items-center justify-between">
          <PillButton
            icon="add-circle-outline"
            onPress={() =>
              router.push(
                `/merchant/calendar/addPricing?roomId=${roomId}&day=1&month=1&year=2024`
              )
            }
            palette={palette}
            title="Add Modifier"
            variant="filled"
          />
        </View>
      </View>

      {/* List */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          padding: 16,
          paddingBottom: Math.max(inset.bottom, 24),
        }}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View className="mt-8 items-center">
            <ActivityIndicator color={palette.tint} size="large" />
            <ThemedText className="mt-4" style={{ color: palette.text }}>
              Loading modifiers...
            </ThemedText>
          </View>
        ) : error ? (
          <View className="mt-8 items-center">
            <ThemedText style={{ color: palette.text }}>{error}</ThemedText>
            <Pressable
              className="mt-4 rounded-full px-6 py-3"
              onPress={fetchModifiers}
              style={{ backgroundColor: palette.tint }}
            >
              <ThemedText style={{ color: "#FFFFFF", fontWeight: "600" }}>
                Retry
              </ThemedText>
            </Pressable>
          </View>
        ) : modifiers.length > 0 ? (
          <>
            {/* Duration Modifiers Section */}
            {durationModifiers.length > 0 && (
              <>
                <ThemedText
                  className="mb-3 font-bold text-lg"
                  style={{ color: palette.text }}
                >
                  Duration Discounts
                </ThemedText>
                <View
                  className="mb-6 overflow-hidden rounded-2xl border p-3"
                  style={cardStyle}
                >
                  {durationModifiers.map((item) => (
                    <ModifierRow
                      item={item}
                      key={item.id}
                      onDelete={onDelete}
                      onToggle={onToggle}
                      palette={palette}
                    />
                  ))}
                  <View
                    style={{ height: 1, backgroundColor: palette.divider }}
                  />
                </View>
              </>
            )}

            {/* Guest Modifiers Section */}
            {guestModifiers.length > 0 && (
              <>
                <ThemedText
                  className="mb-3 font-bold text-lg"
                  style={{ color: palette.text }}
                >
                  Group Pricing
                </ThemedText>
                <View
                  className="overflow-hidden rounded-2xl border p-3"
                  style={cardStyle}
                >
                  {guestModifiers.map((item) => (
                    <ModifierRow
                      item={item}
                      key={item.id}
                      onDelete={onDelete}
                      onToggle={onToggle}
                      palette={palette}
                    />
                  ))}
                  <View
                    style={{ height: 1, backgroundColor: palette.divider }}
                  />
                </View>
              </>
            )}
          </>
        ) : (
          <View className="mt-8 items-center">
            <ThemedText
              className="text-center"
              style={{ color: palette.muted }}
            >
              No pricing modifiers yet. Create one to get started.
            </ThemedText>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
