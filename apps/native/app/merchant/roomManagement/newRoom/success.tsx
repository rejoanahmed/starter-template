import { Colors } from "@app/constants/Colors";
import { initialRoomDraft, roomDraftAtom } from "@app/lib/atoms/roomDraft";
import { useMercahntCreateRoom } from "@app/services/merchant/rooms";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { router } from "expo-router";
import { useAtom } from "jotai";
import { useColorScheme } from "nativewind";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AddRoomSuccess() {
  const { colorScheme } = useColorScheme();
  const palette = Colors[colorScheme === "dark" ? "dark" : "light"];

  // Use Jotai atom
  const [draft, setDraft] = useAtom(roomDraftAtom);
  const [error, setError] = useState<string | null>(null);

  const {
    mutate: createRoom,
    isSuccess,
    isPending,
  } = useMercahntCreateRoom(() => setDraft(initialRoomDraft));
  // Create room on mount
  useEffect(() => {
    console.log("[Success Screen] useEffect running", {
      hasName: !!draft.name,
      hasLocation: !!draft.location,
    });

    // Don't run validation if already successful
    if (isSuccess) {
      console.log("[Success Screen] Already successful, skipping");
      return;
    }

    // Validate required fields
    if (!(draft.name && draft.location)) {
      console.log("[Success Screen] Missing name or location");
      setError("Missing required room information (name or location)");
      return;
    }

    if (!draft.photos || draft.photos.length === 0) {
      console.log("[Success Screen] No photos");
      setError("No photos found. Please go back and add photos.");
      return;
    }

    if (!draft.coverId) {
      console.log("[Success Screen] No cover ID");
      setError(
        "No cover photo selected. Please go back and select a cover photo."
      );
      return;
    }

    // Validate photos have required fields
    const invalidPhotos = draft.photos.filter((p) => !(p?.uri && p?.id));
    if (invalidPhotos.length > 0) {
      console.log("[Success Screen] Invalid photos");
      setError(
        "Invalid photo data found. Please go back and re-select photos."
      );
      return;
    }

    console.log("[Success Screen] Starting room creation");
    createRoom(draft);
  }, [draft, createRoom, isSuccess]);

  const handleRetry = () => {
    if (draft.location) {
      createRoom(draft);
    }
  };

  const goBack = () => {
    // Just navigate back - data is in atom
    router.back();
  };

  const goHome = () => {
    router.replace("/merchant/roomManagement/room");
  };

  // Loading state
  if (isPending) {
    return (
      <SafeAreaView
        className="flex-1"
        style={{ backgroundColor: palette.background }}
      >
        <View className="flex-1 items-center justify-center px-6">
          <ActivityIndicator color={palette.tint} size="large" />
          <Text
            className="mt-4 text-center text-lg"
            style={{ color: palette.text }}
          >
            Creating your room...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView
        className="flex-1"
        style={{ backgroundColor: palette.background }}
      >
        <View className="flex-1 items-center justify-center px-6">
          {/* Error Icon */}
          <View
            className="mb-4 items-center justify-center rounded-full"
            style={{ width: 64, height: 64, backgroundColor: "#FFEBEE" }}
          >
            <MaterialCommunityIcons
              color="#E53935"
              name="alert-circle"
              size={36}
            />
          </View>

          {/* Error Title */}
          <Text
            className="text-center font-extrabold text-2xl"
            style={{ color: palette.text }}
          >
            Something went wrong
          </Text>

          {/* Error Message */}
          <Text
            className="mt-2 text-center text-base"
            style={{ color: palette.icon }}
          >
            {error}
          </Text>

          {/* Buttons */}
          <View className="mt-6 flex-row gap-3">
            <Pressable
              className="rounded-full border px-6 py-3"
              onPress={goBack}
              style={{ borderColor: palette.border }}
            >
              <Text
                className="font-semibold text-base"
                style={{ color: palette.text }}
              >
                Go Back
              </Text>
            </Pressable>

            <Pressable
              className="rounded-full px-6 py-3"
              onPress={handleRetry}
              style={{ backgroundColor: palette.primaryButton }}
            >
              <Text className="font-semibold text-base text-white">
                Try Again
              </Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Success state
  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: palette.background }}
    >
      <View className="flex-1 items-center justify-center px-6">
        {/* Icon */}
        <View
          className="mb-4 items-center justify-center rounded-full"
          style={{ width: 64, height: 64, backgroundColor: palette.surface }}
        >
          <MaterialCommunityIcons
            color={palette.tint}
            name="party-popper"
            size={36}
          />
        </View>

        {/* Title */}
        <Text
          className="text-center font-extrabold text-2xl"
          style={{ color: palette.text }}
        >
          You have successfully{"\n"}added the room!
        </Text>

        {/* Button */}
        <Pressable
          className="mt-6 rounded-full px-6 py-3"
          onPress={goHome}
          style={{ backgroundColor: palette.primaryButton }}
        >
          <Text className="font-semibold text-white">Finish</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
