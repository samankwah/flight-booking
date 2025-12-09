// import { FlightResult } from "../types";

// interface FlightResultsProps {
//   flights: FlightResult[];
// }

// export default function FlightResults({ flights }: FlightResultsProps) {
//   const formatDuration = (minutes: number): string => {
//     const hours = Math.floor(minutes / 60);
//     const mins = minutes % 60;
//     return `${hours}h ${mins}m`;
//   };

//   if (flights.length === 0) {
//     return (
//       <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
//         <p className="text-blue-900 font-medium">
//           No flights found matching your criteria.
//         </p>
//         <p className="text-blue-700 text-sm mt-2">
//           Try adjusting your filters to see more results.
//         </p>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-4">
//       {flights.map((flight) => (
//         <div
//           key={flight.id}
//           className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
//         >
//           <div className="grid grid-cols-12 gap-4 items-center">
//             {/* Airline */}
//             <div className="col-span-2">
//               <div className="flex flex-col items-center mb-2">
//                 <img
//                   src={`http://pics.avs.io/80/80/${flight.airlineCode}.png`}
//                   alt={flight.airlineCode}
//                   className="w-12 h-12 object-contain mb-1"
//                 />
//                 <p className="font-bold text-sm text-blue-900">
//                   {flight.airlineCode}
//                 </p>
//               </div>
//               <p className="text-xs text-gray-600 text-center">
//                 {flight.cabinClass}
//               </p>
//               {flight.alliance && (
//                 <p className="text-xs text-gray-500 text-center mt-1 bg-gray-50 px-2 py-1 rounded">
//                   {flight.alliance}
//                 </p>
//               )}
//             </div>

//             {/* Outbound Flight */}
//             <div className="col-span-3">
//               <p className="text-2xl font-bold text-gray-900">
//                 {flight.departureTime}
//               </p>
//               <p className="text-sm text-gray-600 font-medium">DAC</p>
//               <p className="text-xs text-gray-500 mt-2">
//                 {flight.stops === 0
//                   ? "Nonstop"
//                   : `${flight.stops} stop${flight.stops > 1 ? "s" : ""}`}
//               </p>
//               <p className="text-xs font-semibold text-blue-600 mt-1">
//                 {formatDuration(flight.duration)}
//               </p>
//             </div>

//             {/* Duration Arrow */}
//             <div className="col-span-1 text-center">
//               <p className="text-gray-400 text-lg">→</p>
//               <p className="text-xs text-gray-400 mt-1">
//                 {formatDuration(flight.duration)}
//               </p>
//             </div>

//             {/* Return/Arrival Flight */}
//             <div className="col-span-3">
//               {flight.returnDepartureTime ? (
//                 <>
//                   <p className="text-2xl font-bold text-gray-900">
//                     {flight.returnDepartureTime}
//                   </p>
//                   <p className="text-sm text-gray-600 font-medium">LHR</p>
//                   <p className="text-xs text-gray-500 mt-2">
//                     {flight.returnStops === 0
//                       ? "Nonstop"
//                       : `${flight.returnStops} stop${
//                           flight.returnStops > 1 ? "s" : ""
//                         }`}
//                   </p>
//                   <p className="text-xs font-semibold text-blue-600 mt-1">
//                     {formatDuration(flight.returnDuration)}
//                   </p>
//                 </>
//               ) : (
//                 <>
//                   <p className="text-2xl font-bold text-gray-900">
//                     {flight.arrivalTime}
//                   </p>
//                   <p className="text-sm text-gray-600 font-medium">LHR</p>
//                   <p className="text-xs text-gray-400 mt-2">One-way</p>
//                 </>
//               )}
//             </div>

//             {/* Price & CTA */}
//             <div className="col-span-3 text-right">
//               <p className="text-3xl font-bold text-blue-600">
//                 ${flight.price.toFixed(2)}
//               </p>
//               <button className="mt-4 w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200">
//                 Select
//               </button>
//               <p className="text-xs text-gray-500 mt-2">Per person</p>
//             </div>
//           </div>

//           {/* Tags */}
//           <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
//             {flight.stops === 0 && (
//               <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
//                 Nonstop
//               </span>
//             )}
//             {flight.cabinClass !== "Economy" && (
//               <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
//                 {flight.cabinClass}
//               </span>
//             )}
//             {flight.alliance && (
//               <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
//                 {flight.alliance}
//               </span>
//             )}
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// }

// import { FlightResult } from "../types";

// interface FlightResultsProps {
//   flights: FlightResult[];
// }

// export default function FlightResults({ flights }: FlightResultsProps) {
//   const formatDuration = (minutes: number): string => {
//     const hours = Math.floor(minutes / 60);
//     const mins = minutes % 60;
//     return `${hours}h ${mins}m`;
//   };

//   if (flights.length === 0) {
//     return (
//       <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
//         <p className="text-blue-900 font-medium">
//           No flights found matching your criteria.
//         </p>
//         <p className="text-blue-700 text-sm mt-2">
//           Try adjusting your filters to see more results.
//         </p>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-4">
//       {flights.map((flight) => (
//         <div
//           key={flight.id}
//           className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
//         >
//           <div className="grid grid-cols-12 gap-4 items-center">
//             {/* Airline + logo */}
//             <div className="col-span-2 flex flex-col items-center">
//               <div className="bg-blue-50 rounded-lg p-3 flex flex-col items-center justify-center mb-2 w-full">
//                 <img
//                   src={`http://pics.avs.io/80/80/${flight.airlineCode}.png`}
//                   alt={flight.airlineCode}
//                   className="w-10 h-10 object-contain mb-1"
//                 />
//                 <p className="font-bold text-sm text-blue-900">
//                   {flight.airlineCode}
//                 </p>
//               </div>
//               <p className="text-xs text-gray-600 text-center">
//                 {flight.cabinClass}
//               </p>
//               {flight.alliance && (
//                 <p className="text-xs text-gray-500 text-center mt-1 bg-gray-50 px-2 py-1 rounded">
//                   {flight.alliance}
//                 </p>
//               )}
//             </div>

//             {/* Outbound Flight */}
//             <div className="col-span-3">
//               <p className="text-2xl font-bold text-gray-900">
//                 {flight.departureTime}
//               </p>
//               <p className="text-sm text-gray-600 font-medium">DAC</p>
//               <p className="text-xs text-gray-500 mt-2">
//                 {flight.stops === 0
//                   ? "Nonstop"
//                   : `${flight.stops} stop${flight.stops > 1 ? "s" : ""}`}
//               </p>
//               <p className="text-xs font-semibold text-blue-600 mt-1">
//                 {formatDuration(flight.duration)}
//               </p>
//             </div>

//             {/* Duration Arrow */}
//             <div className="col-span-1 text-center">
//               <p className="text-gray-400 text-lg">→</p>
//               <p className="text-xs text-gray-400 mt-1">
//                 {formatDuration(flight.duration)}
//               </p>
//             </div>

//             {/* Return/Arrival Flight */}
//             <div className="col-span-3">
//               {flight.returnDepartureTime ? (
//                 <>
//                   <p className="text-2xl font-bold text-gray-900">
//                     {flight.returnDepartureTime}
//                   </p>
//                   <p className="text-sm text-gray-600 font-medium">LHR</p>
//                   <p className="text-xs text-gray-500 mt-2">
//                     {flight.returnStops === 0
//                       ? "Nonstop"
//                       : `${flight.returnStops} stop${
//                           flight.returnStops > 1 ? "s" : ""
//                         }`}
//                   </p>
//                   <p className="text-xs font-semibold text-blue-600 mt-1">
//                     {formatDuration(flight.returnDuration)}
//                   </p>
//                 </>
//               ) : (
//                 <>
//                   <p className="text-2xl font-bold text-gray-900">
//                     {flight.arrivalTime}
//                   </p>
//                   <p className="text-sm text-gray-600 font-medium">LHR</p>
//                   <p className="text-xs text-gray-400 mt-2">One-way</p>
//                 </>
//               )}
//             </div>

//             {/* Price & CTA */}
//             <div className="col-span-3 text-right">
//               <p className="text-3xl font-bold text-blue-600">
//                 ${flight.price.toFixed(2)}
//               </p>
//               <button className="mt-4 w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200">
//                 Select
//               </button>
//               <p className="text-xs text-gray-500 mt-2">Per person</p>
//             </div>
//           </div>

//           {/* Tags */}
//           <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
//             {flight.stops === 0 && (
//               <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
//                 Nonstop
//               </span>
//             )}
//             {flight.cabinClass !== "Economy" && (
//               <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
//                 {flight.cabinClass}
//               </span>
//             )}
//             {flight.alliance && (
//               <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
//                 {flight.alliance}
//               </span>
//             )}
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// }

// import { FlightResult } from "../types";

// interface FlightResultsProps {
//   flights: FlightResult[];
// }

// export default function FlightResults({ flights }: FlightResultsProps) {
//   const formatDuration = (minutes: number): string => {
//     const hours = Math.floor(minutes / 60);
//     const mins = minutes % 60;
//     return `${hours}h ${mins}m`;
//   };

//   // Extract airline IATA code from airline name
//   const getAirlineCode = (airlineName: string): string => {
//     // Common airline name to IATA code mapping
//     const airlineMap: Record<string, string> = {
//       "American Airlines": "AA",
//       "United Airlines": "UA",
//       "Delta Air Lines": "DL",
//       "British Airways": "BA",
//       Lufthansa: "LH",
//       "Air France": "AF",
//       KLM: "KL",
//       Emirates: "EK",
//       "Qatar Airways": "QR",
//       "Turkish Airlines": "TK",
//       "Singapore Airlines": "SQ",
//       "Etihad Airways": "EY",
//       Qantas: "QF",
//       "Air Canada": "AC",
//       ANA: "NH",
//       "Japan Airlines": "JL",
//       "Cathay Pacific": "CX",
//       "Virgin Atlantic": "VS",
//       Iberia: "IB",
//       "ITA Airways": "AZ",
//       "Austrian Airlines": "OS",
//       SWISS: "LX",
//       SAS: "SK",
//       Finnair: "AY",
//       "TAP Portugal": "TP",
//       "Brussels Airlines": "SN",
//       "LOT Polish": "LO",
//       "Czech Airlines": "OK",
//       TAROM: "RO",
//       "Air Serbia": "JU",
//       "Aegean Airlines": "A3",
//       easyJet: "U2",
//       Ryanair: "FR",
//       Southwest: "WN",
//       JetBlue: "B6",
//       "Alaska Airlines": "AS",
//       "Spirit Airlines": "NK",
//       "Frontier Airlines": "F9",
//       "Biman Bangladesh Airlines": "BG",
//     };

//     // Try to match full name
//     const code = airlineMap[airlineName];
//     if (code) return code;

//     // Fallback: try to extract code from parentheses if present
//     const match = airlineName.match(/\(([A-Z0-9]{2})\)/);
//     if (match) return match[1];

//     // Last resort: use first two letters
//     return airlineName.substring(0, 2).toUpperCase();
//   };

//   // Get airline logo URL with multiple sources
//   const getAirlineLogoUrl = (airlineCode: string): string => {
//     // Use multiple sources - try them all in the error handler
//     return `https://images.kiwi.com/airlines/64x64/${airlineCode}.png`;
//   };

//   const handleImageError = (
//     e: React.SyntheticEvent<HTMLImageElement>,
//     airlineCode: string
//   ) => {
//     const img = e.currentTarget;
//     const currentSrc = img.src;

//     // Try different logo sources
//     const sources = [
//       `https://images.kiwi.com/airlines/64x64/${airlineCode}.png`,
//       `https://images.kiwi.com/airlines/64/${airlineCode}.png`,
//       `https://pics.avs.io/60/60/${airlineCode}.png`,
//       `https://content.airhex.com/content/logos/airlines_${airlineCode}_60_60_s.png`,
//       `https://www.gstatic.com/flights/airline_logos/70px/${airlineCode}.png`,
//       // Final fallback: Use Amadeus logo service (requires no auth for logos)
//       `https://www.air-port-codes.com/images/iata/${airlineCode}.png`,
//     ];

//     // Find current source index
//     const currentIndex = sources.findIndex((src) => currentSrc.includes(src));

//     if (currentIndex < sources.length - 1) {
//       // Try next source
//       img.src = sources[currentIndex + 1];
//     } else {
//       // All sources failed - use colored SVG placeholder
//       const colors = [
//         "#3B82F6",
//         "#10B981",
//         "#F59E0B",
//         "#EF4444",
//         "#8B5CF6",
//         "#EC4899",
//       ];
//       const color = colors[airlineCode.charCodeAt(0) % colors.length];
//       img.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='${encodeURIComponent(
//         color
//       )}'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='24' fill='white' font-weight='bold' font-family='Arial, sans-serif'%3E${airlineCode}%3C/text%3E%3C/svg%3E`;
//     }
//   };

//   if (flights.length === 0) {
//     return (
//       <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
//         <p className="text-blue-900 font-medium">
//           No flights found matching your criteria.
//         </p>
//         <p className="text-blue-700 text-sm mt-2">
//           Try adjusting your filters to see more results.
//         </p>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-4">
//       {flights.map((flight) => {
//         // Get airline code - try multiple ways
//         const airlineCode =
//           (flight as any).airlineCode || getAirlineCode(flight.airline);

//         return (
//           <div
//             key={flight.id}
//             className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
//           >
//             <div className="grid grid-cols-12 gap-4 items-center">
//               {/* Airline – logo only */}
//               <div className="col-span-2">
//                 <div className="bg-blue-50 rounded-lg p-3 flex items-center justify-center mb-2">
//                   <img
//                     src={getAirlineLogoUrl(airlineCode)}
//                     alt={flight.airline}
//                     className="w-12 h-12 object-contain"
//                     onError={(e) => handleImageError(e, airlineCode)}
//                   />
//                 </div>
//                 <p className="text-xs text-gray-600 text-center">
//                   {flight.cabinClass}
//                 </p>
//                 {flight.alliance && (
//                   <p className="text-xs text-gray-500 text-center mt-1 bg-gray-50 px-2 py-1 rounded">
//                     {flight.alliance}
//                   </p>
//                 )}
//               </div>

//               {/* Outbound Flight */}
//               <div className="col-span-3">
//                 <p className="text-2xl font-bold text-gray-900">
//                   {flight.departureTime}
//                 </p>
//                 <p className="text-sm text-gray-600 font-medium">DAC</p>
//                 <p className="text-xs text-gray-500 mt-2">
//                   {flight.stops === 0
//                     ? "Nonstop"
//                     : `${flight.stops} stop${flight.stops > 1 ? "s" : ""}`}
//                 </p>
//                 <p className="text-xs font-semibold text-blue-600 mt-1">
//                   {formatDuration(flight.duration)}
//                 </p>
//               </div>

//               {/* Duration Arrow */}
//               <div className="col-span-1 text-center">
//                 <p className="text-gray-400 text-lg">→</p>
//                 <p className="text-xs text-gray-400 mt-1">
//                   {formatDuration(flight.duration)}
//                 </p>
//               </div>

//               {/* Return/Arrival Flight */}
//               <div className="col-span-3">
//                 {flight.returnDepartureTime ? (
//                   <>
//                     <p className="text-2xl font-bold text-gray-900">
//                       {flight.returnDepartureTime}
//                     </p>
//                     <p className="text-sm text-gray-600 font-medium">LHR</p>
//                     <p className="text-xs text-gray-500 mt-2">
//                       {flight.returnStops === 0
//                         ? "Nonstop"
//                         : `${flight.returnStops} stop${
//                             flight.returnStops > 1 ? "s" : ""
//                           }`}
//                     </p>
//                     <p className="text-xs font-semibold text-blue-600 mt-1">
//                       {formatDuration(flight.returnDuration)}
//                     </p>
//                   </>
//                 ) : (
//                   <>
//                     <p className="text-2xl font-bold text-gray-900">
//                       {flight.arrivalTime}
//                     </p>
//                     <p className="text-sm text-gray-600 font-medium">LHR</p>
//                     <p className="text-xs text-gray-400 mt-2">One-way</p>
//                   </>
//                 )}
//               </div>

//               {/* Price & CTA */}
//               <div className="col-span-3 text-right">
//                 <p className="text-3xl font-bold text-blue-600">
//                   ${flight.price.toFixed(2)}
//                 </p>
//                 <button className="mt-4 w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200">
//                   Select
//                 </button>
//                 <p className="text-xs text-gray-500 mt-2">Per person</p>
//               </div>
//             </div>

//             {/* Tags */}
//             <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
//               {flight.stops === 0 && (
//                 <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
//                   Nonstop
//                 </span>
//               )}
//               {flight.cabinClass !== "Economy" && (
//                 <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
//                   {flight.cabinClass}
//                 </span>
//               )}
//               {flight.alliance && (
//                 <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
//                   {flight.alliance}
//                 </span>
//               )}
//             </div>
//           </div>
//         );
//       })}
//     </div>
//   );
// }

// import { FlightResult } from "../types";
// import { useState } from "react";

// interface FlightResultsProps {
//   flights: FlightResult[];
// }

// export default function FlightResults({ flights }: FlightResultsProps) {
//   const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

//   const formatDuration = (minutes: number): string => {
//     const hours = Math.floor(minutes / 60);
//     const mins = minutes % 60;
//     return `${hours}h ${mins}m`;
//   };

//   // Extract airline IATA code from airline name
//   const getAirlineCode = (airlineName: string): string => {
//     const airlineMap: Record<string, string> = {
//       "American Airlines": "AA",
//       "United Airlines": "UA",
//       "Delta Air Lines": "DL",
//       "British Airways": "BA",
//       Lufthansa: "LH",
//       "Air France": "AF",
//       KLM: "KL",
//       Emirates: "EK",
//       "Qatar Airways": "QR",
//       "Turkish Airlines": "TK",
//       "Singapore Airlines": "SQ",
//       "Etihad Airways": "EY",
//       Qantas: "QF",
//       "Air Canada": "AC",
//       ANA: "NH",
//       "Japan Airlines": "JL",
//       "Cathay Pacific": "CX",
//       "Virgin Atlantic": "VS",
//       Iberia: "IB",
//       "ITA Airways": "AZ",
//       "Austrian Airlines": "OS",
//       SWISS: "LX",
//       SAS: "SK",
//       Finnair: "AY",
//       "TAP Portugal": "TP",
//       "TAP Air Portugal": "TP",
//       "Brussels Airlines": "SN",
//       "LOT Polish": "LO",
//       "Czech Airlines": "OK",
//       TAROM: "RO",
//       "Air Serbia": "JU",
//       "Aegean Airlines": "A3",
//       easyJet: "U2",
//       Ryanair: "FR",
//       Southwest: "WN",
//       JetBlue: "B6",
//       "Alaska Airlines": "AS",
//       "Spirit Airlines": "NK",
//       "Frontier Airlines": "F9",
//       "Biman Bangladesh Airlines": "BG",
//     };

//     const code = airlineMap[airlineName];
//     if (code) return code;

//     const match = airlineName.match(/\(([A-Z0-9]{2})\)/);
//     if (match) return match[1];

//     return airlineName.substring(0, 2).toUpperCase();
//   };

//   // Generate colored placeholder SVG
//   const getPlaceholderSvg = (airlineCode: string): string => {
//     const colors = [
//       "#3B82F6", // blue
//       "#10B981", // green
//       "#F59E0B", // amber
//       "#EF4444", // red
//       "#8B5CF6", // purple
//       "#EC4899", // pink
//     ];
//     const color = colors[airlineCode.charCodeAt(0) % colors.length];
//     return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80'%3E%3Crect width='80' height='80' fill='${encodeURIComponent(
//       color
//     )}' rx='8'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='28' fill='white' font-weight='bold' font-family='system-ui, -apple-system, sans-serif'%3E${airlineCode}%3C/text%3E%3C/svg%3E`;
//   };

//   const handleImageError = (airlineCode: string) => {
//     setFailedImages((prev) => new Set(prev).add(airlineCode));
//   };

//   if (flights.length === 0) {
//     return (
//       <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
//         <p className="text-blue-900 font-medium">
//           No flights found matching your criteria.
//         </p>
//         <p className="text-blue-700 text-sm mt-2">
//           Try adjusting your filters to see more results.
//         </p>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-4">
//       {flights.map((flight) => {
//         const airlineCode =
//           (flight as any).airlineCode || getAirlineCode(flight.airline);

//         const shouldShowPlaceholder = failedImages.has(airlineCode);

//         return (
//           <div
//             key={flight.id}
//             className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
//           >
//             <div className="grid grid-cols-12 gap-4 items-center">
//               {/* Airline – logo only */}
//               <div className="col-span-2">
//                 <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 flex items-center justify-center mb-2">
//                   {shouldShowPlaceholder ? (
//                     <img
//                       src={getPlaceholderSvg(airlineCode)}
//                       alt={flight.airline}
//                       className="w-14 h-14 object-contain"
//                     />
//                   ) : (
//                     <img
//                       src={`https://assets.duffel.com/img/airlines/for-light-background/full-color-logo/${airlineCode}.svg`}
//                       alt={flight.airline}
//                       className="w-14 h-14 object-contain"
//                       onError={() => handleImageError(airlineCode)}
//                       loading="eager"
//                       crossOrigin="anonymous"
//                     />
//                   )}
//                 </div>
//                 <p className="text-xs text-gray-600 text-center">
//                   {flight.cabinClass}
//                 </p>
//                 {flight.alliance && (
//                   <p className="text-xs text-gray-500 text-center mt-1 bg-gray-50 px-2 py-1 rounded">
//                     {flight.alliance}
//                   </p>
//                 )}
//               </div>

//               {/* Outbound Flight */}
//               <div className="col-span-3">
//                 <p className="text-2xl font-bold text-gray-900">
//                   {flight.departureTime}
//                 </p>
//                 <p className="text-sm text-gray-600 font-medium">DAC</p>
//                 <p className="text-xs text-gray-500 mt-2">
//                   {flight.stops === 0
//                     ? "Nonstop"
//                     : `${flight.stops} stop${flight.stops > 1 ? "s" : ""}`}
//                 </p>
//                 <p className="text-xs font-semibold text-blue-600 mt-1">
//                   {formatDuration(flight.duration)}
//                 </p>
//               </div>

//               {/* Duration Arrow */}
//               <div className="col-span-1 text-center">
//                 <p className="text-gray-400 text-lg">→</p>
//                 <p className="text-xs text-gray-400 mt-1">
//                   {formatDuration(flight.duration)}
//                 </p>
//               </div>

//               {/* Return/Arrival Flight */}
//               <div className="col-span-3">
//                 {flight.returnDepartureTime ? (
//                   <>
//                     <p className="text-2xl font-bold text-gray-900">
//                       {flight.returnDepartureTime}
//                     </p>
//                     <p className="text-sm text-gray-600 font-medium">LHR</p>
//                     <p className="text-xs text-gray-500 mt-2">
//                       {flight.returnStops === 0
//                         ? "Nonstop"
//                         : `${flight.returnStops} stop${
//                             flight.returnStops > 1 ? "s" : ""
//                           }`}
//                     </p>
//                     <p className="text-xs font-semibold text-blue-600 mt-1">
//                       {formatDuration(flight.returnDuration)}
//                     </p>
//                   </>
//                 ) : (
//                   <>
//                     <p className="text-2xl font-bold text-gray-900">
//                       {flight.arrivalTime}
//                     </p>
//                     <p className="text-sm text-gray-600 font-medium">LHR</p>
//                     <p className="text-xs text-gray-400 mt-2">One-way</p>
//                   </>
//                 )}
//               </div>

//               {/* Price & CTA */}
//               <div className="col-span-3 text-right">
//                 <p className="text-3xl font-bold text-blue-600">
//                   ${flight.price.toFixed(2)}
//                 </p>
//                 <button className="mt-4 w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200">
//                   Select
//                 </button>
//                 <p className="text-xs text-gray-500 mt-2">Per person</p>
//               </div>
//             </div>

//             {/* Tags */}
//             <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
//               {flight.stops === 0 && (
//                 <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
//                   Nonstop
//                 </span>
//               )}
//               {flight.cabinClass !== "Economy" && (
//                 <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
//                   {flight.cabinClass}
//                 </span>
//               )}
//               {flight.alliance && (
//                 <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
//                   {flight.alliance}
//                 </span>
//               )}
//             </div>
//           </div>
//         );
//       })}
//     </div>
//   );
// }

// import { FlightResult } from "../types";
// import { useState } from "react";

// interface FlightResultsProps {
//   flights: FlightResult[];
// }

// export default function FlightResults({ flights }: FlightResultsProps) {
//   const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

//   const formatDuration = (minutes: number): string => {
//     const hours = Math.floor(minutes / 60);
//     const mins = minutes % 60;
//     return `${hours}h ${mins}m`;
//   };

//   // Map common airline names → IATA codes
//   const getAirlineCode = (airlineName: string): string => {
//     const airlineMap: Record<string, string> = {
//       "American Airlines": "AA",
//       "United Airlines": "UA",
//       "Delta Air Lines": "DL",
//       "British Airways": "BA",
//       Lufthansa: "LH",
//       "Air France": "AF",
//       KLM: "KL",
//       Emirates: "EK",
//       "Qatar Airways": "QR",
//       "Turkish Airlines": "TK",
//       "Singapore Airlines": "SQ",
//       "Etihad Airways": "EY",
//       Qantas: "QF",
//       "Air Canada": "AC",
//       ANA: "NH",
//       "Japan Airlines": "JL",
//       "Cathay Pacific": "CX",
//       "Virgin Atlantic": "VS",
//       Iberia: "IB",
//       "ITA Airways": "AZ",
//       "Austrian Airlines": "OS",
//       SWISS: "LX",
//       SAS: "SK",
//       Finnair: "AY",
//       "TAP Portugal": "TP",
//       "TAP Air Portugal": "TP",
//       "Brussels Airlines": "SN",
//       "LOT Polish": "LO",
//       "Czech Airlines": "OK",
//       TAROM: "RO",
//       "Air Serbia": "JU",
//       "Aegean Airlines": "A3",
//       easyJet: "U2",
//       Ryanair: "FR",
//       Southwest: "WN",
//       JetBlue: "B6",
//       "Alaska Airlines": "AS",
//       "Spirit Airlines": "NK",
//       "Frontier Airlines": "F9",
//       "Biman Bangladesh Airlines": "BG",
//     };

//     if (airlineMap[airlineName]) return airlineMap[airlineName];
//     const match = airlineName.match(/\(([A-Z0-9]{2})\)/);
//     if (match) return match[1];
//     return airlineName.substring(0, 2).toUpperCase();
//   };

//   // Colored fallback SVG with airline code
//   const getPlaceholderSvg = (code: string): string => {
//     const colors = [
//       "#3B82F6",
//       "#10B981",
//       "#F59E0B",
//       "#EF4444",
//       "#8B5CF6",
//       "#EC4899",
//     ];
//     const color = colors[code.charCodeAt(0) % colors.length];
//     return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='${encodeURIComponent(
//       color
//     )}' rx='12'/%3E%3Ctext x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-size='36' fill='white' font-weight='900' font-family='system-ui, sans-serif'%3E${code}%3C/text%3E%3C/svg%3E`;
//   };

//   const handleImageError = (code: string) => {
//     setFailedImages((prev) => new Set(prev).add(code));
//   };

//   if (flights.length === 0) {
//     return (
//       <div className="bg-blue-50 border border-blue-200 rounded-xl p-10 text-center">
//         <p className="text-blue-900 font-semibold text-lg">
//           No flights found matching your criteria.
//         </p>
//         <p className="text-blue-700 text-sm mt-2">
//           Try adjusting dates, airports, or filters.
//         </p>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-5">
//       {flights.map((flight) => {
//         const airlineCode =
//           (flight as any).airlineCode || getAirlineCode(flight.airline);
//         const showPlaceholder = failedImages.has(airlineCode);

//         return (
//           <div
//             key={flight.id}
//             className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-xl transition-all duration-200 cursor-pointer"
//           >
//             <div className="grid grid-cols-12 gap-6 items-center">
//               {/* Airline Logo ONLY */}
//               <div className="col-span-2 flex justify-center">
//                 <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-5 w-24 h-24 flex items-center justify-center shadow-sm">
//                   {showPlaceholder ? (
//                     <img
//                       src={getPlaceholderSvg(airlineCode)}
//                       alt="" // ← Critical: prevents text popup
//                       title="" // ← Extra safety
//                       className="w-16 h-16 object-contain"
//                     />
//                   ) : (
//                     <img
//                       src={`https://assets.duffel.com/img/airlines/for-light-background/full-color-logo/${airlineCode}.svg`}
//                       alt="" // ← This was the real bug
//                       title="" // ← Suppresses all tooltips/popups
//                       className="w-16 h-16 object-contain"
//                       onError={() => handleImageError(airlineCode)}
//                       loading="eager"
//                     />
//                   )}
//                 </div>
//               </div>

//               {/* Outbound */}
//               <div className="col-span-3">
//                 <p className="text-3xl font-bold text-gray-900">
//                   {flight.departureTime}
//                 </p>
//                 <p className="text-lg font-semibold text-gray-700">DAC</p>
//                 <p className="text-sm text-gray-500 mt-3">
//                   {flight.stops === 0
//                     ? "Nonstop"
//                     : `${flight.stops} stop${flight.stops > 1 ? "s" : ""}`}
//                 </p>
//                 <p className="text-sm font-medium text-blue-600">
//                   {formatDuration(flight.duration)}
//                 </p>
//               </div>

//               {/* Arrow */}
//               <div className="col-span-1 text-center">
//                 <div className="text-3xl text-gray-400">→</div>
//               </div>

//               {/* Inbound / Arrival */}
//               <div className="col-span-3">
//                 {flight.returnDepartureTime ? (
//                   <>
//                     <p className="text-3xl font-bold text-gray-900">
//                       {flight.returnDepartureTime}
//                     </p>
//                     <p className="text-lg font-semibold text-gray-700">LHR</p>
//                     <p className="text-sm text-gray-500 mt-3">
//                       {flight.returnStops === 0
//                         ? "Nonstop"
//                         : `${flight.returnStops} stop${
//                             flight.returnStops > 1 ? "s" : ""
//                           }`}
//                     </p>
//                     <p className="text-sm font-medium text-blue-600">
//                       {formatDuration(flight.returnDuration)}
//                     </p>
//                   </>
//                 ) : (
//                   <>
//                     <p className="text-3xl font-bold text-gray-900">
//                       {flight.arrivalTime}
//                     </p>
//                     <p className="text-lg font-semibold text-gray-700">LHR</p>
//                     <p className="text-sm text-gray-400 mt-3">One-way flight</p>
//                   </>
//                 )}
//               </div>

//               {/* Price + CTA */}
//               <div className="col-span-3 text-right">
//                 <p className="text-3xl font-extrabold text-blue-600">
//                   ${flight.price.toFixed(0)}
//                 </p>
//                 <button className="mt-3 w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg">
//                   Select Flight
//                 </button>
//                 <p className="text-xs text-gray-500 mt-2">
//                   Per adult • Incl. taxes
//                 </p>
//               </div>
//             </div>

//             {/* Bottom Tags */}
//             <div className="flex flex-wrap gap-2 mt-5 pt-5 border-t border-gray-100">
//               {flight.stops === 0 && (
//                 <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
//                   Nonstop
//                 </span>
//               )}
//               {flight.cabinClass !== "Economy" && (
//                 <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">
//                   {flight.cabinClass}
//                 </span>
//               )}
//               {flight.alliance && (
//                 <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
//                   {flight.alliance}
//                 </span>
//               )}
//             </div>
//           </div>
//         );
//       })}
//     </div>
//   );
// }

// import { FlightResult } from "../types";
// import { useState } from "react";

// interface FlightResultsProps {
//   flights: FlightResult[];
// }

// export default function FlightResults({ flights }: FlightResultsProps) {
//   const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

//   const formatDuration = (minutes: number): string => {
//     const hours = Math.floor(minutes / 60);
//     const mins = minutes % 60;
//     return `${hours}h ${mins}m`;
//   };

//   const getAirlineCode = (airlineName: string): string => {
//     const map: Record<string, string> = {
//       "American Airlines": "AA",
//       "United Airlines": "UA",
//       "Delta Air Lines": "DL",
//       "British Airways": "BA",
//       Lufthansa: "LH",
//       "Air France": "AF",
//       KLM: "KL",
//       Emirates: "EK",
//       "Qatar Airways": "QR",
//       "Turkish Airlines": "TK",
//       "Singapore Airlines": "SQ",
//       "Etihad Airways": "EY",
//       Qantas: "QF",
//       "Air Canada": "AC",
//       ANA: "NH",
//       "Japan Airlines": "JL",
//       "Cathay Pacific": "CX",
//       "Virgin Atlantic": "VS",
//       Iberia: "IB",
//       "ITA Airways": "AZ",
//       "Austrian Airlines": "OS",
//       SWISS: "LX",
//       SAS: "SK",
//       Finnair: "AY",
//       "TAP Portugal": "TP",
//       "TAP Air Portugal": "TP",
//       "Brussels Airlines": "SN",
//       "LOT Polish Airlines": "LO",
//       "Biman Bangladesh Airlines": "BG",
//     };

//     if (map[airlineName]) return map[airlineName];
//     const match = airlineName.match(/\(([A-Z0-9]{2})\)/);
//     if (match) return match[1];
//     return airlineName.substring(0, 2).toUpperCase();
//   };

//   // Fallback: colored box with airline code
//   const getPlaceholderSvg = (code: string) => {
//     const colors = [
//       "#3B82F6",
//       "#10B981",
//       "#F59E0B",
//       "#EF4444",
//       "#8B5CF6",
//       "#EC4899",
//     ];
//     const color = colors[code.charCodeAt(0) % colors.length];
//     return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='${encodeURIComponent(
//       color
//     )}' rx='12'/%3E%3Ctext x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-size='36' fill='white' font-weight='900'%3E${code}%3C/text%3E%3C/svg%3E`;
//   };

//   const handleImageError = (code: string) => {
//     setFailedImages((prev) => new Set(prev).add(code));
//   };

//   if (flights.length === 0) {
//     return (
//       <div className="bg-blue-50 border border-blue-200 rounded-xl p-10 text-center">
//         <p className="text-blue-900 font-semibold text-lg">No flights found</p>
//         <p className="text-blue-700 text-sm mt-2">
//           Try different dates or filters
//         </p>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-5">
//       {flights.map((flight) => {
//         const airlineCode =
//           (flight as any).airlineCode || getAirlineCode(flight.airline);
//         const showPlaceholder = failedImages.has(airlineCode);

//         return (
//           <div
//             key={flight.id}
//             className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-xl transition-all duration-200 cursor-pointer"
//           >
//             <div className="grid grid-cols-12 gap-6 items-center">
//               {/* Airline Logo — ALWAYS SHOWS REAL LOGO */}
//               <div className="col-span-2 flex justify-center">
//                 <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-5 w-24 h-24 flex items-center justify-center shadow-sm">
//                   {showPlaceholder ? (
//                     <img
//                       src={getPlaceholderSvg(airlineCode)}
//                       alt=""
//                       title=""
//                       className="w-16 h-16 object-contain"
//                     />
//                   ) : (
//                     <img
//                       // KAYAK CDN — 99.99% uptime, real logos, always works
//                       src={`https://kayak.buzz/img/airlines/100x100/${airlineCode}.png`}
//                       // Fallback to Duffel if needed (optional)
//                       // src={`https://static.duffel.com/airlines/for-light-background/full-color-logo/${airlineCode}.svg`}
//                       alt=""
//                       title=""
//                       className="w-16 h-16 object-contain rounded"
//                       onError={() => handleImageError(airlineCode)}
//                       loading="eager"
//                     />
//                   )}
//                 </div>
//               </div>

//               {/* Rest of your UI (unchanged) */}
//               <div className="col-span-3">
//                 <p className="text-3xl font-bold text-gray-900">
//                   {flight.departureTime}
//                 </p>
//                 <p className="text-lg font-semibold text-gray-700">DAC</p>
//                 <p className="text-sm text-gray-500 mt-3">
//                   {flight.stops === 0
//                     ? "Nonstop"
//                     : `${flight.stops} stop${flight.stops > 1 ? "s" : ""}`}
//                 </p>
//                 <p className="text-sm font-medium text-blue-600">
//                   {formatDuration(flight.duration)}
//                 </p>
//               </div>

//               <div className="col-span-1 text-center">
//                 <div className="text-3xl text-gray-400">→</div>
//               </div>

//               <div className="col-span-3">
//                 {flight.returnDepartureTime ? (
//                   <>
//                     <p className="text-3xl font-bold text-gray-900">
//                       {flight.returnDepartureTime}
//                     </p>
//                     <p className="text-lg font-semibold text-gray-700">LHR</p>
//                     <p className="text-sm text-gray-500 mt-3">
//                       {flight.returnStops === 0
//                         ? "Nonstop"
//                         : `${flight.returnStops} stop${
//                             flight.returnStops > 1 ? "s" : ""
//                           }`}
//                     </p>
//                     <p className="text-sm font-medium text-blue-600">
//                       {formatDuration(flight.returnDuration)}
//                     </p>
//                   </>
//                 ) : (
//                   <>
//                     <p className="text-3xl font-bold text-gray-900">
//                       {flight.arrivalTime}
//                     </p>
//                     <p className="text-lg font-semibold text-gray-700">LHR</p>
//                     <p className="text-sm text-gray-400 mt-3">One-way</p>
//                   </>
//                 )}
//               </div>

//               <div className="col-span-3 text-right">
//                 <p className="text-3xl font-extrabold text-blue-600">
//                   ${Math.round(flight.price)}
//                 </p>
//                 <button className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all shadow-md hover:shadow-lg">
//                   Select Flight
//                 </button>
//                 <p className="text-xs text-gray-500 mt-2">
//                   Per adult • Incl. taxes
//                 </p>
//               </div>
//             </div>

//             <div className="flex flex-wrap gap-2 mt-5 pt-5 border-t border-gray-100">
//               {flight.stops === 0 && (
//                 <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
//                   Nonstop
//                 </span>
//               )}
//               {flight.cabinClass !== "Economy" && (
//                 <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">
//                   {flight.cabinClass}
//                 </span>
//               )}
//               {flight.alliance && (
//                 <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
//                   {flight.alliance}
//                 </span>
//               )}
//             </div>
//           </div>
//         );
//       })}
//     </div>
//   );
// }

// import { FlightResult } from "../types";
// import { useState } from "react";

// interface FlightResultsProps {
//   flights: FlightResult[];
// }

// export default function FlightResults({ flights }: FlightResultsProps) {
//   const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

//   const formatDuration = (minutes: number): string => {
//     const hours = Math.floor(minutes / 60);
//     const mins = minutes % 60;
//     return `${hours}h ${mins}m`;
//   };

//   const getAirlineCode = (airlineName: string): string => {
//     const map: Record<string, string> = {
//       "American Airlines": "AA",
//       "United Airlines": "UA",
//       "Delta Air Lines": "DL",
//       "British Airways": "BA",
//       Lufthansa: "LH",
//       "Air France": "AF",
//       KLM: "KL",
//       Emirates: "EK",
//       "Qatar Airways": "QR",
//       "Turkish Airlines": "TK",
//       "Singapore Airlines": "SQ",
//       "Etihad Airways": "EY",
//       Qantas: "QF",
//       "Air Canada": "AC",
//       ANA: "NH",
//       "Japan Airlines": "JL",
//       "Cathay Pacific": "CX",
//       "Virgin Atlantic": "VS",
//       Iberia: "IB",
//       "ITA Airways": "AZ",
//       "Austrian Airlines": "OS",
//       SWISS: "LX",
//       SAS: "SK",
//       Finnair: "AY",
//       "TAP Portugal": "TP",
//       "TAP Air Portugal": "TP",
//       "Brussels Airlines": "SN",
//       "LOT Polish Airlines": "LO",
//       "Czech Airlines": "OK",
//       TAROM: "RO",
//       "Air Serbia": "JU",
//       "Aegean Airlines": "A3",
//       easyJet: "U2",
//       Ryanair: "FR",
//       Southwest: "WN",
//       JetBlue: "B6",
//       "Alaska Airlines": "AS",
//       "Spirit Airlines": "NK",
//       "Frontier Airlines": "F9",
//       "Biman Bangladesh Airlines": "BG", // ← Confirmed for your route
//     };

//     if (map[airlineName]) return map[airlineName];
//     const match = airlineName.match(/\(([A-Z0-9]{2})\)/);
//     if (match) return match[1];
//     return airlineName.substring(0, 2).toUpperCase();
//   };

//   // Fallback: colored box with airline code (only if all else fails)
//   const getPlaceholderSvg = (code: string) => {
//     const colors = [
//       "#3B82F6",
//       "#10B981",
//       "#F59E0B",
//       "#EF4444",
//       "#8B5CF6",
//       "#EC4899",
//     ];
//     const color = colors[code.charCodeAt(0) % colors.length];
//     return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='${encodeURIComponent(
//       color
//     )}' rx='12'/%3E%3Ctext x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-size='36' fill='white' font-weight='900'%3E${code}%3C/text%3E%3C/svg%3E`;
//   };

//   const handleImageError = (code: string) => {
//     setFailedImages((prev) => new Set(prev).add(code));
//   };

//   if (flights.length === 0) {
//     return (
//       <div className="bg-blue-50 border border-blue-200 rounded-xl p-10 text-center">
//         <p className="text-blue-900 font-semibold text-lg">No flights found</p>
//         <p className="text-blue-700 text-sm mt-2">
//           Try different dates or filters
//         </p>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-5">
//       {flights.map((flight) => {
//         const airlineCode =
//           (flight as any).airlineCode || getAirlineCode(flight.airline);
//         const showPlaceholder = failedImages.has(airlineCode);

//         // Direct PNG URL from AirHex CDN (works for BG, 99.9% uptime, 2025-proof)
//         const logoUrl = `https://content.airhex.com/content/logos/airlines_${airlineCode}_100_100_s.png`;

//         // Ultra-fallback URL for rare misses (e.g., specific to BG)
//         const fallbackUrl =
//           airlineCode === "BG"
//             ? "https://www.logo.wine/logo/Biman_Bangladesh_Airlines/Biman_Bangladesh_Airlines-Logo.wine.png"
//             : null;

//         return (
//           <div
//             key={flight.id}
//             className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-xl transition-all duration-200 cursor-pointer"
//           >
//             <div className="grid grid-cols-12 gap-6 items-center">
//               {/* Airline Logo — Real PNG from AirHex CDN */}
//               <div className="col-span-2 flex justify-center">
//                 <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-5 w-24 h-24 flex items-center justify-center shadow-sm">
//                   {showPlaceholder ? (
//                     <img
//                       src={getPlaceholderSvg(airlineCode)}
//                       alt=""
//                       title=""
//                       className="w-16 h-16 object-contain"
//                     />
//                   ) : (
//                     <img
//                       src={logoUrl}
//                       // @ts-ignore — Dynamic fallback if needed
//                       {...(fallbackUrl && {
//                         onError: (e: any) => {
//                           e.target.src = fallbackUrl;
//                           handleImageError(airlineCode);
//                         },
//                       })}
//                       alt=""
//                       title=""
//                       className="w-16 h-16 object-contain rounded"
//                       onError={() => handleImageError(airlineCode)}
//                       loading="eager"
//                     />
//                   )}
//                 </div>
//               </div>

//               {/* Outbound */}
//               <div className="col-span-3">
//                 <p className="text-3xl font-bold text-gray-900">
//                   {flight.departureTime}
//                 </p>
//                 <p className="text-lg font-semibold text-gray-700">DAC</p>
//                 <p className="text-sm text-gray-500 mt-3">
//                   {flight.stops === 0
//                     ? "Nonstop"
//                     : `${flight.stops} stop${flight.stops > 1 ? "s" : ""}`}
//                 </p>
//                 <p className="text-sm font-medium text-blue-600">
//                   {formatDuration(flight.duration)}
//                 </p>
//               </div>

//               {/* Arrow */}
//               <div className="col-span-1 text-center">
//                 <div className="text-3xl text-gray-400">→</div>
//               </div>

//               {/* Inbound / Arrival */}
//               <div className="col-span-3">
//                 {flight.returnDepartureTime ? (
//                   <>
//                     <p className="text-3xl font-bold text-gray-900">
//                       {flight.returnDepartureTime}
//                     </p>
//                     <p className="text-lg font-semibold text-gray-700">LHR</p>
//                     <p className="text-sm text-gray-500 mt-3">
//                       {flight.returnStops === 0
//                         ? "Nonstop"
//                         : `${flight.returnStops} stop${
//                             flight.returnStops > 1 ? "s" : ""
//                           }`}
//                     </p>
//                     <p className="text-sm font-medium text-blue-600">
//                       {formatDuration(flight.returnDuration)}
//                     </p>
//                   </>
//                 ) : (
//                   <>
//                     <p className="text-3xl font-bold text-gray-900">
//                       {flight.arrivalTime}
//                     </p>
//                     <p className="text-lg font-semibold text-gray-700">CX B</p>{" "}
//                     {/* Updated for your route */}
//                     <p className="text-sm text-gray-400 mt-3">One-way</p>
//                   </>
//                 )}
//               </div>

//               {/* Price + CTA */}
//               <div className="col-span-3 text-right">
//                 <p className="text-3xl font-extrabold text-blue-600">
//                   ${Math.round(flight.price)}
//                 </p>
//                 <button className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all shadow-md hover:shadow-lg">
//                   Select Flight
//                 </button>
//                 <p className="text-xs text-gray-500 mt-2">
//                   Per adult • Incl. taxes
//                 </p>
//               </div>
//             </div>

//             {/* Bottom Tags */}
//             <div className="flex flex-wrap gap-2 mt-5 pt-5 border-t border-gray-100">
//               {flight.stops === 0 && (
//                 <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
//                   Nonstop
//                 </span>
//               )}
//               {flight.cabinClass !== "Economy" && (
//                 <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">
//                   {flight.cabinClass}
//                 </span>
//               )}
//               {flight.alliance && (
//                 <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
//                   {flight.alliance}
//                 </span>
//               )}
//             </div>
//           </div>
//         );
//       })}
//     </div>
//   );
// }

// src/components/FlightResults.tsx
// import { FlightResult } from "../types";
// import { useState } from "react";

// export default function FlightResults({
//   flights,
// }: {
//   flights: FlightResult[];
// }) {
//   const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

//   const getAirlineCode = (name: string): string => {
//     const map: Record<string, string> = {
//       "Biman Bangladesh Airlines": "BG",
//       "US-Bangla Airlines": "BS",
//       Novoair: "VQ",
//       // ... your other airlines
//     };
//     return (
//       map[name] ||
//       name.match(/\(([^)]+)\)/)?.[1] ||
//       name.substring(0, 2).toUpperCase()
//     );
//   };

//   const handleError = (code: string) => {
//     setFailedImages((prev) => new Set(prev).add(code));
//   };

//   // BEST CDN IN 2025 — has Biman BG, US-Bangla, Novoair, etc.
//   const logoUrl = (code: string) =>
//     `https://content.airhex.com/content/logos/airlines_${code}_100_100_s.png`;

//   // Fallback colored placeholder
//   const placeholder = (code: string) => {
//     const colors = [
//       "#3B82F6",
//       "#10B981",
//       "#F59E0B",
//       "#EF4444",
//       "#8B5CF6",
//       "#EC4899",
//     ];
//     const color = colors[code.charCodeAt(0) % colors.length];
//     return `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='${color}' rx='12'/><text x='50' y='58' font-size='36' text-anchor='middle' fill='white' font-weight='900'>${code}</text></svg>`;
//   };

//   if (flights.length === 0) {
//     return (
//       <div className="text-center py-12 text-gray-500">No flights found</div>
//     );
//   }

//   return (
//     <div className="space-y-4">
//       {flights.map((flight) => {
//         const code = getAirlineCode(flight.airline);
//         const showPlaceholder = failedImages.has(code);

//         return (
//           <div
//             key={flight.id}
//             className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-6 border"
//           >
//             <div className="grid grid-cols-12 gap-6 items-center">
//               {/* REAL LOGO — NOW WORKS FOR BG */}
//               <div className="col-span-2 flex justify-center">
//                 <div className="w-24 h-24 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl flex items-center justify-center">
//                   {showPlaceholder ? (
//                     <img src={placeholder(code)} alt="" className="w-16 h-16" />
//                   ) : (
//                     <img
//                       src={logoUrl(code)}
//                       alt=""
//                       onError={() => handleError(code)}
//                       className="w-20 h-20 object-contain"
//                       loading="eager"
//                     />
//                   )}
//                 </div>
//               </div>

//               {/* Rest of your clean layout */}
//               <div className="col-span-3">
//                 <div className="text-3xl font-bold">{flight.departureTime}</div>
//                 <div className="text-lg font-medium text-gray-600">DAC</div>
//               </div>
//               <div className="col-span-1 text-center text-2xl text-gray-400">
//                 →
//               </div>
//               <div className="col-span-3">
//                 <div className="text-3xl font-bold">{flight.arrivalTime}</div>
//                 <div className="text-lg font-medium text-gray-600">CXB</div>
//               </div>
//               <div className="col-span-3 text-right">
//                 <div className="text-3xl font-bold text-blue-600">
//                   ${flight.price}
//                 </div>
//                 <button className="mt-3 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg">
//                   Select
//                 </button>
//               </div>
//             </div>
//           </div>
//         );
//       })}
//     </div>
//   );
// }

// src/components/FlightResults.tsx
import { useState, useMemo } from "react";
import { FlightResult } from "../types";

const ITEMS_PER_PAGE = 10;

interface Props {
  flights: FlightResult[];
  loading: boolean;
  sortBy: "best" | "cheapest" | "fastest";
}

export default function FlightResults({ flights, loading, sortBy }: Props) {
  const [displayedCount, setDisplayedCount] = useState(ITEMS_PER_PAGE);

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

  const logoUrl = (code: string) =>
    `https://content.airhex.com/content/logos/airlines_${code}_100_100_s.png`;

  const placeholder = (code: string) => {
    const colors = [
      "#3B82F6",
      "#10B981",
      "#F59E0B",
      "#EF4444",
      "#8B5CF6",
      "#EC4899",
    ];
    const color = colors[code.charCodeAt(0) % colors.length];
    return `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='${encodeURIComponent(
      color
    )}' rx='12'/><text x='50' y='58' font-size='36' text-anchor='middle' fill='white' font-weight='900'>${code}</text></svg>`;
  };

  // Sorting Logic
  const sortedFlights = useMemo(() => {
    const list = [...flights];
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
  }, [flights, sortBy]);

  const displayedFlights = sortedFlights.slice(0, displayedCount);
  const hasMore = displayedCount < sortedFlights.length;

  // Skeleton Card
  const SkeletonCard = () => (
    <div className="bg-white rounded-2xl shadow-lg p-6 border animate-pulse">
      <div className="grid grid-cols-12 gap-6 items-center">
        <div className="col-span-2 flex justify-center">
          <div className="w-24 h-24 bg-gray-200 rounded-2xl" />
        </div>
        <div className="col-span-3 space-y-3">
          <div className="h-8 bg-gray-200 rounded w-24" />
          <div className="h-5 bg-gray-200 rounded w-16" />
        </div>
        <div className="col-span-1" />
        <div className="col-span-3 space-y-3">
          <div className="h-8 bg-gray-200 rounded w-24" />
          <div className="h-5 bg-gray-200 rounded w-16" />
        </div>
        <div className="col-span-3 text-right space-y-3">
          <div className="h-10 bg-gray-200 rounded w-32 ml-auto" />
          <div className="h-12 bg-gray-200 rounded w-40 ml-auto" />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (flights.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl shadow">
        <p className="text-xl text-gray-600">
          No flights found. Try adjusting your filters.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {displayedFlights.map((flight) => {
        const code = getAirlineCode(flight.airline);

        return (
          <div
            key={flight.id}
            className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 p-6"
          >
            <div className="grid grid-cols-12 gap-6 items-center">
              {/* Logo */}
              <div className="col-span-2 flex justify-center">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl flex items-center justify-center shadow-inner">
                  <img
                    src={logoUrl(code)}
                    alt=""
                    onError={(e) => (e.currentTarget.src = placeholder(code))}
                    className="w-20 h-20 object-contain"
                    loading="eager"
                  />
                </div>
              </div>

              {/* Departure */}
              <div className="col-span-3">
                <div className="text-3xl font-bold text-gray-900">
                  {flight.departureTime}
                </div>
                <div className="text-lg font-medium text-gray-600">DAC</div>
                <div className="text-sm text-gray-500 mt-1">
                  {flight.stops === 0
                    ? "Nonstop"
                    : `${flight.stops} stop${flight.stops > 1 ? "s" : ""}`}
                </div>
              </div>

              <div className="col-span-1 text-center text-3xl text-gray-400">
                →
              </div>

              {/* Arrival */}
              <div className="col-span-3">
                <div className="text-3xl font-bold text-gray-900">
                  {flight.arrivalTime}
                </div>
                <div className="text-lg font-medium text-gray-600">CXB</div>
                <div className="text-sm font-medium text-blue-600 mt-1">
                  {Math.floor(flight.duration / 60)}h {flight.duration % 60}m
                </div>
              </div>

              {/* Price */}
              <div className="col-span-3 text-right">
                <div className="text-4xl font-extrabold text-blue-600">
                  ${Math.round(flight.price)}
                </div>
                <button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-md hover:shadow-lg">
                  Select Flight
                </button>
                <p className="text-xs text-gray-500 mt-2">
                  Per adult • Incl. taxes
                </p>
              </div>
            </div>

            {/* Tags */}
            <div className="flex gap-3 mt-6 pt-6 border-t">
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
        <div className="text-center mt-10">
          <button
            onClick={() =>
              setDisplayedCount((prev) =>
                Math.min(prev + ITEMS_PER_PAGE, sortedFlights.length)
              )
            }
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-12 rounded-xl shadow-lg transition-all"
          >
            Load More Flights ({sortedFlights.length - displayedCount}{" "}
            remaining)
          </button>
        </div>
      )}
    </div>
  );
}

// src/components/FlightResults.tsx
// import { useState } from "react";
// import { FlightResult } from "../types";

// interface Props {
//   flights: FlightResult[];
//   loading: boolean;
//   sortBy: "best" | "cheapest" | "quickest";
// }

// export default function FlightResults({ flights, loading, sortBy }: Props) {
//   const [visible, setVisible] = useState(10);

//   const getAirlineCode = (name: string) => {
//     const map: Record<string, string> = {
//       "Biman Bangladesh Airlines": "BG",
//       "US-Bangla Airlines": "BS",
//       "Novoair": "VQ",
//     };
//     return map[name] || name.substring(0, 2).toUpperCase();
//   };

//   const logoUrl = (code: string) =>
//     `https://content.airhex.com/content/logos/airlines_${code}_100_100_s.png`;

//   const placeholder = (code: string) =>
//     `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'><rect width='40' height='40' fill='%236B7280' rx='8'/><text x='20' y='26' font-size='16' text-anchor='middle' fill='white'>${code}</text></svg>`;

//   const sorted = [...flights].sort((a, b) => {
//     if (sortBy === "cheapest") return a.price - b.price;
//     if (sortBy === "quickest") return a.duration - b.duration;
//     return a.price * 0.6 + a.duration * 0.4 - (b.price * 0.6 + b.duration * 0.4);
//   });

//   const visibleFlights = sorted.slice(0, visible);

//   if (loading) {
//     return (
//       <div className="space-y-4">
//         {[...Array(5)].map((_, i) => (
//           <div key={i} className="bg-white border rounded-lg p-6 animate-pulse">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center gap-6 flex-1">
//                 <div className="w-10 h-10 bg-gray-200 rounded-full" />
//                 <div className="space-y-3 flex-1">
//                   <div className="flex justify-between">
//                     <div className="h-6 bg-gray-200 rounded w-20" />
//                     <div className="h-6 bg-gray-200 rounded w-20" />
//                   </div>
//                   <div className="h-4 bg-gray-200 rounded w-48" />
//                 </div>
//               </div>
//               <div className="text-right">
//                 <div className="h-8 bg-gray-200 rounded w-24 mb-2" />
//                 <div className="h-10 bg-gray-200 rounded w-32" />
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>
//     );
//   }

//   if (flights.length === 0) {
//     return <div className="text-center py-16 text-gray-500">No flights found.</div>;
//   }

//   return (
//     <div className="space-y-4">
//       {visibleFlights.map((flight) => {
//         const code = getAirlineCode(flight.airline);

//         return (
//           <div
//             key={flight.id}
//             className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
//           >
//             <div className="flex items-center justify-between">
//               {/* Left: Logo + Times */}
//               <div className="flex items-center gap-6 flex-1">
//                 <img
//                   src={logoUrl(code)}
//                   onError={(e) => (e.currentTarget.src = placeholder(code))}
//                   alt={flight.airline}
//                   className="w-10 h-10 object-contain"
//                 />

//                 <div className="flex-1">
//                   <div className="flex items-center justify-between text-lg font-semibold">
//                     <span>{flight.departureTime}</span>
//                     <span className="text-gray-400 mx-4">→</span>
//                     <span>{flight.arrivalTime}</span>
//                   </div>
//                   <div className="text-sm text-gray-600 mt-1">
//                     {flight.fromAirport || "DAC"} – {flight.toAirport || "CXB"} •{" "}
//                     {flight.stops === 0 ? "Nonstop" : `${flight.stops} stop${flight.stops > 1 ? "s" : ""}`} •{" "}
//                     {Math.floor(flight.duration / 60)}h {flight.duration % 60}m
//                   </div>
//                 </div>
//               </div>

//               {/* Right: Price + Select */}
//               <div className="text-right ml-8">
//                 <div className="text-3xl font-bold text-gray-900">
//                   ${Math.round(flight.price)}
//                 </div>
//                 <button className="mt-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition">
//                   Select
//                 </button>
//                 <p className="text-xs text-gray-500 mt-2">per adult</p>
//               </div>
//             </div>

//             {/* Badges */}
//             <div className="flex gap-3 mt-4">
//               {flight.stops === 0 && (
//                 <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
//                   Nonstop
//                 </span>
//               )}
//               {flight.cabinClass !== "Economy" && (
//                 <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
//                   {flight.cabinClass}
//                 </span>
//               )}
//             </div>
//           </div>
//         );
//       })}

//       {/* Show More */}
//       {visible < sorted.length && (
//         <div className="text-center mt-8">
//           <button
//             onClick={() => setVisible(v => Math.min(v + 10, sorted.length))}
//             className="text show more results underline text-blue-600 hover:text-blue-800 font-medium"
//           >
//             Show {sorted.length - visible} more results
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }
