// src/components/skeletons/TabsSkeleton.tsx
export default function TabsSkeleton() {
  return (
    <div className="flex bg-gray-100 rounded-lg p-1 shadow-sm overflow-x-auto animate-pulse">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex flex-col px-3 py-2 rounded-md whitespace-nowrap"
        >
          <div className="flex items-center gap-1.5 mb-1">
            <div className="h-4 bg-gray-200 rounded w-16" />
          </div>
          <div className="h-3 bg-gray-200 rounded w-24" />
        </div>
      ))}
    </div>
  );
}
