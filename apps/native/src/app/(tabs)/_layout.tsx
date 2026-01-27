import { HapticTab } from "@native/components/haptic-tab";
import { IconSymbol } from "@native/components/ui/icon-symbol";
import { Colors } from "@native/constants/theme";
import { useColorScheme } from "@native/hooks/use-color-scheme";
import { Tabs } from "expo-router";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <IconSymbol color={color} name="house.fill" size={28} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarIcon: ({ color }) => (
            <IconSymbol color={color} name="paperplane.fill" size={28} />
          ),
        }}
      />
    </Tabs>
  );
}
