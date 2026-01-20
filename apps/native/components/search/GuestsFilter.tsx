import { IconSymbol } from "@app/components/ui/IconSymbol";
import { Colors } from "@app/constants/Colors";
import { useColorScheme } from "nativewind";
import { useEffect, useMemo, useState } from "react";
import { I18nManager, Text, TouchableOpacity, View } from "react-native";

type GuestsFilterProps = {
  guests: number;
  onChange: (guests: number) => void;
};

// helpers
const withAlpha = (hex: string, a: number) =>
  `${hex}${Math.round(Math.min(1, Math.max(0, a)) * 255)
    .toString(16)
    .padStart(2, "0")}`;

export default function GuestsFilter({ guests, onChange }: GuestsFilterProps) {
  const { colorScheme = "light" } = useColorScheme();
  const theme = Colors[colorScheme];
  const isRTL = I18nManager.isRTL;

  // themed tokens
  const chipSelectedBg = useMemo(
    () => withAlpha(theme.tint, 0.12),
    [theme.tint]
  );
  const dividerColor = useMemo(() => withAlpha(theme.icon, 0.25), [theme.icon]);
  const borderDefault = useMemo(
    () => withAlpha(theme.icon, 0.35),
    [theme.icon]
  );
  const surfaceSubtle = useMemo(
    () => withAlpha(theme.icon, 0.07),
    [theme.icon]
  );
  const disabledIcon = useMemo(() => withAlpha(theme.icon, 0.6), [theme.icon]);

  // 🔧 Disabled button uses neutrals (not tint) so it stays visible in dark mode
  const disabledBg = useMemo(() => withAlpha(theme.icon, 0.18), [theme.icon]);
  const disabledText = useMemo(() => withAlpha(theme.text, 0.85), [theme.text]);
  const disabledBorder = useMemo(
    () => withAlpha(theme.icon, 0.45),
    [theme.icon]
  );

  const min = 1,
    max = 20;

  const [value, setValue] = useState<number>(guests);
  useEffect(() => setValue(guests), [guests]);

  const canDec = value > min;
  const canInc = value < max;
  const decrease = () => setValue((v) => Math.max(min, v - 1));
  const increase = () => setValue((v) => Math.min(max, v + 1));

  const changed = value !== guests;
  const apply = () => onChange(value);

  return (
    <View
      accessibilityLabel="Guests Filter"
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
    >
      <Text className="mb-3 font-bold text-lg" style={{ color: theme.text }}>
        Number of Guests
      </Text>

      {/* Counter */}
      <View
        className="mb-3 flex-row items-center justify-center"
        style={{ flexDirection: isRTL ? "row-reverse" : "row" }}
      >
        <TouchableOpacity
          accessibilityLabel="Decrease guests"
          accessibilityRole="button"
          className="rounded-xl px-3 py-2"
          disabled={!canDec}
          onPress={decrease}
          style={{
            borderWidth: 1,
            borderColor: borderDefault,
            backgroundColor: surfaceSubtle,
            opacity: canDec ? 1 : 0.5,
          }}
        >
          <IconSymbol
            color={canDec ? theme.tint : disabledIcon}
            name="minus"
            size={16}
          />
        </TouchableOpacity>

        {/* Value pill */}
        <View
          accessibilityLabel={`Guests value: ${value}`}
          className="mx-3 rounded-full px-4 py-2"
          style={{
            borderWidth: 1,
            borderColor: theme.tint,
            backgroundColor: chipSelectedBg,
            minWidth: 84,
            alignItems: "center",
          }}
        >
          <Text style={{ color: theme.tint, fontWeight: "700", fontSize: 18 }}>
            {value}
          </Text>
        </View>

        <TouchableOpacity
          accessibilityLabel="Increase guests"
          accessibilityRole="button"
          className="rounded-xl px-3 py-2"
          disabled={!canInc}
          onPress={increase}
          style={{
            borderWidth: 1,
            borderColor: borderDefault,
            backgroundColor: surfaceSubtle,
            opacity: canInc ? 1 : 0.5,
          }}
        >
          <IconSymbol
            color={canInc ? theme.tint : disabledIcon}
            name="plus"
            size={16}
          />
        </TouchableOpacity>
      </View>

      {/* Helper text */}
      <Text
        className="mb-4 text-center"
        style={{ color: theme.icon, fontSize: 12 }}
      >
        {value === 1
          ? "Search for rooms that accommodate 1 person"
          : `Search for rooms that accommodate ${value} or more people`}
      </Text>

      {/* Divider */}
      <View
        style={{
          borderTopWidth: 1,
          borderTopColor: dividerColor,
          marginBottom: 12,
        }}
      />

      {/* Apply */}
      <TouchableOpacity
        accessibilityLabel="Apply guests"
        accessibilityRole="button"
        className="items-center rounded-xl py-3"
        disabled={!changed}
        onPress={apply}
        style={{
          backgroundColor: changed ? theme.tint : disabledBg,
          borderWidth: changed ? 0 : 1,
          borderColor: changed ? "transparent" : disabledBorder,
          // subtle lift so it's visible even on dark backgrounds
          shadowColor: withAlpha(theme.text, 0.4),
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 4,
          elevation: changed ? 3 : 2,
        }}
      >
        <Text
          className="font-bold"
          style={{ color: changed ? Colors.dark.background : disabledText }}
        >
          Apply
        </Text>
      </TouchableOpacity>
    </View>
  );
}
