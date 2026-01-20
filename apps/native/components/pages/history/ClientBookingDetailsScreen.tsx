// components/ClientBookingDetails.tsx

import { Button } from "@app/components/ui/button";
import { Heading } from "@app/components/ui/heading";
import { HStack } from "@app/components/ui/hstack";
import { Text } from "@app/components/ui/text";
import { VStack } from "@app/components/ui/vstack";
import { Colors } from "@app/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import {
  Image,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, {
  type MapType,
  Marker,
  PROVIDER_GOOGLE,
} from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";

/* ---------- Types ---------- */
export type ClientBookingDetailsData = {
  statusText: string;
  room: {
    name: string;
    address: string;
    imageUrl: string;
    latitude?: number;
    longitude?: number;
  };
  checkIn: { date: string; time: string };
  checkOut: { date: string; time: string };
  numberOfGuestsText: string;
  confirmationCode: string;
  cancellationPolicy: { summary: string };
  depositPolicy: string;
  payment: {
    roomPrice: string;
    deposit: string;
    totalCost: string;
  };
};

export type ClientBookingDetailsProps = {
  data: ClientBookingDetailsData;
  isFinished?: boolean;
  onMessageHost?: () => void;
  onEdit?: () => void;
  onCancel?: () => void;
  onLeaveReview?: () => void;
};

/* ---------- Helpers ---------- */
const openMaps = (address: string, lat?: number, lng?: number) => {
  if (typeof lat === "number" && typeof lng === "number") {
    const scheme = Platform.select({
      ios: "maps:0,0?q=",
      android: "geo:0,0?q=",
    });
    const latLng = `${lat},${lng}`;
    const label = encodeURIComponent(address);
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`,
    });
    if (url) {
      Linking.openURL(url).catch(() => {});
      return;
    }
  }
  Linking.openURL(
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
  ).catch(() => {});
};

const withAlpha = (hex: string, alpha: number) => {
  const h = hex?.trim().toLowerCase() ?? "#000000";
  const norm = /^#([0-9a-f]{6})$/.test(h)
    ? h
    : /^#([0-9a-f]{3})$/.test(h)
      ? `#${h[1]}${h[1]}${h[2]}${h[2]}${h[3]}${h[3]}`
      : "#000000";
  const a = Math.round(Math.min(1, Math.max(0, alpha)) * 255);
  const aa = a.toString(16).padStart(2, "0");
  return `${norm}${aa}`;
};

export default function ClientBookingDetails({
  data,
  isFinished = false,
  onMessageHost,
  onEdit,
  onCancel,
  onLeaveReview,
}: ClientBookingDetailsProps) {
  const { colorScheme } = useColorScheme();
  const palette = Colors[colorScheme ?? "light"];

  // Theme tokens
  const bg = palette.background;
  const text = palette.text;
  const icon = palette.icon;
  const accent = palette.tint;
  const border = (palette as any).border ?? withAlpha(icon, 0.25);
  const surface = (palette as any).surface ?? bg;
  const primary = (palette as any).primaryButton ?? "#3F6D85"; // Reserve blue

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }}>
      {/* Header with Back Button */}
      <View
        className="flex-row items-center border-b px-4 py-3"
        style={{ borderBottomColor: border }}
      >
        <Pressable className="mr-3" hitSlop={8} onPress={() => router.back()}>
          <Ionicons color={text} name="chevron-back" size={24} />
        </Pressable>
        <View className="flex-1">
          {!!data.statusText && (
            <Text className="text-xs" style={{ color: accent }}>
              {isFinished
                ? "Booking finished"
                : "Your booking is starting soon"}
            </Text>
          )}
          <Heading size="lg" style={{ color: text }}>
            {data.room.name}
          </Heading>
        </View>
      </View>

      {/* Room Address */}
      <View className="px-4 pt-2 pb-2">
        <Text className="text-typography-600" style={{ color: icon }}>
          {data.room.address}
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 140 }}
      >
        {/* Cover Image */}
        <Image
          className="h-64 w-full"
          resizeMode="cover"
          source={{ uri: data.room.imageUrl }}
        />

        <VStack className="px-4 py-4" space="lg">
          {/* Check-in / Check-out */}
          <HStack className="justify-between">
            <VStack space="xs">
              <Text bold className="text-lg" style={{ color: text }}>
                Check-in
              </Text>
              <Text style={{ color: icon }}>
                {data.checkIn.date} {data.checkIn.time}
              </Text>
            </VStack>
            <VStack className="items-end" space="xs">
              <Text bold className="text-lg" style={{ color: text }}>
                Check-out
              </Text>
              <Text style={{ color: icon }}>
                {data.checkOut.date} {data.checkOut.time}
              </Text>
            </VStack>
          </HStack>

          {/* Guests */}
          <VStack space="xs">
            <Text bold className="text-lg" style={{ color: text }}>
              Number of guest
            </Text>
            <Text style={{ color: icon }}>{data.numberOfGuestsText}</Text>
          </VStack>

          <View
            style={{ height: 1, backgroundColor: border, marginVertical: 8 }}
          />

          {/* Message Host */}
          {typeof onMessageHost === "function" && (
            <Button
              className="rounded-full"
              onPress={onMessageHost}
              size="xl"
              style={{ backgroundColor: primary }}
            >
              <Text className="font-semibold text-lg text-white">
                Message Host
              </Text>
            </Button>
          )}

          <View
            style={{ height: 1, backgroundColor: border, marginVertical: 8 }}
          />

          {/* Confirmation Code */}
          <VStack space="xs">
            <Text bold className="text-lg" style={{ color: text }}>
              Confirmation code
            </Text>
            <Text style={{ color: icon }}>{data.confirmationCode}</Text>
          </VStack>

          <View
            style={{ height: 1, backgroundColor: border, marginVertical: 8 }}
          />

          {/* Cancellation */}
          <VStack space="sm">
            <Text bold className="text-lg" style={{ color: text }}>
              Cancellation policy
            </Text>
            <Text style={{ color: icon }}>
              {data.cancellationPolicy.summary}
            </Text>
            <Pressable onPress={() => router.push("/clientbooking/policy")}>
              <Text style={{ color: accent, fontWeight: "500" }}>
                Learn more
              </Text>
            </Pressable>
          </VStack>

          <View
            style={{ height: 1, backgroundColor: border, marginVertical: 8 }}
          />

          {/* Deposit */}
          <VStack space="xs">
            <Text bold className="text-lg" style={{ color: text }}>
              Deposit Policy
            </Text>
            <Text style={{ color: icon }}>{data.depositPolicy}</Text>
            <Pressable onPress={() => router.push("/clientbooking/policy")}>
              <Text style={{ color: accent, fontWeight: "500" }}>
                Learn more
              </Text>
            </Pressable>
          </VStack>

          <View
            style={{ height: 1, backgroundColor: border, marginVertical: 8 }}
          />

          {/* Location */}
          {data.room.latitude && data.room.longitude && (
            <VStack space="sm">
              <Text bold className="text-lg" style={{ color: text }}>
                Location
              </Text>

              {/* Map */}
              <View
                className="overflow-hidden rounded-lg"
                style={{
                  borderColor: border,
                  borderWidth: 1,
                }}
              >
                <MapView
                  initialRegion={{
                    latitude: data.room.latitude,
                    longitude: data.room.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }}
                  mapType={"standard" as MapType}
                  provider={PROVIDER_GOOGLE}
                  style={{ width: "100%", height: 220 }}
                >
                  <Marker
                    coordinate={{
                      latitude: data.room.latitude,
                      longitude: data.room.longitude,
                    }}
                    description={data.room.address}
                    title={data.room.name}
                  />
                </MapView>
              </View>

              <TouchableOpacity
                onPress={() =>
                  openMaps(
                    data.room.address,
                    data.room.latitude,
                    data.room.longitude
                  )
                }
              >
                <Text className="underline" style={{ color: accent }}>
                  {data.room.address}
                </Text>
              </TouchableOpacity>
            </VStack>
          )}

          <View
            style={{ height: 1, backgroundColor: border, marginVertical: 8 }}
          />

          {/* Payment */}
          <VStack space="sm">
            <Text bold className="text-lg" style={{ color: text }}>
              Payment details
            </Text>
            <HStack className="justify-between">
              <Text style={{ color: icon }}>Room Price</Text>
              <Text style={{ color: icon }}>{data.payment.roomPrice}</Text>
            </HStack>
            <HStack className="justify-between">
              <Text style={{ color: icon }}>Deposit</Text>
              <Text style={{ color: icon }}>{data.payment.deposit}</Text>
            </HStack>
            <HStack className="justify-between">
              <Text bold style={{ color: text }}>
                Total cost
              </Text>
              <Text bold style={{ color: text }}>
                {data.payment.totalCost}
              </Text>
            </HStack>
          </VStack>
        </VStack>
      </ScrollView>

      {/* Bottom actions */}
      <View
        className="absolute right-0 bottom-0 left-0 px-4 py-4"
        style={{
          backgroundColor: surface,
          borderTopColor: border,
          borderTopWidth: 1,
        }}
      >
        <VStack space="sm">
          {isFinished ? (
            typeof onLeaveReview === "function" && (
              <Button
                className="mb-5 rounded-full"
                onPress={onLeaveReview}
                size="xl"
                style={{ backgroundColor: primary }}
              >
                <Text className="font-semibold text-lg text-white">
                  Leave a review
                </Text>
              </Button>
            )
          ) : (
            <>
              {typeof onEdit === "function" && (
                <Button
                  className="rounded-full"
                  onPress={onEdit}
                  size="xl"
                  style={{ backgroundColor: primary }}
                >
                  <Text className="font-semibold text-lg text-white">
                    Edit booking
                  </Text>
                </Button>
              )}
              {typeof onCancel === "function" && (
                <Button
                  className="rounded-full"
                  onPress={onCancel}
                  size="xl"
                  style={{ borderColor: primary }}
                  variant="outline"
                >
                  <Text
                    className="font-semibold text-lg"
                    style={{ color: primary }}
                  >
                    Cancel booking
                  </Text>
                </Button>
              )}
            </>
          )}
        </VStack>
      </View>
    </SafeAreaView>
  );
}
