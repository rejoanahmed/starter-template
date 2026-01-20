// components/pages/merchant/booking/BookingDetailsScreen.tsx

import { Button } from "@app/components/ui/button";
import { Heading } from "@app/components/ui/heading";
import { HStack } from "@app/components/ui/hstack";
import {
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@app/components/ui/modal";
import { Text } from "@app/components/ui/text";
import { VStack } from "@app/components/ui/vstack";
import { Colors } from "@app/constants/Colors";
import { useBookingDetails } from "@app/services/merchant/bookingDetails";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import type React from "react";
import { useMemo, useState } from "react";
import {
  Image,
  Linking,
  Platform,
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

type BookingDetailsScreenProps = {
  bookingId: string;
};

export function BookingDetailsScreen({ bookingId }: BookingDetailsScreenProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const theme = useMemo(() => (isDark ? Colors.dark : Colors.light), [isDark]);

  const [clientInfoExpanded, setClientInfoExpanded] = useState(false);
  const [cancellationExpanded, setCancellationExpanded] = useState(false);
  const [showFinishModal, setShowFinishModal] = useState(false);

  const { data: booking, isLoading, error } = useBookingDetails(bookingId);

  const iconColor = isDark ? "#A6ADB4" : "#667781";
  const subtleBg = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";

  const handleCall = (phone: string) => Linking.openURL(`tel:${phone}`);
  const handleEmail = (email: string) => Linking.openURL(`mailto:${email}`);

  const openMaps = (address: string, lat: number, lng: number) => {
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
      Linking.openURL(url);
    }
  };

  // Actions
  const handleAppeal = () => router.push(`/booking/${bookingId}/appeal`);
  const handleFinish = () => setShowFinishModal(true);
  const confirmFinish = () => {
    setShowFinishModal(false);
    // TODO: finish logic
    console.log("Booking finished");
  };
  const handleRateClient = () => {
    router.push({
      pathname: "/",
      params: { id: bookingId, name: booking?.client.name ?? "" },
    });
  };
  const handleCancelBooking = () => {
    router.push({
      pathname: "/",
      params: { id: bookingId },
    });
  };

  // Status flags
  const isWaitingConfirmation = booking?.status === "waiting_confirmation";
  const isWaitingCheckin = booking?.status === "waiting_checkin";
  const isFinished = booking?.status === "finished";

  /* ---------- UI helpers ---------- */
  const Divider = () => (
    <View className="h-px" style={{ backgroundColor: theme.border }} />
  );

  const Card = ({ children }: { children: React.ReactNode }) => (
    <View
      className="rounded-2xl border"
      style={{
        backgroundColor: theme.surface,
        borderColor: theme.border,
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: Platform.OS === "android" ? 2 : 0,
      }}
    >
      {children}
    </View>
  );

  const Row = ({
    label,
    value,
    bold = false,
  }: {
    label: string;
    value: React.ReactNode;
    bold?: boolean;
  }) => (
    <HStack className="justify-between py-2">
      <Text className="mr-4" style={{ color: theme.text, opacity: 0.85 }}>
        {label}
      </Text>
      <Text
        bold={bold}
        className="flex-1 text-right"
        numberOfLines={2}
        style={{ color: theme.text }}
      >
        {value}
      </Text>
    </HStack>
  );

  const Chip = ({ text }: { text: string }) => (
    <View
      className="self-start rounded-full px-2 py-1"
      style={{
        backgroundColor: subtleBg,
        borderColor: theme.border,
        borderWidth: Platform.select({ ios: 0.5, android: 1 }),
      }}
    >
      <Text className="text-xs" style={{ color: theme.text, opacity: 0.8 }}>
        {text}
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView
        className="flex-1"
        style={{ backgroundColor: theme.background }}
      >
        <View className="flex-1 items-center justify-center">
          <Text style={{ color: theme.text, opacity: 0.8 }}>
            Loading booking details...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !booking) {
    return (
      <SafeAreaView
        className="flex-1"
        style={{ backgroundColor: theme.background }}
      >
        <View className="flex-1 items-center justify-center px-8">
          <MaterialIcons color="#EF4444" name="error-outline" size={48} />
          <Text
            className="mt-4 text-center font-bold"
            style={{ color: theme.text }}
          >
            Failed to load booking
          </Text>
          <Text className="mt-2 text-center" style={{ color: theme.icon }}>
            {error instanceof Error ? error.message : "Unknown error"}
          </Text>
          <TouchableOpacity
            className="mt-6 rounded-xl px-6 py-3"
            onPress={() => router.back()}
            style={{ backgroundColor: theme.tint }}
          >
            <Text style={{ color: "#FFFFFF", fontWeight: "600" }}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: theme.background }}
    >
      {/* Header */}
      <HStack
        className="items-center border-b px-4 py-3"
        style={{ borderColor: theme.border }}
      >
        <TouchableOpacity
          className="mr-3"
          hitSlop={8}
          onPress={() => router.back()}
        >
          <MaterialIcons color={iconColor} name="arrow-back" size={24} />
        </TouchableOpacity>
        <Text className="flex-1 text-lg" style={{ color: theme.text }}>
          {booking.statusText}
        </Text>
        <Chip text={booking.status} />
      </HStack>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 160 }}
      >
        {/* Hero image */}
        <Image
          className="h-64 w-full"
          resizeMode="cover"
          source={{ uri: booking.room.imageUrl }}
        />

        <VStack className="px-4 py-4" space="lg">
          {/* Room summary */}
          <Card>
            <VStack className="p-4" space="sm">
              <Heading size="xl" style={{ color: theme.text }}>
                {booking.room.name}
              </Heading>
              <Text style={{ color: theme.text, opacity: 0.8 }}>
                {booking.room.address}
              </Text>
              <HStack className="flex-wrap items-center" space="md">
                <HStack className="items-center" space="xs">
                  <MaterialIcons color={iconColor} name="group" size={18} />
                  <Text style={{ color: theme.text, opacity: 0.8 }}>
                    {booking.room.capacity}
                  </Text>
                </HStack>
                <HStack className="items-center" space="xs">
                  <MaterialIcons color="#FFB800" name="star" size={16} />
                  <Text bold style={{ color: theme.text }}>
                    {booking.room.rating} | {booking.room.reviewCount} reviews
                  </Text>
                </HStack>
              </HStack>
            </VStack>
          </Card>

          {/* Schedule */}
          <Card>
            <VStack className="p-4" space="md">
              <Heading size="lg" style={{ color: theme.text }}>
                Schedule
              </Heading>
              <HStack className="justify-between">
                <VStack>
                  <Text bold style={{ color: theme.text }}>
                    Check-in
                  </Text>
                  <Text style={{ color: theme.text, opacity: 0.85 }}>
                    {booking.checkIn.date} {booking.checkIn.time}
                  </Text>
                </VStack>
                <VStack>
                  <Text bold style={{ color: theme.text }}>
                    Check-out
                  </Text>
                  <Text style={{ color: theme.text, opacity: 0.85 }}>
                    {booking.checkOut.date} {booking.checkOut.time}
                  </Text>
                </VStack>
              </HStack>
              <Divider />
              <Row
                label="Number of guests"
                value={`${booking.numberOfGuests} guest`}
              />
            </VStack>
          </Card>

          {/* Client info */}
          <Card>
            <VStack className="p-4" space="sm">
              <HStack className="items-center justify-between">
                <Heading size="lg" style={{ color: theme.text }}>
                  Client Information
                </Heading>
                <TouchableOpacity
                  hitSlop={8}
                  onPress={() => setClientInfoExpanded(!clientInfoExpanded)}
                >
                  <MaterialIcons
                    color={iconColor}
                    name={clientInfoExpanded ? "expand-less" : "expand-more"}
                    size={24}
                  />
                </TouchableOpacity>
              </HStack>
              {clientInfoExpanded && (
                <VStack className="mt-1" space="sm">
                  <HStack className="items-center" space="sm">
                    <MaterialIcons color={iconColor} name="person" size={20} />
                    <Text style={{ color: theme.text, opacity: 0.9 }}>
                      {booking.client.name}
                    </Text>
                  </HStack>
                  <TouchableOpacity
                    hitSlop={6}
                    onPress={() => handleCall(booking.client.phone)}
                  >
                    <HStack className="items-center" space="sm">
                      <MaterialIcons color={iconColor} name="phone" size={20} />
                      <Text style={{ color: theme.text, opacity: 0.9 }}>
                        {booking.client.phone}
                      </Text>
                    </HStack>
                  </TouchableOpacity>
                  <TouchableOpacity
                    hitSlop={6}
                    onPress={() => handleEmail(booking.client.email)}
                  >
                    <HStack className="items-center" space="sm">
                      <MaterialIcons color={iconColor} name="email" size={20} />
                      <Text style={{ color: theme.text, opacity: 0.9 }}>
                        {booking.client.email}
                      </Text>
                    </HStack>
                  </TouchableOpacity>
                </VStack>
              )}
            </VStack>
          </Card>

          {/* Codes & policies */}
          <Card>
            <VStack className="p-4" space="md">
              <VStack space="xs">
                <Text bold className="text-lg" style={{ color: theme.text }}>
                  Confirmation code
                </Text>
                <Text style={{ color: theme.text, letterSpacing: 0.5 }}>
                  {booking.confirmationCode}
                </Text>
              </VStack>

              <Divider />

              <VStack space="xs">
                <HStack className="items-start justify-between">
                  <Text bold className="text-lg" style={{ color: theme.text }}>
                    Cancellation policy
                  </Text>
                  <TouchableOpacity
                    onPress={() =>
                      setCancellationExpanded(!cancellationExpanded)
                    }
                  >
                    <Text
                      style={{
                        color: theme.tint,
                        textDecorationLine: "underline",
                      }}
                    >
                      Learn more
                    </Text>
                  </TouchableOpacity>
                </HStack>
                <Text style={{ color: theme.text, opacity: 0.9 }}>
                  {cancellationExpanded
                    ? booking.cancellationPolicy.fullDetails
                    : booking.cancellationPolicy.summary}
                </Text>
              </VStack>

              <Divider />

              <VStack space="xs">
                <Text bold className="text-lg" style={{ color: theme.text }}>
                  Deposit Policy
                </Text>
                <Text style={{ color: theme.text, opacity: 0.9 }}>
                  {booking.depositPolicy}
                </Text>
              </VStack>
            </VStack>
          </Card>

          {/* Location */}
          <Card>
            <VStack className="p-4" space="sm">
              <Text bold className="text-lg" style={{ color: theme.text }}>
                Location
              </Text>
              {booking.room.latitude && booking.room.longitude ? (
                <View className="h-48 w-full overflow-hidden rounded-xl">
                  <MapView
                    initialRegion={{
                      latitude: booking.room.latitude,
                      longitude: booking.room.longitude,
                      latitudeDelta: 0.01,
                      longitudeDelta: 0.01,
                    }}
                    mapType={"standard" as MapType}
                    provider={PROVIDER_GOOGLE}
                    style={{ width: "100%", height: 192 }}
                  >
                    <Marker
                      coordinate={{
                        latitude: booking.room.latitude,
                        longitude: booking.room.longitude,
                      }}
                      description={booking.room.address}
                      title={booking.room.name}
                    />
                  </MapView>
                </View>
              ) : (
                <View
                  className="h-48 w-full overflow-hidden rounded-xl"
                  style={{ backgroundColor: subtleBg }}
                >
                  <View className="relative flex-1 items-center justify-center">
                    <View
                      className="absolute h-6 w-6 rounded-full border-4 bg-red-500"
                      style={{
                        borderColor: theme.surface,
                        top: "45%",
                        left: "48%",
                        transform: [{ translateX: -12 }, { translateY: -12 }],
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.3,
                        shadowRadius: 2,
                        elevation: 4,
                      }}
                    />
                  </View>
                </View>
              )}
              <TouchableOpacity
                onPress={() =>
                  openMaps(
                    booking.room.address,
                    booking.room.latitude,
                    booking.room.longitude
                  )
                }
              >
                <HStack className="items-start" space="xs">
                  <MaterialIcons color={iconColor} name="place" size={18} />
                  <Text style={{ color: theme.text, opacity: 0.9 }}>
                    {booking.room.address}
                  </Text>
                </HStack>
              </TouchableOpacity>
            </VStack>
          </Card>

          {/* Payment */}
          <Card>
            <VStack className="p-4" space="sm">
              <Text bold className="text-lg" style={{ color: theme.text }}>
                Payment details
              </Text>
              <Row
                label="Room Price"
                value={`$${booking.payment.roomPrice}${booking.payment.currency}`}
              />
              <Row
                label="Deposit"
                value={`$${booking.payment.deposit}${booking.payment.currency}`}
              />
              <Divider />
              <Row
                bold
                label="Total cost"
                value={`$${booking.payment.totalCost}${booking.payment.currency}`}
              />
            </VStack>
          </Card>
        </VStack>
      </ScrollView>

      {/* Bottom Actions (per status) */}
      {(isWaitingConfirmation || isWaitingCheckin || isFinished) && (
        <View
          className="absolute right-0 bottom-0 left-0 border-t px-4 py-4"
          style={{
            backgroundColor: theme.background,
            borderColor: theme.border,
          }}
        >
          {isWaitingConfirmation && (
            <VStack space="sm">
              <Button
                className="rounded-full"
                onPress={handleAppeal}
                size="xl"
                style={{ backgroundColor: theme.primaryButton ?? theme.tint }}
              >
                <Text
                  className="font-semibold text-lg"
                  style={{ color: "#FFFFFF" }}
                >
                  Appeal
                </Text>
              </Button>
              <Button
                className="rounded-full"
                onPress={handleFinish}
                size="xl"
                style={{ backgroundColor: theme.tint }}
              >
                <Text
                  className="font-semibold text-lg"
                  style={{ color: "#FFFFFF" }}
                >
                  Finish
                </Text>
              </Button>
            </VStack>
          )}

          {isWaitingCheckin && (
            <VStack space="sm">
              <Button
                className="rounded-full"
                onPress={handleCancelBooking}
                size="xl"
                style={{ backgroundColor: theme.tint }}
              >
                <Text
                  className="font-semibold text-lg"
                  style={{ color: "#FFFFFF" }}
                >
                  Cancel booking
                </Text>
              </Button>
            </VStack>
          )}

          {isFinished && (
            <VStack space="sm">
              <Button
                className="rounded-full"
                onPress={handleRateClient}
                size="xl"
                style={{ backgroundColor: theme.tint }}
              >
                <Text
                  className="font-semibold text-lg"
                  style={{ color: "#FFFFFF" }}
                >
                  Rate client
                </Text>
              </Button>
            </VStack>
          )}
        </View>
      )}

      {/* Finish modal */}
      <Modal isOpen={showFinishModal} onClose={() => setShowFinishModal(false)}>
        <ModalBackdrop />
        <ModalContent
          style={{
            backgroundColor: theme.surface,
            borderColor: theme.border,
            borderWidth: 1,
          }}
        >
          <ModalHeader>
            <Heading size="lg" style={{ color: theme.text }}>
              Confirm Finish
            </Heading>
            <ModalCloseButton>
              <MaterialIcons color={iconColor} name="close" size={24} />
            </ModalCloseButton>
          </ModalHeader>
          <ModalBody>
            <Text style={{ color: theme.text }}>
              Are you sure you want to finish this booking? This action cannot
              be undone.
            </Text>
          </ModalBody>
          <ModalFooter>
            <HStack className="w-full" space="sm">
              <Button
                className="flex-1"
                onPress={() => setShowFinishModal(false)}
                style={{
                  borderColor: theme.border,
                  backgroundColor: "transparent",
                }}
                variant="outline"
              >
                <Text style={{ color: theme.text }}>Cancel</Text>
              </Button>
              <Button
                className="flex-1"
                onPress={confirmFinish}
                style={{ backgroundColor: theme.tint }}
              >
                <Text className="text-white">Finish</Text>
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </SafeAreaView>
  );
}
