/**
 * Data transformation utilities for room management
 * Handles conversion between room draft format and API format
 */

import type { RoomDraftData } from "@app/lib/atoms/roomDraft";

/**
 * Transform room draft data to API format
 * Maps field names, converts data types, and nests structures
 */
export function transformRoomDraftToAPI(
  draft: RoomDraftData,
  uploadedPhotos: Array<{
    url: string;
    width: number;
    height: number;
    id: string;
  }>
): {
  title: string;
  description: string;
  address: string;
  district: string;
  latitude: string;
  longitude: string;
  amenities: string[];
  photos: Array<{ url: string; width: number; height: number; id: string }>;
  coverId: string;
  policies: {
    cancellation: {
      type: "lenient" | "strict";
      rules: Array<{ cutoff: string; refund: string }>;
    };
  };
} {
  // Validate required fields
  if (!draft.name) {
    throw new Error("Room name is required");
  }

  if (!draft.location) {
    throw new Error("Room location is required");
  }

  if (!draft.coverId) {
    throw new Error("Cover photo ID is required");
  }

  if (!draft.cancellationPolicy) {
    throw new Error("Cancellation policy is required");
  }

  // Field mapping: name → title
  const title = draft.name;

  // Coordinate conversion: number → string
  const latitude = draft.location.latitude.toString();
  const longitude = draft.location.longitude.toString();

  // Amenities array merging: combine amenities and customAmenities
  const amenities = [
    ...(draft.amenities || []),
    ...(draft.customAmenities || []),
  ];

  // Photo URI replacement: replace local URIs with R2 URLs
  const photos = uploadedPhotos;

  // Policy nesting: nest cancellation policy under policies object
  const policies = {
    cancellation: draft.cancellationPolicy,
  };

  return {
    title,
    description: draft.description || "",
    address: draft.address || "",
    district: draft.district || "",
    latitude,
    longitude,
    amenities,
    photos,
    coverId: draft.coverId,
    policies,
  };
}

/**
 * Map field name from draft to API format
 * Requirement 5.1: name → title
 */
export function mapFieldName(draftFieldName: string): string {
  const fieldMap: Record<string, string> = {
    name: "title",
  };

  return fieldMap[draftFieldName] || draftFieldName;
}

/**
 * Convert coordinates to string format
 * Requirement 5.2: Convert location coordinates to string format
 */
export function convertCoordinatesToString(location: {
  latitude: number;
  longitude: number;
}): { latitude: string; longitude: string } {
  return {
    latitude: location.latitude.toString(),
    longitude: location.longitude.toString(),
  };
}

/**
 * Merge amenities arrays
 * Requirement 5.3: Combine amenities and customAmenities into a single array
 */
export function mergeAmenities(
  amenities?: string[],
  customAmenities?: string[]
): string[] {
  return [...(amenities || []), ...(customAmenities || [])];
}

/**
 * Replace photo URIs with R2 URLs
 * Requirement 5.4: Replace local photo URIs with R2 URLs
 */
export function replacePhotoURIs(
  draftPhotos: Array<{
    uri: string;
    width: number;
    height: number;
    id: string;
  }>,
  uploadedPhotos: Array<{
    url: string;
    width: number;
    height: number;
    id: string;
  }>
): Array<{ url: string; width: number; height: number; id: string }> {
  // Create a map of photo IDs to uploaded URLs for quick lookup
  const photoMap = new Map(uploadedPhotos.map((p) => [p.id, p]));

  // Replace URIs with URLs, maintaining order
  return draftPhotos.map((draftPhoto) => {
    const uploadedPhoto = photoMap.get(draftPhoto.id);

    if (!uploadedPhoto) {
      throw new Error(
        `No uploaded photo found for draft photo ID: ${draftPhoto.id}`
      );
    }

    return uploadedPhoto;
  });
}

/**
 * Nest cancellation policy under policies object
 * Requirement 5.5: Nest cancellation policy under a "policies" object
 */
export function nestCancellationPolicy(cancellationPolicy: {
  type: "lenient" | "strict";
  rules: Array<{ cutoff: string; refund: string }>;
}): {
  policies: {
    cancellation: {
      type: "lenient" | "strict";
      rules: Array<{ cutoff: string; refund: string }>;
    };
  };
} {
  return {
    policies: {
      cancellation: cancellationPolicy,
    },
  };
}

/**
 * Validate room draft has all required fields
 */
// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Validation requires checking multiple fields with specific conditions
export function validateRoomDraft(draft: RoomDraftData): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  const hasName = draft.name?.trim();
  if (!hasName) {
    errors.push("Room name is required");
  }

  const hasDescription = draft.description?.trim();
  if (!hasDescription) {
    errors.push("Room description is required");
  }

  const hasAddress = draft.address?.trim();
  if (!hasAddress) {
    errors.push("Room address is required");
  }

  const hasDistrict = draft.district?.trim();
  if (!hasDistrict) {
    errors.push("Room district is required");
  }

  if (draft.location) {
    if (
      typeof draft.location.latitude !== "number" ||
      Number.isNaN(draft.location.latitude)
    ) {
      errors.push("Invalid latitude");
    }

    if (
      typeof draft.location.longitude !== "number" ||
      Number.isNaN(draft.location.longitude)
    ) {
      errors.push("Invalid longitude");
    }
  } else {
    errors.push("Room location is required");
  }

  if (!draft.photos || draft.photos.length === 0) {
    errors.push("At least one photo is required");
  }

  if (!draft.coverId) {
    errors.push("Cover photo must be selected");
  }

  if (!draft.cancellationPolicy) {
    errors.push("Cancellation policy is required");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
