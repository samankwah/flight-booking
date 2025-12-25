// src/components/OptimizedImage.tsx
import React, { useState, useEffect, useRef } from 'react';
import { generateSrcSet, generateSizes, getImageUrl, getOptimalQuality } from '../utils/imageOptimization';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  loading?: 'lazy' | 'eager';
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
  fallbackSrc?: string;
  responsive?: boolean;
  srcSet?: string;
  sizes?: string;
  quality?: number;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
}

/**
 * OptimizedImage Component
 *
 * Features:
 * - Lazy loading with Intersection Observer
 * - WebP format support with fallback
 * - Responsive image loading
 * - Loading placeholder
 * - Error fallback
 */
const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  width,
  height,
  loading = 'lazy',
  priority = false,
  onLoad,
  onError,
  fallbackSrc = '/images/placeholder.png',
  responsive = true,
  srcSet,
  sizes,
  quality,
  objectFit = 'cover',
}) => {
  const [imageSrc, setImageSrc] = useState<string | null>(priority ? src : null);
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const imgRef = useRef<HTMLImageElement>(null);

  // Generate responsive srcSet if not provided
  const responsiveSrcSet = responsive && !srcSet ? generateSrcSet(src) : srcSet;
  const responsiveSizes = responsive && !sizes ? generateSizes() : sizes;
  const imageQuality = quality || getOptimalQuality();

  // Convert image URL to WebP if supported
  const getWebPUrl = (url: string): string => {
    // If already WebP or is a data URL, return as is
    if (url.endsWith('.webp') || url.startsWith('data:')) return url;

    // For local images, try to replace extension with .webp
    // For production, you'd have a CDN that serves WebP versions
    const webpUrl = url.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    return webpUrl;
  };

  // Check if browser supports WebP
  const supportsWebP = (): boolean => {
    const canvas = document.createElement('canvas');
    if (canvas.getContext && canvas.getContext('2d')) {
      return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    }
    return false;
  };

  useEffect(() => {
    // If priority image, load immediately
    if (priority) {
      setImageSrc(src);
      return;
    }

    // Intersection Observer for lazy loading
    if (!imgRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Load the image when it enters viewport
            const imageToLoad = supportsWebP() ? getWebPUrl(src) : src;
            setImageSrc(imageToLoad);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before entering viewport
        threshold: 0.01,
      }
    );

    observer.observe(imgRef.current);

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, [src, priority]);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setImageError(true);
    setIsLoading(false);
    setImageSrc(fallbackSrc);
    onError?.();
  };

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ width: width ? `${width}px` : '100%', height: height ? `${height}px` : 'auto' }}
    >
      {/* Loading placeholder */}
      {isLoading && !imageError && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <svg
            className="w-10 h-10 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      )}

      {/* Actual image */}
      <img
        ref={imgRef}
        src={imageSrc || undefined}
        srcSet={responsiveSrcSet}
        sizes={responsiveSizes}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        onLoad={handleLoad}
        onError={handleError}
        className={`transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        } ${className}`}
        style={{
          objectFit,
          width: '100%',
          height: '100%',
        }}
      />

      {/* Error state */}
      {imageError && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <svg
              className="w-12 h-12 mx-auto mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-xs">Image unavailable</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;

/**
 * Usage Examples:
 *
 * // Basic usage
 * <OptimizedImage src="/images/flight.jpg" alt="Flight" />
 *
 * // With dimensions
 * <OptimizedImage
 *   src="/images/hotel.jpg"
 *   alt="Hotel"
 *   width={400}
 *   height={300}
 * />
 *
 * // Priority image (above the fold)
 * <OptimizedImage
 *   src="/images/hero.jpg"
 *   alt="Hero"
 *   priority
 *   loading="eager"
 * />
 *
 * // With fallback
 * <OptimizedImage
 *   src="/images/destination.jpg"
 *   alt="Destination"
 *   fallbackSrc="/images/default-destination.jpg"
 * />
 */
