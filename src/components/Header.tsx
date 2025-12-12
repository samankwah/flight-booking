import React, { useState, useEffect, useRef } from "react";
import {
  MdMenu as Menu,
  MdFlight as Plane,
  MdClose as X,
  MdExpandMore as ChevronDown,
  MdPersonAdd as UserPlus,
  MdPersonRemove as UserMinus,
} from "react-icons/md";
import { Menu as HeadlessMenu, Transition } from "@headlessui/react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

interface Country {
  code: string;
  name: string;
  flag: string;
  label: string;
}

const countries: Country[] = [
  {
    code: "gha",
    name: "Ghana",
    flag: "https://flagcdn.com/32x24/gh.png",
    label: "English (GH)",
  },
  {
    code: "us",
    name: "USA",
    flag: "https://flagcdn.com/32x24/us.png",
    label: "English (US)",
  },
  {
    code: "gb",
    name: "UK",
    flag: "https://flagcdn.com/32x24/gb.png",
    label: "English (UK)",
  },
  {
    code: "de",
    name: "Germany",
    flag: "https://flagcdn.com/32x24/de.png",
    label: "Deutsch",
  },
  {
    code: "fr",
    name: "France",
    flag: "https://flagcdn.com/32x24/fr.png",
    label: "Français",
  },
  {
    code: "jp",
    name: "Japan",
    flag: "https://flagcdn.com/32x24/jp.png",
    label: "日本語",
  },
];

const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country>(countries[0]);
  const [mobileDropdowns, setMobileDropdowns] = useState({
    support: false,
    language: false,
  });
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        mobileMenuOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(e.target as Node)
      ) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mobileMenuOpen]);

  const toggleMobileDropdown = (key: "support" | "language") => {
    setMobileDropdowns((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleAuthAction = async () => {
    if (currentUser) {
      try {
        await signOut(auth);
        navigate("/login");
        setMobileMenuOpen(false);
      } catch (error) {
        console.error("Error signing out:", error);
      }
    } else {
      navigate("/login");
      setMobileMenuOpen(false);
    }
  };

  const supportMenu = [
    { label: "Contact Us", href: "/support/contact" },
    { label: "FAQ", href: "/support/faq" },
    { label: "Live Chat", href: "/support/chat" },
  ];

  return (
    <>
      <header className="sticky top-0 z-[1002] backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 border-b border-gray-200/50 dark:border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo + Mobile Toggle */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>

              <Link
                to="/"
                className="flex items-center gap-1 hover:opacity-90 transition"
              >
                <Plane className="w-8 h-8 text-cyan-600" />
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Flight Booking
                </h1>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              {/* Customer Support */}
              <HeadlessMenu as="div" className="relative">
                <HeadlessMenu.Button className="flex items-center gap-1 text-gray-700 dark:text-gray-300 hover:text-cyan-600 transition font-medium">
                  Customer Support
                  <ChevronDown className="w-4 h-4 mt-0.5" />
                </HeadlessMenu.Button>

                <Transition
                  enter="transition ease-out duration-150"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="transition ease-in duration-100"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <HeadlessMenu.Items className="absolute left-0 mt-2 w-56 origin-top-left rounded-xl bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700">
                    {supportMenu.map((item) => (
                      <HeadlessMenu.Item key={item.label}>
                        {({ active }) => (
                          <Link
                            to={item.href}
                            className={`block px-4 py-3 text-sm ${
                              active ? "bg-gray-50 dark:bg-gray-700" : ""
                            }`}
                          >
                            {item.label}
                          </Link>
                        )}
                      </HeadlessMenu.Item>
                    ))}
                  </HeadlessMenu.Items>
                </Transition>
              </HeadlessMenu>

              <Link
                to="/explore"
                className="text-gray-700 dark:text-gray-300 hover:text-cyan-600 transition font-medium"
              >
                Explore
              </Link>

              {/* KEEP ONLY THIS LANGUAGE SELECTOR */}
              <HeadlessMenu as="div" className="relative">
                <HeadlessMenu.Button className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-cyan-600 transition font-medium">
                  <img
                    src={selectedCountry.flag}
                    alt={selectedCountry.name}
                    className="w-6 h-4 rounded shadow-sm"
                  />
                  <span className="hidden sm:inline">
                    {selectedCountry.label}
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </HeadlessMenu.Button>

                <Transition
                  enter="transition ease-out duration-150"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="transition ease-in duration-100"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <HeadlessMenu.Items className="absolute right-0 mt-2 w-64 origin-top-right rounded-xl bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700">
                    {countries.map((country) => (
                      <HeadlessMenu.Item key={country.code}>
                        {({ active }) => (
                          <button
                            onClick={() => setSelectedCountry(country)}
                            className={`flex w-full items-center gap-3 px-4 py-3 text-left ${
                              active ? "bg-gray-50 dark:bg-gray-700" : ""
                            }`}
                          >
                            <img
                              src={country.flag}
                              alt={country.name}
                              className="w-6 h-4 rounded"
                            />
                            <div>
                              <div className="font-medium text-gray-900 dark:text-gray-100">
                                {country.name}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {country.label}
                              </div>
                            </div>
                          </button>
                        )}
                      </HeadlessMenu.Item>
                    ))}
                  </HeadlessMenu.Items>
                </Transition>
              </HeadlessMenu>

              {/* Auth */}
              {loading ? (
                <div></div>
              ) : (
                <button
                  onClick={handleAuthAction}
                  className="flex items-center justify-center text-gray-700 dark:text-gray-300 hover:text-cyan-600 transition font-medium"
                  title={currentUser ? "Sign Out" : "Login"}
                >
                  {currentUser ? (
                    <UserMinus className="w-5 h-5" />
                  ) : (
                    <UserPlus className="w-5 h-5" />
                  )}
                </button>
              )}
            </nav>

            {/* Mobile Auth */}
            <div className="lg:hidden">
              {loading ? (
                <div></div>
              ) : (
                <button
                  onClick={handleAuthAction}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                  title={currentUser ? "Sign Out" : "Login"}
                >
                  {currentUser ? (
                    <UserMinus className="w-6 h-6" />
                  ) : (
                    <UserPlus className="w-6 h-6" />
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Slide Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[1002]">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setMobileMenuOpen(false)}
          />

          <div
            ref={mobileMenuRef}
            className="absolute top-0 left-0 h-full w-4/5 max-w-sm bg-white dark:bg-gray-900 shadow-xl overflow-y-auto"
          >
            <div className="sticky top-0 flex items-center justify-between p-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <Plane className="w-6 h-6 text-cyan-600" />
                <h2 className="text-lg font-bold">Flight Booking</h2>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              {/* Support */}
              <div>
                <button
                  onClick={() => toggleMobileDropdown("support")}
                  className="flex w-full items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg"
                >
                  <span className="font-medium">Customer Support</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      mobileDropdowns.support ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {mobileDropdowns.support && (
                  <div className="ml-3 mt-1 space-y-1 border-l-2 border-gray-200 dark:border-gray-700 pl-4">
                    {supportMenu.map((item) => (
                      <Link
                        key={item.label}
                        to={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="block py-2 text-sm text-gray-600 hover:text-cyan-600"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Explore */}
              <Link
                to="/explore"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg"
              >
                <span className="font-medium">Explore</span>
              </Link>

              {/* LANGUAGE ONLY – Globe Button Removed */}
              <div>
                <button
                  onClick={() => toggleMobileDropdown("language")}
                  className="flex w-full items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedCountry.flag}
                      className="w-6 h-4 rounded"
                    />
                    <span className="font-medium">Language & Region</span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      mobileDropdowns.language ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {mobileDropdowns.language && (
                  <div className="ml-3 mt-2 space-y-2">
                    {countries.map((country) => (
                      <button
                        key={country.code}
                        onClick={() => {
                          setSelectedCountry(country);
                          toggleMobileDropdown("language");
                        }}
                        className={`flex w-full items-center gap-3 p-2 rounded ${
                          selectedCountry.code === country.code
                            ? "bg-blue-50"
                            : "hover:bg-gray-50 dark:hover:bg-gray-800"
                        }`}
                      >
                        <img src={country.flag} className="w-6 h-4 rounded" />
                        <div className="text-left">
                          <div className="font-medium text-sm">
                            {country.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {country.label}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Auth */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                {loading ? (
                  <div></div>
                ) : (
                  <button
                    onClick={handleAuthAction}
                    className="flex w-full items-center justify-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 transition"
                    title={currentUser ? "Sign Out" : "Login"}
                  >
                    {currentUser ? (
                      <UserMinus className="w-5 h-5" />
                    ) : (
                      <UserPlus className="w-5 h-5" />
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
