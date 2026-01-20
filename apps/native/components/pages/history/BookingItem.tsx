// components/pages/merchant/history/BookingItem.tsx

import { HStack } from "@app/components/ui/hstack";
import { Icon } from "@app/components/ui/icon";
import { Text } from "@app/components/ui/text";
import { VStack } from "@app/components/ui/vstack";
import { Colors } from "@app/constants/Colors";
import type { Booking } from "@app/services/merchant/history";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import { memo, useCallback, useMemo } from "react";
import { Image, Pressable, View } from "react-native";

/** Status palette (no withAlpha) */
const STATUS = {
  waiting_confirmation: {
    dot: "#FF9500",
    chipBgLight: "rgba(255,149,0,0.14)",
    chipBgDark: "rgba(255,149,0,0.22)",
    chipText: "#C26E00",
    icon: "hourglass-empty" as const,
  },
  waiting_checkin: {
    dot: "#FF3B30",
    chipBgLight: "rgba(255,59,48,0.14)",
    chipBgDark: "rgba(255,59,48,0.22)",
    chipText: "#B2251A",
    icon: "pending-actions" as const,
  },
  finished: {
    dot: "#34C759",
    chipBgLight: "rgba(52,199,89,0.14)",
    chipBgDark: "rgba(52,199,89,0.22)",
    chipText: "#1E8F3E",
    icon: "check-circle" as const,
  },
} as const;

type Props = {
  booking: Booking;
  onPress?: (id: string) => void;
  showChevron?: boolean;
  showMessage?: boolean;
};

function formatCurrency(amount: number, currency?: string) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency || "HKD",
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency ? `${currency} ` : "$"}${Math.round(amount)}`;
  }
}

function initials(name?: string) {
  if (!name) {
    return "•";
  }
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "•";
}

export const BookingItem = memo(function BookingItem({
  booking,
  onPress,
  showChevron = true,
  showMessage = true,
}: Props) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const theme = useMemo(() => (isDark ? Colors.dark : Colors.light), [isDark]);

  //Destructure first so hooks depend on primitives (fixes lint warning)
  const {
    id,
    customerName,
    peopleCount,
    price,
    roomName,
    currency,
    customerAvatar,
    status,
    statusText,
    date,
    time,
  } = booking;

  const s = STATUS[status];
  const iconColor = isDark ? "#B3BBC2" : "#6B7580";
  const subText = isDark ? "rgba(230,238,242,0.75)" : "rgba(17,24,28,0.72)";
  const chipBg = isDark ? s.chipBgDark : s.chipBgLight;
  const avatarBg = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)";

  const pressRow = useCallback(() => {
    if (onPress) {
      return onPress(id);
    }
    router.push(`/booking/${id}`);
  }, [id, onPress]);

  const pressMessage = useCallback(
    (e: any) => {
      e.stopPropagation?.();
      router.push({
        pathname: "/",
        params: {
          conversationId: id,
          participantName: customerName,
          participantAvatar: customerAvatar ?? "",
        },
      });
    },
    [id, customerName, customerAvatar]
  );

  return (
    <Pressable
      accessibilityHint="Opens booking details"
      accessibilityLabel={`Booking for ${customerName}`}
      accessibilityRole="button"
      android_ripple={{
        color: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
      }}
      className="border-b px-4 py-3"
      onPress={pressRow}
      style={{ borderBottomColor: theme.border }}
      testID={`booking-item-${id}`}
    >
      <HStack className="items-center" space="md">
        {/* Avatar with status dot */}
        <View
          className="h-11 w-11 items-center justify-center overflow-hidden rounded-full border"
          style={{ borderColor: theme.tint }}
        >
          {customerAvatar ? (
            <Image className="h-full w-full" source={{ uri: customerAvatar }} />
          ) : (
            <View
              className="h-full w-full items-center justify-center"
              style={{ backgroundColor: avatarBg }}
            >
              <Text bold className="text-base" style={{ color: theme.text }}>
                {initials(customerName)}
              </Text>
            </View>
          )}
          <View
            className="-right-0.5 -bottom-0.5 absolute h-2.5 w-2.5 rounded-full border-2"
            style={{ backgroundColor: s.dot, borderColor: theme.background }}
          />
        </View>

        {/* Content */}
        <VStack className="flex-1" space="xs">
          {/* Top row */}
          <HStack className="items-center justify-between">
            <Text
              bold
              className="text-base"
              numberOfLines={1}
              style={{ color: theme.text }}
            >
              {customerName}
            </Text>
            <Text bold className="text-base" style={{ color: theme.tint }}>
              {formatCurrency(price, currency)}
            </Text>
          </HStack>

          {/* Meta */}
          <HStack className="flex-wrap items-center" space="md">
            <HStack className="items-center" space="xs">
              <Icon
                as={() => (
                  <MaterialIcons color={iconColor} name="person" size={16} />
                )}
              />
              <Text className="text-sm" style={{ color: subText }}>
                {peopleCount} ppl
              </Text>
            </HStack>

            {roomName ? (
              <HStack className="items-center" space="xs">
                <Icon
                  as={() => (
                    <MaterialIcons
                      color={iconColor}
                      name="meeting-room"
                      size={16}
                    />
                  )}
                />
                <Text
                  className="text-sm"
                  numberOfLines={1}
                  style={{ color: subText }}
                >
                  {roomName}
                </Text>
              </HStack>
            ) : null}

            <HStack className="items-center" space="xs">
              <Icon
                as={() => (
                  <MaterialIcons color={iconColor} name="event" size={16} />
                )}
              />
              <Text className="text-sm" style={{ color: subText }}>
                {date} {time}
              </Text>
            </HStack>
          </HStack>

          {/* Status + actions */}
          <HStack className="items-center justify-between">
            <View
              className="flex-row items-center rounded-full px-2 py-1"
              style={{ backgroundColor: chipBg }}
            >
              <Icon
                as={() => (
                  <MaterialIcons color={s.chipText} name={s.icon} size={14} />
                )}
              />
              <Text
                bold
                className="ml-1.5 text-xs"
                numberOfLines={1}
                style={{ color: s.chipText }}
              >
                {statusText}
              </Text>
            </View>

            <HStack className="items-center" space="lg">
              {showMessage && (
                <Pressable
                  accessibilityLabel="Message customer"
                  accessibilityRole="button"
                  android_ripple={{
                    color: isDark
                      ? "rgba(255,255,255,0.08)"
                      : "rgba(0,0,0,0.06)",
                  }}
                  hitSlop={8}
                  onPress={pressMessage}
                >
                  <Icon
                    as={() => (
                      <MaterialIcons
                        color={iconColor}
                        name="message"
                        size={20}
                      />
                    )}
                  />
                </Pressable>
              )}
              {showChevron && (
                <Icon
                  as={() => (
                    <MaterialIcons
                      color={iconColor}
                      name="chevron-right"
                      size={22}
                    />
                  )}
                />
              )}
            </HStack>
          </HStack>
        </VStack>
      </HStack>
    </Pressable>
  );
});
