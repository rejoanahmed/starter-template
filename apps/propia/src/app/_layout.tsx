import "../global.css";
import { Stack } from "expo-router";
import { Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BusinessModeProvider } from "./contexts/BusinesModeContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import useThemedNavigation from "./hooks/useThemedNavigation";

function ThemedLayout() {
  const { ThemedStatusBar, screenOptions } = useThemedNavigation();

  return (
    <>
      <ThemedStatusBar />
      <Stack screenOptions={screenOptions} />
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView
      className={`bg-light-primary dark:bg-dark-primary ${Platform.OS === "ios" ? "pb-0 " : ""}`}
      style={{ flex: 1 }}
    >
      <BusinessModeProvider>
        <ThemeProvider>
          <ThemedLayout />
        </ThemeProvider>
      </BusinessModeProvider>
    </GestureHandlerRootView>
  );
}
