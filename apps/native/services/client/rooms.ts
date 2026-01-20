/**
 * TanStack Query hooks for room-related API calls
 * Provides caching, automatic refetching, and optimistic updates
 */

import { api } from "@app/lib/api-client";
import { useQuery } from "@tanstack/react-query";
import type { InferResponseType } from "hono/client";
import { parseResponse } from "hono/client";

// Infer response type from the API endpoint
type RoomsListResponse = InferResponseType<typeof api.api.rooms.$get>;
// The response is the JSON body with a 'rooms' property
export type Room = NonNullable<
  Extract<RoomsListResponse, { rooms: unknown }>["rooms"]
>[number];

/**
 * Search for rooms with filters
 * Automatically caches results and refetches on window focus
 */
export function useRooms(
  params: {
    district?: string;
    minPrice?: string;
    maxPrice?: string;
    minGuests?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: "rating_desc" | "created_desc";
    page?: number;
    limit?: number;
  } = {}
) {
  return useQuery({
    queryKey: ["rooms", params],
    queryFn: async () => {
      // Convert numbers to strings for query params (API expects strings)
      const queryParams = {
        ...params,
        page: params.page?.toString(),
        limit: params.limit?.toString(),
      };
      const result = await parseResponse(
        api.api.rooms.$get({ query: queryParams })
      ).catch((e) => {
        console.error("Failed to fetch rooms:", e);
        throw new Error(
          e instanceof Error ? e.message : "Failed to fetch rooms"
        );
      });
      return result;
    },
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
  });
}

/**
 * Get a specific room by ID
 * Caches individual room data
 */
export function useRoom(roomId: string, enabled = true) {
  return useQuery({
    queryKey: ["room", roomId],
    queryFn: async () => {
      const result = await parseResponse(
        api.api.rooms[":id"].$get({
          param: { id: roomId },
        })
      ).catch((e) => {
        console.error("Failed to fetch room:", e);
        throw new Error(
          e instanceof Error ? e.message : "Failed to fetch room"
        );
      });
      return result.room;
    },
    enabled: enabled && !!roomId,
    staleTime: 1000 * 60 * 10, // Room details stay fresh for 10 minutes
  });
}
