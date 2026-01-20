// app/(tabs)/history/cancel-booking/[id].tsx

import CancelBookingScreen, {
  type CancelBookingData,
} from "@app/components/pages/history/CancelBookingScreen";
import { router, useLocalSearchParams } from "expo-router";

export default function CancelBookingPage() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  if (!id) {
    return null;
  }

  // In real app, fetch from API. For now, mock.
  const mockData: CancelBookingData = {
    bookingId: id,
    dateRangeText: "Nov 18 - Nov 19",
    timeRangeText: "10:00 PM - 2:00 AM",
    people: 4,
    roomPriceHKD: 180,
    depositHKD: 200,
    totalHKD: 380,
    refundRoomPriceHKD: 90, // 50% of room price
    refundDepositHKD: 200, // full deposit
    refundTotalHKD: 290,
  };

  return (
    <CancelBookingScreen
      data={mockData}
      onCancel={() => router.back()}
      onConfirm={async () => {
        console.log("CANCELLATION REQUESTED for booking:", id);
        // Call your API here
        // await cancelBookingAPI(id)
        router.back();
      }}
    />
  );
}
