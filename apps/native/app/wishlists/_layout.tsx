// app/wishlists/_layout.tsx

import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import { Pressable } from "react-native";

export default function WishlistsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackTitle: "Back",
      }}
    >
      <Stack.Screen
        name="[id]"
        options={{
          title: "Wishlist",
          // Render an explicit back button so it shows regardless of parent headers
          headerLeft: () => (
            <Pressable
              onPress={() => router.back()}
              style={{ paddingHorizontal: 8 }}
            >
              <Ionicons name="chevron-back" size={24} />
            </Pressable>
          ),
          // If your root layout presents stacks modally, ensure this is a normal card
          presentation: "card",
        }}
      />
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}
