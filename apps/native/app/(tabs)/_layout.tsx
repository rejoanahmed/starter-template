import { HapticTab } from "@app/components/HapticTab";
import { IconSymbol } from "@app/components/ui/IconSymbol";
import TabBarBackground from "@app/components/ui/TabBarBackground";
import { Colors } from "@app/constants/Colors";
import { Tabs } from "expo-router";
import { useColorScheme } from "nativewind";
import { Platform } from "react-native";
import { useUser } from "../_layout";

export default function TabLayout() {
  const { userRole } = useUser();
  const isMerchant = userRole === "merchant";
  const { colorScheme } = useColorScheme();
  if (!userRole) return null;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: "absolute",
          },
          default: {},
        }),
      }}
    >
      {/* Client-specific tabs */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <IconSymbol color={color} name="house.fill" size={28} />
          ),
          href: isMerchant ? null : undefined, // Only show for clients
        }}
      />

      <Tabs.Screen
        name="wishlist"
        options={{
          title: "Wishlists",
          tabBarIcon: ({ color }) => (
            <IconSymbol color={color} name="heart.fill" size={28} />
          ),
          href: isMerchant ? null : undefined, // Only show for clients
        }}
      />

      <Tabs.Screen
        name="bookings"
        options={{
          title: "Bookings",
          tabBarIcon: ({ color }) => (
            <IconSymbol color={color} name="calendar.badge.clock" size={28} />
          ),
          href: isMerchant ? null : undefined, // Only show for clients
        }}
      />

      {/* Merchant-specific tabs */}
      <Tabs.Screen
        name="history"
        options={{
          title: "History",
          tabBarIcon: ({ color }) => (
            <IconSymbol color={color} name="clock.fill" size={28} />
          ),
          href: isMerchant ? undefined : null, // Only show for merchants
        }}
      />

      <Tabs.Screen
        name="schedule"
        options={{
          title: "Schedule",
          tabBarIcon: ({ color }) => (
            <IconSymbol color={color} name="calendar" size={28} />
          ),
          href: isMerchant ? undefined : null, // Only show for merchants
        }}
      />

      <Tabs.Screen
        name="pricing"
        options={{
          title: "Pricing",
          tabBarIcon: ({ color }) => (
            <IconSymbol color={color} name="dollarsign.circle.fill" size={28} />
          ),
          href: isMerchant ? undefined : null, // Only show for merchants
        }}
      />

      {/* Common tabs for both roles */}
      <Tabs.Screen
        name="messages"
        options={{
          title: isMerchant ? "Messages" : "Message",
          tabBarIcon: ({ color }) => (
            <IconSymbol color={color} name="message.fill" size={28} />
          ),
        }}
      />

      <Tabs.Screen
        name="account"
        options={{
          title: "Account",
          tabBarIcon: ({ color }) => (
            <IconSymbol color={color} name="person.fill" size={28} />
          ),
        }}
      />
    </Tabs>
  );
}
