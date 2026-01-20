import RoomCard from "@app/components/RoomCard";
import { IconSymbol } from "@app/components/ui/IconSymbol";
import { Colors } from "@app/constants/Colors";
import { useRooms } from "@app/services/client/rooms";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  Animated,
  Pressable,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function ClientHomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? "light"];

  // theme tokens
  const bg = palette.background;
  const text = palette.text;
  const icon = palette.icon;
  const surface = palette.surface ?? bg;
  const border = palette.border ?? "rgba(0,0,0,0.12)";

  // Animation
  const scrollY = useRef(new Animated.Value(0)).current;

  // Fallback min height in case layout hasn't fired yet
  const FALLBACK_HEADER_MIN = insets.top + 160;
  const [headerHeight, setHeaderHeight] = useState<number>(FALLBACK_HEADER_MIN);

  const handleSearchPress = () => {
    router.push("/search");
  };

  const handleCategoryPress = (category: string) => {
    console.log(`Selected category: ${category}`);
  };

  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, headerHeight],
    outputRange: [0, -headerHeight],
    extrapolate: "clamp",
  });

  const isDark = colorScheme === "dark";
  const CAT: Record<
    "mahjong" | "party" | "band",
    { icon: string; bg: string; ring: string }
  > = {
    mahjong: {
      icon: "#22C55E", // emerald
      bg: isDark ? "rgba(34,197,94,0.16)" : "rgba(34,197,94,0.10)",
      ring: isDark ? "rgba(34,197,94,0.35)" : "rgba(34,197,94,0.25)",
    },
    party: {
      icon: "#A855F7", // violet
      bg: isDark ? "rgba(168,85,247,0.16)" : "rgba(168,85,247,0.10)",
      ring: isDark ? "rgba(168,85,247,0.35)" : "rgba(168,85,247,0.25)",
    },
    band: {
      icon: "#F59E0B", // amber
      bg: isDark ? "rgba(245,158,11,0.16)" : "rgba(245,158,11,0.10)",
      ring: isDark ? "rgba(245,158,11,0.35)" : "rgba(245,158,11,0.25)",
    },
  };

  return (
    <View className="flex-1" style={{ backgroundColor: bg }}>
      {/* Sticky / Collapsible Header */}
      <Animated.View
        onLayout={(e) => {
          const h = e.nativeEvent.layout.height;
          if (h && h !== headerHeight) {
            setHeaderHeight(h);
          }
        }}
        style={{
          transform: [{ translateY: headerTranslateY }],
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          backgroundColor: bg,
          paddingTop: insets.top + 20,
          paddingHorizontal: 16,
          elevation: 4,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          borderBottomWidth: 1,
          borderBottomColor: border,
        }}
      >
        {/* Search Bar */}
        <Pressable
          className="mb-4 flex-row items-center rounded-full px-4 py-3"
          onPress={handleSearchPress}
          style={{
            backgroundColor: surface,
            borderWidth: 1,
            borderColor: border,
          }}
        >
          <IconSymbol color={icon} name="magnifyingglass" size={20} />
          <Text className="ml-2 text-base" style={{ color: icon }}>
            Search
          </Text>
        </Pressable>

        {/* Room Categories */}
        {/* Room Categories (drop-in replacement) */}
        <View className="mb-4 flex-row justify-around px-2">
          {(["mahjong", "party", "band"] as const).map((cat) => {
            const c = CAT[cat];
            return (
              <TouchableOpacity
                className="w-[100px] items-center"
                key={cat}
                onPress={() => handleCategoryPress(cat)}
              >
                <View
                  className="mb-2 h-16 w-16 items-center justify-center rounded-2xl"
                  style={{
                    backgroundColor: c.bg, // tinted chip
                    borderWidth: 1,
                    borderColor: c.ring, // soft ring
                    shadowColor: "#000",
                    shadowOpacity: isDark ? 0.25 : 0.12,
                    shadowRadius: 8,
                    shadowOffset: { width: 0, height: 2 },
                    elevation: 3,
                  }}
                >
                  <IconSymbol
                    color={c.icon}
                    name={
                      cat === "mahjong"
                        ? "table.furniture"
                        : cat === "party"
                          ? "party.popper"
                          : "music.note"
                    }
                    size={28} // colorful icon
                  />
                </View>

                <Text
                  className="text-center font-medium text-sm"
                  style={{ color: c.icon }}
                >
                  {cat === "mahjong"
                    ? "Mahjong"
                    : cat === "party"
                      ? "Party Room"
                      : "Band Room"}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </Animated.View>

      {/* Scrollable Content */}
      <Animated.ScrollView
        className="flex-1"
        contentContainerStyle={{
          // Make sure the first content starts *below* the measured header
          paddingTop: headerHeight + 10,
          paddingBottom: Math.max(insets.bottom, 20) + 60,
        }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {/* Recommendation Section */}
        <RecommendationSection textColor={text} />
      </Animated.ScrollView>
    </View>
  );
}

/**
 * Recommendation Section Component
 * Fetches and displays recommended rooms from the backend
 */
function RecommendationSection({ textColor }: { textColor: string }) {
  // Fetch top-rated rooms as recommendations
  const { data, isLoading } = useRooms({
    sortBy: "rating_desc",
    limit: 5,
  });

  if (isLoading) {
    return (
      <View className="px-4 py-8">
        <Text className="mb-4 font-bold text-2xl" style={{ color: textColor }}>
          Recommendation
        </Text>
        <Text style={{ color: textColor, opacity: 0.6 }}>Loading...</Text>
      </View>
    );
  }

  const rooms = data?.rooms || [];

  return (
    <View className="px-4">
      <Text className="mb-4 font-bold text-2xl" style={{ color: textColor }}>
        Recommendation
      </Text>

      {rooms.length > 0 ? (
        rooms.map((room) => <RoomCard key={room.id} room={room} />)
      ) : (
        <Text style={{ color: textColor, opacity: 0.6 }}>
          No recommendations available
        </Text>
      )}
    </View>
  );
}
