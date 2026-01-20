// app/merchant/PricingDetailScreen.tsx

import { ThemedText } from "@app/components/ThemedText";
import { Colors } from "@app/constants/Colors";
import { pricingService } from "@app/services/merchant/pricing";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import type React from "react";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  InteractionManager,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

type ExtraMode = "off" | "fixed" | "hour";
type TimeTier = {
  id: string;
  minHours: string;
  minPrice: string;
  pricePerHour: string;
};
type DurationModifier = {
  id: string;
  minDuration: string; // in hours
  maxDuration: string; // in hours
  discountType: "percentage" | "fixed";
  discountValue: string;
};
type GroupModifier = {
  id: string;
  minGuests: string;
  maxGuests: string;
  modifierType: "discount" | "surcharge";
  discountType: "percentage" | "fixed";
  discountValue: string;
};
type RouteParams = {
  day: string;
  month: string;
  year: string;
  price?: string;
  roomId?: string;
};

const sanitizeInt = (v: string) =>
  v.replace(/[^0-9]/g, "").replace(/^0+(?=\d)/, "");
const sanitizeDecimal = (v: string) =>
  v
    .replace(/[^0-9.]/g, "")
    .replace(/(\..*)\./g, "$1")
    .replace(/^0+(?=\d)/, v.startsWith("0.") ? "0" : "");
const uid = () => Math.random().toString(36).slice(2, 9);

const SectionCard = memo(function SectionCard({
  children,
  palette,
  style,
}: {
  children: React.ReactNode;
  palette: typeof Colors.light;
  style?: object;
}) {
  return (
    <View
      style={[
        {
          borderWidth: 1,
          borderColor: palette.border,
          borderRadius: 12,
          padding: 12,
          backgroundColor: palette.surface,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
});

const LabeledNumberInput = memo(function LabeledNumberInput({
  label,
  value,
  onChangeText,
  palette,
  width = 90,
  placeholder,
  keyboard = "decimal-pad",
  disabled = false,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  palette: typeof Colors.light;
  width?: number;
  placeholder?: string;
  keyboard?: "number-pad" | "decimal-pad";
  disabled?: boolean;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
        opacity: disabled ? 0.6 : 1,
      }}
    >
      <ThemedText style={{ fontSize: 14 }}>{label}</ThemedText>
      <TextInput
        editable={!disabled}
        keyboardType={keyboard}
        onChangeText={onChangeText}
        onSubmitEditing={Keyboard.dismiss}
        placeholder={placeholder}
        placeholderTextColor={palette.icon}
        returnKeyType="done"
        style={{
          width,
          textAlign: "center",
          borderWidth: 1,
          borderColor: palette.border,
          borderRadius: 10,
          paddingVertical: 6,
          paddingHorizontal: 8,
          color: palette.text,
          backgroundColor: palette.background,
        }}
        value={value}
      />
    </View>
  );
});

export default function PricingDetailScreen() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const inset = useSafeAreaInsets();
  const palette = Colors[colorScheme === "dark" ? "dark" : "light"];
  const { day, month, year, price, roomId } =
    useLocalSearchParams<RouteParams>();

  const dateStr = useMemo(() => {
    const d = new Date(Number(year), Number(month) - 1, Number(day));
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, [day, month, year]);

  // minimal synchronous state on mount
  const [strategyName, setStrategyName] = useState("");
  const [deposit, setDeposit] = useState("200");
  const [minHour, setMinHour] = useState("4");
  const [minPeople, setMinPeople] = useState("4");
  const [minPrice, setMinPrice] = useState("200");
  const [guestNum, setGuestNum] = useState("4");
  const [extraCharge, setExtraCharge] = useState("5");
  const [extraMode, setExtraMode] = useState<ExtraMode>("fixed");
  const [saving, setSaving] = useState(false);
  const [durationModifiers, setDurationModifiers] = useState<
    DurationModifier[]
  >([]);
  const [groupModifiers, setGroupModifiers] = useState<GroupModifier[]>([]);

  // defer non-critical hydration to after first frame
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      setHydrated(true);
    });
    return () => task.cancel();
  }, []);

  const initialPerHour = useMemo(
    () => (price && String(price)) || "250",
    [price]
  );
  const [tiers, setTiers] = useState<TimeTier[]>(() => [
    { id: uid(), minHours: "4", minPrice: "200", pricePerHour: initialPerHour },
  ]);

  const addTier = useCallback(() => {
    setTiers((prev) => [
      ...prev,
      {
        id: uid(),
        minHours: "6",
        minPrice: "300",
        pricePerHour: initialPerHour,
      },
    ]);
  }, [initialPerHour]);

  const removeTier = useCallback((id: string) => {
    setTiers((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const updateTier = useCallback((id: string, patch: Partial<TimeTier>) => {
    setTiers((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }, []);

  const addDurationModifier = useCallback(() => {
    setDurationModifiers((prev) => [
      ...prev,
      {
        id: uid(),
        minDuration: "4",
        maxDuration: "8",
        discountType: "percentage",
        discountValue: "10",
      },
    ]);
  }, []);

  const removeDurationModifier = useCallback((id: string) => {
    setDurationModifiers((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const updateDurationModifier = useCallback(
    (id: string, patch: Partial<DurationModifier>) => {
      setDurationModifiers((prev) =>
        prev.map((m) => (m.id === id ? { ...m, ...patch } : m))
      );
    },
    []
  );

  const addGroupModifier = useCallback(() => {
    setGroupModifiers((prev) => [
      ...prev,
      {
        id: uid(),
        minGuests: "1",
        maxGuests: "10",
        modifierType: "discount",
        discountType: "percentage",
        discountValue: "10",
      },
    ]);
  }, []);

  const removeGroupModifier = useCallback((id: string) => {
    setGroupModifiers((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const updateGroupModifier = useCallback(
    (id: string, patch: Partial<GroupModifier>) => {
      setGroupModifiers((prev) =>
        prev.map((m) => (m.id === id ? { ...m, ...patch } : m))
      );
    },
    []
  );

  const validate = useCallback((): { ok: boolean; msg?: string } => {
    if (!strategyName.trim()) {
      return { ok: false, msg: "Strategy name is required." };
    }
    const dep = Number(deposit || 0);
    if (Number.isNaN(dep) || dep < 0) {
      return { ok: false, msg: "Deposit must be a non-negative number." };
    }
    const mh = Number(minHour || 0);
    const mp = Number(minPeople || 0);
    const mpr = Number(minPrice || 0);
    if (mh <= 0) {
      return { ok: false, msg: "Minimum hour must be at least 1." };
    }
    if (mp <= 0) {
      return { ok: false, msg: "Minimum people must be at least 1." };
    }
    if (mpr <= 0) {
      return { ok: false, msg: "Minimum price must be positive." };
    }
    for (const [i, t] of tiers.entries()) {
      const h = Number(t.minHours || 0);
      const ph = Number(t.pricePerHour || 0);
      if (h <= 0) {
        return { ok: false, msg: `Tier #${i + 1}: hours must be ≥ 1.` };
      }
      if (ph <= 0) {
        return {
          ok: false,
          msg: `Tier #${i + 1}: per-hour price must be positive.`,
        };
      }
    }
    for (const [i, m] of durationModifiers.entries()) {
      const minDur = Number(m.minDuration || 0);
      const maxDur = Number(m.maxDuration || 0);
      const val = Number(m.discountValue || 0);
      if (minDur <= 0) {
        return {
          ok: false,
          msg: `Duration modifier #${i + 1}: min duration must be ≥ 1.`,
        };
      }
      if (maxDur > 0 && maxDur < minDur) {
        return {
          ok: false,
          msg: `Duration modifier #${i + 1}: max duration must be ≥ min duration.`,
        };
      }
      if (val < 0) {
        return {
          ok: false,
          msg: `Duration modifier #${i + 1}: discount value cannot be negative.`,
        };
      }
      if (m.discountType === "percentage" && val > 100) {
        return {
          ok: false,
          msg: `Duration modifier #${i + 1}: percentage discount cannot exceed 100.`,
        };
      }
    }
    for (const [i, m] of groupModifiers.entries()) {
      const minG = Number(m.minGuests || 0);
      const maxG = Number(m.maxGuests || 0);
      const val = Number(m.discountValue || 0);
      if (minG <= 0) {
        return {
          ok: false,
          msg: `Group modifier #${i + 1}: min guests must be ≥ 1.`,
        };
      }
      if (maxG > 0 && maxG < minG) {
        return {
          ok: false,
          msg: `Group modifier #${i + 1}: max guests must be ≥ min guests.`,
        };
      }
      if (val < 0) {
        return {
          ok: false,
          msg: `Group modifier #${i + 1}: value cannot be negative.`,
        };
      }
      if (m.discountType === "percentage" && val > 100) {
        return {
          ok: false,
          msg: `Group modifier #${i + 1}: percentage value cannot exceed 100.`,
        };
      }
    }
    if (extraMode !== "off") {
      const base = Number(guestNum || 0);
      const charge = Number(extraCharge || 0);
      if (base <= 0) {
        return { ok: false, msg: "Included guest number must be ≥ 1." };
      }
      if (charge < 0) {
        return { ok: false, msg: "Extra charge cannot be negative." };
      }
    }
    return { ok: true };
  }, [
    strategyName,
    deposit,
    minHour,
    minPeople,
    minPrice,
    tiers,
    durationModifiers,
    groupModifiers,
    extraMode,
    guestNum,
    extraCharge,
  ]);

  const handleSave = useCallback(async () => {
    Keyboard.dismiss();
    const t0 = Date.now();
    console.log("[PricingDetail] Save pressed at", new Date().toISOString());

    const v = validate();
    if (!v.ok) {
      console.log("[PricingDetail] Validation failed:", v.msg);
      Alert.alert("Invalid input", v.msg);
      return;
    }

    const payload = {
      date: { day: Number(day), month: Number(month), year: Number(year) },
      strategyName: strategyName.trim(),
      basic: {
        minimumHour: Number(minHour),
        minimumPeople: Number(minPeople),
        minimumPrice: Number(minPrice),
      },
      timeTiers: tiers
        .map((t) => {
          const hours = Number(t.minHours);
          const perHour = Number(t.pricePerHour);
          const people = Number(minPeople);
          return {
            minHours: hours,
            minPrice: hours * perHour * people, // Auto-calculated: hours × rate × people
            pricePerHour: perHour,
          };
        })
        .sort((a, b) => a.minHours - b.minHours),
      extraPerson: {
        mode: extraMode,
        baseGuestNumber: Number(guestNum || 0),
        extraCharge: Number(extraCharge || 0),
      },
      deposit: Number(deposit),
      updatedAt: Date.now(),
    };

    try {
      setSaving(true);
      console.log("[PricingDetail] Saving payload:", payload);

      // TODO: replace with API call for pricing rules
      await new Promise((r) => setTimeout(r, 400));

      // Save duration modifiers if roomId is provided
      if (roomId && durationModifiers.length > 0) {
        console.log(
          "[PricingDetail] Saving duration modifiers:",
          durationModifiers
        );
        for (const modifier of durationModifiers) {
          await pricingService.createPricingModifier({
            roomId,
            type: "duration_discount",
            minDurationMinutes: Number(modifier.minDuration) * 60,
            maxDurationMinutes: modifier.maxDuration
              ? Number(modifier.maxDuration) * 60
              : undefined,
            discountType: modifier.discountType,
            discountValue: Number(modifier.discountValue),
            priority: 10,
            isActive: true,
          });
        }
      }

      // Save group modifiers if roomId is provided
      if (roomId && groupModifiers.length > 0) {
        console.log("[PricingDetail] Saving group modifiers:", groupModifiers);
        for (const modifier of groupModifiers) {
          await pricingService.createPricingModifier({
            roomId,
            type:
              modifier.modifierType === "discount"
                ? "guest_discount"
                : "guest_surcharge",
            minGuests: Number(modifier.minGuests),
            maxGuests: modifier.maxGuests
              ? Number(modifier.maxGuests)
              : undefined,
            discountType: modifier.discountType,
            discountValue: Number(modifier.discountValue),
            priority: 10,
            isActive: true,
          });
        }
      }

      const dt = Date.now() - t0;
      console.log("[PricingDetail] Save success in", dt, "ms", {
        tiersCount: payload.timeTiers.length,
        extraMode: payload.extraPerson.mode,
        deposit: payload.deposit,
        durationModifiersCount: durationModifiers.length,
        groupModifiersCount: groupModifiers.length,
      });

      setSaving(false);
      Alert.alert("Saved", "Pricing details have been saved.");
      router.back();
    } catch (e: any) {
      const dt = Date.now() - t0;
      console.error("[PricingDetail] Save failed in", dt, "ms", e);
      setSaving(false);
      Alert.alert("Save failed", e?.message ?? "Unknown error");
    }
  }, [
    validate,
    day,
    month,
    year,
    strategyName,
    minHour,
    minPeople,
    minPrice,
    tiers,
    extraMode,
    guestNum,
    extraCharge,
    deposit,
    roomId,
    durationModifiers,
    groupModifiers,
    router,
  ]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.background }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={
          Platform.OS === "ios" ? Math.max(44, inset.top) : 0
        }
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderBottomWidth: 1,
            borderBottomColor: palette.border,
          }}
        >
          <Pressable
            disabled={saving}
            hitSlop={8}
            onPress={() => router.back()}
          >
            <Ionicons color={palette.text} name="chevron-back" size={22} />
          </Pressable>

          <View style={{ flex: 1, alignItems: "center" }}>
            <ThemedText style={{ fontSize: 18, fontWeight: "700" }}>
              {dateStr}
            </ThemedText>
            {strategyName ? (
              <ThemedText style={{ fontSize: 12, color: palette.icon }}>
                {strategyName}
              </ThemedText>
            ) : null}
          </View>

          <Pressable
            accessibilityLabel="Save pricing"
            accessibilityRole="button"
            disabled={saving}
            onPress={handleSave}
            style={{
              paddingHorizontal: 10,
              paddingVertical: 6,
              backgroundColor: saving ? palette.icon : palette.tint,
              borderRadius: 8,
              opacity: saving ? 0.8 : 1,
            }}
          >
            <ThemedText style={{ color: "#fff", fontWeight: "600" }}>
              {saving ? "Saving…" : "Save"}
            </ThemedText>
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={{
            padding: 16,
            paddingBottom: 24 + inset.bottom,
          }}
          contentInsetAdjustmentBehavior="automatic"
          keyboardShouldPersistTaps="always"
          overScrollMode="always"
          removeClippedSubviews={Platform.OS === "android"}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
        >
          {/* Keep above-the-fold small so first frame is instant */}
          <SectionCard palette={palette}>
            <ThemedText style={{ fontWeight: "700", marginBottom: 8 }}>
              Pricing Strategy
            </ThemedText>
            <TextInput
              onChangeText={setStrategyName}
              onSubmitEditing={Keyboard.dismiss}
              placeholder="Strategy name (required)"
              placeholderTextColor={palette.icon}
              returnKeyType="done"
              style={{
                borderWidth: 1,
                borderColor: palette.border,
                borderRadius: 10,
                paddingHorizontal: 10,
                paddingVertical: 8,
                color: palette.text,
              }}
              value={strategyName}
            />
          </SectionCard>

          {/* Defer the heavier sections until after first interactions */}
          {hydrated ? (
            <>
              <View style={{ height: 16 }} />
              <SectionCard palette={palette}>
                <ThemedText style={{ fontWeight: "700", marginBottom: 8 }}>
                  Basic Requirements
                </ThemedText>
                <LabeledNumberInput
                  keyboard="number-pad"
                  label="Minimum hour"
                  onChangeText={(t) => {
                    const v = sanitizeInt(t);
                    setMinHour(v);
                    setTiers((prev) => {
                      if (!prev.length) {
                        return prev;
                      }
                      const next = [...prev];
                      next[0] = { ...next[0], minHours: v };
                      return next;
                    });
                  }}
                  palette={palette}
                  value={minHour}
                />
                <LabeledNumberInput
                  keyboard="number-pad"
                  label="Minimum number of people"
                  onChangeText={(t) => setMinPeople(sanitizeInt(t))}
                  palette={palette}
                  value={minPeople}
                />
                <LabeledNumberInput
                  label="Minimum price (booking)"
                  onChangeText={(t) => {
                    const v = sanitizeDecimal(t);
                    setMinPrice(v);
                    setTiers((prev) => {
                      if (!prev.length) {
                        return prev;
                      }
                      const next = [...prev];
                      next[0] = { ...next[0], minPrice: v };
                      return next;
                    });
                  }}
                  palette={palette}
                  value={minPrice}
                />
              </SectionCard>

              <View style={{ height: 16 }} />
              <SectionCard palette={palette}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <ThemedText style={{ fontWeight: "700" }}>
                    Time Tiers
                  </ThemedText>
                  <Pressable
                    disabled={saving}
                    onPress={addTier}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: palette.tint,
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                      borderRadius: 8,
                      opacity: saving ? 0.6 : 1,
                    }}
                  >
                    <Ionicons color="#fff" name="add" size={14} />
                    <ThemedText
                      style={{ color: "#fff", marginLeft: 6, fontSize: 12 }}
                    >
                      Add tier
                    </ThemedText>
                  </Pressable>
                </View>

                {tiers.map((t, idx) => (
                  <View
                    key={t.id}
                    style={{
                      borderWidth: 1,
                      borderColor: palette.border,
                      borderRadius: 10,
                      padding: 10,
                      marginBottom: 10,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 6,
                      }}
                    >
                      <ThemedText style={{ fontWeight: "600" }}>
                        Tier #{idx + 1}
                      </ThemedText>
                      {idx > 0 ? (
                        <Pressable
                          disabled={saving}
                          hitSlop={8}
                          onPress={() => removeTier(t.id)}
                        >
                          <Ionicons
                            color={palette.icon}
                            name="trash-outline"
                            size={18}
                          />
                        </Pressable>
                      ) : null}
                    </View>

                    <LabeledNumberInput
                      keyboard="number-pad"
                      label="Minimum hours"
                      onChangeText={(val) =>
                        updateTier(t.id, { minHours: sanitizeInt(val) })
                      }
                      palette={palette}
                      value={t.minHours}
                    />
                    <LabeledNumberInput
                      label="Price per hour"
                      onChangeText={(val) =>
                        updateTier(t.id, { pricePerHour: sanitizeDecimal(val) })
                      }
                      palette={palette}
                      value={t.pricePerHour}
                    />

                    {/* Auto-calculated minimum price */}
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginTop: 8,
                        paddingTop: 8,
                        borderTopWidth: 1,
                        borderTopColor: palette.border,
                      }}
                    >
                      <ThemedText style={{ fontSize: 14, color: palette.icon }}>
                        Minimum price (this tier)
                      </ThemedText>
                      <ThemedText style={{ fontSize: 16, fontWeight: "600" }}>
                        ${(() => {
                          const hours = Number(t.minHours || 0);
                          const perHour = Number(t.pricePerHour || 0);
                          const people = Number(minPeople || 0);
                          const calculated = hours * perHour * people;
                          return calculated > 0
                            ? calculated.toFixed(2)
                            : "0.00";
                        })()}
                      </ThemedText>
                    </View>
                  </View>
                ))}
              </SectionCard>

              <View style={{ height: 16 }} />
              <SectionCard palette={palette}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <ThemedText style={{ fontWeight: "700" }}>
                    Duration Discounts
                  </ThemedText>
                  <Pressable
                    disabled={saving}
                    onPress={addDurationModifier}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: palette.tint,
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                      borderRadius: 8,
                      opacity: saving ? 0.6 : 1,
                    }}
                  >
                    <Ionicons color="#fff" name="add" size={14} />
                    <ThemedText
                      style={{ color: "#fff", marginLeft: 6, fontSize: 12 }}
                    >
                      Add discount
                    </ThemedText>
                  </Pressable>
                </View>

                {durationModifiers.length === 0 ? (
                  <ThemedText
                    style={{
                      fontSize: 13,
                      color: palette.icon,
                      textAlign: "center",
                      paddingVertical: 12,
                    }}
                  >
                    No duration discounts configured
                  </ThemedText>
                ) : null}

                {durationModifiers.map((m, idx) => (
                  <View
                    key={m.id}
                    style={{
                      borderWidth: 1,
                      borderColor: palette.border,
                      borderRadius: 10,
                      padding: 10,
                      marginBottom: 10,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 6,
                      }}
                    >
                      <ThemedText style={{ fontWeight: "600" }}>
                        Discount #{idx + 1}
                      </ThemedText>
                      <Pressable
                        disabled={saving}
                        hitSlop={8}
                        onPress={() => removeDurationModifier(m.id)}
                      >
                        <Ionicons
                          color={palette.icon}
                          name="trash-outline"
                          size={18}
                        />
                      </Pressable>
                    </View>

                    <LabeledNumberInput
                      keyboard="number-pad"
                      label="Min duration (hours)"
                      onChangeText={(val) =>
                        updateDurationModifier(m.id, {
                          minDuration: sanitizeInt(val),
                        })
                      }
                      palette={palette}
                      value={m.minDuration}
                    />
                    <LabeledNumberInput
                      keyboard="number-pad"
                      label="Max duration (hours)"
                      onChangeText={(val) =>
                        updateDurationModifier(m.id, {
                          maxDuration: sanitizeInt(val),
                        })
                      }
                      palette={palette}
                      placeholder="Optional"
                      value={m.maxDuration}
                    />

                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 10,
                      }}
                    >
                      <ThemedText style={{ fontSize: 14 }}>
                        Discount type
                      </ThemedText>
                      <View style={{ flexDirection: "row", gap: 6 }}>
                        {(["percentage", "fixed"] as const).map((type) => {
                          const active = m.discountType === type;
                          return (
                            <Pressable
                              disabled={saving}
                              key={type}
                              onPress={() =>
                                updateDurationModifier(m.id, {
                                  discountType: type,
                                })
                              }
                              style={{
                                paddingHorizontal: 10,
                                paddingVertical: 4,
                                borderWidth: 1,
                                borderColor: palette.border,
                                borderRadius: 8,
                                backgroundColor: active
                                  ? palette.tint
                                  : palette.surface,
                                opacity: saving ? 0.6 : 1,
                              }}
                            >
                              <ThemedText
                                style={{
                                  fontSize: 11,
                                  color: active ? "#fff" : palette.text,
                                  fontWeight: "600",
                                }}
                              >
                                {type === "percentage" ? "%" : "$"}
                              </ThemedText>
                            </Pressable>
                          );
                        })}
                      </View>
                    </View>

                    <LabeledNumberInput
                      label={
                        m.discountType === "percentage"
                          ? "Discount (%)"
                          : "Discount ($)"
                      }
                      onChangeText={(val) =>
                        updateDurationModifier(m.id, {
                          discountValue: sanitizeDecimal(val),
                        })
                      }
                      palette={palette}
                      value={m.discountValue}
                    />
                  </View>
                ))}
              </SectionCard>

              <View style={{ height: 16 }} />
              <SectionCard palette={palette}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <ThemedText style={{ fontWeight: "700" }}>
                    Group Pricing
                  </ThemedText>
                  <Pressable
                    disabled={saving}
                    onPress={addGroupModifier}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: palette.tint,
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                      borderRadius: 8,
                      opacity: saving ? 0.6 : 1,
                    }}
                  >
                    <Ionicons color="#fff" name="add" size={14} />
                    <ThemedText
                      style={{ color: "#fff", marginLeft: 6, fontSize: 12 }}
                    >
                      Add modifier
                    </ThemedText>
                  </Pressable>
                </View>

                {groupModifiers.length === 0 ? (
                  <ThemedText
                    style={{
                      fontSize: 13,
                      color: palette.icon,
                      textAlign: "center",
                      paddingVertical: 12,
                    }}
                  >
                    No group pricing configured
                  </ThemedText>
                ) : null}

                {groupModifiers.map((m, idx) => (
                  <View
                    key={m.id}
                    style={{
                      borderWidth: 1,
                      borderColor: palette.border,
                      borderRadius: 10,
                      padding: 10,
                      marginBottom: 10,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 6,
                      }}
                    >
                      <ThemedText style={{ fontWeight: "600" }}>
                        Modifier #{idx + 1}
                      </ThemedText>
                      <Pressable
                        disabled={saving}
                        hitSlop={8}
                        onPress={() => removeGroupModifier(m.id)}
                      >
                        <Ionicons
                          color={palette.icon}
                          name="trash-outline"
                          size={18}
                        />
                      </Pressable>
                    </View>

                    <LabeledNumberInput
                      keyboard="number-pad"
                      label="Min guests"
                      onChangeText={(val) =>
                        updateGroupModifier(m.id, {
                          minGuests: sanitizeInt(val),
                        })
                      }
                      palette={palette}
                      value={m.minGuests}
                    />
                    <LabeledNumberInput
                      keyboard="number-pad"
                      label="Max guests"
                      onChangeText={(val) =>
                        updateGroupModifier(m.id, {
                          maxGuests: sanitizeInt(val),
                        })
                      }
                      palette={palette}
                      placeholder="Optional"
                      value={m.maxGuests}
                    />

                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 10,
                      }}
                    >
                      <ThemedText style={{ fontSize: 14 }}>
                        Modifier type
                      </ThemedText>
                      <View style={{ flexDirection: "row", gap: 6 }}>
                        {(["discount", "surcharge"] as const).map((type) => {
                          const active = m.modifierType === type;
                          return (
                            <Pressable
                              disabled={saving}
                              key={type}
                              onPress={() =>
                                updateGroupModifier(m.id, {
                                  modifierType: type,
                                })
                              }
                              style={{
                                paddingHorizontal: 10,
                                paddingVertical: 4,
                                borderWidth: 1,
                                borderColor: palette.border,
                                borderRadius: 8,
                                backgroundColor: active
                                  ? palette.tint
                                  : palette.surface,
                                opacity: saving ? 0.6 : 1,
                              }}
                            >
                              <ThemedText
                                style={{
                                  fontSize: 11,
                                  color: active ? "#fff" : palette.text,
                                  fontWeight: "600",
                                }}
                              >
                                {type === "discount" ? "Discount" : "Surcharge"}
                              </ThemedText>
                            </Pressable>
                          );
                        })}
                      </View>
                    </View>

                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 10,
                      }}
                    >
                      <ThemedText style={{ fontSize: 14 }}>
                        Value type
                      </ThemedText>
                      <View style={{ flexDirection: "row", gap: 6 }}>
                        {(["percentage", "fixed"] as const).map((type) => {
                          const active = m.discountType === type;
                          return (
                            <Pressable
                              disabled={saving}
                              key={type}
                              onPress={() =>
                                updateGroupModifier(m.id, {
                                  discountType: type,
                                })
                              }
                              style={{
                                paddingHorizontal: 10,
                                paddingVertical: 4,
                                borderWidth: 1,
                                borderColor: palette.border,
                                borderRadius: 8,
                                backgroundColor: active
                                  ? palette.tint
                                  : palette.surface,
                                opacity: saving ? 0.6 : 1,
                              }}
                            >
                              <ThemedText
                                style={{
                                  fontSize: 11,
                                  color: active ? "#fff" : palette.text,
                                  fontWeight: "600",
                                }}
                              >
                                {type === "percentage" ? "%" : "$"}
                              </ThemedText>
                            </Pressable>
                          );
                        })}
                      </View>
                    </View>

                    <LabeledNumberInput
                      label={
                        m.discountType === "percentage"
                          ? `${m.modifierType === "discount" ? "Discount" : "Surcharge"} (%)`
                          : `${m.modifierType === "discount" ? "Discount" : "Surcharge"} ($)`
                      }
                      onChangeText={(val) =>
                        updateGroupModifier(m.id, {
                          discountValue: sanitizeDecimal(val),
                        })
                      }
                      palette={palette}
                      value={m.discountValue}
                    />
                  </View>
                ))}
              </SectionCard>

              <View style={{ height: 16 }} />
              <SectionCard palette={palette}>
                <ThemedText style={{ fontWeight: "700", marginBottom: 8 }}>
                  Extra Person Charge
                </ThemedText>
                <View
                  style={{ flexDirection: "row", gap: 8, marginBottom: 10 }}
                >
                  {(["off", "fixed", "hour"] as const).map((m) => {
                    const active = extraMode === m;
                    return (
                      <Pressable
                        disabled={saving}
                        key={m}
                        onPress={() => setExtraMode(m)}
                        style={{
                          paddingHorizontal: 12,
                          paddingVertical: 6,
                          borderWidth: 1,
                          borderColor: palette.border,
                          borderRadius: 10,
                          backgroundColor: active
                            ? palette.tint
                            : palette.surface,
                          opacity: saving ? 0.6 : 1,
                        }}
                      >
                        <ThemedText
                          style={{
                            fontSize: 12,
                            color: active ? "#fff" : palette.text,
                            fontWeight: "600",
                          }}
                        >
                          {m === "off"
                            ? "Off"
                            : m === "fixed"
                              ? "Per person (fixed)"
                              : "Per hour"}
                        </ThemedText>
                      </Pressable>
                    );
                  })}
                </View>

                <LabeledNumberInput
                  disabled={extraMode === "off"}
                  keyboard="number-pad"
                  label="Included guest number"
                  onChangeText={(t) => setGuestNum(sanitizeInt(t))}
                  palette={palette}
                  value={guestNum}
                />
                <LabeledNumberInput
                  disabled={extraMode === "off"}
                  label={
                    extraMode === "hour"
                      ? "Extra charge (per hour)"
                      : "Extra charge (per person)"
                  }
                  onChangeText={(t) => setExtraCharge(sanitizeDecimal(t))}
                  palette={palette}
                  value={extraCharge}
                />
              </SectionCard>

              <View style={{ height: 16 }} />
              <SectionCard palette={palette}>
                <ThemedText style={{ fontWeight: "700", marginBottom: 8 }}>
                  Deposit
                </ThemedText>
                <LabeledNumberInput
                  label="Deposit amount"
                  onChangeText={(t) => setDeposit(sanitizeDecimal(t))}
                  palette={palette}
                  value={deposit}
                />

                <View style={{ alignItems: "flex-end", marginTop: 6 }}>
                  <Pressable
                    disabled={saving}
                    onPress={handleSave}
                    style={{
                      backgroundColor: saving ? palette.icon : palette.tint,
                      borderRadius: 10,
                      paddingHorizontal: 16,
                      paddingVertical: 10,
                      alignSelf: "flex-end",
                      opacity: saving ? 0.8 : 1,
                    }}
                  >
                    <ThemedText style={{ color: "#fff", fontWeight: "700" }}>
                      {saving ? "Saving…" : "Save"}
                    </ThemedText>
                  </Pressable>
                </View>
              </SectionCard>
            </>
          ) : (
            // Lightweight placeholder so scrolling is immediately responsive
            <View style={{ paddingVertical: 32, alignItems: "center" }}>
              <ActivityIndicator color={palette.tint} size="small" />
              <ThemedText
                style={{ marginTop: 8, color: palette.icon, fontSize: 12 }}
              >
                Preparing details…
              </ThemedText>
            </View>
          )}
        </ScrollView>

        {/* Saving popup */}
        <Modal
          animationType="fade"
          statusBarTranslucent
          transparent
          visible={saving}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.35)",
              alignItems: "center",
              justifyContent: "center",
              padding: 24,
            }}
          >
            <View
              style={{
                width: 240,
                borderRadius: 16,
                backgroundColor: palette.surface,
                borderWidth: 1,
                borderColor: palette.border,
                padding: 20,
                alignItems: "center",
              }}
            >
              <ActivityIndicator color={palette.tint} size="large" />
              <ThemedText style={{ marginTop: 12, fontWeight: "600" }}>
                Saving…
              </ThemedText>
              <ThemedText
                style={{
                  marginTop: 4,
                  fontSize: 12,
                  color: palette.icon,
                  textAlign: "center",
                }}
              >
                Please wait while we save your pricing details.
              </ThemedText>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
