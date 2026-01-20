// app/account_settings.tsx

import { Colors } from "@app/constants/Colors";
import { authClient } from "@app/lib/auth-client";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import type React from "react";
import { useMemo } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AccountSettings() {
  const router = useRouter();
  const scheme = useColorScheme();
  const palette = scheme === "dark" ? Colors.dark : Colors.light;

  // Get session data directly from Better Auth
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;

  // Derive initials
  const _initials = useMemo(() => {
    const name = user?.name;
    if (!name) {
      return "U";
    }
    const trimmed = name.trim();
    const parts = trimmed.split(" ");
    if (parts.length === 1) {
      return parts[0][0]?.toUpperCase() ?? "U";
    }
    return (parts[0][0] + parts.at(-1)?.[0]).toUpperCase();
  }, [user?.name]);

  // Small reusable field wrapper
  const Field = ({
    label,
    children,
  }: {
    label: string;
    children: React.ReactNode;
  }) => (
    <View className="py-4">
      <Text
        className="mb-2 font-semibold text-base"
        style={{ color: palette.text }}
      >
        {label}
      </Text>
      {children}
      <View className="mt-4 border-gray-200 border-b dark:border-gray-800" />
    </View>
  );

  // Status pill using theme colors (ok -> tint, not ok -> icon)
  const SmallStatus = ({ ok, text }: { ok: boolean; text: string }) => (
    <View className="flex-row items-center">
      <Ionicons
        color={ok ? palette.tint : palette.icon}
        name={ok ? "chatbox-ellipses-outline" : "alert-circle-outline"}
        size={18}
      />
      <Text style={{ marginLeft: 8, color: palette.icon }}>{text}</Text>
    </View>
  );

  if (isPending) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: palette.background,
        }}
      >
        <ActivityIndicator color={palette.tint} size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.background }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pt-3 pb-4">
        <Pressable onPress={() => router.back()}>
          <Ionicons color={palette.icon} name="chevron-back" size={26} />
        </Pressable>
        <Text
          className="font-extrabold text-2xl"
          style={{ color: palette.text }}
        >
          Account Settings
        </Text>
        <Pressable onPress={() => {}}>
          <Text className="text-base underline" style={{ color: palette.tint }}>
            Edit
          </Text>
        </Pressable>
      </View>

      {/* Content */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Legal Name */}
        <Field label="Legal Name">
          <Text className="text-base" style={{ color: palette.text }}>
            {user?.name ?? "Not provided"}
          </Text>
        </Field>

        {/* Username */}
        <Field label="Username">
          <Text className="text-base" style={{ color: palette.text }}>
            {user?.email?.split("@")[0] ?? "Not provided"}
          </Text>
        </Field>

        {/* Phone */}
        {/* <Field label="Phone">
          <View className="flex-row items-center justify-between">
            <Text className="text-base" style={{ color: palette.text }}>
              {user?.phoneNumber ?? "Not provided"}
            </Text>
            {user?.phoneNumber ? (
              <SmallStatus ok={false} text="not verified" />
            ) : null}
          </View>
        </Field> */}

        {/* Email */}
        <Field label="Email address">
          <View className="flex-row items-center justify-between">
            <View className="mr-2 flex-1">
              {user?.emailVerified ? (
                <SmallStatus ok text="verified" />
              ) : (
                <SmallStatus ok={false} text="not verified" />
              )}
              <Text className="mt-2 text-base" style={{ color: palette.text }}>
                {user?.email ?? "Not provided"}
              </Text>
            </View>
            {!user?.emailVerified && (
              <Pressable
                onPress={() => {
                  /* trigger verification */
                }}
              >
                <Text className="underline" style={{ color: palette.tint }}>
                  send verification
                </Text>
              </Pressable>
            )}
          </View>
        </Field>
      </ScrollView>
    </SafeAreaView>
  );
}
