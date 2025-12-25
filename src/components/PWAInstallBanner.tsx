// src/components/PWAInstallBanner.tsx
import React, { useState, useEffect } from 'react';
import { MdClose, MdGetApp } from 'react-icons/md';
import { showInstallPrompt, setupInstallPrompt, isPWA } from '../utils/pwa';

const PWAInstallBanner: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    // Don't show banner if already installed or user dismissed it recently
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    const dismissedTime = dismissed ? parseInt(dismissed) : 0;
    const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);

    if (isPWA() || daysSinceDismissed < 7) {
      return;
    }

    // Setup install prompt listener
    setupInstallPrompt((canInstall) => {
      setShowBanner(canInstall);
    });
  }, []);

  const handleInstall = async () => {
    setInstalling(true);

    try {
      const result = await showInstallPrompt();

      if (result === 'accepted') {
        setShowBanner(false);
      } else if (result === 'dismissed') {
        handleDismiss();
      }
    } catch (error) {
      console.error('Install error:', error);
    } finally {
      setInstalling(false);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  if (!showBanner) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-2xl z-50 animate-slide-up">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="bg-white rounded-full p-2">
            <MdGetApp className="w-6 h-6 text-cyan-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm sm:text-base">Install Flight Booking App</h3>
            <p className="text-xs sm:text-sm opacity-90">
              Get quick access and work offline
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleInstall}
            disabled={installing}
            className="bg-white text-cyan-600 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-cyan-50 transition disabled:opacity-50"
          >
            {installing ? 'Installing...' : 'Install'}
          </button>
          <button
            onClick={handleDismiss}
            className="p-2 hover:bg-white/10 rounded-lg transition"
            aria-label="Dismiss"
          >
            <MdClose className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallBanner;

// CSS for animation (add to your global styles or Tailwind config)
const styles = `
@keyframes slide-up {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.animate-slide-up {
  animation: slide-up 0.3s ease-out;
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}
