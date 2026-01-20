import { describe, expect, it } from "vitest";

describe("Room Listing Management - Core Features", () => {
  it("should have correct initial data structure", () => {
    const initialData = {
      name: "",
      description: "",
      address: "",
      district: "",
      location: null,
      includedGuests: 1,
      maxGuests: 1,
      hourlyTiers: [],
      extraPersonChargePerHour: 0,
      photos: [],
      amenities: [],
      cancellationPolicy: {
        type: "lenient" as const,
        rules: [],
      },
      basePricePerHour: 0,
      minimumHours: 1,
      discountPercentage: 0,
    };

    expect(initialData).toHaveProperty("name");
    expect(initialData).toHaveProperty("basePricePerHour");
    expect(initialData).toHaveProperty("minimumHours");
    expect(initialData).toHaveProperty("discountPercentage");
    expect(initialData.basePricePerHour).toBe(0);
    expect(initialData.minimumHours).toBe(1);
    expect(initialData.discountPercentage).toBe(0);
  });

  it("should calculate pricing correctly", () => {
    const basePricePerHour = 100;
    const minimumHours = 2;
    const discountPercentage = 10;
    const extraPersonChargePerHour = 25;

    const calculatePrice = (hours: number, extraGuests = 0) => {
      let baseCost: number;

      if (hours <= minimumHours) {
        baseCost = hours * basePricePerHour;
      } else {
        const discountDecimal = discountPercentage / 100;
        const discountedHourlyPrice =
          basePricePerHour * (1 - discountDecimal) ** (hours - minimumHours);
        baseCost = hours * discountedHourlyPrice;
      }

      const extraCost = extraGuests * extraPersonChargePerHour * hours;
      return baseCost + extraCost;
    };

    expect(calculatePrice(1, 0)).toBe(100);
    expect(calculatePrice(2, 0)).toBe(200);

    expect(calculatePrice(3, 0)).toBeCloseTo(270, 1);

    expect(calculatePrice(3, 2)).toBeCloseTo(320, 1);
  });
});
