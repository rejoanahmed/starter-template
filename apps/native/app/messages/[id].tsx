// app/messages/[id].tsx

import ChatScreen, {
  type Message as Msg,
} from "@app/components/pages/messages/ChatScreen";
import { sendMessageApi, useChatMessages } from "@app/services/message/chat";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { ActivityIndicator, Alert, View } from "react-native";

/* ---------- Helper functions ---------- */
function hhmm(d: Date) {
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

function dayLabel(d: Date) {
  const today = new Date();
  const t = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const dd = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.round((t.getTime() - dd.getTime()) / 86_400_000);
  if (diffDays === 0) {
    return "Today";
  }
  if (diffDays === 1) {
    return "Yesterday";
  }
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function ChatRoute() {
  const params = useLocalSearchParams<{
    id?: string;
    name?: string;
    avatar?: string;
    participantId?: string;
  }>();

  const queryClient = useQueryClient();

  // Extract params
  const chatId = Array.isArray(params.id) ? params.id[0] : params.id;
  const participantName =
    (Array.isArray(params.name) ? params.name[0] : params.name) ||
    "Unknown User";
  const participantAvatar =
    (Array.isArray(params.avatar) ? params.avatar[0] : params.avatar) || "";
  const participantId = Array.isArray(params.participantId)
    ? params.participantId[0]
    : params.participantId;

  // Fetch messages from API
  const {
    data: messagesData,
    isLoading,
    error,
  } = useChatMessages(chatId || "");

  // Mutation for sending messages
  const sendMessageMutation = useMutation({
    mutationFn: (content: string) => {
      if (!(chatId && participantId)) {
        throw new Error("Missing chat ID or participant ID");
      }
      return sendMessageApi(chatId, participantId, content);
    },
    onSuccess: () => {
      // Invalidate and refetch messages
      queryClient.invalidateQueries({
        queryKey: ["message", "chat", chatId],
      });
      // Also invalidate conversations list to update last message
      queryClient.invalidateQueries({
        queryKey: ["message", "conversations"],
      });
    },
    onError: (error) => {
      Alert.alert(
        "Failed to send message",
        error instanceof Error ? error.message : "Unknown error"
      );
    },
  });

  // Convert API messages to ChatScreen format
  const initialMessages = React.useMemo(() => {
    if (!messagesData) return [];

    return messagesData.map((msg) => {
      const date = new Date(msg.timestamp);
      return {
        id: msg.id,
        text: msg.content,
        at: hhmm(date),
        fromMe: msg.isFromUser,
        delivered: true,
        read: msg.isRead,
        day: dayLabel(date),
      } as Msg;
    });
  }, [messagesData]);

  // Show loading state
  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Show error state
  if (error) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  // Render chat screen with real data
  if (!chatId) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <ChatScreen
      conversationId={chatId}
      initialMessages={initialMessages}
      key={chatId}
      onBack={() => router.back()}
      onSend={(msg) => {
        // Send message via API
        sendMessageMutation.mutate(msg.text);
      }}
      participantAvatar={participantAvatar}
      participantName={participantName}
    />
  );
}
