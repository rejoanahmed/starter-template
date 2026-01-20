import { ClientHomeScreen } from "@app/components/pages/ClientHomeScreen";
import { Redirect } from "expo-router";
import { useUser } from "../_layout";

export default function HomeScreen() {
  const { userRole } = useUser();
  const isMerchant = userRole === "merchant";

  if (isMerchant) {
    return <Redirect href="/history" />;
  }

  return <ClientHomeScreen />;
}
