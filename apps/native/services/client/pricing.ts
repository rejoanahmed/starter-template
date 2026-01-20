import { api } from "@app/lib/api-client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { parseResponse } from "hono/client";

export type PriceQuoteRequest = {
  roomId: string;
  startAt: string; // ISO 8601 date string
  endAt: string; // ISO 8601 date string
  guests: number;
};

export type AppliedModifier = {
  id: string;
  type: "duration_discount" | "guest_discount" | "guest_surcharge";
  name: string;
  amount: number;
  discountType: "percentage" | "fixed";
  discountValue: string;
};

export type AppliedRule = {
  id: string;
  name: string;
  type: "pricing_rule" | "pricing_override";
  price: string;
  unit: string;
};

export type AppliedOverride = {
  id: string;
  name: string;
  type: "pricing_override";
};

export type PriceBreakdown = {
  basePrice: number;
  extraPersonCharge: number;
  totalDiscounts: number;
  totalSurcharges: number;
};

export type PriceQuote = {
  basePrice: number;
  appliedOverride: AppliedOverride | null;
  finalPrice: number;
  breakdown: PriceBreakdown;
  calculatedAt: string;
};

/**
 * Fetch a price quote for a specific room and booking parameters
 */
export const fetchPriceQuote = async (
  request: PriceQuoteRequest
): Promise<PriceQuote> => {
  const result = await parseResponse(
    api.api.merchant.pricing.quote.$post({
      json: request,
    })
  ).catch((e) => {
    console.error("Failed to fetch price quote:", e);
    throw new Error(
      e instanceof Error ? e.message : "Failed to fetch price quote"
    );
  });

  return result.quote;
};

/**
 * Hook to fetch a price quote for a room
 */
export const usePriceQuote = (
  request: PriceQuoteRequest | null,
  enabled = true
) => {
  return useQuery({
    queryKey: ["priceQuote", request],
    queryFn: () => {
      if (!request) {
        throw new Error("Price quote request is required");
      }
      return fetchPriceQuote(request);
    },
    enabled: enabled && request !== null,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
};

/**
 * Hook to fetch price quotes for multiple rooms
 */
export const useBatchPriceQuotes = (
  requests: PriceQuoteRequest[],
  enabled = true
) => {
  return useQuery({
    queryKey: ["batchPriceQuotes", requests],
    queryFn: async () => {
      const quotes = await Promise.allSettled(
        requests.map((req) => fetchPriceQuote(req))
      );

      // Return a map of roomId -> quote (or error)
      const quoteMap = new Map<string, PriceQuote | Error>();
      requests.forEach((req, index) => {
        const result = quotes[index];
        if (result.status === "fulfilled") {
          quoteMap.set(req.roomId, result.value);
        } else {
          quoteMap.set(req.roomId, new Error(result.reason));
        }
      });

      return quoteMap;
    },
    enabled: enabled && requests.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
};

/**
 * Mutation hook to fetch a price quote
 */
export const usePriceQuoteMutation = () => {
  return useMutation({
    mutationFn: fetchPriceQuote,
  });
};

export type RoomPricingData = {
  defaultPricing: {
    includedGuests: number;
    hourlyTiers: Array<{ hours: number; price: number }>;
    extraPersonChargePerHour: string;
  };
  overrides: Array<{
    id: string;
    type: "day" | "date";
    startDayOfWeek: number | null;
    startTime: string | null;
    endDayOfWeek: number | null;
    endTime: string | null;
    startDate: string | null;
    endDate: string | null;
    hourlyTiers: Array<{ hours: number; price: number }> | null;
    extraPersonChargePerHour: string | null;
  }>;
};

/**
 * Fetch all pricing data for a room (default + overrides)
 */
export const fetchRoomPricing = async (
  roomId: string
): Promise<RoomPricingData> => {
  const result = await parseResponse(
    api.api.merchant.pricing.room[":roomId"].$get({
      param: { roomId },
    })
  ).catch((e) => {
    console.error("Failed to fetch room pricing:", e);
    throw new Error(
      e instanceof Error ? e.message : "Failed to fetch room pricing"
    );
  });

  return result;
};

/**
 * Hook to fetch all pricing data for a room
 */
export const useRoomPricing = (roomId: string, enabled = true) => {
  return useQuery({
    queryKey: ["roomPricing", roomId],
    queryFn: () => fetchRoomPricing(roomId),
    enabled: enabled && !!roomId,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};
