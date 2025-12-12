import { useFilterStore } from "../store/filterStore";
import { useMemo } from "react";

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  const { filters, updateFilter, resetFilters } = useFilterStore();

  const airlines = [
    { code: "UL", name: "SriLankan Airlines" },
    { code: "AI", name: "Air India" },
    { code: "KU", name: "Kuwait Airways" },
    { code: "MS", name: "EgyptAir" },
    { code: "GF", name: "Gulf Air" },
    { code: "BG", name: "Biman Bangladesh" },
  ];

  const alliances = [
    { id: "oneworld", name: "oneworld" },
    { id: "SkyTeam", name: "SkyTeam" },
    { id: "Star Alliance", name: "Star Alliance" },
  ];

  const checkedAirlines = useMemo(
    () => filters.airlines || [],
    [filters.airlines]
  );

  const toggleAirline = (code: string) => {
    const newAirlines = checkedAirlines.includes(code)
      ? checkedAirlines.filter((a) => a !== code)
      : [...checkedAirlines, code];
    updateFilter("airlines", newAirlines);
  };

  const toggleAlliance = (alliance: string) => {
    const newAlliances = (filters.alliances || []).includes(alliance)
      ? (filters.alliances || []).filter((a) => a !== alliance)
      : [...(filters.alliances || []), alliance];
    updateFilter("alliances", newAlliances);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
          <h2 className="text-lg font-bold">Filters</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Reset All Button */}
          <div className="flex justify-end">
            <button
              onClick={() => resetFilters()}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Reset All
            </button>
          </div>

          {/* Price Range Filter */}
          <div className="space-y-3 border-b pb-4">
            <h3 className="font-semibold text-gray-900">Price Range</h3>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-xs text-gray-600 mb-1">Min ($)</label>
                <input
                  type="number"
                  min="0"
                  value={filters.priceRange?.min || 0}
                  onChange={(e) =>
                    updateFilter("priceRange", {
                      min: parseInt(e.target.value) || 0,
                      max: filters.priceRange?.max || 10000,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs text-gray-600 mb-1">Max ($)</label>
                <input
                  type="number"
                  max="50000"
                  value={filters.priceRange?.max || 10000}
                  onChange={(e) =>
                    updateFilter("priceRange", {
                      min: filters.priceRange?.min || 0,
                      max: parseInt(e.target.value) || 10000,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Stops Filter */}
          <div className="space-y-3 border-b pb-4">
            <h3 className="font-semibold text-gray-900">Stops</h3>
            <div className="space-y-2">
              {[
                { value: 0, label: "Nonstop" },
                { value: 1, label: "1 Stop" },
                { value: 2, label: "2+ Stops" },
              ].map(({ value, label }) => (
                <label
                  key={value}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={
                      filters.maxStops === undefined || filters.maxStops >= value
                    }
                    onChange={(e) => {
                      updateFilter(
                        "maxStops",
                        e.target.checked
                          ? Math.max(filters.maxStops || 0, value)
                          : undefined
                      );
                    }}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Airlines Filter */}
          <div className="space-y-3 border-b pb-4">
            <h3 className="font-semibold text-gray-900">Airlines</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {airlines.map(({ code, name }) => (
                <label
                  key={code}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={checkedAirlines.includes(code)}
                    onChange={() => toggleAirline(code)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{name}</span>
                  <span className="text-xs text-gray-500 ml-auto">({code})</span>
                </label>
              ))}
            </div>
          </div>

          {/* Alliances Filter */}
          <div className="space-y-3 border-b pb-4">
            <h3 className="font-semibold text-gray-900">Alliance</h3>
            <div className="space-y-2">
              {alliances.map(({ id, name }) => (
                <label key={id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={(filters.alliances || []).includes(id)}
                    onChange={() => toggleAlliance(id)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Flight Duration Filter */}
          <div className="space-y-3 border-b pb-4">
            <h3 className="font-semibold text-gray-900">Max Duration</h3>
            <div className="space-y-2">
              <div>
                <label className="block text-xs text-gray-600 mb-2">
                  {Math.floor((filters.maxFlightDuration || 1440) / 60)}h{" "}
                  {(filters.maxFlightDuration || 1440) % 60}m
                </label>
                <input
                  type="range"
                  min="60"
                  max="1440"
                  value={filters.maxFlightDuration || 1440}
                  onChange={(e) =>
                    updateFilter("maxFlightDuration", parseInt(e.target.value))
                  }
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1h</span>
                  <span>24h</span>
                </div>
              </div>
            </div>
          </div>

          {/* Hide Basic Tickets */}
          <div className="space-y-3 border-b pb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.hideBasicTickets || false}
                onChange={(e) => updateFilter("hideBasicTickets", e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-900">
                Hide Basic Tickets
              </span>
            </label>
          </div>

          {/* Sort By */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Sort By</h3>
            <select
              value={filters.sortBy || "best"}
              onChange={(e) => updateFilter("sortBy", e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="best">Best</option>
              <option value="cheapest">Cheapest</option>
              <option value="fastest">Fastest</option>
            </select>
          </div>
        </div>

        {/* Apply Filters Button */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
          <button
            onClick={onClose}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-all"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}
