import "../global.css";

import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import { hideAsync, preventAutoHideAsync } from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "nativewind";
import { createContext, useContext, useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import "react-native-reanimated";
import { GluestackUIProvider } from "@app/components/ui/gluestack-ui-provider";
import { Colors } from "@app/constants/Colors";
import { authClient } from "@app/lib/auth-client";
import type { User as SessionUser } from "better-auth";
import { GestureHandlerRootView } from "react-native-gesture-handler";

// Prevent the splash screen from auto-hiding before asset loading is complete.
preventAutoHideAsync();
type User = SessionUser & { role: "client" | "merchant" | undefined };
type UserContextState = {
  user: User | null;
  userRole: string | null;
  isLoading: boolean;
};

const UserContext = createContext<UserContextState>({
  user: null,
  userRole: null,
  isLoading: true,
});

export const useUser = () => useContext(UserContext);

// Create a query client for React Query
const queryClient = new QueryClient();

// Loading screen component
function LoadingScreen() {
  const { colorScheme } = useColorScheme();
  const palette = Colors[colorScheme === "dark" ? "dark" : "light"];

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: palette.background,
      }}
    >
      <ActivityIndicator color={palette.tint} size="large" />
      <Text
        style={{
          marginTop: 16,
          fontSize: 16,
          color: palette.text,
        }}
      >
        Loading...
      </Text>
    </View>
  );
}

export default function RootLayout() {
  const { colorScheme } = useColorScheme();
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [navigationReady, setNavigationReady] = useState(false);
  const router = useRouter();
  const segments = useSegments();

  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  // Use Better Auth session hook
  const { data: session, isPending } = authClient.useSession();

  // Effect for auth state changes
  useEffect(() => {
    console.log("🔄 Session state changed:", {
      isPending,
      hasSession: !!session,
      hasUser: !!session?.user,
    });

    if (isPending) {
      console.log("⏳ Session is loading...");
      setIsLoading(true);
      return;
    }

    if (session?.user) {
      // Better Auth session user with custom fields
      const sessionUser = session.user;
      console.log("👤 User session found:", {
        id: sessionUser.id,
        email: sessionUser.email,
        name: sessionUser.name,
        role: sessionUser.role || "client",
      });

      setUser(sessionUser as User);
      setUserRole(sessionUser.role || "client");
    } else {
      console.log("🚫 No user session found");
      setUser(null);
      setUserRole(null);
    }

    setIsLoading(false);
  }, [session, isPending]);

  // Handle navigation based on auth state and user role
  useEffect(() => {
    // Wait for fonts to load and session to be checked
    if (!loaded || isLoading) {
      console.log("⏸️  Navigation paused:", { loaded, isLoading });
      return;
    }

    const inAuthGroup = segments[0] === "auth";
    const inTabsGroup = segments[0] === "(tabs)";

    console.log("🧭 Navigation check:", {
      hasUser: !!user,
      userRole,
      currentSegment: segments[0],
      inAuthGroup,
      inTabsGroup,
    });

    // User is not authenticated
    if (!user) {
      if (inAuthGroup) {
        console.log("✅ Already on auth screen");
      } else {
        console.log("➡️  Redirecting to /auth (no user)");
        router.replace("/auth");
      }
      setNavigationReady(true);
      return;
    }

    // User is authenticated
    if (inAuthGroup) {
      // User is on auth screen but already logged in
      // Redirect based on role
      if (userRole === "merchant") {
        console.log("➡️  Redirecting merchant to /(tabs)/history");
        router.replace("/(tabs)/history");
      } else {
        console.log("➡️  Redirecting client to /(tabs)");
        router.replace("/(tabs)");
      }
    } else {
      console.log("✅ User in correct location");
    }

    setNavigationReady(true);
  }, [user, userRole, segments, router, isLoading, loaded]);

  // Hide splash screen when fonts are loaded
  useEffect(() => {
    if (loaded) {
      hideAsync();
    }
  }, [loaded]);

  // Show loading screen while checking session or loading fonts
  if (!loaded || isLoading || !navigationReady) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <GluestackUIProvider mode={colorScheme === "dark" ? "dark" : "light"}>
          <LoadingScreen />
        </GluestackUIProvider>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GluestackUIProvider mode={colorScheme === "dark" ? "dark" : "light"}>
        <UserContext.Provider value={{ user, userRole, isLoading }}>
          <QueryClientProvider client={queryClient}>
            <ThemeProvider
              value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
            >
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="auth" />
              </Stack>
              <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
            </ThemeProvider>
          </QueryClientProvider>
        </UserContext.Provider>
      </GluestackUIProvider>
    </GestureHandlerRootView>
  );
}
