import React from "react";

const featuredAirlines = [
  // Global majors
  { iataCode: "AA", name: "American Airlines" },
  { iataCode: "DL", name: "Delta Air Lines" },
  { iataCode: "UA", name: "United Airlines" },
  { iataCode: "BA", name: "British Airways" },
  { iataCode: "LH", name: "Lufthansa" },
  { iataCode: "AF", name: "Air France" },
  { iataCode: "KL", name: "KLM" },
  { iataCode: "EK", name: "Emirates" },
  { iataCode: "QR", name: "Qatar Airways" },
  { iataCode: "TK", name: "Turkish Airlines" },
  { iataCode: "SQ", name: "Singapore Airlines" },
  { iataCode: "EY", name: "Etihad Airways" },

  // Africa & Domestic Partners (New Additions)
  { iataCode: "AW", name: "Africa World Airlines" },
  { iataCode: "OP", name: "Passion Air" },
  { iataCode: "KP", name: "ASKY Airlines" },
  { iataCode: "ET", name: "Ethiopian Airlines" },
  { iataCode: "WB", name: "RwandAir" },
  { iataCode: "KQ", name: "Kenya Airways" },
  { iataCode: "W3", name: "Arik Air" },
  { iataCode: "P4", name: "Air Peace" },
];

const FeaturedPartners: React.FC = () => {
  const getAirlineLogoUrl = (iataCode: string): string => {
    // Primary source - Kiwi.com has reliable airline logos
    return `https://images.kiwi.com/airlines/128/${iataCode}.png`;
  };

  const getPlaceholderSvg = (iataCode: string, airlineName: string): string => {
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
    const color = colors[iataCode.charCodeAt(0) % colors.length];

    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 80'%3E%3Crect width='200' height='80' fill='${encodeURIComponent(
      color
    )}' rx='8'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='32' fill='white' font-weight='bold' font-family='system-ui, -apple-system, sans-serif'%3E${iataCode}%3C/text%3E%3C/svg%3E`;
  };

  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement>,
    iataCode: string,
    airlineName: string
  ) => {
    const img = e.currentTarget;

    // Track which fallback we're on using a data attribute
    const attemptedFallbacks = img.dataset.attempted
      ? parseInt(img.dataset.attempted)
      : 0;

    const fallbacks = [
      `https://images.kiwi.com/airlines/128/${iataCode}.png`, // Primary (already loaded)
      `https://www.gstatic.com/flights/airline_logos/70px/${iataCode}.png`, // Google Flights
      `https://pics.avs.io/200/100/${iataCode}.png`, // AVS
      `https://www.flightaware.com/images/airline_logos/90p/${iataCode}.png`, // FlightAware
      `https://www.cleartrip.com/resources/images/air-logos/${iataCode}.png`, // Cleartrip
      getPlaceholderSvg(iataCode, airlineName), // Final fallback
    ];

    const nextIndex = attemptedFallbacks + 1;

    if (nextIndex < fallbacks.length) {
      img.dataset.attempted = nextIndex.toString();
      img.src = fallbacks[nextIndex];
    }
  };

  return (
    <section className="py-16 bg-white dark:bg-gray-900 overflow-hidden">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-4xl font-bold text-center mb-3 text-gray-900 dark:text-white">
          Featured Partners
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-center font-semibold mb-12 text-lg">
          Domestic & International Flight Partner for you
        </p>

        {/* Infinite Scroll Container */}
        <div className="relative w-full">
          {/* Gradient Overlays */}
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white dark:from-gray-900 to-transparent z-10 pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white dark:from-gray-900 to-transparent z-10 pointer-events-none"></div>

          {/* Scrolling Track */}
          <div className="flex overflow-hidden">
            <div className="flex animate-scroll hover:pause-animation">
              {/* First set of logos */}
              {featuredAirlines.map((airline, index) => (
                <div
                  key={`${airline.iataCode}-1-${index}`}
                  className="flex-shrink-0 mx-0 flex items-center justify-center h-20 w-32"
                >
                  <img
                    src={getAirlineLogoUrl(airline.iataCode)}
                    alt={airline.name}
                    className="max-h-16 max-w-full w-auto object-contain opacity-90 hover:opacity-100 transition-all duration-300 cursor-pointer hover:scale-105"
                    onError={(e) =>
                      handleImageError(e, airline.iataCode, airline.name)
                    }
                    loading="lazy"
                    title={airline.name}
                  />
                </div>
              ))}
              {/* Duplicate set for seamless loop */}
              {featuredAirlines.map((airline, index) => (
                <div
                  key={`${airline.iataCode}-2-${index}`}
                  className="flex-shrink-0 mx-3 flex items-center justify-center h-20 w-32"
                >
                  <img
                    src={getAirlineLogoUrl(airline.iataCode)}
                    alt={airline.name}
                    className="max-h-16 max-w-full w-auto object-contain opacity-90 hover:opacity-100 transition-all duration-300 cursor-pointer hover:scale-105"
                    onError={(e) =>
                      handleImageError(e, airline.iataCode, airline.name)
                    }
                    loading="lazy"
                    title={airline.name}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-scroll {
          animation: scroll 80s linear infinite;
        }

        .hover\\:pause-animation:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
};

export default FeaturedPartners;
