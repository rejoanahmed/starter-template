// app/merchant/roomManagement/newRoom/photos.tsx
/** biome-ignore-all lint/correctness/noNestedComponentDefinitions: r */

import { Colors } from "@app/constants/Colors";
import { roomDraftAtom } from "@app/lib/atoms/roomDraft";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useAtom } from "jotai";
import { useColorScheme } from "nativewind";
import { useState } from "react";
import {
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Picked = { uri: string; width: number; height: number; id: string };

export default function AddRoomPhotos() {
  const { colorScheme } = useColorScheme();
  const palette = Colors[colorScheme === "dark" ? "dark" : "light"];

  // Use Jotai atom
  const [draft, setDraft] = useAtom(roomDraftAtom);

  const [images, setImages] = useState<Picked[]>([]);
  const [coverId, setCoverId] = useState<string | null>(null);
  const [picking, setPicking] = useState(false);

  // Note: Photos are local URIs that don't persist across sessions
  // If you need to restore photos, implement photo persistence here

  const addImages = async () => {
    try {
      setPicking(true);

      // 1) Permissions
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert("Permission needed", "Please allow photo library access.");
        return;
      }

      // 2) Launch picker
      // Note: multiple selection isn’t supported on Android; this still works there (single file).
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.9,
        allowsMultipleSelection: Platform.OS !== "android",
        selectionLimit: Platform.OS !== "android" ? 10 : 1,
      });

      if (res.canceled || !res.assets || res.assets.length === 0) {
        console.log("Image pick canceled or no assets");
        return;
      }

      // 3) Normalize & (optionally) downscale
      const prepared: Picked[] = [];
      for (const a of res.assets) {
        try {
          const w = a.width ?? 0;
          const h = a.height ?? 0;
          const longest = Math.max(w, h);
          let outUri = a.uri;
          let outW = w;
          let outH = h;

          if (longest > 0 && longest > 1500) {
            const action =
              w >= h
                ? ({ resize: { width: 1500 } } as const)
                : ({ resize: { height: 1500 } } as const);
            const manip = await ImageManipulator.manipulateAsync(
              a.uri,
              [action],
              { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG }
            );
            outUri = manip.uri;
            outW = manip.width ?? w;
            outH = manip.height ?? h;
          }

          prepared.push({
            uri: outUri,
            width: outW || 0,
            height: outH || 0,
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          });
        } catch (e) {
          console.warn("Failed to process asset:", e);
        }
      }

      if (prepared.length === 0) {
        Alert.alert("Pick failed", "Could not process the selected images.");
        return;
      }

      setImages((prev) => {
        const next = [...prev, ...prepared];
        if (!coverId && next.length) {
          setCoverId(next[0].id);
        }
        return next;
      });
    } catch (e) {
      console.error("addImages error:", e);
      Alert.alert("Error", "Something went wrong while picking images.");
    } finally {
      setPicking(false);
    }
  };

  const removeOne = (id: string) => {
    setImages((prev) => {
      const next = prev.filter((x) => x.id !== id);
      if (coverId === id) {
        setCoverId(next[0]?.id ?? null);
      }
      return next;
    });
  };

  const setAsCover = (id: string) => setCoverId(id);

  const onBack = () => {
    // Just navigate back - data is in atom
    router.back();
  };

  const onSubmit = () => {
    if (images.length === 0) {
      Alert.alert("Add photos", "Please upload at least one photo.");
      return;
    }

    if (!coverId) {
      Alert.alert(
        "Select cover photo",
        "Please select a cover photo for your room."
      );
      return;
    }

    // Update atom with complete photo objects and coverId
    setDraft({
      ...draft,
      photos: images,
      coverId,
    });

    console.log("AddRoomPhotos - Saved to atom:", {
      photoCount: images.length,
      photos: images.map((p) => ({
        uri: p.uri,
        w: p.width,
        h: p.height,
        id: p.id,
      })),
      coverId,
    });

    router.push("/merchant/roomManagement/newRoom/addPolicy");
  };

  const CoverCard = () => {
    if (!coverId) {
      return null;
    }
    const cover = images.find((i) => i.id === coverId);
    if (!cover) {
      return null;
    }
    return (
      <View className="mt-3 items-center">
        <Pressable
          className="overflow-hidden rounded-3xl"
          onPress={addImages}
          style={{ width: 180, height: 180, backgroundColor: palette.surface }}
        >
          <Image
            source={{ uri: cover.uri }}
            style={{ width: 180, height: 180 }}
          />
        </Pressable>
        <Text className="mt-1 font-semibold" style={{ color: palette.text }}>
          Thumbnail
        </Text>
      </View>
    );
  };

  const Grid = () => {
    const others = images.filter((i) => i.id !== coverId);
    const cell = 130;
    return (
      <View className="mt-3 flex-row flex-wrap justify-between">
        {others.map((img) => (
          <View
            className="relative mb-3 overflow-hidden rounded-3xl"
            key={img.id}
            style={{
              width: cell,
              height: cell,
              backgroundColor: palette.surface,
            }}
          >
            <Pressable onPress={() => setAsCover(img.id)} style={{ flex: 1 }}>
              <Image
                source={{ uri: img.uri }}
                style={{ width: cell, height: cell }}
              />
            </Pressable>

            <Pressable
              className="-top-2 -right-2 absolute h-7 w-7 items-center justify-center rounded-full"
              hitSlop={6}
              onPress={() => removeOne(img.id)}
              style={{
                backgroundColor: "#E53935",
                borderWidth: 2,
                borderColor: palette.background,
              }}
            >
              <Ionicons color="#fff" name="remove" size={16} />
            </Pressable>
          </View>
        ))}

        <Pressable
          className="mb-3 items-center justify-center rounded-3xl border"
          disabled={picking}
          onPress={addImages}
          style={{
            width: cell,
            height: cell,
            borderColor: palette.border,
            backgroundColor: palette.surface,
            opacity: picking ? 0.6 : 1,
          }}
        >
          <Ionicons color={palette.text} name="add" size={28} />
          <Text className="mt-1" style={{ color: palette.text }}>
            Add more
          </Text>
        </Pressable>
      </View>
    );
  };

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: palette.background }}
    >
      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        <Text
          className="mt-2 font-extrabold text-2xl"
          style={{ color: palette.text }}
        >
          Add new room
        </Text>

        <Text className="mt-3 text-base" style={{ color: palette.text }}>
          Upload images
        </Text>

        <View
          className="mt-2 rounded-xl border p-3"
          style={{ borderColor: palette.border }}
        >
          <View className="flex-row justify-end">
            <Pressable hitSlop={8} onPress={onSubmit}>
              <Text style={{ color: palette.tint }}>Finish</Text>
            </Pressable>
          </View>

          {images.length > 0 ? (
            <CoverCard />
          ) : (
            <Pressable
              className="mt-3 items-center justify-center self-center rounded-3xl border"
              disabled={picking}
              onPress={addImages}
              style={{
                width: 180,
                height: 180,
                borderColor: palette.border,
                backgroundColor: palette.surface,
                opacity: picking ? 0.6 : 1,
              }}
            >
              <Ionicons color={palette.icon} name="image" size={28} />
              <Text className="mt-1" style={{ color: palette.icon }}>
                Pick a thumbnail
              </Text>
            </Pressable>
          )}

          <Grid />
        </View>

        <View className="mt-8 flex-row justify-between">
          <Pressable
            className="rounded-full border px-6 py-3"
            onPress={onBack}
            style={{ borderColor: palette.border }}
          >
            <Text className="text-base" style={{ color: palette.text }}>
              Back
            </Text>
          </Pressable>

          <Pressable
            className="rounded-full px-6 py-3"
            disabled={images.length === 0}
            onPress={onSubmit}
            style={{
              backgroundColor: palette.primaryButton,
              opacity: images.length === 0 ? 0.5 : 1,
            }}
          >
            <Text className="font-semibold text-base text-white">Next</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
