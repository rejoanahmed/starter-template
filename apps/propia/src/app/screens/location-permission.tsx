import { Button } from "@propia/components/Button";
import Icon from "@propia/components/Icon";
import ThemedText from "@propia/components/ThemedText";
import * as Location from "expo-location";
import { router } from "expo-router";
import { View } from "react-native";

export default function LocationPermissionScreen() {
  const handleAllowLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === "granted") {
      router.push("/(drawer)/(tabs)/");
    }
  };

  const handleSkip = () => {
    router.push("/(drawer)/(tabs)/");
  };

  return (
    <View className="flex-1 bg-light-primary dark:bg-dark-primary p-6">
      <View className="flex-1 items-center justify-center">
        <Icon name="MapPinned" size={80} strokeWidth={0.7} />
        <ThemedText className="text-3xl font-bold text-center mb-4 mt-8">
          Enable Location
        </ThemedText>
        <ThemedText className="text-light-subtext dark:text-dark-subtext text-center mb-12">
          Allow access to your location to find nearby properties and get
          accurate recommendations
        </ThemedText>
      </View>

      <View className="gap-4">
        <Button
          onPress={handleAllowLocation}
          size="large"
          title="Allow Location Access"
        />
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
