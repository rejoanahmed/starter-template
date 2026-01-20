// app/merchant/roomManagement/newRoom/addNewRoom.tsx

import { Colors } from "@app/constants/Colors";
import { roomDraftAtom } from "@app/lib/atoms/roomDraft";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  type LocationGeocodedAddress,
  reverseGeocodeAsync,
} from "expo-location";
import { router } from "expo-router";
import { useAtom } from "jotai";
import { useColorScheme } from "nativewind";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import MapView, {
  type MapPressEvent,
  Marker,
  type MarkerDragStartEndEvent,
  type Region,
} from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";

/* ---------------- Data ---------------- */
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

/* ---------------- Small, searchable district picker ---------------- */
function DistrictSelect({
  value,
  onChange,
  palette,
}: {
  value: string;
  onChange: (v: string) => void;
  palette: typeof Colors.light;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const list = useMemo(
    () =>
      HONG_KONG_DISTRICTS.filter((d) =>
        d.toLowerCase().includes(query.trim().toLowerCase())
      ),
    [query]
  );

  return (
    <>
      <Pressable
        accessibilityLabel="Choose district"
        accessibilityRole="button"
        className="flex-row items-center justify-between rounded-lg border px-4 py-3"
        hitSlop={6}
        onPress={() => setOpen(true)}
        style={{
          borderColor: palette.border,
          backgroundColor: palette.surface,
        }}
      >
        <Text
          className="text-base"
          style={{ color: value ? palette.text : palette.icon }}
        >
          {value || "Select a district"}
        </Text>
        <Ionicons color={palette.icon} name="chevron-down" size={18} />
      </Pressable>

      <Modal
        animationType="slide"
        onRequestClose={() => setOpen(false)}
        visible={open}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: palette.background }}>
          {/* header */}
          <View
            className="border-b px-4 py-3"
            style={{ borderColor: palette.border }}
          >
            <View className="flex-row items-center justify-between">
              <Text
                className="font-semibold text-lg"
                style={{ color: palette.text }}
              >
                Select district
              </Text>
              <Pressable hitSlop={8} onPress={() => setOpen(false)}>
                <Ionicons color={palette.text} name="close" size={22} />
              </Pressable>
            </View>
            <View
              className="mt-3 rounded-full border px-4 py-2"
              style={{
                borderColor: palette.border,
                backgroundColor: palette.surface,
              }}
            >
              <TextInput
                onChangeText={setQuery}
                placeholder="Search district…"
                placeholderTextColor={palette.icon}
                style={{ color: palette.text }}
                value={query}
              />
            </View>
          </View>

          <ScrollView className="px-2">
            {list.map((d) => (
              <Pressable
                className="mb-2 rounded-lg border px-3 py-3"
                key={d}
                onPress={() => {
                  onChange(d);
                  setOpen(false);
                  setQuery("");
                }}
                style={{
                  borderColor: d === value ? palette.tint : palette.border,
                  backgroundColor:
                    d === value
                      ? Platform.select({
                          ios: "rgba(149,198,226,0.14)",
                          default: "rgba(10,126,164,0.12)",
                        })
                      : palette.surface,
                }}
              >
                <Text
                  style={{
                    color: palette.text,
                    fontWeight: d === value ? ("700" as const) : "400",
                  }}
                >
                  {d}
                </Text>
              </Pressable>
            ))}
            {list.length === 0 && (
              <Text
                className="px-4 py-6 text-center"
                style={{ color: palette.icon }}
              >
                No matches
              </Text>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </>
  );
}

/* ---------------- Screen ---------------- */
export default function AddRoomStep1() {
  const { colorScheme } = useColorScheme();
  const palette = Colors[colorScheme === "dark" ? "dark" : "light"];

  // Use Jotai atom for global state management
  const [draft, setDraft] = useAtom(roomDraftAtom);

  // Local state for form fields (initialized from atom)
  const [name, setName] = useState(draft.name);
  const [description, setDescription] = useState(draft.description);
  const [address, setAddress] = useState(draft.address);
  const [district, setDistrict] = useState(draft.district);
  const [region, setRegion] = useState<Region>({
    latitude: draft.location?.latitude || 22.279_327_8,
    longitude: draft.location?.longitude || 114.162_813_1,
    latitudeDelta: 0.03,
    longitudeDelta: 0.03,
  });
  const [pin, setPin] = useState<{
    latitude: number;
    longitude: number;
  } | null>(draft.location);
  const [isGeocodingLoading, setIsGeocodingLoading] = useState(false);

  // Update local state when atom changes (e.g., coming back from next step)
  useEffect(() => {
    setName(draft.name);
    setDescription(draft.description);
    setAddress(draft.address);
    setDistrict(draft.district);
    if (draft.location) {
      setPin(draft.location);
      setRegion({
        latitude: draft.location.latitude,
        longitude: draft.location.longitude,
        latitudeDelta: 0.03,
        longitudeDelta: 0.03,
      });
    }
  }, [draft]);

  // Helper function to match address to Hong Kong district
  const matchDistrictFromAddress = useCallback(
    (addressComponents: LocationGeocodedAddress) => {
      const { district: addressDistrict, subregion, city } = addressComponents;
      const searchText =
        `${addressDistrict || ""} ${subregion || ""} ${city || ""}`.toLowerCase();

      // Try to find matching district
      const matched = HONG_KONG_DISTRICTS.find((d) =>
        searchText.includes(d.toLowerCase())
      );

      return matched || "";
    },
    []
  );

  // Reverse geocode coordinates to get address
  const reverseGeocode = useCallback(
    async (latitude: number, longitude: number) => {
      setIsGeocodingLoading(true);
      try {
        const result = await reverseGeocodeAsync({
          latitude,
          longitude,
        });

        if (result && result.length > 0) {
          const location = result[0];
          console.log("Reverse geocode result:", location);

          // Build address string
          const addressParts = [
            location.streetNumber,
            location.street,
            location.name,
          ].filter(Boolean);

          if (addressParts.length > 0) {
            setAddress(addressParts.join(", "));
          }

          // Try to match district
          const matchedDistrict = matchDistrictFromAddress(location);
          if (matchedDistrict) {
            setDistrict(matchedDistrict);
          }
        }
      } catch (error) {
        console.error("Reverse geocoding error:", error);
      } finally {
        setIsGeocodingLoading(false);
      }
    },
    [matchDistrictFromAddress]
  );

  const onMapPress = useCallback(
    (e: MapPressEvent) => {
      const { latitude, longitude } = e.nativeEvent.coordinate;
      setPin({ latitude, longitude });
      reverseGeocode(latitude, longitude);
    },
    [reverseGeocode]
  );

  const onMarkerDragEnd = useCallback(
    (e: MarkerDragStartEndEvent) => {
      const { latitude, longitude } = e.nativeEvent.coordinate;
      setPin({ latitude, longitude });
      reverseGeocode(latitude, longitude);
    },
    [reverseGeocode]
  );

  const canNext =
    name.trim().length >= 2 &&
    description.trim().length >= 10 &&
    address.trim().length >= 5 &&
    !!district &&
    !!pin;

  const goNext = () => {
    // Update the Jotai atom with current form data
    setDraft({
      ...draft,
      name,
      description,
      address,
      district,
      location: pin,
    });

    console.log("AddRoomStep1 - Saved to atom:", {
      name,
      description,
      address,
      district,
      location: pin,
    });

    // Navigate to next step without URL params
    router.push("/merchant/roomManagement/newRoom/facilities");
  };

  console.log(pin);

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: palette.background }}
    >
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: "padding" })}
        className="flex-1"
      >
        <ScrollView
          className="flex-1 px-4"
          contentContainerStyle={{ paddingBottom: 24 }}
        >
          {/* Top header with back button */}
          <View className="flex-row items-center gap-2 pt-1 pb-2">
            <Pressable
              accessibilityLabel="Go back"
              accessibilityRole="button"
              className="rounded-full p-1"
              hitSlop={10}
              onPress={() => router.back()}
              style={{
                backgroundColor:
                  colorScheme === "dark"
                    ? "rgba(255,255,255,0.06)"
                    : "rgba(0,0,0,0.04)",
              }}
            >
              <Ionicons color={palette.text} name="chevron-back" size={22} />
            </Pressable>
            <Text
              className="font-semibold text-lg"
              style={{ color: palette.text }}
            >
              Add new room
            </Text>
          </View>

          {/* (Keeps your original big title; remove if you prefer only header title) */}
          <Text
            className="mt-2 font-extrabold text-2xl"
            style={{ color: palette.text }}
          >
            Add new room
          </Text>

          {/* Room name */}
          <View
            className="mt-5 rounded-xl border p-3"
            style={{ borderColor: palette.border }}
          >
            <Text className="mb-2 text-base" style={{ color: palette.text }}>
              Room name
            </Text>
            <View
              className="rounded-lg border p-3"
              style={{ borderColor: palette.border }}
            >
              <TextInput
                autoCapitalize="words"
                className="text-base"
                onChangeText={setName}
                placeholder="Input room name"
                placeholderTextColor={palette.icon}
                returnKeyType="next"
                style={{ color: palette.text }}
                value={name}
              />
            </View>
          </View>

          {/* Description */}
          <View
            className="mt-5 rounded-xl border p-3"
            style={{ borderColor: palette.border }}
          >
            <Text className="mb-2 text-base" style={{ color: palette.text }}>
              Room description
            </Text>
            <View
              className="rounded-xl border p-3"
              style={{ borderColor: palette.border }}
            >
              <TextInput
                className="text-base"
                multiline
                onChangeText={setDescription}
                placeholder="Input room description"
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
              Street address
            </Text>
            <View
              className="rounded-lg border p-3"
              style={{ borderColor: palette.border }}
            >
              <TextInput
                autoCapitalize="words"
                className="text-base"
                onChangeText={setAddress}
                placeholder="Flat/Floor/Block, Street & number"
                placeholderTextColor={palette.icon}
                style={{ color: palette.text }}
                value={address}
              />
            </View>
          </View>

          {/* Compact district selector */}
          <View
            className="mt-5 rounded-xl border p-3"
            style={{ borderColor: palette.border }}
          >
            <Text className="mb-2 text-base" style={{ color: palette.text }}>
              District
            </Text>
            <DistrictSelect
              onChange={setDistrict}
              palette={palette}
              value={district}
            />
          </View>

          {/* Map picker */}
          <View
            className="mt-5 rounded-xl border p-3"
            style={{ borderColor: palette.border }}
          >
            <Text className="mb-2 text-base" style={{ color: palette.text }}>
              Pick location on map
            </Text>
            <View
              className="overflow-hidden rounded-xl border"
              style={{ borderColor: palette.border }}
            >
              <MapView
                initialRegion={region}
                onPress={onMapPress}
                onRegionChangeComplete={setRegion}
                style={{ width: "100%", height: 220 }}
              >
                {!!pin && (
                  <Marker
                    coordinate={pin}
                    draggable
                    onDragEnd={onMarkerDragEnd}
                  />
                )}
              </MapView>
              {!!isGeocodingLoading && (
                <View
                  className="absolute inset-0 items-center justify-center"
                  style={{ backgroundColor: "rgba(0,0,0,0.3)" }}
                >
                  <View
                    className="rounded-lg p-4"
                    style={{ backgroundColor: palette.surface }}
                  >
                    <ActivityIndicator color={palette.tint} size="small" />
                    <Text
                      className="mt-2 text-sm"
                      style={{ color: palette.text }}
                    >
                      Getting address...
                    </Text>
                  </View>
                </View>
              )}
            </View>
            <Text className="mt-2 text-xs" style={{ color: palette.icon }}>
              Tap to drop a pin. Address and district will be auto-filled.
            </Text>
          </View>

          {/* Footer */}
          <View className="mt-10 flex-row justify-between">
            <Pressable
              className="rounded-full border px-6 py-3"
              hitSlop={6}
              onPress={() => router.back()}
              style={{ borderColor: palette.border }}
            >
              <Text className="text-base" style={{ color: palette.text }}>
                Back
              </Text>
            </Pressable>

            <Pressable
              className="rounded-full px-6 py-3"
              disabled={!canNext}
              onPress={goNext}
              style={{
                backgroundColor: palette.primaryButton,
                opacity: canNext ? 1 : 0.5,
              }}
            >
              <Text className="font-semibold text-base text-white">Next</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
