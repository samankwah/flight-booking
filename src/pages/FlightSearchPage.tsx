import React, { useState, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { flightResultsMock, airports } from "../data/mockData"; // Removed 'airlines'
import type { FlightResult } from "../types"; // Removed 'Airline', 'Airport'

const FlightCard: React.FC<{ flight: FlightResult }> = ({ flight }) => {
  const navigate = useNavigate();
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex flex-col md:flex-row justify-between items-start md:items-center">
      <div className="flex-grow mb-4 md:mb-0">
        <div className="flex items-center space-x-2 mb-1">
          <img
            src={`https://www.gstatic.com/flights/airline_logos/70px/${flight.airline.code}.png`} // Placeholder for airline logo
            alt={flight.airline.name}
            className="h-6 w-6 object-contain"
          />
          <h3 className="font-bold text-lg text-gray-900 dark:text-white">
            {flight.airline.name}
          </h3>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            ({flight.flightNumber})
          </span>
        </div>
        <div className="flex items-center space-x-4 text-gray-700 dark:text-gray-300">
          <p>
            <span className="font-semibold">{flight.departureTime}</span>{" "}
            <span className="text-sm">{flight.departureAirport.code}</span>
          </p>
          <span>—</span>
          <p>
            <span className="font-semibold">{flight.arrivalTime}</span>{" "}
            <span className="text-sm">{flight.arrivalAirport.code}</span>
          </p>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {flight.duration} &bull;{" "}
          {flight.stops === 0 ? "Nonstop" : `${flight.stops} Stop(s)`} &bull;{" "}
          {flight.cabinClass.charAt(0).toUpperCase() + flight.cabinClass.slice(1)}
        </p>
      </div>
      <div className="text-right flex flex-col items-end">
        <p className="font-bold text-2xl text-cyan-600 dark:text-cyan-400">
          {flight.currency} {flight.price.toLocaleString()}
        </p>
        <button
          onClick={() => navigate(`/booking?flightId=${flight.id}`)}
          className="mt-2 bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 transition"
        >
          View Deal
        </button>
      </div>
    </div>
  );
};

const FlightSearchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [airlineFilter, setAirlineFilter] = useState("All");
  const [stopFilter, setStopFilter] = useState("All"); // "All", "Nonstop", "1", "2+"
  const [sort, setSort] = useState("price-asc");

  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");
  const departureDateParam = searchParams.get("departureDate");
  const returnDateParam = searchParams.get("returnDate");
  const adultsParam = searchParams.get("adults");
  const childrenParam = searchParams.get("children");
  const infantsParam = searchParams.get("infants");
  const tripTypeParam = searchParams.get("tripType");
  const cabinClassParam = searchParams.get("cabinClass");

  const getAirportByCode = (code: string | null) =>
    airports.find((airport) => airport.code === code);

  const fromAirport = getAirportByCode(fromParam);
  const toAirport = getAirportByCode(toParam);

  const airlineOptions = useMemo(() => {
    const uniqueAirlines = Array.from(
      new Set(flightResultsMock.map((flight) => flight.airline.name))
    );
    return ["All", ...uniqueAirlines];
  }, []);

  const flightResults = useMemo(() => {
    let results: FlightResult[] = flightResultsMock;

    // Filter by search parameters
    results = results.filter((flight) => {
      let matches = true;

      if (fromAirport && flight.departureAirport.code !== fromAirport.code)
        matches = false;
      if (toAirport && flight.arrivalAirport.code !== toAirport.code)
        matches = false;
      if (departureDateParam && flight.departureDate !== departureDateParam)
        matches = false;
      // Add more filtering for returnDate, adults, children, infants, tripType, cabinClass if needed
      // For simplicity, we are not filtering by all params on mock data.
      // A real API would handle this more robustly.

      return matches;
    });

    // Filter by airline
    if (airlineFilter !== "All") {
      results = results.filter(
        (flight) => flight.airline.name === airlineFilter
      );
    }

    // Filter by stops
    if (stopFilter !== "All") {
      if (stopFilter === "Nonstop") {
        results = results.filter((flight) => flight.stops === 0);
      } else if (stopFilter === "1") {
        results = results.filter((flight) => flight.stops === 1);
      } else if (stopFilter === "2+") {
        results = results.filter((flight) => flight.stops >= 2);
      }
    }

    // Sort
    if (sort === "price-asc") {
      results.sort((a, b) => a.price - b.price);
    } else if (sort === "price-desc") {
      results.sort((a, b) => b.price - a.price);
    } else if (sort === "duration-asc") {
      // Assuming duration is Xh Ym, convert to minutes for sorting
      results.sort((a, b) => {
        const parseDuration = (d: string) => {
          const parts = d.match(/(\d+)h\s*(\d*)m?/);
          return parts ? parseInt(parts[1]) * 60 + parseInt(parts[2] || "0") : 0;
        };
        return parseDuration(a.duration) - parseDuration(b.duration);
      });
    } else if (sort === "duration-desc") {
      results.sort((a, b) => {
        const parseDuration = (d: string) => {
          const parts = d.match(/(\d+)h\s*(\d*)m?/);
          return parts ? parseInt(parts[1]) * 60 + parseInt(parts[2] || "0") : 0;
        };
        return parseDuration(b.duration) - parseDuration(a.duration);
      });
    }

    return results;
  }, [
    fromAirport,
    toAirport,
    departureDateParam,
    airlineFilter,
    stopFilter,
    sort,
  ]);

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Your Search
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">From</p>
            <p className="font-bold">{fromAirport?.city || "N/A"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">To</p>
            <p className="font-bold">{toAirport?.city || "N/A"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Departure
            </p>
            <p className="font-bold">{departureDateParam || "N/A"}</p>
          </div>
          {returnDateParam && (
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Return
              </p>
              <p className="font-bold">{returnDateParam}</p>
            </div>
          )}
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Passengers
            </p>
            <p className="font-bold">
              {adultsParam || 0} Adults, {childrenParam || 0} Children,{" "}
              {infantsParam || 0} Infants
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Trip Type
            </p>
            <p className="font-bold">{tripTypeParam || "N/A"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Cabin Class
            </p>
            <p className="font-bold">
              {cabinClassParam
                ? cabinClassParam.charAt(0).toUpperCase() +
                  cabinClassParam.slice(1)
                : "N/A"}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 space-y-4 md:space-y-0">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
          Flight Search Results
        </h1>
        <div className="flex gap-4 flex-wrap">
          {/* Airline Filter */}
          <select
            value={airlineFilter}
            onChange={(e) => setAirlineFilter(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white"
          >
            {airlineOptions.map((option) => (
              <option key={option} value={option}>
                {option === "All" ? "All Airlines" : option}
              </option>
            ))}
          </select>

          {/* Stops Filter */}
          <select
            value={stopFilter}
            onChange={(e) => setStopFilter(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white"
          >
            <option value="All">All Stops</option>
            <option value="Nonstop">Nonstop</option>
            <option value="1">1 Stop</option>
            <option value="2+">2+ Stops</option>
          </select>

          {/* Sort By */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white"
          >
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="duration-asc">Duration: Low to High</option>
            <option value="duration-desc">Duration: High to Low</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {flightResults.length > 0 ? (
          flightResults.map((flight) => (
            <FlightCard key={flight.id} flight={flight} />
          ))
        ) : (
          <div className="text-center text-gray-600 dark:text-gray-400 py-10">
            No flights found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
};

export default FlightSearchPage;
