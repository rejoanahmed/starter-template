import { ThemedText } from "@app/components/ThemedText";
import { ThemedView } from "@app/components/ThemedView";
import { IconSymbol } from "@app/components/ui/IconSymbol";
import { Colors } from "@app/constants/Colors";
import { useColorScheme } from "nativewind";
import { type PropsWithChildren, useState } from "react";
import { TouchableOpacity, View } from "react-native";

export function Collapsible({
  children,
  title,
}: PropsWithChildren & { title: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const { colorScheme } = useColorScheme();
  const theme = colorScheme ?? "light";

  return (
    <ThemedView>
      <TouchableOpacity
        activeOpacity={0.8}
        className="flex-row items-center gap-2"
        onPress={() => setIsOpen((value) => !value)}
      >
        <IconSymbol
          color={theme === "light" ? Colors.light.icon : Colors.dark.icon}
          name="chevron.right"
          size={18}
          style={{ transform: [{ rotate: isOpen ? "90deg" : "0deg" }] }}
          weight="medium"
        />

        <ThemedText type="defaultSemiBold">{title}</ThemedText>
      </TouchableOpacity>
      {isOpen && <View className="ml-4">{children}</View>}
    </ThemedView>
  );
}
