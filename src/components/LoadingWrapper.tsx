// src/components/LoadingWrapper.tsx
import { ReactNode } from "react";
import SkeletonList from "./skeletons/SkeletonList";

interface Props {
  loading: boolean;
  error?: string | null;
  children: ReactNode;
  skeletonCount?: number;
}

function LoadingWrapper({
  loading,
  error,
  children,
  skeletonCount = 5,
}: Props) {
  if (loading) {
    return <SkeletonList count={skeletonCount} />;
  }

  if (error) {
    return (
      <div className="text-center py-16 bg-white rounded-lg border border-red-200">
        <p className="text-red-600 font-medium text-lg">Error: {error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 text-blue-600 underline font-medium"
        >
          Try again
        </button>
      </div>
    );
  }

  return <>{children}</>;
}

export default LoadingWrapper;
