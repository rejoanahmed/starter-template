import ChatScreen from "@app/components/pages/messages/ChatScreen";
import { useLocalSearchParams } from "expo-router";

export default function ChatRoute() {
  const { conversationId, participantName, participantAvatar } =
    useLocalSearchParams<{
      conversationId: string;
      participantName: string;
      participantAvatar: string;
    }>();

  if (!(conversationId && participantName && participantAvatar)) {
    return null;
  }

  return (
    <ChatScreen
      conversationId={conversationId}
      participantAvatar={participantAvatar}
      participantName={participantName}
    />
  );
}
