// src/utils/imageOptimization.ts

/**
 * Image Optimization Utilities
 * Handles CDN URLs, responsive images, and format conversion
 */

// CDN Configuration
const CDN_BASE_URL = import.meta.env.VITE_CDN_URL || '';
const USE_CDN = import.meta.env.VITE_USE_CDN === 'true';

/**
 * Get optimized image URL from CDN or local
 */
export const getImageUrl = (
  path: string,
  options?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'jpeg' | 'png' | 'auto';
  }
): string => {
  // If using CDN (Cloudflare, Cloudinary, etc.)
  if (USE_CDN && CDN_BASE_URL) {
    const params = new URLSearchParams();

    if (options?.width) params.append('w', options.width.toString());
    if (options?.height) params.append('h', options.height.toString());
    if (options?.quality) params.append('q', options.quality.toString());
    if (options?.format) params.append('f', options.format);

    const queryString = params.toString();
    return `${CDN_BASE_URL}${path}${queryString ? `?${queryString}` : ''}`;
  }

  // Return local path
  return path;
};

/**
 * Generate srcset for responsive images
 */
export const generateSrcSet = (
  basePath: string,
  widths: number[] = [320, 640, 768, 1024, 1280, 1920]
): string => {
  return widths
    .map((width) => {
      const url = getImageUrl(basePath, { width, quality: 80, format: 'auto' });
      return `${url} ${width}w`;
    })
    .join(', ');
};

/**
 * Generate sizes attribute for responsive images
 */
export const generateSizes = (breakpoints?: {
  [key: string]: string;
}): string => {
  const defaultBreakpoints = {
    '(max-width: 640px)': '100vw',
    '(max-width: 1024px)': '50vw',
    '(max-width: 1280px)': '33vw',
  };

  const sizes = breakpoints || defaultBreakpoints;
  const sizeStrings = Object.entries(sizes).map(([media, size]) => `${media} ${size}`);
  sizeStrings.push('25vw'); // Default size

  return sizeStrings.join(', ');
};

/**
 * Preload critical images
 */
export const preloadImage = (src: string, priority: 'high' | 'low' = 'high'): void => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = src;
  link.fetchPriority = priority;
  document.head.appendChild(link);
};

/**
 * Convert image to WebP if supported
 */
export const supportsWebP = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const webP = new Image();
    webP.onload = () => resolve(webP.width === 1);
    webP.onerror = () => resolve(false);
    webP.src = 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=';
  });
};

/**
 * Get optimized airline logo URL
 */
export const getAirlineLogoUrl = (
  airlineCode: string,
  size: 'small' | 'medium' | 'large' = 'medium'
): string => {
  const sizes = {
    small: 40,
    medium: 80,
    large: 120,
  };

  const width = sizes[size];

  // Use Clearbit logo API or local logos
  if (import.meta.env.VITE_USE_LOGO_API === 'true') {
    return `https://logo.clearbit.com/${airlineCode.toLowerCase()}.com?size=${width}`;
  }

  // Return local airline logo path
  return getImageUrl(`/images/airlines/${airlineCode}.png`, {
    width,
    quality: 90,
    format: 'webp',
  });
};

/**
 * Lazy load images using Intersection Observer
 */
export const setupLazyLoading = (): void => {
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          const src = img.dataset.src;

          if (src) {
            img.src = src;
            img.classList.remove('lazy');
            img.classList.add('loaded');
            observer.unobserve(img);
          }
        }
      });
    });

    document.querySelectorAll('img.lazy').forEach((img) => {
      imageObserver.observe(img);
    });
  } else {
    // Fallback for browsers without Intersection Observer
    document.querySelectorAll('img.lazy').forEach((img) => {
      const image = img as HTMLImageElement;
      const src = image.dataset.src;
      if (src) {
        image.src = src;
        image.classList.remove('lazy');
        image.classList.add('loaded');
      }
    });
  }
};

/**
 * Image compression quality based on device
 */
export const getOptimalQuality = (): number => {
  // Check if on slow connection
  const connection = (navigator as any).connection;
  if (connection) {
    const { effectiveType, saveData } = connection;

    if (saveData) return 60; // Data saver mode
    if (effectiveType === 'slow-2g' || effectiveType === '2g') return 50;
    if (effectiveType === '3g') return 70;
  }

  // Check device pixel ratio
  const dpr = window.devicePixelRatio || 1;
  if (dpr > 2) return 75; // High DPI displays
  if (dpr > 1.5) return 80;

  return 85; // Default quality
};

/**
 * Create blur placeholder for images
 */
export const createBlurPlaceholder = (width: number, height: number): string => {
  // Generate a tiny base64 encoded SVG as placeholder
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <filter id="blur">
        <feGaussianBlur stdDeviation="5" />
      </filter>
      <rect width="100%" height="100%" fill="#e5e7eb" filter="url(#blur)" />
    </svg>
  `;

  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

/**
 * Initialize image optimization on page load
 */
export const initImageOptimization = (): void => {
  // Setup lazy loading
  setupLazyLoading();

  // Preload critical above-the-fold images
  const heroImages = document.querySelectorAll('[data-priority="high"]');
  heroImages.forEach((img) => {
    const src = (img as HTMLImageElement).src;
    if (src) preloadImage(src, 'high');
  });
};

// Auto-initialize when module is imported
if (typeof window !== 'undefined' && document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initImageOptimization);
} else if (typeof window !== 'undefined') {
  initImageOptimization();
}
