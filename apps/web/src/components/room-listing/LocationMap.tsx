/// <reference types="google.maps" />

import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

declare global {
  // biome-ignore lint/style/useConsistentTypeDefinitions: global interface needed for Google Maps
  interface Window {
    google: {
      maps: typeof google.maps;
    };
  }
}

type LocationMapProps = {
  latitude: number;
  longitude: number;
  onLocationChange: (lat: number, lng: number) => void;
  onAddressChange: (address: string, district: string) => void;
};

export function LocationMap({
  latitude,
  longitude,
  onLocationChange,
  onAddressChange,
}: LocationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const isUpdatingProgrammatically = useRef(false);
  const lastPositionRef = useRef<{ lat: number; lng: number } | null>(null);
  const onAddressChangeRef = useRef(onAddressChange);
  const onLocationChangeRef = useRef(onLocationChange);
  const isInitializedRef = useRef(false);

  // Keep refs in sync with props
  useEffect(() => {
    onAddressChangeRef.current = onAddressChange;
    onLocationChangeRef.current = onLocationChange;
  }, [onAddressChange, onLocationChange]);

  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAP_API_KEY;
    if (!apiKey) return;

    setIsReverseGeocoding(true);
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
      );

      if (!response.ok) {
        throw new Error("Failed to reverse geocode");
      }

      const data = (await response.json()) as {
        status: string;
        results: Array<{
          formatted_address: string;
          address_components: Array<{
            types: string[];
            long_name: string;
          }>;
        }>;
      };
      if (data.status === "OK" && data.results.length > 0) {
        const result = data.results[0];
        const address = result.formatted_address;

        const districtComponent = result.address_components.find(
          (component) =>
            component.types.includes("sublocality") ||
            component.types.includes("sublocality_level_1") ||
            component.types.includes("administrative_area_level_3") ||
            component.types.includes("neighborhood")
        );
        const district = districtComponent?.long_name || address.split(",")[0];

        // Use ref to avoid dependency on onAddressChange
        onAddressChangeRef.current(address, district);
      }
    } catch (error) {
      console.error("Reverse geocoding failed:", error);
    } finally {
      setIsReverseGeocoding(false);
    }
  }, []);

  const initializeMap = useCallback(() => {
    if (!(mapRef.current && window.google) || isInitializedRef.current) return;

    const initialLocation: google.maps.LatLngLiteral = {
      lat: latitude || -6.2088,
      lng: longitude || 106.8456,
    };

    const mapInstance = new window.google.maps.Map(mapRef.current, {
      center: initialLocation,
      zoom: 15,
      mapTypeControl: false, // Remove map/satellite toggle
      streetViewControl: false,
      fullscreenControl: false,
    });

    const markerInstance = new window.google.maps.Marker({
      position: initialLocation,
      map: mapInstance,
      draggable: true,
    });

    markerInstance.addListener("dragend", (e: google.maps.MapMouseEvent) => {
      const latLng = e.latLng;
      if (latLng && !isUpdatingProgrammatically.current) {
        const lat = latLng.lat();
        const lng = latLng.lng();
        // Use refs to avoid dependency issues
        onLocationChangeRef.current(lat, lng);
        reverseGeocode(lat, lng);
      }
    });

    mapInstance.addListener("click", (e: google.maps.MapMouseEvent) => {
      const latLng = e.latLng;
      if (latLng && !isUpdatingProgrammatically.current) {
        const lat = latLng.lat();
        const lng = latLng.lng();
        markerInstance.setPosition({ lat, lng });
        // Use refs to avoid dependency issues
        onLocationChangeRef.current(lat, lng);
        reverseGeocode(lat, lng);
      }
    });

    setMap(mapInstance);
    setMarker(markerInstance);
    setIsLoading(false);
    isInitializedRef.current = true;
    lastPositionRef.current = initialLocation;

    // Only reverse geocode on initial load if we have valid coordinates
    // Don't call it here to avoid infinite loop - let the useEffect handle it
  }, [latitude, longitude, reverseGeocode]);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAP_API_KEY;
    if (!(apiKey && mapRef.current)) return;

    const scriptId = "google-maps-script";
    const existingScript = document.getElementById(scriptId);

    if (existingScript && window.google) {
      const timer = setTimeout(initializeMap, 100);
      return () => clearTimeout(timer);
    }

    if (existingScript) {
      const handleLoad = () => initializeMap();
      existingScript.addEventListener("load", handleLoad);
      return () => {
        existingScript.removeEventListener("load", handleLoad);
      };
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = initializeMap;
    document.head.appendChild(script);

    return () => {};
  }, [initializeMap]);

  // Initial reverse geocode on mount (only once)
  const hasInitialGeocodedRef = useRef(false);
  useEffect(() => {
    if (
      map &&
      marker &&
      latitude &&
      longitude &&
      !hasInitialGeocodedRef.current &&
      !isUpdatingProgrammatically.current
    ) {
      hasInitialGeocodedRef.current = true;
      // Only reverse geocode once on initial load
      reverseGeocode(latitude, longitude);
    }
  }, [map, marker, latitude, longitude, reverseGeocode]);

  useEffect(() => {
    if (map && marker && latitude && longitude) {
      const newPosition: google.maps.LatLngLiteral = {
        lat: latitude,
        lng: longitude,
      };

      // Check if position actually changed to avoid unnecessary updates
      const lastPosition = lastPositionRef.current;
      if (
        lastPosition &&
        Math.abs(lastPosition.lat - newPosition.lat) < 0.0001 &&
        Math.abs(lastPosition.lng - newPosition.lng) < 0.0001
      ) {
        return;
      }

      // Set flag to prevent event handlers from firing during programmatic update
      isUpdatingProgrammatically.current = true;
      marker.setPosition(newPosition);
      map.panTo(newPosition);
      lastPositionRef.current = newPosition;

      // DO NOT call reverseGeocode here - it would cause infinite loop
      // Only call reverseGeocode on user interaction (drag/click) or initial load

      // Clear flag after a short delay to allow marker to settle
      setTimeout(() => {
        isUpdatingProgrammatically.current = false;
      }, 100);
    }
  }, [map, marker, latitude, longitude]);

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      )}
      {isReverseGeocoding && (
        <div className="absolute top-4 left-4 bg-white px-3 py-2 rounded-md shadow-md z-20">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Getting address...</span>
          </div>
        </div>
      )}
      <div
        className="w-full h-96 rounded-lg border border-gray-300"
        ref={mapRef}
      />
    </div>
  );
}
