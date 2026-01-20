import RoomCard from "@app/components/RoomCard"; // Import the RoomCard component
import { ThemedText } from "@app/components/ThemedText";
import { Stack, useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// --- Dummy room data for each list ---
const DUMMY_WISHLISTS: Record<
  string,
  {
    id: string;
    name: string;
    district: string;
    image: string;
    price: number;
    rating: number;
  }[]
> = {
  "recently-visited": [
    {
      id: "room1",
      name: "Cozy Studio near City Center",
      image:
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop",
      district: "Downtown",
      price: 120,
      rating: 4.6,
    },
    {
      id: "room2",
      name: "Modern Loft with Skyline View",
      image:
        "https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=1200&auto=format&fit=crop",
      district: "Midtown",
      price: 180,
      rating: 4.9,
    },
  ],
  "favorite-list-1": [
    {
      id: "room3",
      name: "Beachfront Apartment",
      image:
        "https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=1200&auto=format&fit=crop",
      district: "Oceanview",
      price: 250,
      rating: 5.0,
    },
    {
      id: "room4",
      name: "Rustic Mountain Cabin",
      image:
        "https://images.unsplash.com/photo-1568605114967-8130f3a36994?q=80&w=1200&auto=format&fit=crop",
      district: "Highlands",
      price: 160,
      rating: 4.8,
    },
    {
      id: "room5",
      name: "Minimalist Design Suite",
      image:
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop",
      district: "Uptown",
      price: 200,
      rating: 4.7,
    },
  ],
  "favorite-list-2": [
    {
      id: "room6",
      name: "Luxury Penthouse",
      image:
        "https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=1200&auto=format&fit=crop",
      district: "City Heights",
      price: 480,
      rating: 5.0,
    },
    {
      id: "room7",
      name: "Countryside Cottage",
      image:
        "https://images.unsplash.com/photo-1554995207-c18c203602cb?q=80&w=1200&auto=format&fit=crop",
      district: "Countryside",
      price: 130,
      rating: 4.5,
    },
  ],
};

export default function WishlistDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const rooms = useMemo(
    () => DUMMY_WISHLISTS[id || "recently-visited"] || [],
    [id]
  );

  const pretty = (s?: string) =>
    (s ?? "").replace(/-/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-black">
      <Stack.Screen options={{ title: pretty(id) }} />
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16, // only left/right padding
          paddingTop: 0, // explicitly no top padding
          paddingBottom: Math.max(16, 20), // keep bottom padding for scroll
        }}
      >
        {rooms.length > 0 ? (
          rooms.map((room) => (
            <RoomCard
              key={room.id}
              room={{
                id: room.id,
                title: room.name,
                district: room.district,
                address: "",
                maxGuests: 2,
                photos: [
                  {
                    id: "1",
                    url: room.image,
                    width: 1200,
                    height: 800,
                    isCover: true,
                  },
                ],
                status: "active" as const,
                merchant: null,
                averageRating: room.rating,
                reviewCount: 0,
                merchantId: "",
                description: "",
                latitude: null,
                longitude: null,
                minGuests: 1,
                createdAt: "",
                updatedAt: "",
                extraGuestFeeEnabled: false,
                pricingUnit: "per_hour" as const,
                minBookingMinutes: 60,
                bufferMinutes: 0,
                facilities: {},
                policies: [],
              }}
            />
          ))
        ) : (
          <View className="flex-1 items-center justify-center py-20">
            <ThemedText type="subtitle">No rooms in this list</ThemedText>
            <ThemedText className="text-gray-500 dark:text-gray-400">
              Add favorites to see them here.
            </ThemedText>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
