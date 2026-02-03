import { cache } from "../utils/cache";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3001/api";

// Default timeout for API requests (30 seconds)
const DEFAULT_TIMEOUT = 30000;

/**
 * Fetch with timeout
 * @param {string} url - The URL to fetch
 * @param {RequestInit} options - Fetch options
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise<Response>}
 */
const fetchWithTimeout = async (
  url,
  options = {},
  timeout = DEFAULT_TIMEOUT
) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === "AbortError") {
      throw new Error(
        "Request timed out. Please check your internet connection and try again."
      );
    }
    throw error;
  }
};

/**
 * Search flights with caching
 * Uses localStorage for persistent caching across sessions
 */
export const searchFlights = async (searchParams) => {
  return cache.getOrFetch(
    "flights",
    searchParams,
    async () => {
      try {
        const response = await fetchWithTimeout(
          `${API_BASE_URL}/flights/search`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(searchParams),
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage =
            errorData.message ||
            errorData.error ||
            `Flight search failed (${response.status})`;
          throw new Error(errorMessage);
        }

        const result = await response.json();
        return result.data || [];
      } catch (error) {
        // Re-throw with more user-friendly message if it's a generic error
        if (error.message === "Failed to fetch") {
          throw new Error(
            "Unable to connect to the server. Please check your internet connection."
          );
        }
        throw error;
      }
    },
    {
      ttl: 2 * 60 * 1000, // 2 minutes - flight prices change frequently
      storage: "localStorage",
      staleWhileRevalidate: true, // Return cached data while fetching fresh data in background
    }
  );
};

/**
 * Search airports with caching
 * Uses localStorage with longer TTL since airport data rarely changes
 */
export const searchAirports = async (keyword) => {
  return cache.getOrFetch(
    "airports",
    { keyword },
    async () => {
      try {
        const response = await fetchWithTimeout(
          `${API_BASE_URL}/flights/airports?keyword=${encodeURIComponent(
            keyword
          )}`,
          { method: "GET" },
          15000 // Shorter timeout for airport search (15 seconds)
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage =
            errorData.message ||
            errorData.error ||
            `Airport search failed (${response.status})`;
          throw new Error(errorMessage);
        }

        const result = await response.json();
        return result.data || [];
      } catch (error) {
        // Re-throw with more user-friendly message if it's a generic error
        if (error.message === "Failed to fetch") {
          throw new Error(
            "Unable to connect to the server. Please check your internet connection."
          );
        }
        throw error;
      }
    },
    {
      ttl: 60 * 60 * 1000, // 1 hour - airport data is static
      storage: "localStorage",
    }
  );
};

/**
 * Clear flight search cache
 * Useful when user wants fresh results
 */
export const clearFlightCache = () => {
  cache.clearNamespace("flights", "localStorage");
};

/**
 * Clear airport search cache
 */
export const clearAirportCache = () => {
  cache.clearNamespace("airports", "localStorage");
};
