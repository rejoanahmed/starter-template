import { Colors } from "@app/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import React, { memo, useCallback, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  FlatList,
  Image,
  InteractionManager,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/* ---------------- Types ---------------- */
export type Message = {
  id: string;
  text: string;
  at: string;
  fromMe: boolean;
  delivered?: boolean;
  read?: boolean;
  day?: string;
};

export type ChatScreenProps = {
  conversationId: string;
  participantName: string;
  participantAvatar?: string;
  initialMessages?: Message[];
  onSend?: (message: Message) => void;
  paletteOverride?: typeof Colors.light;
  /** Show a back button in header; default true */
  showBackButton?: boolean;
  /** Called when back is pressed; provide router.back from the route */
  onBack?: () => void;
};

/* ---------------- Small UI Bits ---------------- */
const AVATAR_FALLBACK =
  "https://ui-avatars.com/api/?background=1f2937&color=fff&name=User";

const DayChip = memo(
  ({ label, palette }: { label: string; palette: typeof Colors.light }) => (
    <View className="my-2">
      <View
        className="self-center rounded-full px-3 py-1"
        style={{
          backgroundColor:
            (palette as any).surface3 ??
            (palette as any).surface2 ??
            palette.surface,
          borderColor: palette.border,
          borderWidth: 1,
        }}
      >
        <Text
          style={{
            fontSize: 12,
            color: (palette as any).muted ?? palette.icon,
          }}
        >
          {label}
        </Text>
      </View>
    </View>
  )
);

const TypingDots = memo(({ palette }: { palette: typeof Colors.light }) => {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const makeAnim = (v: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(v, {
            toValue: 1,
            duration: 300,
            delay,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(v, {
            toValue: 0,
            duration: 300,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ])
      );

    const a1 = makeAnim(dot1, 0);
    const a2 = makeAnim(dot2, 150);
    const a3 = makeAnim(dot3, 300);
    a1.start();
    a2.start();
    a3.start();
    return () => {
      a1.stop();
      a2.stop();
      a3.stop();
    };
  }, [dot1, dot2, dot3]);

  const dotStyle = (v: Animated.Value) => ({
    opacity: v,
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 3,
    backgroundColor: (palette as any).muted ?? palette.icon,
  });

  return (
    <View className="flex-row items-center">
      <Animated.View style={dotStyle(dot1)} />
      <Animated.View style={dotStyle(dot2)} />
      <Animated.View style={dotStyle(dot3)} />
    </View>
  );
});

/* ---------------- Bubbles ---------------- */
const MessageBubble = memo(function MessageBubble({
  item,
  avatar,
  palette,
  isDark,
}: {
  item: Message;
  avatar?: string;
  palette: typeof Colors.light;
  isDark: boolean;
}) {
  const isMe = item.fromMe;
  const incomingBg = palette.surface;
  const outgoingBg = isDark
    ? ((palette as any).surface3 ??
      (palette as any).surface2 ??
      palette.surface)
    : palette.tint;
  const incomingText = palette.text;
  const outgoingText = isDark ? palette.text : "#FFFFFF";
  const bubbleBorder = isDark
    ? ((palette as any).borderStrong ?? palette.border)
    : palette.border;
  const outgoingBorder = isDark
    ? ((palette as any).borderStrong ?? palette.border)
    : "transparent";
  const metaColor = (palette as any).muted ?? palette.icon;
  const deliveredColor = metaColor;
  const readColor = palette.tint;

  return (
    <View className={`px-3 py-1 ${isMe ? "items-end" : "items-start"}`}>
      {isMe ? (
        <View className="max-w-[86%]">
          <View
            className="self-end rounded-2xl px-4 py-3"
            style={{
              backgroundColor: outgoingBg,
              borderTopRightRadius: 8,
              borderWidth: 1,
              borderColor: outgoingBorder,
              shadowColor: "#000",
              shadowOpacity: isDark ? 0.14 : 0.08,
              shadowRadius: 6,
              shadowOffset: { width: 0, height: 2 },
              elevation: 1,
            }}
          >
            <Text style={{ fontSize: 16, lineHeight: 22, color: outgoingText }}>
              {item.text}
            </Text>
          </View>
          <View className="mt-1 flex-row items-center justify-end">
            <Text style={{ fontSize: 11, color: metaColor, marginRight: 6 }}>
              {item.at}
            </Text>
            {item.read ? (
              <Ionicons color={readColor} name="checkmark-done" size={15} />
            ) : item.delivered ? (
              <Ionicons
                color={deliveredColor}
                name="checkmark-done"
                size={15}
              />
            ) : (
              <Ionicons color={deliveredColor} name="checkmark" size={15} />
            )}
          </View>
        </View>
      ) : (
        <View className="max-w-[86%] flex-row">
          <View className="mr-2">
            <Image
              className="h-8 w-8 rounded-full"
              source={{ uri: avatar || AVATAR_FALLBACK }}
            />
          </View>
          <View className="flex-1">
            <View
              className="rounded-2xl px-4 py-3"
              style={{
                backgroundColor: incomingBg,
                borderTopLeftRadius: 8,
                borderWidth: 1,
                borderColor: bubbleBorder,
                shadowColor: "#000",
                shadowOpacity: isDark ? 0.12 : 0.06,
                shadowRadius: 6,
                shadowOffset: { width: 0, height: 2 },
                elevation: 1,
              }}
            >
              <Text
                style={{ fontSize: 16, lineHeight: 22, color: incomingText }}
              >
                {item.text}
              </Text>
            </View>
            <View className="mt-1 ml-1 flex-row items-center">
              <Text style={{ fontSize: 11, color: metaColor }}>{item.at}</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
});

/* ---------------- Reusable Screen ---------------- */
export default function ChatScreen({
  conversationId,
  participantName,
  participantAvatar,
  initialMessages = [],
  onSend,
  paletteOverride,
  showBackButton = true,
  onBack,
}: ChatScreenProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const palette = paletteOverride ?? Colors[colorScheme ?? "light"];

  type Sep = { separator: true; label: string; key: string };
  const flatRef = useRef<FlatList<Message | Sep>>(null);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [showTyping, setShowTyping] = useState(false);

  // Defer non-critical work until after interactions for instant scroll responsiveness
  const [mounted, setMounted] = useState(false);
  React.useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() =>
      setMounted(true)
    );
    return () => task.cancel();
  }, []);

  // Newest-first for `inverted` without reverse()
  const grouped: (Message | Sep)[] = useMemo(() => {
    const out: (Message | Sep)[] = [];
    let lastDay = "";
    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i];
      if (msg.day && msg.day !== lastDay) {
        out.push({
          separator: true,
          label: msg.day,
          key: `sep-${msg.day}-${out.length}`,
        });
        lastDay = msg.day;
      }
      out.push(msg);
    }
    if (showTyping) {
      out.unshift({ id: "typing", text: "", at: "", fromMe: false } as Message);
    }
    return out;
  }, [messages, showTyping]);

  const scrollToBottom = useCallback(() => {
    flatRef.current?.scrollToEnd({ animated: true });
  }, []);

  const pushMessage = useCallback(
    (text: string) => {
      const now = new Date();
      const at = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      const msg: Message = {
        id: `m${Date.now()}`,
        at,
        fromMe: true,
        delivered: false,
        read: false,
        day: "Today",
        text,
      };
      setMessages((p) => [...p, msg]);
      requestAnimationFrame(scrollToBottom);
      setTimeout(
        () =>
          setMessages((p) =>
            p.map((x) => (x.id === msg.id ? { ...x, delivered: true } : x))
          ),
        500
      );
      setTimeout(
        () =>
          setMessages((p) =>
            p.map((x) => (x.id === msg.id ? { ...x, read: true } : x))
          ),
        1500
      );
      if (mounted) {
        setShowTyping(true);
        setTimeout(() => setShowTyping(false), 1600);
      }
      onSend?.(msg);
    },
    [scrollToBottom, onSend, mounted]
  );

  const sendText = useCallback(() => {
    const text = input.trim();
    if (!text) {
      return;
    }
    setInput("");
    pushMessage(text);
  }, [input, pushMessage]);

  const renderRow = useCallback(
    ({ item }: { item: Message | Sep }) => {
      if ("separator" in item) {
        return <DayChip label={item.label} palette={palette} />;
      }
      if ((item as Message).id === "typing") {
        return (
          <View className="items-start px-3 py-1">
            <View className="max-w-[70%] flex-row">
              <Image
                className="mr-2 h-8 w-8 rounded-full"
                source={{ uri: participantAvatar || AVATAR_FALLBACK }}
              />
              <View
                className="rounded-2xl px-4 py-3"
                style={{
                  backgroundColor: (palette as any).surface2 ?? palette.surface,
                  borderTopLeftRadius: 8,
                  borderWidth: 1,
                  borderColor: palette.border,
                }}
              >
                <TypingDots palette={palette} />
              </View>
            </View>
          </View>
        );
      }
      return (
        <MessageBubble
          avatar={participantAvatar || AVATAR_FALLBACK}
          isDark={isDark}
          item={item as Message}
          palette={palette}
        />
      );
    },
    [participantAvatar, palette, isDark]
  );

  const keyExtractor = useCallback(
    (item: Message | Sep) =>
      "separator" in item ? item.key : (item as Message).id,
    []
  );

  const canSend = input.trim().length > 0;

  const appBg = palette.background;
  const headerBg =
    (palette as any).surface3 ?? (palette as any).surface2 ?? palette.surface;
  const headerText = palette.text;
  const subtitle = (palette as any).muted ?? palette.icon;
  const chipBorder = palette.border;
  const inputBg =
    (palette as any).inputBg ??
    (isDark ? ((palette as any).surface2 ?? palette.surface) : palette.surface);

  const onContentSizeChange = useCallback(() => {
    if (!mounted) {
      return;
    }
    // No manual scroll needed; maintainVisibleContentPosition keeps view stable
  }, [mounted]);

  return (
    <SafeAreaView
      className="flex-1"
      edges={["top", "bottom"]}
      style={{ backgroundColor: appBg }}
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* Header */}
      <View
        className="flex-row items-center border-b px-2 py-2"
        style={{ backgroundColor: headerBg, borderColor: chipBorder }}
      >
        {showBackButton && (
          <TouchableOpacity
            className="mr-1 rounded-full p-2"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            onPress={onBack}
          >
            <Ionicons color={headerText} name="chevron-back" size={22} />
          </TouchableOpacity>
        )}

        <Image
          className="mr-3 h-9 w-9 rounded-full"
          source={{ uri: participantAvatar || AVATAR_FALLBACK }}
        />

        <View className="flex-1">
          <Text
            className="font-semibold text-[16px]"
            style={{ color: headerText }}
          >
            {participantName}
          </Text>
          <Text className="text-[12px]" style={{ color: subtitle }}>
            Online • Typically replies in minutes
          </Text>
        </View>

        <TouchableOpacity className="mr-1 p-2">
          <Ionicons
            color={subtitle ?? headerText}
            name="call-outline"
            size={20}
          />
        </TouchableOpacity>
        <TouchableOpacity className="p-2">
          <Ionicons
            color={subtitle ?? headerText}
            name="information-circle-outline"
            size={22}
          />
        </TouchableOpacity>
      </View>

      {/* Messages (remove Pressable wrapper to prevent gesture capture) */}
      <FlatList
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 8 }}
        data={grouped}
        initialNumToRender={14}
        inverted
        keyboardShouldPersistTaps="handled"
        keyExtractor={keyExtractor}
        ListFooterComponent={<View style={{ height: 2 }} />}
        maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
        maxToRenderPerBatch={10}
        onContentSizeChange={onContentSizeChange}
        onScrollBeginDrag={Keyboard.dismiss}
        overScrollMode="always"
        ref={flatRef}
        removeClippedSubviews
        renderItem={renderRow}
        scrollEnabled
        scrollEventThrottle={16}
        updateCellsBatchingPeriod={16}
        windowSize={7}
      />

      {/* Composer */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="px-2 pb-2"
        style={{ backgroundColor: headerBg }}
      >
        <View className="flex-row items-end">
          <TouchableOpacity
            className="mr-2 mb-3 h-10 w-10 items-center justify-center rounded-full"
            style={{ backgroundColor: palette.surface }}
          >
            <Ionicons color={palette.text} name="add" size={22} />
          </TouchableOpacity>

          <View
            className="flex-1 flex-row items-center rounded-2xl px-3 py-2"
            style={{
              backgroundColor: inputBg,
              borderColor: palette.border,
              borderWidth: 1,
            }}
          >
            <TouchableOpacity className="mr-1 p-1">
              <Ionicons
                color={(palette as any).muted ?? palette.icon}
                name="happy-outline"
                size={22}
              />
            </TouchableOpacity>

            <TextInput
              className="flex-1 py-1 text-base"
              keyboardAppearance={isDark ? "dark" : "light"}
              multiline
              onChangeText={setInput}
              onFocus={() => setShowTyping(false)}
              onSubmitEditing={() => canSend && sendText()}
              placeholder="Message"
              placeholderTextColor={(palette as any).muted ?? "#687076"}
              returnKeyType="send"
              style={{ color: palette.text }}
              value={input}
            />

            <TouchableOpacity className="ml-1 p-1">
              <Ionicons
                color={(palette as any).muted ?? palette.icon}
                name="camera-outline"
                size={22}
              />
            </TouchableOpacity>
            <TouchableOpacity className="ml-1 p-1">
              <Ionicons
                color={(palette as any).muted ?? palette.icon}
                name="image-outline"
                size={22}
              />
            </TouchableOpacity>
            <TouchableOpacity className="ml-1 p-1">
              <Ionicons
                color={(palette as any).muted ?? palette.icon}
                name="mic-outline"
                size={22}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            className="mb-2 ml-2 h-10 w-10 items-center justify-center rounded-full"
            disabled={!canSend}
            onPress={sendText}
            style={{
              backgroundColor: canSend
                ? ((palette as any).primaryButton ?? palette.tint)
                : "transparent",
              borderWidth: canSend ? 0 : 1,
              borderColor: canSend ? "transparent" : palette.border,
            }}
          >
            <Ionicons
              color={
                canSend ? "#FFFFFF" : ((palette as any).muted ?? palette.icon)
              }
              name="send"
              size={18}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
