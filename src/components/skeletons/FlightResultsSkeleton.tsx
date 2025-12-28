// src/components/skeletons/FlightResultsSkeleton.tsx
import FlightCardSkeleton from "./FlightCardSkeleton";

interface FlightResultsSkeletonProps {
  count?: number;
}

export default function FlightResultsSkeleton({ count = 5 }: FlightResultsSkeletonProps) {
  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      {Array.from({ length: count }).map((_, i) => (
        <FlightCardSkeleton key={i} />
      ))}
    </div>
  );
}
