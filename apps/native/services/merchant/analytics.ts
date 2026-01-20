/**
 * Analytics service for merchant income reporting and statistics
 * Handles income reports and period statistics with React Query hooks
 */

import { api } from "@app/lib/api-client";
import { useQuery } from "@tanstack/react-query";
import type { InferResponseType } from "hono/client";
import { parseResponse } from "hono/client";

export type IncomeReportMode = "WEEK" | "MONTH";

// Infer response types from API endpoints
type IncomeReportResponse = InferResponseType<
  typeof api.api.merchant.analytics.income.$get
>;

type PeriodStatisticsResponse = InferResponseType<
  typeof api.api.merchant.analytics.period.$get
>;

// Export types matching the API response structure
export type PeriodData = NonNullable<
  Extract<IncomeReportResponse, { periods: unknown }>["periods"]
>[number];

export type IncomeReport = Extract<
  IncomeReportResponse,
  { mode: unknown; periods: unknown; totalRevenue: unknown }
>;

export type PeriodStatistics = Extract<
  PeriodStatisticsResponse,
  { totalRevenue: unknown; bookingCount: unknown }
>;

/**
 * Get income report with weekly or monthly aggregation
 */
async function getIncomeReport(params: {
  mode: IncomeReportMode;
  roomIds?: string[];
  periodsBack?: number;
}): Promise<IncomeReport> {
  const query: Record<string, string> = {
    mode: params.mode,
  };

  if (params.roomIds && params.roomIds.length > 0) {
    query.roomIds = params.roomIds.join(",");
  }

  if (params.periodsBack !== undefined) {
    query.periodsBack = params.periodsBack.toString();
  }

  const result = await parseResponse(
    api.api.merchant.analytics.income.$get({
      query,
    })
  ).catch((e) => {
    console.error("Failed to fetch income report:", e);
    throw new Error(
      e instanceof Error ? e.message : "Failed to fetch income report"
    );
  });

  return result;
}

/**
 * Get detailed statistics for a specific time period
 */
async function getPeriodStatistics(params: {
  startDate: string;
  endDate: string;
  roomIds?: string[];
}): Promise<PeriodStatistics> {
  const query: Record<string, string> = {
    startDate: params.startDate,
    endDate: params.endDate,
  };

  if (params.roomIds && params.roomIds.length > 0) {
    query.roomIds = params.roomIds.join(",");
  }

  const result = await parseResponse(
    api.api.merchant.analytics.period.$get({
      query,
    })
  ).catch((e) => {
    console.error("Failed to fetch period statistics:", e);
    throw new Error(
      e instanceof Error ? e.message : "Failed to fetch period statistics"
    );
  });

  return result;
}

/**
 * React Query hook for fetching income report
 * Automatically caches results and refetches on window focus
 */
export function useIncomeReport(params: {
  mode: IncomeReportMode;
  roomIds?: string[];
  periodsBack?: number;
}) {
  return useQuery({
    queryKey: [
      "merchant",
      "analytics",
      "income",
      params.mode,
      params.roomIds,
      params.periodsBack,
    ],
    queryFn: () => getIncomeReport(params),
  });
}

/**
 * React Query hook for fetching period statistics
 */
export function usePeriodStatistics(params: {
  startDate: string;
  endDate: string;
  roomIds?: string[];
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: [
      "merchant",
      "analytics",
      "period",
      params.startDate,
      params.endDate,
      params.roomIds,
    ],
    queryFn: () => getPeriodStatistics(params),
    enabled: params.enabled !== false,
  });
}

// Export service functions for direct use if needed
export const analyticsService = {
  getIncomeReport,
  getPeriodStatistics,
};
