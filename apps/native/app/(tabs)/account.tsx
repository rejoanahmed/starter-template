import ThemeToggle from "@app/components/ThemeToggle";
import { authClient } from "@app/lib/auth-client";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import type React from "react";
import { useMemo } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Colors } from "../../constants/Colors";
import { useUser } from "../_layout";

export default function AccountScreen() {
  const router = useRouter();
  const { user, userRole } = useUser();
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const palette = scheme === "dark" ? Colors.dark : Colors.light;

  const displayName = useMemo(() => {
    if (user?.name) {
      return user.name;
    }
    if (user?.email) {
      return user.email.split("@")[0];
    }
    return "Guest";
  }, [user]);

  const initials = useMemo(() => {
    const name = displayName.trim();
    const parts = name.split(" ");
    if (parts.length === 1) {
      return parts[0][0]?.toUpperCase() ?? "U";
    }
    return (parts[0][0] + parts.at(-1)?.[0]).toUpperCase();
  }, [displayName]);

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
    } catch (error) {
      console.error("Error signing out:", error);
      Alert.alert("Error", "Failed to sign out. Please try again.");
    }
  };

  const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <Text
      className="mt-6 mb-2 font-bold text-2xl"
      style={{ color: palette.text }}
    >
      {children}
    </Text>
  );
  const DividerTop = () => (
    <View className="border-gray-200 border-t dark:border-gray-800" />
  );
  const DividerBottom = () => (
    <View className="border-gray-200 border-b dark:border-gray-800" />
  );

  const Row = ({
    icon,
    label,
    onPress,
    right,
  }: {
    icon: React.ReactNode;
    label: string;
    onPress?: () => void;
    right?: React.ReactNode;
  }) => (
    <Pressable
      accessibilityRole="button"
      android_ripple={{ color: "rgba(0,0,0,0.06)" }}
      className="flex-row items-center justify-between py-4"
      hitSlop={8}
      onPress={onPress}
    >
      <View className="flex-row items-center">
        <View className="mr-3 h-9 w-9 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
          {icon}
        </View>
        <Text className="text-base" style={{ color: palette.text }}>
          {label}
        </Text>
      </View>
      {right ?? (
        <Ionicons color={palette.icon} name="chevron-forward" size={20} />
      )}
    </Pressable>
  );

  const TAB_BAR_ESTIMATE = 88;
  const bottomPadding = insets.bottom + TAB_BAR_ESTIMATE;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.background }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pt-2 pb-3">
        <Text
          className="font-extrabold text-3xl"
          style={{ color: palette.text }}
        >
          Account
        </Text>

        <Pressable
          hitSlop={8}
          onPress={() => router.push("/accounts/notifications")}
        >
          <Ionicons
            color={palette.text}
            name="notifications-outline"
            size={26}
          />
          <View className="-top-1 -right-1 absolute h-4 w-4 items-center justify-center rounded-full bg-red-500">
            <Text className="font-bold text-[10px] text-white">1</Text>
          </View>
        </Pressable>
      </View>

      {/* Scrollable content */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: bottomPadding,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Profile */}
        <View className="flex-row items-center border-gray-200 border-b py-4 dark:border-gray-800">
          {user?.image ? (
            <Image
              className="mr-3 h-14 w-14 rounded-full"
              source={{ uri: user.image }}
            />
          ) : (
            <View className="mr-3 h-14 w-14 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-800">
              <Text
                className="font-bold text-lg"
                style={{ color: palette.text }}
              >
                {initials}
              </Text>
            </View>
          )}

          <View className="flex-1">
            <Text
              className="font-semibold text-lg"
              style={{ color: palette.text }}
            >
              {displayName}
            </Text>
            {!!user?.email && (
              <Text style={{ color: palette.icon }}>{user.email}</Text>
            )}
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            className="rounded-md bg-red-500 px-3 py-1"
            onPress={handleSignOut}
          >
            <Text className="font-semibold text-sm text-white">Log out</Text>
          </TouchableOpacity>
        </View>

        {/* Management — merchant only */}
        {userRole === "merchant" && (
          <>
            <SectionTitle>Management</SectionTitle>
            <DividerTop />
            <Row
              icon={
                <Ionicons color={palette.icon} name="home-outline" size={20} />
              }
              label="Manage Rooms"
              onPress={() => router.push("/merchant/roomManagement/room")}
            />
            <DividerBottom />
            <Row
              icon={
                <Ionicons
                  color={palette.icon}
                  name="bar-chart-outline"
                  size={20}
                />
              }
              label="Income Report"
              onPress={() => router.push("/merchant/incomeReport/page")}
            />
            <DividerBottom />
          </>
        )}

        {/* Account */}
        <SectionTitle>Account</SectionTitle>
        <DividerTop />
        <Row
          icon={
            <Ionicons
              color={palette.icon}
              name="person-circle-outline"
              size={20}
            />
          }
          label="Account settings"
          onPress={() => router.push("/accounts/account_settings")}
        />
        <DividerBottom />
        <Row
          icon={<Ionicons color={palette.icon} name="moon-outline" size={20} />}
          label="Dark Mode"
          right={<ThemeToggle label="" />}
        />
        <DividerBottom />
        <Row
          icon={
            <Ionicons color={palette.icon} name="language-outline" size={20} />
          }
          label="Language"
        />
        <DividerBottom />

        {/* Perks — client only */}
        {userRole !== "merchant" && (
          <>
            <SectionTitle>Perks for you</SectionTitle>
            <DividerTop />
            <Row
              icon={
                <Ionicons
                  color={palette.icon}
                  name="pricetags-outline"
                  size={20}
                />
              }
              label="Vouchers"
            />
            <DividerBottom />
            <Row
              icon={
                <Ionicons color={palette.icon} name="gift-outline" size={20} />
              }
              label="Invite friends"
            />
            <DividerBottom />
          </>
        )}

        {/* Help */}
        <SectionTitle>Help</SectionTitle>
        <DividerTop />
        <Row
          icon={
            <Ionicons
              color={palette.icon}
              name="help-circle-outline"
              size={20}
            />
          }
          label="Help center"
        />
        <DividerBottom />
        <Row
          icon={
            <Ionicons
              color={palette.icon}
              name="shield-checkmark-outline"
              size={20}
            />
          }
          label="Terms & Policies"
        />
        <DividerBottom />

        {/* Footer (always visible above tab bar) */}
        <View className="mt-6 opacity-70">
          <Text className="text-xs" style={{ color: palette.icon }}>
            Signed in as {user?.email ?? "unknown"} •{" "}
            {userRole === "merchant" ? "Merchant" : "Client"}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
