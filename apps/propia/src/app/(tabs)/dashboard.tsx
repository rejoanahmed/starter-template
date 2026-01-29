import { renderNotification } from "@propia/app/screens/notifications";
import AnimatedView from "@propia/components/AnimatedView";
import { CardScroller } from "@propia/components/CardScroller";
import { Chip } from "@propia/components/Chip";
import Header, { HeaderIcon } from "@propia/components/Header";
import type { IconName } from "@propia/components/Icon";
import Section from "@propia/components/layout/Section";
import ThemedText from "@propia/components/ThemedText";
import ThemeScroller from "@propia/components/ThemeScroller";
import { shadowPresets } from "@propia/utils/useShadow";
import React from "react";
import { Image, Pressable, View } from "react-native";

// Order interfaces
// type MarketplaceOrder = {
//   id: number;
//   serviceName: string;
//   customerName: string;
//   customerAvatar: any;
//   date: string;
//   status: "pending" | "completed" | "canceled";
//   totalPaid: string;
// };

// Notification interfaces
type User = {
  id: number;
  name: string;
  avatar: string;
};

type Notification = {
  id: number;
  type:
    | "purchase"
    | "message"
    | "review"
    | "offer"
    | "seller"
    | "all"
    | "booking"
    | "payment"
    | "inquiry"
    | "cancellation";
  title: string;
  message: string;
  time: string;
  read: boolean;
  icon: IconName;
  user?: User;
};

const DashboardScreen = () => {
  const rightComponents = [
    <HeaderIcon
      hasBadge
      href="/screens/notifications"
      icon="Bell"
      key="notifications-icon"
    />,
  ];

  // Recent notifications
  const recentNotifications: Notification[] = [
    {
      id: 1,
      type: "booking",
      title: "New Booking Confirmed",
      message: "Maria Rodriguez booked your Beachfront Villa for 7 nights",
      time: "5 min ago",
      read: false,
      icon: "Calendar",
    },
    {
      id: 2,
      type: "message",
      title: "Guest Message",
      message: "John asked about early check-in for tomorrow",
      time: "1 hour ago",
      read: true,
      icon: "MessageCircle",
      user: {
        id: 101,
        name: "John Smith",
        avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      },
    },
    {
      id: 3,
      type: "review",
      title: "New 5-Star Review",
      message: "Sarah left a glowing review for your Downtown Loft",
      time: "3 hours ago",
      read: false,
      icon: "Star",
      user: {
        id: 102,
        name: "Sarah Miller",
        avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      },
    },
    {
      id: 4,
      type: "payment",
      title: "Payment Received",
      message: "You received $450 for Alex's stay at Mountain Cabin",
      time: "6 hours ago",
      read: true,
      icon: "DollarSign",
    },
    {
      id: 5,
      type: "inquiry",
      title: "Booking Inquiry",
      message: "Emma is interested in your City Apartment for next weekend",
      time: "1 day ago",
      read: false,
      icon: "HelpCircle",
      user: {
        id: 103,
        name: "Emma Wilson",
        avatar: "https://randomuser.me/api/portraits/women/68.jpg",
      },
    },
    {
      id: 6,
      type: "cancellation",
      title: "Booking Cancelled",
      message:
        "Guest cancelled reservation for Ocean View Suite - full refund issued",
      time: "2 days ago",
      read: true,
      icon: "X",
    },
  ];

  return (
    <View className="flex-1 bg-light-primary dark:bg-dark-primary">
      <Header rightComponents={rightComponents} />

      <ThemeScroller className="px-global" scrollEventThrottle={16}>
        <AnimatedView animation="scaleIn" className="flex-1">
          <ThemedText className="text-4xl font-semibold pr-20 pt-10 pb-16">
            Welcome back, John Doe
          </ThemedText>

          <Section className="mb-2" title="Recent reservations" titleSize="xl">
            <CardScroller className="mt-1">
              <Chip label="Arriving soon (1)" size="lg" />
              <Chip label="Upcoming (23)" size="lg" />
            </CardScroller>

            <ReservationCard />
          </Section>

          <Section
            className="mt-10 mb-2"
            title="Recent notifications"
            titleSize="xl"
          />
          <View className="overflow-hidden">
            {recentNotifications.map((notification) => (
              <React.Fragment key={notification.id}>
                {renderNotification(notification)}
              </React.Fragment>
            ))}
          </View>
        </AnimatedView>
      </ThemeScroller>
    </View>
  );
};

const ReservationCard = () => {
  return (
    <View
      className="rounded-xl mt-4 border border-neutral-300 dark:border-neutral-700 bg-light-primary dark:bg-dark-primary"
      style={shadowPresets.large}
    >
      <View className="p-4">
        <ThemedText className="mb-16 text-base font-semibold">
          Arriving tomorrow
        </ThemedText>
        <View className="flex-row items-center justify-between">
          <View>
            <ThemedText className="text-xl font-semibold">John Doe</ThemedText>
            <ThemedText className="text-base font-regular">
              Jun 23 - 28
            </ThemedText>
          </View>
          <Image
            className="w-12 h-12 rounded-full"
            source={require("@propia/assets/img/user-4.jpg")}
          />
        </View>
      </View>
      <View className="w-full flex-row border-t border-neutral-300 dark:border-neutral-700">
        <Pressable className="w-1/2 py-5 items-center border-r border-neutral-300 dark:border-neutral-700">
          <ThemedText className="font-semibold">Message</ThemedText>
        </Pressable>
        <Pressable className="w-1/2 py-5 items-center">
          <ThemedText className="font-semibold">Call</ThemedText>
        </Pressable>
      </View>
    </View>
  );
};

export default DashboardScreen;
