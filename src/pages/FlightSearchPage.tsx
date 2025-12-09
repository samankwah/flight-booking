// import React, { useState, useEffect, useMemo } from "react";
// import { useSearchParams, useNavigate } from "react-router-dom";
// import { airports, flightResultsMock } from "../data/mockData";
// import type { FlightResult } from "../types";
// import { searchFlights } from "../services/amadeusService";

// const FlightSearchPage: React.FC = () => {
//   const [searchParams] = useSearchParams();
//   const navigate = useNavigate();
//   const [airlineFilter, setAirlineFilter] = useState<string[]>([]);
//   const [stopFilter, setStopFilter] = useState<string[]>([
//     "Nonstop",
//     "1 stop",
//     "2+ stops",
//   ]);
//   const [sort, setSort] = useState("best");
//   const [priceAlert, setPriceAlert] = useState(false);
//   const [smartFiltersOpen, setSmartFiltersOpen] = useState(false);
//   const [smartFilterText, setSmartFilterText] = useState("");

//   const [flights, setFlights] = useState<FlightResult[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   const fromParam = searchParams.get("from");
//   const toParam = searchParams.get("to");
//   const departureDateParam = searchParams.get("departureDate");
//   const returnDateParam = searchParams.get("returnDate");
//   const adultsParam = searchParams.get("adults");
//   const childrenParam = searchParams.get("children");
//   const infantsParam = searchParams.get("infants");
//   const tripTypeParam = searchParams.get("tripType");
//   const cabinClassParam = searchParams.get("cabinClass");

//   const formatTime = (time: string) => {
//     const [hours, minutes] = time.split(":");
//     const h = parseInt(hours);
//     const ampm = h >= 12 ? "pm" : "am";
//     const displayHour = h > 12 ? h - 12 : h === 0 ? 12 : h;
//     return `${displayHour}:${minutes} ${ampm}`;
//   };

//   // Debug: Log received parameters
//   useEffect(() => {
//     console.log("Search Parameters:", {
//       from: fromParam,
//       to: toParam,
//       departureDate: departureDateParam,
//       returnDate: returnDateParam,
//       adults: adultsParam,
//       children: childrenParam,
//       infants: infantsParam,
//       tripType: tripTypeParam,
//       cabinClass: cabinClassParam,
//     });
//   }, [searchParams]);

//   const getAirportByCode = (code: string | null) =>
//     airports.find((airport) => airport.code === code);

//   const fromAirport = getAirportByCode(fromParam);
//   const toAirport = getAirportByCode(toParam);

//   // Fetch flights from Amadeus API
//   useEffect(() => {
//     const fetchFlights = async () => {
//       if (!fromParam || !toParam || !departureDateParam || !adultsParam) {
//         setError("Missing flight search parameters.");
//         setLoading(false);
//         return;
//       }

//       setLoading(true);
//       setError(null);

//       // Set to false to use real Amadeus API
//       const mockFlights = false;

//       if (mockFlights) {
//         await new Promise((resolve) => setTimeout(resolve, 500));
//         setFlights(flightResultsMock);
//         setLoading(false);
//       } else {
//         try {
//           const fetchedFlights = await searchFlights({
//             from: fromParam,
//             to: toParam,
//             departureDate: departureDateParam,
//             adults: parseInt(adultsParam),
//             returnDate:
//               tripTypeParam === "return"
//                 ? returnDateParam || undefined
//                 : undefined,
//             children: childrenParam ? parseInt(childrenParam) : undefined,
//             infants: infantsParam ? parseInt(infantsParam) : undefined,
//             cabinClass: cabinClassParam || undefined,
//           });
//           setFlights(fetchedFlights);
//         } catch (err: unknown) {
//           if (err instanceof Error) {
//             setError(err.message);
//           } else {
//             setError("An unknown error occurred while fetching flights.");
//           }
//           console.error("Flight search API error:", err);
//         } finally {
//           setLoading(false);
//         }
//       }
//     };

//     fetchFlights();
//   }, [searchParams]);

//   const uniqueAirlines = useMemo(() => {
//     return Array.from(new Set(flights.map((f) => f.airline)));
//   }, [flights]);

//   const toggleStopFilter = (stop: string) => {
//     setStopFilter((prev) =>
//       prev.includes(stop) ? prev.filter((s) => s !== stop) : [...prev, stop]
//     );
//   };

//   const toggleAirlineFilter = (airline: string) => {
//     setAirlineFilter((prev) =>
//       prev.includes(airline)
//         ? prev.filter((a) => a !== airline)
//         : [...prev, airline]
//     );
//   };

//   const filteredFlights = useMemo(() => {
//     let filtered = [...flights];

//     // Apply stop filter
//     if (stopFilter.length > 0 && stopFilter.length < 3) {
//       filtered = filtered.filter((flight) => {
//         if (stopFilter.includes("Nonstop") && flight.stops === 0) return true;
//         if (stopFilter.includes("1 stop") && flight.stops === 1) return true;
//         if (stopFilter.includes("2+ stops") && flight.stops >= 2) return true;
//         return false;
//       });
//     }

//     // Apply airline filter
//     if (airlineFilter.length > 0) {
//       filtered = filtered.filter((flight) =>
//         airlineFilter.includes(flight.airline)
//       );
//     }

//     return filtered;
//   }, [flights, stopFilter, airlineFilter]);

//   const sortedFlights = useMemo(() => {
//     const sorted = [...filteredFlights];
//     switch (sort) {
//       case "cheapest":
//         return sorted.sort((a, b) => a.price - b.price);
//       case "best":
//         return sorted.sort((a, b) => {
//           const scoreA = a.price * 0.5 + a.duration * 0.3 + a.stops * 100;
//           const scoreB = b.price * 0.5 + b.duration * 0.3 + b.stops * 100;
//           return scoreA - scoreB;
//         });
//       case "quickest":
//         return sorted.sort((a, b) => a.duration - b.duration);
//       default:
//         return sorted;
//     }
//   }, [filteredFlights, sort]);

//   // Calculate stats for each sort option
//   const cheapestFlight =
//     flights.length > 0
//       ? flights.reduce((prev, curr) => (prev.price < curr.price ? prev : curr))
//       : null;

//   const quickestFlight =
//     flights.length > 0
//       ? flights.reduce((prev, curr) =>
//           prev.duration < curr.duration ? prev : curr
//         )
//       : null;

//   const bestFlight =
//     flights.length > 0
//       ? flights.reduce((prev, curr) => {
//           const scoreA =
//             prev.price * 0.5 + prev.duration * 0.3 + prev.stops * 100;
//           const scoreB =
//             curr.price * 0.5 + curr.duration * 0.3 + curr.stops * 100;
//           return scoreA < scoreB ? prev : curr;
//         })
//       : null;

//   const formatDuration = (minutes: number) => {
//     const hours = Math.floor(minutes / 60);
//     const mins = minutes % 60;
//     return `${hours}h ${mins}m`;
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
//         <div className="text-xl text-gray-700 dark:text-gray-300">
//           Loading flights...
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
//       <div className="container mx-auto px-4 py-6">
//         {/* Search Summary */}
//         <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-4">
//               <div>
//                 <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
//                   {fromAirport?.city || fromParam} ({fromParam}) →{" "}
//                   {toAirport?.city || toParam} ({toParam})
//                 </h2>
//                 <p className="text-sm text-gray-600 dark:text-gray-400">
//                   {departureDateParam}
//                   {returnDateParam && ` - ${returnDateParam}`} · {adultsParam}{" "}
//                   adult{parseInt(adultsParam) > 1 ? "s" : ""}
//                   {childrenParam &&
//                     `, ${childrenParam} child${
//                       parseInt(childrenParam) > 1 ? "ren" : ""
//                     }`}
//                   {infantsParam &&
//                     `, ${infantsParam} infant${
//                       parseInt(infantsParam) > 1 ? "s" : ""
//                     }`}
//                   {cabinClassParam && ` · ${cabinClassParam}`}
//                 </p>
//               </div>
//             </div>
//             <button
//               onClick={() => navigate("/")}
//               className="text-blue-600 hover:text-blue-700 text-sm font-medium"
//             >
//               Edit Search
//             </button>
//           </div>
//         </div>

//         <div className="flex gap-6">
//           {/* Sidebar Filters */}
//           <div className="w-64 flex-shrink-0">
//             {/* Price Alert */}
//             <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-4">
//               <div className="flex items-center gap-2 mb-2">
//                 <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
//                   📊 Book now
//                 </span>
//               </div>
//               <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
//                 We expect prices to rise $180 in the next 25 days ⓘ
//               </p>
//               <div className="flex items-center justify-between">
//                 <span className="text-xs text-gray-600 dark:text-gray-400">
//                   Track prices
//                 </span>
//                 <label className="relative inline-block w-10 h-5">
//                   <input
//                     type="checkbox"
//                     checked={priceAlert}
//                     onChange={(e) => setPriceAlert(e.target.checked)}
//                     className="sr-only peer"
//                   />
//                   <div className="w-10 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-5 peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
//                 </label>
//               </div>
//             </div>

//             {/* Smart Filters */}
//             <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-4">
//               <button
//                 onClick={() => setSmartFiltersOpen(!smartFiltersOpen)}
//                 className="flex items-center justify-between w-full text-sm font-semibold text-gray-900 dark:text-white"
//               >
//                 <span>⚡ Smart Filters</span>
//                 <span>{smartFiltersOpen ? "▲" : "▼"}</span>
//               </button>
//               {smartFiltersOpen && (
//                 <div className="mt-3">
//                   <p className="text-xs text-gray-500 mb-2">
//                     BETA • Powered by ChatGPT ⓘ
//                   </p>
//                   <textarea
//                     placeholder="What are you looking for? Try something like: I want to see flights with no layover under $900."
//                     value={smartFilterText}
//                     onChange={(e) => setSmartFilterText(e.target.value)}
//                     className="w-full p-2 text-xs border border-gray-300 rounded resize-none h-20 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
//                   />
//                   <button className="mt-2 w-full bg-blue-600 text-white text-xs py-2 rounded hover:bg-blue-700">
//                     Filter flights
//                   </button>
//                 </div>
//               )}
//             </div>

//             {/* Results Count */}
//             <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-4">
//               <p className="text-sm text-gray-900 dark:text-white font-semibold">
//                 {sortedFlights.length} of {flights.length} flights
//               </p>
//             </div>

//             {/* Hide Basic Tickets */}
//             <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-4">
//               <div className="flex items-center justify-between mb-2">
//                 <div>
//                   <div className="flex items-center gap-2 mb-1">
//                     <span className="text-sm font-semibold text-gray-900 dark:text-white">
//                       Hide basic tickets
//                     </span>
//                     <span className="bg-gray-900 text-white text-xs px-2 py-0.5 rounded">
//                       New
//                     </span>
//                   </div>
//                   <p className="text-xs text-gray-600 dark:text-gray-400">
//                     Only show options with seat selection and carry-on bag.
//                   </p>
//                 </div>
//                 <label className="relative inline-block w-10 h-5">
//                   <input type="checkbox" className="sr-only peer" />
//                   <div className="w-10 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-5 peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
//                 </label>
//               </div>
//             </div>

//             {/* Book on KAYAK */}
//             <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-4">
//               <button className="flex items-center justify-between w-full text-sm font-semibold text-gray-900 dark:text-white">
//                 <div className="flex items-center gap-2">
//                   <span>Book on FlightBook</span>
//                   <span className="text-orange-500">⚡</span>
//                 </div>
//                 <span>▼</span>
//               </button>
//               <div className="mt-3">
//                 <div className="flex items-center justify-between">
//                   <p className="text-xs text-gray-600 dark:text-gray-400">
//                     Show offers instantly bookable on FlightBook
//                   </p>
//                   <label className="relative inline-block w-10 h-5">
//                     <input type="checkbox" className="sr-only peer" />
//                     <div className="w-10 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-5 peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
//                   </label>
//                 </div>
//               </div>
//             </div>

//             {/* Times */}
//             <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-4">
//               <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-3">
//                 Times
//               </h3>

//               <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
//                 <button className="flex-1 py-2 text-sm font-medium text-blue-600 border-b-2 border-blue-600">
//                   Take-off
//                 </button>
//                 <button className="flex-1 py-2 text-sm text-gray-600 dark:text-gray-400">
//                   Landing
//                 </button>
//               </div>

//               <div className="space-y-4">
//                 <div>
//                   <div className="flex items-center justify-between mb-2">
//                     <span className="text-xs text-gray-600 dark:text-gray-400">
//                       Take-off from {fromParam}
//                     </span>
//                   </div>
//                   <div className="flex items-center justify-between mb-2">
//                     <span className="text-xs text-gray-700 dark:text-gray-300">
//                       Thu 12:00 AM
//                     </span>
//                     <span className="text-xs text-gray-700 dark:text-gray-300">
//                       1:00 PM
//                     </span>
//                   </div>
//                   <input
//                     type="range"
//                     min="0"
//                     max="24"
//                     className="w-full h-2 bg-blue-600 rounded-lg appearance-none"
//                   />
//                 </div>

//                 <div>
//                   <div className="flex items-center justify-between mb-2">
//                     <span className="text-xs text-gray-600 dark:text-gray-400">
//                       Take-off from {toParam}
//                     </span>
//                   </div>
//                   <div className="flex items-center justify-between mb-2">
//                     <span className="text-xs text-gray-700 dark:text-gray-300">
//                       Thu 12:00 PM
//                     </span>
//                     <span className="text-xs text-gray-700 dark:text-gray-300">
//                       11:00 PM
//                     </span>
//                   </div>
//                   <input
//                     type="range"
//                     min="0"
//                     max="24"
//                     className="w-full h-2 bg-blue-600 rounded-lg appearance-none"
//                   />
//                 </div>
//               </div>
//             </div>

//             {/* Airlines */}
//             <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-4">
//               <div className="flex items-center justify-between mb-3">
//                 <h3 className="font-semibold text-sm text-gray-900 dark:text-white">
//                   Airlines
//                 </h3>
//                 <div className="flex items-center gap-2 text-xs">
//                   <button className="text-blue-600 hover:underline">
//                     Select all
//                   </button>
//                   <span className="text-gray-400">|</span>
//                   <button className="text-blue-600 hover:underline">
//                     Clear all
//                   </button>
//                 </div>
//               </div>

//               <div className="space-y-2 max-h-64 overflow-y-auto">
//                 {uniqueAirlines.slice(0, 6).map((airline) => {
//                   const airlineFlights = flights.filter(
//                     (f) => f.airline === airline
//                   );
//                   const minPrice = Math.min(
//                     ...airlineFlights.map((f) => f.price)
//                   );

//                   return (
//                     <label
//                       key={airline}
//                       className="flex items-center justify-between py-1 cursor-pointer"
//                     >
//                       <div className="flex items-center">
//                         <input
//                           type="checkbox"
//                           checked={
//                             airlineFilter.includes(airline) ||
//                             airlineFilter.length === 0
//                           }
//                           onChange={() => toggleAirlineFilter(airline)}
//                           className="w-4 h-4 text-blue-600 rounded"
//                         />
//                         <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
//                           {airline}
//                         </span>
//                       </div>
//                       <span className="text-sm text-gray-500">${minPrice}</span>
//                     </label>
//                   );
//                 })}
//                 {uniqueAirlines.length > 6 && (
//                   <>
//                     <label className="flex items-center justify-between py-1 cursor-pointer">
//                       <div className="flex items-center">
//                         <input
//                           type="checkbox"
//                           className="w-4 h-4 text-blue-600 rounded"
//                         />
//                         <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
//                           Multiple airlines
//                         </span>
//                         <span className="ml-1 text-gray-400 text-xs">ⓘ</span>
//                       </div>
//                     </label>
//                     <button className="text-sm text-blue-600 hover:underline">
//                       Show {uniqueAirlines.length - 6} more airlines
//                     </button>
//                   </>
//                 )}
//               </div>
//             </div>

//             {/* Alliance */}
//             <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-4">
//               <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-3">
//                 Alliance
//               </h3>
//               <div className="space-y-2">
//                 {["oneworld", "SkyTeam", "Star Alliance"].map((alliance) => (
//                   <label
//                     key={alliance}
//                     className="flex items-center justify-between py-1 cursor-pointer"
//                   >
//                     <div className="flex items-center">
//                       <input
//                         type="checkbox"
//                         className="w-4 h-4 text-blue-600 rounded"
//                       />
//                       <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
//                         {alliance}
//                       </span>
//                     </div>
//                     <span className="text-sm text-gray-500">
//                       ${445 + Math.floor(Math.random() * 200)}
//                     </span>
//                   </label>
//                 ))}
//               </div>
//             </div>

//             {/* Duration */}
//             <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-4">
//               <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-3">
//                 Duration
//               </h3>

//               <div className="space-y-4">
//                 <div>
//                   <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
//                     Flight leg
//                   </div>
//                   <div className="flex items-center justify-between mb-2">
//                     <span className="text-xs text-gray-700 dark:text-gray-300">
//                       6h 10m
//                     </span>
//                     <span className="text-xs text-gray-700 dark:text-gray-300">
//                       23h 43m
//                     </span>
//                   </div>
//                   <input
//                     type="range"
//                     min="370"
//                     max="1423"
//                     className="w-full h-2 bg-blue-600 rounded-lg appearance-none"
//                   />
//                 </div>

//                 <div>
//                   <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
//                     Layover
//                   </div>
//                   <div className="flex items-center justify-between mb-2">
//                     <span className="text-xs text-gray-700 dark:text-gray-300">
//                       0h 30m
//                     </span>
//                     <span className="text-xs text-gray-700 dark:text-gray-300">
//                       15h 45m
//                     </span>
//                   </div>
//                   <input
//                     type="range"
//                     min="30"
//                     max="945"
//                     className="w-full h-2 bg-blue-600 rounded-lg appearance-none"
//                   />
//                 </div>
//               </div>
//             </div>

//             {/* Stops Filter */}
//             <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-4">
//               <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-3">
//                 Stops
//               </h3>
//               {["Nonstop", "1 stop", "2+ stops"].map((stop) => {
//                 const matchingFlights = flights.filter((f) => {
//                   if (stop === "Nonstop") return f.stops === 0;
//                   if (stop === "1 stop") return f.stops === 1;
//                   return f.stops >= 2;
//                 });
//                 const price =
//                   matchingFlights.length > 0
//                     ? Math.min(...matchingFlights.map((f) => f.price))
//                     : 0;

//                 return (
//                   <label
//                     key={stop}
//                     className="flex items-center justify-between py-2 cursor-pointer"
//                   >
//                     <div className="flex items-center">
//                       <input
//                         type="checkbox"
//                         checked={stopFilter.includes(stop)}
//                         onChange={() => toggleStopFilter(stop)}
//                         className="w-4 h-4 text-blue-600 rounded"
//                       />
//                       <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
//                         {stop}
//                       </span>
//                     </div>
//                     <span className="text-sm text-gray-500">${price}</span>
//                   </label>
//                 );
//               })}
//             </div>

//             {/* Airports Filter */}
//             <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-4">
//               <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-3">
//                 Airports
//               </h3>
//               <label className="flex items-center py-2">
//                 <input
//                   type="checkbox"
//                   className="w-4 h-4 text-blue-600 rounded"
//                 />
//                 <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
//                   Depart/return same
//                 </span>
//               </label>

//               <div className="mt-3">
//                 <p className="text-xs font-semibold text-gray-500 mb-2">
//                   {fromAirport?.city || fromParam}
//                 </p>
//                 <label className="flex items-center justify-between py-1">
//                   <div className="flex items-center">
//                     <input
//                       type="checkbox"
//                       defaultChecked
//                       className="w-4 h-4 text-blue-600 rounded"
//                     />
//                     <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
//                       {fromParam}: {fromAirport?.name || "Airport"}
//                     </span>
//                   </div>
//                   <span className="text-sm text-gray-500">
//                     ${cheapestFlight?.price || 0}
//                   </span>
//                 </label>
//               </div>

//               <div className="mt-3">
//                 <p className="text-xs font-semibold text-gray-500 mb-2">
//                   {toAirport?.city || toParam}
//                 </p>
//                 <label className="flex items-center justify-between py-1">
//                   <div className="flex items-center">
//                     <input
//                       type="checkbox"
//                       defaultChecked
//                       className="w-4 h-4 text-blue-600 rounded"
//                     />
//                     <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
//                       {toParam}: {toAirport?.name || "Airport"}
//                     </span>
//                   </div>
//                   <span className="text-sm text-gray-500">
//                     ${cheapestFlight?.price || 0}
//                   </span>
//                 </label>
//               </div>
//             </div>

//             {/* Collapsible Sections */}
//             <div className="space-y-2">
//               {/* Price */}
//               <details className="bg-white dark:bg-gray-800 rounded-lg shadow">
//                 <summary className="flex items-center justify-between p-4 cursor-pointer font-semibold text-sm text-gray-900 dark:text-white">
//                   <span>Price</span>
//                   <span className="text-gray-400">▼</span>
//                 </summary>
//                 <div className="px-4 pb-4">
//                   <div className="flex items-center justify-between mb-2">
//                     <span className="text-xs text-gray-700 dark:text-gray-300">
//                       $305
//                     </span>
//                     <span className="text-xs text-gray-700 dark:text-gray-300">
//                       $1,033
//                     </span>
//                   </div>
//                   <input
//                     type="range"
//                     min="305"
//                     max="1033"
//                     className="w-full h-2 bg-blue-600 rounded-lg appearance-none"
//                   />
//                 </div>
//               </details>

//               {/* Layover airports */}
//               <details className="bg-white dark:bg-gray-800 rounded-lg shadow">
//                 <summary className="flex items-center justify-between p-4 cursor-pointer font-semibold text-sm text-gray-900 dark:text-white">
//                   <span>Layover airports</span>
//                   <span className="text-gray-400">▼</span>
//                 </summary>
//                 <div className="px-4 pb-4">
//                   <p className="text-xs text-gray-600 dark:text-gray-400">
//                     Filter by layover airports
//                   </p>
//                 </div>
//               </details>

//               {/* Cabin */}
//               <details className="bg-white dark:bg-gray-800 rounded-lg shadow">
//                 <summary className="flex items-center justify-between p-4 cursor-pointer font-semibold text-sm text-gray-900 dark:text-white">
//                   <span>Cabin</span>
//                   <span className="text-gray-400">▼</span>
//                 </summary>
//                 <div className="px-4 pb-4 space-y-2">
//                   {["Economy", "Premium Economy", "Business", "First"].map(
//                     (cabin) => (
//                       <label
//                         key={cabin}
//                         className="flex items-center py-1 cursor-pointer"
//                       >
//                         <input
//                           type="checkbox"
//                           className="w-4 h-4 text-blue-600 rounded"
//                         />
//                         <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
//                           {cabin}
//                         </span>
//                       </label>
//                     )
//                   )}
//                 </div>
//               </details>

//               {/* Flight quality */}
//               <details className="bg-white dark:bg-gray-800 rounded-lg shadow">
//                 <summary className="flex items-center justify-between p-4 cursor-pointer font-semibold text-sm text-gray-900 dark:text-white">
//                   <span>Flight quality</span>
//                   <span className="text-gray-400">▼</span>
//                 </summary>
//                 <div className="px-4 pb-4">
//                   <p className="text-xs text-gray-600 dark:text-gray-400">
//                     Filter by flight quality metrics
//                   </p>
//                 </div>
//               </details>

//               {/* Aircraft */}
//               <details className="bg-white dark:bg-gray-800 rounded-lg shadow">
//                 <summary className="flex items-center justify-between p-4 cursor-pointer font-semibold text-sm text-gray-900 dark:text-white">
//                   <span>Aircraft</span>
//                   <span className="text-gray-400">▼</span>
//                 </summary>
//                 <div className="px-4 pb-4">
//                   <p className="text-xs text-gray-600 dark:text-gray-400">
//                     Filter by aircraft type
//                   </p>
//                 </div>
//               </details>

//               {/* Booking sites */}
//               <details className="bg-white dark:bg-gray-800 rounded-lg shadow">
//                 <summary className="flex items-center justify-between p-4 cursor-pointer font-semibold text-sm text-gray-900 dark:text-white">
//                   <span>Booking sites</span>
//                   <span className="text-gray-400">▼</span>
//                 </summary>
//                 <div className="px-4 pb-4">
//                   <p className="text-xs text-gray-600 dark:text-gray-400">
//                     Filter by booking sites
//                   </p>
//                 </div>
//               </details>
//             </div>
//           </div>

//           {/* Main Content */}
//           <div className="flex-1">
//             {/* Sort Tabs */}
//             <div className="bg-white dark:bg-gray-800 rounded-t-lg shadow flex border-b dark:border-gray-700">
//               <button
//                 onClick={() => setSort("cheapest")}
//                 className={`flex-1 px-6 py-4 text-left border-b-2 transition-colors ${
//                   sort === "cheapest"
//                     ? "border-blue-600 bg-blue-50 dark:bg-gray-700"
//                     : "border-transparent hover:bg-gray-50 dark:hover:bg-gray-700"
//                 }`}
//               >
//                 <div className="font-semibold text-gray-900 dark:text-white">
//                   Cheapest
//                 </div>
//                 {cheapestFlight && (
//                   <div className="text-sm text-gray-600 dark:text-gray-400">
//                     ${cheapestFlight.price} ·{" "}
//                     {formatDuration(cheapestFlight.duration)}
//                   </div>
//                 )}
//               </button>

//               <button
//                 onClick={() => setSort("best")}
//                 className={`flex-1 px-6 py-4 text-left border-b-2 transition-colors ${
//                   sort === "best"
//                     ? "border-blue-600 bg-blue-50 dark:bg-gray-700"
//                     : "border-transparent hover:bg-gray-50 dark:hover:bg-gray-700"
//                 }`}
//               >
//                 <div className="flex items-center gap-1">
//                   <span className="font-semibold text-gray-900 dark:text-white">
//                     Best
//                   </span>
//                   <span className="text-gray-400 text-xs">ⓘ</span>
//                 </div>
//                 {bestFlight && (
//                   <div className="text-sm text-gray-600 dark:text-gray-400">
//                     ${bestFlight.price} · {formatDuration(bestFlight.duration)}
//                   </div>
//                 )}
//               </button>

//               <button
//                 onClick={() => setSort("quickest")}
//                 className={`flex-1 px-6 py-4 text-left border-b-2 transition-colors ${
//                   sort === "quickest"
//                     ? "border-blue-600 bg-blue-50 dark:bg-gray-700"
//                     : "border-transparent hover:bg-gray-50 dark:hover:bg-gray-700"
//                 }`}
//               >
//                 <div className="font-semibold text-gray-900 dark:text-white">
//                   Quickest
//                 </div>
//                 {quickestFlight && (
//                   <div className="text-sm text-gray-600 dark:text-gray-400">
//                     ${quickestFlight.price} ·{" "}
//                     {formatDuration(quickestFlight.duration)}
//                   </div>
//                 )}
//               </button>

//               <button className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-1 border-b-2 border-transparent">
//                 ⚙️ Other sort
//               </button>
//             </div>

//             {/* Flight Results */}
//             <div className="space-y-4 mt-4">
//               {error && (
//                 <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
//                   <p className="text-red-800 dark:text-red-300">{error}</p>
//                 </div>
//               )}

//               {sortedFlights.length === 0 && !loading && !error && (
//                 <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
//                   <p className="text-gray-600 dark:text-gray-400">
//                     No flights found matching your criteria.
//                   </p>
//                 </div>
//               )}

//               {sortedFlights.map((flight, idx) => (
//                 <div
//                   key={idx}
//                   className="bg-white dark:bg-gray-800 rounded-lg shadow"
//                 >
//                   {idx === 0 && sort === "best" && (
//                     <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-600 p-3 mb-0 rounded-t-lg">
//                       <div className="flex items-center gap-2">
//                         <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
//                           ✓
//                         </div>
//                         <p className="text-sm text-blue-900 dark:text-blue-300 font-medium">
//                           Unbeatable prices on flights
//                         </p>
//                       </div>
//                       <p className="text-xs text-gray-700 dark:text-gray-400 mt-1 ml-8">
//                         Search for unique flight combinations and book cheap
//                         airfares with FlightNetwork
//                       </p>
//                     </div>
//                   )}

//                   <div className="p-4">
//                     <div className="flex items-center justify-between mb-4">
//                       <div className="flex items-center gap-3">
//                         <label className="flex items-center cursor-pointer">
//                           <input
//                             type="checkbox"
//                             className="w-4 h-4 text-blue-600 rounded"
//                           />
//                         </label>
//                         <button className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 flex items-center gap-1">
//                           <span>♡</span> Save
//                         </button>
//                         <button className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 flex items-center gap-1">
//                           <span>🔗</span> Share
//                         </button>
//                       </div>
//                       {idx === 0 && sort === "best" && (
//                         <div className="flex items-center gap-2">
//                           <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
//                             Best
//                           </span>
//                           <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
//                             Cheapest
//                           </span>
//                         </div>
//                       )}
//                     </div>

//                     {/* Flight Details */}
//                     <div className="flex items-start gap-4 mb-4">
//                       {/* Airline Logo */}
//                       <div className="flex-shrink-0">
//                         <div className="w-12 h-12 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-sm">
//                           {flight.airline.substring(0, 2).toUpperCase()}
//                         </div>
//                         <div className="text-xs text-gray-600 dark:text-gray-400 text-center mt-1 max-w-[60px]">
//                           {flight.airline}
//                         </div>
//                       </div>

//                       {/* Flight Info - Outbound */}
//                       <div className="flex-1">
//                         <div className="flex items-center gap-6">
//                           {/* Departure Time */}
//                           <div className="text-left">
//                             <div className="text-xl font-bold text-gray-900 dark:text-white">
//                               {formatTime(flight.departureTime)}
//                             </div>
//                             <div className="text-xs text-gray-600 dark:text-gray-400">
//                               {fromParam}
//                             </div>
//                           </div>

//                           {/* Flight Duration and Path */}
//                           <div className="flex-1 min-w-0">
//                             <div className="flex items-center gap-2 mb-1">
//                               <span className="text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
//                                 {flight.stops === 0
//                                   ? "nonstop"
//                                   : `${flight.stops} stop${
//                                       flight.stops > 1 ? "s" : ""
//                                     }`}
//                               </span>
//                             </div>
//                             <div className="relative">
//                               <div className="h-0.5 bg-gray-300 dark:bg-gray-600 w-full"></div>
//                               {flight.stops > 0 && (
//                                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-gray-400 rounded-full"></div>
//                               )}
//                             </div>
//                             <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
//                               {formatDuration(flight.duration)}
//                             </div>
//                             <div className="text-xs text-gray-500 dark:text-gray-500">
//                               {fromParam}–{toParam}
//                             </div>
//                           </div>

//                           {/* Arrival Time */}
//                           <div className="text-right">
//                             <div className="text-xl font-bold text-gray-900 dark:text-white">
//                               {formatTime(flight.arrivalTime)}
//                             </div>
//                             <div className="text-xs text-gray-600 dark:text-gray-400">
//                               {toParam}
//                             </div>
//                           </div>
//                         </div>

//                         {/* Return Flight if exists */}
//                         {flight.returnDepartureTime && (
//                           <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
//                             {/* Return Departure Time */}
//                             <div className="text-left">
//                               <div className="text-xl font-bold text-gray-900 dark:text-white">
//                                 {formatTime(flight.returnDepartureTime)}
//                               </div>
//                               <div className="text-xs text-gray-600 dark:text-gray-400">
//                                 {toParam}
//                               </div>
//                             </div>

//                             {/* Return Flight Duration and Path */}
//                             <div className="flex-1 min-w-0">
//                               <div className="flex items-center gap-2 mb-1">
//                                 <span className="text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
//                                   {(flight.returnStops || 0) === 0
//                                     ? "nonstop"
//                                     : `${flight.returnStops} stop${
//                                         (flight.returnStops || 0) > 1 ? "s" : ""
//                                       }`}
//                                 </span>
//                               </div>
//                               <div className="relative">
//                                 <div className="h-0.5 bg-gray-300 dark:bg-gray-600 w-full"></div>
//                                 {(flight.returnStops || 0) > 0 && (
//                                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-gray-400 rounded-full"></div>
//                                 )}
//                               </div>
//                               <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
//                                 {formatDuration(
//                                   flight.returnDuration || flight.duration
//                                 )}
//                               </div>
//                               <div className="text-xs text-gray-500 dark:text-gray-500">
//                                 {toParam}–{fromParam}
//                               </div>
//                             </div>

//                             {/* Return Arrival Time */}
//                             <div className="text-right">
//                               <div className="text-xl font-bold text-gray-900 dark:text-white">
//                                 {formatTime(
//                                   flight.returnArrivalTime || flight.arrivalTime
//                                 )}
//                               </div>
//                               <div className="text-xs text-gray-600 dark:text-gray-400">
//                                 {fromParam}
//                               </div>
//                             </div>
//                           </div>
//                         )}
//                       </div>

//                       {/* Price Section */}
//                       <div className="text-right flex flex-col items-end gap-2 flex-shrink-0 ml-4">
//                         <div>
//                           <div className="text-3xl font-bold text-gray-900 dark:text-white">
//                             ${flight.price}
//                           </div>
//                           <div className="text-xs text-gray-600 dark:text-gray-400">
//                             {flight.cabinClass || "Value, Basic"}
//                           </div>
//                           <div className="text-xs text-gray-600 dark:text-gray-400">
//                             Flightnetwork
//                           </div>
//                         </div>
//                         <button className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-2.5 rounded font-semibold text-sm transition-colors">
//                           View Deal
//                         </button>
//                       </div>
//                     </div>

//                     {/* Amenities Footer */}
//                     <div className="flex items-center justify-between pt-3 border-t dark:border-gray-700">
//                       <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
//                         <div
//                           className="flex items-center gap-1"
//                           title="Carry-on included"
//                         >
//                           <span>🎒</span>
//                           <span className="w-5 h-5 rounded-full bg-white border-2 border-green-600 flex items-center justify-center">
//                             <span className="text-green-600 text-xs font-bold">
//                               ✓
//                             </span>
//                           </span>
//                         </div>
//                         <div
//                           className="flex items-center gap-1"
//                           title="No checked bag"
//                         >
//                           <span>🧳</span>
//                           <span className="w-5 h-5 rounded-full bg-white border-2 border-gray-400 flex items-center justify-center">
//                             <span className="text-gray-400 text-xs">⊘</span>
//                           </span>
//                         </div>
//                         <div
//                           className="flex items-center gap-1"
//                           title="Seat selection info"
//                         >
//                           <span>💺</span>
//                           <span className="w-5 h-5 rounded-full bg-white border-2 border-gray-400 flex items-center justify-center">
//                             <span className="text-gray-400 text-xs">ⓘ</span>
//                           </span>
//                         </div>
//                       </div>
//                       {idx > 2 && (
//                         <div className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
//                           Ad
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default FlightSearchPage;

// src/pages/FlightSearchPage.tsx (or wherever your route is)
// import { useEffect, useState } from "react";
// import { useSearchParams } from "react-router-dom";
// import { searchFlights } from "../services/amadeusService";
// import { FlightResult } from "../types";
// import FlightResults from "../components/FlightResults";
// import Sidebar from "../components/Sidebar"; // if you have one

// export default function FlightSearchPage() {
//   const [searchParams] = useSearchParams();
//   const [flights, setFlights] = useState<FlightResult[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchFlights = async () => {
//       const from = searchParams.get("from");
//       const to = searchParams.get("to");
//       const departureDate = searchParams.get("departureDate");

//       if (!from || !to || !departureDate) {
//         setError("Missing search parameters");
//         setLoading(false);
//         return;
//       }

//       setLoading(true);
//       try {
//         const results = await searchFlights({
//           from,
//           to,
//           departureDate,
//           adults: parseInt(searchParams.get("adults") || "1"),
//           returnDate: searchParams.get("returnDate") || undefined,
//           cabinClass: searchParams.get("cabinClass") || "economy",
//         });
//         setFlights(results);
//       } catch (err: any) {
//         setError(err.message || "Failed to load flights");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchFlights();
//   }, [searchParams]);

//   if (loading)
//     return <div className="p-8 text-center">Searching flights...</div>;
//   if (error) return <div className="p-8 text-red-600 text-center">{error}</div>;

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="max-w-7xl mx-auto p-6">
//         {/* Header */}
//         <div className="mb-8">
//           <h1 className="text-3xl font-bold text-gray-900">
//             {searchParams.get("from")} → {searchParams.get("to")}
//           </h1>
//           <p className="text-gray-600 mt-2">
//             {new Date(searchParams.get("departureDate")!).toLocaleDateString()}{" "}
//             · {searchParams.get("adults")} adult(s)
//           </p>
//         </div>

//         <div className="flex gap-6">
//           {/* Optional: Sidebar */}
//           <aside className="w-80">
//             <Sidebar />
//           </aside>

//           {/* Main Results */}
//           <main className="flex-1">
//             {flights.length === 0 ? (
//               <div className="text-center py-12 text-gray-500">
//                 No flights found. Try different dates or airports.
//               </div>
//             ) : (
//               <FlightResults flights={flights} />
//             )}
//           </main>
//         </div>
//       </div>
//     </div>
//   );
// }

// src/pages/FlightSearchPage.tsx
// import { useState, useEffect } from "react";
// import { useSearchParams, useNavigate } from "react-router-dom";
// import { searchFlights } from "../services/amadeusService";
// import FlightResults from "../components/FlightResults";
// import Sidebar from "../components/Sidebar";
// import { FlightResult } from "../types";

// export default function FlightSearchPage() {
//   const [searchParams] = useSearchParams();
//   const navigate = useNavigate();
//   const [flights, setFlights] = useState<FlightResult[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [sortBy, setSortBy] = useState<"best" | "cheapest" | "fastest">("best");

//   useEffect(() => {
//     const fetch = async () => {
//       setLoading(true);
//       try {
//         const results = await searchFlights({
//           /* your params */
//         });
//         setFlights(results);
//       } catch (err) {
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetch();
//   }, [searchParams]);

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header */}
//       <div className="bg-white shadow-md border-b sticky top-0 z-10">
//         <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
//           <div>
//             <h1 className="text-3xl font-bold text-gray-900">
//               Dhaka (DAC) → Cox's Bazar (CXB)
//             </h1>
//             <p className="text-gray-600 mt-1">
//               Dec 17, 2025 • 2 adults • Economy
//             </p>
//           </div>
//           <button
//             onClick={() => navigate("/")}
//             className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg"
//           >
//             Edit Search
//           </button>
//         </div>
//       </div>

//       {/* Sorting Tabs */}
//       <div className="bg-white border-b sticky top-20 z-10">
//         <div className="max-w-7xl mx-auto px-6">
//           <div className="flex gap-8 py-4">
//             {[
//               { id: "best", label: "Best", icon: "Best" },
//               { id: "cheapest", label: "Cheapest", icon: "$" },
//               { id: "fastest", label: "Fastest", icon: "Fast" },
//             ].map((tab) => (
//               <button
//                 key={tab.id}
//                 onClick={() => setSortBy(tab.id as any)}
//                 className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
//                   sortBy === tab.id
//                     ? "bg-blue-600 text-white shadow-md"
//                     : "text-gray-700 hover:bg-gray-100"
//                 }`}
//               >
//                 <span>{tab.icon}</span> {tab.label}
//               </button>
//             ))}
//           </div>
//         </div>
//       </div>

//       <div className="max-w-7xl mx-auto px-6 py-8">
//         <div className="flex gap-8">
//           <Sidebar />
//           <div className="flex-1">
//             <FlightResults
//               flights={flights}
//               loading={loading}
//               sortBy={sortBy}
//             />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// // src/pages/FlightSearchPage.tsx
// import { useState, useEffect } from "react";
// import { useSearchParams, useNavigate } from "react-router-dom";
// import { searchFlights } from "../services/amadeusService";
// import FlightResults from "../components/FlightResults";
// import Sidebar from "../components/Sidebar"; // Your functional sidebar
// import { FlightResult } from "../types";

// export default function FlightSearchPage() {
//   const [searchParams] = useSearchParams();
//   const navigate = useNavigate();
//   const [flights, setFlights] = useState<FlightResult[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [sortBy, setSortBy] = useState<"best" | "cheapest" | "quickest">(
//     "best"
//   );
//   const [page, setPage] = useState(1); // For pagination

//   useEffect(() => {
//     const fetchFlights = async () => {
//       if (!searchParams.get("from") || !searchParams.get("to")) return;
//       setLoading(true);
//       try {
//         const results = await searchFlights({
//           from: searchParams.get("from")!,
//           to: searchParams.get("to")!,
//           departureDate: searchParams.get("departureDate")!,
//           adults: parseInt(searchParams.get("adults") || "1"),
//           // ... other params
//         });
//         setFlights(results);
//         setPage(1);
//       } catch (err) {
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchFlights();
//   }, [searchParams, sortBy, page]);

//   const handleLoadMore = () => {
//     setPage((prev) => prev + 1);
//   };

//   const from = searchParams.get("from") || "DAC";
//   const to = searchParams.get("to") || "CXB";

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Kayak Header */}
//       <header className="bg-white border-b border-gray-200">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center py-4 gap-4">
//             <div>
//               <h1 className="text-xl font-semibold text-gray-900">
//                 {from} to {to}
//               </h1>
//               <p className="text-sm text-gray-600">
//                 {searchParams.get("departureDate")} •{" "}
//                 {searchParams.get("adults") || 1} adult
//                 {parseInt(searchParams.get("adults") || "1") > 1 ? "s" : ""} •
//                 Economy
//               </p>
//             </div>
//             <button
//               onClick={() => navigate("/")}
//               className="text-blue-600 hover:text-blue-800 text-sm font-medium underline self-start lg:self-end"
//             >
//               Modify search
//             </button>
//           </div>
//         </div>

//         {/* Sorting Tabs - Exact Kayak */}
//         <div className="bg-gray-50 border-t border-b border-gray-200">
//           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//             <div className="flex overflow-x-auto pb-2">
//               {[
//                 { key: "best", label: "Best", subtitle: "Balanced choice" },
//                 {
//                   key: "cheapest",
//                   label: "Cheapest",
//                   subtitle: "Lowest price",
//                 },
//                 {
//                   key: "quickest",
//                   label: "Quickest",
//                   subtitle: "Shortest time",
//                 },
//               ].map((tab) => (
//                 <button
//                   key={tab.key}
//                   onClick={() => setSortBy(tab.key as any)}
//                   className={`flex flex-col items-center px-6 py-3 mr-1 whitespace-nowrap text-sm font-medium rounded-t-lg transition-colors ${
//                     sortBy === tab.key
//                       ? "bg-white text-blue-600 border-b-2 border-blue-600 shadow-sm"
//                       : "text-gray-600 hover:text-gray-900 hover:bg-white"
//                   }`}
//                 >
//                   <span>{tab.label}</span>
//                   {tab.subtitle && (
//                     <span className="text-xs opacity-75">{tab.subtitle}</span>
//                   )}
//                 </button>
//               ))}
//             </div>
//           </div>
//         </div>
//       </header>

//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
//         <div className="flex gap-8">
//           {/* Sidebar */}
//           <aside className="hidden lg:block w-80 flex-shrink-0">
//             <Sidebar />
//           </aside>

//           {/* Main Content */}
//           <main className="flex-1 lg:ml-0">
//             <div className="lg:pr-8">
//               <FlightResults
//                 flights={flights}
//                 loading={loading}
//                 sortBy={sortBy}
//                 onLoadMore={handleLoadMore}
//               />
//             </div>
//           </main>
//         </div>
//       </div>
//     </div>
//   );
// }

// // src/pages/FlightSearchPage.tsx
// import { useState, useEffect } from "react";
// import { useSearchParams, useNavigate } from "react-router-dom";
// import { searchFlights } from "../services/amadeusService";
// import FlightResults from "../components/FlightResults";
// import Sidebar from "../components/Sidebar";
// import { FlightResult } from "../types";

// export default function FlightSearchPage() {
//   const [searchParams] = useSearchParams();
//   const navigate = useNavigate();
//   const [flights, setFlights] = useState<FlightResult[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [sortBy, setSortBy] = useState<"best" | "cheapest" | "quickest">(
//     "best"
//   );

//   useEffect(() => {
//     const fetchFlights = async () => {
//       if (!searchParams.get("from") || !searchParams.get("to")) return;
//       setLoading(true);
//       try {
//         const results = await searchFlights({
//           from: searchParams.get("from")!,
//           to: searchParams.get("to")!,
//           departureDate: searchParams.get("departureDate")!,
//           adults: parseInt(searchParams.get("adults") || "1"),
//         });
//         setFlights(results);
//       } catch (err) {
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchFlights();
//   }, [searchParams]);

//   // Calculate stats for tabs
//   const cheapest =
//     flights.length > 0
//       ? flights.reduce((a, b) => (a.price < b.price ? a : b))
//       : null;
//   const quickest =
//     flights.length > 0
//       ? flights.reduce((a, b) => (a.duration < b.duration ? a : b))
//       : null;
//   const best =
//     flights.length > 0
//       ? flights.reduce((a, b) => {
//           const scoreA = a.price * 0.6 + a.duration * 0.4 + a.stops * 200;
//           const scoreB = b.price * 0.6 + b.duration * 0.4 + b.stops * 200;
//           return scoreA < scoreB ? a : b;
//         })
//       : null;

//   const formatDuration = (mins: number) => {
//     const h = Math.floor(mins / 60);
//     const m = mins % 60;
//     return `${h}h ${m > 0 ? `${m}m` : ""}`.trim();
//   };

//   const from = searchParams.get("from") || "DAC";
//   const to = searchParams.get("to") || "CXB";

//   return (
//     <div className="min-h-screen bg-gray-100">
//       {/* Header */}
//       <header className="bg-white border-b border-gray-300">
//         <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
//           <div>
//             <h1 className="text-2xl font-bold text-gray-900">
//               {from} → {to}
//             </h1>
//             <p className="text-sm text-gray-600 mt-1">
//               {searchParams.get("departureDate")} •{" "}
//               {searchParams.get("adults") || 1} adult(s) • Economy
//             </p>
//           </div>
//           <button
//             onClick={() => navigate("/")}
//             className="text-blue-600 hover:underline text-sm font-medium"
//           >
//             Modify search
//           </button>
//         </div>
//       </header>

//       {/* KAYAK-EXACT SORTING TABS */}
//       <div className="bg-white border-b border-gray-300 sticky top-0 z-10">
//         <div className="max-w-7xl mx-auto px-6">
//           <div className="flex items-center gap-8 py-4 overflow-x-auto">
//             {[
//               {
//                 key: "cheapest",
//                 label: "Cheapest",
//                 price: cheapest ? `$${cheapest.price}` : "-",
//                 duration: cheapest ? formatDuration(cheapest.duration) : "",
//               },
//               {
//                 key: "best",
//                 label: "Best",
//                 icon: "circle-info",
//                 price: best ? `$${best.price}` : "-",
//                 duration: best ? formatDuration(best.duration) : "",
//               },
//               {
//                 key: "quickest",
//                 label: "Quickest",
//                 price: quickest ? `$${quickest.price}` : "-",
//                 duration: quickest ? formatDuration(quickest.duration) : "",
//               },
//             ].map((tab) => (
//               <button
//                 key={tab.key}
//                 onClick={() => setSortBy(tab.key as any)}
//                 className={`relative flex flex-col items-start px-6 py-3 rounded-lg transition-all whitespace-nowrap ${
//                   sortBy === tab.key
//                     ? "text-blue-700 font-semibold"
//                     : "text-gray-600 hover:text-gray-900"
//                 }`}
//               >
//                 <div className="flex items-center gap-2">
//                   <span className="text-lg font-medium">{tab.label}</span>
//                   {tab.icon && (
//                     <span className="text-xs text-gray-500">circle-info</span>
//                   )}
//                 </div>
//                 <div className="text-sm text-gray-600 mt-1">
//                   {tab.price} • {tab.duration}
//                 </div>
//                 {sortBy === tab.key && (
//                   <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-lg" />
//                 )}
//               </button>
//             ))}
//             <div className="ml-auto flex items-center gap-4">
//               <span className="text-gray-500 text-sm">Other sort</span>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Main Layout */}
//       <div className="max-w-7xl mx-auto px-6 py-8">
//         <div className="flex gap-8">
//           {/* Functional Sidebar */}
//           <aside className="w-80 hidden lg:block">
//             <Sidebar />
//           </aside>

//           {/* Flight Results */}
//           <main className="flex-1">
//             <FlightResults
//               flights={flights}
//               loading={loading}
//               sortBy={sortBy}
//             />
//           </main>
//         </div>
//       </div>
//     </div>
//   );
// }

// src/pages/FlightSearchPage.tsx
// import { useState, useEffect } from "react";
// import { useSearchParams, useNavigate } from "react-router-dom";
// import { searchFlights } from "../services/amadeusService";
// import FlightResults from "../components/FlightResults";
// import Sidebar from "../components/Sidebar";
// import LoadingWrapper from "../components/LoadingWrapper";
// import { FlightResult } from "../types";

// export default function FlightSearchPage() {
//   const [searchParams] = useSearchParams();
//   const navigate = useNavigate();
//   const [flights, setFlights] = useState<FlightResult[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [sortBy, setSortBy] = useState<"best" | "cheapest" | "quickest">(
//     "best"
//   );

//   useEffect(() => {
//     const fetch = async () => {
//       setLoading(true);
//       setError(null);
//       try {
//         const results = await searchFlights({
//           from: searchParams.get("from")!,
//           to: searchParams.get("to")!,
//           departureDate: searchParams.get("departureDate")!,
//           adults: parseInt(searchParams.get("adults") || "1"),
//         });
//         setFlights(results);
//       } catch (err: any) {
//         setError(err.message || "Failed to load flights");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetch();
//   }, [searchParams]);

//   // Calculate stats for tabs
//   const cheapest =
//     flights.length > 0
//       ? flights.reduce((a, b) => (a.price < b.price ? a : b))
//       : null;
//   const quickest =
//     flights.length > 0
//       ? flights.reduce((a, b) => (a.duration < b.duration ? a : b))
//       : null;
//   const best =
//     flights.find((f) => f.stops === 0 && f.price < 1500) || flights[0];

//   const formatDuration = (mins: number) => {
//     const h = Math.floor(mins / 60);
//     const m = mins % 60;
//     return m === 0 ? `${h}h` : `${h}h ${m}m`;
//   };

//   const from = searchParams.get("from") || "LHR";
//   const to = searchParams.get("to") || "JFK";

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header */}
//       <header className="bg-white border-b border-gray-200">
//         <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
//           <div>
//             <h1 className="text-2xl font-bold text-gray-900">
//               {from} to {to}
//             </h1>
//             <p className="text-sm text-gray-600 mt-1">
//               {searchParams.get("departureDate")} • {searchParams.get("adults")}{" "}
//               adult(s) • Economy
//             </p>
//           </div>
//           <button
//             onClick={() => navigate("/")}
//             className="text-blue-600 hover:underline text-sm font-medium"
//           >
//             Modify search
//           </button>
//         </div>
//       </header>

//       {/* EXACTLY WHERE YOU DREW THE RED LINE — KAYAK TABS */}
//       <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
//         <div className="max-w-7xl mx-auto px-6">
//           <div className="flex items-stretch -mb-px">
//             {[
//               {
//                 key: "cheapest" as const,
//                 label: "Cheapest",
//                 price: cheapest ? `$${cheapest.price}` : "-",
//                 duration: cheapest ? formatDuration(cheapest.duration) : "",
//               },
//               {
//                 key: "best" as const,
//                 label: "Best",
//                 price: best ? `$${best.price}` : "-",
//                 duration: best ? formatDuration(best.duration) : "",
//                 hasInfo: true,
//               },
//               {
//                 key: "quickest" as const,
//                 label: "Quickest",
//                 price: quickest ? `$${quickest.price}` : "-",
//                 duration: quickest ? formatDuration(quickest.duration) : "",
//               },
//             ].map((tab) => (
//               <button
//                 key={tab.key}
//                 onClick={() => setSortBy(tab.key)}
//                 className={`flex flex-col items-start px-8 py-4 border-b-4 transition-all relative ${
//                   sortBy === tab.key
//                     ? "border-blue-600 text-blue-700 font-semibold"
//                     : "border-transparent text-gray-600 hover:text-gray-900"
//                 }`}
//               >
//                 <div className="flex items-center gap-2">
//                   <span className="text-lg font-medium">{tab.label}</span>
//                   {tab.hasInfo && (
//                     <svg
//                       className="w-4 h-4 text-gray-400"
//                       fill="currentColor"
//                       viewBox="0 0 20 20"
//                     >
//                       <path
//                         fillRule="evenodd"
//                         d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
//                         clipRule="evenodd"
//                       />
//                     </svg>
//                   )}
//                 </div>
//                 <div className="text-sm text-gray-600 mt-1 font-medium">
//                   {tab.price} • {tab.duration}
//                 </div>
//               </button>
//             ))}

//             {/* Other sort */}
//             <div className="ml-auto flex items-center px-8 py-4 text-gray-500">
//               <svg
//                 className="w-5 h-5 mr-2"
//                 fill="currentColor"
//                 viewBox="0 0 20 20"
//               >
//                 <path d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" />
//               </svg>
//               <span className="text-sm">Other sort</span>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="max-w-7xl mx-auto px-6 py-8">
//         <div className="flex gap-8">
//           {/* Sidebar */}
//           <aside className="w-80 hidden lg:block sticky top-32 self-start">
//             <Sidebar />
//           </aside>

//           {/* Results */}
//           <main className="flex-1">
//             <LoadingWrapper loading={loading} error={error}>
//               <FlightResults flights={flights} sortBy={sortBy} />
//             </LoadingWrapper>
//           </main>
//         </div>
//       </div>
//     </div>
//   );
// }

// src/pages/FlightSearchPage.tsx
// import { useState, useEffect } from "react";
// import { useSearchParams, useNavigate } from "react-router-dom";
// import { searchFlights } from "../services/amadeusService";
// import FlightResults from "../components/FlightResults";
// import Sidebar from "../components/Sidebar";
// import LoadingWrapper from "../components/LoadingWrapper";
// import { FlightResult } from "../types";

// export default function FlightSearchPage() {
//   const [searchParams] = useSearchParams();
//   const navigate = useNavigate();
//   const [flights, setFlights] = useState<FlightResult[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [sortBy, setSortBy] = useState<"best" | "cheapest" | "quickest">(
//     "best"
//   );

//   useEffect(() => {
//     const fetch = async () => {
//       setLoading(true);
//       setError(null);
//       try {
//         const results = await searchFlights({
//           from: searchParams.get("from")!,
//           to: searchParams.get("to")!,
//           departureDate: searchParams.get("departureDate")!,
//           adults: parseInt(searchParams.get("adults") || "1"),
//         });
//         setFlights(results);
//       } catch (err: any) {
//         setError(err.message || "Failed to load flights");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetch();
//   }, [searchParams]);

//   // Calculate stats for tabs
//   const cheapest =
//     flights.length > 0
//       ? flights.reduce((a, b) => (a.price < b.price ? a : b))
//       : null;
//   const quickest =
//     flights.length > 0
//       ? flights.reduce((a, b) => (a.duration < b.duration ? a : b))
//       : null;
//   const best =
//     flights.find((f) => f.stops === 0 && f.price < 1500) || flights[0];

//   const formatDuration = (mins: number) => {
//     const h = Math.floor(mins / 60);
//     const m = mins % 60;
//     return m === 0 ? `${h}h` : `${h}h ${m}m`;
//   };

//   const from = searchParams.get("from") || "LHR";
//   const to = searchParams.get("to") || "JFK";

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header */}
//       <header className="bg-white border-b border-gray-200">
//         <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
//           <div>
//             <h1 className="text-2xl font-bold text-gray-900">
//               {from} to {to}
//             </h1>
//             <p className="text-sm text-gray-600 mt-1">
//               {searchParams.get("departureDate")} • {searchParams.get("adults")}{" "}
//               adult(s) • Economy
//             </p>
//           </div>
//           <button
//             onClick={() => navigate("/")}
//             className="text-blue-600 hover:underline text-sm font-medium"
//           >
//             Modify search
//           </button>
//         </div>
//       </header>

//       {/* EXACTLY WHERE YOU DREW THE RED LINE — KAYAK TABS */}
//       <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
//         <div className="max-w-7xl mx-auto px-6">
//           <div className="flex items-stretch -mb-px">
//             {[
//               {
//                 key: "cheapest" as const,
//                 label: "Cheapest",
//                 price: cheapest ? `$${cheapest.price}` : "-",
//                 duration: cheapest ? formatDuration(cheapest.duration) : "",
//               },
//               {
//                 key: "best" as const,
//                 label: "Best",
//                 price: best ? `$${best.price}` : "-",
//                 duration: best ? formatDuration(best.duration) : "",
//                 hasInfo: true,
//               },
//               {
//                 key: "quickest" as const,
//                 label: "Quickest",
//                 price: quickest ? `$${quickest.price}` : "-",
//                 duration: quickest ? formatDuration(quickest.duration) : "",
//               },
//             ].map((tab) => (
//               <button
//                 key={tab.key}
//                 onClick={() => setSortBy(tab.key)}
//                 className={`flex flex-col items-start px-8 py-4 border-b-4 transition-all relative ${
//                   sortBy === tab.key
//                     ? "border-blue-600 text-blue-700 font-semibold"
//                     : "border-transparent text-gray-600 hover:text-gray-900"
//                 }`}
//               >
//                 <div className="flex items-center gap-2">
//                   <span className="text-lg font-medium">{tab.label}</span>
//                   {tab.hasInfo && (
//                     <svg
//                       className="w-4 h-4 text-gray-400"
//                       fill="currentColor"
//                       viewBox="0 0 20 20"
//                     >
//                       <path
//                         fillRule="evenodd"
//                         d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
//                         clipRule="evenodd"
//                       />
//                     </svg>
//                   )}
//                 </div>
//                 <div className="text-sm text-gray-600 mt-1 font-medium">
//                   {tab.price} • {tab.duration}
//                 </div>
//               </button>
//             ))}

//             {/* Other sort */}
//             <div className="ml-auto flex items-center px-8 py-4 text-gray-500">
//               <svg
//                 className="w-5 h-5 mr-2"
//                 fill="currentColor"
//                 viewBox="0 0 20 20"
//               >
//                 <path d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" />
//               </svg>
//               <span className="text-sm">Other sort</span>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="max-w-7xl mx-auto px-6 py-8">
//         <div className="flex gap-8">
//           {/* Sidebar */}
//           <aside className="w-80 hidden lg:block sticky top-32 self-start">
//             <Sidebar />
//           </aside>

//           {/* Results */}
//           <main className="flex-1">
//             <LoadingWrapper loading={loading} error={error}>
//               <FlightResults flights={flights} sortBy={sortBy} />
//             </LoadingWrapper>
//           </main>
//         </div>
//       </div>
//     </div>
//   );
// }

// // src/pages/FlightSearchPage.tsx
// import { useState, useEffect } from "react";
// import { useSearchParams, useNavigate } from "react-router-dom";
// import { searchFlights } from "../services/amadeusService";
// import FlightResults from "../components/FlightResults";
// import Sidebar from "../components/Sidebar";
// import LoadingWrapper from "../components/LoadingWrapper";
// import { FlightResult } from "../types";

// export default function FlightSearchPage() {
//   const [searchParams] = useSearchParams();
//   const navigate = useNavigate();
//   const [flights, setFlights] = useState<FlightResult[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [sortBy, setSortBy] = useState<"best" | "cheapest" | "quickest">(
//     "best"
//   );

//   useEffect(() => {
//     const fetch = async () => {
//       setLoading(true);
//       setError(null);
//       try {
//         const results = await searchFlights({
//           from: searchParams.get("from")!,
//           to: searchParams.get("to")!,
//           departureDate: searchParams.get("departureDate")!,
//           adults: parseInt(searchParams.get("adults") || "1"),
//         });
//         setFlights(results);
//       } catch (err: any) {
//         setError(err.message || "Failed to load flights");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetch();
//   }, [searchParams]);

//   // Stats for tabs
//   const cheapest =
//     flights.length > 0
//       ? flights.reduce((a, b) => (a.price < b.price ? a : b))
//       : null;
//   const quickest =
//     flights.length > 0
//       ? flights.reduce((a, b) => (a.duration < b.duration ? a : b))
//       : null;
//   const best = flights[0];

//   const formatDuration = (mins: number) => {
//     const h = Math.floor(mins / 60);
//     const m = mins % 60;
//     return m === 0 ? `${h}h` : `${h}h ${m}m`;
//   };

//   const from = searchParams.get("from") || "LHR";
//   const to = searchParams.get("to") || "JFK";

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header */}
//       <header className="bg-white border-b border-gray-200">
//         <div className="max-w-7xl mx-auto px-6 py-6">
//           <div className="flex justify-between items-start">
//             <div>
//               <h1 className="text-2xl font-bold text-gray-900">
//                 {from} to {to}
//               </h1>
//               <p className="text-sm text-gray-600 mt-1">
//                 {searchParams.get("departureDate")} •{" "}
//                 {searchParams.get("adults")} adult(s) • Economy
//               </p>
//             </div>
//             <button
//               onClick={() => navigate("/")}
//               className="text-blue-600 hover:underline text-sm font-medium"
//             >
//               Modify search
//             </button>
//           </div>
//         </div>
//       </header>

//       {/* KAYAK TABS — NOW PERFECTLY CENTERED UNDER THE HEADER */}
//       <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
//         <div className="max-w-7xl mx-auto px-6">
//           <div className="flex justify-center items-stretch -mb-px py-4">
//             {/* Centered Tabs */}
//             <div className="flex bg-gray-100 rounded-lg p-1">
//               {[
//                 {
//                   key: "cheapest" as const,
//                   label: "Cheapest",
//                   price: cheapest ? `$${cheapest.price}` : "-",
//                   duration: cheapest ? formatDuration(cheapest.duration) : "",
//                 },
//                 {
//                   key: "best" as const,
//                   label: "Best",
//                   price: best ? `$${best.price}` : "-",
//                   duration: best ? formatDuration(best.duration) : "",
//                   hasInfo: true,
//                 },
//                 {
//                   key: "quickest" as const,
//                   label: "Quickest",
//                   price: quickest ? `$${quickest.price}` : "-",
//                   duration: quickest ? formatDuration(quickest.duration) : "",
//                 },
//               ].map((tab) => (
//                 <button
//                   key={tab.key}
//                   onClick={() => setSortBy(tab.key)}
//                   className={`relative flex flex-col items-center px-10 py-4 rounded-md transition-all font-medium text-sm ${
//                     sortBy === tab.key
//                       ? "bg-white text-blue-700 shadow-md"
//                       : "text-gray-600 hover:text-gray-900"
//                   }`}
//                 >
//                   <div className="flex items-center gap-2">
//                     <span className="font-semibold">{tab.label}</span>
//                     {tab.hasInfo && (
//                       <svg
//                         className="w-4 h-4 text-gray-400"
//                         fill="currentColor"
//                         viewBox="0 0 20 20"
//                       >
//                         <path
//                           fillRule="evenodd"
//                           d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
//                           clipRule="evenodd"
//                         />
//                       </svg>
//                     )}
//                   </div>
//                   <div className="text-xs text-gray-600 mt-1 font-medium">
//                     {tab.price} • {tab.duration}
//                   </div>
//                 </button>
//               ))}
//             </div>

//             {/* Other sort — aligned right */}
//             <div className="ml-auto flex items-center pl-8">
//               <svg
//                 className="w-5 h-5 text-gray-500 mr-2"
//                 fill="currentColor"
//                 viewBox="0 0 20 20"
//               >
//                 <path d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" />
//               </svg>
//               <span className="text-sm text-gray-500 font-medium">
//                 Other sort
//               </span>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="max-w-7xl mx-auto px-6 py-8">
//         <div className="flex gap-8">
//           <aside className="w-80 hidden lg:block sticky top-32 self-start">
//             <Sidebar />
//           </aside>

//           <main className="flex-1">
//             <LoadingWrapper loading={loading} error={error}>
//               <FlightResults flights={flights} sortBy={sortBy} />
//             </LoadingWrapper>
//           </main>
//         </div>
//       </div>
//     </div>
//   );
// }

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
  const [sortBy, setSortBy] = useState<"best" | "cheapest" | "quickest">(
    "best"
  );

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
        });
        setFlights(results);
      } catch (err: any) {
        setError(err.message || "Failed to load flights");
      } finally {
        setLoading(false);
      }
    };
    fetch();
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
      {/* Header + Tabs + Modify Search — ALL ON THE SAME LINE */}
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

            {/* TABS + MODIFY SEARCH — SAME LINE, RIGHT-ALIGNED */}
            <div className="flex items-center gap-8">
              {/* Kayak Tabs — now perfectly inline */}
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
                    key: "quickest",
                    label: "Quickest",
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

              {/* Modify Search — same line, right-aligned */}
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
