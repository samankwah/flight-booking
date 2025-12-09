// src/components/skeletons/SkeletonList.tsx
import SkeletonFlightCard from "./SkeletonCard";

export default function SkeletonList({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {[...Array(count)].map((_, i) => (
        <SkeletonFlightCard key={i} />
      ))}
    </div>
  );
}
