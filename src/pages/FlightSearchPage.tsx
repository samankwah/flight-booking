// src/pages/FlightSearchPage.tsx
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { searchFlights } from "../services/flightApi";
import FlightResults from "../components/FlightResults";
import Sidebar from "../components/Sidebar";
import MobileSidebar from "../components/MobileSidebar";
import LoadingWrapper from "../components/LoadingWrapper";
import { FlightResult, MultiCitySegment } from "../types";

export default function FlightSearchPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [flights, setFlights] = useState<FlightResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"best" | "cheapest" | "fastest">("best");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      setError(null);

      const loadingToast = toast.loading("Searching for flights...");

      try {
        const tripType = searchParams.get("tripType");

        // Handle multi-city search
        if (tripType === "multiCity") {
          const segmentsParam = searchParams.get("segments");
          if (!segmentsParam) {
            throw new Error("Multi-city segments are required. Please go back and search for flights.");
          }

          const segments = JSON.parse(segmentsParam);
          const results = await searchFlights({
            segments,
            adults: parseInt(searchParams.get("adults") || "1"),
            children: parseInt(searchParams.get("children") || "0") || undefined,
            infants: parseInt(searchParams.get("infants") || "0") || undefined,
            travelClass: searchParams.get("travelClass") || "ECONOMY",
          });
          setFlights(results);

          if (results.length === 0) {
            toast.info("No flights found for your search. Try adjusting your dates or destinations.", { id: loadingToast, duration: 5000 });
          } else {
            toast.success(`Found ${results.length} flights!`, { id: loadingToast });
          }
        } else {
          // Handle one-way and round-trip search
          const results = await searchFlights({
            origin: searchParams.get("from")!,
            destination: searchParams.get("to")!,
            departureDate: searchParams.get("departureDate")!,
            adults: parseInt(searchParams.get("adults") || "1"),
            returnDate: searchParams.get("returnDate") || undefined,
            children: parseInt(searchParams.get("children") || "0") || undefined,
            infants: parseInt(searchParams.get("infants") || "0") || undefined,
            travelClass: searchParams.get("travelClass") || "ECONOMY",
          });
          setFlights(results);

          if (results.length === 0) {
            toast.info("No flights found for your search. Try adjusting your dates or destinations.", { id: loadingToast, duration: 5000 });
          } else {
            toast.success(`Found ${results.length} flights!`, { id: loadingToast });
          }
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load flights. Please try again.";
        setError(errorMessage);
        toast.error(errorMessage, { id: loadingToast, duration: 6000 });
      } finally {
        setLoading(false);
      }
    };

    const tripType = searchParams.get("tripType");

    // Only fetch if we have the required parameters
    if (tripType === "multiCity") {
      if (searchParams.get("segments")) {
        fetch();
      } else {
        setLoading(false);
        setError("Missing multi-city segments. Please go back and search for flights.");
      }
    } else if (
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

  const tripType = searchParams.get("tripType");
  const from = searchParams.get("from") || "LHR";
  const to = searchParams.get("to") || "JFK";

  // Parse multi-city segments for header display
  let multiCityRoute = "";
  if (tripType === "multiCity" && searchParams.get("segments")) {
    try {
      const segments: MultiCitySegment[] = JSON.parse(searchParams.get("segments")!);
      multiCityRoute = segments.map((seg: MultiCitySegment) => seg.from?.code).join(" → ");
      multiCityRoute += ` → ${segments[segments.length - 1].to?.code}`;
    } catch (e) {
      multiCityRoute = "Multi-City";
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header + Tabs + Modify Search - ALL ON THE SAME LINE */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between py-3 gap-4">
            {/* Route + Date */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {tripType === "multiCity" ? multiCityRoute : `${from} to ${to}`}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {tripType === "multiCity" ? "Multi-City" : searchParams.get("departureDate")} •{" "}
                {searchParams.get("adults")} adult(s) • {searchParams.get("travelClass") || "Economy"}
              </p>
            </div>

            {/* TABS + MODIFY SEARCH - SAME LINE, RIGHT-ALIGNED */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-8">
              {/* Kayak Tabs - now perfectly inline */}
              <div className="flex bg-gray-100 rounded-lg p-1 shadow-sm overflow-x-auto">
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
                    onClick={() =>
                      setSortBy(tab.key as "best" | "cheapest" | "fastest")
                    }
                    className={`flex flex-col px-3 py-2 rounded-md transition-all font-medium text-xs sm:text-sm whitespace-nowrap ${
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

              {/* Mobile Filter Button + Modify Search - same line, right-aligned */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsMobileSidebarOpen(true)}
                  className="lg:hidden flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
                    />
                  </svg>
                  Filters
                </button>
                <button
                  onClick={() => navigate("/")}
                  className="text-blue-600 hover:underline text-sm font-medium whitespace-nowrap"
                >
                  Modify search
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex gap-6 lg:gap-8">
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

      {/* Mobile Sidebar */}
      <MobileSidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />
    </div>
  );
}
