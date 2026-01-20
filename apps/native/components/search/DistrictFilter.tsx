import { IconSymbol } from "@app/components/ui/IconSymbol";
import { Colors } from "@app/constants/Colors";
import { useColorScheme } from "nativewind";
import { useEffect, useMemo, useState } from "react";
import {
  I18nManager,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type DistrictFilterProps = {
  selectedDistricts: string[];
  onChange: (districts: string[]) => void;
  tabBarHeight?: number;
};

const DISTRICTS = [
  "Central",
  "Wan Chai",
  "Causeway Bay",
  "North Point",
  "Quarry Bay",
  "Tai Koo",
  "Sai Wan Ho",
  "Shau Kei Wan",
  "Chai Wan",
  "Aberdeen",
  "Ap Lei Chau",
  "Pokfulam",
  "Kennedy Town",
  "Sai Ying Pun",
  "Sheung Wan",
  "Admiralty",
  "Tin Hau",
  "Fortress Hill",
  "Jordan",
  "Tsim Sha Tsui",
  "Yau Ma Tei",
  "Mong Kok",
  "Tai Kok Tsui",
  "Sham Shui Po",
  "Cheung Sha Wan",
  "Lai Chi Kok",
  "Mei Foo",
  "Kwai Chung",
  "Tsuen Wan",
  "Tuen Mun",
  "Yuen Long",
  "Tin Shui Wai",
  "Fanling",
  "Sheung Shui",
  "Tai Po",
  "Sha Tin",
  "Ma On Shan",
  "Diamond Hill",
  "Wong Tai Sin",
  "Kowloon City",
  "Ho Man Tin",
  "Hung Hom",
  "To Kwa Wan",
  "Kowloon Bay",
  "Ngau Tau Kok",
  "Kwun Tong",
  "Lam Tin",
  "Yau Tong",
  "Tseung Kwan O",
  "Sai Kung",
  "Clear Water Bay",
  "Discovery Bay",
  "Tung Chung",
];
const POPULAR = [
  "Central",
  "Wan Chai",
  "Causeway Bay",
  "Tsim Sha Tsui",
  "Mong Kok",
  "Sha Tin",
];

const withAlpha = (hex: string, a: number) =>
  `${hex}${Math.round(Math.min(1, Math.max(0, a)) * 255)
    .toString(16)
    .padStart(2, "0")}`;

export default function DistrictFilter({
  selectedDistricts,
  onChange,
  tabBarHeight = 0,
}: DistrictFilterProps) {
  const { colorScheme = "light" } = useColorScheme();
  const theme = Colors[colorScheme];
  const isRTL = I18nManager.isRTL;
  const insets = useSafeAreaInsets();

  // Tokens from theme
  const chipSelectedBg = useMemo(
    () => withAlpha(theme.tint, 0.12),
    [theme.tint]
  );
  const dividerColor = useMemo(() => withAlpha(theme.icon, 0.25), [theme.icon]);
  const borderDefault = useMemo(
    () => withAlpha(theme.icon, 0.35),
    [theme.icon]
  );
  const cardShadowCol = useMemo(() => withAlpha(theme.text, 0.5), [theme.text]);
  const fabShadowCol = useMemo(() => withAlpha(theme.text, 0.6), [theme.text]);

  // Staged selection
  const [staged, setStaged] = useState<string[]>(selectedDistricts);
  useEffect(() => setStaged(selectedDistricts), [selectedDistricts]);

  const toggle = (d: string) =>
    setStaged((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    );

  const clearAll = () => setStaged([]);
  const apply = () => onChange(staged);

  const changed = useMemo(() => {
    if (staged.length !== selectedDistricts.length) {
      return true;
    }
    return (
      [...staged].sort().join("|") !== [...selectedDistricts].sort().join("|")
    );
  }, [staged, selectedDistricts]);

  // Keep last rows above the floating Apply button
  const FAB_SIZE = 44;
  const FAB_MARGIN = 12;
  const fabBottom = FAB_MARGIN + (insets.bottom || 0) + tabBarHeight;
  const scrollPadBottom = fabBottom + FAB_SIZE + 12;

  return (
    <View
      accessibilityLabel="District Filter"
      accessible
      className="m-4 rounded-2xl p-4"
      style={{
        backgroundColor: theme.background,
        shadowColor: cardShadowCol,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
        elevation: 3,
        borderWidth: 1,
        borderColor: borderDefault,
        position: "relative",
      }}
    >
      {/* Header */}
      <View
        className="mb-3 flex-row items-center justify-between"
        style={{ flexDirection: isRTL ? "row-reverse" : "row" }}
      >
        <Text className="font-bold text-lg" style={{ color: theme.text }}>
          Districts
        </Text>
        {staged.length > 0 && (
          <TouchableOpacity
            accessibilityLabel="Clear all districts"
            accessibilityRole="button"
            onPress={clearAll}
          >
            <Text style={{ color: theme.tint, fontWeight: "600" }}>
              Clear all
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Popular */}
      <View className="mb-3">
        <Text className="mb-2.5 text-base" style={{ color: theme.text }}>
          Popular
        </Text>
        <View
          className="flex-row flex-wrap"
          style={{ flexDirection: isRTL ? "row-reverse" : "row" }}
        >
          {POPULAR.map((d) => {
            const selected = staged.includes(d);
            return (
              <TouchableOpacity
                accessibilityLabel={`Toggle ${d}`}
                accessibilityRole="button"
                className="mr-2 mb-2 flex-row items-center justify-center rounded-full border px-3 py-2"
                key={`pop-${d}`}
                onPress={() => toggle(d)}
                style={{
                  borderColor: selected ? theme.tint : borderDefault,
                  backgroundColor: selected ? chipSelectedBg : "transparent",
                  minHeight: 36,
                }}
              >
                <Text
                  className="text-sm"
                  style={{
                    color: selected ? theme.tint : theme.text,
                    fontWeight: selected ? "700" : "400",
                  }}
                >
                  {d}
                </Text>
                {selected && (
                  <IconSymbol
                    color={theme.tint}
                    name="checkmark"
                    size={14}
                    style={{ marginLeft: 6 }}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Divider */}
      <View
        style={{
          borderTopWidth: 1,
          borderTopColor: dividerColor,
          marginBottom: 8,
        }}
      />

      {/* All Districts */}
      <Text className="mb-2.5 text-base" style={{ color: theme.text }}>
        All Districts
      </Text>
      <ScrollView
        className="max-h-[300px]"
        contentContainerStyle={{ paddingBottom: scrollPadBottom }}
        showsVerticalScrollIndicator
      >
        {DISTRICTS.map((district) => {
          const isSelected = staged.includes(district);
          return (
            <TouchableOpacity
              accessibilityLabel={`Toggle ${district}`}
              accessibilityRole="button"
              className="flex-row items-center justify-between py-3"
              key={district}
              onPress={() => toggle(district)}
              style={{
                borderBottomWidth: 1,
                borderBottomColor: dividerColor,
                backgroundColor: isSelected ? chipSelectedBg : "transparent",
                paddingHorizontal: 2,
              }}
            >
              <Text
                className="text-base"
                style={{
                  color: isSelected ? theme.tint : theme.text,
                  fontWeight: isSelected ? "700" : "400",
                }}
              >
                {district}
              </Text>
              {isSelected && (
                <IconSymbol color={theme.tint} name="checkmark" size={16} />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Floating Apply */}
      <TouchableOpacity
        accessibilityLabel="Apply district selection"
        accessibilityRole="button"
        activeOpacity={0.9}
        className="items-center justify-center"
        disabled={!changed}
        onPress={apply}
        style={{
          position: "absolute",
          right: FAB_MARGIN,
          bottom: fabBottom,
          width: FAB_SIZE,
          height: FAB_SIZE,
          borderRadius: FAB_SIZE / 2,
          backgroundColor: changed ? theme.tint : withAlpha(theme.tint, 0.2),
          shadowColor: fabShadowCol,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.35,
          shadowRadius: 8,
          elevation: 6,
          borderWidth: 1,
          borderColor: changed ? theme.tint : borderDefault,
        }}
      >
        <IconSymbol
          color={
            changed
              ? Colors.dark.background
              : withAlpha(Colors.dark.background, 0.67)
          }
          name="checkmark"
          size={18}
        />
      </TouchableOpacity>
    </View>
  );
}
