import { HStack } from "@app/components/ui/hstack";
import { Text } from "@app/components/ui/text";
import { VStack } from "@app/components/ui/vstack";
import type { ChatConversation } from "@app/services/message/chat";
import { router } from "expo-router";
import { Image, Pressable, View } from "react-native";

type MessageItemProps = {
  conversation: ChatConversation;
};

export function MessageItem({ conversation }: MessageItemProps) {
  const handlePress = () => {
    router.push({
      pathname: "/messages/chat",
      params: {
        conversationId: conversation.id,
        participantName: conversation.participantName,
        participantAvatar: conversation.participantAvatar,
      },
    });
  };

  return (
    <Pressable onPress={handlePress}>
      <HStack className="items-center px-4 py-5">
        {/* Avatar */}
        <Image
          className="mr-4 h-12 w-12 rounded-full"
          source={{ uri: conversation.participantAvatar }}
        />

        {/* Message Content */}
        <VStack className="flex-1">
          <HStack className="mb-2 items-center justify-between">
            <Text className="font-semibold text-base text-black">
              {conversation.participantName}
            </Text>
            <HStack className="items-center">
              <Text className="mr-2 text-black text-sm">
                {conversation.lastMessageTime}
              </Text>
              {conversation.unreadCount > 0 && (
                <View className="h-5 w-5 items-center justify-center rounded-full bg-black">
                  <Text className="font-medium text-white text-xs">
                    {conversation.unreadCount}
                  </Text>
                </View>
              )}
            </HStack>
          </HStack>
          <Text className="text-gray-600 text-sm" numberOfLines={2}>
            {conversation.lastMessage}
          </Text>
        </VStack>
      </HStack>
    </Pressable>
  );
}
