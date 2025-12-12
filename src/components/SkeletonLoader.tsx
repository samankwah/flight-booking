// src/components/SkeletonLoader.tsx

import React from "react";

interface SkeletonLoaderProps {
  className?: string;
  variant?: "text" | "rectangular" | "circular" | "card" | "flight" | "hotel" | "package";
  width?: string | number;
  height?: string | number;
  lines?: number;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  className = "",
  variant = "rectangular",
  width,
  height,
  lines = 1,
}) => {
  const baseClasses = "bg-gray-200 animate-pulse rounded";

  if (variant === "text") {
    return (
      <div className={`${className}`}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={`${baseClasses} h-4 mb-2 ${
              index === lines - 1 ? "w-3/4" : "w-full"
            }`}
            style={{ width: width || undefined }}
          />
        ))}
      </div>
    );
  }

  if (variant === "circular") {
    return (
      <div
        className={`${baseClasses} ${className}`}
        style={{
          width: width || "40px",
          height: height || "40px",
          borderRadius: "50%",
        }}
      />
    );
  }

  if (variant === "card") {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="flex gap-4">
          <SkeletonLoader variant="rectangular" width="120px" height="120px" />
          <div className="flex-1 space-y-3">
            <SkeletonLoader variant="text" lines={2} />
            <SkeletonLoader variant="rectangular" width="100px" height="20px" />
            <SkeletonLoader variant="text" lines={1} />
          </div>
        </div>
      </div>
    );
  }

  if (variant === "flight") {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <SkeletonLoader variant="circular" width="32px" height="32px" />
          <div className="text-center">
            <SkeletonLoader variant="text" lines={1} width="80px" />
            <SkeletonLoader variant="text" lines={1} width="60px" className="mt-1" />
          </div>
          <SkeletonLoader variant="circular" width="32px" height="32px" />
        </div>
        <div className="flex justify-between items-center">
          <div className="text-left">
            <SkeletonLoader variant="text" lines={1} width="60px" />
            <SkeletonLoader variant="text" lines={1} width="100px" className="mt-1" />
          </div>
          <div className="text-center">
            <SkeletonLoader variant="text" lines={1} width="40px" />
            <div className="w-16 h-0.5 bg-gray-200 mx-auto mt-2"></div>
          </div>
          <div className="text-right">
            <SkeletonLoader variant="text" lines={1} width="60px" />
            <SkeletonLoader variant="text" lines={1} width="100px" className="mt-1" />
          </div>
        </div>
        <div className="flex justify-between items-center mt-4">
          <SkeletonLoader variant="rectangular" width="80px" height="24px" />
          <SkeletonLoader variant="rectangular" width="100px" height="32px" />
        </div>
      </div>
    );
  }

  if (variant === "hotel") {
    return (
      <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
        <SkeletonLoader variant="rectangular" width="100%" height="200px" className="rounded-none" />
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <SkeletonLoader variant="text" lines={2} />
              <div className="flex items-center gap-2 mt-2">
                <SkeletonLoader variant="circular" width="16px" height="16px" />
                <SkeletonLoader variant="text" lines={1} width="60px" />
              </div>
            </div>
            <SkeletonLoader variant="rectangular" width="80px" height="32px" />
          </div>
          <div className="flex gap-4 mb-4">
            <SkeletonLoader variant="rectangular" width="60px" height="20px" />
            <SkeletonLoader variant="rectangular" width="80px" height="20px" />
            <SkeletonLoader variant="rectangular" width="70px" height="20px" />
          </div>
          <SkeletonLoader variant="rectangular" width="120px" height="40px" />
        </div>
      </div>
    );
  }

  if (variant === "package") {
    return (
      <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
        <div className="p-6">
          <div className="flex gap-6">
            <SkeletonLoader variant="rectangular" width="320px" height="200px" />
            <div className="flex-1">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <SkeletonLoader variant="text" lines={2} />
                  <div className="flex items-center gap-4 mt-3">
                    <SkeletonLoader variant="text" lines={1} width="80px" />
                    <SkeletonLoader variant="text" lines={1} width="60px" />
                    <SkeletonLoader variant="text" lines={1} width="70px" />
                  </div>
                </div>
                <SkeletonLoader variant="rectangular" width="100px" height="40px" />
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <SkeletonLoader variant="text" lines={1} width="120px" />
                <SkeletonLoader variant="text" lines={2} className="mt-2" />
              </div>

              <div className="grid grid-cols-2 gap-2 mb-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <SkeletonLoader key={i} variant="text" lines={1} width="100px" />
                ))}
              </div>

              <SkeletonLoader variant="rectangular" width="150px" height="40px" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default rectangular variant
  return (
    <div
      className={`${baseClasses} ${className}`}
      style={{
        width: width || "100%",
        height: height || "20px",
      }}
    />
  );
};

// Specialized skeleton components for different sections
export const HeroSearchSkeleton: React.FC = () => (
  <div className="bg-white rounded-xl shadow-xl p-8">
    <div className="flex gap-4 mb-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <SkeletonLoader
          key={i}
          variant="rectangular"
          width="100px"
          height="40px"
          className={i === 0 ? "bg-cyan-200" : ""}
        />
      ))}
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-gray-50 p-4 rounded-lg">
          <SkeletonLoader variant="text" lines={1} width="60px" className="mb-2" />
          <SkeletonLoader variant="rectangular" width="100%" height="40px" />
        </div>
      ))}
    </div>
    <SkeletonLoader variant="rectangular" width="200px" height="48px" className="ml-auto" />
  </div>
);

export const FlightCardSkeleton: React.FC = () => <SkeletonLoader variant="flight" />;

export const HotelCardSkeleton: React.FC = () => <SkeletonLoader variant="hotel" />;

export const PackageCardSkeleton: React.FC = () => <SkeletonLoader variant="package" />;

export const SearchResultsSkeleton: React.FC<{ count?: number; type?: "flight" | "hotel" | "package" }> = ({
  count = 3,
  type = "flight"
}) => (
  <div className="space-y-6">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i}>
        {type === "flight" && <FlightCardSkeleton />}
        {type === "hotel" && <HotelCardSkeleton />}
        {type === "package" && <PackageCardSkeleton />}
      </div>
    ))}
  </div>
);

export default SkeletonLoader;








