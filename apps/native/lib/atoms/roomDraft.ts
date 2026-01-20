import { atom } from "jotai";

export type RoomDraftData = {
  // Step 1: Basic info & location
  name: string;
  description: string;
  address: string;
  district: string;
  location: {
    latitude: number;
    longitude: number;
  } | null;

  // Step 2: Facilities & Capacity
  facilities?: string[]; // Keys for backward compatibility
  facilitiesData?: Record<string, Array<{ name: string; icon?: string }>>; // Full facility data with icons
  amenities?: string[];
  customAmenities?: string[];
  minGuests?: number;
  maxGuests?: number;
  extraGuestFeeEnabled?: boolean;

  // Step 3: Pricing
  includedGuests?: number;
  hourlyTiers?: Array<{ hours: number; price: number }>;
  extraPersonChargePerHour?: number;

  // Step 4: Photos - store complete photo objects with metadata
  photos?: Array<{
    uri: string;
    width: number;
    height: number;
    id: string;
  }>;
  coverId?: string;

  // Step 5: Policy
  cancellationPolicy?: {
    type: "lenient" | "strict";
    rules: Array<{ cutoff: string; refund: string }>;
  };

  // Add other fields as needed for your room creation flow
};

export const initialRoomDraft: RoomDraftData = {
  name: "",
  description: "",
  address: "",
  district: "",
  location: null,
};

// Atom to store the room draft data
export const roomDraftAtom = atom<RoomDraftData>(initialRoomDraft);
