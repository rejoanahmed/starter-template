import AnimatedView from "@propia/components/AnimatedView";
import { Button } from "@propia/components/Button";
import Header from "@propia/components/Header";
import Icon from "@propia/components/Icon";
import Divider from "@propia/components/layout/Divider";
import Section from "@propia/components/layout/Section";
import ShowRating from "@propia/components/ShowRating";
import ThemedText from "@propia/components/ThemedText";
import { useState } from "react";
import { Image, Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Property interface
type Property = {
  id: string;
  name: string;
  image: any;
  rating: number;
  reviews: number;
  location: string;
};

// Trip details interface
type TripDetails = {
  checkIn: string;
  checkOut: string;
  guests: number;
  nights: number;
};

// Payment method interface
type PaymentMethod = {
  id: string;
  type: "credit_card" | "debit_card" | "online_banking";
  name: string;
  details: string;
  icon: string;
};

// Price breakdown interface
type PriceBreakdown = {
  basePrice: number;
  nights: number;
  serviceFee: number;
  cleaningFee: number;
  taxes: number;
  total: number;
};

// Sample property data
const propertyData: Property = {
  id: "1",
  name: "Luxury Penthouse with Central Park View",
  image: require("@propia/assets/img/room-2.avif"),
  rating: 4.9,
  reviews: 284,
  location: "Upper East Side, Manhattan",
};

// Sample trip details
const tripDetails: TripDetails = {
  checkIn: "Jun 5, 2024",
  checkOut: "Jun 12, 2024",
  guests: 4,
  nights: 7,
};

// Sample payment methods
const paymentMethods: PaymentMethod[] = [
  {
    id: "1",
    type: "credit_card",
    name: "Visa ending in 1234",
    details: "•••• •••• •••• 1234",
    icon: "CreditCard",
  },
  {
    id: "2",
    type: "credit_card",
    name: "Mastercard ending in 5678",
    details: "•••• •••• •••• 5678",
    icon: "CreditCard",
  },
  {
    id: "3",
    type: "online_banking",
    name: "Online Banking",
    details: "Pay with your bank account",
    icon: "Building2",
  },
];

// Sample price breakdown
const priceBreakdown: PriceBreakdown = {
  basePrice: 850,
  nights: 7,
  serviceFee: 95,
  cleaningFee: 75,
  taxes: 142,
  total: 6107,
};

export default function OrderDetailScreen() {
  const insets = useSafeAreaInsets();
  // const { id } = useLocalSearchParams<{ id: string }>();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("1");

  return (
    <View className="flex-1 bg-light-primary dark:bg-dark-primary">
      <Header showBackButton title="Confirm and pay" />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <AnimatedView animation="fadeIn" delay={100} duration={400}>
          {/* Property Card */}
          <View className="px-global pt-4">
            <View className="border-neutral-300 border dark:border-dark-neutral-500 rounded-lg p-2">
              <View className="flex-row items-center">
                <Image
                  className="w-20 h-20 rounded-lg mr-4"
                  resizeMode="cover"
                  source={propertyData.image}
                />
                <View className="flex-1">
                  <ThemedText
                    className="text-base font-semibold"
                    numberOfLines={2}
                  >
                    {propertyData.name}
                  </ThemedText>
                  <View className="flex-row items-center">
                    <ShowRating rating={propertyData.rating} size="sm" />
                    <ThemedText className="text-xs text-light-subtext dark:text-dark-subtext ml-2">
                      ({propertyData.reviews} reviews)
                    </ThemedText>
                  </View>
                </View>
              </View>
            </View>
          </View>

          <Divider className="my-6" />

          {/* Trip Details */}
          <Section className="px-global" title="Your trip" titleSize="lg">
            <View className="mt-4">
              {/* Dates */}
              <View className="flex-row items-center justify-between py-4">
                <View>
                  <ThemedText className="font-semibold">Dates</ThemedText>
                  <ThemedText className="text-sm text-light-subtext dark:text-dark-subtext mt-1">
                    {tripDetails.checkIn} - {tripDetails.checkOut}
                  </ThemedText>
                </View>
                <Button
                  rounded="lg"
                  size="small"
                  title="Change"
                  variant="outline"
                />
              </View>

              <Divider />

              {/* Guests */}
              <View className="flex-row items-center justify-between py-4">
                <View>
                  <ThemedText className="font-semibold">Guests</ThemedText>
                  <ThemedText className="text-sm text-light-subtext dark:text-dark-subtext mt-1">
                    {tripDetails.guests} guests
                  </ThemedText>
                </View>
                <Button
                  rounded="lg"
                  size="small"
                  title="Change"
                  variant="outline"
                />
              </View>
            </View>
          </Section>

          <Divider className="my-6" />

          {/* Cancellation Policy */}
          <Section
            className="px-global"
            title="Cancellation policy"
            titleSize="lg"
          >
            <View className="mt-4 flex-row items-start">
              <Icon
                className="mr-3 mt-1 text-green-500"
                name="Shield"
                size={20}
              />
              <View className="flex-1">
                <ThemedText className="font-semibold text-green-600 dark:text-green-400">
                  Free cancellation before Jun 3
                </ThemedText>
                <ThemedText className="text-sm text-light-subtext dark:text-dark-subtext mt-1">
                  Cancel before Jun 3 for a full refund. After that, cancel
                  before check-in and get a 50% refund.
                </ThemedText>
              </View>
            </View>
          </Section>

          <Divider className="my-6" />

          {/* Payment Method */}
          <Section
            className="px-global"
            title="Choose how to pay"
            titleSize="lg"
          >
            <View className="mt-4 space-y-3">
              {paymentMethods.map((method) => (
                <Pressable
                  className={`flex-row items-center p-4 rounded-lg border ${
                    selectedPaymentMethod === method.id
                      ? "border-highlight "
                      : "border-light-secondary dark:border-dark-secondary"
                  }`}
                  key={method.id}
                  onPress={() => setSelectedPaymentMethod(method.id)}
                >
                  <Icon className="mr-4" name={method.icon as any} size={24} />
                  <View className="flex-1">
                    <ThemedText className="font-medium">
                      {method.name}
                    </ThemedText>
                    <ThemedText className="text-sm text-light-subtext dark:text-dark-subtext">
                      {method.details}
                    </ThemedText>
                  </View>
                  <View
                    className={`w-5 h-5 rounded-full border-2 ${
                      selectedPaymentMethod === method.id
                        ? "border-highlight bg-highlight"
                        : "border-light-subtext dark:border-dark-subtext"
                    } items-center justify-center`}
                  >
                    {selectedPaymentMethod === method.id && (
                      <View className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </View>
                </Pressable>
              ))}
            </View>

            {/* Add payment method */}
            <Pressable className="flex-row items-center p-4 mt-3 border border-dashed border-light-subtext dark:border-dark-subtext rounded-lg">
              <Icon
                className="mr-4 text-light-subtext dark:text-dark-subtext"
                name="Plus"
                size={24}
              />
              <ThemedText className="text-light-subtext dark:text-dark-subtext">
                Add payment method
              </ThemedText>
            </Pressable>
          </Section>

          <Divider className="my-6" />

          {/* Price Details */}
          <Section className="px-global" title="Price details" titleSize="lg">
            <View className="mt-4 space-y-3">
              <View className="flex-row justify-between">
                <ThemedText>
                  ${priceBreakdown.basePrice} x {priceBreakdown.nights} nights
                </ThemedText>
                <ThemedText>
                  $
                  {(
                    priceBreakdown.basePrice * priceBreakdown.nights
                  ).toLocaleString()}
                </ThemedText>
              </View>

              <View className="flex-row justify-between">
                <ThemedText>Service fee</ThemedText>
                <ThemedText>${priceBreakdown.serviceFee}</ThemedText>
              </View>

              <View className="flex-row justify-between">
                <ThemedText>Cleaning fee</ThemedText>
                <ThemedText>${priceBreakdown.cleaningFee}</ThemedText>
              </View>

              <View className="flex-row justify-between">
                <ThemedText>Taxes</ThemedText>
                <ThemedText>${priceBreakdown.taxes}</ThemedText>
              </View>

              <Divider className="my-3" />

              <View className="flex-row justify-between">
                <ThemedText className="font-bold text-lg">
                  Total (USD)
                </ThemedText>
                <ThemedText className="font-bold text-lg">
                  ${priceBreakdown.total.toLocaleString()}
                </ThemedText>
              </View>
            </View>
          </Section>

          {/* Terms and conditions */}
          <View className="px-global mt-6">
            <ThemedText className="text-xs text-light-subtext dark:text-dark-subtext leading-5">
              By selecting the button below, I agree to the Host's House Rules,
              Ground rules for guests, Airbnb's Rebooking and Refund Policy, and
              that Airbnb can charge my payment method if I'm responsible for
              damage.
            </ThemedText>
          </View>
        </AnimatedView>
      </ScrollView>

      {/* Bottom Confirm Button */}
      <View
        className="absolute bottom-0 left-0 right-0 px-global py-4 bg-light-primary dark:bg-dark-primary border-t border-light-secondary dark:border-dark-secondary"
        style={{ paddingBottom: insets.bottom + 16 }}
      >
        <Button
          className="w-full bg-highlight"
          href="/screens/trip-detail"
          rounded="lg"
          size="large"
          textClassName="text-white font-semibold"
          title="Confirm and pay"
        />
      </View>
    </View>
  );
}
