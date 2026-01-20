// components/pages/schedule/BookingDetailsModal.tsx

import { HStack } from "@app/components/ui/hstack";
import { Text } from "@app/components/ui/text";
import { VStack } from "@app/components/ui/vstack";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import {
  Modal,
  ScrollView,
  TouchableOpacity,
  View,
  type ViewStyle,
} from "react-native";

export type BookingDetails = {
  id: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  status: string;
  guests: number;
  totalPrice: string;
  startAt: Date;
  endAt: Date;
  specialRequests?: string;
};

type BookingDetailsModalProps = {
  visible: boolean;
  booking: BookingDetails | null;
  onClose: () => void;
};

export function BookingDetailsModal({
  visible,
  booking,
  onClose,
}: BookingDetailsModalProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const iconColor = isDark ? "#9CA3AF" : "#4B5563";

  if (!booking) {
    return null;
  }

  const formatDateTime = (date: Date) => {
    return date.toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "#10B981";
      case "pending":
        return "#F59E0B";
      case "cancelled":
        return "#EF4444";
      case "completed":
        return "#6B7280";
      default:
        return "#6B7280";
    }
  };

  const handleViewFullDetails = () => {
    onClose();
    router.push(`/booking/${booking.id}`);
  };

  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      transparent
      visible={visible}
    >
      <TouchableOpacity
        activeOpacity={1}
        className="flex-1 items-center justify-center bg-black/50"
        onPress={onClose}
      >
        <TouchableOpacity
          activeOpacity={1}
          className="mx-4 w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
          onPress={(e) => e.stopPropagation()}
          style={{ maxHeight: "80%" } as ViewStyle}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <HStack className="mb-4 items-center justify-between">
              <Text className="font-bold text-typography-900 text-xl">
                Booking Details
              </Text>
              <TouchableOpacity onPress={onClose}>
                <MaterialIcons color={iconColor} name="close" size={24} />
              </TouchableOpacity>
            </HStack>

            {/* Status Badge */}
            <View
              className="mb-4 self-start rounded-full px-3 py-1"
              style={{ backgroundColor: `${getStatusColor(booking.status)}20` }}
            >
              <Text
                className="font-semibold text-xs capitalize"
                style={{ color: getStatusColor(booking.status) }}
              >
                {booking.status}
              </Text>
            </View>

            {/* Time Info */}
            <VStack className="mb-4 gap-2">
              <HStack className="items-center gap-2">
                <MaterialIcons color={iconColor} name="access-time" size={20} />
                <VStack className="flex-1">
                  <Text className="text-typography-500 text-xs">Check-in</Text>
                  <Text className="font-medium text-typography-900 text-sm">
                    {formatDateTime(booking.startAt)}
                  </Text>
                </VStack>
              </HStack>

              <HStack className="items-center gap-2">
                <MaterialIcons color={iconColor} name="access-time" size={20} />
                <VStack className="flex-1">
                  <Text className="text-typography-500 text-xs">Check-out</Text>
                  <Text className="font-medium text-typography-900 text-sm">
                    {formatDateTime(booking.endAt)}
                  </Text>
                </VStack>
              </HStack>
            </VStack>

            {/* Customer Info */}
            {booking.customerName && (
              <VStack className="mb-4 gap-2">
                <HStack className="items-center gap-2">
                  <MaterialIcons color={iconColor} name="person" size={20} />
                  <VStack className="flex-1">
                    <Text className="text-typography-500 text-xs">
                      Customer
                    </Text>
                    <Text className="font-medium text-typography-900 text-sm">
                      {booking.customerName}
                    </Text>
                  </VStack>
                </HStack>

                {booking.customerPhone && (
                  <HStack className="items-center gap-2">
                    <MaterialIcons color={iconColor} name="phone" size={20} />
                    <Text className="font-medium text-typography-900 text-sm">
                      {booking.customerPhone}
                    </Text>
                  </HStack>
                )}

                {booking.customerEmail && (
                  <HStack className="items-center gap-2">
                    <MaterialIcons color={iconColor} name="email" size={20} />
                    <Text className="font-medium text-typography-900 text-sm">
                      {booking.customerEmail}
                    </Text>
                  </HStack>
                )}
              </VStack>
            )}

            {/* Guests & Price */}
            <VStack className="mb-4 gap-2">
              <HStack className="items-center gap-2">
                <MaterialIcons color={iconColor} name="group" size={20} />
                <Text className="font-medium text-typography-900 text-sm">
                  {booking.guests} {booking.guests === 1 ? "guest" : "guests"}
                </Text>
              </HStack>

              <HStack className="items-center gap-2">
                <MaterialIcons
                  color={iconColor}
                  name="attach-money"
                  size={20}
                />
                <Text className="font-bold text-typography-900 text-lg">
                  ${booking.totalPrice}
                </Text>
              </HStack>
            </VStack>

            {/* Special Requests */}
            {booking.specialRequests && (
              <VStack className="mb-4 gap-1">
                <Text className="font-medium text-typography-700 text-sm">
                  Special Requests
                </Text>
                <Text className="text-typography-600 text-sm">
                  {booking.specialRequests}
                </Text>
              </VStack>
            )}

            {/* View Full Details Button */}
            <TouchableOpacity
              className="mt-2 rounded-lg border border-sky-500 bg-sky-50 py-3"
              onPress={handleViewFullDetails}
            >
              <Text className="text-center font-semibold text-sky-700 text-sm">
                View Full Details
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}
