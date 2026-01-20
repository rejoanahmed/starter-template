import { Colors } from "@app/constants/Colors";
import { useColorScheme } from "nativewind";
import { useEffect, useMemo, useState } from "react";
import { I18nManager, Platform, Pressable, Text, View } from "react-native";
import { Calendar, type DateData } from "react-native-calendars";

type DateRangePickerProps = {
  dates: { start: Date | null; end: Date | null };
  onChange: (dates: { start: Date | null; end: Date | null }) => void;
  testID?: string;
};

/* ----------------- utils ----------------- */
const startOfDay = (d: Date) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};
const sameDay = (a?: Date | null, b?: Date | null) =>
  !!a && !!b && startOfDay(a).getTime() === startOfDay(b).getTime();
const fmt = (d: Date) => {
  const x = startOfDay(d);
  const y = x.getFullYear();
  const m = String(x.getMonth() + 1).padStart(2, "0");
  const dd = String(x.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
};
const addDays = (d: Date, n: number) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};

/** Turn #RRGGBB into #RRGGBBAA */
const hexWithAlpha = (hex: string, alpha: number) => {
  const a = Math.round(Math.min(1, Math.max(0, alpha)) * 255);
  const aa = a.toString(16).padStart(2, "0");
  return hex.length === 7 ? `${hex}${aa}` : hex; // if already RGBA, leave as-is
};

export default function DateRangePicker({
  dates,
  onChange,
  testID = "date-range-picker",
}: DateRangePickerProps) {
  const { colorScheme = "light" } = useColorScheme();
  const theme = Colors[colorScheme];
  const isDark = colorScheme === "dark";
  const isRTL = I18nManager.isRTL;

  const today = startOfDay(new Date());
  const minDate = fmt(today);

  // staged selection (Apply UX)
  const [stagedStart, setStagedStart] = useState<Date | null>(
    dates.start ? startOfDay(dates.start) : null
  );
  const [stagedEnd, setStagedEnd] = useState<Date | null>(
    dates.end ? startOfDay(dates.end) : null
  );

  useEffect(() => {
    setStagedStart(dates.start ? startOfDay(dates.start) : null);
    setStagedEnd(dates.end ? startOfDay(dates.end) : null);
  }, [dates.start, dates.end]);

  const changed =
    (stagedStart?.getTime() || null) !== (dates.start?.getTime() || null) ||
    (stagedEnd?.getTime() || null) !== (dates.end?.getTime() || null);

  // tokens (derived from theme)
  // Stronger mid-range fill in dark so dates don’t disappear; lighter in light.
  const midColor = useMemo(
    () => hexWithAlpha(theme.tint, isDark ? 0.3 : 0.22),
    [theme.tint, isDark]
  );
  const midTextColor = isDark ? Colors.dark.background : theme.text; // white on dark, normal text on light
  const dividerColor = useMemo(
    () => hexWithAlpha(theme.icon, 0.25),
    [theme.icon]
  );
  const borderColor = useMemo(
    () => hexWithAlpha(theme.icon, 0.35),
    [theme.icon]
  );
  const rippleLight = useMemo(
    () => hexWithAlpha(theme.icon, 0.07),
    [theme.icon]
  );

  // markings
  const markedDates = useMemo(() => {
    const marks: Record<string, any> = {};
    if (stagedStart && stagedEnd) {
      let cursor = stagedStart;
      let i = 0;
      while (cursor <= stagedEnd) {
        const key = fmt(cursor);
        const isFirst = i === 0;
        const isLast = sameDay(cursor, stagedEnd);
        const isEdge = isFirst || isLast;

        marks[key] = {
          startingDay: isFirst,
          endingDay: isLast,
          color: isEdge ? theme.tint : midColor,
          // ✅ Ensure the mid-range text is visible in dark mode
          textColor: isEdge ? Colors.dark.background : midTextColor,
        };

        cursor = addDays(cursor, 1);
        i++;
      }
    } else if (stagedStart && !stagedEnd) {
      const k = fmt(stagedStart);
      marks[k] = {
        startingDay: true,
        endingDay: true,
        color: theme.tint,
        textColor: Colors.dark.background,
      };
    }
    return marks;
  }, [stagedStart, stagedEnd, theme.tint, midColor, midTextColor]);

  const onDayPress = (day: DateData) => {
    const d = startOfDay(new Date(day.year, day.month - 1, day.day));
    if (d < today) {
      return;
    }
    if (!stagedStart) {
      setStagedStart(d);
      setStagedEnd(null);
      return;
    }
    if (stagedStart && !stagedEnd) {
      if (d < stagedStart) {
        setStagedStart(d);
        setStagedEnd(null);
        return;
      }
      // Allow same-day bookings (start and end on same day)
      setStagedEnd(d);
      return;
    }
    // Reset selection
    setStagedStart(d);
    setStagedEnd(null);
  };

  const clear = () => {
    setStagedStart(null);
    setStagedEnd(null);
    onChange({ start: null, end: null });
  };
  const apply = () => {
    // If only start date is selected, use it as both start and end (same-day booking)
    onChange({
      start: stagedStart,
      end: stagedEnd || stagedStart,
    });
  };

  return (
    <View
      accessibilityLabel="Date Range Picker"
      accessible
      className="m-4 rounded-2xl p-4"
      style={{
        backgroundColor: theme.background,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: colorScheme === "dark" ? 0.25 : 0.08,
        shadowRadius: 6,
        elevation: 3,
        borderWidth: 1,
        borderColor,
      }}
      testID={testID}
    >
      <Calendar
        enableSwipeMonths
        firstDay={1}
        hideExtraDays
        markedDates={markedDates}
        markingType="period"
        minDate={minDate}
        onDayPress={onDayPress}
        style={{ borderRadius: 12, overflow: "hidden", paddingVertical: 4 }}
        theme={{
          backgroundColor: theme.background,
          calendarBackground: theme.background,

          // header
          monthTextColor: theme.text,
          textMonthFontWeight: "700",
          textMonthFontSize: 14,
          arrowColor: theme.tint,

          // weekdays
          textSectionTitleColor: theme.icon,
          textDayHeaderFontWeight: "600",
          textDayHeaderFontSize: 11,

          // days
          dayTextColor: theme.text,
          textDayFontWeight: "500",
          textDayFontSize: 13,
          textDisabledColor: hexWithAlpha(theme.icon, 0.5),

          // today / selected (start & end rely on markedDates; these are fallbacks)
          todayTextColor: theme.tint,
          selectedDayBackgroundColor: theme.tint,
          selectedDayTextColor: Colors.dark.background,
        }}
      />

      {/* Divider */}
      <View
        style={{
          borderTopWidth: 1,
          borderTopColor: dividerColor,
          marginTop: 10,
          marginBottom: 10,
        }}
      />

      {/* Footer */}
      <View
        style={{
          flexDirection: isRTL ? "row-reverse" : "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text style={{ color: theme.text }}>
          {stagedStart && stagedEnd
            ? stagedStart.getTime() === stagedEnd.getTime()
              ? stagedStart.toLocaleDateString()
              : `${stagedStart.toLocaleDateString()} – ${stagedEnd.toLocaleDateString()}`
            : stagedStart
              ? `${stagedStart.toLocaleDateString()}`
              : "Select dates"}
        </Text>

        <View style={{ flexDirection: "row" }}>
          <Pressable
            accessibilityLabel="Clear dates"
            accessibilityRole="button"
            android_ripple={
              Platform.OS === "android" ? { color: rippleLight } : undefined
            }
            onPress={clear}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 12,
              borderWidth: 1,
              borderColor,
              backgroundColor: theme.background,
              marginRight: 8,
            }}
          >
            <Text style={{ color: theme.text, fontWeight: "600" }}>Clear</Text>
          </Pressable>

          <Pressable
            accessibilityLabel="Apply date range"
            accessibilityRole="button"
            android_ripple={
              Platform.OS === "android"
                ? { color: hexWithAlpha(theme.text, 0.12) }
                : undefined
            }
            disabled={!(stagedStart && changed)}
            onPress={apply}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 12,
              backgroundColor:
                stagedStart && changed
                  ? theme.tint
                  : hexWithAlpha(theme.tint, 0.2),
              opacity: stagedStart && changed ? 1 : 0.95,
            }}
          >
            <Text
              style={{
                color:
                  stagedStart && changed
                    ? Colors.dark.background
                    : hexWithAlpha(Colors.dark.background, 0.8),
                fontWeight: "700",
              }}
            >
              Apply
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
