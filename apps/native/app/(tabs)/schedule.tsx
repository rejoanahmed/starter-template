import MonthlyCalendarScreen from "@app/components/pages/schedule/MonthlyCalendarScreen";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ScheduleScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background-0" edges={["top"]}>
      <MonthlyCalendarScreen />
    </SafeAreaView>
  );
}
