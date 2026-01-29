import useThemeColors from "@propia/app/contexts/ThemeColors";
import AnimatedView from "@propia/components/AnimatedView";
import Avatar from "@propia/components/Avatar";
import { Button } from "@propia/components/Button";
import Header from "@propia/components/Header";
import Icon from "@propia/components/Icon";
import ImageCarousel from "@propia/components/ImageCarousel";
import ListLink from "@propia/components/ListLink";
import Divider from "@propia/components/layout/Divider";
import Section from "@propia/components/layout/Section";
import ShowRating from "@propia/components/ShowRating";
import ThemedText from "@propia/components/ThemedText";
import ThemedFooter from "@propia/components/ThemeFooter";
import ThemedScroller from "@propia/components/ThemeScroller";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Sample trip data
const tripData = {
  id: "1",
  propertyName: "Luxury Beachfront Villa",
  location: "Barcelona, Spain",
  host: {
    name: "Maria Rodriguez",
    avatar: require("@propia/assets/img/user-2.jpg"),
    rating: 4.9,
    reviewCount: 127,
  },
  checkIn: "Jul 15, 2024",
  checkOut: "Jul 22, 2024",
  nights: 7,
  guests: 4,
  reservationNumber: "#RES-789456",
  totalPrice: "$2,450",
  priceBreakdown: {
    nightlyRate: "$300",
    nights: 7,
    subtotal: "$2,100",
    cleaningFee: "$75",
    serviceFee: "$150",
    taxes: "$125",
    total: "$2,450",
  },
  paymentMethod: {
    type: "Visa",
    lastFour: "1234",
    amount: "$2,450",
  },
  cancellationPolicy:
    "Free cancellation until Jul 8. Cancel before check-in on Jul 15 for a partial refund.",
  coordinates: {
    latitude: 41.3851,
    longitude: 2.1734,
  },
};

const TripDetailScreen = () => {
  const _colors = useThemeColors();
  const _insets = useSafeAreaInsets();

  return (
    <>
      <Header showBackButton title="Trip Details" />
      <ThemedScroller
        className="flex-1 px-0"
        keyboardShouldPersistTaps="handled"
      >
        <AnimatedView animation="fadeIn" delay={100} duration={400}>
          {/* Property Images */}
          <View className="px-global">
            <ImageCarousel
              height={300}
              images={[
                "https://tinyurl.com/2blrf2sk",
                "https://tinyurl.com/2yyfr9rc",
                "https://tinyurl.com/2cmu4ns5",
              ]}
              rounded="2xl"
            />
          </View>

          {/* Property Name and Location */}
          <View className="px-global pt-6 pb-4">
            <ThemedText className="text-2xl font-bold mb-2">
              {tripData.propertyName}
            </ThemedText>
            <View className="flex-row items-center">
              <Icon
                className="mr-2 text-light-subtext dark:text-dark-subtext"
                name="MapPin"
                size={16}
              />
              <ThemedText className="text-light-subtext dark:text-dark-subtext">
                {tripData.location}
              </ThemedText>
            </View>
          </View>

          <Divider className="h-2 bg-light-secondary dark:bg-dark-darker" />

          {/* Host Information */}
          <Section className="px-global pt-4" title="Hosted by" titleSize="lg">
            <View className="flex-row items-center justify-between mt-4 mb-4">
              <View className="flex-row items-center flex-1">
                <Avatar size="lg" src={tripData.host.avatar} />
                <View className="ml-3 flex-1">
                  <ThemedText className="text-lg font-semibold">
                    {tripData.host.name}
                  </ThemedText>
                  <View className="flex-row items-center mt-1">
                    <ShowRating rating={tripData.host.rating} size="sm" />
                    <ThemedText className="text-sm text-light-subtext dark:text-dark-subtext ml-2">
                      ({tripData.host.reviewCount} reviews)
                    </ThemedText>
                  </View>
                </View>
              </View>
            </View>

            <ListLink
              className="px-4 py-3 bg-light-secondary dark:bg-dark-secondary rounded-xl"
              description="Get help with your reservation"
              href="/screens/chat/user"
              icon="MessageCircle"
              showChevron
              title="Message host"
            />
          </Section>

          <Divider className="mt-6 h-2 bg-light-secondary dark:bg-dark-darker" />

          {/* Check-in / Check-out */}
          <Section className="px-global pt-4" title="Your stay" titleSize="lg">
            <View className="mt-4 space-y-4">
              <View className="flex-row items-center justify-between bg-light-secondary dark:bg-dark-secondary rounded-xl p-4">
                <View>
                  <ThemedText className="text-sm text-light-subtext dark:text-dark-subtext">
                    Check-in
                  </ThemedText>
                  <ThemedText className="text-lg font-semibold">
                    {tripData.checkIn}
                  </ThemedText>
                  <ThemedText className="text-sm text-light-subtext dark:text-dark-subtext">
                    After 3:00 PM
                  </ThemedText>
                </View>
                <View className="items-end">
                  <ThemedText className="text-sm text-light-subtext dark:text-dark-subtext">
                    Check-out
                  </ThemedText>
                  <ThemedText className="text-lg font-semibold">
                    {tripData.checkOut}
                  </ThemedText>
                  <ThemedText className="text-sm text-light-subtext dark:text-dark-subtext">
                    Before 11:00 AM
                  </ThemedText>
                </View>
              </View>

              <View className="flex-row items-center justify-between pt-2">
                <View>
                  <ThemedText className="text-sm text-light-subtext dark:text-dark-subtext">
                    Duration
                  </ThemedText>
                  <ThemedText className="text-lg font-semibold">
                    {tripData.nights} nights
                  </ThemedText>
                </View>
                <View className="items-end">
                  <ThemedText className="text-sm text-light-subtext dark:text-dark-subtext">
                    Guests
                  </ThemedText>
                  <ThemedText className="text-lg font-semibold">
                    {tripData.guests} guests
                  </ThemedText>
                </View>
              </View>
            </View>
          </Section>

          <Divider className="mt-6 h-2 bg-light-secondary dark:bg-dark-darker" />

          {/* Reservation Details */}
          <Section
            className="px-global pt-4"
            title="Reservation details"
            titleSize="lg"
          >
            <View className="mt-4 space-y-3">
              <View className="flex-row justify-between">
                <ThemedText className="text-light-subtext dark:text-dark-subtext">
                  Reservation number
                </ThemedText>
                <ThemedText className="font-medium">
                  {tripData.reservationNumber}
                </ThemedText>
              </View>

              <View className="flex-row justify-between">
                <ThemedText className="text-light-subtext dark:text-dark-subtext">
                  Guests
                </ThemedText>
                <ThemedText className="font-medium">
                  {tripData.guests} guests
                </ThemedText>
              </View>

              <View className="mt-4">
                <ThemedText className="text-sm font-medium mb-2">
                  Cancellation policy
                </ThemedText>
                <ThemedText className="text-sm text-light-subtext dark:text-dark-subtext leading-5">
                  {tripData.cancellationPolicy}
                </ThemedText>
              </View>
            </View>
          </Section>

          <Divider className="mt-6 h-2 bg-light-secondary dark:bg-dark-darker" />

          {/* Price Breakdown */}
          <Section
            className="px-global pt-4"
            title="Price details"
            titleSize="lg"
          >
            <View className="mt-4 space-y-3">
              <View className="flex-row justify-between">
                <ThemedText className="text-light-subtext dark:text-dark-subtext">
                  {tripData.priceBreakdown.nightlyRate} x{" "}
                  {tripData.priceBreakdown.nights} nights
                </ThemedText>
                <ThemedText>{tripData.priceBreakdown.subtotal}</ThemedText>
              </View>

              <View className="flex-row justify-between">
                <ThemedText className="text-light-subtext dark:text-dark-subtext">
                  Cleaning fee
                </ThemedText>
                <ThemedText>{tripData.priceBreakdown.cleaningFee}</ThemedText>
              </View>

              <View className="flex-row justify-between">
                <ThemedText className="text-light-subtext dark:text-dark-subtext">
                  Service fee
                </ThemedText>
                <ThemedText>{tripData.priceBreakdown.serviceFee}</ThemedText>
              </View>

              <View className="flex-row justify-between">
                <ThemedText className="text-light-subtext dark:text-dark-subtext">
                  Taxes
                </ThemedText>
                <ThemedText>{tripData.priceBreakdown.taxes}</ThemedText>
              </View>

              <Divider className="my-3" />

              <View className="flex-row justify-between">
                <ThemedText className="font-bold text-lg">Total</ThemedText>
                <ThemedText className="font-bold text-lg">
                  {tripData.priceBreakdown.total}
                </ThemedText>
              </View>
            </View>
          </Section>

          <Divider className="mt-6 h-2 bg-light-secondary dark:bg-dark-darker" />

          {/* Payment Information */}
          <Section
            className="px-global pt-4"
            title="Payment information"
            titleSize="lg"
          >
            <View className="flex-row items-center mt-4">
              <Icon className="mr-3" name="CreditCard" size={20} />
              <View>
                <ThemedText className="font-medium">
                  {tripData.paymentMethod.type} ••••{" "}
                  {tripData.paymentMethod.lastFour}
                </ThemedText>
                <ThemedText className="text-sm text-light-subtext dark:text-dark-subtext">
                  Charged {tripData.paymentMethod.amount}
                </ThemedText>
              </View>
            </View>
          </Section>

          <Divider className="mt-6 h-2 bg-light-secondary dark:bg-dark-darker" />

          {/* Rules and Instructions */}
          <Section
            className="px-global pt-4"
            title="House rules & instructions"
            titleSize="lg"
          >
            <View className="mt-4 space-y-4">
              <View className="flex-row items-start">
                <Icon
                  className="mr-3 mt-1 text-light-subtext dark:text-dark-subtext"
                  name="Clock"
                  size={16}
                />
                <View>
                  <ThemedText className="font-medium">
                    Check-in: After 3:00 PM
                  </ThemedText>
                  <ThemedText className="text-sm text-light-subtext dark:text-dark-subtext">
                    Self check-in with keypad
                  </ThemedText>
                </View>
              </View>

              <View className="flex-row items-start">
                <Icon
                  className="mr-3 mt-1 text-light-subtext dark:text-dark-subtext"
                  name="Users"
                  size={16}
                />
                <View>
                  <ThemedText className="font-medium">
                    Maximum 4 guests
                  </ThemedText>
                  <ThemedText className="text-sm text-light-subtext dark:text-dark-subtext">
                    No additional guests allowed
                  </ThemedText>
                </View>
              </View>

              <View className="flex-row items-start">
                <Icon
                  className="mr-3 mt-1 text-light-subtext dark:text-dark-subtext"
                  name="Volume2"
                  size={16}
                />
                <View>
                  <ThemedText className="font-medium">
                    Quiet hours: 10:00 PM - 8:00 AM
                  </ThemedText>
                  <ThemedText className="text-sm text-light-subtext dark:text-dark-subtext">
                    Please respect the neighbors
                  </ThemedText>
                </View>
              </View>

              <View className="flex-row items-start">
                <Icon
                  className="mr-3 mt-1 text-light-subtext dark:text-dark-subtext"
                  name="Ban"
                  size={16}
                />
                <View>
                  <ThemedText className="font-medium">No smoking</ThemedText>
                  <ThemedText className="text-sm text-light-subtext dark:text-dark-subtext">
                    Smoking is not allowed anywhere on the property
                  </ThemedText>
                </View>
              </View>
            </View>
          </Section>

          <Divider className="mt-6 h-2 bg-light-secondary dark:bg-dark-darker" />

          {/* Location */}
          <Section
            className="px-global pt-4 pb-6"
            title="Location"
            titleSize="lg"
          >
            <View className="mt-4">
              <ThemedText className="text-light-subtext dark:text-dark-subtext mb-4">
                {tripData.location}
              </ThemedText>

              {/* Placeholder for map - you can integrate with react-native-maps */}
              <View className="w-full h-48 bg-light-secondary dark:bg-dark-secondary rounded-xl items-center justify-center">
                <Icon
                  className="text-light-subtext dark:text-dark-subtext mb-2"
                  name="Map"
                  size={48}
                />
                <ThemedText className="text-light-subtext dark:text-dark-subtext">
                  Interactive map coming soon
                </ThemedText>
              </View>

              <Button
                className="mt-4"
                iconStart="ExternalLink"
                onPress={() => {
                  // Open in device maps app
                  console.log("Open in maps");
                }}
                title="Open in Maps"
                variant="outline"
              />
            </View>
          </Section>
        </AnimatedView>
      </ThemedScroller>

      <ThemedFooter>
        <View className="flex-row space-x-3">
          <Button
            className="flex-1"
            href="/screens/review"
            iconStart="Star"
            title="Review"
            variant="outline"
          />
          <Button
            className="flex-1"
            iconStart="X"
            onPress={() => console.log("Cancel trip")}
            title="Cancel trip"
            variant="outline"
          />
        </View>
      </ThemedFooter>
    </>
  );
};

export default TripDetailScreen;
