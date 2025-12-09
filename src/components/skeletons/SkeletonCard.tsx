// src/components/skeletons/SkeletonCard.tsx
export default function SkeletonFlightCard() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6 flex-1">
          {/* Logo */}
          <div className="w-10 h-10 bg-gray-200 rounded-full" />

          {/* Times & Path */}
          <div className="flex-1 space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-7 bg-gray-200 rounded w-24" />
              <div className="h-7 bg-gray-200 rounded w-24" />
            </div>
            <div className="h-4 bg-gray-200 rounded w-64" />
            <div className="h-3 bg-gray-200 rounded w-48" />
          </div>
        </div>

        {/* Price */}
        <div className="text-right space-y-3">
          <div className="h-10 bg-gray-200 rounded w-28" />
          <div className="h-11 bg-gray-300 rounded-lg w-36" />
        </div>
      </div>
    </div>
  );
}
