import React, { useState, useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MdFavorite as Heart, MdExpandMore as ChevronDown, MdCalendarToday as Calendar } from "react-icons/md";
import { searchFlightInspiration } from "../services/exploreApi";
import toast from "react-hot-toast";

delete (L.Icon.Default.prototype as any)._getIconUrl;

interface Deal {
  id: string;
  city: string;
  country: string;
  airport: string;
  price: number;
  dates?: string;
  departureDate?: string;
  returnDate?: string;
  stops?: string;
  image?: string;
  liked: boolean;
  lat?: number;
  lng?: number;
  duration?: string;
  origin?: string;
}

// Airport location data mapping
const airportLocations: {[key: string]: {city: string; country: string; lat: number; lng: number; image: string}} = {
  "LOS": { city: "Lagos", country: "Nigeria", lat: 6.5244, lng: 3.3792, image: "https://images.unsplash.com/photo-1569940929339-5a97b0e49874?w=400&q=80" },
  "ABJ": { city: "Abidjan", country: "Ivory Coast", lat: 5.36, lng: -4.0083, image: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=400&q=80" },
  "DSS": { city: "Dakar", country: "Senegal", lat: 14.6928, lng: -17.4467, image: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=400&q=80" },
  "NBO": { city: "Nairobi", country: "Kenya", lat: -1.2921, lng: 36.8219, image: "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=400&q=80" },
  "LHR": { city: "London", country: "United Kingdom", lat: 51.5074, lng: -0.1278, image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&q=80" },
  "DXB": { city: "Dubai", country: "UAE", lat: 25.2048, lng: 55.2708, image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&q=80" },
  "JFK": { city: "New York", country: "USA", lat: 40.7128, lng: -74.006, image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&q=80" },
  "CMN": { city: "Casablanca", country: "Morocco", lat: 33.5731, lng: -7.5898, image: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=400&q=80" },
  "CDG": { city: "Paris", country: "France", lat: 48.8566, lng: 2.3522, image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&q=80" },
  "CAI": { city: "Cairo", country: "Egypt", lat: 30.0444, lng: 31.2357, image: "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=400&q=80" },
  "CPT": { city: "Cape Town", country: "South Africa", lat: -33.9249, lng: 18.4241, image: "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=400&q=80" },
  "IST": { city: "Istanbul", country: "Turkey", lat: 41.0082, lng: 28.9784, image: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=400&q=80" },
  "LAD": { city: "Luanda", country: "Angola", lat: -8.8383, lng: 13.2344, image: "https://images.unsplash.com/photo-1590955256461-fef91b38f8c1?w=400&q=80" },
  "ACC": { city: "Accra", country: "Ghana", lat: 5.6037, lng: -0.1870, image: "https://images.unsplash.com/photo-1568633686273-f18f1ce85b3c?w=400&q=80" },
};

const ExplorePage: React.FC = () => {
  const [origin, setOrigin] = useState("ACC");
  const [originDisplay, setOriginDisplay] = useState("Accra (ACC)");
  const [destination, setDestination] = useState("");
  const [dealsList, setDealsList] = useState<Deal[]>([]);
  const [hoveredDealId, setHoveredDealId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [showStopsMenu, setShowStopsMenu] = useState(false);
  const [showPriceMenu, setShowPriceMenu] = useState(false);
  const [showDurationMenu, setShowDurationMenu] = useState(false);
  const [showTripTypeMenu, setShowTripTypeMenu] = useState(false);
  const [showDateMenu, setShowDateMenu] = useState(false);
  const [selectedStops, setSelectedStops] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 20000 });
  const [selectedDuration, setSelectedDuration] = useState<string[]>([]);
  const [selectedTripType, setSelectedTripType] = useState("roundtrip");
  const [tripDuration, setTripDuration] = useState("any");

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});

  // Fetch flight inspiration data
  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const apiData = await searchFlightInspiration(origin);

        // Transform API data to Deal format with location info
        const transformedDeals: Deal[] = apiData.map((dest) => {
          const locationData = airportLocations[dest.airport] || {
            city: dest.city,
            country: dest.country,
            lat: 0,
            lng: 0,
            image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&q=80"
          };

          const departureDate = new Date(dest.departureDate);
          const returnDate = dest.returnDate ? new Date(dest.returnDate) : null;

          return {
            id: dest.id,
            city: locationData.city,
            country: locationData.country,
            airport: dest.airport,
            price: dest.price,
            dates: `${departureDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}${returnDate ? ` – ${returnDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : ''}`,
            departureDate: dest.departureDate,
            returnDate: dest.returnDate,
            stops: "Nonstop", // Amadeus API doesn't provide this in inspiration search
            image: locationData.image,
            liked: false,
            lat: locationData.lat,
            lng: locationData.lng,
            origin: dest.origin,
          };
        });

        setDealsList(transformedDeals);
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching destinations:", err);
        setError("Failed to load destinations. Please try again later.");
        toast.error("Failed to load flight destinations");
        setIsLoading(false);
      }
    };

    fetchDestinations();
  }, [origin]);

  // Initialize map once
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false,
    }).setView([7.9465, -1.0232], 3);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "",
      subdomains: "abc",
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  // Add markers when dealsList changes
  useEffect(() => {
    if (!mapRef.current || dealsList.length === 0) return;

    const map = mapRef.current;

    // Clear existing markers
    Object.values(markersRef.current).forEach(marker => marker.remove());
    markersRef.current = {};

    // Origin coordinates (Accra)
    const originLat = 7.9465;
    const originLng = -1.0232;

    dealsList.forEach((deal) => {
      if (!deal.lat || !deal.lng) return; // Skip if no coordinates

      // Draw flight path line
      const flightPath = L.polyline(
        [
          [originLat, originLng],
          [deal.lat, deal.lng],
        ],
        {
          color: "#06b6d4",
          weight: 1.5,
          opacity: 0.4,
          dashArray: "5, 5",
        }
      ).addTo(map);

      const marker = L.marker([deal.lat, deal.lng], {
        icon: L.divIcon({
          className: "price-marker",
          html: `<div class="price-marker-content" data-deal-id="${
            deal.id
          }" style="background:#fff;color:#000;font-weight:600;padding:6px 12px;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.25);font-size:13px;white-space:nowrap;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;border:1px solid rgba(0,0,0,0.08);transform:rotate(-2deg);transition:all 0.2s;">GHS ${deal.price.toLocaleString()}</div>`,
          iconSize: [100, 32],
          iconAnchor: [50, 40],
        }),
      }).addTo(map);

      marker.on("click", () => {
        document.getElementById(`deal-${deal.id}`)?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      });

      markersRef.current[deal.id] = marker;
    });
  }, [dealsList]);

  useEffect(() => {
    if (hoveredDealId) {
      const markerElement = document.querySelector(
        `[data-deal-id="${hoveredDealId}"]`
      ) as HTMLElement;
      if (markerElement) {
        markerElement.style.transform = "rotate(-2deg) scale(1.15)";
        markerElement.style.boxShadow = "0 4px 16px rgba(0,0,0,0.35)";
        markerElement.style.zIndex = "1000";
      }
    } else {
      document.querySelectorAll(".price-marker-content").forEach((el) => {
        (el as HTMLElement).style.transform = "rotate(-2deg) scale(1)";
        (el as HTMLElement).style.boxShadow = "0 2px 8px rgba(0,0,0,0.25)";
        (el as HTMLElement).style.zIndex = "auto";
      });
    }
  }, [hoveredDealId]);

  const toggleLike = (id: string) => {
    setDealsList((prev) =>
      prev.map((deal) =>
        deal.id === id ? { ...deal, liked: !deal.liked } : deal
      )
    );
  };

  // Helper function to extract duration in minutes
  const getDurationInMinutes = (duration?: string): number => {
    if (!duration) return 0;
    const hours = duration.match(/(\d+)h/);
    const minutes = duration.match(/(\d+)m/);
    return (hours ? parseInt(hours[1]) * 60 : 0) + (minutes ? parseInt(minutes[1]) : 0);
  };

  // Filter deals based on selected criteria
  const filteredDeals = dealsList.filter((deal) => {
    // Filter by destination search
    if (destination && !deal.city.toLowerCase().includes(destination.toLowerCase()) &&
        !deal.country.toLowerCase().includes(destination.toLowerCase())) {
      return false;
    }

    // Filter by stops
    if (selectedStops.length > 0) {
      if (selectedStops.includes("nonstop") && deal.stops !== "Nonstop") return false;
      if (selectedStops.includes("1stop") && deal.stops !== "1 stop") return false;
    }

    // Filter by price
    if (deal.price < priceRange.min || deal.price > priceRange.max) return false;

    // Filter by duration
    if (selectedDuration.length > 0) {
      const durationMins = getDurationInMinutes(deal.duration);
      let matchesDuration = false;
      if (selectedDuration.includes("short") && durationMins < 180) matchesDuration = true;
      if (selectedDuration.includes("medium") && durationMins >= 180 && durationMins < 360) matchesDuration = true;
      if (selectedDuration.includes("long") && durationMins >= 360) matchesDuration = true;
      if (!matchesDuration) return false;
    }

    return true;
  });

  const SkeletonCard = () => (
    <div className="p-2.5 flex gap-2.5 animate-pulse border-t border-gray-200">
      <div className="w-[60px] h-[60px] bg-gray-200 rounded-lg flex-shrink-0" />
      <div className="flex-1">
        <div className="h-4 bg-gray-200 rounded w-20 mb-1.5" />
        <div className="h-3 bg-gray-200 rounded w-24 mb-1" />
        <div className="h-3 bg-gray-200 rounded w-16 mb-2" />
        <div className="h-4 bg-gray-200 rounded w-16" />
      </div>
    </div>
  );

  return (
    <div className="relative h-screen bg-gray-50 overflow-y-hidden">
      {/* Map Container - Full Screen Background */}
      <div className="absolute inset-0">
        <div ref={mapContainerRef} className="w-full h-full" />
      </div>

      {/* Floating Sidebar */}
      <div className="absolute left-2 top-2 w-full md:w-[200px] z-[900] pointer-events-none">
        <div className="bg-white rounded-2xl shadow-2xl flex flex-col max-h-[calc(100vh-80px)] pointer-events-auto overflow-hidden">
          {/* Search Header */}
          <div className="flex-shrink-0 p-2.5 bg-white border-b border-gray-200 rounded-md relative z-10 overflow-visible">
            <div className="space-y-2">
              {/* Origin and Destination Inputs */}
              <div className="flex flex-col gap-1.5">
                <div className="relative">
                  <input
                    type="text"
                    value={originDisplay}
                    onChange={(e) => {
                      setOriginDisplay(e.target.value);
                      // Extract airport code if format is "City (CODE)"
                      const match = e.target.value.match(/\(([A-Z]{3})\)/);
                      if (match) {
                        setOrigin(match[1]);
                      }
                    }}
                    className="w-full px-2.5 py-1.5 bg-gray-50 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:bg-white border-0 transition"
                    placeholder="From?"
                  />
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="Where to?"
                    className="w-full px-2.5 py-1.5 bg-gray-50 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:bg-white border-0 transition"
                  />
                </div>
              </div>

              {/* Date/Duration Selector */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowDateMenu(!showDateMenu);
                    setShowStopsMenu(false);
                    setShowPriceMenu(false);
                    setShowDurationMenu(false);
                    setShowTripTypeMenu(false);
                  }}
                  className="w-full px-2.5 py-1.5 bg-gray-50 rounded-lg text-xs text-left hover:bg-gray-100 border-0 transition font-medium text-gray-700 flex items-center justify-between"
                >
                  <span className="truncate">
                    {tripDuration === "any" && "Any time, 3-7 days"}
                    {tripDuration === "3-7" && "Any time, 3-7 days"}
                    {tripDuration === "weekend" && "Any weekend"}
                    {tripDuration === "week" && "Any time, 1 week"}
                  </span>
                  <Calendar className="w-3.5 h-3.5 flex-shrink-0 ml-1" />
                </button>
                {showDateMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-[9998]"
                      onClick={() => setShowDateMenu(false)}
                    />
                    <div className="absolute top-full mt-1 left-0 right-0 bg-white rounded-lg shadow-xl border border-gray-200 p-2.5 z-[9999]">
                      <div className="space-y-1.5">
                        {["any", "3-7", "weekend", "week"].map((duration) => (
                          <button
                            key={duration}
                            onClick={() => {
                              setTripDuration(duration);
                              setShowDateMenu(false);
                            }}
                            className={`w-full text-left px-2.5 py-2 rounded text-sm transition ${
                              tripDuration === duration
                                ? "bg-cyan-50 text-cyan-700 font-medium"
                                : "hover:bg-gray-50"
                            }`}
                          >
                            {duration === "any" && "Any time"}
                            {duration === "3-7" && "3-7 days"}
                            {duration === "weekend" && "Weekend"}
                            {duration === "week" && "1 week"}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-1.5 mt-2 pb-1">
              {/* Stops Filter */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowStopsMenu(!showStopsMenu);
                    setShowPriceMenu(false);
                    setShowDurationMenu(false);
                    setShowTripTypeMenu(false);
                    setShowDateMenu(false);
                  }}
                  className={`px-2 py-1 border rounded-md text-[11px] whitespace-nowrap flex items-center gap-1 transition-all font-medium ${
                    selectedStops.length > 0
                      ? "bg-gray-900 border-gray-900 text-white"
                      : "bg-white hover:bg-gray-50 border-gray-300"
                  }`}
                >
                  <span>
                    Stops
                  </span>
                  <ChevronDown className={`w-2.5 h-2.5 transition-transform ${showStopsMenu ? 'rotate-180' : ''}`} />
                </button>
                {showStopsMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-[9998]"
                      onClick={() => setShowStopsMenu(false)}
                    />
                    <div className="absolute top-full mt-1 left-0 bg-white rounded-lg shadow-xl border border-gray-200 p-2.5 w-48 z-[9999]">
                      <div className="space-y-1.5">
                        <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                          <input
                            type="checkbox"
                            checked={selectedStops.includes("nonstop")}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedStops([...selectedStops, "nonstop"]);
                              } else {
                                setSelectedStops(selectedStops.filter((s) => s !== "nonstop"));
                              }
                            }}
                            className="w-3.5 h-3.5 text-cyan-600 rounded"
                          />
                          <span className="text-sm">Nonstop only</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                          <input
                            type="checkbox"
                            checked={selectedStops.includes("1stop")}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedStops([...selectedStops, "1stop"]);
                              } else {
                                setSelectedStops(selectedStops.filter((s) => s !== "1stop"));
                              }
                            }}
                            className="w-3.5 h-3.5 text-cyan-600 rounded"
                          />
                          <span className="text-sm">1 stop</span>
                        </label>
                      </div>
                      <div className="mt-2.5 pt-2.5 border-t flex gap-2">
                        <button
                          onClick={() => setSelectedStops([])}
                          className="flex-1 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded"
                        >
                          Clear
                        </button>
                        <button
                          onClick={() => setShowStopsMenu(false)}
                          className="flex-1 px-2.5 py-1.5 text-xs font-medium bg-cyan-600 text-white rounded hover:bg-cyan-700"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Price Filter */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowPriceMenu(!showPriceMenu);
                    setShowStopsMenu(false);
                    setShowDurationMenu(false);
                    setShowTripTypeMenu(false);
                    setShowDateMenu(false);
                  }}
                  className={`px-2 py-1 border rounded-md text-[11px] whitespace-nowrap flex items-center gap-1 transition-all font-medium ${
                    priceRange.max < 20000
                      ? "bg-gray-900 border-gray-900 text-white"
                      : "bg-white hover:bg-gray-50 border-gray-300"
                  }`}
                >
                  <span>Price</span>
                  <ChevronDown className={`w-2.5 h-2.5 transition-transform ${showPriceMenu ? 'rotate-180' : ''}`} />
                </button>
                {showPriceMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-[9998]"
                      onClick={() => setShowPriceMenu(false)}
                    />
                    <div className="absolute top-full mt-1 left-0 bg-white rounded-lg shadow-xl border border-gray-200 p-2.5 w-56 z-[9999]">
                      <div className="space-y-2.5">
                        <div>
                          <label className="text-xs font-medium text-gray-600 block mb-2">
                            Max: ${priceRange.max.toLocaleString()}
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="20000"
                            step="500"
                            value={priceRange.max}
                            onChange={(e) =>
                              setPriceRange({
                                ...priceRange,
                                max: parseInt(e.target.value),
                              })
                            }
                            className="w-full h-2 bg-gray-200 rounded appearance-none cursor-pointer accent-cyan-600"
                          />
                        </div>
                        <div className="flex gap-2 text-xs text-gray-600">
                          <span>$0</span>
                          <span className="ml-auto">$20k+</span>
                        </div>
                      </div>
                      <div className="mt-2.5 pt-2.5 border-t flex gap-2">
                        <button
                          onClick={() => setPriceRange({ min: 0, max: 20000 })}
                          className="flex-1 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded"
                        >
                          Clear
                        </button>
                        <button
                          onClick={() => setShowPriceMenu(false)}
                          className="flex-1 px-2.5 py-1.5 text-xs font-medium bg-cyan-600 text-white rounded hover:bg-cyan-700"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Flight Duration Filter */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowDurationMenu(!showDurationMenu);
                    setShowStopsMenu(false);
                    setShowPriceMenu(false);
                    setShowTripTypeMenu(false);
                    setShowDateMenu(false);
                  }}
                  className={`px-2 py-1 border rounded-md text-[11px] whitespace-nowrap flex items-center gap-1 transition-all font-medium ${
                    selectedDuration.length > 0
                      ? "bg-gray-900 border-gray-900 text-white"
                      : "bg-white hover:bg-gray-50 border-gray-300"
                  }`}
                >
                  <span>Flight dur.</span>
                  <ChevronDown className={`w-2.5 h-2.5 transition-transform ${showDurationMenu ? 'rotate-180' : ''}`} />
                </button>
                {showDurationMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-[9998]"
                      onClick={() => setShowDurationMenu(false)}
                    />
                    <div className="absolute top-full mt-1 left-0 bg-white rounded-lg shadow-xl border border-gray-200 p-2.5 w-48 z-[9999]">
                      <div className="space-y-1.5">
                        <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                          <input
                            type="checkbox"
                            checked={selectedDuration.includes("short")}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedDuration([...selectedDuration, "short"]);
                              } else {
                                setSelectedDuration(selectedDuration.filter((d) => d !== "short"));
                              }
                            }}
                            className="w-3.5 h-3.5 text-cyan-600 rounded"
                          />
                          <span className="text-sm">Under 3 hours</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                          <input
                            type="checkbox"
                            checked={selectedDuration.includes("medium")}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedDuration([...selectedDuration, "medium"]);
                              } else {
                                setSelectedDuration(selectedDuration.filter((d) => d !== "medium"));
                              }
                            }}
                            className="w-3.5 h-3.5 text-cyan-600 rounded"
                          />
                          <span className="text-sm">3-6 hours</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                          <input
                            type="checkbox"
                            checked={selectedDuration.includes("long")}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedDuration([...selectedDuration, "long"]);
                              } else {
                                setSelectedDuration(selectedDuration.filter((d) => d !== "long"));
                              }
                            }}
                            className="w-3.5 h-3.5 text-cyan-600 rounded"
                          />
                          <span className="text-sm">6+ hours</span>
                        </label>
                      </div>
                      <div className="mt-2.5 pt-2.5 border-t flex gap-2">
                        <button
                          onClick={() => setSelectedDuration([])}
                          className="flex-1 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded"
                        >
                          Clear
                        </button>
                        <button
                          onClick={() => setShowDurationMenu(false)}
                          className="flex-1 px-2.5 py-1.5 text-xs font-medium bg-cyan-600 text-white rounded hover:bg-cyan-700"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Trip Type Filter */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowTripTypeMenu(!showTripTypeMenu);
                    setShowStopsMenu(false);
                    setShowPriceMenu(false);
                    setShowDurationMenu(false);
                    setShowDateMenu(false);
                  }}
                  className="px-2 py-1 border border-gray-300 rounded-md text-[11px] whitespace-nowrap bg-white flex items-center gap-1 transition-all font-medium hover:bg-gray-50"
                >
                  <span>Type</span>
                  <ChevronDown className={`w-2.5 h-2.5 transition-transform ${showTripTypeMenu ? 'rotate-180' : ''}`} />
                </button>
                {showTripTypeMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-[9998]"
                      onClick={() => setShowTripTypeMenu(false)}
                    />
                    <div className="absolute top-full mt-1 left-0 bg-white rounded-lg shadow-xl border border-gray-200 p-2.5 w-44 z-[9999]">
                      <div className="space-y-1.5">
                        <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                          <input
                            type="radio"
                            name="tripType"
                            checked={selectedTripType === "roundtrip"}
                            onChange={() => setSelectedTripType("roundtrip")}
                            className="w-3.5 h-3.5 text-cyan-600"
                          />
                          <span className="text-sm">Round trip</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                          <input
                            type="radio"
                            name="tripType"
                            checked={selectedTripType === "oneway"}
                            onChange={() => setSelectedTripType("oneway")}
                            className="w-3.5 h-3.5 text-cyan-600"
                          />
                          <span className="text-sm">One way</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                          <input
                            type="radio"
                            name="tripType"
                            checked={selectedTripType === "multicity"}
                            onChange={() => setSelectedTripType("multicity")}
                            className="w-3.5 h-3.5 text-cyan-600"
                          />
                          <span className="text-sm">Multi-city</span>
                        </label>
                      </div>
                      <div className="mt-2.5 pt-2.5 border-t">
                        <button
                          onClick={() => setShowTripTypeMenu(false)}
                          className="w-full px-2.5 py-1.5 text-xs font-medium bg-cyan-600 text-white rounded hover:bg-cyan-700"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Deals List */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : error ? (
              <div className="p-8 text-center text-red-500">
                <p className="text-lg font-medium mb-2">Error loading flights</p>
                <p className="text-sm">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"
                >
                  Retry
                </button>
              </div>
            ) : filteredDeals.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p className="text-lg font-medium mb-2">No flights found</p>
                <p className="text-sm">Try adjusting your filters or changing your origin</p>
              </div>
            ) : (
              filteredDeals.map((deal, index) => (
                <div
                  key={deal.id}
                  id={`deal-${deal.id}`}
                  onMouseEnter={() => setHoveredDealId(deal.id)}
                  onMouseLeave={() => setHoveredDealId(null)}
                  className={`hover:bg-gray-100 cursor-pointer transition-all duration-200 ${
                    index !== 0 ? "border-t border-gray-200" : ""
                  } ${hoveredDealId === deal.id ? "bg-blue-50" : ""}`}
                >
                  <div className="p-2.5 flex gap-2.5 items-center">
                    {/* Image */}
                    <div className="relative flex-shrink-0">
                      <img
                        src={deal.image}
                        alt={deal.city}
                        className="w-[60px] h-[60px] rounded-lg object-cover"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-sm text-gray-900 mb-0.5 truncate leading-tight">
                            {deal.city}
                          </h3>
                          <p className="text-[11px] text-gray-600 mb-0.5">
                            {deal.dates}
                          </p>
                          <p className="text-[11px] text-gray-500">{deal.stops}</p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleLike(deal.id);
                          }}
                          className="flex-shrink-0 p-0.5 hover:bg-white rounded-full transition"
                        >
                          <Heart
                            className={`w-4 h-4 ${
                              deal.liked
                                ? "fill-red-500 text-red-500"
                                : "text-gray-400"
                            }`}
                          />
                        </button>
                      </div>
                      <div className="mt-1">
                        <p className="font-bold text-base text-gray-900">
                          ${deal.price}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Zoom Controls */}
      <div className="absolute bottom-6 right-6 flex flex-col shadow-xl rounded-lg overflow-hidden z-40">
        <button
          onClick={() => mapRef.current?.zoomIn()}
          className="w-11 h-11 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-700 text-2xl font-light border-b border-gray-200 transition"
        >
          +
        </button>
        <button
          onClick={() => mapRef.current?.zoomOut()}
          className="w-11 h-11 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-700 text-2xl font-light transition"
        >
          −
        </button>
      </div>

      <style>{`
        .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .leaflet-popup-content {
          margin: 0;
        }
        .leaflet-popup-tip {
          display: none;
        }

        /* Custom scrollbar */
        .overflow-y-auto::-webkit-scrollbar {
          width: 6px;
        }
        .overflow-y-auto::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }
        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: #a1a1a1;
        }

        /* Hide scrollbar for filter buttons */
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        @media (max-width: 768px) {
          .leaflet-control-zoom {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default ExplorePage;
