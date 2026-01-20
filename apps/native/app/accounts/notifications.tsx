import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  RefreshControl,
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../constants/Colors";

/* ----------------------------- Types & Data ----------------------------- */
type NotificationType = "booking" | "refund" | "system";

type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  createdAt: string; // ISO string
  image?: string;
  read: boolean;
};

const seed: Notification[] = [
  {
    id: "n1",
    type: "refund",
    title: "Deposit returned",
    description: "Your deposit for booking ABC Room has been returned.",
    createdAt: new Date().toISOString(),
    image:
      "https://images.unsplash.com/photo-1603415526960-f7e0328c63b1?q=80&w=200&auto=format&fit=crop",
    read: false,
  },
  {
    id: "n2",
    type: "booking",
    title: "Your booking starts soon",
    description: "ABC Room starts today at 10:00 PM.",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    image:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop",
    read: false,
  },
  {
    id: "n3",
    type: "booking",
    title: "Booking confirmed",
    description: "Your booking for ABC Room is confirmed.",
    createdAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop",
    read: true,
  },
  {
    id: "n4",
    type: "system",
    title: "Account security tip",
    description: "Enable 2-factor authentication to protect your account.",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    read: true,
  },
  {
    id: "n5",
    type: "booking",
    title: "Booking canceled",
    description: "Your booking for ABC Room was canceled successfully.",
    createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    image:
      "https://images.unsplash.com/photo-1516387938699-a93567ec168e?q=80&w=200&auto=format&fit=crop",
    read: true,
  },
];

/* ----------------------------- Utils ----------------------------------- */
const relTime = (iso: string) => {
  const now = Date.now();
  const t = new Date(iso).getTime();
  const diff = Math.max(1, Math.floor((now - t) / 1000));
  if (diff < 60) {
    return `${diff}s ago`;
  }
  const m = Math.floor(diff / 60);
  if (m < 60) {
    return `${m}m ago`;
  }
  const h = Math.floor(m / 60);
  if (h < 24) {
    return `${h}h ago`;
  }
  const d = Math.floor(h / 24);
  if (d < 7) {
    return `${d}d ago`;
  }
  const date = new Date(iso);
  return date.toLocaleDateString();
};

const dayBucket = (d: Date) => {
  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  ).getTime();
  const t = d.getTime();
  if (t >= startOfToday) {
    return "Today";
  }
  if (t >= startOfToday - 6 * 24 * 60 * 60 * 1000) {
    return "This Week";
  }
  return "Earlier";
};

const iconForType = (type: NotificationType) => {
  switch (type) {
    case "booking":
      return "calendar-outline";
    case "refund":
      return "cash-outline";
    default:
      return "information-circle-outline";
  }
};

/* ----------------------------- Component -------------------------------- */
export default function NotificationsScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const palette = scheme === "dark" ? Colors.dark : Colors.light;

  const [items, setItems] = useState<Notification[]>(seed);
  const [refreshing, setRefreshing] = useState(false);

  const sections = useMemo(() => {
    const groups: Record<string, Notification[]> = {};
    for (const n of items) {
      const bucket = dayBucket(new Date(n.createdAt));
      if (!groups[bucket]) {
        groups[bucket] = [];
      }
      groups[bucket].push(n);
    }
    return Object.entries(groups)
      .map(([title, data]) => ({
        title,
        data: data.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ),
      }))
      .sort((a, b) => {
        const order = ["Today", "This Week", "Earlier"];
        return order.indexOf(a.title) - order.indexOf(b.title);
      });
  }, [items]);

  const markAllRead = useCallback(() => {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearAll = useCallback(() => {
    Alert.alert("Clear all notifications?", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      { text: "Clear", style: "destructive", onPress: () => setItems([]) },
    ]);
  }, []);

  const toggleRead = useCallback((id: string) => {
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    );
  }, []);

  const removeOne = useCallback((id: string) => {
    setItems((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate fetch
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  /* ----------------------------- Renderers ----------------------------- */
  const HeaderBar = () => (
    <View
      className="flex-row items-center justify-between border-b px-5 pt-3 pb-3"
      style={{ borderColor: palette.icon }}
    >
      <View className="flex-row items-center">
        <Pressable
          accessibilityLabel="Go back"
          accessibilityRole="button"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          onPress={() => router.back()}
          style={{ marginRight: 10 }}
        >
          <Ionicons color={palette.icon} name="chevron-back" size={24} />
        </Pressable>
        <Text
          className="font-extrabold text-2xl"
          style={{ color: palette.text }}
        >
          Notifications
        </Text>
      </View>

      <View className="flex-row items-center">
        <Pressable
          accessibilityLabel="Mark all as read"
          accessibilityRole="button"
          onPress={markAllRead}
          style={{ marginRight: 14 }}
        >
          <Text className="underline" style={{ color: palette.tint }}>
            Mark all read
          </Text>
        </Pressable>
        <Pressable
          accessibilityLabel="Clear all notifications"
          accessibilityRole="button"
          onPress={clearAll}
        >
          <Ionicons color={palette.icon} name="trash-outline" size={22} />
        </Pressable>
      </View>
    </View>
  );

  const SectionHeader = ({ title }: { title: string }) => (
    <View className="px-5 py-2">
      <Text
        className="font-semibold text-xs uppercase"
        style={{ color: palette.icon }}
      >
        {title}
      </Text>
    </View>
  );

  /** Left action (revealed when swiping RIGHT) */
  const LeftDeleteAction = ({ onDelete }: { onDelete: () => void }) => (
    <View
      style={[
        styles.leftActionContainer,
        { backgroundColor: "rgba(255, 59, 48, 0.15)" }, // subtle red hint; not theme-critical
      ]}
    >
      <Pressable
        accessibilityLabel="Delete notification"
        accessibilityRole="button"
        onPress={onDelete}
        style={styles.actionPill}
      >
        <Ionicons color={"#FF3B30"} name="trash-outline" size={18} />
        <Text style={styles.actionText}>Delete</Text>
      </Pressable>
    </View>
  );

  const Item = ({ n }: { n: Notification }) => {
    const icon = iconForType(n.type);
    const swipeableRef = useRef<Swipeable | null>(null);

    const handleDelete = () => {
      swipeableRef.current?.close();
      removeOne(n.id);
    };

    return (
      <Swipeable
        onSwipeableOpen={(_direction) => {
          // If you want auto-delete on full swipe right, uncomment next 2 lines:
          // if (direction === 'left') {
          //   handleDelete()
          // }
        }}
        overshootLeft={false}
        ref={swipeableRef}
        renderLeftActions={() => <LeftDeleteAction onDelete={handleDelete} />}
      >
        <Pressable
          android_ripple={{ color: palette.icon }}
          className="px-5 py-3"
          onLongPress={() =>
            Alert.alert(n.title, undefined, [
              {
                text: n.read ? "Mark as unread" : "Mark as read",
                onPress: () => toggleRead(n.id),
              },
              {
                text: "Delete",
                style: "destructive",
                onPress: () => handleDelete(),
              },
              { text: "Cancel", style: "cancel" },
            ])
          }
          onPress={() => toggleRead(n.id)}
        >
          {/* Card */}
          <View
            style={[
              styles.card,
              styles.cardShadow,
              {
                backgroundColor: palette.background,
                borderColor: palette.icon,
              },
            ]}
          >
            <View className="flex-row">
              {/* Leading icon / image */}
              <View
                className="mr-3 h-11 w-11 items-center justify-center rounded-xl"
                style={[
                  styles.innerThumb,
                  {
                    borderColor: palette.icon,
                    backgroundColor: palette.background,
                  },
                ]}
              >
                {n.image ? (
                  <Image
                    className="h-11 w-11 rounded-xl"
                    resizeMode="cover"
                    source={{ uri: n.image }}
                  />
                ) : (
                  <Ionicons color={palette.icon} name={icon as any} size={20} />
                )}
              </View>

              {/* Texts */}
              <View className="flex-1">
                <View className="flex-row items-center justify-between">
                  <Text
                    className={`text-base ${n.read ? "" : "font-semibold"}`}
                    numberOfLines={1}
                    style={{ color: palette.text }}
                  >
                    {n.title}
                  </Text>

                  <View className="ml-2 flex-row items-center">
                    {!n.read && (
                      <View
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: palette.tint,
                          marginRight: 8,
                        }}
                      />
                    )}
                    <Text className="text-xs" style={{ color: palette.icon }}>
                      {relTime(n.createdAt)}
                    </Text>
                  </View>
                </View>

                <Text
                  className="mt-1 text-sm"
                  numberOfLines={2}
                  style={{ color: palette.icon }}
                >
                  {n.description}
                </Text>

                {/* Quick row actions */}
                <View className="mt-2 flex-row">
                  <TouchableOpacity
                    accessibilityLabel={
                      n.read ? "Mark as unread" : "Mark as read"
                    }
                    accessibilityRole="button"
                    onPress={() => toggleRead(n.id)}
                    style={{ marginRight: 14 }}
                  >
                    <Text className="underline" style={{ color: palette.tint }}>
                      {n.read ? "Mark as unread" : "Mark as read"}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    accessibilityLabel="Delete notification"
                    accessibilityRole="button"
                    onPress={handleDelete}
                  >
                    <Text className="underline" style={{ color: palette.icon }}>
                      Delete
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </Pressable>
      </Swipeable>
    );
  };

  const Empty = () => (
    <View
      className="flex-1 items-center justify-center"
      style={{ paddingTop: 96 }}
    >
      <Ionicons color={palette.icon} name="notifications-off" size={48} />
      <Text
        className="mt-3 font-semibold text-lg"
        style={{ color: palette.text }}
      >
        You’re all caught up
      </Text>
      <Text className="mt-1 text-sm" style={{ color: palette.icon }}>
        New notifications will appear here.
      </Text>
    </View>
  );

  /* ----------------------------- Render ------------------------------- */
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.background }}>
      <HeaderBar />

      <SectionList
        contentContainerStyle={{ paddingBottom: 24, paddingTop: 6 }}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Empty />}
        refreshControl={
          <RefreshControl
            onRefresh={onRefresh}
            refreshing={refreshing}
            tintColor={palette.tint}
          />
        }
        renderItem={({ item }) => <Item n={item} />}
        renderSectionHeader={({ section }) => (
          <SectionHeader title={section.title} />
        )}
        sections={sections}
        stickySectionHeadersEnabled
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  /** Card visuals */
  card: {
    borderRadius: 16,
    padding: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  cardShadow: {
    // subtle, production-like elevation
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  innerThumb: {
    borderWidth: StyleSheet.hairlineWidth,
  },
  /** Swipe left action container (revealed on swipe RIGHT) */
  leftActionContainer: {
    justifyContent: "center",
    alignItems: "flex-start",
    paddingLeft: 16,
    marginVertical: 6,
    borderRadius: 16,
    flex: 1,
  },
  actionPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  actionText: {
    marginLeft: 6,
    fontWeight: "600",
    color: "#FF3B30",
  },
});
