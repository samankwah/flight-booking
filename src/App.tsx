import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Header from "./components/Header";
import Footer from "./components/Footer";
import LoadingWrapper from "./components/LoadingWrapper";
import PWAInstallBanner from "./components/PWAInstallBanner";
import NotificationInitializer from "./components/NotificationInitializer";
import { CacheDebugger } from "./components/CacheDebugger";
import { PWAUpdateNotification } from "./components/PWAUpdateNotification";
import { OfflineIndicator } from "./components/OfflineIndicator";

// Eagerly loaded components (critical for initial render)
import HomePage from "./pages/HomePage";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

// Lazy-loaded components (code splitting)
const ContactUs = lazy(() => import("./pages/support/ContactUs"));
const FAQ = lazy(() => import("./pages/support/FAQ"));
const LiveChat = lazy(() => import("./pages/support/LiveChat"));
const SupportLayout = lazy(() => import("./components/SupportLayout"));
const ExplorePage = lazy(() => import("./pages/ExplorePage"));
const LoginPage = lazy(() => import("./features/auth/components/LoginPage"));
const RegisterPage = lazy(() => import("./features/auth/components/RegisterPage"));
const FlightSearchPage = lazy(() => import("./pages/FlightSearchPage"));
const HotelSearchPage = lazy(() => import("./pages/HotelSearchPage"));
const HolidayPackagePage = lazy(() => import("./pages/HolidayPackagePage"));
const BookingPage = lazy(() => import("./pages/BookingPage"));
const ConfirmationPage = lazy(() => import("./pages/ConfirmationPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const AdminDashboardPage = lazy(() => import("./pages/AdminDashboardPage"));
const SpecialOffersPage = lazy(() => import("./pages/SpecialOffersPage"));
const SpecialOfferDetailPage = lazy(() => import("./pages/SpecialOfferDetailPage"));
const TopDealsPage = lazy(() => import("./pages/TopDealsPage"));
const TopDealDetailPage = lazy(() => import("./pages/TopDealDetailPage"));
const UniversitiesPage = lazy(() => import("./pages/UniversitiesPage"));
const UniversityDetailPage = lazy(() => import("./pages/UniversityDetailPage"));
const VisaResults = lazy(() => import("./pages/VisaResults"));
const VisaApplication = lazy(() => import("./pages/VisaApplication"));
const VisaConfirmation = lazy(() => import("./pages/VisaConfirmation"));

const App: React.FC = () => {
  return (
    <Router>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <NotificationInitializer />
        <Header />
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-screen">
              <LoadingWrapper loading={true} error={null}>
                <div></div>
              </LoadingWrapper>
            </div>
          }
        >
          <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />{" "}
          {/* HomePage is now public */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/explore" element={<ExplorePage />} />{" "}
          {/* ExplorePage is now public */}
          <Route path="/confirmation" element={<ConfirmationPage />} />{" "}
          {/* ConfirmationPage is public */}
          <Route path="/flights" element={<FlightSearchPage />} />
          <Route path="/hotels" element={<HotelSearchPage />} />
          <Route path="/packages" element={<HolidayPackagePage />} />
          <Route path="/visa/results" element={<VisaResults />} />
          <Route path="/visa/apply" element={<VisaApplication />} />
          <Route path="/visa/confirmation" element={<VisaConfirmation />} />
          <Route path="/offers" element={<SpecialOffersPage />} />
          <Route path="/offer/:id" element={<SpecialOfferDetailPage />} />
          <Route path="/deals" element={<TopDealsPage />} />
          <Route path="/deal/:id" element={<TopDealDetailPage />} />
          <Route path="/universities" element={<UniversitiesPage />} />
          <Route path="/university/:id" element={<UniversityDetailPage />} />
          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/booking" element={<BookingPage />} />{" "}
            {/* BookingPage is protected */}
            <Route path="/dashboard" element={<DashboardPage />} />{" "}
            {/* Protected Dashboard */}
          </Route>
          {/* Admin Routes */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
          </Route>
          {/* Support Routes with Layout */}
          <Route
            path="/support"
            element={
              <SupportLayout>
                <div className="container mx-auto px-4 py-16 text-center">
                  <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                    Customer Support
                  </h1>
                  <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                    Welcome to our support center. How can we help you today?
                  </p>
                </div>
              </SupportLayout>
            }
          />
          <Route
            path="/support/contact"
            element={
              <SupportLayout>
                <ContactUs />
              </SupportLayout>
            }
          />
          <Route
            path="/support/faq"
            element={
              <SupportLayout>
                <FAQ />
              </SupportLayout>
            }
          />
          <Route
            path="/support/chat"
            element={
              <SupportLayout>
                <LiveChat />
              </SupportLayout>
            }
          />
        </Routes>
        </Suspense>
        <Footer />
        <PWAInstallBanner />
        <PWAUpdateNotification />
        <OfflineIndicator />
        <CacheDebugger />
      </main>
    </Router>
  );
};

export default App;
