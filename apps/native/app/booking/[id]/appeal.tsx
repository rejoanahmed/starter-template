import { AppealScreen } from "@app/components/pages/history/AppealScreen";
import { useLocalSearchParams } from "expo-router";

export default function AppealPage() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <AppealScreen bookingId={id} />;
}
