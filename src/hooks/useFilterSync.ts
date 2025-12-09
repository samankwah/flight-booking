// // src/hooks/useFilterSync.ts
// import { useEffect } from "react";
// import { useSearchParams } from "react-router-dom";
// import { useFilterStore } from "../store/filterStore";
// import { FlightFilters } from "../types/filters";

// export function useFilterSync() {
//   const [searchParams, setSearchParams] = useSearchParams();
//   const { filters, setFilters } = useFilterStore();

//   // Read filters from URL on mount
//   useEffect(() => {
//     const urlFilters: FlightFilters = {
//       airlines: searchParams.get("airlines")?.split(",") || undefined,
//       maxStops: searchParams.get("maxStops")
//         ? parseInt(searchParams.get("maxStops")!)
//         : undefined,
//       sortBy: (searchParams.get("sortBy") as any) || "best",
//       priceRange:
//         searchParams.get("priceMin") && searchParams.get("priceMax")
//           ? {
//               min: parseInt(searchParams.get("priceMin")!),
//               max: parseInt(searchParams.get("priceMax")!),
//             }
//           : undefined,
//     };
//     setFilters(urlFilters);
//   }, []);

//   // Sync filters to URL when they change
//   useEffect(() => {
//     const newParams = new URLSearchParams(searchParams);

//     if (filters.airlines?.length) {
//       newParams.set("airlines", filters.airlines.join(","));
//     } else {
//       newParams.delete("airlines");
//     }

//     if (filters.maxStops !== undefined) {
//       newParams.set("maxStops", filters.maxStops.toString());
//     }

//     if (filters.priceRange) {
//       newParams.set("priceMin", filters.priceRange.min.toString());
//       newParams.set("priceMax", filters.priceRange.max.toString());
//     }

//     if (filters.sortBy) {
//       newParams.set("sortBy", filters.sortBy);
//     }

//     setSearchParams(newParams);
//   }, [filters]);
// }

import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useFilterStore } from "../store/filterStore";
import { FlightFilters } from "../types/filters";

export function useFilterSync() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { filters, setFilters } = useFilterStore();

  // Read filters from URL on mount
  useEffect(() => {
    const urlFilters: FlightFilters = {
      airlines: searchParams.get("airlines")?.split(",") || undefined,
      maxStops: searchParams.get("maxStops")
        ? parseInt(searchParams.get("maxStops")!)
        : undefined,
      sortBy: (searchParams.get("sortBy") as any) || "best",
      priceRange:
        searchParams.get("priceMin") && searchParams.get("priceMax")
          ? {
              min: parseInt(searchParams.get("priceMin")!),
              max: parseInt(searchParams.get("priceMax")!),
            }
          : undefined,
    };
    setFilters(urlFilters);
  }, [setSearchParams]);

  // Sync filters to URL when they change
  useEffect(() => {
    const newParams = new URLSearchParams(searchParams);

    if (filters.airlines?.length) {
      newParams.set("airlines", filters.airlines.join(","));
    } else {
      newParams.delete("airlines");
    }

    if (filters.maxStops !== undefined) {
      newParams.set("maxStops", filters.maxStops.toString());
    }

    if (filters.priceRange) {
      newParams.set("priceMin", filters.priceRange.min.toString());
      newParams.set("priceMax", filters.priceRange.max.toString());
    }

    if (filters.sortBy) {
      newParams.set("sortBy", filters.sortBy);
    }

    setSearchParams(newParams, { replace: true });
  }, [filters, setSearchParams]);
}
