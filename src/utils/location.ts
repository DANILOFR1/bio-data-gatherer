
import { Coordinates } from "@/types/types";

interface GeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

const defaultOptions: GeolocationOptions = {
  enableHighAccuracy: true,
  timeout: 15000,
  maximumAge: 0,
};

export const getCurrentLocation = (
  options: GeolocationOptions = defaultOptions
): Promise<Coordinates> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        reject(error);
      },
      options
    );
  });
};

export const getLocationName = async (
  coordinates: Coordinates
): Promise<string> => {
  try {
    // First check if we're online
    if (!navigator.onLine) {
      return `${coordinates.latitude.toFixed(6)}, ${coordinates.longitude.toFixed(6)}`;
    }

    // Try to get location name from OpenStreetMap
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coordinates.latitude}&lon=${coordinates.longitude}&zoom=18&addressdetails=1`,
        {
          headers: {
            "User-Agent": "BioDataCollector/1.0",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to get location name");
      }

      const data = await response.json();
      return data.display_name || "Unknown location";
    } catch (error) {
      // Fall back to coordinates if API call fails
      console.error("Error getting location name:", error);
      return `${coordinates.latitude.toFixed(6)}, ${coordinates.longitude.toFixed(6)}`;
    }
  } catch (error) {
    console.error("Error getting location name:", error);
    return `${coordinates.latitude.toFixed(6)}, ${coordinates.longitude.toFixed(6)}`;
  }
};
