import { useBusinessMode } from "@propia/app/contexts/BusinesModeContext";
import useThemeColors from "@propia/app/contexts/ThemeColors";
import { TabButton } from "@propia/components/TabButton";
import { TabList, TabSlot, Tabs, TabTrigger } from "expo-router/ui";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Layout() {
  const colors = useThemeColors();
  const { isBusinessMode } = useBusinessMode();
  const insets = useSafeAreaInsets();
  return (
    <Tabs>
      <TabSlot />
      <TabList
        style={{
          //height: 80,
          backgroundColor: colors.bg,
          borderTopColor: colors.secondary,
          borderTopWidth: 1,
          // paddingTop: insets.top,
          paddingBottom: insets.bottom,
        }}
      >
        {/****Host tabs */}
        <TabTrigger
          asChild
          href="/(tabs)/dashboard"
          name="dashboard"
          style={{ display: isBusinessMode ? "flex" : "none" }}
        >
          <TabButton icon="Home" labelAnimated={false}>
            Home
          </TabButton>
        </TabTrigger>
        <TabTrigger
          asChild
          href="/(tabs)/calendar"
          name="calendar"
          style={{ display: isBusinessMode ? "flex" : "none" }}
        >
          <TabButton icon="CalendarFold" labelAnimated={false}>
            Calendar
          </TabButton>
        </TabTrigger>
        <TabTrigger
          asChild
          href="/(tabs)/listings"
          name="analytics"
          style={{ display: isBusinessMode ? "flex" : "none" }}
        >
          <TabButton icon="File" labelAnimated={false}>
            Listings
          </TabButton>
        </TabTrigger>

        {/* Consumer mode tabs */}
        <TabTrigger
          asChild
          href="/(tabs)/(home)"
          name="(home)"
          style={{ display: isBusinessMode ? "none" : "flex" }}
        >
          <TabButton icon="Search" labelAnimated={false}>
            Home
          </TabButton>
        </TabTrigger>

        <TabTrigger
          asChild
          href="/favorites"
          name="favorites"
          style={{ display: isBusinessMode ? "none" : "flex" }}
        >
          <TabButton icon="Heart" labelAnimated={false}>
            Favorites
          </TabButton>
        </TabTrigger>

        <TabTrigger
          asChild
          href="/trips"
          name="trips"
          style={{ display: isBusinessMode ? "none" : "flex" }}
        >
          <TabButton icon="Plane" labelAnimated={false}>
            Trips
          </TabButton>
        </TabTrigger>

        <TabTrigger
          asChild
          href="/(tabs)/chat"
          name="chat"
          style={{ display: isBusinessMode ? "flex" : "flex" }}
        >
          <TabButton hasBadge icon="MessageSquare" labelAnimated={false}>
            Messages
          </TabButton>
        </TabTrigger>

        <TabTrigger
          asChild
          href="/profile"
          name="profile"
          style={{ display: isBusinessMode ? "flex" : "flex" }}
        >
          <TabButton icon="CircleUser" labelAnimated={false}>
            Profile
          </TabButton>
        </TabTrigger>
      </TabList>
    </Tabs>
  );
}
