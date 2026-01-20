import { Colors } from "@app/constants/Colors";
import { useColorScheme } from "nativewind";
import { useCallback, useEffect, useMemo, useState } from "react";
import { I18nManager, Text, TouchableOpacity, View } from "react-native";

type RatingPreset = { label: string; value: number }; // ← renamed to avoid conflicts

type RatingFilterProps = {
  rating: number;
  onChange: (rating: number) => void;
  presets?: RatingPreset[]; // ← array type
  maxStars?: 3 | 4 | 5;
  showApply?: boolean;
  enableCustomPicker?: boolean;
  testID?: string;
};

const DEFAULT_PRESETS: RatingPreset[] = [
  // ← explicitly typed array
  { label: "Any", value: 0 },
  { label: "3+", value: 3 },
  { label: "4+", value: 4 },
  { label: "5", value: 5 },
];

const withAlpha = (hex: string, a: number) =>
  `${hex}${Math.round(Math.min(1, Math.max(0, a)) * 255)
    .toString(16)
    .padStart(2, "0")}`;

export default function RatingFilter({
  rating,
  onChange,
  presets = DEFAULT_PRESETS, // ← uses RatingPreset[]
  maxStars = 5,
  showApply = true,
  enableCustomPicker = true,
  testID = "rating-filter",
}: RatingFilterProps) {
  const { colorScheme = "light" } = useColorScheme();
  const theme = Colors[colorScheme];
  const isRTL = I18nManager.isRTL;

  const [customRating, setCustomRating] = useState<number>(rating);
  useEffect(() => setCustomRating(rating), [rating]);

  const chipSelectedBg = useMemo(
    () => withAlpha(theme.tint, 0.12),
    [theme.tint]
  );
  const dividerColor = useMemo(() => withAlpha(theme.icon, 0.25), [theme.icon]);
  const borderDefault = useMemo(
    () => withAlpha(theme.icon, 0.35),
    [theme.icon]
  );
  const mutedText = useMemo(() => withAlpha(theme.icon, 0.9), [theme.icon]);
  const surfaceSubtle = useMemo(
    () => withAlpha(theme.icon, 0.07),
    [theme.icon]
  );
  const disabledBg = useMemo(() => withAlpha(theme.icon, 0.18), [theme.icon]);
  const disabledText = useMemo(() => withAlpha(theme.text, 0.85), [theme.text]);
  const disabledBorder = useMemo(
    () => withAlpha(theme.icon, 0.45),
    [theme.icon]
  );

  const clamp = useCallback(
    (v: number) => Math.max(0, Math.min(maxStars, v)),
    [maxStars]
  );
  const nothingChanged = customRating === rating;

  const selectRatingOption = useCallback(
    (value: number) => onChange(clamp(value)),
    [onChange, clamp]
  );
  const applyCustomRating = useCallback(
    () => onChange(clamp(customRating)),
    [customRating, onChange, clamp]
  );
  const dec = useCallback(() => setCustomRating((v) => clamp(v - 1)), [clamp]);
  const inc = useCallback(() => setCustomRating((v) => clamp(v + 1)), [clamp]);

  const Stars = ({ value }: { value: number }) => {
    const filled = "★".repeat(value);
    const empty = "☆".repeat(maxStars - value);
    return (
      <Text style={{ color: theme.tint, fontSize: 18, letterSpacing: 1 }}>
        {filled}
        <Text style={{ color: mutedText }}>{empty}</Text>
      </Text>
    );
  };

  const chipIsSelected = (v: number) => rating === v;

  return (
    <View
      accessibilityLabel="Rating Filter"
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
        Rating
      </Text>

      {/* Preset chips */}
      <View className="mb-3 flex-row flex-wrap" style={{ gap: 8 }}>
        {presets.map((p: RatingPreset) => {
          const selected = chipIsSelected(p.value);
          return (
            <TouchableOpacity
              accessibilityLabel={`Preset: ${p.label}`}
              accessibilityRole="button"
              className="rounded-full border px-3 py-2"
              key={`preset-${p.label}`}
              onPress={() => selectRatingOption(p.value)}
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
      </View>

      {/* Divider */}
      <View
        style={{
          borderTopWidth: 1,
          borderTopColor: dividerColor,
          marginBottom: 12,
        }}
      />

      {/* Custom picker */}
      {enableCustomPicker && (
        <>
          <View
            className="mb-3 flex-row items-center justify-center"
            style={{ flexDirection: isRTL ? "row-reverse" : "row" }}
          >
            <TouchableOpacity
              accessibilityLabel="Decrease rating"
              accessibilityRole="button"
              className="mr-3 rounded-xl px-3 py-2"
              onPress={dec}
              style={{
                borderWidth: 1,
                borderColor: borderDefault,
                backgroundColor: surfaceSubtle,
              }}
            >
              <Text style={{ color: theme.text, fontSize: 18 }}>–</Text>
            </TouchableOpacity>

            <View
              className="rounded-full px-4 py-2"
              style={{
                borderWidth: 1,
                borderColor: theme.tint,
                backgroundColor: chipSelectedBg,
                minWidth: 72,
                alignItems: "center",
              }}
            >
              <Text style={{ color: theme.tint, fontWeight: "700" }}>
                {customRating === 0 ? "Any" : `${customRating}+`}
              </Text>
            </View>

            <TouchableOpacity
              accessibilityLabel="Increase rating"
              accessibilityRole="button"
              className="ml-3 rounded-xl px-3 py-2"
              onPress={inc}
              style={{
                borderWidth: 1,
                borderColor: borderDefault,
                backgroundColor: surfaceSubtle,
              }}
            >
              <Text style={{ color: theme.text, fontSize: 18 }}>+</Text>
            </TouchableOpacity>
          </View>

          <View className="mb-3 items-center">
            <Stars value={customRating} />
            <Text style={{ color: mutedText, marginTop: 6, fontSize: 12 }}>
              {customRating === 0
                ? `Any rating (0–${maxStars})`
                : `Showing ${customRating}–${maxStars} stars`}
            </Text>
          </View>
        </>
      )}

      {/* Apply */}
      {showApply && (
        <TouchableOpacity
          accessibilityLabel="Apply rating"
          accessibilityRole="button"
          className="items-center rounded-xl py-3"
          disabled={nothingChanged}
          onPress={applyCustomRating}
          style={{
            backgroundColor: nothingChanged ? disabledBg : theme.tint,
            borderWidth: nothingChanged ? 1 : 0,
            borderColor: nothingChanged ? disabledBorder : "transparent",
            shadowColor: withAlpha(theme.text, 0.4),
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 4,
            elevation: nothingChanged ? 2 : 3,
          }}
        >
          <Text
            className="font-bold"
            style={{
              color: nothingChanged ? disabledText : Colors.dark.background,
            }}
          >
            Apply
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
