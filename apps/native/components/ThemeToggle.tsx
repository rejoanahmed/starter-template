import { Colors } from "@app/constants/Colors";
import { useColorScheme } from "nativewind";
import { Switch, Text, View } from "react-native";

type ThemeToggleProps = {
  label?: string;
};

export default function ThemeToggle({ label = "Dark Mode" }: ThemeToggleProps) {
  const { colorScheme, setColorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <View className="flex-row items-center justify-between px-1 py-3">
      {label && (
        <Text className="text-neutral-900 dark:text-neutral-50">{label}</Text>
      )}
      <Switch
        ios_backgroundColor="#3e3e3e"
        onValueChange={() => setColorScheme(isDark ? "light" : "dark")}
        thumbColor={isDark ? "#fff" : "#f4f3f4"}
        trackColor={{ false: "#767577", true: Colors.light.tint }}
        value={isDark}
      />
    </View>
  );
}

type Scheme = "light" | "dark" | null;

export const getThemeTokens = (scheme: Scheme) => {
  const mode = scheme ?? "light";
  const theme = Colors[mode];

  return {
    mode,
    theme, // { background, text, tint, ... } from your Colors
    borderDefault: mode === "dark" ? "#2F2F2F" : "#E5E7EB",
    surfaceSoft: mode === "dark" ? "#1F2937" : "#F3F4F6",
    mutedText: mode === "dark" ? "#9AA3B2" : "#6B7280",
    bubbleIncoming: mode === "dark" ? "#2D3748" : "#EFEFEF",
    headerTint: theme.tint,
    // helpful if you ever change header text color based on tint luminosity
    headerContentColor: "#FFFFFF",
  };
};
