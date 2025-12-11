// src/components/LoadingWrapper.tsx
import { ReactNode } from "react";
import { SearchResultsSkeleton, HeroSearchSkeleton } from "./SkeletonLoader";

interface Props {
  loading: boolean;
  error?: string | null;
  children: ReactNode;
  skeletonType?: "flight" | "hotel" | "package" | "hero" | "default";
  skeletonCount?: number;
}

function LoadingWrapper({
  loading,
  error,
  children,
  skeletonType = "default",
  skeletonCount = 5,
}: Props) {
  if (loading) {
    if (skeletonType === "hero") {
      return <HeroSearchSkeleton />;
    }

    return <SearchResultsSkeleton count={skeletonCount} type={skeletonType} />;
  }

  if (error) {
    return (
      <div className="text-center py-8 sm:py-12 lg:py-16 bg-white rounded-lg border border-red-200 mx-4 sm:mx-0">
        <div className="max-w-md mx-auto px-4">
          <div className="text-red-500 text-4xl sm:text-5xl mb-4">⚠️</div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
            Something went wrong
          </h3>
          <p className="text-red-600 font-medium text-sm sm:text-base mb-4">
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-red-700 transition text-sm sm:text-base font-medium"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default LoadingWrapper;
