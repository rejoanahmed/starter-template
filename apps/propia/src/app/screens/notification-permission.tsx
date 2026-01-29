import { Button } from "@propia/components/Button";
import Icon from "@propia/components/Icon";
import ThemedText from "@propia/components/ThemedText";
import { router } from "expo-router";
import { View } from "react-native";

export default function NotificationPermissionScreen() {
  const handleSkip = () => {
    router.replace("/screens/location-permission");
  };

  return (
    <View className="flex-1 bg-light-primary dark:bg-dark-primary p-6">
      <View className="flex-1 items-center justify-center">
        <Icon name="BellDot" size={80} strokeWidth={0.7} />
        <ThemedText className="text-3xl font-bold text-center mb-4 mt-8">
          Enable Notifications
        </ThemedText>
        <ThemedText className="text-light-subtext dark:text-dark-subtext text-center mb-12">
          Stay updated with property alerts, messages, and important updates
        </ThemedText>
      </View>

      <View className="gap-1">
        <Button size="large" title="Allow Notifications" />
        <Button
          onPress={handleSkip}
          size="large"
          title="Skip for Now"
          variant="ghost"
        />
      </View>
    </View>
  );
}
