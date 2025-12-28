// src/components/skeletons/FlightCardSkeleton.tsx
export default function FlightCardSkeleton() {
  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border animate-pulse">
      <div className="flex flex-col sm:grid sm:grid-cols-12 gap-4 sm:gap-6">
        {/* Airline Logo */}
        <div className="flex justify-center sm:col-span-2">
          <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gray-200 rounded-xl sm:rounded-2xl" />
        </div>

        {/* Departure Info */}
        <div className="sm:col-span-3 space-y-3">
          <div className="h-6 sm:h-8 bg-gray-200 rounded w-20 sm:w-24" />
          <div className="h-4 sm:h-5 bg-gray-200 rounded w-12 sm:w-16" />
        </div>

        {/* Middle Spacer */}
        <div className="hidden sm:block sm:col-span-1" />

        {/* Arrival Info */}
        <div className="sm:col-span-3 space-y-3">
          <div className="h-6 sm:h-8 bg-gray-200 rounded w-20 sm:w-24" />
          <div className="h-4 sm:h-5 bg-gray-200 rounded w-12 sm:w-16" />
        </div>

        {/* Price & Button */}
        <div className="sm:col-span-3 sm:text-right space-y-3">
          <div className="h-8 sm:h-10 bg-gray-200 rounded w-24 sm:w-32 sm:ml-auto" />
          <div className="h-10 sm:h-12 bg-gray-200 rounded w-full sm:w-40 sm:ml-auto" />
        </div>
      </div>
    </div>
  );
}
