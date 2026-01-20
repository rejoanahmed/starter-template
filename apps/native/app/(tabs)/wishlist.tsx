// app/(tabs)/wishlist.tsx

import RoomCard from "@app/components/RoomCard";
import { ThemedText } from "@app/components/ThemedText";
import { useWishlist } from "@app/services/client/wishlists";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useMemo } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../constants/Colors";

export default function WishlistScreen() {
  const scheme = useColorScheme();
  const palette = scheme === "dark" ? Colors.dark : Colors.light;
  const { data: wishlist, isLoading, refetch } = useWishlist();

  const iconColor = palette.tint;

  const rooms = useMemo(() => {
    if (!wishlist) return [];
    return wishlist.map((item) => ({
      ...item.room,
      merchant: null,
      averageRating: undefined,
      reviewCount: 0,
      merchantId: "",
      latitude: null,
      longitude: null,
      minGuests: 1,
      createdAt: "",
      updatedAt: "",
      extraGuestFeeEnabled: false,
      pricingUnit: "per_hour" as const,
      minBookingMinutes: 60,
      bufferMinutes: 0,
      facilities: {},
      policies: [],
    }));
  }, [wishlist]);

  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.background }}>
      {/* Header */}
      <View
        style={[
          styles.header,
          { borderColor: palette.icon, backgroundColor: palette.background },
        ]}
      >
        <ThemedText className="font-extrabold text-3xl" type="title">
          Wishlists
        </ThemedText>

        <TouchableOpacity
          accessibilityLabel="Reload wishlists"
          accessibilityRole="button"
          onPress={onRefresh}
          style={[
            styles.iconBtn,
            {
              // light subtle chip vs dark subtle chip
              backgroundColor: palette.background,
              borderColor: palette.icon,
            },
          ]}
        >
          <Ionicons color={iconColor} name="refresh" size={20} />
        </TouchableOpacity>
      </View>

      {/* Rooms List */}
      {isLoading ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ActivityIndicator color={palette.tint} size="large" />
        </View>
      ) : rooms.length === 0 ? (
        <ScrollView
          contentContainerStyle={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 24,
          }}
          refreshControl={
            <RefreshControl
              colors={[palette.tint]}
              onRefresh={onRefresh}
              progressBackgroundColor={palette.background}
              refreshing={isLoading}
              tintColor={palette.tint}
            />
          }
          style={{ backgroundColor: palette.background }}
        >
          <ThemedText className="mb-2 text-center" type="subtitle">
            Your wishlist is empty
          </ThemedText>
          <ThemedText
            className="text-center text-sm"
            style={{ color: palette.muted }}
          >
            Start adding rooms you like to your wishlist
          </ThemedText>
        </ScrollView>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 16 }}
          refreshControl={
            <RefreshControl
              colors={[palette.tint]}
              onRefresh={onRefresh}
              progressBackgroundColor={palette.background}
              refreshing={isLoading}
              tintColor={palette.tint}
            />
          }
          style={{ backgroundColor: palette.background }}
        >
          {rooms.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconBtn: {
    padding: 8,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
