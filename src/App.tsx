import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import HomePage from "./pages/HomePage";
import ContactUs from "./pages/support/ContactUs";
import FAQ from "./pages/support/FAQ";
import LiveChat from "./pages/support/LiveChat";
import SupportLayout from "./components/SupportLayout";
import ExplorePage from "./pages/ExplorePage";

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <Header />
        <Routes>
          {/* Home Route */}
          <Route path="/" element={<HomePage />} />

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
          <Route path="/explore" element={<ExplorePage />} />
          <Route
            path="/support/chat"
            element={
              <SupportLayout>
                <LiveChat />
              </SupportLayout>
            }
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
