// app/messages/index.tsx

import { ThemedText } from "@app/components/ThemedText";
import { Colors } from "@app/constants/Colors";
import { useConversations } from "@app/services/message/chat";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUser } from "../_layout";

type Filter = "all" | "unread";

/* ---------------- Helpers ---------------- */
const formatTimestamp = (isoString: string): string => {
  const date = new Date(isoString);
  const now = new Date();
  const start = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  ).getTime();
  const day = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  ).getTime();
  const diffDays = Math.round((start - day) / 86_400_000);

  if (diffDays === 0) {
    return date.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }
  if (diffDays === 1) {
    return "Yesterday";
  }
  if (diffDays === 2) {
    return "2 days ago";
  }
  return date.toLocaleDateString();
};

export default function MessagesScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const palette = Colors[scheme ?? "light"];
  const { userRole, user } = useUser();

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  // Fetch conversations from API
  const { data: conversationsData, isLoading, error } = useConversations();

  const allMessages = useMemo(() => {
    if (!conversationsData) return [];

    return conversationsData.map((conv) => ({
      id: conv.id,
      sender: conv.participantName,
      lastMessage: conv.lastMessage,
      timestamp: formatTimestamp(conv.lastMessageTime),
      avatar: conv.participantAvatar || undefined,
      unread: conv.isUnread,
      participantId: conv.participantId,
    }));
  }, [conversationsData]);

  const styles = useMemo(() => {
    const secondary = palette.muted ?? "#687076";
    const softStroke = palette.border;
    const softSurface = palette.surface;
    return {
      bg: { backgroundColor: palette.background },
      header: {
        borderBottomColor: palette.border,
        backgroundColor: palette.background,
      },
      title: { color: palette.text },

      optionsWrap: { paddingHorizontal: 20, paddingTop: 14, gap: 12 },

      searchBox: {
        flexDirection: "row" as const,
        alignItems: "center" as const,
        paddingHorizontal: 14,
        height: 40,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: softStroke,
        backgroundColor: softSurface,
      },
      searchIcon: { marginRight: 8, color: secondary },
      searchInput: { flex: 1, color: palette.text },

      chipsRow: {
        flexDirection: "row" as const,
        alignItems: "center" as const,
        justifyContent: "space-between" as const,
      },
      leftChips: { flexDirection: "row" as const, gap: 10 },

      chipBase: {
        paddingHorizontal: 14,
        height: 32,
        borderRadius: 16,
        borderWidth: 1,
        alignItems: "center" as const,
        justifyContent: "center" as const,
      },
      chipText: { fontSize: 12, fontWeight: "600" as const },

      chipAllActive: {
        backgroundColor: palette.text,
        borderColor: palette.text,
      },
      chipAllInactive: {
        backgroundColor: softSurface,
        borderColor: softStroke,
      },

      templateBtn: {
        flexDirection: "row" as const,
        alignItems: "center" as const,
        gap: 6,
        paddingHorizontal: 12,
        height: 32,
        borderRadius: 16,
        backgroundColor: "#E67A7A",
      },
      templateText: { color: "#fff", fontSize: 12, fontWeight: "700" as const },

      listContent: { padding: 16 },
      card: {
        backgroundColor: palette.surface,
        borderColor: palette.border,
        borderWidth: 1,
        shadowColor: "#000",
        shadowOpacity: scheme === "dark" ? 0.12 : 0.06,
        shadowRadius: 6,
        elevation: 2,
      } as const,
      sender: { color: palette.text },
      previewUnread: { color: palette.text, fontWeight: "600" as const },
      previewRead: { color: secondary, fontWeight: "400" as const },
      time: { color: secondary },
      divider: { height: 10 },
      initialsWrap: {
        backgroundColor: palette.state?.hover ?? "rgba(0,0,0,0.06)",
      },
      initialsText: { color: palette.tint },
    };
  }, [palette, scheme]);

  const data = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allMessages
      .filter((m) => (filter === "unread" ? m.unread : true))
      .filter((m) =>
        q
          ? m.sender.toLowerCase().includes(q) ||
            m.lastMessage.toLowerCase().includes(q)
          : true
      );
  }, [query, filter, allMessages]);

  return (
    <SafeAreaView className="flex-1" style={styles.bg}>
      {/* Header */}
      <View className="border-b px-5 pt-4 pb-2" style={styles.header}>
        <ThemedText
          className="font-extrabold text-3xl"
          style={styles.title}
          type="title"
        >
          Messages
        </ThemedText>
      </View>

      {/* Options Bar */}
      <View className="mb-2" style={styles.optionsWrap}>
        {/* Search */}
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} style={styles.searchIcon} />
          <TextInput
            onChangeText={setQuery}
            placeholder="Search"
            placeholderTextColor={palette.muted ?? "#9BA1A6"}
            returnKeyType="search"
            style={styles.searchInput}
            value={query}
          />
        </View>

        {/* Chips + (merchant-only) Chat Template */}
        <View style={styles.chipsRow}>
          <View style={styles.leftChips}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => setFilter("all")}
              style={[
                styles.chipBase,
                filter === "all"
                  ? styles.chipAllActive
                  : styles.chipAllInactive,
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  {
                    color: filter === "all" ? palette.background : palette.text,
                  },
                ]}
              >
                All
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => setFilter("unread")}
              style={[
                styles.chipBase,
                filter === "unread"
                  ? styles.chipAllActive
                  : styles.chipAllInactive,
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  {
                    color:
                      filter === "unread" ? palette.background : palette.text,
                  },
                ]}
              >
                Unread
              </Text>
            </TouchableOpacity>
          </View>

          {userRole === "merchant" && (
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => {
                if (!user?.id) {
                  Alert.alert(
                    "Not signed in",
                    "Please sign in to use templates."
                  );
                  return;
                }
                router.push("/messages/template");
              }}
              style={styles.templateBtn}
            >
              <Ionicons color="#fff" name="chatbubbles-outline" size={16} />
              <Text style={styles.templateText}>Chat Template</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Messages */}
      <FlatList
        className="mb-10"
        contentContainerStyle={styles.listContent}
        data={data}
        ItemSeparatorComponent={() => <View style={styles.divider} />}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View className="mt-40 flex-1 items-center justify-center">
            {isLoading ? (
              <ActivityIndicator color={palette.tint} size="large" />
            ) : error ? (
              <>
                <Ionicons
                  color={palette.muted ?? palette.icon}
                  name="alert-circle-outline"
                  size={48}
                />
                <ThemedText
                  className="mt-3"
                  style={{ color: palette.text }}
                  type="subtitle"
                >
                  Failed to load messages
                </ThemedText>
                <ThemedText className="mt-1" style={{ color: palette.muted }}>
                  {error instanceof Error ? error.message : "Unknown error"}
                </ThemedText>
              </>
            ) : (
              <>
                <Ionicons
                  color={palette.muted ?? palette.icon}
                  name="chatbubble-outline"
                  size={48}
                />
                <ThemedText
                  className="mt-3"
                  style={{ color: palette.text }}
                  type="subtitle"
                >
                  No messages yet
                </ThemedText>
                <ThemedText className="mt-1" style={{ color: palette.muted }}>
                  Start chatting with your hosts!
                </ThemedText>
              </>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.9}
            className="flex-row items-center rounded-2xl p-4"
            onPress={() =>
              router.push({
                pathname: "/messages/[id]",
                params: {
                  id: item.id,
                  name: item.sender,
                  avatar: item.avatar ?? "",
                  participantId: item.participantId,
                },
              })
            }
            style={styles.card}
          >
            {/* Avatar / Initials */}
            {item.avatar ? (
              <Image
                className="mr-4 h-14 w-14 rounded-full"
                source={{ uri: item.avatar }}
              />
            ) : (
              <View
                className="mr-4 h-14 w-14 items-center justify-center rounded-full"
                style={styles.initialsWrap}
              >
                <Text className="font-bold text-lg" style={styles.initialsText}>
                  {item.sender.charAt(0)}
                </Text>
              </View>
            )}

            {/* Message info */}
            <View className="flex-1">
              <Text className="font-semibold text-base" style={styles.sender}>
                {item.sender}
              </Text>
              <Text
                className="mt-1 text-sm"
                numberOfLines={1}
                style={item.unread ? styles.previewUnread : styles.previewRead}
              >
                {item.lastMessage}
              </Text>
            </View>

            {/* Time + unread indicator */}
            <View className="items-end">
              <Text className="mb-1 text-xs" style={styles.time}>
                {item.timestamp}
              </Text>
              {item.unread && (
                <Ionicons color={palette.tint} name="ellipse" size={10} />
              )}
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}
