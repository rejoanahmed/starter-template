import { Button } from "@app/components/ui/button";
import { HStack } from "@app/components/ui/hstack";
import { Text } from "@app/components/ui/text";
import { VStack } from "@app/components/ui/vstack";
import { useChatTemplates } from "@app/services/message/chat";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import { useState } from "react";
import { Pressable, Switch, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export function ChatTemplateScreen() {
  const { colorScheme } = useColorScheme();
  const [_templates, setTemplates] = useState<
    Array<{
      id: string;
      title: string;
      description: string;
      isActive: boolean;
    }>
  >([]);

  const { data: chatTemplates, isLoading } = useChatTemplates();

  const isDark = colorScheme === "dark";
  const iconColor = isDark ? "#999" : "#666";

  const handleAddStrategy = () => {
    router.push("/messages/template/edit");
  };

  const handleToggleTemplate = (templateId: string) => {
    setTemplates((prev) =>
      prev.map((template) =>
        template.id === templateId
          ? { ...template, isActive: !template.isActive }
          : template
      )
    );
  };

  const handleEditTemplate = (templateId: string) => {
    router.push(`/messages/template/edit?id=${templateId}`);
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background-0">
        <View className="flex-1 items-center justify-center">
          <Text>Loading templates...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background-0">
      {/* Header */}
      <HStack className="items-center border-outline-100 border-b px-4 py-3">
        <Pressable className="mr-4" onPress={() => router.back()}>
          <MaterialIcons color={iconColor} name="arrow-back" size={24} />
        </Pressable>
        <Text className="font-bold text-xl">Chat Template</Text>
      </HStack>

      {/* Add Strategy Button */}
      <View className="px-4 py-6">
        <Button
          className="flex-row items-center justify-center rounded-lg border border-pink-300 bg-pink-100 px-4 py-3"
          onPress={handleAddStrategy}
        >
          <MaterialIcons color="#EC4899" name="add" size={20} />
          <Text className="ml-2 font-medium text-pink-500">Add Strategy</Text>
        </Button>
      </View>

      {/* Template List */}
      <VStack className="flex-1">
        {chatTemplates?.map((template, index) => (
          <View key={template.id}>
            {index > 0 && <View className="mx-4 h-px bg-gray-200" />}
            <HStack className="items-center px-4 py-4">
              {/* Icon */}
              <View className="mr-4 h-12 w-12 items-center justify-center rounded-lg border border-pink-300">
                <MaterialIcons color="#EC4899" name="message" size={24} />
              </View>

              {/* Content */}
              <VStack className="flex-1">
                <Text className="font-semibold text-lg">{template.title}</Text>
                <Text className="text-gray-600 text-sm">
                  {template.description}
                </Text>
              </VStack>

              {/* Controls */}
              <VStack className="items-end">
                <Switch
                  onValueChange={() => handleToggleTemplate(template.id)}
                  thumbColor={template.isActive ? "#FFFFFF" : "#FFFFFF"}
                  trackColor={{ false: "#E5E7EB", true: "#EC4899" }}
                  value={template.isActive}
                />
                <Pressable
                  className="mt-2"
                  onPress={() => handleEditTemplate(template.id)}
                >
                  <Text className="text-blue-500 underline">Edit</Text>
                </Pressable>
              </VStack>
            </HStack>
          </View>
        ))}
      </VStack>
    </SafeAreaView>
  );
}
