// store/useScheduleStore.ts
import { atom, useAtom } from "jotai";

export type CalendarEvent = {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  color: string;
  startHour: number; // Can be fractional (e.g., 14.5 for 2:30 PM)
  endHour: number; // Can be fractional (e.g., 15.75 for 3:45 PM)
  startTime?: string; // ISO datetime string for precise time
  endTime?: string; // ISO datetime string for precise time
};

export type DetailedCalendarEvent = CalendarEvent & {
  description?: string;
  peopleCount?: number;
  isCleaning?: boolean;
  cleaningParentId?: string;
};

// Atom to store events by date
const eventsByDateAtom = atom<Record<string, DetailedCalendarEvent[]>>({});

// Hook to use the schedule store
export const useScheduleStore = () => {
  const [eventsByDate, setEventsByDate] = useAtom(eventsByDateAtom);

  const setEventsForDate = (date: string, events: DetailedCalendarEvent[]) => {
    setEventsByDate((prev) => ({
      ...prev,
      [date]: events,
    }));
  };

  return {
    eventsByDate,
    setEventsForDate,
  };
};
