const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

export interface FlightDestination {
  id: string;
  city: string;
  country: string;
  airport: string;
  price: number;
  departureDate: string;
  returnDate: string;
  origin: string;
}

export const searchFlightInspiration = async (origin: string): Promise<FlightDestination[]> => {
  try {
    console.log(`🌍 Fetching flight inspiration from ${origin}`);

    const response = await fetch(
      `${API_BASE_URL}/flights/inspiration?origin=${encodeURIComponent(origin)}`
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `HTTP error! status: ${response.status}`
      );
    }

    const result = await response.json();
    console.log("✅ Flight inspiration results:", result);

    return result.data || [];
  } catch (error) {
    console.error("❌ Error fetching flight inspiration:", error);
    throw error;
  }
};

export default {
  searchFlightInspiration,
};
