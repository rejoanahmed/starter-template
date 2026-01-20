// components/pages/history/CancelBookingScreen.tsx

import { Colors } from "@app/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export type CancelBookingData = {
  bookingId: string;
  dateRangeText: string;
  timeRangeText: string;
  people: number;
  roomPriceHKD: number;
  depositHKD: number;
  totalHKD: number;
  refundRoomPriceHKD: number;
  refundDepositHKD: number;
  refundTotalHKD: number;
};

type CancelBookingScreenProps = {
  data: CancelBookingData;
  onCancel: () => void;
  onConfirm: () => Promise<void> | void;
};

const DANGER = "#EF4444"; // keep confirm color

export default function CancelBookingScreen({
  data,
  onCancel,
  onConfirm,
}: CancelBookingScreenProps) {
  const { colorScheme } = useColorScheme();
  const palette = Colors[colorScheme ?? "light"];
  const bg = palette.background;
  const surface = (palette as any).surface ?? bg;
  const border = (palette as any).border ?? "rgba(0,0,0,0.12)";
  const icon = palette.icon;
  const tint = palette.tint;

  const handleConfirm = () => {
    Alert.alert(
      "Confirm Cancellation",
      "Are you sure you want to cancel this booking? This action cannot be undone.",
      [
        { text: "No, keep booking", style: "cancel", onPress: onCancel },
        { text: "Yes, cancel", style: "destructive", onPress: onConfirm },
      ]
    );
  };

  return (
    // ✅ uses theme background from colors.ts (light & dark)
    <SafeAreaView className="flex-1" style={{ backgroundColor: bg }}>
      <ScrollView className="px-4 py-4" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="mb-6 flex-row items-center">
          <Pressable hitSlop={12} onPress={onCancel}>
            <Ionicons color={icon} name="chevron-back" size={28} />
          </Pressable>
          <Text className="ml-2 font-bold text-typography-900 text-xl">
            Cancel Booking
          </Text>
        </View>

        {/* Current Booking Summary */}
        <View
          className="mb-5 rounded-2xl border p-4"
          style={{ backgroundColor: surface, borderColor: border }}
        >
          <Text className="mb-3 font-semibold text-lg text-typography-900">
            Current Booking
          </Text>
          <BookingDetail label="Date" value={data.dateRangeText} />
          <BookingDetail label="Time" value={data.timeRangeText} />
          <BookingDetail label="Number of people" value={`${data.people}`} />
        </View>

        {/* Cancellation Policy */}
        <View className="mb-5">
          <Text className="mb-2 font-semibold text-base text-typography-900">
            Cancellation policy
          </Text>
          <Text className="mb-2 text-typography-700">
            Half of the payment will be refunded if cancelled 5 days before
            check-in.
          </Text>
          <Pressable onPress={() => router.push("/clientbooking/policy")}>
            {/* use theme tint instead of fixed blue */}
            <Text className="font-medium underline" style={{ color: tint }}>
              Learn more
            </Text>
          </Pressable>
        </View>

        {/* Payment Details */}
        <SectionHeader title="Payment details" />
        <PriceRow amount={data.roomPriceHKD} label="Room Price" suffix="HKD" />
        <PriceRow amount={data.depositHKD} bold label="Deposit" suffix="HKD" />
        <TotalRow
          amount={data.totalHKD}
          border={border}
          label="Total"
          suffix="HKD"
        />

        {/* Refund Details */}
        <SectionHeader title="Refund details" />
        <Text className="mb-3 text-typography-700">
          According to the cancellation policy, you will be receiving 50% of the
          room price and full amount of the deposit.
        </Text>
        <PriceRow
          amount={data.refundRoomPriceHKD}
          label="Room price"
          suffix="HKD"
        />
        <PriceRow
          amount={data.refundDepositHKD}
          bold
          label="Deposit"
          suffix="HKD"
        />
        <TotalRow
          amount={data.refundTotalHKD}
          border={border}
          label="Total"
          suffix="HKD"
        />

        {/* Action Buttons */}
        <View className="mt-6 flex-row gap-3">
          <Pressable
            className="flex-1 items-center rounded-xl border py-3"
            onPress={onCancel}
            style={{ borderColor: border }}
          >
            <Text className="font-semibold text-typography-900">Back</Text>
          </Pressable>
          <Pressable
            className="flex-1 items-center rounded-xl py-3"
            onPress={handleConfirm}
            style={{ backgroundColor: DANGER }} // unchanged
          >
            <Text className="font-semibold text-white">Confirm</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ─── Subcomponents ───────────────────────── */

function SectionHeader({ title }: { title: string }) {
  return (
    <View className="my-4">
      <Text className="font-semibold text-base text-typography-900">
        {title}
      </Text>
    </View>
  );
}

function BookingDetail({ label, value }: { label: string; value: string }) {
  return (
    <View className="my-1 flex-row justify-between">
      <Text className="text-typography-700">{label}</Text>
      <Text className="font-medium text-typography-900">{value}</Text>
    </View>
  );
}

function PriceRow({
  label,
  amount,
  suffix,
  bold = false,
}: {
  label: string;
  amount: number;
  suffix: string;
  bold?: boolean;
}) {
  return (
    <View className="my-1 flex-row justify-between">
      <Text className="text-typography-700">{label}</Text>
      <Text
        className={
          bold ? "font-semibold text-typography-900" : "text-typography-900"
        }
      >
        ${amount} {suffix}
      </Text>
    </View>
  );
}

function TotalRow({
  label,
  amount,
  suffix,
  border,
}: {
  label: string;
  amount: number;
  suffix: string;
  border: string;
}) {
  return (
    <View
      className="mt-2 flex-row justify-between pt-3"
      style={{ borderTopWidth: 1, borderTopColor: border }}
    >
      <Text className="font-semibold text-base text-typography-900">
        {label}
      </Text>
      <Text className="font-semibold text-base text-typography-900">
        ${amount} {suffix}
      </Text>
    </View>
  );
}
