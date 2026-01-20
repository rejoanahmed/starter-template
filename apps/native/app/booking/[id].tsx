import { BookingDetailsScreen } from "@app/components/pages/history/BookingDetailsScreen";
import { useLocalSearchParams } from "expo-router";

export default function BookingDetailsPage() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <BookingDetailsScreen bookingId={id} />;
}
