import { Colors } from "@app/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import { memo, useMemo } from "react";
import { Image, Pressable, Text, View } from "react-native";

/* ---------- Types ---------- */
export type Booking = {
  id: string;
  roomName: string;
  image: string;
  start: string; // ISO
  end: string; // ISO
  people?: number;
  hostId?: string | number;
  finished: boolean;
};

type Props = {
  item: Booking;
  onPressOpen: () => void;
  onPressMessage?: () => void;
  onPressReview?: () => void;
};

/* ---------- Utils (robust) ---------- */
const normalizeHex = (hex: string) => {
  if (!hex) {
    return "#000000";
  }
  const h = hex.trim().toLowerCase();
  if (/^#([0-9a-f]{8})$/.test(h)) {
    return h.slice(0, 7);
  }
  if (/^#([0-9a-f]{3})$/.test(h)) {
    const r = h[1],
      g = h[2],
      b = h[3];
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  if (/^#([0-9a-f]{6})$/.test(h)) {
    return h;
  }
  return "#000000";
};

const withAlpha = (hex: string, alpha: number) => {
  const base = normalizeHex(hex);
  const a = Math.round(Math.min(1, Math.max(0, alpha)) * 255);
  const aa = a.toString(16).padStart(2, "0");
  return `${base}${aa}`;
};

const cleanUri = (u?: string | { uri?: string } | null) => {
  // Handle different input types
  let uriString: string;
  if (typeof u === "string") {
    uriString = u;
  } else if (
    u &&
    typeof u === "object" &&
    "uri" in u &&
    typeof u.uri === "string"
  ) {
    uriString = u.uri;
  } else {
    uriString = "";
  }

  // Ensure it's a string and trim it
  const cleaned = String(uriString || "").trim();
  return { uri: cleaned ? encodeURI(cleaned) : "" } as const;
};
export const fmtTime = (d: Date) =>
  d.toLocaleString(undefined, {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
export const fmtDay = (d: Date) =>
  d.toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

/* ---------- Chip ---------- */
function StatusChip({
  label,
  variant,
}: {
  label: string;
  variant: "upcoming" | "past";
}) {
  const { colorScheme } = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const dark = colorScheme === "dark";
  const uWhite = "#ffffff";

  const bg =
    variant === "upcoming"
      ? dark
        ? withAlpha(uWhite, 0.1)
        : withAlpha(theme.tint, 0.18)
      : withAlpha(theme.icon, 0.22);

  const border =
    variant === "upcoming"
      ? dark
        ? withAlpha(uWhite, 0.22)
        : withAlpha(theme.tint, 0.35)
      : withAlpha(theme.icon, 0.35);

  return (
    <View
      style={{
        backgroundColor: bg,
        paddingHorizontal: 10,
        height: 24,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: border,
      }}
    >
      <Text style={{ color: theme.text, fontSize: 12, fontWeight: "600" }}>
        {label}
      </Text>
    </View>
  );
}

/* ---------- Card ---------- */
function BookingCardBase({
  item,
  onPressOpen,
  onPressMessage,
  onPressReview,
}: Props) {
  const { colorScheme } = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const dark = colorScheme === "dark";
  const uWhite = "#ffffff";

  const start = useMemo(() => new Date(item.start), [item.start]);
  const end = useMemo(() => new Date(item.end), [item.end]);
  const isUpcoming = !item.finished;

  // 🎯 New: distinct upcoming-surface for dark mode (richer than a white overlay)
  // Keeps the app's teal system intact, but avoids the "washed" look at #fff overlays.
  const UPCOMING_DARK_SURFACE = "#09233a"; // slightly lifted from base dark bg
  const cardBg = isUpcoming
    ? dark
      ? UPCOMING_DARK_SURFACE
      : withAlpha(theme.tint, 0.2)
    : dark
      ? withAlpha(theme.icon, 0.18)
      : withAlpha(theme.icon, 0.1);

  const cardBorder = isUpcoming
    ? dark
      ? withAlpha(uWhite, 0.16) // subtle, crisp edge in dark
      : withAlpha(theme.tint, 0.55)
    : withAlpha(theme.icon, 0.35);

  const titleColor = theme.text;
  const metaColor = theme.icon;

  const primaryBtnBg = isUpcoming
    ? dark
      ? withAlpha(uWhite, 0.12)
      : theme.tint
    : withAlpha(theme.text, dark ? 0.16 : 0.1);

  const primaryBtnBorder = isUpcoming
    ? dark
      ? withAlpha(uWhite, 0.28)
      : withAlpha(theme.tint, 0.7)
    : withAlpha(theme.icon, 0.4);

  const primaryText =
    isUpcoming && dark
      ? theme.text
      : isUpcoming
        ? Colors.dark.background
        : theme.text;

  const outlineBorder = isUpcoming
    ? dark
      ? withAlpha(uWhite, 0.28)
      : withAlpha(theme.tint, 0.45)
    : withAlpha(theme.icon, 0.4);

  const outlineIcon = theme.text;

  return (
    <View
      accessibilityLabel={`${item.roomName} ${isUpcoming ? "upcoming" : "past"} booking`}
      accessible
      className="mx-4 my-3 overflow-hidden rounded-2xl"
      style={{
        backgroundColor: cardBg,
        borderColor: cardBorder,
        borderWidth: 1,
        shadowColor: "#000",
        shadowOpacity: dark ? 0.22 : 0.1,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
        elevation: 2,
      }}
    >
      <Image
        resizeMode="cover"
        source={cleanUri(item.image)}
        style={{ width: "100%", height: 150 }}
      />

      <View className="px-4 pb-4">
        <View className="mt-3 flex-row items-start justify-between">
          <Text
            className="mr-2 flex-1 font-semibold text-base"
            numberOfLines={1}
            style={{ color: titleColor }}
          >
            {item.roomName}
          </Text>
          <StatusChip
            label={item.finished ? "Finished" : "Upcoming"}
            variant={isUpcoming ? "upcoming" : "past"}
          />
        </View>

        <View className="mt-2 flex-row items-center">
          <Ionicons color={metaColor} name="calendar-outline" size={16} />
          <Text
            className="ml-2 flex-1"
            numberOfLines={1}
            style={{ color: metaColor }}
          >
            {fmtDay(start)} • {fmtTime(start)} – {fmtTime(end)}
          </Text>
        </View>

        {!!item.people && (
          <View className="mt-1 flex-row items-center">
            <Ionicons color={metaColor} name="people-outline" size={16} />
            <Text className="ml-2" style={{ color: metaColor }}>
              {item.people} {item.people === 1 ? "person" : "people"}
            </Text>
          </View>
        )}

        {/* Actions */}
        <View className="mt-4 flex-row" style={{ columnGap: 12 }}>
          <Pressable
            accessibilityLabel="Open booking details"
            accessibilityRole="button"
            className="h-11 flex-1 items-center justify-center rounded-xl"
            onPress={onPressOpen}
            style={{
              backgroundColor: primaryBtnBg,
              borderWidth: 1,
              borderColor: primaryBtnBorder,
            }}
          >
            <Text className="font-semibold" style={{ color: primaryText }}>
              {item.finished ? "View Details" : "Open Details / QR"}
            </Text>
          </Pressable>

          {onPressMessage && (
            <Pressable
              accessibilityLabel="Message host"
              accessibilityRole="button"
              className="h-11 w-[52px] items-center justify-center rounded-xl"
              hitSlop={10}
              onPress={onPressMessage}
              style={{
                backgroundColor: "transparent",
                borderColor: outlineBorder,
                borderWidth: 1,
              }}
            >
              <Ionicons
                color={outlineIcon}
                name="chatbubble-ellipses-outline"
                size={18}
              />
            </Pressable>
          )}
        </View>

        {item.finished && onPressReview && (
          <Pressable
            className="mt-3 self-end"
            hitSlop={10}
            onPress={onPressReview}
          >
            <Text className="font-medium" style={{ color: theme.text }}>
              Leave a review
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

export const BookingCard = memo(BookingCardBase);
export default BookingCard;
