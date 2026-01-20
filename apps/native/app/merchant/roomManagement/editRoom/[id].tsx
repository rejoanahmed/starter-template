// app/merchant/roomManagement/editRoom/[id].tsx

import { Colors } from "@app/constants/Colors";
import { useRoom, useUpdateRoom } from "@app/services/merchant/rooms";
import Ionicons from "@expo/vector-icons/Ionicons";
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
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const HONG_KONG_DISTRICTS = [
  "Central & Western",
  "Eastern",
  "Southern",
  "Wan Chai",
  "Kowloon City",
  "Kwun Tong",
  "Sham Shui Po",
  "Wong Tai Sin",
  "Yau Tsim Mong",
  "Islands",
  "Kwai Tsing",
  "North",
  "Sai Kung",
  "Sha Tin",
  "Tai Po",
  "Tsuen Wan",
  "Tuen Mun",
  "Yuen Long",
] as const;

export default function EditRoomScreen() {
  const { colorScheme } = useColorScheme();
  const palette = Colors[colorScheme === "dark" ? "dark" : "light"];
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  // Fetch room data
  const { data: room, isLoading, error } = useRoom(id || "");
  const updateRoomMutation = useUpdateRoom();

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [district, setDistrict] = useState("");
  const [minGuests, setMinGuests] = useState("1");
  const [maxGuests, setMaxGuests] = useState("1");

  // Initialize form with room data
  useEffect(() => {
    if (room) {
      setTitle(room.title || "");
      setDescription(room.description || "");
      setAddress(room.address || "");
      setDistrict(room.district || "");
      setMinGuests(room.minGuests?.toString() || "1");
      setMaxGuests(room.maxGuests?.toString() || "1");
    }
  }, [room]);

  const handleSave = () => {
    if (!id) {
      return;
    }

    const minGuestsNum = Number.parseInt(minGuests, 10);
    const maxGuestsNum = Number.parseInt(maxGuests, 10);

    // Validation
    if (!title.trim()) {
      Alert.alert("Error", "Room title is required");
      return;
    }

    if (!description.trim()) {
      Alert.alert("Error", "Room description is required");
      return;
    }

    if (!address.trim()) {
      Alert.alert("Error", "Address is required");
      return;
    }

    if (!district) {
      Alert.alert("Error", "District is required");
      return;
    }

    if (Number.isNaN(minGuestsNum) || minGuestsNum < 1) {
      Alert.alert("Error", "Minimum guests must be at least 1");
      return;
    }

    if (Number.isNaN(maxGuestsNum) || maxGuestsNum < 1) {
      Alert.alert("Error", "Maximum guests must be at least 1");
      return;
    }

    if (maxGuestsNum < minGuestsNum) {
      Alert.alert(
        "Error",
        "Maximum guests must be greater than or equal to minimum guests"
      );
      return;
    }

    updateRoomMutation.mutate(
      {
        roomId: id,
        data: {
          title,
          description,
          address,
          district,
          minGuests: minGuestsNum,
          maxGuests: maxGuestsNum,
        },
      },
      {
        onSuccess: () => {
          Alert.alert("Success", "Room updated successfully", [
            {
              text: "OK",
              onPress: () => router.back(),
            },
          ]);
        },
        onError: (err) => {
          console.error("Failed to update room:", err);
          Alert.alert(
            "Error",
            err instanceof Error ? err.message : "Failed to update room"
          );
        },
      }
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView
        className="flex-1"
        style={{ backgroundColor: palette.background }}
      >
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={palette.tint} size="large" />
          <Text className="mt-4" style={{ color: palette.text }}>
            Loading room details...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !room) {
    return (
      <SafeAreaView
        className="flex-1"
        style={{ backgroundColor: palette.background }}
      >
        <View className="flex-1 items-center justify-center p-8">
          <Ionicons color="#EF4444" name="alert-circle-outline" size={48} />
          <Text
            className="mt-4 text-center font-bold"
            style={{ color: palette.text }}
          >
            Failed to load room
          </Text>
          <Text className="mt-2 text-center" style={{ color: palette.icon }}>
            {error instanceof Error ? error.message : "Unknown error"}
          </Text>
          <Pressable
            className="mt-6 rounded-xl px-6 py-3"
            onPress={() => router.back()}
            style={{ backgroundColor: palette.tint }}
          >
            <Text style={{ color: "#FFFFFF", fontWeight: "600" }}>Go Back</Text>
          </Pressable>
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
          className="flex-row items-center border-b px-4 pb-2"
          style={{ borderBottomColor: palette.border }}
        >
          <Pressable
            className="pr-2"
            hitSlop={10}
            onPress={() => router.back()}
          >
            <Ionicons color={palette.text} name="chevron-back" size={22} />
          </Pressable>
          <Text
            className="flex-1 font-extrabold text-lg"
            style={{ color: palette.text }}
          >
            Edit Room
          </Text>
          <Pressable
            className="rounded-full px-4 py-2"
            disabled={updateRoomMutation.isPending}
            onPress={handleSave}
            style={{
              backgroundColor: palette.primaryButton,
              opacity: updateRoomMutation.isPending ? 0.5 : 1,
            }}
          >
            {updateRoomMutation.isPending ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text className="font-semibold text-white">Save</Text>
            )}
          </Pressable>
        </View>

        <ScrollView
          className="flex-1 px-4"
          contentContainerStyle={{ paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Room Title */}
          <View
            className="mt-5 rounded-xl border p-3"
            style={{ borderColor: palette.border }}
          >
            <Text className="mb-2 text-base" style={{ color: palette.text }}>
              Room Title
            </Text>
            <View
              className="rounded-lg border p-3"
              style={{ borderColor: palette.border }}
            >
              <TextInput
                autoCapitalize="words"
                className="text-base"
                onChangeText={setTitle}
                placeholder="Enter room title"
                placeholderTextColor={palette.icon}
                style={{ color: palette.text }}
                value={title}
              />
            </View>
          </View>

          {/* Description */}
          <View
            className="mt-5 rounded-xl border p-3"
            style={{ borderColor: palette.border }}
          >
            <Text className="mb-2 text-base" style={{ color: palette.text }}>
              Description
            </Text>
            <View
              className="rounded-xl border p-3"
              style={{ borderColor: palette.border }}
            >
              <TextInput
                className="text-base"
                multiline
                onChangeText={setDescription}
                placeholder="Enter room description"
                placeholderTextColor={palette.icon}
                style={{
                  color: palette.text,
                  minHeight: 120,
                  textAlignVertical: "top",
                }}
                value={description}
              />
            </View>
          </View>

          {/* Address */}
          <View
            className="mt-5 rounded-xl border p-3"
            style={{ borderColor: palette.border }}
          >
            <Text className="mb-2 text-base" style={{ color: palette.text }}>
              Address
            </Text>
            <View
              className="rounded-lg border p-3"
              style={{ borderColor: palette.border }}
            >
              <TextInput
                autoCapitalize="words"
                className="text-base"
                onChangeText={setAddress}
                placeholder="Enter address"
                placeholderTextColor={palette.icon}
                style={{ color: palette.text }}
                value={address}
              />
            </View>
          </View>

          {/* District */}
          <View
            className="mt-5 rounded-xl border p-3"
            style={{ borderColor: palette.border }}
          >
            <Text className="mb-2 text-base" style={{ color: palette.text }}>
              District
            </Text>
            <View
              className="rounded-lg border p-3"
              style={{ borderColor: palette.border }}
            >
              <TextInput
                autoCapitalize="words"
                className="text-base"
                onChangeText={setDistrict}
                placeholder="Enter district"
                placeholderTextColor={palette.icon}
                style={{ color: palette.text }}
                value={district}
              />
            </View>
            <Text className="mt-2 text-xs" style={{ color: palette.icon }}>
              Available districts: {HONG_KONG_DISTRICTS.join(", ")}
            </Text>
          </View>

          {/* Capacity */}
          <View
            className="mt-5 rounded-xl border p-3"
            style={{ borderColor: palette.border }}
          >
            <Text className="mb-2 text-base" style={{ color: palette.text }}>
              Capacity
            </Text>
            <View className="flex-row gap-3">
              <View className="flex-1">
                <Text className="mb-2 text-sm" style={{ color: palette.icon }}>
                  Min Guests
                </Text>
                <View
                  className="rounded-lg border p-3"
                  style={{ borderColor: palette.border }}
                >
                  <TextInput
                    className="text-base"
                    keyboardType="number-pad"
                    onChangeText={setMinGuests}
                    placeholder="1"
                    placeholderTextColor={palette.icon}
                    style={{ color: palette.text }}
                    value={minGuests}
                  />
                </View>
              </View>
              <View className="flex-1">
                <Text className="mb-2 text-sm" style={{ color: palette.icon }}>
                  Max Guests
                </Text>
                <View
                  className="rounded-lg border p-3"
                  style={{ borderColor: palette.border }}
                >
                  <TextInput
                    className="text-base"
                    keyboardType="number-pad"
                    onChangeText={setMaxGuests}
                    placeholder="1"
                    placeholderTextColor={palette.icon}
                    style={{ color: palette.text }}
                    value={maxGuests}
                  />
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
