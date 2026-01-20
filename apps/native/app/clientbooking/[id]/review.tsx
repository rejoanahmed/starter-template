// app/review/[id].tsx

import { ReviewScreen } from "@app/components/pages/history/ReviewScreen";
import { useLocalSearchParams } from "expo-router";

export default function ReviewPage() {
  const { id } = useLocalSearchParams<{ id?: string }>();

  if (!id) {
    return null;
  }

  return <ReviewScreen bookingId={id} />;
}
