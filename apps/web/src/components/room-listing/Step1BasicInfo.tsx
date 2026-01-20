"use client";

import { useStore } from "@tanstack/react-form";
import { withFieldGroup } from "@web/components/form";
import { Button } from "@web/components/ui/button";
import { z } from "zod";

type Step1Fields = {
  name: string;
  description: string;
};

const defaultValues: Step1Fields = {
  name: "",
  description: "",
};

export const Step1BasicInfo = withFieldGroup({
  defaultValues,
  props: {
    onNext: () => {},
  },
  render({ group, onNext }) {
    // Get field values for validation
    const name = useStore(group.store, (state) => state.values.name);
    const description = useStore(
      group.store,
      (state) => state.values.description
    );

    const canProceed = name?.trim() && description?.trim();

    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="text-sm font-medium text-gray-500 mb-2">Step 1</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Basic Listing Info
          </h1>
          <p className="text-lg text-gray-600">
            Tell us about your place with a title and description. These will
            help guests understand what makes your space special.
          </p>
        </div>

        <div className="space-y-6">
          <group.AppField
            name="name"
            validators={{
              onChange: z
                .string()
                .min(1, "Title is required")
                .max(100, "Title must be less than 100 characters"),
            }}
          >
            {(field) => (
              <field.Text
                data-testid="listing-title"
                label="Title"
                maxLength={100}
                placeholder="e.g., Cozy studio in central Jakarta"
              />
            )}
          </group.AppField>

          <group.AppField
            name="description"
            validators={{
              onChange: z
                .string()
                .min(1, "Description is required")
                .max(500, "Description must be less than 500 characters"),
            }}
          >
            {(field) => (
              <field.TextArea
                data-testid="listing-description"
                description={`${description?.length || 0}/500 characters`}
                label="Description"
                maxLength={500}
                placeholder="Share what makes your place special..."
                rows={6}
              />
            )}
          </group.AppField>
        </div>

        <div className="mt-8 flex justify-between items-center border-t pt-6">
          <div />
          <Button
            data-testid="step-1-next"
            disabled={!canProceed}
            onClick={onNext}
          >
            Next
          </Button>
        </div>
      </div>
    );
  },
});
