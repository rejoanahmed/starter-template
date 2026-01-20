/**
 * Schedule service for merchant schedule management
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api-client";

export type TimeSlotType = "booking" | "blocked" | "cleaning";

export type TimeSlot = {
  id: string;
  roomId: string;
  date: string;
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  type: TimeSlotType;
  title: string;
  description?: string;
  guestCount?: number;
  guestName?: string;
  cleaningDuration?: number;
  bookingId?: string;
  createdAt: string;
  updatedAt: string;
};

export type TimeSelection = {
  date: string;
  startTime: string;
  endTime: string;
};

export type CreateBlockedTimeInput = {
  roomId: string;
  date: string;
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  title: string;
  description?: string;
  cleaningDuration?: number;
};

export type ConflictingItem = {
  id: string;
  type: "booking" | "blocked" | "cleaning";
  startAt: string;
  endAt: string;
  title?: string;
};

export type OverlapError = {
  error: string;
  details?: {
    conflictingItems?: ConflictingItem[];
  };
};

export const scheduleService = {
  /**
   * Get all time slots for a specific room and date range (for month view)
   */
  async getMonthSchedule(roomId: string, startDate: string, endDate: string) {
    const res = await api.api.merchant.schedule[":roomId"].range[":startDate"][
      ":endDate"
    ].$get({
      param: { roomId, startDate, endDate },
    });
    if (!res.ok) {
      throw new Error(`API Error: ${res.status}`);
    }
    return await res.json();
  },

  /**
   * Get all time slots for a specific room and date
   */
  async getDaySchedule(roomId: string, date: string) {
    const res = await api.api.merchant.schedule[":roomId"][":date"].$get({
      param: { roomId, date },
    });
    if (!res.ok) {
      throw new Error(`API Error: ${res.status}`);
    }
    return await res.json();
  },

  /**
   * Create a blocked time period with automatic cleaning slot
   */
  async createBlockedTime(data: CreateBlockedTimeInput) {
    const res = await api.api.merchant.schedule.block.$post({
      json: data,
    });
    if (!res.ok) {
      const errorData = (await res.json()) as OverlapError;

      // Create enhanced error with conflict details
      const error = new Error(
        errorData.error || `API Error: ${res.status}`
      ) as Error & {
        conflictingItems?: ConflictingItem[];
      };

      if (errorData.details?.conflictingItems) {
        error.conflictingItems = errorData.details.conflictingItems;
      }

      throw error;
    }
    return await res.json();
  },

  /**
   * Delete a time slot (only blocked/cleaning, not bookings)
   */
  async deleteTimeSlot(id: string) {
    const res = await api.api.merchant.schedule.slots[":id"].$delete({
      param: { id },
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || `API Error: ${res.status}`);
    }
    return await res.json();
  },

  /**
   * Update a blocked time slot
   */
  async updateBlockedTime(
    id: string,
    data: {
      date: string;
      startTime: string;
      endTime: string;
      title?: string;
      description?: string;
    }
  ) {
    const res = await api.api.merchant.schedule.slots[":id"].$patch({
      param: { id },
      json: data,
    });
    if (!res.ok) {
      const errorData = (await res.json()) as OverlapError;

      // Create enhanced error with conflict details
      const error = new Error(
        errorData.error || `API Error: ${res.status}`
      ) as Error & {
        conflictingItems?: ConflictingItem[];
      };

      if (errorData.details?.conflictingItems) {
        error.conflictingItems = errorData.details.conflictingItems;
      }

      throw error;
    }
    return await res.json();
  },

  /**
   * Format time from Date to HH:mm string
   */
  formatTime(date: Date): string {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  },

  /**
   * Parse HH:mm string to hours and minutes
   */
  parseTime(timeStr: string): { hours: number; minutes: number } {
    const [hours, minutes] = timeStr.split(":").map(Number);
    return { hours, minutes };
  },

  /**
   * Check if two time ranges overlap
   */
  timeRangesOverlap(
    start1: string,
    end1: string,
    start2: string,
    end2: string
  ): boolean {
    const toMinutes = (time: string) => {
      const { hours, minutes } = this.parseTime(time);
      return hours * 60 + minutes;
    };

    const s1 = toMinutes(start1);
    const e1 = toMinutes(end1);
    const s2 = toMinutes(start2);
    const e2 = toMinutes(end2);

    // Handle overnight slots
    const e1Adjusted = e1 < s1 ? e1 + 24 * 60 : e1;
    const e2Adjusted = e2 < s2 ? e2 + 24 * 60 : e2;

    return s1 < e2Adjusted && s2 < e1Adjusted;
  },
};

/**
 * React Query hook to fetch day schedule
 */
export function useDaySchedule(date: string, roomId = "default-room") {
  return useQuery({
    queryKey: ["schedule", roomId, date],
    queryFn: () => scheduleService.getDaySchedule(roomId, date),
    enabled: !!date && !!roomId,
  });
}

/**
 * React Query mutation hook to add blocked time
 */
export function useAddBlockedTime() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBlockedTimeInput & TimeSelection) => {
      const { date, startTime, endTime, ...rest } = data;
      return scheduleService.createBlockedTime({
        roomId: rest.roomId || "default-room",
        date,
        startTime,
        endTime,
        title: rest.title || "Blocked Time",
        description: rest.description,
        cleaningDuration: rest.cleaningDuration,
      });
    },
    onSuccess: (_, variables) => {
      // Invalidate the schedule query for the affected date
      queryClient.invalidateQueries({
        queryKey: [
          "schedule",
          variables.roomId || "default-room",
          variables.date,
        ],
      });
    },
  });
}

export default scheduleService;
