"use client";

import { useStore } from "@tanstack/react-form";
import { withFieldGroup } from "@web/components/form";
import { Button } from "@web/components/ui/button";
import { AMENITIES_CATEGORIES } from "@web/constants/amenities";
import {
  Check,
  ChevronDown,
  ChevronUp,
  CircleDollarSign,
  CupSoda,
  Dice6,
  Gamepad2,
  Grid3x3,
  type LucideIcon,
  Mic,
  Puzzle,
  Refrigerator,
  Sofa,
  Speaker,
  SquareStack,
  Toilet,
  Tv,
  Wifi,
  Wind,
} from "lucide-react";
import { useState } from "react";

type Step2Fields = {
  facilitiesData?: Record<string, Array<{ name: string; icon?: string }>>;
};

const defaultValues: Step2Fields = {
  facilitiesData: {},
};

const iconMap: Record<string, LucideIcon> = {
  wifi: Wifi,
  "air-conditioner": Wind,
  toilet: Toilet,
  sofa: Sofa,
  "fridge-outline": Refrigerator,
  cup: CupSoda,
  grid: Grid3x3,
  cards: SquareStack,
  "dice-multiple-outline": Dice6,
  chip: CircleDollarSign,
  puzzle: Puzzle,
  "sony-playstation": Gamepad2,
  "nintendo-switch": Gamepad2,
  "television-classic": Tv,
  speaker: Speaker,
  "microphone-outline": Mic,
};

export const Step2Amenities = withFieldGroup({
  defaultValues,
  props: {
    onNext: () => {},
    onBack: () => {},
  },
  render({ group, onNext, onBack }) {
    const [collapsedCategories, setCollapsedCategories] = useState<
      Record<string, boolean>
    >({
      BASIC: false,
      ENTERTAINMENT: false,
      AV: false,
    });

    const facilitiesData = useStore(
      group.store,
      (state) => state.values?.facilitiesData || {}
    );

    const toggleCategory = (categoryName: string) => {
      setCollapsedCategories((prev) => ({
        ...prev,
        [categoryName]: !prev[categoryName],
      }));
    };

    const toggleAmenity = (categoryName: string, amenityKey: string) => {
      const currentData = facilitiesData;
      const currentCategoryData = Array.isArray(currentData[categoryName])
        ? currentData[categoryName]
        : [];

      const existingIndex = currentCategoryData.findIndex(
        (item: { name: string }) => item.name === amenityKey
      );

      let updatedCategoryData: Array<{ name: string }>;
      if (existingIndex >= 0) {
        updatedCategoryData = currentCategoryData.filter(
          (_: { name: string }, index: number) => index !== existingIndex
        );
      } else {
        updatedCategoryData = [...currentCategoryData, { name: amenityKey }];
      }

      const allCategories = { ...currentData };
      allCategories[categoryName] = updatedCategoryData;

      group.setFieldValue("facilitiesData", allCategories);
    };

    const isAmenitySelected = (categoryName: string, amenityKey: string) => {
      const categoryData = facilitiesData[categoryName];
      return categoryData?.some((item) => item.name === amenityKey) ?? false;
    };

    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="text-sm font-medium text-gray-500 mb-2">Step 2</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Select Amenities
          </h1>
          <p className="text-lg text-gray-600">
            Choose all the amenities and features available at your place.
            Guests will see these when booking.
          </p>
        </div>

        <div className="space-y-6">
          {Object.entries(AMENITIES_CATEGORIES).map(
            ([categoryName, amenities]) => {
              const isCollapsed = collapsedCategories[categoryName];
              const selectedCount = amenities.filter((amenity) =>
                isAmenitySelected(categoryName, amenity.key)
              ).length;

              return (
                <div key={categoryName}>
                  <button
                    className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                    onClick={() => toggleCategory(categoryName)}
                    type="button"
                  >
                    <h2 className="text-xl font-semibold">{categoryName}</h2>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-500">
                        {selectedCount} selected
                      </span>
                      {isCollapsed ? (
                        <ChevronDown className="size-5" />
                      ) : (
                        <ChevronUp className="size-5" />
                      )}
                    </div>
                  </button>

                  {!isCollapsed && (
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {amenities.map((amenity) => {
                        const isSelected = isAmenitySelected(
                          categoryName,
                          amenity.key
                        );
                        return (
                          <button
                            className={`p-4 border rounded-lg transition-all relative ${
                              isSelected
                                ? "border-red-600 bg-red-50 ring-2 ring-red-600"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                            data-testid={`amenity-${amenity.key}`}
                            key={amenity.key}
                            onClick={() =>
                              toggleAmenity(categoryName, amenity.key)
                            }
                            type="button"
                          >
                            <div className="flex flex-col items-center gap-2">
                              {isSelected && (
                                <div className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1">
                                  <Check className="size-4" />
                                </div>
                              )}
                              {(() => {
                                const IconComponent =
                                  iconMap[amenity.icon] ?? Grid3x3;
                                return (
                                  <IconComponent className="size-8 text-gray-600" />
                                );
                              })()}
                              <span className="text-sm font-medium text-center">
                                {amenity.label}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }
          )}
        </div>

        <div className="mt-8 flex justify-between items-center border-t pt-6">
          <Button data-testid="step-2-back" onClick={onBack} variant="outline">
            Back
          </Button>
          <Button data-testid="step-2-next" onClick={onNext}>
            Next
          </Button>
        </div>
      </div>
    );
  },
});
