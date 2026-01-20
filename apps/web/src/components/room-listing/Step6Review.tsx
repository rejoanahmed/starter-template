"use client";

import { useStore } from "@tanstack/react-form";
import { withFieldGroup } from "@web/components/form";
import { Button } from "@web/components/ui/button";
import { CheckCircle2 } from "lucide-react";

type Step6Fields = {
  name: string;
  description: string;
  address: string;
  district: string;
  location: {
    latitude: number;
    longitude: number;
  } | null;
  photos: Array<{
    file: File;
    preview: string;
    id: string;
  }>;
  coverId: string;
  facilitiesData?: Record<string, Array<{ name: string; icon?: string }>>;
  basePricePerHour: number;
  minimumHours: number;
  discountPercentage: number;
  includedGuests: number;
  maxGuests: number;
  extraPersonChargePerHour: number;
};

const defaultValues: Step6Fields = {
  name: "",
  description: "",
  address: "",
  district: "",
  location: null,
  photos: [],
  coverId: "",
  facilitiesData: {},
  basePricePerHour: 0,
  minimumHours: 1,
  discountPercentage: 0,
  includedGuests: 1,
  maxGuests: 1,
  extraPersonChargePerHour: 0,
};

export const Step6Review = withFieldGroup({
  defaultValues,
  props: {
    onSubmit: () => {},
    onBack: () => {},
    isSubmitting: false,
  },
  render({ group, onSubmit, onBack, isSubmitting }) {
    // Get all values from store
    const name = useStore(group.store, (state) => state.values.name);
    const description = useStore(
      group.store,
      (state) => state.values.description
    );
    const address = useStore(group.store, (state) => state.values.address);
    const photos = useStore(group.store, (state) => state.values.photos || []);
    const coverId = useStore(group.store, (state) => state.values.coverId);
    const facilitiesData = useStore(
      group.store,
      (state) => state.values.facilitiesData || {}
    );
    const basePricePerHour = useStore(
      group.store,
      (state) => state.values.basePricePerHour || 0
    );
    const minimumHours = useStore(
      group.store,
      (state) => state.values.minimumHours || 1
    );
    const discountPercentage = useStore(
      group.store,
      (state) => state.values.discountPercentage || 0
    );
    const extraPersonChargePerHour = useStore(
      group.store,
      (state) => state.values.extraPersonChargePerHour || 0
    );
    const includedGuests = useStore(
      group.store,
      (state) => state.values.includedGuests || 1
    );
    const maxGuests = useStore(
      group.store,
      (state) => state.values.maxGuests || 1
    );

    const amenities = Object.values(facilitiesData).flat();
    const canProceed = true;

    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="text-sm font-medium text-gray-500 mb-2">Step 6</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Review & Confirm
          </h1>
          <p className="text-lg text-gray-600">
            Please review all your listing details before submitting. Your
            listing will be saved with approval set to false.
          </p>
        </div>

        <div className="space-y-8">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">
              Basic Information
            </h2>
            <div className="space-y-3">
              <div className="flex gap-4">
                <span className="font-medium text-gray-700 min-w-[120px]">
                  Title:
                </span>
                <span className="text-gray-900" data-testid="review-title">
                  {name}
                </span>
              </div>
              <div className="flex gap-4">
                <span className="font-medium text-gray-700 min-w-[120px]">
                  Description:
                </span>
                <span
                  className="text-gray-900"
                  data-testid="review-description"
                >
                  {description}
                </span>
              </div>
            </div>
          </div>

          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">
              Location
            </h2>
            <div className="space-y-3">
              <div className="flex gap-4">
                <span className="font-medium text-gray-700 min-w-[120px]">
                  Address:
                </span>
                <span className="text-gray-900">{address}</span>
              </div>
            </div>
          </div>

          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">
              Amenities ({amenities.length})
            </h2>
            {amenities.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {amenities.map((amenity) => (
                  <div
                    className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"
                    key={`${amenity.name}_${Math.random()}`}
                  >
                    <CheckCircle2 className="size-4 text-green-600 shrink-0" />
                    <span className="text-sm text-gray-900">
                      {amenity.name}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No amenities selected</p>
            )}
          </div>

          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">
              Photos ({photos.length}/5 minimum)
            </h2>
            {photos.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {photos.map((photo) => (
                  <div
                    className="aspect-square rounded-lg overflow-hidden relative"
                    key={photo.id}
                  >
                    <div
                      aria-label="Room preview"
                      className="w-full h-full"
                      role="img"
                      style={{
                        backgroundImage: `url(${photo.preview})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    />
                    {photo.id === coverId && (
                      <div className="absolute inset-0 ring-4 ring-blue-500 rounded-lg pointer-events-none" />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No photos uploaded</p>
            )}
            {photos.length < 5 && (
              <p className="text-amber-600 mt-4">
                Need at least 5 photos to submit
              </p>
            )}
          </div>

          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">
              Pricing
            </h2>
            <div className="space-y-3">
              <div className="flex gap-4">
                <span className="font-medium text-gray-700 min-w-[120px]">
                  Base Price:
                </span>
                <span className="text-gray-900" data-testid="review-base-price">
                  HKD {basePricePerHour}/hour
                </span>
              </div>
              <div className="flex gap-4">
                <span className="font-medium text-gray-700 min-w-[120px]">
                  Minimum Hours:
                </span>
                <span className="text-gray-900">{minimumHours} hours</span>
              </div>
              <div className="flex gap-4">
                <span className="font-medium text-gray-700 min-w-[120px]">
                  Discount:
                </span>
                <span className="text-gray-900">{discountPercentage}%</span>
              </div>
              <div className="flex gap-4">
                <span className="font-medium text-gray-700 min-w-[120px]">
                  Extra Person:
                </span>
                <span className="text-gray-900">
                  HKD {extraPersonChargePerHour}/hour
                </span>
              </div>
              <div className="flex gap-4">
                <span className="font-medium text-gray-700 min-w-[120px]">
                  Guests:
                </span>
                <span className="text-gray-900">
                  {includedGuests} included, up to {maxGuests}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-between items-center pt-6">
          <Button onClick={onBack} variant="outline">
            Back
          </Button>
          <Button
            data-testid="submit-listing"
            disabled={!canProceed || isSubmitting || photos.length < 5}
            onClick={onSubmit}
          >
            {isSubmitting ? "Submitting..." : "Submit Listing"}
          </Button>
        </div>
      </div>
    );
  },
});
