import ClientBookingEdit, {
  type ClientBookingEditConfirmPayload,
  type ClientBookingEditData,
} from "@app/components/pages/history/ClientBookingEdit";
import { router, useLocalSearchParams } from "expo-router";

export default function EditBookingPage() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  if (!id) {
    return null;
  }

  const mock: ClientBookingEditData = {
    bookingId: id,
    current: {
      dateRangeText: "Nov 18 - Nov 19",
      timeRangeText: "10:00 PM - 2:00 AM",
      people: 4, // current booked people
      baseHours: 4, // current booked hours (10PM–2AM)
    },
    limits: { availableExtraHours: 8, peopleMin: 1, peopleMax: 12 },
    pricing: {
      hourlyRateHKD: 45,
      currencySuffix: "HKD",
      extraPersonPerDayHKD: 100, // ✅ extra-person fee
    },
  };

  return (
    <ClientBookingEdit
      data={mock}
      onCancel={() => router.back()}
      onConfirm={(payload: ClientBookingEditConfirmPayload) => {
        // payload has: { bookingId, newPeople, addHours, newTotalHours, priceHKD, extraPersonCostHKD }
        console.log("EDIT CONFIRM", payload);
        router.back();
      }}
    />
  );
}
