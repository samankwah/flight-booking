// src/components/skeletons/SidebarSkeleton.tsx
export default function SidebarSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 space-y-6 sticky top-6 max-h-screen overflow-y-auto animate-pulse">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="h-6 bg-gray-200 rounded w-16" />
        <div className="h-5 bg-gray-200 rounded w-20" />
      </div>

      {/* Price Range Filter */}
      <div className="space-y-3 border-b pb-4">
        <div className="h-5 bg-gray-200 rounded w-24" />
        <div className="flex gap-2">
          <div className="flex-1 space-y-1">
            <div className="h-3 bg-gray-200 rounded w-12" />
            <div className="h-10 bg-gray-200 rounded" />
          </div>
          <div className="flex-1 space-y-1">
            <div className="h-3 bg-gray-200 rounded w-12" />
            <div className="h-10 bg-gray-200 rounded" />
          </div>
        </div>
      </div>

      {/* Stops Filter */}
      <div className="space-y-3 border-b pb-4">
        <div className="h-5 bg-gray-200 rounded w-16" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-200 rounded" />
              <div className="h-4 bg-gray-200 rounded w-20" />
            </div>
          ))}
        </div>
      </div>

      {/* Airlines Filter */}
      <div className="space-y-3 border-b pb-4">
        <div className="h-5 bg-gray-200 rounded w-20" />
        <div className="space-y-2 max-h-48">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-200 rounded" />
              <div className="h-4 bg-gray-200 rounded flex-1" />
              <div className="h-3 bg-gray-200 rounded w-8" />
            </div>
          ))}
        </div>
      </div>

      {/* Alliance Filter */}
      <div className="space-y-3 border-b pb-4">
        <div className="h-5 bg-gray-200 rounded w-20" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-200 rounded" />
              <div className="h-4 bg-gray-200 rounded w-28" />
            </div>
          ))}
        </div>
      </div>

      {/* Max Duration Filter */}
      <div className="space-y-3 border-b pb-4">
        <div className="h-5 bg-gray-200 rounded w-28" />
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded w-16" />
          <div className="h-2 bg-gray-200 rounded w-full" />
          <div className="flex justify-between">
            <div className="h-3 bg-gray-200 rounded w-6" />
            <div className="h-3 bg-gray-200 rounded w-8" />
          </div>
        </div>
      </div>

      {/* Hide Basic Tickets */}
      <div className="space-y-3 border-b pb-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-200 rounded" />
          <div className="h-4 bg-gray-200 rounded w-32" />
        </div>
      </div>

      {/* Sort By */}
      <div className="space-y-3">
        <div className="h-5 bg-gray-200 rounded w-16" />
        <div className="h-10 bg-gray-200 rounded" />
      </div>
    </div>
  );
}
