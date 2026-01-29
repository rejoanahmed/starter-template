import AnimatedView from "@propia/components/AnimatedView";
import Header from "@propia/components/Header";
import ListLink from "@propia/components/ListLink";
import Section from "@propia/components/layout/Section";
import ThemedScroller from "@propia/components/ThemeScroller";
import { View } from "react-native";

export default function ProfileScreen() {
  return (
    <AnimatedView
      animation="fadeIn"
      className="flex-1 bg-light-primary dark:bg-dark-primary"
      duration={350}
      playOnlyOnce={false}
    >
      <Header showBackButton />
      <ThemedScroller>
        <Section
          className="pt-4 pb-10 px-4"
          subtitle="Manage your account settings"
          title="Settings"
          titleSize="3xl"
        />

        <View className="px-4">
          <ListLink
            description="Manage payment methods"
            href="/screens/profile/payments"
            icon="CreditCard"
            title="Payments"
          />
          <ListLink
            description="Push notifications, email notifications"
            href="/screens/profile/notifications"
            icon="Bell"
            title="Notifications"
          />
          <ListLink
            description="USD - United states dollar"
            href="/screens/profile/currency"
            icon="DollarSign"
            title="Currency"
          />
          <ListLink
            description="Contact support"
            href="/screens/help"
            icon="HelpCircle"
            title="Help"
          />
        </View>
      </ThemedScroller>
    </AnimatedView>
  );
}
