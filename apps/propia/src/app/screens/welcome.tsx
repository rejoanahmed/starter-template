import { AntDesign } from "@expo/vector-icons";
import Icon from "@propia/components/Icon";
import ThemedText from "@propia/components/ThemedText";
import ThemeToggle from "@propia/components/ThemeToggle";
import { router } from "expo-router";
import { Dimensions, Pressable, SafeAreaView, View } from "react-native";
import useThemeColors from "../contexts/ThemeColors";

const { width: _ } = Dimensions.get("window");
const _windowWidth = Dimensions.get("window").width;

import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function OnboardingScreen() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  return (
    <SafeAreaView
      className="flex-1 bg-light-primary dark:bg-dark-primary"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      <View className="flex-1 relative bg-light-primary dark:bg-dark-primary">
        <View className="w-full flex-row justify-end px-4 pt-2">
          <ThemeToggle />
        </View>

        <View className="flex flex-col items-start w-full justify-center gap-2 flex-1 px-global pb-20">
          <View className="mb-8">
            <ThemedText className="text-4xl font-bold">Welcome back</ThemedText>
            <ThemedText className="text-base text-light-subtext dark:text-dark-subtext">
              Sign in to your account to continue
            </ThemedText>
          </View>
          <Pressable
            className="w-full  border border-black dark:border-white rounded-2xl flex flex-row items-center justify-center py-4"
            onPress={() => router.push("/screens/signup")}
          >
            <View className="absolute left-4 top-4.5">
              <Icon color={colors.text} name="Mail" size={20} />
            </View>
            <ThemedText className="text-base font-medium pr-2">
              Continue with Email
            </ThemedText>
          </Pressable>
          <Pressable
            className="w-full border border-black dark:border-white rounded-2xl flex flex-row items-center justify-center py-4"
            onPress={() => router.push("/(tabs)/(home)")}
          >
            <View className="absolute left-4 top-4.5">
              <Icon color={colors.text} name="Facebook" size={22} />
            </View>
            <ThemedText className="text-base font-medium pr-2">
              Continue with Facebook
            </ThemedText>
          </Pressable>
          <Pressable
            className="w-full border border-black dark:border-white rounded-2xl flex flex-row items-center justify-center py-4"
            onPress={() => router.push("/(tabs)/(home)")}
          >
            <View className="absolute left-4 top-4.5">
              <AntDesign color={colors.text} name="google" size={22} />
            </View>
            <ThemedText className="text-base font-medium pr-2">
              Continue with Google
            </ThemedText>
          </Pressable>

          <Pressable
            className="w-full border border-black dark:border-white rounded-2xl flex flex-row items-center justify-center py-4"
            onPress={() => router.push("/(tabs)/(home)")}
          >
            <View className="absolute left-4 top-4.5">
              <AntDesign color={colors.text} name="apple" size={22} />
            </View>
            <ThemedText className="text-base font-medium pr-2">
              Continue with Apple
            </ThemedText>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
