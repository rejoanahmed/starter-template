// components/pages/merchant/appeal/AppealScreen.tsx

import { Button } from "@app/components/ui/button";
import { Heading } from "@app/components/ui/heading";
import { HStack } from "@app/components/ui/hstack";
import { Text } from "@app/components/ui/text";
import { VStack } from "@app/components/ui/vstack";
import { Colors } from "@app/constants/Colors";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import type React from "react";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
  type ViewStyle,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

/* ------------------------------------------------------------------ */
/*                HOISTED HELPER PRESENTATION COMPONENTS               */
/*      (Stable identity → no remounting → inputs keep focus)          */
/* ------------------------------------------------------------------ */

type CardProps = {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
};
const Card = ({ children, style }: CardProps) => (
  <View
    className="rounded-2xl border"
    style={[
      {
        // Defaults (theme colors should be passed via `style`)
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: Platform.OS === "android" ? 2 : 0,
      },
      style,
    ]}
  >
    {children}
  </View>
);

const FieldLabel = ({
  children,
  color,
}: {
  children: React.ReactNode;
  color: string;
}) => (
  <Text bold className="text-base" style={{ color }}>
    {children}
  </Text>
);

const Hint = ({
  children,
  color,
}: {
  children: React.ReactNode;
  color: string;
}) => (
  <Text className="text-sm" style={{ color, opacity: 0.75 }}>
    {children}
  </Text>
);

/* ------------------------------------------------------------------ */
/*                           MAIN SCREEN                               */
/* ------------------------------------------------------------------ */

type AppealScreenProps = {
  bookingId: string;
};

export function AppealScreen({ bookingId }: AppealScreenProps) {
  /* ---------------- THEME ---------------- */
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const theme = useMemo(() => (isDark ? Colors.dark : Colors.light), [isDark]);
  const insets = useSafeAreaInsets();
  const iconMuted = isDark ? "#A6ADB4" : "#667781";
  const subtleBg = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";
  const placeholder = isDark ? "rgba(230,238,242,0.55)" : "rgba(17,24,28,0.45)";

  /* -------------- STATE ------------------ */
  const [description, setDescription] = useState("");
  const [extraReimbursement, setExtraReimbursement] = useState("0");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [files, setFiles] = useState<string[]>([]);

  /* -------------- REFS ------------------- */
  const scrollRef = useRef<ScrollView | null>(null);
  const descRef = useRef<TextInput | null>(null);
  const moneyRef = useRef<TextInput | null>(null);

  /* -------------- LAYOUT ----------------- */
  const HEADER_HEIGHT = 56;
  const keyboardVerticalOffset = insets.top + HEADER_HEIGHT;

  /* -------------- HELPERS ---------------- */
  const ensureVisible = useCallback((input: TextInput | null) => {
    if (!(input && scrollRef.current)) {
      return;
    }
    setTimeout(() => {
      input.measureInWindow((_x, y, _w, h) => {
        const screenH =
          (global as unknown as { window?: { innerHeight?: number } })?.window
            ?.innerHeight ?? (Platform.OS === "ios" ? 0 : 0);
        const bottom = y + h;
        const visibleH = screenH > 0 ? screenH - 16 : bottom;
        if (bottom > visibleH) {
          scrollRef.current?.scrollTo({
            y: bottom - visibleH + 4, // tighter gap
            animated: true,
          });
        }
      });
    }, 60);
  }, []);

  const pickFiles = useCallback(() => {
    // TODO integrate picker; mock for now
    setFiles((prev) => [...prev, `mock://${Date.now()}`]);
  }, []);

  const removeFile = useCallback((uri: string) => {
    setFiles((prev) => prev.filter((f) => f !== uri));
  }, []);

  const onChangeMoney = useCallback((val: string) => {
    const sanitized = val.replace(/[^\d]/g, "");
    setExtraReimbursement(sanitized || "0");
  }, []);

  const submit = useCallback(async () => {
    if (!description.trim()) {
      Alert.alert("Missing details", "Please describe the issue briefly.");
      return;
    }
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 900));
    setIsSubmitting(false);
    setIsSubmitted(true);
  }, [description]);

  /* -------------- SUCCESS ---------------- */
  if (isSubmitted) {
    return (
      <SafeAreaView
        className="flex-1"
        style={{ backgroundColor: theme.background }}
      >
        <HStack
          className="items-center border-b px-4 py-3"
          style={{ borderColor: theme.border }}
        >
          <TouchableOpacity
            className="mr-3"
            hitSlop={8}
            onPress={() => router.back()}
          >
            <MaterialIcons color={iconMuted} name="chevron-left" size={24} />
          </TouchableOpacity>
          <Heading size="xl" style={{ color: theme.text }}>
            Appeal
          </Heading>
        </HStack>

        <View className="flex-1 items-center justify-center px-6">
          <View
            className="mb-8 h-44 w-64 items-center justify-center rounded-2xl"
            style={{
              backgroundColor: subtleBg,
              borderColor: theme.border,
              borderWidth: 1,
            }}
          >
            <MaterialIcons color={theme.tint} name="celebration" size={42} />
            <Text className="mt-2" style={{ color: theme.text, opacity: 0.9 }}>
              Appeal submitted
            </Text>
          </View>

          <Heading
            className="mb-2 text-center"
            size="2xl"
            style={{ color: theme.text }}
          >
            Submission Successful!
          </Heading>
          <Text
            className="mb-8 text-center"
            style={{ color: theme.text, opacity: 0.8 }}
          >
            It takes 1–3 days to process. You can track the status in
            notifications.
          </Text>
          <Button
            className="w-full rounded-full"
            onPress={() => router.back()}
            size="xl"
            style={{ backgroundColor: theme.tint }}
          >
            <Text
              className="font-semibold text-lg"
              style={{ color: "#FFFFFF" }}
            >
              Return
            </Text>
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  /* -------------- MAIN ------------------- */
  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: theme.background }}
    >
      {/* Header */}
      <HStack
        className="items-center border-b px-4 py-3"
        style={{ borderColor: theme.border }}
      >
        <TouchableOpacity
          className="mr-3"
          hitSlop={8}
          onPress={() => router.back()}
        >
          <MaterialIcons color={iconMuted} name="chevron-left" size={24} />
        </TouchableOpacity>
        <Heading size="xl" style={{ color: theme.text }}>
          Appeal
        </Heading>
      </HStack>

      {/* KeyboardAvoidingView */}
      <KeyboardAvoidingView
        className="flex-1"
        keyboardVerticalOffset={keyboardVerticalOffset}
      >
        <ScrollView
          automaticallyAdjustKeyboardInsets
          className="flex-1"
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 24,
            paddingBottom: 24 + insets.bottom,
          }}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
          ref={scrollRef}
        >
          <VStack space="lg">
            {/* Info card */}
            <Card
              style={{
                backgroundColor: theme.surface,
                borderColor: theme.border,
              }}
            >
              <VStack className="p-4" space="xs">
                <FieldLabel color={theme.text}>Before you submit</FieldLabel>
                <Hint color={theme.text}>
                  Disturbing behavior (e.g., property damage, overtime stay, or
                  rule breaches) may result in deposit compensation and/or extra
                  reimbursement after review.
                </Hint>
              </VStack>
            </Card>

            {/* Upload proof */}
            <Card
              style={{
                backgroundColor: theme.surface,
                borderColor: theme.border,
              }}
            >
              <VStack className="p-4" space="md">
                <FieldLabel color={theme.text}>Upload proof</FieldLabel>
                <Hint color={theme.text}>
                  Attach photos/videos (damaged property, overtime stay, etc.).
                </Hint>

                <TouchableOpacity
                  accessibilityLabel="Upload proof"
                  accessibilityRole="button"
                  className="items-center justify-center rounded-xl border-2 border-dashed py-8"
                  onPress={pickFiles}
                  style={{
                    borderColor: theme.border,
                    backgroundColor: subtleBg,
                  }}
                >
                  <MaterialIcons
                    color={theme.tint}
                    name="cloud-upload"
                    size={40}
                  />
                  <Text
                    className="mt-2"
                    style={{ color: theme.text, opacity: 0.8 }}
                  >
                    Tap to upload
                  </Text>
                </TouchableOpacity>

                {files.length > 0 && (
                  <HStack className="flex-wrap" space="sm">
                    {files.map((uri) => (
                      <HStack
                        className="items-center rounded-full px-2 py-1"
                        key={uri}
                        style={{
                          backgroundColor: subtleBg,
                          borderColor: theme.border,
                          borderWidth: Platform.select({
                            ios: 0.5,
                            android: 1,
                          }),
                        }}
                      >
                        <MaterialIcons
                          color={iconMuted}
                          name="attach-file"
                          size={16}
                        />
                        <Text
                          className="mx-1 text-xs"
                          numberOfLines={1}
                          style={{ color: theme.text }}
                        >
                          {uri.replace("mock://", "file_")}
                        </Text>
                        <TouchableOpacity
                          hitSlop={6}
                          onPress={() => removeFile(uri)}
                        >
                          <MaterialIcons
                            color={iconMuted}
                            name="close"
                            size={16}
                          />
                        </TouchableOpacity>
                      </HStack>
                    ))}
                  </HStack>
                )}
              </VStack>
            </Card>

            {/* Description */}
            <Card
              style={{
                backgroundColor: theme.surface,
                borderColor: theme.border,
              }}
            >
              <VStack className="p-4" space="sm">
                <FieldLabel color={theme.text}>
                  Briefly describe the details
                </FieldLabel>
                <TextInput
                  blurOnSubmit={false}
                  className="rounded-xl px-4 py-3"
                  editable
                  multiline
                  numberOfLines={6}
                  onChangeText={setDescription}
                  onFocus={() => ensureVisible(descRef.current)}
                  placeholder="Write what happened…"
                  placeholderTextColor={placeholder}
                  ref={descRef}
                  returnKeyType="default"
                  showSoftInputOnFocus
                  style={{
                    backgroundColor: subtleBg,
                    color: theme.text,
                    borderColor: theme.border,
                    borderWidth: 1,
                    minHeight: 120,
                  }}
                  textAlignVertical="top"
                  value={description}
                />
              </VStack>
            </Card>

            {/* Extra reimbursement */}
            <Card
              style={{
                backgroundColor: theme.surface,
                borderColor: theme.border,
              }}
            >
              <VStack className="p-4" space="xs">
                <FieldLabel color={theme.text}>Extra reimbursement</FieldLabel>
                <Hint color={theme.text}>
                  Use this when losses exceed the deposit or it was already
                  refunded.
                </Hint>
                <HStack className="items-center" space="sm">
                  <View
                    className="rounded-xl px-3 py-3"
                    style={{
                      backgroundColor: subtleBg,
                      borderColor: theme.border,
                      borderWidth: 1,
                    }}
                  >
                    <Text style={{ color: theme.text, opacity: 0.8 }}>HKD</Text>
                  </View>
                  <TextInput
                    className="flex-1 rounded-xl px-4 py-3"
                    editable
                    keyboardType="number-pad"
                    onChangeText={onChangeMoney}
                    onFocus={() => ensureVisible(moneyRef.current)}
                    placeholder="0"
                    placeholderTextColor={placeholder}
                    ref={moneyRef}
                    returnKeyType="done"
                    showSoftInputOnFocus
                    style={{
                      backgroundColor: subtleBg,
                      color: theme.text,
                      borderColor: theme.border,
                      borderWidth: 1,
                    }}
                    value={extraReimbursement}
                  />
                </HStack>
              </VStack>
            </Card>

            {/* Submit */}
            <Button
              accessibilityLabel="Submit appeal"
              accessibilityRole="button"
              className="mt-2 rounded-full"
              disabled={isSubmitting}
              onPress={submit}
              size="xl"
              style={{
                backgroundColor: theme.tint,
                opacity: isSubmitting ? 0.7 : 1,
              }}
            >
              <Text
                className="font-semibold text-lg"
                style={{ color: "#FFFFFF" }}
              >
                {isSubmitting ? "Submitting…" : "Submit"}
              </Text>
            </Button>
          </VStack>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default AppealScreen;
