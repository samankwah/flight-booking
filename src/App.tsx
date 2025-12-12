import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import HomePage from "./pages/HomePage";
import ContactUs from "./pages/support/ContactUs";
import FAQ from "./pages/support/FAQ";
import LiveChat from "./pages/support/LiveChat";
import SupportLayout from "./components/SupportLayout";
import ExplorePage from "./pages/ExplorePage";
import LoginPage from "./features/auth/components/LoginPage";
import RegisterPage from "./features/auth/components/RegisterPage";
import Footer from "./components/Footer";
import FlightSearchPage from "./pages/FlightSearchPage";
import HotelSearchPage from "./pages/HotelSearchPage";
import HolidayPackagePage from "./pages/HolidayPackagePage";
import BookingPage from "./pages/BookingPage"; // Import BookingPage
import ConfirmationPage from "./pages/ConfirmationPage"; // Import ConfirmationPage
import DashboardPage from "./pages/DashboardPage"; // Import DashboardPage
import ProtectedRoute from "./components/ProtectedRoute"; // Import ProtectedRoute
// import SpecialOffers from "./components/SpecialOffers";
import SpecialOffersPage from "./pages/SpecialOffersPage";
import TopDeals from "./components/TopDeals";
import VisaResults from "./pages/VisaResults";
import VisaApplication from "./pages/VisaApplication";
import VisaConfirmation from "./pages/VisaConfirmation";

const App: React.FC = () => {
  return (
    <Router>
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <Header />
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
          <Route path="/deals" element={<TopDeals />} />
          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/booking" element={<BookingPage />} />{" "}
            {/* BookingPage is protected */}
            <Route path="/dashboard" element={<DashboardPage />} />{" "}
            {/* Protected Dashboard */}
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
        <Footer />
      </main>
    </Router>
  );
};

export default App;
