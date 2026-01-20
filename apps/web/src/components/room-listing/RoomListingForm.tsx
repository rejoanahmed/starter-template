import { useRouter } from "@tanstack/react-router";
import { useAppForm } from "@web/components/form";
import type { Room } from "@web/services/rooms";
import { useCreateRoom } from "@web/services/rooms";
import { createStripeAccount } from "@web/services/stripe";
import { useState } from "react";
import { toast } from "sonner";
import { ListingCreatedDialog } from "../ListingCreatedDialog";
import { Step1BasicInfo } from "./Step1BasicInfo";
import { Step2Amenities } from "./Step2Amenities";
import { Step3Address } from "./Step3Address";
import { Step4Photos } from "./Step4Photos";
import { Step5Pricing } from "./Step5Pricing";
import { Step6Review } from "./Step6Review";
import {
  type RoomListingFormData,
  roomListingSchema,
  step1Schema,
  step2Schema,
  step3Schema,
  step4Schema,
  step5Schema,
} from "./schema";

const initialData: Partial<RoomListingFormData> = {
  name: "",
  description: "",
  address: "",
  district: "",
  maxGuests: 1,
  includedGuests: 1,
  hourlyTiers: [],
  extraPersonChargePerHour: 0,
  photos: [],
  amenities: [],
  cancellationPolicy: {
    type: "lenient",
    rules: [],
  },
  basePricePerHour: 0,
  minimumHours: 1,
  discountPercentage: 0,
};

export function RoomListingForm({
  initialData: propInitialData,
  mode = "create",
  onSubmit,
}: {
  initialData?: Partial<RoomListingFormData>;
  mode?: "create" | "edit";
  onSubmit?: () => void;
} = {}) {
  const [step, setStep] = useState(1);
  const [showDialog, setShowDialog] = useState(false);
  const [createdRoom, setCreatedRoom] = useState<Room | null>(null);
  const router = useRouter();
  const createRoomMutation = useCreateRoom();

  const form = useAppForm({
    defaultValues: {
      ...initialData,
      ...propInitialData,
    } as RoomListingFormData,
    validators: {
      onSubmit: roomListingSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        if (mode === "edit" && onSubmit) {
          onSubmit();
        } else {
          const room = await createRoomMutation.mutateAsync(value);
          setCreatedRoom(room);
          setShowDialog(true);
          toast.success("Listing submitted for approval!");
        }
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : `Failed to ${mode === "edit" ? "update" : "create"} listing`
        );
      }
    },
  });

  // Step validation schemas
  const stepSchemas = [
    step1Schema,
    step2Schema,
    step3Schema,
    step4Schema,
    step5Schema,
    null, // Step 6 is review only
  ];

  const handleNext = () => {
    if (step < 6) {
      // Validate current step
      const currentSchema = stepSchemas[step - 1];
      if (currentSchema) {
        const formData = form.state.values;
        // Zod will only validate fields in the schema, ignoring others
        const result = currentSchema.safeParse(formData);
        console.log(result.error, formData);

        if (!result.success) {
          console.log(result.error);
          toast.error("Please fix the errors before proceeding");
          return;
        }
      }
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    // Let the form's onSubmit validator handle validation
    await form.handleSubmit();
  };

  const handleStripeConnect = async () => {
    try {
      setShowDialog(false);

      const { url } = await createStripeAccount();

      window.location.href = url;
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to start Stripe Connect onboarding"
      );
      router.navigate({ to: "/host/listings" });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Progress bar */}
      <div className="border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5, 6].map((s) => (
              <div
                className={`flex-1 h-1 rounded-full transition-colors ${
                  step >= s ? "bg-red-600" : "bg-gray-200"
                }`}
                data-testid={`step-indicator-${s}`}
                key={s}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Step content */}
      <form.AppForm>
        {step === 1 && (
          <Step1BasicInfo
            fields={{
              name: "name",
              description: "description",
            }}
            form={form}
            onNext={handleNext}
          />
        )}
        {step === 2 && (
          <Step2Amenities
            fields={{ facilitiesData: "facilitiesData" }}
            form={form}
            onBack={handleBack}
            onNext={handleNext}
          />
        )}
        {step === 3 && (
          <Step3Address
            fields={{
              address: "address",
              district: "district",
              location: "location",
            }}
            form={form}
            onBack={handleBack}
            onNext={handleNext}
          />
        )}
        {step === 4 && (
          <Step4Photos
            fields={{
              photos: "photos",
              coverId: "coverId",
            }}
            form={form}
            onBack={handleBack}
            onNext={handleNext}
          />
        )}
        {step === 5 && (
          <Step5Pricing
            fields={{
              basePricePerHour: "basePricePerHour",
              minimumHours: "minimumHours",
              discountPercentage: "discountPercentage",
              includedGuests: "includedGuests",
              maxGuests: "maxGuests",
              extraPersonChargePerHour: "extraPersonChargePerHour",
            }}
            form={form}
            isSubmitting={createRoomMutation.isPending}
            onBack={handleBack}
            onNext={handleNext}
          />
        )}
        {step === 6 && (
          <Step6Review
            fields={{
              name: "name",
              description: "description",
              address: "address",
              district: "district",
              location: "location",
              photos: "photos",
              coverId: "coverId",
              facilitiesData: "facilitiesData",
              basePricePerHour: "basePricePerHour",
              minimumHours: "minimumHours",
              discountPercentage: "discountPercentage",
              includedGuests: "includedGuests",
              maxGuests: "maxGuests",
              extraPersonChargePerHour: "extraPersonChargePerHour",
            }}
            form={form}
            isSubmitting={createRoomMutation.isPending}
            onBack={handleBack}
            onSubmit={handleSubmit}
          />
        )}
      </form.AppForm>

      {createdRoom && (
        <ListingCreatedDialog
          onOpenChange={setShowDialog}
          onStripeConnect={handleStripeConnect}
          open={showDialog}
          room={createdRoom}
        />
      )}
    </div>
  );
}
