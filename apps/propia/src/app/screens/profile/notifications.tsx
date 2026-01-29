import { Button } from "@propia/components/Button";
import Switch from "@propia/components/forms/Switch";
import Header from "@propia/components/Header";
import Section from "@propia/components/layout/Section";
import ThemedText from "@propia/components/ThemedText";
import ThemedScroller from "@propia/components/ThemeScroller";
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { View } from "react-native";

const NotificationsScreen = () => {
  const navigation = useNavigation();

  const [notifications, setNotifications] = useState({
    pushEnabled: true,
    bookingUpdates: true,
    hostMessages: true,
    paymentConfirmations: true,
    reviewRequests: true,
    checkInReminders: true,
    specialOffers: false,
    hostPromotions: false,
    travelTips: false,
    marketingEmails: false,
  });

  const handleToggle = (
    setting: keyof typeof notifications,
    value: boolean
  ) => {
    setNotifications((prev) => ({
      ...prev,
      [setting]: value,
    }));
  };

  const saveSettings = () => {
    navigation.goBack();
  };

  return (
    <View className="flex-1 bg-light-bg dark:bg-dark-bg">
      <Header
        rightComponents={[
          <Button
            key="save-settings"
            onPress={saveSettings}
            title="Save changes"
          />,
        ]}
        showBackButton
      />
      <ThemedScroller>
        <Section
          className="mt-10 pb-10"
          subtitle="Stay updated on your bookings and travel plans"
          title="Notifications"
          titleSize="3xl"
        />

        <View className="mb-8">
          <ThemedText className="text-lg font-bold mb-4">
            Booking & Travel
          </ThemedText>

          <Switch
            className="mb-4"
            description="Confirmations, changes, and cancellations"
            disabled={!notifications.pushEnabled}
            label="Booking Updates"
            onChange={(value) => handleToggle("bookingUpdates", value)}
            value={notifications.bookingUpdates}
          />

          <Switch
            className="mb-4"
            description="Messages from your hosts and property owners"
            disabled={!notifications.pushEnabled}
            label="Host Messages"
            onChange={(value) => handleToggle("hostMessages", value)}
            value={notifications.hostMessages}
          />

          <Switch
            className="mb-4"
            description="Receipts and payment processing updates"
            disabled={!notifications.pushEnabled}
            label="Payment Confirmations"
            onChange={(value) => handleToggle("paymentConfirmations", value)}
            value={notifications.paymentConfirmations}
          />

          <Switch
            className="mb-4"
            description="Reminders to review your stays and experiences"
            disabled={!notifications.pushEnabled}
            label="Review Requests"
            onChange={(value) => handleToggle("reviewRequests", value)}
            value={notifications.reviewRequests}
          />

          <Switch
            className="mb-2"
            description="Important information before your arrival"
            disabled={!notifications.pushEnabled}
            label="Check-in Reminders"
            onChange={(value) => handleToggle("checkInReminders", value)}
            value={notifications.checkInReminders}
          />
        </View>

        <View className="mt-8">
          <ThemedText className="text-lg font-bold mb-4">
            Promotions & Marketing
          </ThemedText>

          <Switch
            className="mb-4"
            description="Discounts and deals on accommodations"
            label="Special Offers"
            onChange={(value) => handleToggle("specialOffers", value)}
            value={notifications.specialOffers}
          />

          <Switch
            className="mb-4"
            description="Exclusive offers from your favorite hosts"
            label="Host Promotions"
            onChange={(value) => handleToggle("hostPromotions", value)}
            value={notifications.hostPromotions}
          />

          <Switch
            className="mb-4"
            description="Destination guides and travel recommendations"
            label="Travel Tips"
            onChange={(value) => handleToggle("travelTips", value)}
            value={notifications.travelTips}
          />

          <Switch
            className="mb-2"
            description="Newsletters and destination inspiration"
            label="Marketing Emails"
            onChange={(value) => handleToggle("marketingEmails", value)}
            value={notifications.marketingEmails}
          />
        </View>
      </ThemedScroller>
    </View>
  );
};

export default NotificationsScreen;
