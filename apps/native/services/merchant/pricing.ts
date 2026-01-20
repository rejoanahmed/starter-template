/**
 * Pricing service for merchant pricing management
 */

import { api } from "../../lib/api-client";

export type PricingOverride = {
  id: string;
  roomId: string;
  type: "day" | "date";
  // For day type
  startDayOfWeek: number | null;
  startTime: string | null;
  endDayOfWeek: number | null;
  endTime: string | null;
  // For date type
  startDate: string | null;
  endDate: string | null;
  // Pricing (nullable - uses room default if null)
  hourlyTiers: Array<{ hours: number; price: number }> | null;
  extraPersonChargePerHour: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreatePricingOverrideInput = {
  roomId: string;
  type: "day" | "date";
  // For day type
  startDayOfWeek?: number;
  startTime?: string;
  endDayOfWeek?: number;
  endTime?: string;
  // For date type
  startDate?: string;
  endDate?: string;
  // Pricing (optional - uses room default if not provided)
  hourlyTiers?: Array<{ hours: number; price: number }>;
  extraPersonChargePerHour?: number;
};

export type UpdatePricingOverrideInput = Partial<
  Omit<CreatePricingOverrideInput, "roomId">
>;

export const pricingService = {
  /**
   * Get all pricing overrides for a room
   */
  async getPricingOverrides(roomId: string) {
    const res = await api.api.merchant.pricing.overrides.$get({
      query: { roomId },
    });
    if (!res.ok) {
      throw new Error(`API Error: ${res.status}`);
    }
    return await res.json();
  },

  /**
   * Create a new pricing override
   */
  async createPricingOverride(data: CreatePricingOverrideInput) {
    const res = await api.api.merchant.pricing.overrides.$post({
      json: data,
    });
    if (!res.ok) {
      throw new Error(`API Error: ${res.status}`);
    }
    return await res.json();
  },

  /**
   * Update an existing pricing override
   */
  async updatePricingOverride(id: string, data: UpdatePricingOverrideInput) {
    const res = await api.api.merchant.pricing.overrides[":id"].$patch({
      param: { id },
      json: data,
    });
    if (!res.ok) {
      throw new Error(`API Error: ${res.status}`);
    }
    return await res.json();
  },

  /**
   * Delete a pricing override
   */
  async deletePricingOverride(id: string) {
    const res = await api.api.merchant.pricing.overrides[":id"].$delete({
      param: { id },
    });
    if (!res.ok) {
      throw new Error(`API Error: ${res.status}`);
    }
    return await res.json();
  },
};

export default pricingService;
