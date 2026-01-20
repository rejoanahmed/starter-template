import { ThemedText } from "@app/components/ThemedText";
import { Colors } from "@app/constants/Colors";
import { useChatTemplates } from "@app/services/message/chat";
import { Ionicons } from "@expo/vector-icons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const triggerLabels: Record<string, string> = {
  first_enquiry: "First enquiry",
  "2_hours_before_checkin": "2 hours before check-in",
  "5_hours_before_checkin": "5 hours before check-in",
  "12_hours_before_checkin": "12 hours before check-in",
  "2_hours_before_checkout": "2 hours before check-out",
  "5_hours_before_checkout": "5 hours before check-out",
  "12_hours_before_checkout": "12 hours before check-out",
};

export function TemplateListScreen() {
  const { colorScheme } = useColorScheme();
  const palette = Colors[colorScheme ?? "light"];
  const { data: templates, isLoading, error } = useChatTemplates();

  const borderColor = palette.border;
  const cardBg = palette.surface;
  const textColor = palette.text;
  const mutedColor = palette.muted ?? "#9BA1A6";
  const accent = palette.primaryButton ?? palette.tint;

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: palette.background }}
    >
      {/* Header */}
      <View
        className="flex-row items-center border-b px-4 py-3"
        style={{ borderColor }}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          onPress={() => router.back()}
          style={{ padding: 4, marginRight: 8, borderRadius: 999 }}
        >
          <MaterialIcons color={mutedColor} name="arrow-back" size={24} />
        </TouchableOpacity>

        <Text className="flex-1 font-bold text-xl" style={{ color: textColor }}>
          Chat Templates
        </Text>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.push("/messages/template/new")}
          style={{
            paddingHorizontal: 14,
            height: 36,
            borderRadius: 18,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: accent,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "700" }}>New</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={accent} size="large" />
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons color={mutedColor} name="alert-circle-outline" size={48} />
          <ThemedText
            className="mt-3 text-center"
            style={{ color: textColor }}
            type="subtitle"
          >
            Failed to load templates
          </ThemedText>
          <ThemedText
            className="mt-1 text-center"
            style={{ color: mutedColor }}
          >
            {error instanceof Error ? error.message : "Unknown error"}
          </ThemedText>
        </View>
      ) : (
        <FlatList
          contentContainerStyle={{ padding: 16 }}
          data={templates || []}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <View className="mt-20 items-center justify-center px-6">
              <Ionicons
                color={mutedColor}
                name="chatbubbles-outline"
                size={48}
              />
              <ThemedText
                className="mt-3 text-center"
                style={{ color: textColor }}
                type="subtitle"
              >
                No templates yet
              </ThemedText>
              <ThemedText
                className="mt-1 text-center"
                style={{ color: mutedColor }}
              >
                Create your first template to automate messages
              </ThemedText>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() =>
                router.push({
                  pathname: "/messages/template/[id]",
                  params: { id: item.id },
                })
              }
              style={{
                backgroundColor: cardBg,
                borderColor,
                borderWidth: 1,
                borderRadius: 16,
                padding: 16,
              }}
            >
              <View className="flex-row items-start justify-between">
                <View className="flex-1">
                  <Text
                    className="font-semibold text-base"
                    style={{ color: textColor }}
                  >
                    {item.title}
                  </Text>
                  {item.description && (
                    <Text
                      className="mt-1 text-sm"
                      numberOfLines={1}
                      style={{ color: mutedColor }}
                    >
                      {item.description}
                    </Text>
                  )}
                  {item.trigger && (
                    <View className="mt-2 flex-row items-center">
                      <MaterialIcons
                        color={mutedColor}
                        name="schedule"
                        size={14}
                      />
                      <Text
                        className="ml-1 text-xs"
                        style={{ color: mutedColor }}
                      >
                        {triggerLabels[item.trigger] || item.trigger}
                      </Text>
                    </View>
                  )}
                </View>
                <View
                  style={{
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 12,
                    backgroundColor: item.isActive
                      ? `${accent}20`
                      : `${mutedColor}20`,
                  }}
                >
                  <Text
                    className="text-xs font-semibold"
                    style={{ color: item.isActive ? accent : mutedColor }}
                  >
                    {item.isActive ? "Active" : "Inactive"}
                  </Text>
                </View>
              </View>
              <Text
                className="mt-3 text-sm"
                numberOfLines={2}
                style={{ color: textColor }}
              >
                {item.content}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}
