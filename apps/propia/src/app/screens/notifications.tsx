import { Chip } from "@propia/components/Chip";
import Header from "@propia/components/Header";
import Icon, { type IconName } from "@propia/components/Icon";
import List from "@propia/components/layout/List";
import ListItem from "@propia/components/layout/ListItem";
import SkeletonLoader from "@propia/components/SkeletonLoader";
import ThemedText from "@propia/components/ThemedText";
import ThemedScroller from "@propia/components/ThemeScroller";
import { useEffect, useState } from "react";
import { Image, View } from "react-native";

type NotificationType =
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

type User = {
  id: number;
  name: string;
  avatar: string;
};

type Notification = {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  read: boolean;
  icon: IconName;
  user?: User; // Optional user field for notifications from other users
};

export default function NotificationsScreen() {
  const [selectedType, setSelectedType] = useState<NotificationType>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [notificationsData, setNotificationsData] = useState<Notification[]>(
    []
  );

  // Define notifications data outside useEffect to avoid re-creation
  const notifications: Notification[] = [
    {
      id: 1,
      type: "booking",
      title: "New Booking Confirmed",
      message: "Maria Rodriguez booked your Beachfront Villa for 7 nights",
      time: "2 min ago",
      read: false,
      icon: "Calendar",
    },
    {
      id: 2,
      type: "message",
      title: "Guest Message",
      message: "Alex has sent you a message about check-in details",
      time: "1 hour ago",
      read: true,
      icon: "MessageCircle",
      user: {
        id: 101,
        name: "Alex Thompson",
        avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      },
    },
    {
      id: 3,
      type: "inquiry",
      title: "Booking Inquiry",
      message: "Sarah is interested in your Downtown Loft for next weekend",
      time: "2 hours ago",
      read: false,
      icon: "HelpCircle",
      user: {
        id: 102,
        name: "Sarah Miller",
        avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      },
    },
    {
      id: 4,
      type: "review",
      title: "New 5-Star Review",
      message: "Michael left a glowing review for your Mountain Cabin",
      time: "1 day ago",
      read: true,
      icon: "Star",
      user: {
        id: 103,
        name: "Michael Chen",
        avatar: "https://randomuser.me/api/portraits/men/45.jpg",
      },
    },
    {
      id: 5,
      type: "payment",
      title: "Payment Received",
      message: "You received $650 for Jamie's stay at Ocean View Suite",
      time: "2 days ago",
      read: false,
      icon: "DollarSign",
    },
    {
      id: 6,
      type: "booking",
      title: "Check-in Reminder",
      message: "Emma Wilson is checking in today at 3 PM",
      time: "3 days ago",
      read: true,
      icon: "Clock",
      user: {
        id: 104,
        name: "Emma Wilson",
        avatar: "https://randomuser.me/api/portraits/women/63.jpg",
      },
    },
    {
      id: 7,
      type: "message",
      title: "Guest Question",
      message: "David has questions about WiFi password and parking",
      time: "4 days ago",
      read: false,
      icon: "MessageCircle",
      user: {
        id: 105,
        name: "David Kim",
        avatar: "https://randomuser.me/api/portraits/men/67.jpg",
      },
    },
    {
      id: 8,
      type: "cancellation",
      title: "Booking Cancelled",
      message:
        "Guest cancelled reservation for City Apartment - partial refund issued",
      time: "5 days ago",
      read: true,
      icon: "X",
    },
    {
      id: 9,
      type: "payment",
      title: "Payout Processed",
      message: "Your weekly earnings of $1,250 have been transferred",
      time: "6 days ago",
      read: false,
      icon: "CreditCard",
    },
    {
      id: 10,
      type: "booking",
      title: "Booking Request",
      message: "Lisa wants to book your Lakeside Cottage for 5 nights",
      time: "1 week ago",
      read: true,
      icon: "Calendar",
      user: {
        id: 106,
        name: "Lisa Garcia",
        avatar: "https://randomuser.me/api/portraits/women/72.jpg",
      },
    },
    {
      id: 11,
      type: "review",
      title: "Review Response",
      message: "Tom replied to your response on his 4-star review",
      time: "1 week ago",
      read: false,
      icon: "MessageSquare",
      user: {
        id: 107,
        name: "Tom Anderson",
        avatar: "https://randomuser.me/api/portraits/men/89.jpg",
      },
    },
    {
      id: 12,
      type: "inquiry",
      title: "Special Request",
      message: "Guest asking about pet-friendly accommodations",
      time: "2 weeks ago",
      read: true,
      icon: "Heart",
    },
  ];

  // Load notifications data with proper useEffect
  useEffect(() => {
    console.log("Loading notifications...");

    // Simulate API call with a delay
    const loadData = async () => {
      try {
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Set notifications data
        setNotificationsData(notifications);

        // Turn off loading state
        setIsLoading(false);
        console.log("Notifications loaded successfully");
      } catch (error) {
        console.error("Error loading notifications:", error);
        setIsLoading(false); // Ensure loading state is turned off even if there's an error
      }
    };

    loadData();

    // Cleanup function
    return () => {
      console.log("Notifications component unmounted");
    };
  }, []); // Empty dependency array means this runs once on mount

  // Filter notifications based on selected type
  const filteredNotifications = notificationsData.filter((notification) =>
    selectedType === "all" ? true : notification.type === selectedType
  );

  return (
    <>
      <Header showBackButton title="Notifications" />
      <View className="flex-1 bg-light-primary dark:bg-dark-primary">
        <View className="p-4 flex-row gap-1">
          <Chip
            isSelected={selectedType === "all"}
            label="All"
            onPress={() => setSelectedType("all")}
          />
          <Chip
            isSelected={selectedType === "booking"}
            label="Bookings"
            onPress={() => setSelectedType("booking")}
          />
          <Chip
            isSelected={selectedType === "message"}
            label="Messages"
            onPress={() => setSelectedType("message")}
          />
          <Chip
            isSelected={selectedType === "payment"}
            label="Payments"
            onPress={() => setSelectedType("payment")}
          />
          <Chip
            isSelected={selectedType === "review"}
            label="Reviews"
            onPress={() => setSelectedType("review")}
          />
          <Chip
            isSelected={selectedType === "inquiry"}
            label="Inquiries"
            onPress={() => setSelectedType("inquiry")}
          />
        </View>

        <ThemedScroller>
          {isLoading ? (
            <View className="p-4">
              <SkeletonLoader count={6} variant="list" />
            </View>
          ) : (
            <List variant="divided">
              {filteredNotifications.length > 0 ? (
                filteredNotifications.map((notification) => (
                  <View key={notification.id}>
                    {renderNotification(notification)}
                  </View>
                ))
              ) : (
                <View className="p-8 items-center">
                  <ThemedText>No notifications found</ThemedText>
                </View>
              )}
            </List>
          )}
        </ThemedScroller>
      </View>
    </>
  );
}

export const renderNotification = (notification: Notification) => (
  <ListItem
    className={`py-4 ${notification.read ? "" : "bg-light-secondary/5 dark:bg-dark-secondary/5"}`}
    leading={
      notification.user ? (
        <Image
          className="w-10 h-10 rounded-full"
          source={{ uri: notification.user.avatar }}
        />
      ) : (
        <View className="bg-light-secondary/30 dark:bg-dark-subtext/30 w-10 h-10 rounded-full items-center justify-center">
          <Icon name={notification.icon} size={20} />
        </View>
      )
    }
    subtitle={notification.message}
    title={<ThemedText className="font-bold">{notification.title}</ThemedText>}
    trailing={
      <ThemedText className="text-xs text-light-subtext dark:text-dark-subtext">
        {notification.time}
      </ThemedText>
    }
  />
);
