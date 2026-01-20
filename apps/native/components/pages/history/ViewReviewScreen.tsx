// components/reviews/ReviewsView.tsx
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import { useMemo, useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

/* ---------- Theme (keep in sync with your app) ---------- */
const BRAND = { teal: "#2E6E87", accent: "#00A884", star: "#F59E0B" };
const BG = (d: boolean) => (d ? "#0B0F13" : "#FFFFFF");
const CARD = (d: boolean) => (d ? "#121A21" : "#FFFFFF");
const TEXT = (d: boolean) => (d ? "#E6EEF2" : "#111827");
const MUTED = (d: boolean) => (d ? "#9AA3B2" : "#6B7280");
const BORDER = (d: boolean) => (d ? "#1E2A34" : "#E5E7EB");
const INPUT_BG = (d: boolean) => (d ? "#0F161A" : "#FFFFFF");

/* ---------- Types ---------- */
export type ReviewItem = {
  id: string;
  name: string;
  date: string; // e.g., "January 2023"
  comment: string;
  rating: number; // 1..5
  avatarUrl?: string;
};

export type ReviewsViewProps = {
  title?: string;
  overallRating: number;
  totalReviews: number;
  reviews: ReviewItem[];
  /** Optional: precomputed histogram for 5..1 stars as proportions (length 5). If omitted it’s derived. */
  histogram?: number[];
  /** Optional: show a back button and call this when pressed */
  onBack?: () => void;
  /** Optional: external search callback; if omitted, component filters locally */
  onSearch?: (query: string) => void;
};

/* ---------- Internals ---------- */
const StarRow = ({
  rating,
  size = 16,
  color,
}: {
  rating: number;
  size?: number;
  color?: string;
}) => {
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.5;
  const empty = 5 - full - (hasHalf ? 1 : 0);
  return (
    <View className="flex-row items-center">
      {Array.from({ length: full }).map((_) => (
        <Ionicons
          color={color}
          key={`f-${Math.random()}`}
          name="star"
          size={size}
        />
      ))}
      {hasHalf && <Ionicons color={color} name="star-half" size={size} />}
      {Array.from({ length: empty }).map((_) => (
        <Ionicons
          color={color}
          key={`e-${Math.random()}`}
          name="star-outline"
          size={size}
        />
      ))}
    </View>
  );
};

const DistributionRow = ({
  pct,
  dark,
}: {
  pct: number; // 0..1
  dark: boolean;
}) => (
  <View
    style={{
      flex: 1,
      height: 8,
      borderRadius: 999,
      backgroundColor: dark ? "#23303A" : "#E5E7EB",
      overflow: "hidden",
      marginLeft: 8,
      marginBottom: 6,
    }}
  >
    <View
      style={{
        width: `${Math.max(2, Math.round((pct || 0) * 100))}%`,
        height: 8,
        borderRadius: 999,
        backgroundColor: TEXT(dark),
      }}
    />
  </View>
);

const ReviewCell = ({ item, dark }: { item: ReviewItem; dark: boolean }) => (
  <View style={{ paddingHorizontal: 16, backgroundColor: BG(dark) }}>
    <View
      style={{
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: BORDER(dark),
      }}
    >
      <View className="flex-row items-start justify-between">
        <View
          className="flex-row items-center"
          style={{ flex: 1, paddingRight: 8 }}
        >
          <Image
            source={{
              uri:
                item.avatarUrl ||
                "https://ui-avatars.com/api/?background=E5E7EB&color=111827&name=" +
                  encodeURIComponent(item.name || "User"),
            }}
            style={{ width: 44, height: 44, borderRadius: 22, marginRight: 12 }}
          />
          <View style={{ flex: 1 }}>
            <Text
              style={{ fontWeight: "700", color: TEXT(dark), fontSize: 16 }}
            >
              {item.name}
            </Text>
            <Text style={{ color: MUTED(dark), marginTop: 2, fontSize: 13 }}>
              {item.date}
            </Text>
          </View>
        </View>
        <StarRow color={BRAND.star} rating={item.rating} size={16} />
      </View>

      <Text style={{ color: TEXT(dark), marginTop: 12, lineHeight: 20 }}>
        {item.comment}
      </Text>
    </View>
  </View>
);

/* ---------- Main Component ---------- */
export default function ReviewsView({
  title = "Reviews",
  overallRating,
  totalReviews,
  reviews,
  histogram,
  onBack,
  onSearch,
}: ReviewsViewProps) {
  const { colorScheme } = useColorScheme();
  const dark = colorScheme === "dark";
  const [query, setQuery] = useState("");

  const derivedHistogram = useMemo(() => {
    if (histogram && histogram.length === 5) {
      return histogram;
    }
    const counts = [0, 0, 0, 0, 0]; // indexes 0..4 => 5,4,3,2,1 stars
    for (const r of reviews) {
      counts[5 - r.rating] += 1;
    }
    const total = reviews.length || 1;
    return counts.map((c) => c / total);
  }, [histogram, reviews]);

  const filtered = useMemo(() => {
    if (!query || onSearch) {
      return reviews;
    }
    const q = query.toLowerCase();
    return reviews.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.comment.toLowerCase().includes(q) ||
        r.date.toLowerCase().includes(q)
    );
  }, [reviews, query, onSearch]);

  const Header = (
    <View style={{ padding: 16, backgroundColor: BG(dark) }}>
      {/* Top bar */}
      <View className="flex-row items-center" style={{ marginBottom: 12 }}>
        {!!onBack && (
          <Pressable
            accessibilityLabel="Go back"
            accessibilityRole="button"
            hitSlop={12}
            onPress={onBack}
          >
            <Ionicons color={TEXT(dark)} name="chevron-back" size={26} />
          </Pressable>
        )}
        <Text
          style={{
            marginLeft: onBack ? 6 : 0,
            fontSize: 20,
            fontWeight: "700",
            color: TEXT(dark),
          }}
        >
          {title}
        </Text>
      </View>

      {/* Summary card */}
      <View
        style={{
          backgroundColor: CARD(dark),
          borderWidth: 1,
          borderColor: BORDER(dark),
          borderRadius: 16,
          padding: 16,
          marginBottom: 20,
        }}
      >
        <View className="flex-row">
          <View style={{ width: 120, paddingRight: 12 }}>
            <Text
              style={{ fontSize: 40, fontWeight: "800", color: TEXT(dark) }}
            >
              {overallRating.toFixed(1)}
            </Text>
            <Text style={{ color: MUTED(dark), marginTop: 2 }}>out of 5</Text>
          </View>

          <View style={{ flex: 1 }}>
            <Text
              style={{ color: TEXT(dark), fontWeight: "600", marginBottom: 8 }}
            >
              Overall Rating
            </Text>
            {[5, 4, 3, 2, 1].map((s, i) => (
              <View key={s} style={{ marginBottom: 2 }}>
                <View className="mb-1 flex-row items-center">
                  <StarRow color={TEXT(dark)} rating={s} size={12} />
                </View>
                <DistributionRow dark={dark} pct={derivedHistogram[i]} />
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Count */}
      <Text
        style={{
          fontSize: 22,
          fontWeight: "800",
          color: TEXT(dark),
          marginBottom: 12,
        }}
      >
        {totalReviews} Reviews
      </Text>

      {/* Search */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: INPUT_BG(dark),
          borderWidth: 1,
          borderColor: BORDER(dark),
          borderRadius: 999,
          paddingHorizontal: 14,
          height: 44,
          marginBottom: 8,
        }}
      >
        <Ionicons color={MUTED(dark)} name="search" size={18} />
        <TextInput
          onChangeText={(t) => {
            setQuery(t);
            onSearch?.(t);
          }}
          placeholder="Search reviews"
          placeholderTextColor={MUTED(dark)}
          style={{ flex: 1, marginLeft: 8, color: TEXT(dark), fontSize: 16 }}
          value={query}
        />
      </View>
    </View>
  );

  return (
    <FlatList
      data={filtered}
      keyExtractor={(r) => r.id}
      ListHeaderComponent={Header}
      renderItem={({ item }) => <ReviewCell dark={dark} item={item} />}
      showsVerticalScrollIndicator={false}
      style={{ backgroundColor: BG(dark) }}
    />
  );
}
