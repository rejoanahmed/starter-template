"use client";

import { useStore } from "@tanstack/react-form";
import { withFieldGroup } from "@web/components/form";
import { Button } from "@web/components/ui/button";
import { ChartContainer, ChartTooltip } from "@web/components/ui/chart";
import { Input } from "@web/components/ui/input";
import { Label } from "@web/components/ui/label";
import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { z } from "zod";

type Step5Fields = {
  basePricePerHour: number;
  minimumHours: number;
  discountPercentage: number;
  includedGuests: number;
  maxGuests: number;
  extraPersonChargePerHour: number;
};

const defaultValues: Step5Fields = {
  basePricePerHour: 0,
  minimumHours: 1,
  discountPercentage: 0,
  includedGuests: 1,
  maxGuests: 1,
  extraPersonChargePerHour: 0,
};

// Move regex to top level for performance
const INTEGER_REGEX = /^\d+$/;
const DECIMAL_REGEX = /^\d*\.?\d*$/;

export const Step5Pricing = withFieldGroup({
  defaultValues,
  props: {
    onNext: () => {},
    onBack: () => {},
    isSubmitting: false,
  },
  render({ group, onNext, onBack, isSubmitting }) {
    const [testGuests, setTestGuests] = useState<string>("1");

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

    const calculatePrice = (hours: number, numGuests: number) => {
      let baseCost: number;

      if (hours <= minimumHours) {
        baseCost = hours * basePricePerHour;
      } else {
        const discountDecimal = discountPercentage / 100;
        const discountedHourlyPrice =
          basePricePerHour * (1 - discountDecimal) ** (hours - minimumHours);
        baseCost = hours * discountedHourlyPrice;
      }

      const extraGuests = Math.max(0, numGuests - includedGuests);
      const extraCost = extraGuests * extraPersonChargePerHour * hours;
      return baseCost + extraCost;
    };

    // Parse testGuests and validate
    const testGuestsNum = useMemo(() => {
      const num = Number.parseInt(testGuests, 10);
      if (Number.isNaN(num) || num < 1) return includedGuests || 1;
      return Math.min(Math.max(includedGuests || 1, num), maxGuests);
    }, [testGuests, includedGuests, maxGuests]);

    // Generate chart data from minimumHours to 24 hours
    const maxHours = 24;
    const chartData = useMemo(() => {
      if (basePricePerHour <= 0 || minimumHours < 1) {
        return [];
      }

      return Array.from({ length: maxHours - minimumHours + 1 }, (_, i) => {
        const hours = minimumHours + i;
        const price = calculatePrice(hours, testGuestsNum);
        return {
          hours,
          price: Number.parseFloat(price.toFixed(2)),
          guests: testGuestsNum,
        };
      });
    }, [
      basePricePerHour,
      minimumHours,
      discountPercentage,
      includedGuests,
      extraPersonChargePerHour,
      testGuestsNum,
    ]);

    const maxPrice = useMemo(() => {
      if (chartData.length === 0) return 0;
      return Math.max(...chartData.map((d) => d.price));
    }, [chartData]);

    const canProceed =
      basePricePerHour > 0 &&
      minimumHours >= 1 &&
      discountPercentage >= 0 &&
      discountPercentage <= 100 &&
      includedGuests >= 1 &&
      maxGuests >= includedGuests &&
      extraPersonChargePerHour >= 0;

    // Helper to parse number from string
    const parseNumber = (value: string, isInteger: boolean) => {
      if (value === "") return 0;
      const regex = isInteger ? INTEGER_REGEX : DECIMAL_REGEX;
      if (!regex.test(value)) return null;
      return isInteger ? Number.parseInt(value, 10) : Number.parseFloat(value);
    };

    // Get string value for display
    const getStringValue = (numValue: number | undefined): string => {
      if (numValue === undefined || numValue === 0) return "";
      return String(numValue);
    };

    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="text-sm font-medium text-gray-500 mb-2">Step 5</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Pricing Setup
          </h1>
          <p className="text-lg text-gray-600">
            Set your pricing structure. We use a formula that rewards longer
            bookings while keeping it simple for guests.
          </p>
        </div>

        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <group.AppField
              name="basePricePerHour"
              validators={{
                onChange: z
                  .number()
                  .min(0.01, "Base price must be greater than 0"),
              }}
            >
              {(field) => (
                <div>
                  <Label htmlFor={field.name}>Base price per hour (HKD)</Label>
                  <Input
                    className="mt-1"
                    data-testid="base-price"
                    id={field.name}
                    inputMode="decimal"
                    name={field.name}
                    onBlur={field.handleBlur}
                    onChange={(e) => {
                      const num = parseNumber(e.target.value, false);
                      if (num !== null) field.handleChange(num);
                      else if (e.target.value === "") field.handleChange(0);
                    }}
                    type="text"
                    value={getStringValue(field.state.value)}
                  />
                  {field.state.meta.errors?.length > 0 && (
                    <p className="text-sm text-red-600 mt-1">
                      {String(field.state.meta.errors[0])}
                    </p>
                  )}
                </div>
              )}
            </group.AppField>

            <group.AppField
              name="minimumHours"
              validators={{
                onChange: z
                  .number()
                  .int()
                  .min(1, "Minimum hours must be at least 1"),
              }}
            >
              {(field) => (
                <div>
                  <Label htmlFor={field.name}>Minimum hours</Label>
                  <Input
                    className="mt-1"
                    data-testid="minimum-hours"
                    id={field.name}
                    inputMode="numeric"
                    name={field.name}
                    onBlur={field.handleBlur}
                    onChange={(e) => {
                      const num = parseNumber(e.target.value, true);
                      if (num !== null) field.handleChange(num);
                      else if (e.target.value === "") field.handleChange(0);
                    }}
                    type="text"
                    value={getStringValue(field.state.value)}
                  />
                  {field.state.meta.errors?.length > 0 && (
                    <p className="text-sm text-red-600 mt-1">
                      {String(field.state.meta.errors[0])}
                    </p>
                  )}
                </div>
              )}
            </group.AppField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <group.AppField
              name="discountPercentage"
              validators={{
                onChange: z
                  .number()
                  .min(0, "Discount must be at least 0")
                  .max(100, "Discount must be at most 100"),
              }}
            >
              {(field) => (
                <div>
                  <Label htmlFor={field.name}>
                    Discount percentage for additional hours (%)
                  </Label>
                  <Input
                    className="mt-1"
                    data-testid="discount-percentage"
                    id={field.name}
                    inputMode="decimal"
                    name={field.name}
                    onBlur={field.handleBlur}
                    onChange={(e) => {
                      const num = parseNumber(e.target.value, false);
                      if (num !== null) field.handleChange(num);
                      else if (e.target.value === "") field.handleChange(0);
                    }}
                    type="text"
                    value={getStringValue(field.state.value)}
                  />
                  {field.state.meta.errors?.length > 0 && (
                    <p className="text-sm text-red-600 mt-1">
                      {String(field.state.meta.errors[0])}
                    </p>
                  )}
                </div>
              )}
            </group.AppField>

            <group.AppField
              name="extraPersonChargePerHour"
              validators={{
                onChange: z
                  .number()
                  .min(0, "Extra person charge must be at least 0"),
              }}
            >
              {(field) => (
                <div>
                  <Label htmlFor={field.name}>
                    Extra person charge per hour (HKD)
                  </Label>
                  <Input
                    className="mt-1"
                    data-testid="extra-person-charge"
                    id={field.name}
                    inputMode="decimal"
                    name={field.name}
                    onBlur={field.handleBlur}
                    onChange={(e) => {
                      const num = parseNumber(e.target.value, false);
                      if (num !== null) field.handleChange(num);
                      else if (e.target.value === "") field.handleChange(0);
                    }}
                    type="text"
                    value={getStringValue(field.state.value)}
                  />
                  {field.state.meta.errors?.length > 0 && (
                    <p className="text-sm text-red-600 mt-1">
                      {String(field.state.meta.errors[0])}
                    </p>
                  )}
                </div>
              )}
            </group.AppField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <group.AppField
              name="includedGuests"
              validators={{
                onChange: z
                  .number()
                  .int()
                  .min(1, "Included guests must be at least 1"),
              }}
            >
              {(field) => (
                <div>
                  <Label htmlFor={field.name}>Included number of guests</Label>
                  <Input
                    className="mt-1"
                    data-testid="included-guests"
                    id={field.name}
                    inputMode="numeric"
                    name={field.name}
                    onBlur={field.handleBlur}
                    onChange={(e) => {
                      const num = parseNumber(e.target.value, true);
                      if (num !== null) field.handleChange(num);
                      else if (e.target.value === "") field.handleChange(0);
                    }}
                    type="text"
                    value={getStringValue(field.state.value)}
                  />
                  {field.state.meta.errors?.length > 0 && (
                    <p className="text-sm text-red-600 mt-1">
                      {String(field.state.meta.errors[0])}
                    </p>
                  )}
                </div>
              )}
            </group.AppField>

            <group.AppField
              name="maxGuests"
              validators={{
                // biome-ignore lint/suspicious/noExplicitAny: TanStack Form validator context is complex
                onChange: ({ value, fieldApi }: any) => {
                  const included =
                    fieldApi.form.getFieldValue("includedGuests") || 1;
                  const result = z
                    .number()
                    .int()
                    .min(1, "Maximum guests must be at least 1")
                    .refine(
                      (val) => val >= Number(included),
                      "Maximum guests must be at least equal to included guests"
                    )
                    .safeParse(value);
                  return result.success
                    ? undefined
                    : result.error.issues[0]?.message;
                },
              }}
            >
              {(field) => (
                <div>
                  <Label htmlFor={field.name}>Maximum number of guests</Label>
                  <Input
                    className="mt-1"
                    data-testid="max-guests"
                    id={field.name}
                    inputMode="numeric"
                    name={field.name}
                    onBlur={field.handleBlur}
                    onChange={(e) => {
                      const num = parseNumber(e.target.value, true);
                      if (num !== null) field.handleChange(num);
                      else if (e.target.value === "") field.handleChange(0);
                    }}
                    type="text"
                    value={getStringValue(field.state.value)}
                  />
                  {field.state.meta.errors?.length > 0 && (
                    <p className="text-sm text-red-600 mt-1">
                      {String(field.state.meta.errors[0])}
                    </p>
                  )}
                </div>
              )}
            </group.AppField>
          </div>

          <div className="">
            <div className="mb-4">
              <h3 className="font-semibold mb-4">Pricing Visualization</h3>
              <div className="mb-4 max-w-xs">
                <Label htmlFor="testGuests">Number of guests</Label>
                <Input
                  data-testid="test-guests-input"
                  id="testGuests"
                  inputMode="numeric"
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "" || INTEGER_REGEX.test(value)) {
                      setTestGuests(value);
                    }
                  }}
                  type="text"
                  value={testGuests}
                />
                {testGuestsNum < (includedGuests || 1) && (
                  <p className="text-xs text-red-600 mt-1">
                    Minimum {includedGuests || 1} guest
                    {(includedGuests || 1) !== 1 ? "s" : ""} required
                  </p>
                )}
                {testGuestsNum > maxGuests && (
                  <p className="text-xs text-red-600 mt-1">
                    Maximum {maxGuests} guest{maxGuests !== 1 ? "s" : ""}{" "}
                    allowed
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Adjust to see how price changes with guest count (min:{" "}
                  {includedGuests || 1}, max: {maxGuests})
                </p>
              </div>
            </div>

            {chartData.length > 0 ? (
              <ChartContainer
                className="h-[400px] w-full"
                config={{
                  price: {
                    label: "Price (HKD)",
                    color: "hsl(var(--chart-1))",
                  },
                }}
              >
                <BarChart
                  barCategoryGap="5%"
                  data={chartData}
                  margin={{ top: 20, right: 10, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="hours"
                    label={{
                      value: "Hours",
                      position: "insideBottom",
                      offset: -5,
                    }}
                    tickFormatter={(value) => `${value}h`}
                  />
                  <YAxis
                    domain={[0, maxPrice > 0 ? maxPrice * 1.1 : "auto"]}
                    tickFormatter={(value) => {
                      const num = Number(value);
                      if (Number.isNaN(num) || !Number.isFinite(num)) {
                        return "";
                      }
                      return `HKD ${Math.round(num).toLocaleString()}`;
                    }}
                    width={60}
                  />
                  <ChartTooltip
                    content={({ active, payload }) => {
                      if (!active) return null;
                      if (!payload) return null;
                      if (payload.length === 0) return null;
                      const data = payload[0]?.payload as
                        | { hours: number; guests: number; price: number }
                        | undefined;
                      if (!data) return null;
                      return (
                        <div className="border-border/50 bg-background rounded-lg border px-2.5 py-1.5 text-xs shadow-xl">
                          <div className="space-y-1">
                            <div>no of guest: {data.guests}</div>
                            <div>hours: {data.hours}</div>
                            <div>price: HKD {data.price}</div>
                          </div>
                        </div>
                      );
                    }}
                  />
                  <Bar
                    dataKey="price"
                    fill="var(--color-price)"
                    maxBarSize={100}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="h-[400px] flex items-center justify-center text-gray-500">
                <p>Enter pricing details above to see the visualization</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 flex justify-between items-center border-t pt-6">
          <Button onClick={onBack} variant="outline">
            Back
          </Button>
          <Button disabled={!canProceed || isSubmitting} onClick={onNext}>
            Next
          </Button>
        </div>
      </div>
    );
  },
});
