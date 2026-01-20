// components/pages/history/ReviewScreen.tsx

import { Colors } from "@app/constants/Colors";
import { bookingsService } from "@app/services/bookings";
import { useCreateReview } from "@app/services/client/reviews";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useColorScheme } from "nativewind";
import { useMemo, useRef, useState } from "react";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

type ReviewScreenProps = {
  bookingId: string;
};

function StarRow({
  value,
  onChange,
  palette,
}: {
  value: number;
  onChange: (v: number) => void;
  palette: typeof Colors.light;
}) {
  const [hover, setHover] = useState(0);
  return (
    <View className="flex-row items-center">
      {Array.from({ length: 5 }).map((_, i) => {
        const idx = i + 1;
        const filled = (hover || value) >= idx;
        return (
          <Pressable
            accessibilityLabel={`Rate ${idx} star${idx > 1 ? "s" : ""}`}
            accessibilityRole="button"
            className="mr-1.5"
            hitSlop={8}
            key={idx}
            onHoverIn={() => setHover(idx)}
            onHoverOut={() => setHover(0)}
            onPress={() => onChange(idx)}
          >
            <Ionicons
              color={filled ? palette.tint : (palette.muted ?? palette.icon)}
              name={filled ? "star" : "star-outline"}
              size={28}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

function RatingField({
  label,
  value,
  onChange,
  palette,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  palette: typeof Colors.light;
}) {
  return (
    <View className="mb-4">
      <Text
        className="mb-2 font-medium text-sm"
        style={{ color: palette.text }}
      >
        {label}
      </Text>
      <StarRow onChange={onChange} palette={palette} value={value} />
    </View>
  );
}

function ReviewCard({
  title,
  value,
  setValue,
  palette,
  onFocusScroll,
  onSend,
  sending,
  sendLabel,
}: {
  title: string;
  value: {
    rating: number;
    cleanliness: number;
    accuracy: number;
    communication: number;
    location: number;
    value: number;
    text: string;
  };
  setValue: (next: {
    rating: number;
    cleanliness: number;
    accuracy: number;
    communication: number;
    location: number;
    value: number;
    text: string;
  }) => void;
  palette: typeof Colors.light;
  onFocusScroll: () => void;
  onSend: () => void;
  sending: boolean;
  sendLabel: string;
}) {
  const maxLen = 1000;
  const trimmedLength = value.text.trim().length;
  const charsNeeded = Math.max(0, 10 - trimmedLength);
  const hasValidText = trimmedLength >= 10;
  const hasAllRatings =
    value.rating > 0 &&
    value.cleanliness > 0 &&
    value.accuracy > 0 &&
    value.communication > 0 &&
    value.location > 0 &&
    value.value > 0;
  const canSend = hasAllRatings && hasValidText && !sending;

  return (
    <View
      className="rounded-2xl p-4"
      style={{
        backgroundColor: palette.surface,
        borderColor: palette.border,
        borderWidth: 1,
      }}
    >
      <Text
        className="mb-4 font-semibold text-base"
        style={{ color: palette.text }}
      >
        {title}
      </Text>

      <Text
        className="mb-3 font-medium text-sm"
        style={{ color: palette.text }}
      >
        Overall Rating
      </Text>
      <StarRow
        onChange={(r) => setValue({ ...value, rating: r })}
        palette={palette}
        value={value.rating}
      />

      <View className="mt-4">
        <Text
          className="mb-3 font-medium text-sm"
          style={{ color: palette.text }}
        >
          Rate your experience
        </Text>
        <RatingField
          label="Cleanliness"
          onChange={(r) => setValue({ ...value, cleanliness: r })}
          palette={palette}
          value={value.cleanliness}
        />
        <RatingField
          label="Accuracy"
          onChange={(r) => setValue({ ...value, accuracy: r })}
          palette={palette}
          value={value.accuracy}
        />
        <RatingField
          label="Communication"
          onChange={(r) => setValue({ ...value, communication: r })}
          palette={palette}
          value={value.communication}
        />
        <RatingField
          label="Location"
          onChange={(r) => setValue({ ...value, location: r })}
          palette={palette}
          value={value.location}
        />
        <RatingField
          label="Value"
          onChange={(r) => setValue({ ...value, value: r })}
          palette={palette}
          value={value.value}
        />
      </View>

      <Text
        className="mt-4 mb-2 font-semibold text-base"
        style={{ color: palette.text }}
      >
        Your review
      </Text>
      <TextInput
        className="rounded-xl px-3 py-3 text-base"
        maxLength={maxLen}
        multiline
        onChangeText={(t) => setValue({ ...value, text: t })}
        onFocus={onFocusScroll}
        placeholder="Share details about your experience (min 10 characters)"
        placeholderTextColor={palette.muted ?? palette.icon}
        returnKeyType="done"
        style={{
          color: palette.text,
          backgroundColor:
            palette.inputBg ?? palette.surface2 ?? palette.surface,
          borderColor: palette.border,
          borderWidth: 1,
          textAlignVertical: "top",
          minHeight: 120,
        }}
        value={value.text}
      />
      <View className="mt-2 mb-3 flex-row justify-between">
        <Text style={{ color: palette.muted }}>
          {hasValidText
            ? "Looks good"
            : `At least ${charsNeeded} more character${charsNeeded === 1 ? "" : "s"}`}
        </Text>
        <Text style={{ color: palette.muted }}>
          {value.text.length}/{maxLen}
        </Text>
      </View>

      {!(hasAllRatings && hasValidText) && (
        <Text
          style={{
            color: palette.muted,
            fontSize: 12,
            marginTop: 4,
            fontStyle: "italic",
          }}
        >
          {hasAllRatings
            ? hasValidText
              ? ""
              : "Review must be at least 10 characters (excluding spaces)"
            : "Please rate all categories"}
        </Text>
      )}

      {/* Send Button */}
      <Pressable
        accessibilityRole="button"
        className="mt-2 h-12 items-center justify-center rounded-2xl"
        disabled={!canSend}
        onPress={onSend}
        style={{
          backgroundColor: canSend
            ? (palette.primaryButton ?? palette.tint)
            : (palette.state?.disabledBg ??
              palette.surface2 ??
              palette.surface),
          opacity: sending ? 0.7 : 1,
        }}
      >
        <Text
          className="font-semibold text-base"
          style={{
            color: canSend
              ? "#FFFFFF"
              : (palette.mutedStrong ?? palette.muted ?? palette.icon),
          }}
        >
          {sending ? "Sending…" : sendLabel}
        </Text>
      </Pressable>
    </View>
  );
}

export function ReviewScreen({ bookingId }: ReviewScreenProps) {
  const { colorScheme } = useColorScheme();
  const palette = Colors[colorScheme === "dark" ? "dark" : "light"];
  const insets = useSafeAreaInsets();
  const createReview = useCreateReview();

  // Fetch booking details to get room name
  const { data: bookingData } = useQuery({
    queryKey: ["booking", bookingId],
    queryFn: () => bookingsService.getBooking(bookingId),
    enabled: !!bookingId,
  });

  const [review, setReview] = useState<{
    rating: number;
    cleanliness: number;
    accuracy: number;
    communication: number;
    location: number;
    value: number;
    text: string;
  }>({
    rating: 0,
    cleanliness: 0,
    accuracy: 0,
    communication: 0,
    location: 0,
    value: 0,
    text: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [cardY, setCardY] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const headerTitle = useMemo(() => "Review", []);

  const handleSubmit = async () => {
    const hasAllRatings =
      review.rating > 0 &&
      review.cleanliness > 0 &&
      review.accuracy > 0 &&
      review.communication > 0 &&
      review.location > 0 &&
      review.value > 0;
    const hasValidText = review.text.trim().length >= 10;

    if (!(hasAllRatings && hasValidText)) {
      return;
    }

    try {
      await createReview.mutateAsync({
        bookingId,
        rating: review.rating,
        cleanliness: review.cleanliness,
        accuracy: review.accuracy,
        communication: review.communication,
        location: review.location,
        value: review.value,
        comment: review.text.trim(),
      });
      Alert.alert("Thank you!", "Your review has been submitted.");
      setSubmitted(true);
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error
          ? error.message
          : "Failed to submit review. Please try again."
      );
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.background }}>
      <KeyboardAvoidingView
        keyboardVerticalOffset={Platform.select({
          ios: insets.top,
          android: 0,
        })}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback accessible={false} onPress={Keyboard.dismiss}>
          <View style={{ flex: 1 }}>
            {/* Header */}
            <View
              className="px-4 pb-3"
              style={{
                borderBottomColor: palette.border,
                borderBottomWidth: 1,
                backgroundColor: palette.background,
              }}
            >
              <Text
                accessibilityRole="header"
                className="font-bold text-2xl"
                style={{ color: palette.text }}
              >
                {headerTitle}
              </Text>
              <Text className="mt-1" style={{ color: palette.muted }}>
                {bookingData?.booking?.room?.title}
              </Text>
            </View>

            {/* Content */}
            <ScrollView
              contentContainerStyle={{ padding: 16, paddingBottom: 28 }}
              keyboardDismissMode={
                Platform.OS === "ios" ? "interactive" : "on-drag"
              }
              keyboardShouldPersistTaps="handled"
              ref={scrollRef}
            >
              {submitted ? (
                <View
                  style={{
                    padding: 16,
                    alignItems: "center",
                    backgroundColor: palette.surface,
                    borderColor: palette.border,
                    borderWidth: 1,
                    borderRadius: 16,
                    marginTop: 16,
                  }}
                >
                  <Text style={{ color: palette.text, fontSize: 16 }}>
                    Thank you for your review!
                  </Text>
                </View>
              ) : (
                <View onLayout={(e) => setCardY(e.nativeEvent.layout.y)}>
                  <ReviewCard
                    onFocusScroll={() => {
                      scrollRef.current?.scrollTo({
                        y: Math.max(0, cardY - 12),
                        animated: true,
                      });
                    }}
                    onSend={handleSubmit}
                    palette={palette}
                    sending={createReview.isPending}
                    sendLabel="Submit Review"
                    setValue={setReview}
                    title={`Review — ${bookingData?.booking?.room?.title}`}
                    value={review}
                  />
                </View>
              )}
            </ScrollView>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
