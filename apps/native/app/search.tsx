// app/search.tsx

import RoomCard from "@app/components/RoomCard";
import DateRangePicker from "@app/components/search/DateRangePicker";
import DistrictFilter from "@app/components/search/DistrictFilter";
import FilterBar from "@app/components/search/FilterBar";
import GuestsFilter from "@app/components/search/GuestsFilter";
import PriceRangeFilter from "@app/components/search/PriceRangeFilter";
import RatingFilter from "@app/components/search/RatingFilter";
import { ThemedText } from "@app/components/ThemedText";
import { useBatchPriceQuotes } from "@app/services/client/pricing";
import { useRooms } from "@app/services/client/rooms";
import { Stack, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SortSelector } from "../components/search/Sorting";
import { Colors } from "../constants/Colors";
import { useUser } from "./_layout";

export type Filters = {
  dates: { start: Date | null; end: Date | null };
  district: string[];
  guests: number;
  priceRange: { min: number; max: number };
  rating: number;
  sortBy: "price_asc" | "price_desc" | "rating" | "popularity";
};

// Default filters
const initialFilters: Filters = {
  dates: { start: null, end: null },
  district: [],
  guests: 4,
  priceRange: { min: 0, max: 5000 },
  rating: 0,
  sortBy: "popularity",
};

export default function SearchScreen() {
  const router = useRouter();
  const { userRole } = useUser();
  const scheme = useColorScheme();
  const palette = scheme === "dark" ? Colors.dark : Colors.light;

  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  useEffect(() => {
    if (userRole !== "client") {
      router.replace("/");
    }
  }, [userRole, router]);

  // Build API query params from filters
  const queryParams = useMemo(() => {
    const params: Record<string, string | number> = {
      minGuests: filters.guests,
    };

    // Map sortBy to backend format
    if (filters.sortBy === "popularity") {
      params.sortBy = "created_desc";
    } else if (filters.sortBy === "rating") {
      params.sortBy = "rating_desc";
    } else {
      params.sortBy = filters.sortBy;
    }

    // Add district filter if only one is selected (backend supports single district)
    if (filters.district.length === 1) {
      params.district = filters.district[0];
    }

    // Note: Date and price filters removed from API query
    // Prices require specific booking dates/times and are fetched via quote API

    return params;
  }, [filters]);

  // Use the backend API
  const { data, isLoading, error } = useRooms(queryParams);

  // Apply client-side filters that backend doesn't fully support
  const rooms = useMemo(() => {
    if (!data?.rooms) {
      return [];
    }

    return data.rooms.filter((room) => {
      // Multi-district filter (backend only supports single district)
      if (
        filters.district.length > 1 &&
        !filters.district.includes(room.district)
      ) {
        return false;
      }
      // Rating filter (if backend doesn't support it yet)
      if (filters.rating > 0 && (room.averageRating || 0) < filters.rating) {
        return false;
      }
      // Note: Price filtering removed - requires specific dates to calculate actual prices
      // Users should select dates first, then prices will be fetched via quote API
      return true;
    });
  }, [data, filters.district, filters.rating]);

  // Fetch prices for rooms when dates are selected
  const priceQuoteRequests = useMemo(() => {
    if (!(filters.dates.start && filters.dates.end)) {
      return [];
    }

    // Use default times: check-in at 2 PM, check-out at 12 PM
    const startDate = new Date(filters.dates.start);
    startDate.setHours(14, 0, 0, 0); // 2 PM

    const endDate = new Date(filters.dates.end);
    endDate.setHours(12, 0, 0, 0); // 12 PM

    return rooms.map((room) => ({
      roomId: room.id,
      startAt: startDate.toISOString(),
      endAt: endDate.toISOString(),
      guests: filters.guests,
    }));
  }, [rooms, filters.dates, filters.guests]);

  // Fetch price quotes for all rooms
  const { data: priceQuotes, isLoading: pricesLoading } = useBatchPriceQuotes(
    priceQuoteRequests,
    priceQuoteRequests.length > 0 // Only fetch if dates are selected
  );

  // Combine rooms with their prices
  const roomsWithPrices = useMemo(() => {
    return rooms.map((room) => {
      const quote = priceQuotes?.get(room.id);
      const price =
        quote && !(quote instanceof Error) ? quote.finalPrice : null;

      return {
        ...room,
        price,
        priceQuote: quote && !(quote instanceof Error) ? quote : null,
      };
    });
  }, [rooms, priceQuotes]);

  // Apply price filtering if dates are selected and prices are loaded
  const filteredRooms = useMemo(() => {
    if (!(filters.dates.start && priceQuotes)) {
      return roomsWithPrices;
    }

    return roomsWithPrices.filter((room) => {
      if (room.price === null) {
        return true; // Keep rooms with no price (error fetching)
      }

      // Apply price range filter
      if (
        room.price < filters.priceRange.min ||
        room.price > filters.priceRange.max
      ) {
        return false;
      }

      return true;
    });
  }, [roomsWithPrices, filters.priceRange, filters.dates.start, priceQuotes]);

  const updateFilters = (newVals: Partial<Filters>) =>
    setFilters((p) => ({ ...p, ...newVals }));
  const toggleFilter = (name: string) =>
    setActiveFilter(activeFilter === name ? null : name);
  const resetFilters = () => {
    setFilters(initialFilters);
    setActiveFilter(null);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.background }}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={{ padding: 20 }}>
        <ThemedText type="title">Find Your Perfect Room</ThemedText>
        <FilterBar
          activeFilter={activeFilter}
          filters={filters}
          resetFilters={resetFilters}
          toggleFilter={toggleFilter}
        />
      </View>

      {activeFilter === "dates" && (
        <DateRangePicker
          dates={filters.dates}
          onChange={(dates) => {
            updateFilters({ dates });
            setActiveFilter(null);
          }}
        />
      )}
      {activeFilter === "district" && (
        <DistrictFilter
          onChange={(district) => {
            updateFilters({ district });
            setActiveFilter(null);
          }}
          selectedDistricts={filters.district}
        />
      )}
      {activeFilter === "guests" && (
        <GuestsFilter
          guests={filters.guests}
          onChange={(guests) => {
            updateFilters({ guests });
            setActiveFilter(null);
          }}
        />
      )}
      {activeFilter === "price" && (
        <PriceRangeFilter
          onChange={(priceRange) => {
            updateFilters({ priceRange });
            setActiveFilter(null);
          }}
          priceRange={filters.priceRange}
        />
      )}
      {activeFilter === "rating" && (
        <RatingFilter
          onChange={(rating) => {
            updateFilters({ rating });
            setActiveFilter(null);
          }}
          rating={filters.rating}
        />
      )}
      {activeFilter === "sort" && (
        <SortSelector
          onSelect={(s) => {
            updateFilters({ sortBy: s });
            setActiveFilter(null);
          }}
          value={filters.sortBy}
        />
      )}

      {isLoading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator color={palette.tint} size="large" />
          <ThemedText
            style={{ color: palette.icon, marginTop: 8 }}
            type="subtitle"
          >
            Finding rooms...
          </ThemedText>
        </View>
      ) : error ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 24,
          }}
        >
          <ThemedText className="mb-3 text-4xl">⚠️</ThemedText>
          <ThemedText className="mb-2 text-center" type="subtitle">
            Unable to load rooms
          </ThemedText>
          <ThemedText
            className="mb-5 text-center text-sm"
            style={{ color: palette.icon }}
          >
            Please check your connection and try again
          </ThemedText>
        </View>
      ) : (
        <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
          {filteredRooms.length ? (
            filteredRooms.map((room) => (
              <RoomCard
                key={room.id}
                price={room.price}
                priceLoading={pricesLoading}
                room={room}
              />
            ))
          ) : (
            <View
              style={{
                marginTop: 80,
                alignItems: "center",
                paddingHorizontal: 24,
              }}
            >
              <ThemedText className="mb-3 text-4xl">🛏️</ThemedText>
              <ThemedText className="mb-2 text-center" type="subtitle">
                No rooms found
              </ThemedText>
              <ThemedText
                className="mb-5 text-center text-sm"
                style={{ color: palette.icon }}
              >
                Try adjusting or resetting your filters
              </ThemedText>
              <TouchableOpacity
                accessibilityRole="button"
                onPress={resetFilters}
                style={{
                  borderRadius: 999,
                  paddingHorizontal: 20,
                  paddingVertical: 12,
                  backgroundColor: palette.tint,
                }}
              >
                <ThemedText
                  className="font-semibold"
                  style={{ color: Colors.dark.background }}
                >
                  Reset filters
                </ThemedText>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
