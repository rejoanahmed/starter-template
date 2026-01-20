// app/rooms/[id].tsx

import Colors from "@app/constants/Colors";
import { useRoom } from "@app/services/client/rooms";
import {
  useAddToWishlist,
  useRemoveFromWishlist,
  useWishlistStatus,
} from "@app/services/client/wishlists";
import { Ionicons } from "@expo/vector-icons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import type React from "react";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  View,
} from "react-native";
import MapView, {
  type MapType,
  Marker,
  PROVIDER_GOOGLE,
} from "react-native-maps";
import PagerView from "react-native-pager-view";
import { SafeAreaView } from "react-native-safe-area-context";

/* ---------------------------------- Helpers --------------------------------- */

const cleanUri = (u?: string) =>
  ({ uri: encodeURI((u ?? "").trim()) }) as const;

/* ----------------------------- Small UI helpers ----------------------------- */

const Chip = ({
  icon,
  label,
  bg,
  text,
}: {
  icon?: keyof typeof Ionicons.glyphMap;
  label: string;
  bg: string;
  text: string;
}) => (
  <View
    className="mr-2 mb-2 flex-row items-center rounded-full px-3 py-2"
    style={{ backgroundColor: bg }}
  >
    {icon ? (
      <Ionicons color={text} name={icon} size={14} style={{ marginRight: 6 }} />
    ) : null}
    <Text className="text-xs" style={{ color: text }}>
      {label}
    </Text>
  </View>
);

function SectionHeader({ title, color }: { title: string; color: string }) {
  return (
    <Text className="mb-2 font-semibold text-base" style={{ color }}>
      {title}
    </Text>
  );
}

/* ---------------------------------- Screen ---------------------------------- */

export default function RoomDetail() {
  const { colorScheme } = useColorScheme();
  const dark = colorScheme === "dark";
  const p = Colors[dark ? "dark" : "light"];
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  // Fetch room data
  const { data: room, isLoading, error } = useRoom(id || "", !!id);

  // Wishlist hooks - always call hooks unconditionally
  const { data: inWishlist } = useWishlistStatus(id || "", !!id);
  const addToWishlist = useAddToWishlist();
  const removeFromWishlist = useRemoveFromWishlist();

  const [descExpanded, setDescExpanded] = useState(false);
  const [showAllFacilities, setShowAllFacilities] = useState(false);

  const { width } = Dimensions.get("window");
  const carouselH = 300;
  const [page, setPage] = useState(0);

  // Process facilities from room data with icons
  const facilitiesArray = useMemo(() => {
    if (!room?.facilities || typeof room.facilities !== "object") return [];
    const facilities: Array<{ name: string; icon?: string }> = [];
    Object.entries(room.facilities).forEach(([, items]) => {
      if (Array.isArray(items)) {
        items.forEach((item) => {
          if (typeof item === "object" && item.name) {
            facilities.push({
              name: item.name,
              icon: item.icon || undefined,
            });
          } else if (typeof item === "string") {
            facilities.push({ name: item });
          }
        });
      }
    });
    return facilities;
  }, [room?.facilities]);

  const visibleFacilities = useMemo(
    () => (showAllFacilities ? facilitiesArray : facilitiesArray.slice(0, 12)),
    [showAllFacilities, facilitiesArray]
  );

  // Calculate starting price from hourly tiers
  const startingPrice = useMemo(() => {
    if (
      room?.hourlyTiers &&
      Array.isArray(room.hourlyTiers) &&
      room.hourlyTiers.length > 0
    ) {
      const tiers = room.hourlyTiers as Array<{ hours: number; price: number }>;
      return Math.min(...tiers.map((t) => t.price));
    }
    return null;
  }, [room?.hourlyTiers]);

  // Get included guests
  const includedGuests = room?.includedGuests || 1;

  // Handle wishlist toggle
  const handleWishlistToggle = async () => {
    if (!room) return;

    try {
      if (inWishlist) {
        await removeFromWishlist.mutateAsync(room.id);
        Alert.alert("Removed", "Room removed from wishlist");
      } else {
        await addToWishlist.mutateAsync(room.id);
        Alert.alert("Added", "Room added to wishlist");
      }
    } catch (err) {
      Alert.alert(
        "Error",
        err instanceof Error ? err.message : "Failed to update wishlist"
      );
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: p.background }}
      >
        <ActivityIndicator color={p.tint} size="large" />
      </SafeAreaView>
    );
  }

  // Error state
  if (error || !room) {
    return (
      <SafeAreaView
        className="flex-1 items-center justify-center px-4"
        style={{ backgroundColor: p.background }}
      >
        <Text
          className="mb-2 text-center font-semibold text-lg"
          style={{ color: p.text }}
        >
          Failed to load room
        </Text>
        <Text className="mb-4 text-center" style={{ color: p.muted }}>
          {error instanceof Error ? error.message : "Unknown error occurred"}
        </Text>
        <Pressable
          className="rounded-xl bg-blue-500 px-6 py-3"
          onPress={() => router.back()}
        >
          <Text className="font-medium text-white">Go Back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  // Process photos
  const gallery = (room.photos || [])
    .map((photo, idx) => {
      const uri = typeof photo === "string" ? photo : photo?.url;
      const key =
        typeof photo === "string"
          ? `photo-${idx}`
          : photo?.id || `photo-${idx}`;
      return uri ? { uri, key } : null;
    })
    .filter((item): item is { uri: string; key: string } => item !== null);

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: p.tint }}>
      <StatusBar barStyle={dark ? "light-content" : "dark-content"} />
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ backgroundColor: p.background }}>
          {/* Header */}
          <View
            className="flex-row items-center px-4 py-3"
            style={{ backgroundColor: p.tint }}
          >
            <Pressable
              className="mr-2"
              hitSlop={8}
              onPress={() => router.back()}
            >
              <Ionicons color="#fff" name="chevron-back" size={24} />
            </Pressable>
            <Text className="font-semibold text-lg" style={{ color: "#fff" }}>
              {room.title}
            </Text>
          </View>

          {/* Gallery */}
          {gallery.length > 0 && (
            <View style={{ width, height: carouselH }}>
              <PagerView
                initialPage={0}
                onPageSelected={(e) => setPage(e.nativeEvent.position)}
                style={{ flex: 1 }}
              >
                {gallery.map((item) => (
                  <View key={item.key}>
                    <Image
                      source={cleanUri(item.uri)}
                      style={{ width, height: carouselH, resizeMode: "cover" }}
                    />
                  </View>
                ))}
              </PagerView>

              {/* Dots */}
              {gallery.length > 1 && (
                <View
                  style={{
                    position: "absolute",
                    bottom: 12,
                    left: 0,
                    right: 0,
                    flexDirection: "row",
                    justifyContent: "center",
                  }}
                >
                  {gallery.map((item, i) => (
                    <View
                      key={`dot-${item.key}`}
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        marginHorizontal: 4,
                        backgroundColor:
                          i === page ? "#fff" : "rgba(255,255,255,0.5)",
                      }}
                    />
                  ))}
                </View>
              )}
            </View>
          )}

          {/* Title & Meta */}
          <View className="mt-3 px-4">
            <Text
              className="mb-2 font-semibold text-xl"
              style={{ color: p.text }}
            >
              {room.title}
            </Text>

            <View className="mb-1 flex-row items-center">
              <Ionicons
                color={p.muted ?? "#5F6A6E"}
                name="location-outline"
                size={16}
              />
              <Text className="ml-1" style={{ color: p.muted }}>
                {room.address}
                {room.district && ` • ${room.district}`}
              </Text>
            </View>

            <View className="mt-1 flex-row items-center">
              <Chip
                bg={p.surface}
                icon="people-outline"
                label={`${includedGuests} ${includedGuests === 1 ? "person" : "people"} included`}
                text={p.mutedStrong ?? p.text}
              />
              {room.averageRating !== undefined && (
                <View className="flex-row items-center">
                  <Ionicons
                    color={p.warning ?? "#F59E0B"}
                    name="star"
                    size={16}
                  />
                  <Text className="ml-1 font-medium" style={{ color: p.text }}>
                    {room.averageRating.toFixed(1)}
                  </Text>
                  {room.reviewCount > 0 && (
                    <Text className="ml-2" style={{ color: p.muted }}>
                      | {room.reviewCount} review
                      {room.reviewCount !== 1 ? "s" : ""}
                    </Text>
                  )}
                </View>
              )}
            </View>
          </View>

          {/* Location */}
          {room.latitude && room.longitude && (
            <View className="mt-5 px-4">
              <SectionHeader color={p.text} title="Location" />
              <View
                className="overflow-hidden rounded-2xl"
                style={{
                  backgroundColor: p.surface,
                  borderColor: p.border,
                  borderWidth: 1,
                }}
              >
                <MapView
                  initialRegion={{
                    latitude: Number.parseFloat(String(room.latitude)),
                    longitude: Number.parseFloat(String(room.longitude)),
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }}
                  mapType={"standard" as MapType}
                  provider={PROVIDER_GOOGLE}
                  style={{ width: "100%", height: 220 }}
                >
                  <Marker
                    coordinate={{
                      latitude: Number.parseFloat(String(room.latitude)),
                      longitude: Number.parseFloat(String(room.longitude)),
                    }}
                    description={room.address}
                    title={room.title}
                  />
                </MapView>
                <View
                  className="border-t p-3"
                  style={{ borderColor: p.border }}
                >
                  <Text style={{ color: p.text }}>
                    {room.address}
                    {room.district && ` • ${room.district}`}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Description */}
          {room.description && (
            <View className="mt-5 px-4">
              <SectionHeader color={p.text} title="Description" />
              <View
                className="rounded-2xl p-3"
                style={{
                  backgroundColor: p.surface,
                  borderColor: p.border,
                  borderWidth: 1,
                }}
              >
                <Text
                  numberOfLines={descExpanded ? undefined : 4}
                  style={{ color: p.text, lineHeight: 22 }}
                >
                  {room.description}
                </Text>
                {room.description.length > 150 && (
                  <Pressable
                    className="mt-2"
                    onPress={() => setDescExpanded((v) => !v)}
                  >
                    <Text className="font-medium" style={{ color: p.tint }}>
                      {descExpanded ? "Show less" : "Show more >"}
                    </Text>
                  </Pressable>
                )}
              </View>
            </View>
          )}

          {/* Pricing Information */}
          {(startingPrice !== null ||
            room.hourlyTiers ||
            room.extraPersonChargePerHour) && (
            <View className="mt-5 px-4">
              <SectionHeader color={p.text} title="Pricing" />
              <View
                className="rounded-2xl p-4"
                style={{
                  backgroundColor: p.surface,
                  borderColor: p.border,
                  borderWidth: 1,
                }}
              >
                {/* Starting Price */}
                {startingPrice !== null && (
                  <View className="mb-3">
                    <Text className="text-sm mb-1" style={{ color: p.muted }}>
                      Starting price
                    </Text>
                    <Text
                      className="font-bold text-2xl"
                      style={{ color: p.tint }}
                    >
                      ${startingPrice}
                    </Text>
                  </View>
                )}

                {/* Included Guests */}
                <View className="mb-3 flex-row items-center">
                  <Ionicons
                    color={p.muted ?? p.icon}
                    name="people-outline"
                    size={18}
                  />
                  <Text className="ml-2 text-sm" style={{ color: p.text }}>
                    {includedGuests}{" "}
                    {includedGuests === 1 ? "person" : "people"} included in
                    base price
                  </Text>
                </View>

                {/* Hourly Tiers */}
                {room.hourlyTiers &&
                  Array.isArray(room.hourlyTiers) &&
                  room.hourlyTiers.length > 0 && (
                    <View className="mb-3">
                      <Text className="text-sm mb-2" style={{ color: p.muted }}>
                        Hourly rates
                      </Text>
                      {(
                        room.hourlyTiers as Array<{
                          hours: number;
                          price: number;
                        }>
                      )
                        .sort((a, b) => a.hours - b.hours)
                        .map((tier) => (
                          <View
                            className="mb-2 flex-row items-center justify-between"
                            key={`${tier.hours}-${tier.price}`}
                          >
                            <Text style={{ color: p.text }}>
                              {tier.hours} {tier.hours === 1 ? "hour" : "hours"}
                            </Text>
                            <Text
                              className="font-semibold"
                              style={{ color: p.tint }}
                            >
                              ${tier.price}
                            </Text>
                          </View>
                        ))}
                    </View>
                  )}

                {/* Extra Person Charge */}
                {room.extraPersonChargePerHour &&
                  Number.parseFloat(room.extraPersonChargePerHour) > 0 && (
                    <View className="flex-row items-center">
                      <Ionicons
                        color={p.muted ?? p.icon}
                        name="person-add-outline"
                        size={18}
                      />
                      <Text className="ml-2 text-sm" style={{ color: p.text }}>
                        Extra person: ${room.extraPersonChargePerHour} per
                        person per hour
                      </Text>
                    </View>
                  )}
              </View>
            </View>
          )}

          {/* Facilities */}
          {facilitiesArray.length > 0 && (
            <View className="mt-5 px-4">
              <SectionHeader color={p.text} title="Facilities" />
              <View
                className="rounded-2xl p-4"
                style={{
                  backgroundColor: p.surface,
                  borderColor: p.border,
                  borderWidth: 1,
                }}
              >
                <View className="flex-row flex-wrap gap-3">
                  {visibleFacilities.map((facility) => (
                    <View
                      className="w-[31%] items-center rounded-xl border p-3"
                      key={facility.name}
                      style={{
                        borderColor: p.border,
                        backgroundColor: p.surface2 ?? p.surface,
                      }}
                    >
                      {facility.icon && (
                        <MaterialCommunityIcons
                          color={p.tint}
                          name={
                            facility.icon as React.ComponentProps<
                              typeof MaterialCommunityIcons
                            >["name"]
                          }
                          size={22}
                        />
                      )}
                      <Text
                        className="mt-2 text-center text-sm"
                        style={{ color: p.text }}
                      >
                        {facility.name}
                      </Text>
                    </View>
                  ))}
                </View>
                {facilitiesArray.length > 12 && (
                  <Pressable
                    className="mt-4"
                    onPress={() => setShowAllFacilities((v) => !v)}
                  >
                    <Text
                      className="text-center font-medium"
                      style={{ color: p.tint }}
                    >
                      {showAllFacilities
                        ? "Show fewer facilities"
                        : `Show all ${facilitiesArray.length} facilities`}
                    </Text>
                  </Pressable>
                )}
              </View>
            </View>
          )}

          {/* Reviews */}
          {(room.reviewCount > 0 || room.averageRating !== undefined) && (
            <View className="mt-5 px-4">
              <SectionHeader color={p.text} title="Reviews" />
              <View
                className="items-center justify-center rounded-2xl"
                style={{
                  borderWidth: 1,
                  borderColor: p.border,
                  backgroundColor: p.surface,
                  height: 44,
                }}
              >
                <Pressable
                  accessibilityLabel="Show all reviews"
                  accessibilityRole="button"
                  onPress={() =>
                    router.push({
                      pathname: "/review/[id]",
                      params: { id: room.id },
                    })
                  }
                >
                  <Text className="font-medium" style={{ color: p.tint }}>
                    {room.reviewCount > 0
                      ? `Show all ${room.reviewCount} review${room.reviewCount !== 1 ? "s" : ""}`
                      : "View reviews"}
                  </Text>
                </Pressable>
              </View>
            </View>
          )}

          {/* Merchant card */}
          {room.merchant && (
            <View className="mt-5 px-4">
              <View
                className="w-full rounded-2xl p-3"
                style={{
                  backgroundColor: p.surface,
                  borderColor: p.border,
                  borderWidth: 1,
                }}
              >
                <View className="flex-row items-center">
                  <View
                    className="items-center justify-center"
                    style={{ width: 72, height: 72 }}
                  >
                    <View
                      style={{
                        width: 72,
                        height: 72,
                        borderRadius: 36,
                        backgroundColor: p.tint,
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: 6,
                      }}
                    >
                      <Text
                        className="font-semibold text-xl"
                        style={{ color: "#fff" }}
                      >
                        {room.merchant.name?.[0]?.toUpperCase() || "?"}
                      </Text>
                    </View>
                  </View>
                  <View className="flex-1 pl-3">
                    <Text
                      className="font-semibold text-base"
                      style={{ color: p.text }}
                    >
                      {room.merchant.name || "Host"}
                    </Text>
                    <Text className="mt-1 text-sm" style={{ color: p.muted }}>
                      Room host
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Action buttons */}
          <View className="mt-5 px-4 pb-6">
            <View className="flex-row">
              {room.merchant && (
                <Pressable
                  className="mr-3 h-11 flex-1 items-center justify-center rounded-xl"
                  onPress={() =>
                    router.push({
                      pathname: "/messages/[id]",
                      params: { id: room.merchant?.id || "" },
                    })
                  }
                  style={{
                    backgroundColor: p.primaryButton ?? p.tint,
                    borderColor: p.border,
                    borderWidth: 1,
                  }}
                >
                  <Text className="font-medium" style={{ color: "#fff" }}>
                    Message Host
                  </Text>
                </Pressable>
              )}

              {/* Wishlist Toggle */}
              <Pressable
                accessibilityRole="button"
                className="h-11 flex-1 items-center justify-center rounded-xl px-5"
                disabled={
                  addToWishlist.isPending || removeFromWishlist.isPending
                }
                onPress={handleWishlistToggle}
                style={{
                  backgroundColor: p.surface,
                  borderColor: p.border,
                  borderWidth: 1,
                  opacity:
                    addToWishlist.isPending || removeFromWishlist.isPending
                      ? 0.6
                      : 1,
                }}
              >
                <View className="flex-row items-center">
                  <Ionicons
                    color={p.text}
                    name={inWishlist ? "heart" : "heart-outline"}
                    size={18}
                    style={{ marginRight: 6 }}
                  />
                  <Text className="font-medium" style={{ color: p.text }}>
                    {inWishlist ? "In Wishlist" : "Save to Wishlist"}
                  </Text>
                </View>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Sticky booking bar */}
      <View
        className="absolute right-0 bottom-0 left-0 px-4 py-6"
        style={{
          backgroundColor: p.surface2 ?? p.background,
          borderTopColor: p.border,
          borderTopWidth: 1,
          shadowColor: "#000",
          shadowOpacity: dark ? 0.24 : 0.08,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: -2 },
          elevation: 12,
        }}
      >
        <View className="flex-row items-center justify-between">
          <View className="mr-3 flex-1">
            {startingPrice !== null ? (
              <>
                <Text className="font-bold text-lg" style={{ color: p.text }}>
                  Start at ${startingPrice}
                </Text>
                <Text className="mt-1 text-xs" style={{ color: p.muted }}>
                  {includedGuests} {includedGuests === 1 ? "person" : "people"}{" "}
                  included
                </Text>
              </>
            ) : (
              <>
                <Text className="font-bold text-lg" style={{ color: p.text }}>
                  Select dates for pricing
                </Text>
                <Text className="mt-1 text-xs" style={{ color: p.muted }}>
                  View hourly rates
                </Text>
              </>
            )}
          </View>

          <Pressable
            accessibilityRole="button"
            className="h-11 items-center justify-center rounded-xl px-6"
            onPress={() =>
              router.push({
                pathname: "/reserve/[id]",
                params: {
                  id: room.id,
                },
              })
            }
            style={{ backgroundColor: p.tint }}
          >
            <Text className="font-semibold" style={{ color: "#fff" }}>
              Reserve
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
