import { useBusinessMode } from "@propia/app/contexts/BusinesModeContext";
import AnimatedView from "@propia/components/AnimatedView";
import Avatar from "@propia/components/Avatar";
import BusinessSwitch from "@propia/components/BusinessSwitch";
import { Button } from "@propia/components/Button";
import Header, { HeaderIcon } from "@propia/components/Header";
import ListLink from "@propia/components/ListLink";
import Divider from "@propia/components/layout/Divider";
import ThemedText from "@propia/components/ThemedText";
import ThemedScroller from "@propia/components/ThemeScroller";
import ThemeToggle from "@propia/components/ThemeToggle";
import { shadowPresets } from "@propia/utils/useShadow";
import { router } from "expo-router";
import { Image, Pressable, View } from "react-native";

export default function ProfileScreen() {
  const { isBusinessMode } = useBusinessMode();
  return (
    <View className="flex-1 bg-light-primary dark:bg-dark-primary">
      <Header
        leftComponent={<ThemeToggle />}
        rightComponents={[
          <HeaderIcon
            href="/screens/notifications"
            icon="Bell"
            key="notifications"
          />,
        ]}
      />
      <View className="flex-1 bg-light-primary dark:bg-dark-primary">
        <ThemedScroller>
          {isBusinessMode ? <HostProfile /> : <PersonalProfile />}
        </ThemedScroller>
        <BusinessSwitch />
      </View>
    </View>
  );
}

const HostProfile = () => {
  return (
    <AnimatedView animation="scaleIn" className="">
      <View className="p-10 items-center rounded-3xl bg-slate-200 mt-6 mb-8 dark:bg-dark-secondary">
        <View className="w-20 h-20 relative">
          <View className="w-full h-full rounded-xl relative z-20 overflow-hidden border-2 border-light-primary dark:border-dark-primary">
            <Image
              className="w-full h-full"
              source={{
                uri: "https://images.unsplash.com/photo-1526318896980-cf78c088247c?q=80&w=400",
              }}
            />
          </View>
          <View className="w-full h-full absolute top-0 left-8 rotate-12 rounded-xl overflow-hidden border-2 border-light-primary dark:border-dark-primary">
            <Image
              className="w-full h-full"
              source={{
                uri: "https://images.pexels.com/photos/69903/pexels-photo-69903.jpeg?auto=compress&cs=tinysrgb&w=1200",
              }}
            />
          </View>
          <View className="w-full h-full absolute top-0 right-8 -rotate-12 rounded-xl overflow-hidden border-2 border-light-primary dark:border-dark-primary">
            <Image
              className="w-full h-full"
              source={{
                uri: "https://images.pexels.com/photos/69903/pexels-photo-69903.jpeg?auto=compress&cs=tinysrgb&w=1200",
              }}
            />
          </View>
        </View>
        <ThemedText className="text-2xl font-semibold mt-4">
          New to hosting?
        </ThemedText>
        <ThemedText className="text-sm font-light text-center px-4 ">
          Discover how to start hosting and earn extra income
        </ThemedText>
        <Button
          className="mt-4"
          textClassName="text-white"
          title="Get started"
        />
      </View>
      <View className="px-4">
        <ListLink
          href="/screens/reservations"
          icon="Briefcase"
          showChevron
          title="Reservations"
        />
        <ListLink
          href="/screens/earnings"
          icon="Banknote"
          showChevron
          title="Earnings"
        />
        <ListLink
          href="/screens/insights"
          icon="BarChart"
          showChevron
          title="Insights"
        />
        <ListLink
          href="/screens/add-property-start"
          icon="PlusCircle"
          showChevron
          title="Create new listing"
        />
      </View>
    </AnimatedView>
  );
};

const PersonalProfile = () => {
  return (
    <AnimatedView animation="scaleIn" className="pt-4">
      <View
        className="flex-row  items-center justify-center mb-4 bg-light-primary dark:bg-dark-secondary rounded-3xl p-10"
        style={{ ...shadowPresets.large }}
      >
        <View className="flex-col items-center w-1/2">
          <Avatar size="xxl" src={require("@propia/assets/img/thomino.jpg")} />
          <View className="flex-1 items-center justify-center">
            <ThemedText className="text-2xl font-bold">Thomino</ThemedText>
            <View className="flex flex-row items-center">
              <ThemedText className="text-sm text-light-subtext dark:text-dark-subtext ml-2">
                Bratislava, Slovakia
              </ThemedText>
            </View>
          </View>
        </View>
        <View className="flex-col items-start justify-center w-1/2 pl-12">
          <View className="w-full">
            <ThemedText className="text-xl font-bold">16</ThemedText>
            <ThemedText className="text-xs">Trips</ThemedText>
          </View>
          <View className="w-full py-3 my-3 border-y border-neutral-300 dark:border-dark-primary">
            <ThemedText className="text-xl font-bold">10</ThemedText>
            <ThemedText className="text-xs">Reviews</ThemedText>
          </View>
          <View className="w-full">
            <ThemedText className="text-xl font-bold">11</ThemedText>
            <ThemedText className="text-xs">Years</ThemedText>
          </View>
        </View>
      </View>

      <Pressable
        className="p-5 mb-4 flex flex-row items-center rounded-2xl bg-light-primary dark:bg-dark-secondary"
        onPress={() => router.push("/screens/add-property-start")}
        style={{ ...shadowPresets.large }}
      >
        <Image
          className="w-10 h-10 mr-4"
          source={require("@propia/assets/img/house.png")}
        />
        <View>
          <ThemedText className="text-base font-medium flex-1 pr-2">
            Become a host
          </ThemedText>
          <ThemedText className="text-xs opacity-60">
            It's easy to start hosting and earn extra income
          </ThemedText>
        </View>
      </Pressable>

      <View className="gap-1 px-4">
        <ListLink
          href="/screens/settings"
          icon="Settings"
          showChevron
          title="Account settings"
        />
        <ListLink
          href="/screens/edit-profile"
          icon="UserRoundPen"
          showChevron
          title="Edit profile"
        />
        <ListLink
          href="/screens/help"
          icon="HelpCircle"
          showChevron
          title="Get help"
        />
        <Divider />
        <ListLink
          href="/screens/welcome"
          icon="LogOut"
          showChevron
          title="Logout"
        />
      </View>
    </AnimatedView>
  );
};
