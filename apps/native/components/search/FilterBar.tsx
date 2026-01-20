import type { Filters } from "@app/app/search";
import { IconSymbol } from "@app/components/ui/IconSymbol";
import { Colors } from "@app/constants/Colors";
import { useColorScheme } from "nativewind";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

type FilterBarProps = {
  activeFilter: string | null;
  toggleFilter: (filterName: string) => void;
  filters: Filters;
  resetFilters: () => void;
};

const withAlpha = (hex: string, a: number) =>
  `${hex}${Math.round(Math.min(1, Math.max(0, a)) * 255)
    .toString(16)
    .padStart(2, "0")}`;

export default function FilterBar({
  activeFilter,
  toggleFilter,
  filters,
  resetFilters,
}: FilterBarProps) {
  const { colorScheme = "light" } = useColorScheme();
  const palette = colorScheme === "dark" ? Colors.dark : Colors.light;

  const formatDateRange = () => {
    if (!(filters.dates.start || filters.dates.end)) {
      return "Any dates";
    }
    if (filters.dates.start && filters.dates.end) {
      const start = new Date(filters.dates.start).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      const end = new Date(filters.dates.end).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      return `${start} - ${end}`;
    }
    return "Select dates";
  };

  const formatDistrict = () => {
    if (filters.district.length === 0) {
      return "Any district";
    }
    if (filters.district.length === 1) {
      return filters.district[0];
    }
    return `${filters.district.length} districts`;
  };

  const formatPriceRange = () => {
    const { min, max } = filters.priceRange;
    if (min === 0 && max === 5000) {
      return "Any price";
    }
    if (min === 0) {
      return `Up to $${max}`;
    }
    if (max === 5000) {
      return `$${min}+`;
    }
    return `$${min} - $${max}`;
  };

  const filterOptions = [
    { name: "dates", label: formatDateRange(), icon: "calendar" as const },
    {
      name: "district",
      label: formatDistrict(),
      icon: "mappin.circle" as const,
    },
    {
      name: "guests",
      label: `${filters.guests} guests`,
      icon: "person.2.fill" as const,
    },
    {
      name: "price",
      label: formatPriceRange(),
      icon: "dollarsign.circle" as const,
    },
    {
      name: "rating",
      label: filters.rating > 0 ? `${filters.rating}+ stars` : "Any rating",
      icon: "star.fill" as const,
    },
    { name: "sort", label: "Sort", icon: "arrow.up.arrow.down" as const },
    { name: "reset", label: "Reset", icon: "arrow.clockwise" as const },
  ];

  return (
    <View className="my-2 flex-row items-center">
      <ScrollView
        className="pr-10"
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {filterOptions.map((f) => {
          const isReset = f.name === "reset";
          const isActive = !isReset && activeFilter === f.name;

          const bgColor = isActive
            ? withAlpha(palette.tint, 0.12)
            : palette.background;
          const borderColor = palette.icon;
          const textColor = isActive ? palette.tint : palette.text;
          const iconColor = isReset
            ? palette.tint
            : isActive
              ? palette.tint
              : palette.icon;

          return (
            <TouchableOpacity
              accessibilityLabel={
                isReset ? "Reset all filters" : `Open ${f.name} filter`
              }
              accessibilityRole="button"
              className="mr-2 flex-row items-center rounded-full px-3 py-2"
              key={f.name}
              onPress={() => (isReset ? resetFilters() : toggleFilter(f.name))}
              style={{
                minWidth: 90,
                backgroundColor: bgColor,
                borderWidth: 1,
                borderColor,
              }}
            >
              <IconSymbol color={iconColor} name={f.icon} size={16} />
              <Text
                className="ml-1.5 text-sm"
                numberOfLines={1}
                style={{ color: textColor }}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
