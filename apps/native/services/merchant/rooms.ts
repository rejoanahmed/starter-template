/**
 * Room service for merchants
 * Handles room creation, updates, status changes, and deletion
 * Includes React Query hooks for data fetching and mutations
 */

import { api } from "@app/lib/api-client";
import type { RoomDraftData } from "@app/lib/atoms/roomDraft";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { InferResponseType } from "hono/client";
import { parseResponse } from "hono/client";

// Type for React Native file object in FormData
type ReactNativeFile = {
  uri: string;
  name: string;
  type: string;
};

// Regex for extracting file extension - defined at top level for performance
const FILE_EXT_REGEX = /\.(\w+)$/;

/**
 * Custom error class for room creation errors
 */
export class RoomCreationError extends Error {
  code: string;
  details?: Record<string, unknown>;

  constructor(
    message: string,
    code: string,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "RoomCreationError";
    this.code = code;
    this.details = details;
  }
}

// Infer response type from the API endpoint
// InferResponseType returns the parsed JSON body type
type MerchantRoomsResponse = InferResponseType<
  typeof api.api.merchant.rooms.$get
>;
// The response is the JSON body with a 'rooms' property
export type Room = NonNullable<
  Extract<MerchantRoomsResponse, { rooms: unknown }>["rooms"]
>[number];

/**
 * Create a new room listing with comprehensive error handling
 * @param roomData - Complete room data from the multi-step form
 * @param onProgress - Optional callback for upload progress
 * @returns The created room object
 */
export async function createRoom(roomData: RoomDraftData): Promise<Room> {
  console.log("[Room Creation] Starting room creation process");

  try {
    // Validate required fields
    const hasName = roomData.name?.trim();
    if (!hasName) {
      throw new RoomCreationError(
        "Room name is required",
        "MISSING_ROOM_NAME",
        { roomData }
      );
    }

    if (!roomData.location) {
      throw new RoomCreationError(
        "Room location is required",
        "MISSING_LOCATION",
        { roomData }
      );
    }

    const hasPhotos = roomData.photos && roomData.photos.length > 0;
    if (!hasPhotos) {
      throw new RoomCreationError(
        "At least one photo is required",
        "NO_PHOTOS",
        { roomData }
      );
    }

    if (!roomData.coverId) {
      throw new RoomCreationError(
        "Cover photo must be selected",
        "NO_COVER_PHOTO",
        { roomData }
      );
    }

    console.log(
      `[Room Creation] Validated: ${roomData.name}, ${roomData.photos?.length || 0} photos`
    );

    // Prepare images array with metadata
    const images: ReactNativeFile[] = [];

    // Add each image file to the images array
    for (let i = 0; i < (roomData.photos?.length || 0); i++) {
      const photo = roomData.photos?.[i];

      // Extract filename from URI
      const uriParts = photo?.uri.split("/");
      const filename = uriParts?.at(-1) || "photo.jpg";

      // Extract file extension
      const match = FILE_EXT_REGEX.exec(filename);
      const type = match ? `image/${match[1]}` : "image/jpeg";

      // React Native file object format
      const file: ReactNativeFile = {
        uri: photo?.uri || "",
        name: filename,
        type,
      };

      images.push(file);

      console.log(
        `[Room Creation] Added photo ${i + 1}/${roomData.photos?.length || 0} - ${photo?.id}`
      );
    }

    // Prepare images metadata array
    const imagesMetadata = roomData.photos?.map((photo) => ({
      tempId: photo?.id || "",
      width: photo?.width || 0,
      height: photo?.height || 0,
    }));

    console.log("[Room Creation] Sending room data with images to API");

    // Send as plain object (Hono RPC client requirement)
    const res = await api.api.merchant.rooms.$post({
      form: {
        title: roomData.name,
        description: roomData.description,
        address: roomData.address,
        district: roomData.district,
        latitude: roomData.location.latitude.toString(),
        longitude: roomData.location.longitude.toString(),
        includedGuests: roomData.includedGuests || 1,
        hourlyTiers: JSON.stringify(roomData.hourlyTiers || []),
        extraPersonChargePerHour: roomData.extraPersonChargePerHour || 0,
        facilities: JSON.stringify(
          roomData.facilitiesData ||
            roomData.facilities?.reduce(
              (acc, key) => {
                acc[key] = [{ name: key }];
                return acc;
              },
              {} as Record<string, Array<{ name: string }>>
            ) ||
            {}
        ),
        coverId: roomData.coverId,
        policies: JSON.stringify({
          cancellation: roomData.cancellationPolicy,
        }),
        images: images as unknown as File[],
        imagesMetadata: JSON.stringify(imagesMetadata),
      },
    });

    if (!res.ok) {
      const error = await res.json();

      throw new RoomCreationError(
        error.error || "Failed to create room",
        "API_ERROR",
        {
          status: res.status,
          error: error.error || "Failed to create room",
        }
      );
    }

    const room = (await res.json()) as Room;
    console.log(`[Room Creation] Success! Room created with ID: ${room.id}`);

    return room;
  } catch (error) {
    // Log comprehensive error information
    console.error("[Room Creation] Failed:", {
      error,
      roomName: roomData.name,
      photoCount: roomData.photos?.length || 0,
      hasLocation: !!roomData.location,
      hasCoverId: !!roomData.coverId,
    });

    // Re-throw RoomCreationError as-is
    if (error instanceof RoomCreationError) {
      throw error;
    }

    // Wrap other errors
    throw new RoomCreationError(
      `Room creation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      "UNKNOWN_ERROR",
      { originalError: error, roomData }
    );
  }
}

export function useMercahntCreateRoom(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (roomData: RoomDraftData) => createRoom(roomData),
    onSuccess: (room) => {
      queryClient.setQueryData<Room[]>(["merchant", "rooms"], (old) => {
        if (!old) return old;
        return [...old, room];
      });
      queryClient.invalidateQueries({ queryKey: ["merchant", "rooms"] });
      onSuccess?.();
    },
    onError: (error) => {
      console.error("Failed to create room:", error);
      throw new Error(
        error instanceof Error ? error.message : "Failed to create room"
      );
    },
  });
}

/**
 * Get all rooms for the authenticated merchant
 * Automatically caches results and refetches on window focus
 */
export function useMerchantRooms() {
  return useQuery({
    queryKey: ["merchant", "rooms"],
    queryFn: async () => {
      const result = await parseResponse(api.api.merchant.rooms.$get()).catch(
        (e) => {
          console.error("Failed to fetch rooms:", e);
          throw new Error(
            e instanceof Error ? e.message : "Failed to fetch rooms"
          );
        }
      );
      return result.rooms || [];
    },
  });
}

/**
 * Get a single room by ID
 * Automatically caches results and refetches on window focus
 */
export function useRoom(roomId: string) {
  return useQuery({
    queryKey: ["merchant", "rooms", roomId],
    queryFn: async () => {
      const rooms = await parseResponse(api.api.merchant.rooms.$get()).catch(
        (e) => {
          console.error("Failed to fetch rooms:", e);
          throw new Error(
            e instanceof Error ? e.message : "Failed to fetch rooms"
          );
        }
      );
      const room = rooms.rooms?.find((r) => r.id === roomId);
      if (!room) {
        throw new Error("Room not found");
      }
      return room;
    },
    enabled: !!roomId,
  });
}

/**
 * Update room details
 * Automatically invalidates rooms list on success
 */
export function useUpdateRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      roomId,
      data,
    }: {
      roomId: string;
      data: Partial<{
        title: string;
        description: string;
        address: string;
        district: string;
        minGuests: number;
        maxGuests: number;
        extraGuestFeeEnabled: boolean;
        status: "active" | "inactive" | "draft";
      }>;
    }) => {
      const result = await parseResponse(
        api.api.merchant.rooms[":id"].$patch({
          param: { id: roomId },
          json: data,
        })
      ).catch((e) => {
        console.error("Failed to update room:", e);
        throw new Error(
          e instanceof Error ? e.message : "Failed to update room"
        );
      });
      return result;
    },
    onSuccess: (updatedRoom) => {
      // Update the specific room in cache
      queryClient.setQueryData<Room[]>(["merchant", "rooms"], (old) => {
        if (!old) return old;
        return old.map((room) =>
          room.id === updatedRoom.id ? updatedRoom : room
        );
      });
      // Update single room cache
      queryClient.setQueryData(
        ["merchant", "rooms", updatedRoom.id],
        updatedRoom
      );
      // Invalidate to ensure consistency
      queryClient.invalidateQueries({ queryKey: ["merchant", "rooms"] });
    },
  });
}

/**
 * Update room status (active/inactive/draft)
 * Automatically invalidates rooms list on success
 */
export function useUpdateRoomStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      roomId,
      status,
    }: {
      roomId: string;
      status: "active" | "inactive" | "draft";
    }) => {
      const result = await parseResponse(
        api.api.merchant.rooms[":id"].status.$patch({
          param: { id: roomId },
          json: { status },
        })
      ).catch((e) => {
        console.error("Failed to update room status:", e);
        throw new Error(
          e instanceof Error ? e.message : "Failed to update room status"
        );
      });
      return result;
    },
    onSuccess: (updatedRoom) => {
      // Update the specific room in cache
      queryClient.setQueryData<Room[]>(["merchant", "rooms"], (old) => {
        if (!old) return old;
        return old.map((room) =>
          room.id === updatedRoom.id ? updatedRoom : room
        );
      });
      // Also invalidate to ensure consistency
      queryClient.invalidateQueries({ queryKey: ["merchant", "rooms"] });
    },
  });
}

/**
 * Delete a room
 * Automatically invalidates rooms list on success
 */
export function useDeleteRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (roomId: string) => {
      await parseResponse(
        api.api.merchant.rooms[":id"].$delete({
          param: { id: roomId },
        })
      ).catch((e) => {
        console.error("Failed to delete room:", e);
        throw new Error(
          e instanceof Error ? e.message : "Failed to delete room"
        );
      });
      return roomId;
    },
    onSuccess: (deletedRoomId) => {
      // Remove the room from cache
      queryClient.setQueryData<Room[]>(["merchant", "rooms"], (old) => {
        if (!old) return old;
        return old.filter((room) => room.id !== deletedRoomId);
      });
      // Also invalidate to ensure consistency
      queryClient.invalidateQueries({ queryKey: ["merchant", "rooms"] });
    },
  });
}
