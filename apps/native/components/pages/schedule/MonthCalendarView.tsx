/** biome-ignore-all lint/suspicious/noArrayIndexKey: reason */

import { Button } from "@app/components/ui/button";
import { HStack } from "@app/components/ui/hstack";
import { Text } from "@app/components/ui/text";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useColorScheme } from "nativewind";
import { useState } from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";

type MonthCalendarViewProps = {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  events: Array<{
    id: string;
    date: string;
    title: string;
    color: string;
  }>;
};

export function MonthCalendarView({
  selectedDate,
  onSelectDate,
  events,
}: MonthCalendarViewProps) {
  const { colorScheme } = useColorScheme();
  const [currentMonth, setCurrentMonth] = useState(
    new Date(selectedDate || new Date())
  );

  const isDark = colorScheme === "dark";
  const iconColor = isDark ? "#999" : "#666";

  // Generate calendar days
  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: Array<{
      date: Date;
      dateString: string;
      isCurrentMonth: boolean;
      isToday: boolean;
      isSelected: boolean;
    }> = [];

    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay - i);
      days.push({
        date,
        dateString: date.toISOString().split("T")[0],
        isCurrentMonth: false,
        isToday: false,
        isSelected: false,
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const dateString = date.toISOString().split("T")[0];
      const today = new Date().toISOString().split("T")[0];
      days.push({
        date,
        dateString,
        isCurrentMonth: true,
        isToday: dateString === today,
        isSelected: dateString === selectedDate,
      });
    }

    // Next month days
    const remainingDays = 42 - days.length; // 6 rows * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i);
      days.push({
        date,
        dateString: date.toISOString().split("T")[0],
        isCurrentMonth: false,
        isToday: false,
        isSelected: false,
      });
    }

    return days;
  };

  const days = getDaysInMonth();

  const goToPrevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
    );
  };

  const goToNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
    );
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  // Get events for a specific date
  const getEventsForDate = (dateString: string) =>
    events.filter((event) => event.date === dateString);

  return (
    <View className="flex-1 bg-background-0">
      {/* Header */}
      <HStack className="items-center justify-between border-outline-100 border-b px-4 py-3">
        <HStack className="items-center" space="sm">
          <TouchableOpacity className="p-2" onPress={goToPrevMonth}>
            <MaterialIcons color={iconColor} name="chevron-left" size={24} />
          </TouchableOpacity>
          <Text className="font-bold text-2xl">
            {currentMonth.toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </Text>
          <TouchableOpacity className="p-2" onPress={goToNextMonth}>
            <MaterialIcons color={iconColor} name="chevron-right" size={24} />
          </TouchableOpacity>
        </HStack>

        <HStack className="items-center" space="sm">
          <Button
            className="rounded-full px-4"
            onPress={goToToday}
            variant="outline"
          >
            <Text>Today</Text>
          </Button>
          <TouchableOpacity className="flex-row items-center rounded-full border border-outline-200 px-4 py-2">
            <MaterialIcons color={iconColor} name="home" size={20} />
            <MaterialIcons
              color={iconColor}
              name="keyboard-arrow-down"
              size={16}
            />
          </TouchableOpacity>
        </HStack>
      </HStack>

      {/* Weekday Headers */}
      <View className="flex-row border-outline-200 border-b bg-background-50">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <View className="flex-1 py-2" key={day}>
            <Text className="text-center font-medium text-sm text-typography-600">
              {day}
            </Text>
          </View>
        ))}
      </View>

      {/* Calendar Grid */}
      <ScrollView className="flex-1">
        <View className="flex-1">
          {Array.from({ length: 6 }, (_, weekIndex) => (
            <View
              className="flex-row"
              key={`week-${weekIndex}`}
              style={{ flex: 1 }}
            >
              {days
                .slice(weekIndex * 7, weekIndex * 7 + 7)
                .map((day, dayIndex) => {
                  const dayEvents = getEventsForDate(day.dateString);
                  return (
                    <TouchableOpacity
                      className={`flex-1 border-outline-100 border-r border-b p-1 ${
                        day.isCurrentMonth ? "" : "bg-background-50"
                      }`}
                      key={`day-${weekIndex}-${dayIndex}`}
                      onPress={() => onSelectDate(day.dateString)}
                      style={{ minHeight: 100 }}
                    >
                      {/* Day Number */}
                      <View
                        className={`mb-1 h-7 w-7 items-center justify-center rounded-full ${
                          day.isToday
                            ? "bg-primary-500"
                            : day.isSelected
                              ? "bg-primary-100"
                              : ""
                        }`}
                      >
                        <Text
                          className={`font-medium text-sm ${
                            day.isToday
                              ? "text-white"
                              : day.isCurrentMonth
                                ? "text-typography-900"
                                : "text-typography-400"
                          }`}
                        >
                          {day.date.getDate()}
                        </Text>
                      </View>

                      {/* Event Bars */}
                      <View className="flex-1">
                        {dayEvents.slice(0, 3).map((event) => (
                          <View
                            className="mb-1 rounded px-1 py-0.5"
                            key={event.id}
                            style={{ backgroundColor: event.color }}
                          >
                            <Text
                              className="font-medium text-white text-xs"
                              numberOfLines={1}
                            >
                              {event.title}
                            </Text>
                          </View>
                        ))}
                        {dayEvents.length > 3 && (
                          <Text className="text-typography-500 text-xs">
                            +{dayEvents.length - 3} more
                          </Text>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
