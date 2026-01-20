// app/clientbooking/booking-success.tsx

import { Colors } from "@app/constants/Colors";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const HOME_ROUTE = "/"; // change if your home is different

export default function BookingSuccess() {
  const { colorScheme } = useColorScheme();
  const palette = Colors[colorScheme === "dark" ? "dark" : "light"];

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: palette.background }}
    >
      <View className="flex-1 items-center justify-center px-6">
        <View
          className="mb-4 items-center justify-center rounded-full"
          style={{ width: 72, height: 72, backgroundColor: palette.surface }}
        >
          <MaterialCommunityIcons
            color={palette.tint}
            name="check-circle-outline"
            size={44}
          />
        </View>

        <Text
          className="text-center font-extrabold text-2xl"
          style={{ color: palette.text }}
        >
          Booking Confirmed!
        </Text>
        <Text className="mt-2 text-center" style={{ color: palette.text }}>
          Your reservation is locked in. We’ve saved the details to your
          account.
        </Text>

        <Pressable
          className="mt-6 rounded-full px-6 py-3"
          onPress={() => router.replace(HOME_ROUTE)}
          style={{ backgroundColor: palette.primaryButton }}
        >
          <Text className="font-semibold text-white">Go to Home</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
