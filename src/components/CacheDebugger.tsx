import React, { useState, useEffect } from 'react';
import { cache } from '../utils/cache';

/**
 * Cache Debugger Component
 * Shows cache statistics and allows manual cache management
 * Only visible in development mode
 */
export const CacheDebugger: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [cacheStats, setCacheStats] = useState({
    flightCacheSize: 0,
    airportCacheSize: 0,
    totalSize: 0,
  });

  // Only show in development
  if (import.meta.env.PROD) {
    return null;
  }

  const updateStats = () => {
    let flightCount = 0;
    let airportCount = 0;
    let total = 0;

    // Count cache entries
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        total++;
        if (key.startsWith('flights:')) flightCount++;
        if (key.startsWith('airports:')) airportCount++;
      }
    }

    setCacheStats({
      flightCacheSize: flightCount,
      airportCacheSize: airportCount,
      totalSize: total,
    });
  };

  useEffect(() => {
    updateStats();

    // Update stats every 2 seconds when open
    const interval = setInterval(() => {
      if (isOpen) updateStats();
    }, 2000);

    return () => clearInterval(interval);
  }, [isOpen]);

  const clearFlightCache = () => {
    cache.clearNamespace('flights', 'localStorage');
    updateStats();
    console.log('✅ Flight cache cleared');
  };

  const clearAirportCache = () => {
    cache.clearNamespace('airports', 'localStorage');
    updateStats();
    console.log('✅ Airport cache cleared');
  };

  const clearAllCache = () => {
    localStorage.clear();
    updateStats();
    console.log('✅ All cache cleared');
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-gray-800 text-white px-3 py-2 rounded-full shadow-lg hover:bg-gray-700 transition-colors z-50 text-sm"
        title="Cache Debugger (Dev Only)"
      >
        🗄️ Cache
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-xl p-4 z-50 w-80">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-gray-800">Cache Debugger</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      <div className="space-y-3">
        {/* Stats */}
        <div className="bg-gray-50 p-3 rounded">
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-600">Flight Cache:</span>
              <span className="font-semibold">{cacheStats.flightCacheSize} entries</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Airport Cache:</span>
              <span className="font-semibold">{cacheStats.airportCacheSize} entries</span>
            </div>
            <div className="flex justify-between border-t pt-1 mt-1">
              <span className="text-gray-600">All Entries:</span>
              <span className="font-semibold">{cacheStats.totalSize} entries</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <button
            onClick={clearFlightCache}
            className="w-full bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 transition-colors text-sm"
          >
            Clear Flight Cache
          </button>
          <button
            onClick={clearAirportCache}
            className="w-full bg-purple-500 text-white px-3 py-2 rounded hover:bg-purple-600 transition-colors text-sm"
          >
            Clear Airport Cache
          </button>
          <button
            onClick={clearAllCache}
            className="w-full bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 transition-colors text-sm"
          >
            Clear All Cache
          </button>
        </div>

        {/* Info */}
        <div className="text-xs text-gray-500 border-t pt-2">
          <p>💡 Cache persists across page reloads</p>
          <p>💡 Flight cache: 2min TTL</p>
          <p>💡 Airport cache: 1hr TTL</p>
        </div>
      </div>
    </div>
  );
};
