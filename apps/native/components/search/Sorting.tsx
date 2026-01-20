import { IconSymbol } from "@app/components/ui/IconSymbol"; // optional, but nice
import { Colors } from "@app/constants/Colors";
import { useColorScheme } from "nativewind";
import type React from "react";
import { useMemo } from "react";
import { Platform, Pressable, Text, View } from "react-native";

type SortKey = "popularity" | "rating" | "price_asc" | "price_desc";

const SORT_OPTIONS: {
  key: SortKey;
  label: string;
  icon: React.ComponentProps<typeof IconSymbol>["name"];
}[] = [
  { key: "popularity", label: "Popular", icon: "flame.fill" },
  { key: "rating", label: "Top Rated", icon: "star.fill" },
  { key: "price_asc", label: "Price: Low to High", icon: "arrow.down.circle" },
  { key: "price_desc", label: "Price: High to Low", icon: "arrow.up.circle" },
];

/**
 * Usage: place inside your component render and pass {filters, updateFilters, setActiveFilter}
 *
 * <SortSelector
 *   value={filters.sortBy}
 *   onSelect={(s) => { updateFilters({ sortBy: s }); setActiveFilter(null); }}
 * />
 */
export function SortSelector({
  value,
  onSelect,
}: {
  value: SortKey;
  onSelect: (s: SortKey) => void;
}) {
  const { colorScheme = "light" } = useColorScheme();
  const theme = Colors[colorScheme];

  const dividerColor = useMemo(
    () => (colorScheme === "dark" ? "#2A2A2A" : "#EEE"),
    [colorScheme]
  );
  const borderDefault = useMemo(
    () => (colorScheme === "dark" ? "#3A3A3A" : "#DDD"),
    [colorScheme]
  );
  const chipBg = useMemo(
    () => (colorScheme === "dark" ? "#0B1B2B" : "#F0F8FF"),
    [colorScheme]
  );
  const muted = useMemo(
    () => (colorScheme === "dark" ? "#9AA0A6" : "#666"),
    [colorScheme]
  );

  return (
    <View
      className="m-4 rounded-2xl"
      style={{
        backgroundColor: theme.background,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: colorScheme === "dark" ? 0.25 : 0.08,
        shadowRadius: 6,
        elevation: 3,
        borderWidth: 1,
        borderColor: borderDefault,
      }}
    >
      {SORT_OPTIONS.map((opt, i) => {
        const selected = value === opt.key;
        const isFirst = i === 0;
        const isLast = i === SORT_OPTIONS.length - 1;

        return (
          <Pressable
            accessibilityLabel={`Sort by ${opt.label}`}
            accessibilityRole="button"
            android_ripple={
              Platform.OS === "android"
                ? { color: `${theme.tint}22` }
                : undefined
            }
            key={opt.key}
            onPress={() => onSelect(opt.key)}
            style={{
              paddingVertical: 14,
              paddingHorizontal: 14,
              backgroundColor: selected ? chipBg : "transparent",
              borderTopWidth: isFirst ? 0 : 1,
              borderTopColor: dividerColor,
              borderTopLeftRadius: isFirst ? 16 : 0,
              borderTopRightRadius: isFirst ? 16 : 0,
              borderBottomLeftRadius: isLast ? 16 : 0,
              borderBottomRightRadius: isLast ? 16 : 0,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <IconSymbol
                  color={selected ? theme.tint : muted}
                  name={opt.icon}
                  size={18}
                />
                <Text
                  style={{
                    marginLeft: 10,
                    color: theme.text,
                    fontWeight: selected ? "700" : "500",
                  }}
                >
                  {opt.label}
                </Text>
              </View>

              {selected && (
                <IconSymbol
                  color={theme.tint}
                  name="checkmark.circle.fill"
                  size={18}
                />
              )}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}
