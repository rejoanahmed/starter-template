import Avatar from "@propia/components/Avatar";
import { Button } from "@propia/components/Button";
import { CardScroller } from "@propia/components/CardScroller";
import Favorite from "@propia/components/Favorite";
import Switch from "@propia/components/forms/Switch";
import Header, { HeaderIcon } from "@propia/components/Header";
import Icon, { type IconName } from "@propia/components/Icon";
import ImageCarousel from "@propia/components/ImageCarousel";
import Divider from "@propia/components/layout/Divider";
import Section from "@propia/components/layout/Section";
import ShowRating from "@propia/components/ShowRating";
import ThemedText from "@propia/components/ThemedText";
import ThemedScroller from "@propia/components/ThemeScroller";
import { useFocusEffect } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import React, { useRef, useState } from "react";
import { Image, Share, View } from "react-native";
import type { ActionSheetRef } from "react-native-actions-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const property = {
  id: 1,
  title: "Luxury Penthouse with Central Park View",
  description:
    "Stunning penthouse apartment with breathtaking views of Central Park. This luxurious 3-bedroom home features floor-to-ceiling windows, a gourmet kitchen, and a private terrace. Perfect for families or groups looking for an upscale NYC experience.",
  price: "$850",
  features: {
    guests: "6 guests",
    bedrooms: "3 bedrooms",
    bathrooms: "2.5 bathrooms",
    size: "2,200 sq ft",
  },
  ratings: {
    overall: 4.9,
    cleanliness: 4.8,
    location: 5.0,
    value: 4.7,
    reviews: 284,
  },
  host: {
    id: 101,
    name: "John Doe",
    avatar: require("@propia/assets/img/user-3.jpg"),
    location: "Upper East Side, Manhattan, New York",
    joinedDate: "January 2018",
  },
  images: [
    require("@propia/assets/img/room-2.avif"),
    require("@propia/assets/img/room-3.avif"),
    require("@propia/assets/img/room-5.avif"),
    require("@propia/assets/img/room-4.avif"),
  ],
};

const reviewsData = [
  {
    rating: 5,
    description:
      "Amazing views and perfect location. The apartment was spotless and Sarah was very responsive throughout our stay.",
    date: "June 2023",
    username: "John D.",
    avatar: "https://randomuser.me/api/portraits/men/44.jpg",
  },
  {
    rating: 5,
    description:
      "Luxurious apartment with everything you need. We especially loved the terrace and the Central Park views!",
    date: "May 2023",
    username: "Maria S.",
    avatar: "https://randomuser.me/api/portraits/women/45.jpg",
  },
  {
    rating: 4,
    description:
      "Great experience overall. The kitchen was well-equipped and the beds were very comfortable. Highly recommend!",
    date: "April 2023",
    username: "David L.",
    avatar: "https://randomuser.me/api/portraits/men/63.jpg",
  },
  {
    rating: 5,
    description:
      "Perfect location for exploring NYC. The apartment exceeded our expectations and Sarah was an excellent host.",
    date: "March 2023",
    username: "Jennifer K.",
    avatar: "https://randomuser.me/api/portraits/women/67.jpg",
  },
];

const _similarProperties = [
  {
    id: 2,
    title: "Modern Loft in SoHo",
    price: "$650/night",
    image:
      "https://images.pexels.com/photos/1571453/pexels-photo-1571453.jpeg?auto=compress&cs=tinysrgb&w=1200",
  },
  {
    id: 3,
    title: "Brooklyn Heights Apartment",
    price: "$450/night",
    image:
      "https://images.pexels.com/photos/1571457/pexels-photo-1571457.jpeg?auto=compress&cs=tinysrgb&w=1200",
  },
  {
    id: 4,
    title: "Midtown Studio",
    price: "$380/night",
    image:
      "https://images.pexels.com/photos/1571467/pexels-photo-1571467.jpeg?auto=compress&cs=tinysrgb&w=1200",
  },
  {
    id: 5,
    title: "Chelsea Townhouse",
    price: "$950/night",
    image:
      "https://images.pexels.com/photos/1571472/pexels-photo-1571472.jpeg?auto=compress&cs=tinysrgb&w=1200",
  },
];

const PropertyDetail = () => {
  const [instantBook, setInstantBook] = useState(false);
  const [isFocused, setIsFocused] = useState(true);
  const _actionSheetRef = useRef<ActionSheetRef>(null);
  const insets = useSafeAreaInsets();

  const totalPrice = property.price;

  // Manage status bar based on screen focus
  useFocusEffect(
    React.useCallback(() => {
      setIsFocused(true);
      return () => {
        setIsFocused(false);
      };
    }, [])
  );

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this amazing property: ${property.title}\nPrice: ${property.price} per night`,
        title: property.title,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };
  const rightComponents = [
    <Favorite
      isWhite
      key="favorite-icon"
      productName={property.title}
      size={25}
    />,
    <HeaderIcon
      href="/screens/share-property"
      icon="Share2"
      isWhite
      key="share-icon"
      onPress={handleShare}
    />,
  ];

  return (
    <>
      {isFocused && <StatusBar style="light" translucent />}
      <Header
        rightComponents={rightComponents}
        showBackButton
        title=""
        variant="transparent"
      />
      <ThemedScroller className="px-0 bg-light-primary dark:bg-dark-primary">
        <ImageCarousel
          height={500}
          images={property.images}
          paginationStyle="dots"
        />

        <View
          className="p-global bg-light-primary dark:bg-dark-primary -mt-[30px]"
          style={{ borderTopLeftRadius: 30, borderTopRightRadius: 30 }}
        >
          <View className="">
            <ThemedText className="text-3xl text-center font-semibold">
              {property.title}
            </ThemedText>
            <View className="flex-row items-center justify-center mt-4">
              <ShowRating
                className="px-4 py-2 border-r border-neutral-200 dark:border-dark-secondary"
                rating={property.ratings.overall}
                size="lg"
              />
              <ThemedText className="text-base px-4">234 Reviews</ThemedText>
            </View>
          </View>

          <View className="flex-row items-center mt-8 mb-8 py-global border-y border-neutral-200 dark:border-dark-secondary">
            <Avatar
              className="mr-4"
              link={"/screens/user-profile"}
              size="md"
              src={property.host.avatar}
            />
            <View className="ml-0">
              <ThemedText className="font-semibold text-base">
                Hosted by {property.host.name}
              </ThemedText>
              <View className="flex-row items-center">
                <Icon className="mr-1" name="MapPin" size={12} />
                <ThemedText className="text-xs text-light-subtext dark:text-dark-subtext">
                  {property.host.location}
                </ThemedText>
              </View>
            </View>
          </View>

          <ThemedText className="text-base">{property.description}</ThemedText>

          <Divider className="mb-4 mt-8" />

          {/* Property Features */}
          <Section
            className="mb-6 mt-2"
            title="Property Details"
            titleSize="lg"
          >
            <View className="mt-3">
              <FeatureItem
                icon="Users"
                label="Guests"
                value={property.features.guests}
              />
              <FeatureItem
                icon="BedDouble"
                label="Bedrooms"
                value={property.features.bedrooms}
              />
              <FeatureItem
                icon="Bath"
                label="Bathrooms"
                value={property.features.bathrooms}
              />
              <FeatureItem
                icon="PencilRuler"
                label="Size"
                value={property.features.size}
              />
            </View>
          </Section>

          <Divider className="my-4" />

          {/* Instant Book Option */}
          <View className="flex-row items-center justify-between">
            <Switch
              className="flex-1 py-3"
              description="Book immediately without waiting for host approval"
              icon="Zap"
              label="Instant Book Available"
              onChange={setInstantBook}
              value={instantBook}
            />
          </View>

          <Divider className="my-4" />

          {/* Ratings & Reviews */}
          <Section
            className="mb-6"
            subtitle={`${property.ratings.reviews} reviews`}
            title="Guest Reviews"
            titleSize="lg"
          >
            <View className="mt-4 bg-light-secondary dark:bg-dark-secondary p-4 rounded-lg">
              <View className="flex-row items-center mb-4">
                <ShowRating rating={property.ratings.overall} size="lg" />
                <ThemedText className="ml-2 text-light-subtext dark:text-dark-subtext">
                  ({property.ratings.reviews})
                </ThemedText>
              </View>

              <View className="space-y-2">
                <RatingItem
                  label="Cleanliness"
                  rating={property.ratings.cleanliness}
                />
                <RatingItem
                  label="Location"
                  rating={property.ratings.location}
                />
                <RatingItem
                  label="Value for Money"
                  rating={property.ratings.value}
                />
              </View>
            </View>

            <ThemedText className="mt-6 mb-3 font-semibold text-lg">
              Guest Reviews
            </ThemedText>
            <CardScroller className="mt-1" space={10}>
              {reviewsData.map((review, index) => (
                <View
                  className="w-[280px] bg-light-secondary dark:bg-dark-secondary p-4 rounded-lg"
                  key={index}
                >
                  <View className="flex-row items-center mb-2">
                    <Image
                      className="w-10 h-10 rounded-full mr-2"
                      source={{ uri: review.avatar }}
                    />
                    <View>
                      <ThemedText className="font-medium">
                        {review.username}
                      </ThemedText>
                      <ThemedText className="text-xs text-light-subtext dark:text-dark-subtext">
                        {review.date}
                      </ThemedText>
                    </View>
                  </View>
                  <ShowRating
                    className="mb-2"
                    rating={review.rating}
                    size="sm"
                  />
                  <ThemedText className="text-sm">
                    {review.description}
                  </ThemedText>
                </View>
              ))}
            </CardScroller>
          </Section>
        </View>
      </ThemedScroller>

      {/* Bottom Booking Bar */}

      <View
        className=" flex-row items-center justify-start px-global pt-4 border-t border-neutral-200 dark:border-dark-secondary"
        style={{ paddingBottom: insets.bottom }}
      >
        <View>
          <ThemedText className="text-xl font-bold">
            {totalPrice} night
          </ThemedText>
          <ThemedText className="text-xs opacity-60">5 - 12 June</ThemedText>
        </View>
        <View className="flex-row items-center ml-auto">
          <Button
            className="bg-highlight ml-6 px-6"
            href="/screens/order-detail?id=1"
            rounded="lg"
            size="medium"
            textClassName="text-white"
            title="Reserve"
          />
        </View>
      </View>
    </>
  );
};

// Feature Item Component
type FeatureItemProps = {
  icon: IconName;
  label: string;
  value: string;
};

const FeatureItem = ({ icon, label, value }: FeatureItemProps) => (
  <View className="flex-row items-center py-4">
    <Icon className="mr-3" name={icon} size={24} strokeWidth={1.5} />
    <ThemedText className="flex-1">{label}</ThemedText>
    <ThemedText className="font-medium">{value}</ThemedText>
  </View>
);

// Rating Item Component
type RatingItemProps = {
  label: string;
  rating: number;
};

const RatingItem = ({ label, rating }: RatingItemProps) => (
  <View className="flex-row items-center justify-between py-2">
    <ThemedText className="text-sm">{label}</ThemedText>
    <View className="flex-row items-center">
      <ShowRating rating={rating} size="sm" />
    </View>
  </View>
);

export default PropertyDetail;
