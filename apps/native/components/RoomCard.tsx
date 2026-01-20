import { IconSymbol } from "@app/components/ui/IconSymbol";
import type { Room } from "@app/services/client/rooms";
import {
  useAddToWishlist,
  useRemoveFromWishlist,
  useWishlistStatus,
} from "@app/services/client/wishlists";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import { useMemo } from "react";
import { Image, Pressable, TouchableOpacity, View } from "react-native";
import { Colors } from "../constants/Colors";
import { ThemedText } from "./ThemedText";

type RoomCardProps = {
  room: Room;
  price?: number | null;
  priceLoading?: boolean;
};

export default function RoomCard({
  room,
  price,
  priceLoading = false,
}: RoomCardProps) {
  const { colorScheme = "light" } = useColorScheme();
  const palette = Colors[colorScheme === "dark" ? "dark" : "light"];
  const router = useRouter();

  // Wishlist hooks
  const { data: inWishlist } = useWishlistStatus(room.id);
  const addToWishlist = useAddToWishlist();
  const removeFromWishlist = useRemoveFromWishlist();

  const navigateToRoomDetails = () => router.push(`/room/${room.id}`);

  // Calculate starting price from hourly tiers
  const startingPrice = useMemo(() => {
    if (
      room.hourlyTiers &&
      Array.isArray(room.hourlyTiers) &&
      room.hourlyTiers.length > 0
    ) {
      // Find the lowest price tier
      const tiers = room.hourlyTiers as Array<{ hours: number; price: number }>;
      return Math.min(...tiers.map((t) => t.price));
    }
    return null;
  }, [room.hourlyTiers]);

  // Get included guests
  const includedGuests = room.includedGuests || 1;

  // Handle wishlist toggle
  const handleWishlistToggle = async (e: { stopPropagation: () => void }) => {
    e.stopPropagation(); // Prevent navigation when clicking heart
    try {
      if (inWishlist) {
        await removeFromWishlist.mutateAsync(room.id);
      } else {
        await addToWishlist.mutateAsync(room.id);
      }
    } catch (err) {
      console.error("Failed to update wishlist:", err);
    }
  };

  const renderRatingStars = (rating = 0) => {
    const rounded = Math.round(rating * 2) / 2;
    return (
      <View className="flex-row items-center">
        {[1, 2, 3, 4, 5].map((star) => {
          const name =
            star <= rounded
              ? "star.fill"
              : star - 0.5 === rounded
                ? "star.leadinghalf.filled"
                : "star";
          return (
            <IconSymbol
              color={palette.tint}
              key={`star-${star}`}
              name={name}
              size={14}
            />
          );
        })}
        {rating > 0 && (
          <ThemedText className="ml-1" style={{ color: palette.text }}>
            {rating.toFixed(1)}
          </ThemedText>
        )}
      </View>
    );
  };

  const getImageUrl = () => {
    if (room.photos && room.photos.length > 0) {
      const coverPhoto = room.photos.find((p) => p.isCover) || room.photos[0];
      return coverPhoto.url;
    }
    return "https://via.placeholder.com/300x200?text=No+Image";
  };

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      className="mb-4 overflow-hidden rounded-2xl border shadow-md"
      onPress={navigateToRoomDetails}
      style={{ backgroundColor: palette.surface, borderColor: palette.border }}
    >
      {/* Cover with Wishlist Heart */}
      <View style={{ position: "relative" }}>
        <Image
          className="h-40 w-full"
          resizeMode="cover"
          source={{ uri: getImageUrl() }}
        />
        <Pressable
          disabled={addToWishlist.isPending || removeFromWishlist.isPending}
          onPress={handleWishlistToggle}
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons
            color={inWishlist ? "#FF3B30" : "#fff"}
            name={inWishlist ? "heart" : "heart-outline"}
            size={20}
          />
        </Pressable>
      </View>

      {/* Body */}
      <View className="p-4">
        {/* Title and Price Row */}
        <View className="mb-2 flex-row items-start justify-between">
          <View className="flex-1 mr-2">
            <ThemedText
              className="font-semibold text-xl mb-1"
              numberOfLines={2}
              style={{ color: palette.text }}
            >
              {room.title}
            </ThemedText>
            <ThemedText
              className="text-sm"
              numberOfLines={1}
              style={{ color: palette.muted ?? palette.icon }}
            >
              {room.district}
            </ThemedText>
          </View>

          {/* Price — show starting price or calculated price */}
          {priceLoading ? (
            <View className="items-end">
              <ThemedText
                className="text-sm"
                style={{ color: palette.muted ?? palette.icon }}
              >
                Loading...
              </ThemedText>
            </View>
          ) : price !== undefined && price !== null ? (
            <View className="items-end">
              <ThemedText
                className="font-bold text-lg"
                style={{ color: palette.tint }}
              >
                ${price.toFixed(0)}
              </ThemedText>
              <ThemedText
                className="text-xs mt-0.5"
                style={{ color: palette.muted ?? palette.icon }}
              >
                total
              </ThemedText>
            </View>
          ) : startingPrice !== null ? (
            <View className="items-end">
              <ThemedText
                className="font-bold text-lg"
                style={{ color: palette.tint }}
              >
                ${startingPrice}
              </ThemedText>
              <ThemedText
                className="text-xs mt-0.5"
                style={{ color: palette.muted ?? palette.icon }}
              >
                starting price
              </ThemedText>
            </View>
          ) : (
            <View className="items-end">
              <ThemedText
                className="text-xs"
                style={{ color: palette.muted ?? palette.icon }}
              >
                Select dates
              </ThemedText>
            </View>
          )}
        </View>

        {/* Rating, Capacity, and Host Info */}
        <View className="flex-row items-center justify-between mt-3">
          {/* Left: Rating */}
          <View className="flex-1">
            {renderRatingStars(room.averageRating)}
          </View>

          {/* Center: Capacity */}
          <View className="flex-row items-center mx-3">
            <Ionicons
              color={palette.muted ?? palette.icon}
              name="people-outline"
              size={16}
            />
            <ThemedText
              className="ml-1.5 text-sm"
              style={{ color: palette.muted ?? palette.icon }}
            >
              {includedGuests} {includedGuests === 1 ? "person" : "people"}
            </ThemedText>
          </View>

          {/* Right: Host */}
          {room.merchant && (
            <View className="flex-row items-center flex-shrink">
              <ThemedText
                className="text-xs mr-1.5"
                style={{ color: palette.muted ?? palette.icon }}
              >
                by
              </ThemedText>
              <ThemedText
                className="text-sm font-medium"
                numberOfLines={1}
                style={{ color: palette.tint }}
              >
                {room.merchant.name}
              </ThemedText>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}
