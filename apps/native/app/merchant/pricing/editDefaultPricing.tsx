import { ThemedText } from "@app/components/ThemedText";
import { Colors } from "@app/constants/Colors";
import { useMerchantRooms, useUpdateRoom } from "@app/services/merchant/rooms";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

type HourlyTier = {
  hours: number;
  price: number;
};

export default function EditDefaultPricingScreen() {
  const { colorScheme } = useColorScheme();
  const palette = Colors[colorScheme === "dark" ? "dark" : "light"];
  const inset = useSafeAreaInsets();
  const router = useRouter();
  const { roomId } = useLocalSearchParams<{ roomId: string }>();

  const { data: rooms } = useMerchantRooms();
  const updateRoomMutation = useUpdateRoom();

  const room = rooms?.find((r) => r.id === roomId);

  const [includedGuests, setIncludedGuests] = useState("1");
  const [hourlyTiers, setHourlyTiers] = useState<HourlyTier[]>([]);
  const [extraPersonCharge, setExtraPersonCharge] = useState("0");
  const [newTierHours, setNewTierHours] = useState("");
  const [newTierPrice, setNewTierPrice] = useState("");

  // Load room pricing data
  useEffect(() => {
    if (room) {
      setIncludedGuests((room.includedGuests || 1).toString());
      setHourlyTiers(
        (room.hourlyTiers as Array<{ hours: number; price: number }>) || []
      );
      setExtraPersonCharge(
        (room.extraPersonChargePerHour
          ? Number.parseFloat(room.extraPersonChargePerHour)
          : 0
        ).toString()
      );
    }
  }, [room]);

  const addTier = () => {
    const hours = Number.parseFloat(newTierHours);
    const price = Number.parseFloat(newTierPrice);

    if (hours > 0 && price >= 0) {
      const existingIndex = hourlyTiers.findIndex((t) => t.hours === hours);
      if (existingIndex >= 0) {
        const updated = [...hourlyTiers];
        updated[existingIndex] = { hours, price };
        setHourlyTiers(updated);
      } else {
        const updated = [...hourlyTiers, { hours, price }].sort(
          (a, b) => a.hours - b.hours
        );
        setHourlyTiers(updated);
      }
      setNewTierHours("");
      setNewTierPrice("");
    }
  };

  const removeTier = (index: number) => {
    setHourlyTiers(hourlyTiers.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!roomId) {
      Alert.alert("Error", "Room ID is required");
      return;
    }

    const includedGuestsNum = Number.parseInt(includedGuests, 10);
    if (includedGuestsNum < 1) {
      Alert.alert("Validation Error", "Included guests must be at least 1");
      return;
    }

    if (hourlyTiers.length === 0) {
      Alert.alert("Validation Error", "Please add at least one hourly tier");
      return;
    }

    const extraPersonChargeNum = Number.parseFloat(extraPersonCharge);
    if (extraPersonChargeNum < 0) {
      Alert.alert("Validation Error", "Extra person charge cannot be negative");
      return;
    }

    try {
      await updateRoomMutation.mutateAsync({
        roomId,
        data: {
          includedGuests: includedGuestsNum,
          hourlyTiers,
          extraPersonChargePerHour: extraPersonChargeNum,
        } as any, // Type assertion needed as useUpdateRoom type doesn't include pricing fields yet
      });
      router.back();
    } catch (error) {
      console.error("Failed to update default pricing:", error);
      Alert.alert(
        "Error",
        error instanceof Error
          ? error.message
          : "Failed to update default pricing"
      );
    }
  };

  if (!room) {
    return (
      <SafeAreaView
        className="flex-1"
        style={{ backgroundColor: palette.background }}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ActivityIndicator color={palette.tint} size="large" />
          <ThemedText style={{ marginTop: 16, color: palette.icon }}>
            Loading room...
          </ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: palette.background }}
    >
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: "padding" })}
        className="flex-1"
      >
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingTop: inset.top,
            paddingBottom: 12,
            borderBottomWidth: 1,
            borderBottomColor: palette.border,
          }}
        >
          <Pressable
            hitSlop={10}
            onPress={() => router.back()}
            style={{ marginRight: 12 }}
          >
            <Ionicons color={palette.text} name="chevron-back" size={24} />
          </Pressable>
          <ThemedText style={{ fontSize: 18, fontWeight: "600", flex: 1 }}>
            Edit Default Pricing
          </ThemedText>
          <Pressable
            disabled={updateRoomMutation.isPending}
            onPress={handleSave}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 8,
              backgroundColor: palette.tint,
              opacity: updateRoomMutation.isPending ? 0.5 : 1,
            }}
          >
            {updateRoomMutation.isPending ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <ThemedText style={{ color: "#fff", fontWeight: "600" }}>
                Save
              </ThemedText>
            )}
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={{
            padding: 16,
            paddingBottom: Math.max(inset.bottom, 24),
          }}
        >
          {/* Included Guests */}
          <View
            style={{
              marginBottom: 24,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: palette.border,
              backgroundColor: palette.surface,
              overflow: "hidden",
            }}
          >
            <View
              style={{
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderBottomColor: palette.border,
              }}
            >
              <ThemedText style={{ fontSize: 16, fontWeight: "700" }}>
                Included Guests
              </ThemedText>
            </View>
            <View style={{ padding: 16 }}>
              <TextInput
                keyboardType="number-pad"
                onChangeText={setIncludedGuests}
                placeholder="1"
                placeholderTextColor={palette.icon}
                style={{
                  borderWidth: 1,
                  borderColor: palette.border,
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 12,
                  color: palette.text,
                  fontSize: 16,
                }}
                value={includedGuests}
              />
              <ThemedText
                style={{
                  fontSize: 13,
                  color: palette.icon,
                  marginTop: 8,
                }}
              >
                Number of guests included in the base price
              </ThemedText>
            </View>
          </View>

          {/* Hourly Tiers */}
          <View
            style={{
              marginBottom: 24,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: palette.border,
              backgroundColor: palette.surface,
              overflow: "hidden",
            }}
          >
            <View
              style={{
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderBottomColor: palette.border,
              }}
            >
              <ThemedText style={{ fontSize: 16, fontWeight: "700" }}>
                Hourly Tiers *
              </ThemedText>
            </View>
            <View style={{ padding: 16, gap: 16 }}>
              {hourlyTiers.length > 0 && (
                <View style={{ gap: 8 }}>
                  {hourlyTiers.map((tier, index) => (
                    <View
                      key={`${tier.hours}-${tier.price}-${index}`}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: 12,
                        borderWidth: 1,
                        borderColor: palette.border,
                        borderRadius: 8,
                      }}
                    >
                      <ThemedText>
                        {tier.hours} {tier.hours === 1 ? "hour" : "hours"}: $
                        {tier.price}
                      </ThemedText>
                      <Pressable onPress={() => removeTier(index)}>
                        <Ionicons color={palette.icon} name="close" size={20} />
                      </Pressable>
                    </View>
                  ))}
                </View>
              )}

              <View style={{ flexDirection: "row", gap: 8 }}>
                <View
                  style={{
                    flex: 1,
                    borderWidth: 1,
                    borderColor: palette.border,
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    paddingVertical: 12,
                  }}
                >
                  <TextInput
                    keyboardType="decimal-pad"
                    onChangeText={setNewTierHours}
                    placeholder="Hours"
                    placeholderTextColor={palette.icon}
                    style={{ color: palette.text, fontSize: 16 }}
                    value={newTierHours}
                  />
                </View>
                <View
                  style={{
                    flex: 1,
                    borderWidth: 1,
                    borderColor: palette.border,
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    paddingVertical: 12,
                  }}
                >
                  <TextInput
                    keyboardType="decimal-pad"
                    onChangeText={setNewTierPrice}
                    placeholder="Price"
                    placeholderTextColor={palette.icon}
                    style={{ color: palette.text, fontSize: 16 }}
                    value={newTierPrice}
                  />
                </View>
                <Pressable
                  onPress={addTier}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    borderRadius: 8,
                    backgroundColor: palette.tint,
                  }}
                >
                  <ThemedText style={{ color: "#fff", fontWeight: "600" }}>
                    Add
                  </ThemedText>
                </Pressable>
              </View>
            </View>
          </View>

          {/* Extra Person Charge */}
          <View
            style={{
              marginBottom: 24,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: palette.border,
              backgroundColor: palette.surface,
              overflow: "hidden",
            }}
          >
            <View
              style={{
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderBottomColor: palette.border,
              }}
            >
              <ThemedText style={{ fontSize: 16, fontWeight: "700" }}>
                Extra Person Charge Per Hour
              </ThemedText>
            </View>
            <View style={{ padding: 16 }}>
              <TextInput
                keyboardType="decimal-pad"
                onChangeText={setExtraPersonCharge}
                placeholder="0.00"
                placeholderTextColor={palette.icon}
                style={{
                  borderWidth: 1,
                  borderColor: palette.border,
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 12,
                  color: palette.text,
                  fontSize: 16,
                }}
                value={extraPersonCharge}
              />
              <ThemedText
                style={{
                  fontSize: 13,
                  color: palette.icon,
                  marginTop: 8,
                }}
              >
                Additional charge per person per hour beyond included guests
              </ThemedText>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
