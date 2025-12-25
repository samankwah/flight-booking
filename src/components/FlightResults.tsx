import { useState, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { FlightResult } from "../types";

import { useFilterStore } from "../store/filterStore";
import PriceAlertButton from "./PriceAlertButton";

const ITEMS_PER_PAGE = 10;

interface Props {
  flights: FlightResult[];
  loading?: boolean;
  sortBy: "best" | "cheapest" | "fastest";
}

export default function FlightResults({
  flights,
  loading = false,
  sortBy,
}: Props) {
  const [displayedCount, setDisplayedCount] = useState(ITEMS_PER_PAGE);
  const { filters } = useFilterStore();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const safeFlights = Array.isArray(flights) ? flights : [];

  // Handle flight selection and navigation to booking page
  const handleSelectFlight = (flight: FlightResult) => {
    // Navigate to booking page with flight data in state
    navigate("/booking", {
      state: { flight }
    });
  };

  // Get currency symbol based on currency code
  const getCurrencySymbol = (currencyCode?: string): string => {
    const code = currencyCode?.toUpperCase() || 'USD';
    const symbols: Record<string, string> = {
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'GHS': '₵',
      'NGN': '₦',
      'ZAR': 'R',
      'KES': 'KSh',
      'EGP': 'E£',
      'MAD': 'MAD',
      'TZS': 'TSh',
      'UGX': 'USh',
      'XOF': 'CFA',
      'XAF': 'FCFA',
    };
    return symbols[code] || code + ' ';
  };

  const getAirlineCode = (name: string) => {
    const map: Record<string, string> = {
      "Biman Bangladesh Airlines": "BG",
      "US-Bangla Airlines": "BS",
      Novoair: "VQ",
      Emirates: "EK",
      Qatar: "QR",
    };
    return map[name] || name.substring(0, 2).toUpperCase();
  };

  const getAirlineLogoUrl = (code: string): string => {
    return `https://assets.duffel.com/img/airlines/for-light-background/full-color-logo/${code}.svg`;
  };

  const getPlaceholderSvg = (code: string): string => {
    const colors = [
      "#3B82F6",
      "#10B981",
      "#F59E0B",
      "#EF4444",
      "#8B5CF6",
      "#EC4899",
      "#06B6D4",
      "#84CC16",
    ];
    const color = colors[code.charCodeAt(0) % colors.length];

    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='${encodeURIComponent(
      color
    )}' rx='12'/%3E%3Ctext x='50' y='58' font-size='36' text-anchor='middle' fill='white' font-weight='bold' font-family='system-ui, -apple-system, sans-serif'%3E${code}%3C/text%3E%3C/svg%3E`;
  };

  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement>,
    code: string
  ) => {
    const img = e.currentTarget;

    const fallbacks = [
      `https://images.kiwi.com/airlines/64/${code}.png`,
      `https://pics.avs.io/200/100/${code}.png`,
      `https://content.airhex.com/content/logos/airlines_${code}_100_100_s.png`,
      getPlaceholderSvg(code),
    ];

    const currentSrc = img.src;
    const currentIndex = fallbacks.findIndex((url) =>
      currentSrc.includes(url.split("?")[0])
    );

    if (currentIndex < fallbacks.length - 1) {
      img.src = fallbacks[currentIndex + 1];
    }
  };

  // Filtering Logic
  const filteredFlights = useMemo(() => {
    return safeFlights.filter((flight) => {
      // Changed from 'flights' to 'safeFlights'
      // Price range filter
      if (filters.priceRange) {
        if (
          flight.price < filters.priceRange.min ||
          flight.price > filters.priceRange.max
        ) {
          return false;
        }
      }

      // Stops filter
      if (filters.maxStops !== undefined && flight.stops > filters.maxStops) {
        return false;
      }

      // Airlines filter
      if (filters.airlines && filters.airlines.length > 0) {
        if (!filters.airlines.includes(flight.airlineCode || flight.airline)) {
          return false;
        }
      }

      // Alliances filter (if flight has alliance info)
      if (filters.alliances && filters.alliances.length > 0) {
        if (!flight.alliance || !filters.alliances.includes(flight.alliance)) {
          return false;
        }
      }

      // Flight duration filter
      if (
        filters.maxFlightDuration &&
        flight.duration > filters.maxFlightDuration
      ) {
        return false;
      }

      // Hide basic tickets (if cabin class is economy/basic)
      if (
        filters.hideBasicTickets &&
        flight.cabinClass?.toLowerCase() === "economy"
      ) {
        return false;
      }

      return true;
    });
  }, [safeFlights, filters]);

  // Sorting Logic
  const sortedFlights = useMemo(() => {
    const list = [...filteredFlights];
    if (sortBy === "cheapest") {
      return list.sort((a, b) => a.price - b.price);
    }
    if (sortBy === "fastest") {
      return list.sort((a, b) => a.duration - b.duration);
    }
    // "best" = balanced score
    return list.sort((a, b) => {
      const scoreA = a.price * 0.6 + a.duration * 0.3 + a.stops * 120;
      const scoreB = b.price * 0.6 + b.duration * 0.3 + b.stops * 120;
      return scoreA - scoreB;
    });
  }, [filteredFlights, sortBy]);

  const displayedFlights = sortedFlights.slice(0, displayedCount);
  const hasMore = displayedCount < sortedFlights.length;

  // Skeleton Card
  const SkeletonCard = () => (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border animate-pulse">
      <div className="flex flex-col sm:grid sm:grid-cols-12 gap-4 sm:gap-6">
        <div className="flex justify-center sm:col-span-2">
          <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gray-200 rounded-xl sm:rounded-2xl" />
        </div>
        <div className="sm:col-span-3 space-y-3">
          <div className="h-6 sm:h-8 bg-gray-200 rounded w-20 sm:w-24" />
          <div className="h-4 sm:h-5 bg-gray-200 rounded w-12 sm:w-16" />
        </div>
        <div className="hidden sm:block sm:col-span-1" />
        <div className="sm:col-span-3 space-y-3">
          <div className="h-6 sm:h-8 bg-gray-200 rounded w-20 sm:w-24" />
          <div className="h-4 sm:h-5 bg-gray-200 rounded w-12 sm:w-16" />
        </div>
        <div className="sm:col-span-3 sm:text-right space-y-3">
          <div className="h-8 sm:h-10 bg-gray-200 rounded w-24 sm:w-32 sm:ml-auto" />
          <div className="h-10 sm:h-12 bg-gray-200 rounded w-full sm:w-40 sm:ml-auto" />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
        {[1, 2, 3, 4, 5].map((i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (safeFlights.length === 0 && !loading) {
    return (
      <div className="text-center py-12 sm:py-20 bg-white rounded-xl sm:rounded-2xl shadow mx-2 sm:mx-0">
        <p className="text-lg sm:text-xl text-gray-600 px-4">
          No flights found. Try adjusting your filters.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      {displayedFlights.map((flight) => {
        const code = getAirlineCode(flight.airline);

        return (
          <div
            key={flight.id}
            className="bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 p-4 sm:p-6"
          >
            {/* Mobile Layout */}
            <div className="flex flex-col space-y-4 md:hidden">
              {/* Header: Logo + Price */}
              <div className="flex items-center justify-between">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl flex items-center justify-center shadow-inner">
                  <img
                    src={getAirlineLogoUrl(code)}
                    alt=""
                    onError={(e) => handleImageError(e, code)}
                    className="w-12 h-12 object-contain"
                    loading="lazy"
                  />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-extrabold text-blue-600">
                    {getCurrencySymbol(flight.currency)}{Math.round(flight.price)}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Per adult</p>
                </div>
              </div>

              {/* Flight Times */}
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="text-2xl font-bold text-gray-900">
                    {flight.departureTime}
                  </div>
                  <div className="text-sm font-medium text-gray-600">
                    {flight.departureAirport}
                  </div>
                </div>

                <div className="flex-shrink-0 px-4">
                  <div className="text-center">
                    <div className="text-2xl text-gray-400">→</div>
                    <div className="text-xs font-medium text-blue-600 mt-1 whitespace-nowrap">
                      {Math.floor(flight.duration / 60)}h {flight.duration % 60}
                      m
                    </div>
                  </div>
                </div>

                <div className="flex-1 text-right">
                  <div className="text-2xl font-bold text-gray-900">
                    {flight.arrivalTime}
                  </div>
                  <div className="text-sm font-medium text-gray-600">
                    {flight.arrivalAirport}
                  </div>
                </div>
              </div>

              {/* Stops Info */}
              <div className="text-center text-sm text-gray-500">
                {flight.stops === 0
                  ? "Nonstop"
                  : `${flight.stops} stop${flight.stops > 1 ? "s" : ""}`}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => handleSelectFlight(flight)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md hover:shadow-lg"
                >
                  Select Flight
                </button>
                <PriceAlertButton
                  flightRoute={{
                    from: searchParams.get("from") || flight.departureAirport,
                    to: searchParams.get("to") || flight.arrivalAirport,
                    departureDate: searchParams.get("departureDate") || "",
                    returnDate: searchParams.get("returnDate") || undefined,
                  }}
                  currentPrice={flight.price}
                  travelClass={flight.cabinClass || searchParams.get("travelClass") || "ECONOMY"}
                  passengers={{
                    adults: parseInt(searchParams.get("adults") || "1"),
                    children: parseInt(searchParams.get("children") || "0") || undefined,
                    infants: parseInt(searchParams.get("infants") || "0") || undefined,
                  }}
                />
              </div>

              {/* Tags */}
              <div className="flex gap-2 pt-3 border-t">
                {flight.stops === 0 && (
                  <span className="px-3 py-1.5 bg-green-100 text-green-700 font-bold rounded-full text-xs">
                    Nonstop
                  </span>
                )}
                {flight.cabinClass !== "Economy" && (
                  <span className="px-3 py-1.5 bg-purple-100 text-purple-700 font-bold rounded-full text-xs">
                    {flight.cabinClass}
                  </span>
                )}
              </div>
            </div>

            {/* Desktop/Tablet Layout */}
            <div className="hidden md:grid md:grid-cols-12 gap-4 lg:gap-6 items-center">
              {/* Logo */}
              <div className="md:col-span-2 flex justify-center">
                <div className="w-20 h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-inner">
                  <img
                    src={getAirlineLogoUrl(code)}
                    alt=""
                    onError={(e) => handleImageError(e, code)}
                    className="w-16 h-16 lg:w-20 lg:h-20 object-contain"
                    loading="lazy"
                  />
                </div>
              </div>

              {/* Flight Details */}
              <div className="md:col-span-7">
                <div className="flex items-center gap-4 lg:gap-6">
                  {/* Departure */}
                  <div className="text-left">
                    <div className="text-2xl lg:text-3xl font-bold text-gray-900">
                      {flight.departureTime}
                    </div>
                    <div className="text-base lg:text-lg font-medium text-gray-600">
                      {flight.departureAirport}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {flight.stops === 0
                        ? "Nonstop"
                        : `${flight.stops} stop${flight.stops > 1 ? "s" : ""}`}
                    </div>
                  </div>

                  <div className="text-center text-2xl lg:text-3xl text-gray-400">
                    →
                  </div>

                  {/* Arrival */}
                  <div className="text-left">
                    <div className="text-2xl lg:text-3xl font-bold text-gray-900">
                      {flight.arrivalTime}
                    </div>
                    <div className="text-base lg:text-lg font-medium text-gray-600">
                      {flight.arrivalAirport}
                    </div>
                    <div className="text-sm font-medium text-blue-600 mt-1">
                      {Math.floor(flight.duration / 60)}h {flight.duration % 60}
                      m
                    </div>
                  </div>
                </div>
              </div>

              {/* Price */}
              <div className="md:col-span-3 text-right">
                <div className="text-3xl lg:text-4xl font-extrabold text-blue-600">
                  {getCurrencySymbol(flight.currency)}{Math.round(flight.price)}
                </div>
                <div className="mt-4 flex flex-col gap-2">
                  <button
                    onClick={() => handleSelectFlight(flight)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 lg:px-8 rounded-xl transition-all shadow-md hover:shadow-lg w-full lg:w-auto"
                  >
                    Select Flight
                  </button>
                  <PriceAlertButton
                    flightRoute={{
                      from: searchParams.get("from") || flight.departureAirport,
                      to: searchParams.get("to") || flight.arrivalAirport,
                      departureDate: searchParams.get("departureDate") || "",
                      returnDate: searchParams.get("returnDate") || undefined,
                    }}
                    currentPrice={flight.price}
                    travelClass={flight.cabinClass || searchParams.get("travelClass") || "ECONOMY"}
                    passengers={{
                      adults: parseInt(searchParams.get("adults") || "1"),
                      children: parseInt(searchParams.get("children") || "0") || undefined,
                      infants: parseInt(searchParams.get("infants") || "0") || undefined,
                    }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Per adult • Incl. taxes
                </p>
              </div>
            </div>

            {/* Tags - Desktop Only */}
            <div className="hidden md:flex gap-3 mt-6 pt-6 border-t">
              {flight.stops === 0 && (
                <span className="px-4 py-2 bg-green-100 text-green-700 font-bold rounded-full text-xs">
                  Nonstop
                </span>
              )}
              {flight.cabinClass !== "Economy" && (
                <span className="px-4 py-2 bg-purple-100 text-purple-700 font-bold rounded-full text-xs">
                  {flight.cabinClass}
                </span>
              )}
            </div>
          </div>
        );
      })}

      {/* Load More */}
      {hasMore && (
        <div className="text-center mt-8 sm:mt-10">
          <button
            onClick={() =>
              setDisplayedCount((prev) =>
                Math.min(prev + ITEMS_PER_PAGE, sortedFlights.length)
              )
            }
            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 sm:py-4 px-8 sm:px-12 rounded-xl shadow-lg transition-all text-sm sm:text-base"
          >
            Load More Flights ({sortedFlights.length - displayedCount}{" "}
            remaining)
          </button>
        </div>
      )}
    </div>
  );
}
