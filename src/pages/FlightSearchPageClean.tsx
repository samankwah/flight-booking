// src/pages/FlightSearchPage.tsx
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { searchFlights } from "../services/amadeusService";
import FlightResults from "../components/FlightResults";
import Sidebar from "../components/Sidebar";
import LoadingWrapper from "../components/LoadingWrapper";
import { FlightResult } from "../types";

export default function FlightSearchPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [flights, setFlights] = useState<FlightResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"best" | "cheapest" | "fastest">("best");

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const results = await searchFlights({
          from: searchParams.get("from")!,
          to: searchParams.get("to")!,
          departureDate: searchParams.get("departureDate")!,
          adults: parseInt(searchParams.get("adults") || "1"),
          returnDate: searchParams.get("returnDate") || undefined,
          children: parseInt(searchParams.get("children") || "0") || undefined,
          infants: parseInt(searchParams.get("infants") || "0") || undefined,
          cabinClass: searchParams.get("travelClass") || "ECONOMY",
        });
        setFlights(results);
      } catch (err: any) {
        setError(err.message || "Failed to load flights");
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if we have the required parameters
    if (
      searchParams.get("from") &&
      searchParams.get("to") &&
      searchParams.get("departureDate")
    ) {
      fetch();
    } else {
      setLoading(false);
      setError(
        "Missing required search parameters. Please go back and search for flights."
      );
    }
  }, [searchParams]);

  const cheapest =
    flights.length > 0
      ? flights.reduce((a, b) => (a.price < b.price ? a : b))
      : null;
  const quickest =
    flights.length > 0
      ? flights.reduce((a, b) => (a.duration < b.duration ? a : b))
      : null;
  const best = flights[0];

  const formatDuration = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m === 0 ? `${h}h` : `${h}h ${m}m`;
  };

  const from = searchParams.get("from") || "LHR";
  const to = searchParams.get("to") || "JFK";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header + Tabs + Modify Search - ALL ON THE SAME LINE */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 lg:px-60">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between py-2 gap-6">
            {/* Route + Date */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {from} to {to}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {searchParams.get("departureDate")} •{" "}
                {searchParams.get("adults")} adult(s) • Economy
              </p>
            </div>

            {/* TABS + MODIFY SEARCH - SAME LINE, RIGHT-ALIGNED */}
            <div className="flex items-center gap-8">
              {/* Kayak Tabs - now perfectly inline */}
              <div className="flex bg-gray-100 rounded-lg p-1 shadow-sm">
                {[
                  {
                    key: "cheapest",
                    label: "Cheapest",
                    price: cheapest?.price,
                    dur: cheapest?.duration,
                  },
                  {
                    key: "best",
                    label: "Best",
                    price: best?.price,
                    dur: best?.duration,
                    info: true,
                  },
                  {
                    key: "fastest",
                    label: "Fastest",
                    price: quickest?.price,
                    dur: quickest?.duration,
                  },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setSortBy(tab.key as any)}
                    className={`flex flex-col px-8 py-2 rounded-md transition-all font-medium text-sm ${
                      sortBy === tab.key
                        ? "bg-white text-blue-700 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold">{tab.label}</span>
                      {tab.info && (
                        <svg
                          className="w-3.5 h-3.5 text-gray-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                    <span className="text-xs mt-0.5">
                      ${tab.price || "-"} •{" "}
                      {tab.dur ? formatDuration(tab.dur) : "-"}
                    </span>
                  </button>
                ))}
              </div>

              {/* Modify Search - same line, right-aligned */}
              <button
                onClick={() => navigate("/")}
                className="text-blue-600 hover:underline text-sm font-medium whitespace-nowrap"
              >
                Modify search
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-8">
          <aside className="w-80 hidden lg:block sticky top-32 self-start">
            <Sidebar />
          </aside>

          <main className="flex-1">
            <LoadingWrapper loading={loading} error={error}>
              <FlightResults flights={flights} sortBy={sortBy} />
            </LoadingWrapper>
          </main>
        </div>
      </div>
    </div>
  );
}
