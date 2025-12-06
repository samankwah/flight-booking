import React, { useState, useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Heart, ChevronDown, Search } from "lucide-react";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl });

interface Deal {
  id: string;
  city: string;
  country: string;
  airport: string;
  price: number;
  dates: string;
  stops: string;
  image: string;
  liked: boolean;
  lat: number;
  lng: number;
}

const deals: Deal[] = [
  {
    id: "1",
    city: "Lagos",
    country: "Nigeria",
    airport: "LOS",
    price: 3250,
    dates: "Jan 15 – Jan 22",
    stops: "Nonstop",
    image:
      "https://images.unsplash.com/photo-1569940929339-5a97b0e49874?w=400&q=80",
    liked: false,
    lat: 6.5244,
    lng: 3.3792,
  },
  {
    id: "2",
    city: "Abidjan",
    country: "Ivory Coast",
    airport: "ABJ",
    price: 4180,
    dates: "Feb 10 – Feb 17",
    stops: "Nonstop",
    image:
      "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=400&q=80",
    liked: false,
    lat: 5.36,
    lng: -4.0083,
  },
  {
    id: "3",
    city: "Dakar",
    country: "Senegal",
    airport: "DSS",
    price: 5890,
    dates: "Mar 5 – Mar 12",
    stops: "1 stop",
    image:
      "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=400&q=80",
    liked: false,
    lat: 14.6928,
    lng: -17.4467,
  },
  {
    id: "4",
    city: "Nairobi",
    country: "Kenya",
    airport: "NBO",
    price: 7650,
    dates: "Mar 20 – Mar 27",
    stops: "1 stop",
    image:
      "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=400&q=80",
    liked: false,
    lat: -1.2921,
    lng: 36.8219,
  },
  {
    id: "5",
    city: "London",
    country: "United Kingdom",
    airport: "LHR",
    price: 9240,
    dates: "Apr 8 – Apr 15",
    stops: "Nonstop",
    image:
      "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&q=80",
    liked: false,
    lat: 51.5074,
    lng: -0.1278,
  },
  {
    id: "6",
    city: "Dubai",
    country: "UAE",
    airport: "DXB",
    price: 11500,
    dates: "May 1 – May 8",
    stops: "1 stop",
    image:
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&q=80",
    liked: false,
    lat: 25.2048,
    lng: 55.2708,
  },
  {
    id: "7",
    city: "New York",
    country: "USA",
    airport: "JFK",
    price: 13800,
    dates: "Jun 10 – Jun 17",
    stops: "1 stop",
    image:
      "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&q=80",
    liked: false,
    lat: 40.7128,
    lng: -74.006,
  },
  {
    id: "8",
    city: "Casablanca",
    country: "Morocco",
    airport: "CMN",
    price: 6420,
    dates: "Feb 25 – Mar 4",
    stops: "1 stop",
    image:
      "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=400&q=80",
    liked: false,
    lat: 33.5731,
    lng: -7.5898,
  },
];

const ExplorePage: React.FC = () => {
  const [origin, setOrigin] = useState("Accra (ACC)");
  const [destination, setDestination] = useState("");
  const [dealsList, setDealsList] = useState(deals);
  const [hoveredDealId, setHoveredDealId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setIsLoading(false), 800);
  }, []);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false,
    }).setView([7.9465, -1.0232], 4);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "",
      subdomains: "abc",
      maxZoom: 19,
    }).addTo(map);

    dealsList.forEach((deal) => {
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

    mapRef.current = map;

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

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

  const SkeletonCard = () => (
    <div className="p-4 flex gap-4 animate-pulse">
      <div className="w-28 h-28 bg-gray-200 rounded-xl flex-shrink-0" />
      <div className="flex-1">
        <div className="h-5 bg-gray-200 rounded w-24 mb-2" />
        <div className="h-4 bg-gray-200 rounded w-32 mb-2" />
        <div className="h-3 bg-gray-200 rounded w-20" />
      </div>
      <div className="h-6 bg-gray-200 rounded w-20" />
    </div>
  );

  return (
    <div className="relative h-screen bg-gray-50 overflow-y-hidden">
      {/* Map Container - Full Screen Background */}
      <div className="absolute inset-0">
        <div ref={mapContainerRef} className="w-full h-full" />
      </div>

      {/* Floating Sidebar */}
      <div className="absolute left-0 top-0 bottom-0 w-full md:w-auto z-[999] flex flex-col pointer-events-none">
        <div className="bg-white md:m-4 md:rounded-2xl shadow-2xl flex flex-col h-full md:h-auto md:max-h-[calc(100vh-2rem] overflow-hidden pointer-events-auto">
          {/* Search Header */}
          <div className="flex-shrink-0 p-4 bg-white border-b border-gray-200 rounded-md">
            <div className="space-y-3">
              {/* Origin and Destination Inputs */}
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white border-0 transition"
                    placeholder="From?"
                  />
                </div>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="Where to?"
                    className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white border-0 transition"
                  />
                  {/* <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /> */}
                </div>
              </div>

              {/* Date/Duration Selector */}
              <button className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm text-left hover:bg-gray-100 border-0 transition font-medium text-gray-700">
                Any time, any duration
              </button>
            </div>

            {/* Filters */}
            <div className="flex gap-2 mt-4 overflow-x-auto pb-4">
              <button className="px-4 py-2 border rounded-lg text-xs whitespace-nowrap hover:bg-gray-50 flex items-center gap-1.5 bg-white transition font-medium">
                <span>Stops</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              <button className="px-4 py-2 border rounded-lg text-xs whitespace-nowrap hover:bg-gray-50 flex items-center gap-1.5 bg-white transition font-medium">
                <span>Price</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              <button className="px-4 py-2 border rounded-lg text-xs whitespace-nowrap bg-white flex items-center gap-1.5 transition font-semibold">
                <span>Flight duration</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              <button className="px-4 py-2 border rounded-lg text-xs whitespace-nowrap bg-white flex items-center gap-1.5 transition font-semibold">
                <span>Type of trip</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Deals List */}
          <div className="flex-1 align-middle overflow-y-auto ">
            {isLoading ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : (
              dealsList.map((deal, index) => (
                <div
                  key={deal.id}
                  id={`deal-${deal.id}`}
                  onMouseEnter={() => setHoveredDealId(deal.id)}
                  onMouseLeave={() => setHoveredDealId(null)}
                  className={`hover:bg-gray-200 cursor-pointer transition-all duration-200 ${
                    index !== 0 ? "border m-2 rounded-xl border-gray-200" : ""
                  } ${hoveredDealId === deal.id ? "bg-blue-50" : ""}`}
                >
                  <div className="p-4 flex gap-4 items-center">
                    {/* Image */}
                    <div className="relative flex-shrink-0">
                      <img
                        src={deal.image}
                        alt={deal.city}
                        className="w-28 h-28 rounded-xl object-cover shadow-sm"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 flex flex-col">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-lg text-gray-900 mb-0.5 truncate">
                            {deal.city}
                          </h3>
                          <p className="text-sm text-gray-600 mb-0.5">
                            {deal.dates}
                          </p>
                          <p className="text-xs text-gray-500">{deal.stops}</p>
                        </div>
                        <div className="flex flex-col items-end">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleLike(deal.id);
                            }}
                            className="flex-shrink-0 p-2 hover:bg-white rounded-full transition"
                          >
                            <Heart
                              className={`w-5 h-5 ${
                                deal.liked
                                  ? "fill-red-500 text-red-500"
                                  : "text-gray-400"
                              }`}
                            />
                          </button>
                          <div className="mt-auto">
                            <p className="font-bold text-2xl text-gray-900">
                              GHS {deal.price.toLocaleString()}
                            </p>
                          </div>{" "}
                        </div>
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
      `}</style>
    </div>
  );
};

export default ExplorePage;
