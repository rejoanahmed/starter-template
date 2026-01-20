// components/pages/messages/TemplateDetailScreen.tsx

import { HStack } from "@app/components/ui/hstack";
import { Text } from "@app/components/ui/text";
import { VStack } from "@app/components/ui/vstack";
import { Colors } from "@app/constants/Colors";
import {
  type ChatTemplate,
  deleteTemplateApi,
  updateTemplateApi,
  useChatTemplates,
} from "@app/services/message/chat";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Switch,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type TemplateDetailScreenProps = {
  templateId?: string;
};

const triggerOptions: Array<{
  label: string;
  value: ChatTemplate["trigger"];
}> = [
  { label: "First enquiry", value: "first_enquiry" },
  { label: "12 hours before check-in", value: "12_hours_before_checkin" },
  { label: "5 hours before check-in", value: "5_hours_before_checkin" },
  { label: "2 hours before check-in", value: "2_hours_before_checkin" },
  { label: "12 hours before check-out", value: "12_hours_before_checkout" },
  { label: "5 hours before check-out", value: "5_hours_before_checkout" },
  { label: "2 hours before check-out", value: "2_hours_before_checkout" },
];

const audienceOptions: Array<{
  label: string;
  value: ChatTemplate["audience"];
}> = [
  { label: "All paid customers", value: "all_paid_customers" },
  { label: "Specific customers", value: "specific_customers" },
];

export function TemplateDetailScreen({
  templateId,
}: TemplateDetailScreenProps) {
  const { colorScheme } = useColorScheme();
  const palette = Colors[colorScheme === "dark" ? "dark" : "light"];
  const queryClient = useQueryClient();

  const { data: templates, isLoading: loadingTemplates } = useChatTemplates();
  const template = useMemo(
    () => templates?.find((t) => t.id === templateId),
    [templates, templateId]
  );

  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [selectedTrigger, setSelectedTrigger] = useState<
    ChatTemplate["trigger"] | undefined
  >();
  const [selectedAudience, setSelectedAudience] =
    useState<ChatTemplate["audience"]>("all_paid_customers");
  const [isActive, setIsActive] = useState(true);
  const [showTriggerDropdown, setShowTriggerDropdown] = useState(false);
  const [showAudienceDropdown, setShowAudienceDropdown] = useState(false);

  // Load template data
  useEffect(() => {
    if (template) {
      setTitle(template.title);
      setDescription(template.description || "");
      setContent(template.content);
      setSelectedTrigger(template.trigger);
      setSelectedAudience(template.audience);
      setIsActive(template.isActive);
    }
  }, [template]);

  const canSave = title.trim().length > 0 && content.trim().length > 0;

  const placeholder = palette.muted ?? "#9BA1A6";
  const borderColor = palette.border;
  const cardBg = palette.surface;
  const textColor = palette.text;
  const accent = palette.primaryButton ?? palette.tint;
  const iconColor =
    palette.icon ?? (colorScheme === "dark" ? "#9BA1A6" : "#687076");

  const ddRef = useRef<View>(null);

  // Mutation for updating template
  const updateMutation = useMutation({
    mutationFn: () => {
      if (!templateId) throw new Error("No template ID");

      const templateData = {
        title: title.trim(),
        description: description.trim() || undefined,
        content: content.trim(),
        trigger: selectedTrigger,
        isActive,
        audience: selectedAudience,
      };

      return updateTemplateApi(templateId, templateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["message", "templates"] });
      setIsEditing(false);
      Alert.alert("Success", "Template updated successfully");
    },
    onError: (error) => {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to update template"
      );
    },
  });

  // Mutation for deleting template
  const deleteMutation = useMutation({
    mutationFn: () => {
      if (!templateId) throw new Error("No template ID");
      return deleteTemplateApi(templateId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["message", "templates"] });
      Alert.alert("Success", "Template deleted successfully", [
        { text: "OK", onPress: () => router.back() },
      ]);
    },
    onError: (error) => {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to delete template"
      );
    },
  });

  const handleSave = () => {
    if (!canSave) return;
    updateMutation.mutate();
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Template",
      "Are you sure you want to delete this template? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteMutation.mutate(),
        },
      ]
    );
  };

  const selectedTriggerLabel = useMemo(
    () => triggerOptions.find((opt) => opt.value === selectedTrigger)?.label,
    [selectedTrigger]
  );

  const selectedAudienceLabel = useMemo(
    () => audienceOptions.find((opt) => opt.value === selectedAudience)?.label,
    [selectedAudience]
  );

  if (loadingTemplates) {
    return (
      <SafeAreaView
        className="flex-1"
        style={{ backgroundColor: palette.background }}
      >
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={accent} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (!template) {
    return (
      <SafeAreaView
        className="flex-1"
        style={{ backgroundColor: palette.background }}
      >
        <View className="flex-1 items-center justify-center px-6">
          <MaterialIcons color={iconColor} name="error-outline" size={48} />
          <Text className="mt-3 text-center" style={{ color: textColor }}>
            Template not found
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: palette.background }}
    >
      {/* Header */}
      <HStack
        className="items-center border-b px-4 py-3"
        style={{ borderColor }}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          onPress={() => router.back()}
          style={{ padding: 4, marginRight: 8, borderRadius: 999 }}
        >
          <MaterialIcons color={iconColor} name="arrow-back" size={24} />
        </TouchableOpacity>

        <Text className="flex-1 font-bold text-xl" style={{ color: textColor }}>
          {isEditing ? "Edit template" : "Template"}
        </Text>

        {isEditing ? (
          <TouchableOpacity
            activeOpacity={canSave ? 0.85 : 1}
            disabled={!canSave || updateMutation.isPending}
            onPress={handleSave}
            style={{
              paddingHorizontal: 14,
              height: 36,
              borderRadius: 18,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: canSave ? accent : `${accent}90`,
              borderWidth: canSave ? 0 : 1,
              borderColor: canSave ? "transparent" : borderColor,
            }}
          >
            {updateMutation.isPending ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text
                style={{
                  color: canSave ? "#fff" : iconColor,
                  fontWeight: "700",
                }}
              >
                Save
              </Text>
            )}
          </TouchableOpacity>
        ) : (
          <HStack space="sm">
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setIsEditing(true)}
              style={{
                padding: 8,
                borderRadius: 999,
              }}
            >
              <MaterialIcons color={iconColor} name="edit" size={22} />
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.8}
              disabled={deleteMutation.isPending}
              onPress={handleDelete}
              style={{
                padding: 8,
                borderRadius: 999,
              }}
            >
              {deleteMutation.isPending ? (
                <ActivityIndicator color={iconColor} size="small" />
              ) : (
                <MaterialIcons color="#EF4444" name="delete" size={22} />
              )}
            </TouchableOpacity>
          </HStack>
        )}
      </HStack>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
      >
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 16 }}
          keyboardShouldPersistTaps="handled"
        >
          <VStack space="lg">
            {/* Card: Title */}
            <View
              style={{
                backgroundColor: cardBg,
                borderColor,
                borderWidth: 1,
                borderRadius: 16,
                paddingHorizontal: 14,
                paddingVertical: 12,
              }}
            >
              <HStack className="items-center">
                <MaterialIcons color={iconColor} name="title" size={20} />
                {isEditing ? (
                  <TextInput
                    editable={isEditing}
                    onChangeText={setTitle}
                    placeholder="Add title"
                    placeholderTextColor={placeholder}
                    returnKeyType="next"
                    style={{
                      flex: 1,
                      marginLeft: 10,
                      color: textColor,
                      fontSize: 16,
                      paddingVertical: 6,
                    }}
                    value={title}
                  />
                ) : (
                  <Text
                    className="ml-3 flex-1"
                    style={{ color: textColor, fontSize: 16 }}
                  >
                    {title}
                  </Text>
                )}
              </HStack>
            </View>

            {/* Card: Description */}
            {(isEditing || description) && (
              <View
                style={{
                  backgroundColor: cardBg,
                  borderColor,
                  borderWidth: 1,
                  borderRadius: 16,
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                }}
              >
                <HStack className="items-center">
                  <MaterialIcons
                    color={iconColor}
                    name="description"
                    size={20}
                  />
                  {isEditing ? (
                    <TextInput
                      editable={isEditing}
                      onChangeText={setDescription}
                      placeholder="Add description (optional)"
                      placeholderTextColor={placeholder}
                      returnKeyType="next"
                      style={{
                        flex: 1,
                        marginLeft: 10,
                        color: textColor,
                        fontSize: 16,
                        paddingVertical: 6,
                      }}
                      value={description}
                    />
                  ) : (
                    <Text
                      className="ml-3 flex-1"
                      style={{ color: textColor, fontSize: 16 }}
                    >
                      {description}
                    </Text>
                  )}
                </HStack>
              </View>
            )}

            {/* Card: Message */}
            <View
              style={{
                backgroundColor: cardBg,
                borderColor,
                borderWidth: 1,
                borderRadius: 16,
                padding: 14,
              }}
            >
              <HStack className="mb-2 items-center">
                <MaterialIcons color={iconColor} name="chat" size={20} />
                <Text
                  className="ml-2 font-semibold"
                  style={{ color: textColor }}
                >
                  Message
                </Text>
              </HStack>
              {isEditing ? (
                <TextInput
                  editable={isEditing}
                  multiline
                  onChangeText={setContent}
                  placeholder="Add message…"
                  placeholderTextColor={placeholder}
                  style={{
                    minHeight: 140,
                    color: textColor,
                    fontSize: 16,
                    lineHeight: 22,
                  }}
                  textAlignVertical="top"
                  value={content}
                />
              ) : (
                <Text
                  style={{
                    color: textColor,
                    fontSize: 16,
                    lineHeight: 22,
                  }}
                >
                  {content}
                </Text>
              )}
            </View>

            {/* Card: Schedule/Trigger */}
            <View
              ref={ddRef}
              style={{
                backgroundColor: cardBg,
                borderColor,
                borderWidth: 1,
                borderRadius: 16,
                paddingHorizontal: 14,
                paddingVertical: 12,
              }}
            >
              <HStack className="items-center">
                <MaterialIcons color={iconColor} name="schedule" size={20} />
                {isEditing ? (
                  <Pressable
                    className="ml-3 flex-1 flex-row items-center justify-between"
                    onPress={() => setShowTriggerDropdown((s) => !s)}
                    style={{ paddingVertical: 8 }}
                  >
                    <Text
                      style={{
                        color: selectedTriggerLabel ? textColor : placeholder,
                        fontSize: 16,
                      }}
                    >
                      {selectedTriggerLabel || "Select timing (optional)"}
                    </Text>
                    <MaterialIcons
                      color={iconColor}
                      name={
                        showTriggerDropdown
                          ? "keyboard-arrow-up"
                          : "keyboard-arrow-down"
                      }
                      size={22}
                    />
                  </Pressable>
                ) : (
                  <Text
                    className="ml-3"
                    style={{
                      color: selectedTriggerLabel ? textColor : placeholder,
                      fontSize: 16,
                    }}
                  >
                    {selectedTriggerLabel || "No trigger set"}
                  </Text>
                )}
              </HStack>

              {isEditing && showTriggerDropdown && (
                <View
                  style={{
                    marginTop: 8,
                    backgroundColor: palette.background,
                    borderColor,
                    borderWidth: 1,
                    borderRadius: 12,
                    overflow: "hidden",
                    shadowColor: "#000",
                    shadowOpacity: colorScheme === "dark" ? 0.25 : 0.12,
                    shadowRadius: 8,
                    shadowOffset: { width: 0, height: 4 },
                    elevation: 4,
                  }}
                >
                  {triggerOptions.map((option, i) => (
                    <Pressable
                      android_ripple={{ color: palette.border }}
                      key={option.value}
                      onPress={() => {
                        setSelectedTrigger(option.value);
                        setShowTriggerDropdown(false);
                      }}
                      style={{
                        paddingHorizontal: 14,
                        paddingVertical: 12,
                        borderBottomWidth:
                          i < triggerOptions.length - 1 ? 1 : 0,
                        borderColor,
                      }}
                    >
                      <Text style={{ color: textColor, fontSize: 16 }}>
                        {option.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>

            {/* Card: Audience */}
            <View
              style={{
                backgroundColor: cardBg,
                borderColor,
                borderWidth: 1,
                borderRadius: 16,
                paddingHorizontal: 14,
                paddingVertical: 12,
              }}
            >
              <HStack className="items-center">
                <MaterialIcons color={iconColor} name="people" size={20} />
                {isEditing ? (
                  <Pressable
                    className="ml-3 flex-1 flex-row items-center justify-between"
                    onPress={() => setShowAudienceDropdown((s) => !s)}
                    style={{ paddingVertical: 8 }}
                  >
                    <Text style={{ color: textColor, fontSize: 16 }}>
                      {selectedAudienceLabel}
                    </Text>
                    <MaterialIcons
                      color={iconColor}
                      name={
                        showAudienceDropdown
                          ? "keyboard-arrow-up"
                          : "keyboard-arrow-down"
                      }
                      size={22}
                    />
                  </Pressable>
                ) : (
                  <Text
                    className="ml-3"
                    style={{ color: textColor, fontSize: 16 }}
                  >
                    {selectedAudienceLabel}
                  </Text>
                )}
              </HStack>

              {isEditing && showAudienceDropdown && (
                <View
                  style={{
                    marginTop: 8,
                    backgroundColor: palette.background,
                    borderColor,
                    borderWidth: 1,
                    borderRadius: 12,
                    overflow: "hidden",
                    shadowColor: "#000",
                    shadowOpacity: colorScheme === "dark" ? 0.25 : 0.12,
                    shadowRadius: 8,
                    shadowOffset: { width: 0, height: 4 },
                    elevation: 4,
                  }}
                >
                  {audienceOptions.map((option, i) => (
                    <Pressable
                      android_ripple={{ color: palette.border }}
                      key={option.value}
                      onPress={() => {
                        setSelectedAudience(option.value);
                        setShowAudienceDropdown(false);
                      }}
                      style={{
                        paddingHorizontal: 14,
                        paddingVertical: 12,
                        borderBottomWidth:
                          i < audienceOptions.length - 1 ? 1 : 0,
                        borderColor,
                      }}
                    >
                      <Text style={{ color: textColor, fontSize: 16 }}>
                        {option.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>

            {/* Card: Active Status */}
            <View
              style={{
                backgroundColor: cardBg,
                borderColor,
                borderWidth: 1,
                borderRadius: 16,
                paddingHorizontal: 14,
                paddingVertical: 12,
              }}
            >
              <HStack className="items-center justify-between">
                <HStack className="items-center">
                  <MaterialIcons
                    color={iconColor}
                    name={isActive ? "check-circle" : "cancel"}
                    size={20}
                  />
                  <Text
                    className="ml-3"
                    style={{ color: textColor, fontSize: 16 }}
                  >
                    Active
                  </Text>
                </HStack>
                <Switch
                  disabled={!isEditing}
                  onValueChange={setIsActive}
                  trackColor={{ false: borderColor, true: accent }}
                  value={isActive}
                />
              </HStack>
            </View>

            {/* Tap-outside to close dropdown */}
            {isEditing && (showTriggerDropdown || showAudienceDropdown) && (
              <Pressable
                onPress={() => {
                  setShowTriggerDropdown(false);
                  setShowAudienceDropdown(false);
                }}
                style={{ height: 1 }}
              />
            )}
          </VStack>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
