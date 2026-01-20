"use client";

import { useStore } from "@tanstack/react-form";
import { withFieldGroup } from "@web/components/form";
import { Button } from "@web/components/ui/button";
import { Input } from "@web/components/ui/input";
import { Loader2, MapPin } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { LocationMap } from "./LocationMap";

type Step3Fields = {
  address: string;
  district: string;
  location: {
    latitude: number;
    longitude: number;
  } | null;
};

const defaultValues: Step3Fields = {
  address: "",
  district: "",
  location: null,
};

type GooglePlacePrediction = {
  description: string;
  place_id: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
  types: string[];
};

type GooglePlacesResponse = {
  predictions: GooglePlacePrediction[];
  status: string;
};

type GooglePlaceDetails = {
  result: {
    place_id: string;
    formatted_address: string;
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
    };
    address_components: Array<{
      long_name: string;
      short_name: string;
      types: string[];
    }>;
    name: string;
  };
  status: string;
};

export const Step3Address = withFieldGroup({
  defaultValues,
  props: {
    onNext: () => {},
    onBack: () => {},
  },
  render({ group, onNext, onBack }) {
    const address = useStore(group.store, (state) => state.values.address);
    const location = useStore(group.store, (state) => state.values.location);

    const [locationQuery, setLocationQuery] = useState(address || "");
    const [suggestions, setSuggestions] = useState<GooglePlacePrediction[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [userLocation, setUserLocation] = useState<{
      latitude: number;
      longitude: number;
    } | null>(null);
    const [isGettingLocation, setIsGettingLocation] = useState(true);
    const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
      undefined
    );
    const suggestionsRef = useRef<HTMLDivElement>(null);

    const GOOGLE_MAP_API_KEY = import.meta.env.VITE_GOOGLE_MAP_API_KEY;

    const canProceed = address?.trim() && location !== null;

    useEffect(() => {
      if (!navigator.geolocation) {
        setIsGettingLocation(false);
        return;
      }

      if (location) {
        setIsGettingLocation(false);
        return;
      }

      setIsGettingLocation(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setUserLocation(loc);
          setIsGettingLocation(false);
          group.setFieldValue("location", loc);
        },
        (error) => {
          console.error("Geolocation error:", error);
          setIsGettingLocation(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10_000,
          maximumAge: 0,
        }
      );
    }, [location, group]);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          suggestionsRef.current &&
          !suggestionsRef.current.contains(event.target as Node)
        ) {
          setShowSuggestions(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const searchLocation = async (query: string) => {
      const trimmedQuery = query.trim();
      if (trimmedQuery.length === 0) {
        setSuggestions([]);
        return;
      }

      if (!GOOGLE_MAP_API_KEY) {
        setSuggestions([]);
        return;
      }

      setIsSearching(true);
      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&key=${GOOGLE_MAP_API_KEY}&components=country:id&types=establishment|geocode`
        );

        if (!response.ok) {
          throw new Error("Failed to search location");
        }

        const data = (await response.json()) as GooglePlacesResponse;
        if (data.status === "OK" || data.status === "ZERO_RESULTS") {
          setSuggestions(data.predictions || []);
          setShowSuggestions(true);
        } else {
          console.error("Google Places API error:", data.status);
          setSuggestions([]);
        }
      } catch (error) {
        console.error("Location search error:", error);
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    };

    const handleLocationInputChange = (value: string) => {
      setLocationQuery(value);

      if (searchTimeoutRef.current !== undefined) {
        clearTimeout(searchTimeoutRef.current);
      }

      searchTimeoutRef.current = setTimeout(() => {
        if (value.trim()) {
          searchLocation(value);
        } else {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      }, 300);
    };

    const handleSelectLocation = async (prediction: GooglePlacePrediction) => {
      if (!GOOGLE_MAP_API_KEY) return;

      setIsSearching(true);
      try {
        const detailsResponse = await fetch(
          `https://maps.googleapis.com/maps/api/place/details/json?place_id=${prediction.place_id}&key=${GOOGLE_MAP_API_KEY}&fields=formatted_address,geometry,address_components,name`
        );

        if (!detailsResponse.ok) {
          throw new Error("Failed to get place details");
        }

        const detailsData =
          (await detailsResponse.json()) as GooglePlaceDetails;

        if (detailsData.status !== "OK" || !detailsData.result) {
          throw new Error("Failed to get place details");
        }

        const place = detailsData.result;
        const addr = place.formatted_address;
        const latitude = place.geometry.location.lat;
        const longitude = place.geometry.location.lng;

        const districtComponent = place.address_components.find(
          (component) =>
            component.types.includes("sublocality") ||
            component.types.includes("sublocality_level_1") ||
            component.types.includes("administrative_area_level_3") ||
            component.types.includes("neighborhood")
        );
        const district =
          districtComponent?.long_name || place.name || addr.split(",")[0];

        updateLocation(addr, district, latitude, longitude);
      } catch (error) {
        console.error("Error getting place details:", error);
      } finally {
        setIsSearching(false);
      }
    };

    const handleLocationSearch = () => {
      if (locationQuery.trim()) {
        searchLocation(locationQuery);
      }
    };

    const updateLocation = (
      addr: string,
      district: string,
      latitude: number,
      longitude: number
    ) => {
      group.setFieldValue("address", addr);
      group.setFieldValue("district", district);
      group.setFieldValue("location", { latitude, longitude });

      setLocationQuery(addr);
      setShowSuggestions(false);
      setSuggestions([]);
    };

    const handleMapLocationChange = (lat: number, lng: number) => {
      group.setFieldValue("location", {
        latitude: lat,
        longitude: lng,
      });
    };

    const handleMapAddressChange = (addr: string, district: string) => {
      group.setFieldValue("address", addr);
      group.setFieldValue("district", district);
      setLocationQuery(addr);
    };

    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="text-sm font-medium text-gray-500 mb-2">Step 3</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Confirm Address
          </h1>
          <p className="text-lg text-gray-600">
            Your address is only shared with guests after they've made a
            reservation. Search for an address or click on the map to drop a
            pin.
          </p>
        </div>

        <div className="space-y-6">
          <div className="relative">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400 z-10" />
                {isSearching && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 size-5 text-gray-400 animate-spin z-10" />
                )}
                <Input
                  className="pl-10 pr-10"
                  data-testid="address-search"
                  id="location"
                  onChange={(e) => handleLocationInputChange(e.target.value)}
                  onFocus={() => {
                    if (suggestions.length > 0) {
                      setShowSuggestions(true);
                    }
                  }}
                  placeholder="Enter address (e.g., Jakarta, Indonesia)"
                  value={locationQuery}
                />
              </div>
              <Button
                disabled={isSearching}
                onClick={handleLocationSearch}
                type="button"
                variant="outline"
              >
                {isSearching ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  "Search"
                )}
              </Button>
            </div>

            {showSuggestions && suggestions.length > 0 && (
              <div
                className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                ref={suggestionsRef}
              >
                {suggestions.map((prediction) => (
                  <button
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                    key={prediction.place_id}
                    onClick={() => handleSelectLocation(prediction)}
                    type="button"
                  >
                    <div className="font-medium text-gray-900">
                      {prediction.structured_formatting.main_text}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {prediction.structured_formatting.secondary_text}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {isGettingLocation ? (
            <div className="w-full h-[400px] rounded-lg border border-gray-200 flex items-center justify-center bg-gray-50">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="size-8 animate-spin text-gray-400" />
                <p className="text-sm text-gray-600">
                  Getting your location...
                </p>
              </div>
            </div>
          ) : (
            <LocationMap
              latitude={location?.latitude || userLocation?.latitude || -6.2088}
              longitude={
                location?.longitude || userLocation?.longitude || 106.8456
              }
              onAddressChange={handleMapAddressChange}
              onLocationChange={handleMapLocationChange}
            />
          )}

          {address && location && (
            <p className="text-sm text-green-600">✓ Location set: {address}</p>
          )}
        </div>

        <div className="mt-8 flex justify-between items-center border-t pt-6">
          <Button onClick={onBack} variant="outline">
            Back
          </Button>
          <Button disabled={!canProceed} onClick={onNext}>
            Next
          </Button>
        </div>
      </div>
    );
  },
});
