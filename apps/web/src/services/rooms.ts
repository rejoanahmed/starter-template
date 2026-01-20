import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { RoomListingFormData } from "@web/components/room-listing/schema";
import { api } from "@web/lib/api-client";
import type { InferResponseType } from "hono/client";

// Infer response type from the API endpoint
type MerchantRoomsResponse = InferResponseType<
  typeof api.api.merchant.rooms.$get
>;
export type Room = NonNullable<
  Extract<MerchantRoomsResponse, { rooms: unknown }>["rooms"]
>[number];

/**
 * Extract image dimensions from a File
 */
function getImageDimensions(
  file: File
): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({ width: 0, height: 0 });
    };
    img.src = url;
  });
}

/**
 * Create a new room listing
 */
export async function createRoom(roomData: RoomListingFormData): Promise<Room> {
  // Validate required fields
  if (!roomData.name?.trim()) {
    throw new Error("Room name is required");
  }

  if (!roomData.location) {
    throw new Error("Room location is required");
  }

  if (!roomData.photos || roomData.photos.length === 0) {
    throw new Error("At least one photo is required");
  }

  if (!roomData.coverId) {
    throw new Error("Cover photo must be selected");
  }

  if (!roomData.address?.trim()) {
    throw new Error("Address is required");
  }

  if (!roomData.district?.trim()) {
    throw new Error("District is required");
  }

  // Prepare FormData
  const formData = new FormData();
  formData.append("title", roomData.name);
  formData.append("description", roomData.description || "");
  formData.append("address", roomData.address);
  formData.append("district", roomData.district);
  formData.append("latitude", roomData.location.latitude.toString());
  formData.append("longitude", roomData.location.longitude.toString());
  formData.append("includedGuests", (roomData.includedGuests || 1).toString());
  formData.append(
    "basePricePerHour",
    (roomData.basePricePerHour || 0).toString()
  );
  formData.append("minimumHours", (roomData.minimumHours || 1).toString());
  formData.append(
    "discountPercentage",
    (roomData.discountPercentage || 0).toString()
  );
  formData.append(
    "maxGuests",
    (roomData.maxGuests || roomData.includedGuests || 1).toString()
  );
  formData.append(
    "extraPersonCharge",
    (roomData.extraPersonChargePerHour || 0).toString()
  );
  formData.append("facilities", JSON.stringify(roomData.facilitiesData || {}));
  formData.append("coverId", roomData.coverId);
  formData.append(
    "policies",
    JSON.stringify({
      cancellation: roomData.cancellationPolicy,
    })
  );

  // Extract image dimensions and add images
  const imagesMetadata: Array<{
    tempId: string;
    width: number;
    height: number;
  }> = [];

  for (const photo of roomData.photos) {
    formData.append("images", photo.file);
    const dimensions = await getImageDimensions(photo.file);
    imagesMetadata.push({
      tempId: photo.id,
      width: dimensions.width,
      height: dimensions.height,
    });
  }

  formData.append("imagesMetadata", JSON.stringify(imagesMetadata));

  // Debug: Log FormData contents (for development only)
  if (import.meta.env.DEV) {
    console.log("[createRoom] FormData entries:");
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`  ${key}: File(${value.name}, ${value.size} bytes)`);
      } else {
        console.log(`  ${key}:`, value);
      }
    }
  }

  // Hono RPC client doesn't properly handle FormData with multiple files
  // Use Hono client to build the URL, then use fetch with FormData for proper multipart handling
  const url = api.api.merchant.rooms.$url();
  const res = await fetch(url, {
    method: "POST",
    body: formData,
    credentials: "include",
    // Don't set Content-Type header - browser will set it with boundary for multipart/form-data
  });

  if (!res.ok) {
    const error = (await res.json()) as { message?: string };
    throw new Error(error.message || "Failed to create room");
  }
  const data = await res.json();
  return data as Room;
}

export function useCreateRoom(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (roomData: RoomListingFormData) => createRoom(roomData),
    onSuccess: (room) => {
      queryClient.setQueryData<Room[]>(["merchant", "rooms"], (old) => {
        if (!old) return old;
        return [...old, room];
      });
      queryClient.invalidateQueries({ queryKey: ["merchant", "rooms"] });
      onSuccess?.();
    },
  });
}

export function useGetMerchantRooms() {
  return useQuery({
    queryKey: ["merchant", "rooms"],
    queryFn: async () => {
      const res = await api.api.merchant.rooms.$get();
      if (!res.ok) {
        throw new Error("Failed to fetch rooms");
      }
      const data = await res.json();
      return data.rooms || [];
    },
  });
}

export async function updateRoom(
  id: string,
  roomData: Partial<RoomListingFormData>
): Promise<Room> {
  const res = await fetch(`/api/merchant/rooms/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(roomData),
  });

  if (!res.ok) {
    const error = (await res.json()) as { message?: string };
    throw new Error(error.message || "Failed to update room");
  }

  return (await res.json()) as Room;
}

export function useUpdateRoom(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      roomData,
    }: {
      id: string;
      roomData: Partial<RoomListingFormData>;
    }) => updateRoom(id, roomData),
    onSuccess: (room) => {
      queryClient.setQueryData<Room[]>(["merchant", "rooms"], (old) => {
        if (!old) return old;
        return old.map((r) => (r.id === room.id ? room : r));
      });
      queryClient.invalidateQueries({ queryKey: ["merchant", "rooms"] });
      onSuccess?.();
    },
  });
}
