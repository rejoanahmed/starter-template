import { HStack } from "@app/components/ui/hstack";
import { Text } from "@app/components/ui/text";
import {
  type TimeSelection,
  useAddBlockedTime,
  useDaySchedule,
} from "@app/services/merchant/schedule";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {
  CalendarBody,
  CalendarContainer,
  CalendarHeader,
  type EventItem,
  type OnCreateEventResponse,
} from "@howljs/calendar-kit";
import { useColorScheme } from "nativewind";
import { useCallback, useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { MonthCalendarView } from "./MonthCalendarView";
import { TimeBlockingModal } from "./TimeBlockingModal";

type TimelineViewProps = {
  date: string;
};

export function TimelineView({ date }: TimelineViewProps) {
  const { colorScheme } = useColorScheme();
  const [selectedDate, setSelectedDate] = useState(date);
  const [showDayView, setShowDayView] = useState(true); // Start with day view
  const [timeSelection, setTimeSelection] = useState<TimeSelection | null>(
    null
  );
  const [showActionButtons, setShowActionButtons] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [_editingEvent, setEditingEvent] = useState<EventItem | null>(null);

  const { data: schedule } = useDaySchedule(selectedDate);
  const addBlockedTimeMutation = useAddBlockedTime();

  const isDark = colorScheme === "dark";
  const iconColor = isDark ? "#999" : "#666";

  // Convert schedule data to calendar events with proper format
  const events: EventItem[] =
    schedule?.slots.map((slot) => ({
      id: slot.id,
      title: slot.type === "cleaning" ? "Cleaning" : slot.title || "Blocked",
      start: {
        dateTime: slot.startTime,
      },
      end: {
        dateTime: slot.endTime,
      },
      color: slot.type === "blocked" ? "#fef08a" : "#1e40af",
    })) || [];

  // Convert events to month view format
  const monthEvents = events.map((event) => {
    const startDate =
      typeof event.start === "object" &&
      "dateTime" in event.start &&
      event.start.dateTime
        ? new Date(event.start.dateTime).toISOString().split("T")[0]
        : selectedDate;
    return {
      id: event.id,
      date: startDate,
      title: event.title || "",
      color: event.color || "#86efac",
    };
  });

  const handleConfirmSelection = () => {
    if (timeSelection) {
      // Save event without modal - just with time
      addBlockedTimeMutation.mutate(
        {
          ...timeSelection,
          roomId: "default-room",
          title: "Blocked Time", // Default title
          description: "Time blocked by user", // Default description
          cleaningDuration: 60, // Default 1 hour
        },
        {
          onSuccess: () => {
            setTimeSelection(null);
            setShowActionButtons(false);
          },
        }
      );
    }
  };

  const handleCancelSelection = () => {
    setTimeSelection(null);
    setShowActionButtons(false);
  };

  const handleDragCreateStart = useCallback(() => {
    console.log("Drag started");
  }, []);

  const handleDragCreateEnd = useCallback((event: OnCreateEventResponse) => {
    console.log("Drag ended - showing action buttons:", event);

    // Parse the event times
    let startDate: Date;
    let endDate: Date;

    if (event.start instanceof Date) {
      startDate = event.start;
    } else if (typeof event.start === "object" && "dateTime" in event.start) {
      startDate = new Date(event.start.dateTime);
    } else {
      startDate = new Date(String(event.start));
    }

    if (event.end instanceof Date) {
      endDate = event.end;
    } else if (typeof event.end === "object" && "dateTime" in event.end) {
      endDate = new Date(event.end.dateTime);
    } else {
      endDate = new Date(String(event.end));
    }

    const startTime = startDate.toTimeString().substring(0, 5);
    const endTime = endDate.toTimeString().substring(0, 5);
    const dateStr = startDate.toISOString().split("T")[0];

    console.log("Time selection:", { startTime, endTime, dateStr });

    setTimeSelection({
      startTime,
      endTime,
      date: dateStr,
    });
    setShowActionButtons(true);
  }, []);

  // Handle event press - open modal to edit
  const handlePressEvent = useCallback((event: EventItem) => {
    console.log("Event pressed:", event);
    setEditingEvent(event);

    // Convert event to TimeSelection for modal
    const startDate =
      typeof event.start === "object" &&
      "dateTime" in event.start &&
      event.start.dateTime
        ? new Date(event.start.dateTime)
        : event.start instanceof Date
          ? event.start
          : new Date(String(event.start));
    const endDate =
      typeof event.end === "object" &&
      "dateTime" in event.end &&
      event.end.dateTime
        ? new Date(event.end.dateTime)
        : event.end instanceof Date
          ? event.end
          : new Date(String(event.end));

    const startTime = startDate.toTimeString().substring(0, 5);
    const endTime = endDate.toTimeString().substring(0, 5);
    const dateStr = startDate.toISOString().split("T")[0];

    setTimeSelection({
      startTime,
      endTime,
      date: dateStr,
    });
    setShowEditModal(true);
  }, []);

  // Handle event long press
  const handleLongPressEvent = useCallback((event: EventItem) => {
    console.log("Event long-pressed:", event);
    // Could show delete option
  }, []);

  if (!showDayView) {
    // Month Calendar View
    return (
      <MonthCalendarView
        events={monthEvents}
        onSelectDate={(date) => {
          setSelectedDate(date);
          setShowDayView(true);
        }}
        selectedDate={selectedDate}
      />
    );
  }

  // Single Day Timeline View
  return (
    <View className="flex-1 bg-background-0">
      {/* Header */}
      <HStack className="items-center border-outline-100 border-b px-4 py-3">
        <TouchableOpacity
          className="-ml-2 p-2"
          onPress={() => setShowDayView(false)}
        >
          <MaterialIcons color={iconColor} name="chevron-left" size={24} />
        </TouchableOpacity>
        <Text className="ml-2 font-bold text-xl">
          {new Date(selectedDate).toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </Text>
      </HStack>

      {/* Calendar Kit Single Day Timeline */}
      <CalendarContainer
        allowDragToCreate={true}
        defaultDuration={60}
        dragStep={15}
        end={24}
        events={events}
        initialDate={selectedDate}
        numberOfDays={1}
        onDragCreateEventEnd={handleDragCreateEnd}
        onDragCreateEventStart={handleDragCreateStart}
        onLongPressEvent={handleLongPressEvent}
        onPressEvent={handlePressEvent}
        scrollByDay={true}
        scrollToNow={true}
        start={0}
        theme={{
          colors: {
            background: isDark ? "#1f2937" : "#ffffff",
            border: isDark ? "#374151" : "#e5e7eb",
            text: isDark ? "#f9fafb" : "#111827",
            primary: "#3b82f6",
          },
        }}
      >
        <CalendarHeader />
        <CalendarBody />
      </CalendarContainer>

      {/* Action Buttons (✓ and ✗) - Bottom Right Horizontal */}
      {showActionButtons && (
        <View className="absolute right-8 bottom-8">
          <HStack className="items-center" space="md">
            <TouchableOpacity
              className="h-14 w-14 items-center justify-center rounded-full bg-red-400 shadow-lg"
              onPress={handleCancelSelection}
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 5,
              }}
            >
              <MaterialIcons color="white" name="close" size={28} />
            </TouchableOpacity>
            <TouchableOpacity
              className="h-14 w-14 items-center justify-center rounded-full bg-green-400 shadow-lg"
              onPress={handleConfirmSelection}
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 5,
              }}
            >
              <MaterialIcons color="white" name="check" size={28} />
            </TouchableOpacity>
          </HStack>
        </View>
      )}

      {/* Edit Modal - Opens when clicking existing event */}
      <TimeBlockingModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingEvent(null);
        }}
        onConfirm={(cleaningDuration) => {
          if (timeSelection) {
            addBlockedTimeMutation.mutate(
              {
                ...timeSelection,
                roomId: "default-room",
                title: "Blocked Time",
                cleaningDuration,
              },
              {
                onSuccess: () => {
                  setTimeSelection(null);
                  setShowEditModal(false);
                  setEditingEvent(null);
                },
              }
            );
          }
        }}
        timeSelection={timeSelection}
      />
    </View>
  );
}
