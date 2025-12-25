// // src/pages/FlightSearch.tsx
// import { useFilterStore } from "../store/filterStore";
// import { searchFlights } from "../services/amadeusService";
// import { useFilterSync } from "../hooks/useFilterSync";

// export default function FlightSearch() {
//   const { filters } = useFilterStore();
//   useFilterSync(); // Keep URL in sync

//   const [searchParams] = useSearchParams();

//   const handleSearch = async () => {
//     const params = {
//       from: searchParams.get("from") || "",
//       to: searchParams.get("to") || "",
//       departureDate: searchParams.get("departureDate") || "",
//       adults: parseInt(searchParams.get("adults") || "1"),
//     };

//     const results = await searchFlights(params, filters);
//     // Update results state...
//   };

//   return (
//     <div>
//       {/* Sidebar with filters */}
//       <Sidebar />
//       {/* Flight results */}
//       <FlightResults />
//     </div>
//   );
// }

import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { searchFlights } from "../services/flightApi";
import { useFilterStore } from "../store/filterStore";
import { useFilterSync } from "../hooks/useFilterSync";
import { FlightResult } from "../types";
import { FlightSearchParams } from "../types/filters";

export default function FlightSearchPage() {
  const [searchParams] = useSearchParams();
  const { filters } = useFilterStore();
  const [flightResults, setFlightResults] = useState<FlightResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Keep filters in sync with URL
  useFilterSync();

  // Fetch flights when search params or filters change
  useEffect(() => {
    const fetchFlights = async () => {
      const from = searchParams.get("from");
      const to = searchParams.get("to");
      const departureDate = searchParams.get("departureDate");

      if (!from || !to || !departureDate) {
        setError("Missing search parameters");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const params: FlightSearchParams = {
          from,
          to,
          departureDate,
          adults: parseInt(searchParams.get("adults") || "1"),
          returnDate: searchParams.get("returnDate") || undefined,
          children: parseInt(searchParams.get("children") || "0") || undefined,
          infants: parseInt(searchParams.get("infants") || "0") || undefined,
          cabinClass: searchParams.get("cabinClass") || "economy",
        };

        const results = await searchFlights(params, filters);
        setFlightResults(results);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch flights"
        );
        setFlightResults([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFlights();
  }, [searchParams, filters]);

  return (
    <div className="flex gap-6 p-6 max-w-7xl mx-auto">
      {/* Sidebar */}
      <aside className="w-80 flex-shrink-0">
        <Sidebar />
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        {/* Search Summary */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold">
            {searchParams.get("from")} → {searchParams.get("to")}
          </h1>
          <p className="text-gray-600">
            {searchParams.get("departureDate")} · {searchParams.get("adults")}{" "}
            adult{parseInt(searchParams.get("adults") || "1") > 1 ? "s" : ""}
            {searchParams.get("children") &&
              `, ${searchParams.get("children")} children`}
            {searchParams.get("infants") &&
              `, ${searchParams.get("infants")} infant`}
            · {searchParams.get("cabinClass")}
          </p>
        </div>

        {/* Results Status */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-gray-700">
            {loading
              ? "Searching flights..."
              : `${flightResults.length} flight${
                  flightResults.length !== 1 ? "s" : ""
                } found`}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-gray-200 h-24 rounded-lg animate-pulse"
              />
            ))}
          </div>
        )}

        {/* Flight Results */}
        {!loading && flightResults.length > 0 && (
          <FlightResults flights={flightResults} />
        )}

        {/* No Results */}
        {!loading && flightResults.length === 0 && !error && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
            <p className="text-blue-900">
              No flights found matching your criteria.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
