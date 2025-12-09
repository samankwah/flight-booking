import { create } from "zustand";
import { FlightFilters } from "../types/filters";

interface FilterStore {
  filters: FlightFilters;
  setFilters: (filters: FlightFilters) => void;
  updateFilter: <K extends keyof FlightFilters>(
    key: K,
    value: FlightFilters[K]
  ) => void;
  resetFilters: () => void;
}

const initialFilters: FlightFilters = {
  airlines: [],
  maxStops: undefined,
  priceRange: { min: 0, max: 10000 },
  sortBy: "best",
  hideBasicTickets: false,
  maxFlightDuration: 1440, // 24 hours
  alliances: [],
};

export const useFilterStore = create<FilterStore>((set) => ({
  filters: initialFilters,
  setFilters: (filters) => set({ filters }),
  updateFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value },
    })),
  resetFilters: () => set({ filters: initialFilters }),
}));
