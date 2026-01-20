import { z } from "zod";

// Step 1: Basic Info
export const step1Schema = z
  .object({
    name: z
      .string()
      .min(1, "Title is required")
      .max(100, "Title must be less than 100 characters"),
    description: z
      .string()
      .min(1, "Description is required")
      .max(500, "Description must be less than 500 characters"),
  })
  .required();

// Step 2: Amenities (optional - no required fields)
export const step2Schema = z
  .object({
    amenities: z.array(z.string()).default([]).optional(),
    facilitiesData: z
      .record(
        z.string(),
        z.array(
          z.object({
            name: z.string(),
            icon: z.string().optional(),
          })
        )
      )
      .optional(),
  })
  .passthrough();

// Step 3: Address
export const step3Schema = z.object({
  address: z.string().min(1, "Address is required"),
  district: z.string().min(1, "District is required"),
  location: z
    .object({
      latitude: z.number(),
      longitude: z.number(),
    })
    .refine((val) => val !== null, {
      message: "Location is required. Please select a location on the map.",
    }),
});

// Step 4: Photos
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

export const step4Schema = z
  .object({
    photos: z
      .array(
        z.object({
          file: z.instanceof(File),
          preview: z.string(),
          id: z.string(),
        })
      )
      .min(5, "At least 5 photos are required")
      .max(10, "Maximum 10 photos allowed")
      .refine(
        (photos) =>
          photos.every(
            (photo) =>
              photo.file.size <= MAX_FILE_SIZE &&
              ACCEPTED_IMAGE_TYPES.includes(photo.file.type)
          ),
        {
          message:
            "Each photo must be an image file (JPEG, PNG, or WebP) and cannot exceed 10MB",
        }
      ),
    coverId: z.string().min(1, "Cover photo must be selected"),
  })
  .refine(
    (data) => {
      const photoIds = data.photos.map((p) => p.id);
      return photoIds.includes(data.coverId);
    },
    {
      message: "Cover photo must be one of the uploaded photos",
      path: ["coverId"],
    }
  );

// Step 5: Pricing
export const step5Schema = z
  .object({
    basePricePerHour: z.number().min(0.01, "Base price must be greater than 0"),
    minimumHours: z.number().int().min(1, "Minimum hours must be at least 1"),
    discountPercentage: z
      .number()
      .min(0, "Discount must be at least 0")
      .max(100, "Discount must be at most 100"),
    includedGuests: z
      .number()
      .int()
      .min(1, "Included guests must be at least 1"),
    maxGuests: z.number().int().min(1, "Maximum guests must be at least 1"),
    extraPersonChargePerHour: z
      .number()
      .min(0, "Extra person charge must be at least 0"),
  })
  .refine((data) => data.maxGuests >= data.includedGuests, {
    message: "Maximum guests must be at least equal to included guests",
    path: ["maxGuests"],
  });

// Step 6: Review (no additional validation, just review)
export const step6Schema = z.object({
  cancellationPolicy: z
    .object({
      type: z.enum(["lenient", "strict"]),
      rules: z.array(
        z.object({
          cutoff: z.string(),
          refund: z.string(),
        })
      ),
    })
    .optional(),
});

// Complete form schema
export const roomListingSchema = step1Schema
  .extend(step2Schema.shape)
  .extend(step3Schema.shape)
  .extend(step4Schema.shape)
  .extend(step5Schema.shape)
  .extend(step6Schema.shape)
  .extend({
    hourlyTiers: z
      .array(
        z.object({
          startHour: z.number(),
          endHour: z.number(),
          price: z.number(),
          minGuests: z.number().optional(),
          maxGuests: z.number().optional(),
        })
      )
      .optional(),
    customAmenities: z.array(z.string()).optional(),
    minGuests: z.number().optional(),
    extraGuestFeeEnabled: z.boolean().optional(),
    policies: z
      .object({
        checkIn: z.string(),
        checkOut: z.string(),
        houseRules: z.array(z.string()),
      })
      .optional(),
  });

export type RoomListingFormData = z.infer<typeof roomListingSchema>;
