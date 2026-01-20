import { Colors } from "@app/constants/Colors";
import { useColorScheme } from "nativewind";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  I18nManager,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type Range = { min: number; max: number };
type Preset = { label: string; min: number; max: number };

type PriceRangeFilterProps = {
  priceRange: Range;
  onChange: (priceRange: Range) => void;
  currency?: string;
  maxCap?: number;
  presets?: Preset[];
  testID?: string;
};

const DEFAULT_PRESETS: Preset[] = [
  { label: "Any", min: 0, max: 5000 },
  { label: "Under $100", min: 0, max: 100 },
  { label: "$100 – $300", min: 100, max: 300 },
  { label: "$300 – $500", min: 300, max: 500 },
  { label: "$500 – $1000", min: 500, max: 1000 },
  { label: "$1000+", min: 1000, max: 5000 },
];

// helpers
const withAlpha = (hex: string, a: number) =>
  `${hex}${Math.round(Math.min(1, Math.max(0, a)) * 255)
    .toString(16)
    .padStart(2, "0")}`;

export default function PriceRangeFilter({
  priceRange,
  onChange,
  currency = "$",
  maxCap = 5000,
  presets = DEFAULT_PRESETS,
  testID = "price-range-filter",
}: PriceRangeFilterProps) {
  const { colorScheme = "light" } = useColorScheme();
  const theme = Colors[colorScheme];
  const isRTL = I18nManager.isRTL;

  // Themed tokens
  const chipSelectedBg = useMemo(
    () => withAlpha(theme.tint, 0.12),
    [theme.tint]
  );
  const dividerColor = useMemo(() => withAlpha(theme.icon, 0.25), [theme.icon]);
  const borderDefault = useMemo(
    () => withAlpha(theme.icon, 0.35),
    [theme.icon]
  );
  const hintText = useMemo(() => withAlpha(theme.icon, 0.9), [theme.icon]);

  // Disabled Apply (neutral so visible in dark mode)
  const disabledBg = useMemo(() => withAlpha(theme.icon, 0.18), [theme.icon]);
  const disabledText = useMemo(() => withAlpha(theme.text, 0.85), [theme.text]);
  const disabledBorder = useMemo(
    () => withAlpha(theme.icon, 0.45),
    [theme.icon]
  );

  const [minInput, setMinInput] = useState(String(priceRange.min));
  const [maxInput, setMaxInput] = useState(
    priceRange.max >= maxCap ? "" : String(priceRange.max)
  );
  const [touched, setTouched] = useState<{ min: boolean; max: boolean }>({
    min: false,
    max: false,
  });

  useEffect(() => {
    setMinInput(String(priceRange.min));
    setMaxInput(priceRange.max >= maxCap ? "" : String(priceRange.max));
    setTouched({ min: false, max: false });
  }, [priceRange, maxCap]);

  const clamp = useCallback(
    (n: number) => Math.max(0, Math.min(maxCap, n)),
    [maxCap]
  );

  const toNum = useCallback(
    (value: string, fallback: number) => {
      const digitsOnly = value.replace(/[^\d]/g, "");
      if (!digitsOnly) {
        return fallback;
      }
      return clamp(Number.parseInt(digitsOnly, 10));
    },
    [clamp]
  );

  const parsedMin = useMemo(() => toNum(minInput, 0), [minInput, toNum]);
  const parsedMax = useMemo(
    () => toNum(maxInput, maxCap),
    [maxInput, toNum, maxCap]
  );

  const hasError = parsedMin > parsedMax;
  const nothingChanged =
    !hasError &&
    parsedMin === priceRange.min &&
    (parsedMax === priceRange.max ||
      (parsedMax === maxCap && priceRange.max >= maxCap));

  const applyCustomRange = useCallback(() => {
    const min = hasError ? parsedMax : parsedMin;
    const max = parsedMax;
    onChange({ min, max });
  }, [hasError, parsedMax, parsedMin, onChange]);

  const selectPreset = useCallback(
    (preset: Preset) => {
      onChange({ min: clamp(preset.min), max: clamp(preset.max) });
    },
    [onChange, clamp]
  );

  const chipIsSelected = (p: Range) =>
    priceRange.min === p.min && priceRange.max === p.max;

  return (
    <View
      accessibilityLabel="Price Range Filter"
      accessible
      className="m-4 rounded-2xl p-4"
      style={{
        backgroundColor: theme.background,
        shadowColor: withAlpha(theme.text, 0.5),
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
        elevation: 3,
        borderWidth: 1,
        borderColor: borderDefault,
      }}
      testID={testID}
    >
      <Text className="mb-3 font-bold text-lg" style={{ color: theme.text }}>
        Price Range
      </Text>

      {/* Preset chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginBottom: 14 }}
      >
        {presets.map((p) => {
          const selected = chipIsSelected(p);
          return (
            <TouchableOpacity
              accessibilityLabel={`Preset: ${p.label}`}
              accessibilityRole="button"
              className="mr-2 rounded-full border px-3 py-2"
              key={`preset-${p.label}`}
              onPress={() => selectPreset(p)}
              style={{
                borderColor: selected ? theme.tint : borderDefault,
                backgroundColor: selected ? chipSelectedBg : "transparent",
                minHeight: 36,
                justifyContent: "center",
              }}
            >
              <Text
                className="text-sm"
                numberOfLines={1}
                style={{
                  color: selected ? theme.tint : theme.text,
                  fontWeight: selected ? "600" : "400",
                }}
              >
                {p.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Divider */}
      <View
        style={{
          borderTopWidth: 1,
          borderTopColor: dividerColor,
          marginBottom: 12,
        }}
      />

      <Text className="mb-2 text-base" style={{ color: theme.text }}>
        Custom range
      </Text>

      {/* Inputs */}
      <View
        className="mb-3 flex-row items-center"
        style={{ flexDirection: isRTL ? "row-reverse" : "row" }}
      >
        {/* Min */}
        <View
          className="flex-1 flex-row items-center rounded-xl px-3"
          style={{
            borderWidth: 1,
            borderColor:
              touched.min && hasError
                ? theme.tint
                : touched.min
                  ? theme.tint
                  : borderDefault,
          }}
        >
          <Text className="mr-1" style={{ color: hintText }}>
            {currency}
          </Text>
          <TextInput
            accessibilityLabel="Minimum price"
            className="flex-1 py-3 text-base"
            keyboardType="number-pad"
            maxLength={6}
            onBlur={() => setTouched((s) => ({ ...s, min: true }))}
            onChangeText={(t) => setMinInput(t.replace(/[^\d]/g, ""))}
            placeholder="Min"
            placeholderTextColor={hintText}
            returnKeyType="next"
            style={{ color: theme.text }}
            value={minInput}
          />
        </View>

        <Text style={{ color: theme.text, marginHorizontal: 10 }}>–</Text>

        {/* Max */}
        <View
          className="flex-1 flex-row items-center rounded-xl px-3"
          style={{
            borderWidth: 1,
            borderColor:
              touched.max && hasError
                ? theme.tint
                : touched.max
                  ? theme.tint
                  : borderDefault,
          }}
        >
          <Text className="mr-1" style={{ color: hintText }}>
            {currency}
          </Text>
          <TextInput
            accessibilityLabel="Maximum price"
            className="flex-1 py-3 text-base"
            keyboardType="number-pad"
            maxLength={6}
            onBlur={() => setTouched((s) => ({ ...s, max: true }))}
            onChangeText={(t) => setMaxInput(t.replace(/[^\d]/g, ""))}
            onSubmitEditing={applyCustomRange}
            placeholder={`Max${maxCap ? ` (≤ ${currency}${maxCap})` : ""}`}
            placeholderTextColor={hintText}
            returnKeyType="done"
            style={{ color: theme.text }}
            value={maxInput}
          />
        </View>
      </View>

      {/* Helper text */}
      <Text
        className="mb-3"
        style={{ color: hasError ? theme.tint : hintText, fontSize: 12 }}
      >
        {hasError
          ? "Minimum cannot exceed maximum. We’ll snap min to max when you apply."
          : `Tip: Leave “Max” empty for “No upper limit” (Max ≤ ${currency}${maxCap}).`}
      </Text>

      {/* Apply */}
      <TouchableOpacity
        accessibilityLabel="Apply price range"
        accessibilityRole="button"
        className="items-center rounded-xl py-3"
        disabled={nothingChanged}
        onPress={applyCustomRange}
        style={{
          backgroundColor: nothingChanged || hasError ? disabledBg : theme.tint,
          borderWidth: nothingChanged || hasError ? 1 : 0,
          borderColor:
            nothingChanged || hasError ? disabledBorder : "transparent",
          // subtle lift so disabled is still visible on dark bg
          shadowColor: withAlpha(theme.text, 0.4),
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 4,
          elevation: nothingChanged || hasError ? 2 : 3,
        }}
      >
        <Text
          className="font-bold"
          style={{
            color:
              nothingChanged || hasError
                ? disabledText
                : Colors.dark.background,
          }}
        >
          Apply
        </Text>
      </TouchableOpacity>
    </View>
  );
}
