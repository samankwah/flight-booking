import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { AuthProvider } from "./contexts/AuthContext.tsx"; // Import AuthProvider
import { LocalizationProvider } from "./contexts/LocalizationContext.tsx"; // Import LocalizationProvider
import { initPWA } from "./utils/pwa"; // Import PWA utilities
import { initDB } from "./utils/indexedDB"; // Import IndexedDB utilities
import { setupAutoSync } from "./utils/syncManager"; // Import sync manager

// Initialize IndexedDB
initDB()
  .then(() => {
    console.log("[App] IndexedDB initialized");
  })
  .catch((error) => {
    console.error("[App] Failed to initialize IndexedDB:", error);
  });

// Initialize auto-sync for offline functionality
setupAutoSync();
console.log("[App] Auto-sync initialized");

// Initialize PWA features
initPWA({
  onInstallable: (canInstall) => {
    console.log("[App] PWA installable:", canInstall);
  },
  onNetworkChange: (online) => {
    console.log("[App] Network status:", online ? "online" : "offline");

    // Show toast notification for network changes
    if (!online) {
      // You could show a toast/notification here
      console.warn("[App] You are now offline");
    }
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <LocalizationProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </LocalizationProvider>
  </StrictMode>
);
