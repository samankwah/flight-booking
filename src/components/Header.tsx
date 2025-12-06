// import React, { useState, Fragment, useEffect, useRef } from "react";
// import {
//   Menu,
//   Plane,
//   X,
//   ChevronDown,
//   UserPlus,
//   UserMinus,
//   Globe,
// } from "lucide-react";
// import { Menu as HeadlessMenu, Transition } from "@headlessui/react";
// import { Link } from "react-router-dom";
// interface Country {
//   code: string;
//   name: string;
//   flag: string;
//   label: string; // e.g. "English (US)"
// }

// const countries: Country[] = [
//   {
//     code: "gha",
//     name: "Ghana",
//     flag: "https://flagcdn.com/32x24/gh.png",
//     label: "English (GH)",
//   },
//   {
//     code: "us",
//     name: "USA",
//     flag: "https://flagcdn.com/32x24/us.png",
//     label: "English (US)",
//   },

//   {
//     code: "gb",
//     name: "United Kingdom",
//     flag: "https://flagcdn.com/32x24/gb.png",
//     label: "English (UK)",
//   },
//   {
//     code: "de",
//     name: "Germany",
//     flag: "https://flagcdn.com/32x24/de.png",
//     label: "Deutsch",
//   },
//   {
//     code: "fr",
//     name: "France",
//     flag: "https://flagcdn.com/32x24/fr.png",
//     label: "Français",
//   },
//   {
//     code: "jp",
//     name: "Japan",
//     flag: "https://flagcdn.com/32x24/jp.png",
//     label: "日本語",
//   },
// ];

// const Header: React.FC = () => {
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
//   const [selectedCountry, setSelectedCountry] = useState<Country>(countries[0]);
//   const [mobileDropdowns, setMobileDropdowns] = useState({
//     support: false,
//     language: false,
//   });
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const [showTooltip, setShowTooltip] = useState(false);
//   const mobileMenuRef = useRef<HTMLDivElement>(null);
//   const authButtonRef = useRef<HTMLButtonElement>(null);

//   // Prevent body scrolling when mobile menu is open
//   useEffect(() => {
//     if (mobileMenuOpen) {
//       document.body.style.overflow = "hidden";
//     } else {
//       document.body.style.overflow = "unset";
//     }

//     return () => {
//       document.body.style.overflow = "unset";
//     };
//   }, [mobileMenuOpen]);

//   // Close mobile menu when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (
//         mobileMenuOpen &&
//         mobileMenuRef.current &&
//         !mobileMenuRef.current.contains(event.target as Node)
//       ) {
//         setMobileMenuOpen(false);
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, [mobileMenuOpen]);

//   const toggleMobileDropdown = (dropdown: keyof typeof mobileDropdowns) => {
//     setMobileDropdowns((prev) => ({
//       ...prev,
//       [dropdown]: !prev[dropdown],
//     }));
//   };

//   const supportMenu = [
//     { label: "Contact Us", href: "/support/contact" },
//     { label: "FAQ", href: "/support/faq" },
//     { label: "Live Chat", href: "/support/chat" },
//   ];

//   const handleAuthClick = () => {
//     if (isLoggedIn) {
//       // If logged in, clicking logs out
//       setIsLoggedIn(false);
//     } else {
//       // If not logged in, simulate login
//       setIsLoggedIn(true);
//     }
//     setMobileMenuOpen(false);
//   };

//   return (
//     <>
//       <header className="sticky top-0 z-50 backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 border-b border-gray-200/50 dark:border-gray-800">
//         <div className="container mx-auto px-4 py-4">
//           <div className="flex items-center justify-between">
//             {/* Logo + Mobile Toggle */}
//             <div className="flex items-center gap-4">
//               <button
//                 onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
//                 className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
//                 aria-label="Toggle menu"
//               >
//                 {mobileMenuOpen ? (
//                   <X className="w-6 h-6" />
//                 ) : (
//                   <Menu className="w-6 h-6" />
//                 )}
//               </button>

//               <a
//                 href="/"
//                 className="flex items-center gap-0 hover:opacity-80 transition"
//               >
//                 <Plane className="w-8 h-6 text-cyan-500" />
//                 <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
//                   Flight Booking
//                 </h1>
//               </a>
//             </div>

//             {/* Desktop Navigation */}
//             <nav className="hidden lg:flex items-center gap-8">
//               {/* Customer Support Dropdown */}
//               <HeadlessMenu as="div" className="relative">
//                 <HeadlessMenu.Button className="flex items-center gap-1 text-gray-700 dark:text-gray-300 hover:text-cyan-600 transition">
//                   Customer Support
//                   <ChevronDown className="w-4 h-4 mt-0.5" />
//                 </HeadlessMenu.Button>

//                 <Transition
//                   as={Fragment}
//                   enter="transition ease-out duration-150"
//                   enterFrom="opacity-0 scale-95"
//                   enterTo="opacity-100 scale-100"
//                   leave="transition ease-in duration-100"
//                   leaveFrom="opacity-100 scale-100"
//                   leaveTo="opacity-0 scale-95"
//                 >
//                   <HeadlessMenu.Items className="absolute left-0 mt-2 w-56 origin-top-left rounded-xl bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
//                     {supportMenu.map((item) => (
//                       <HeadlessMenu.Item key={item.label}>
//                         {({ active }) => (
//                           <Link
//                             to={item.href}
//                             className={`${
//                               active ? "bg-gray-50 dark:bg-gray-700" : ""
//                             } block px-4 py-3 text-sm text-gray-700 dark:text-gray-300`}
//                             onClick={() => setMobileMenuOpen(false)}
//                           >
//                             {item.label}
//                           </Link>
//                         )}
//                       </HeadlessMenu.Item>
//                     ))}
//                   </HeadlessMenu.Items>
//                 </Transition>
//               </HeadlessMenu>

//               <Link
//                 to="/explore"
//                 className="text-gray-700 dark:text-gray-300 hover:text-cyan-600 transition"
//               >
//                 Explore
//               </Link>

//               {/* Country / Language Selector */}
//               <HeadlessMenu as="div" className="relative">
//                 <HeadlessMenu.Button className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-cyan-600 transition">
//                   <img
//                     src={selectedCountry.flag}
//                     alt={selectedCountry.name}
//                     className="w-6 h-4 rounded shadow-sm"
//                   />
//                   <span className="hidden sm:inline">
//                     {selectedCountry.label}
//                   </span>
//                   <ChevronDown className="w-4 h-4" />
//                 </HeadlessMenu.Button>

//                 <Transition
//                   as={Fragment}
//                   enter="transition ease-out duration-150"
//                   enterFrom="opacity-0 scale-95"
//                   enterTo="opacity-100 scale-100"
//                   leave="transition ease-in duration-100"
//                   leaveFrom="opacity-100 scale-100"
//                   leaveTo="opacity-0 scale-95"
//                 >
//                   <HeadlessMenu.Items className="absolute right-0 mt-2 w-64 origin-top-right rounded-xl bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700">
//                     {countries.map((country) => (
//                       <HeadlessMenu.Item key={country.code}>
//                         {({ active }) => (
//                           <button
//                             onClick={() => setSelectedCountry(country)}
//                             className={`${
//                               active ? "bg-gray-50 dark:bg-gray-700" : ""
//                             } flex w-full items-center gap-3 px-4 py-3 text-left`}
//                           >
//                             <img
//                               src={country.flag}
//                               alt={country.name}
//                               className="w-6 h-4 rounded shadow-sm"
//                             />
//                             <div>
//                               <div className="font-medium text-gray-900 dark:text-gray-100">
//                                 {country.name}
//                               </div>
//                               <div className="text-xs text-gray-500 dark:text-gray-400">
//                                 {country.label}
//                               </div>
//                             </div>
//                           </button>
//                         )}
//                       </HeadlessMenu.Item>
//                     ))}
//                   </HeadlessMenu.Items>
//                 </Transition>
//               </HeadlessMenu>

//               {/* Auth Icon Button with Tooltip - Desktop */}
//               <div className="relative">
//                 <button
//                   ref={authButtonRef}
//                   onClick={handleAuthClick}
//                   onMouseEnter={() => setShowTooltip(true)}
//                   onMouseLeave={() => setShowTooltip(false)}
//                   className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition group"
//                   aria-label={isLoggedIn ? "Logout" : "Login"}
//                 >
//                   {isLoggedIn ? (
//                     <UserMinus className="w-6 h-6 text-gray-700 dark:text-gray-300 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors" />
//                   ) : (
//                     <UserPlus className="w-6 h-6 text-gray-700 dark:text-gray-300 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors" />
//                   )}
//                 </button>

//                 {/* Tooltip */}
//                 {showTooltip && (
//                   <div className="absolute right-0 top-full mt-2 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-lg shadow-lg z-50 animate-fadeIn whitespace-nowrap">
//                     {isLoggedIn ? "Logout" : "Login"}
//                     <div className="absolute -top-1 right-3 w-2 h-2 bg-gray-900 dark:bg-gray-700 rotate-45"></div>
//                   </div>
//                 )}
//               </div>
//             </nav>

//             {/* Mobile Auth Icon Button */}
//             <div className="lg:hidden">
//               <button
//                 onClick={handleAuthClick}
//                 className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
//                 aria-label={isLoggedIn ? "Logout" : "Login"}
//               >
//                 {isLoggedIn ? (
//                   <UserMinus className="w-6 h-6 text-gray-700 dark:text-gray-300" />
//                 ) : (
//                   <UserPlus className="w-6 h-6 text-gray-700 dark:text-gray-300" />
//                 )}
//               </button>
//             </div>
//           </div>
//         </div>
//       </header>

//       {/* Mobile Menu Overlay */}
//       {mobileMenuOpen && (
//         <div className="lg:hidden fixed inset-0 z-[9999]">
//           {/* Backdrop - Click to close */}
//           <div
//             className="absolute inset-0 bg-black/30 animate-fadeIn"
//             onClick={() => setMobileMenuOpen(false)}
//           />

//           {/* Mobile Menu Panel */}
//           <div
//             ref={mobileMenuRef}
//             className="absolute top-0 left-0 h-full w-4/5 max-w-sm bg-white dark:bg-gray-900 overflow-y-auto animate-slideIn shadow-xl"
//           >
//             {/* Close Button */}
//             <div className="sticky top-0 z-10 flex items-center justify-between p-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
//               <div className="flex items-center gap-3">
//                 <Plane className="w-6 h-6 text-cyan-400" />
//                 <h2 className="text-lg font-bold text-gray-900 dark:text-white">
//                   Flight Booking
//                 </h2>
//               </div>
//               <button
//                 onClick={() => setMobileMenuOpen(false)}
//                 className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
//                 aria-label="Close menu"
//               >
//                 <X className="w-5 h-5" />
//               </button>
//             </div>

//             <div className="p-4">
//               {/* Customer Support Dropdown */}
//               <div className="mb-3">
//                 <button
//                   onClick={() => toggleMobileDropdown("support")}
//                   className="flex items-center justify-between w-full p-3 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
//                 >
//                   <span className="font-medium">Customer Support</span>
//                   <ChevronDown
//                     className={`w-4 h-4 transition-transform duration-200 ${
//                       mobileDropdowns.support ? "rotate-180" : ""
//                     }`}
//                   />
//                 </button>

//                 {mobileDropdowns.support && (
//                   <div className="ml-3 mt-1 space-y-1 animate-expand border-l border-gray-200 dark:border-gray-700 pl-3">
//                     {supportMenu.map((item) => (
//                       <Link
//                         to={item.href}
//                         key={item.label}
//                         className="block py-2 px-2 text-sm text-gray-600 dark:text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded transition-colors"
//                         onClick={() => setMobileMenuOpen(false)}
//                       >
//                         {item.label}
//                       </Link>
//                     ))}
//                   </div>
//                 )}
//               </div>

//               {/* Explore Link */}
//               <div className="mb-3">
//                 <a
//                   href="/explore"
//                   className="flex items-center gap-3 p-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
//                   onClick={() => setMobileMenuOpen(false)}
//                 >
//                   <Globe className="w-5 h-5" />
//                   <span className="font-medium">Explore</span>
//                 </a>
//               </div>

//               {/* Language & Region Dropdown */}
//               <div className="mb-3">
//                 <button
//                   onClick={() => toggleMobileDropdown("language")}
//                   className="flex items-center justify-between w-full p-3 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
//                 >
//                   <div className="flex items-center gap-3">
//                     <img
//                       src={selectedCountry.flag}
//                       alt={selectedCountry.name}
//                       className="w-6 h-4 rounded"
//                     />
//                     <span className="font-medium">Language & Region</span>
//                   </div>
//                   <ChevronDown
//                     className={`w-4 h-4 transition-transform duration-200 ${
//                       mobileDropdowns.language ? "rotate-180" : ""
//                     }`}
//                   />
//                 </button>

//                 {mobileDropdowns.language && (
//                   <div className="ml-3 mt-1 space-y-2 animate-expand border-l border-gray-200 dark:border-gray-700 pl-3">
//                     <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
//                       <div className="flex items-center gap-3 mb-1">
//                         <img
//                           src={selectedCountry.flag}
//                           alt={selectedCountry.name}
//                           className="w-8 h-6 rounded"
//                         />
//                         <div>
//                           <p className="font-medium text-gray-900 dark:text-white text-sm">
//                             {selectedCountry.name}
//                           </p>
//                           <p className="text-xs text-gray-500 dark:text-gray-400">
//                             {selectedCountry.label}
//                           </p>
//                         </div>
//                       </div>
//                     </div>

//                     <div className="space-y-1">
//                       <p className="text-xs font-medium text-gray-500 dark:text-gray-400 px-2">
//                         Select another language:
//                       </p>
//                       {countries.map((country) => (
//                         <button
//                           key={country.code}
//                           onClick={() => {
//                             setSelectedCountry(country);
//                             setMobileDropdowns((prev) => ({
//                               ...prev,
//                               language: false,
//                             }));
//                           }}
//                           className={`flex items-center gap-3 w-full p-2 text-left rounded transition-colors ${
//                             selectedCountry.code === country.code
//                               ? "bg-blue-50 dark:bg-blue-900/20"
//                               : "hover:bg-gray-50 dark:hover:bg-gray-800"
//                           }`}
//                         >
//                           <img
//                             src={country.flag}
//                             alt={country.name}
//                             className="w-6 h-4 rounded"
//                           />
//                           <div>
//                             <p className="font-medium text-gray-700 dark:text-gray-300 text-sm">
//                               {country.name}
//                             </p>
//                             <p className="text-xs text-gray-500 dark:text-gray-400">
//                               {country.label}
//                             </p>
//                           </div>
//                         </button>
//                       ))}
//                     </div>
//                   </div>
//                 )}
//               </div>

//               {/* Auth Button in Mobile Menu */}
//               <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
//                 <button
//                   onClick={handleAuthClick}
//                   className={`flex items-center justify-center gap-2 w-full p-3 rounded-lg transition-colors ${
//                     isLoggedIn
//                       ? "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
//                       : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
//                   }`}
//                 >
//                   {isLoggedIn ? (
//                     <>
//                       <UserMinus className="w-5 h-5" />
//                       <span className="font-medium">Logout</span>
//                     </>
//                   ) : (
//                     <>
//                       <UserPlus className="w-5 h-5" />
//                       <span className="font-medium">Login</span>
//                     </>
//                   )}
//                 </button>
//                 {!isLoggedIn && (
//                   <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
//                     Create an account for faster bookings
//                   </p>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Inline styles for animations */}
//       <style jsx>{`
//         @keyframes fadeIn {
//           from {
//             opacity: 0;
//             transform: translateY(-5px);
//           }
//           to {
//             opacity: 1;
//             transform: translateY(0);
//           }
//         }

//         @keyframes slideIn {
//           from {
//             transform: translateX(-100%);
//           }
//           to {
//             transform: translateX(0);
//           }
//         }

//         @keyframes expand {
//           from {
//             opacity: 0;
//             transform: translateY(-5px);
//             max-height: 0;
//           }
//           to {
//             opacity: 1;
//             transform: translateY(0);
//             max-height: 500px;
//           }
//         }

//         .animate-fadeIn {
//           animation: fadeIn 0.2s ease-out;
//         }

//         .animate-slideIn {
//           animation: slideIn 0.3s ease-out;
//         }

//         .animate-expand {
//           animation: expand 0.2s ease-out;
//           overflow: hidden;
//         }
//       `}</style>
//     </>
//   );
// };

// export default Header;

// src/components/Header.tsx

// import React, { useState, useEffect, useRef } from "react";
// import {
//   Menu,
//   Plane,
//   X,
//   ChevronDown,
//   UserPlus,
//   UserMinus,
//   Globe,
// } from "lucide-react";
// import { Menu as HeadlessMenu, Transition } from "@headlessui/react";
// import { Link } from "react-router-dom";

// interface Country {
//   code: string;
//   name: string;
//   flag: string;
//   label: string;
// }

// const countries: Country[] = [
//   {
//     code: "gha",
//     name: "Ghana",
//     flag: "https://flagcdn.com/32x24/gh.png",
//     label: "English (GH)",
//   },
//   {
//     code: "us",
//     name: "USA",
//     flag: "https://flagcdn.com/32x24/us.png",
//     label: "English (US)",
//   },
//   {
//     code: "gb",
//     name: "UK",
//     flag: "https://flagcdn.com/32x24/gb.png",
//     label: "English (UK)",
//   },
//   {
//     code: "de",
//     name: "Germany",
//     flag: "https://flagcdn.com/32x24/de.png",
//     label: "Deutsch",
//   },
//   {
//     code: "fr",
//     name: "France",
//     flag: "https://flagcdn.com/32x24/fr.png",
//     label: "Français",
//   },
//   {
//     code: "jp",
//     name: "Japan",
//     flag: "https://flagcdn.com/32x24/jp.png",
//     label: "日本語",
//   },
// ];

// const Header: React.FC = () => {
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
//   const [selectedCountry, setSelectedCountry] = useState<Country>(countries[0]);
//   const [mobileDropdowns, setMobileDropdowns] = useState({
//     support: false,
//     language: false,
//   });
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const [showTooltip, setShowTooltip] = useState(false);
//   const mobileMenuRef = useRef<HTMLDivElement>(null);
//   const authButtonRef = useRef<HTMLButtonElement>(null);

//   useEffect(() => {
//     document.body.style.overflow = mobileMenuOpen ? "hidden" : "unset";
//     return () => {
//       document.body.style.overflow = "unset";
//     };
//   }, [mobileMenuOpen]);

//   useEffect(() => {
//     const handleClickOutside = (e: MouseEvent) => {
//       if (
//         mobileMenuOpen &&
//         mobileMenuRef.current &&
//         !mobileMenuRef.current.contains(e.target as Node)
//       ) {
//         setMobileMenuOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, [mobileMenuOpen]);

//   const toggleMobileDropdown = (key: "support" | "language") => {
//     setMobileDropdowns((prev) => ({ ...prev, [key]: !prev[key] }));
//   };

//   const supportMenu = [
//     { label: "Contact Us", href: "/support/contact" },
//     { label: "FAQ", href: "/support/faq" },
//     { label: "Live Chat", href: "/support/chat" },
//   ];

//   const handleAuthClick = () => {
//     setIsLoggedIn(!isLoggedIn);
//     setMobileMenuOpen(false);
//   };

//   return (
//     <>
//       <header className="sticky top-0 z-50 backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 border-b border-gray-200/50 dark:border-gray-800">
//         <div className="container mx-auto px-4 py-4">
//           <div className="flex items-center justify-between">
//             {/* Logo + Mobile Toggle */}
//             <div className="flex items-center gap-4">
//               <button
//                 onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
//                 className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
//                 aria-label="Toggle menu"
//               >
//                 {mobileMenuOpen ? (
//                   <X className="w-6 h-6" />
//                 ) : (
//                   <Menu className="w-6 h-6" />
//                 )}
//               </button>

//               <Link
//                 to="/"
//                 className="flex items-center gap-1 hover:opacity-90 transition"
//               >
//                 <Plane className="w-8 h-8 text-cyan-600" />
//                 <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
//                   Flight Booking
//                 </h1>
//               </Link>
//             </div>

//             {/* Desktop Navigation */}
//             <nav className="hidden lg:flex items-center gap-8">
//               {/* Customer Support */}
//               <HeadlessMenu as="div" className="relative">
//                 <HeadlessMenu.Button className="flex items-center gap-1 text-gray-700 dark:text-gray-300 hover:text-cyan-600 transition font-medium">
//                   Customer Support
//                   <ChevronDown className="w-4 h-4 mt-0.5" />
//                 </HeadlessMenu.Button>
//                 <Transition
//                   enter="transition ease-out duration-150"
//                   enterFrom="opacity-0 scale-95"
//                   enterTo="opacity-100 scale-100"
//                   leave="transition ease-in duration-100"
//                   leaveFrom="opacity-100 scale-100"
//                   leaveTo="opacity-0 scale-95"
//                 >
//                   <HeadlessMenu.Items className="absolute left-0 mt-2 w-56 origin-top-left rounded-xl bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700">
//                     {supportMenu.map((item) => (
//                       <HeadlessMenu.Item key={item.label}>
//                         {({ active }) => (
//                           <Link
//                             to={item.href}
//                             className={`block px-4 py-3 text-sm ${
//                               active ? "bg-gray-50 dark:bg-gray-700" : ""
//                             }`}
//                           >
//                             {item.label}
//                           </Link>
//                         )}
//                       </HeadlessMenu.Item>
//                     ))}
//                   </HeadlessMenu.Items>
//                 </Transition>
//               </HeadlessMenu>

//               <Link
//                 to="/explore"
//                 className="text-gray-700 dark:text-gray-300 hover:text-cyan-600 transition font-medium"
//               >
//                 Explore
//               </Link>

//               {/* Language Selector */}
//               <HeadlessMenu as="div" className="relative">
//                 <HeadlessMenu.Button className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-cyan-600 transition font-medium">
//                   <img
//                     src={selectedCountry.flag}
//                     alt={selectedCountry.name}
//                     className="w-6 h-4 rounded shadow-sm"
//                   />
//                   <span className="hidden sm:inline">
//                     {selectedCountry.label}
//                   </span>
//                   <ChevronDown className="w-4 h-4" />
//                 </HeadlessMenu.Button>
//                 <Transition
//                   enter="transition ease-out duration-150"
//                   enterFrom="opacity-0 scale-95"
//                   enterTo="opacity-100 scale-100"
//                   leave="transition ease-in duration-100"
//                   leaveFrom="opacity-100 scale-100"
//                   leaveTo="opacity-0 scale-95"
//                 >
//                   <HeadlessMenu.Items className="absolute right-0 mt-2 w-64 origin-top-right rounded-xl bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700">
//                     {countries.map((country) => (
//                       <HeadlessMenu.Item key={country.code}>
//                         {({ active }) => (
//                           <button
//                             onClick={() => setSelectedCountry(country)}
//                             className={`flex w-full items-center gap-3 px-4 py-3 text-left ${
//                               active ? "bg-gray-50 dark:bg-gray-700" : ""
//                             }`}
//                           >
//                             <img
//                               src={country.flag}
//                               alt={country.name}
//                               className="w-6 h-4 rounded"
//                             />
//                             <div>
//                               <div className="font-medium text-gray-900 dark:text-gray-100">
//                                 {country.name}
//                               </div>
//                               <div className="text-xs text-gray-500 dark:text-gray-400">
//                                 {country.label}
//                               </div>
//                             </div>
//                           </button>
//                         )}
//                       </HeadlessMenu.Item>
//                     ))}
//                   </HeadlessMenu.Items>
//                 </Transition>
//               </HeadlessMenu>

//               {/* Auth Button */}
//               <div className="relative">
//                 <button
//                   ref={authButtonRef}
//                   onClick={handleAuthClick}
//                   onMouseEnter={() => setShowTooltip(true)}
//                   onMouseLeave={() => setShowTooltip(false)}
//                   className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition group"
//                 >
//                   {isLoggedIn ? (
//                     <UserMinus className="w-6 h-6 text-gray-700 dark:text-gray-300 group-hover:text-red-600 transition-colors" />
//                   ) : (
//                     <UserPlus className="w-6 h-6 text-gray-700 dark:text-gray-300 group-hover:text-cyan-600 transition-colors" />
//                   )}
//                 </button>

//                 {showTooltip && (
//                   <div className="absolute right-0 top-full mt-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg whitespace-nowrap z-50">
//                     {isLoggedIn ? "Logout" : "Login"}
//                     <div className="absolute -top-1 right-3 w-2 h-2 bg-gray-900 rotate-45"></div>
//                   </div>
//                 )}
//               </div>
//             </nav>

//             {/* Mobile Auth */}
//             <div className="lg:hidden">
//               <button
//                 onClick={handleAuthClick}
//                 className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
//               >
//                 {isLoggedIn ? (
//                   <UserMinus className="w-6 h-6" />
//                 ) : (
//                   <UserPlus className="w-6 h-6" />
//                 )}
//               </button>
//             </div>
//           </div>
//         </div>
//       </header>

//       {/* Mobile Menu */}
//       {mobileMenuOpen && (
//         <div className="lg:hidden fixed inset-0 z-[9999]">
//           <div
//             className="absolute inset-0 bg-black/30"
//             onClick={() => setMobileMenuOpen(false)}
//           />
//           <div
//             ref={mobileMenuRef}
//             className="absolute top-0 left-0 h-full w-4/5 max-w-sm bg-white dark:bg-gray-900 shadow-xl overflow-y-auto"
//           >
//             <div className="sticky top-0 z-10 flex items-center justify-between p-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
//               <div className="flex items-center gap-3">
//                 <Plane className="w-6 h-6 text-cyan-600" />
//                 <h2 className="text-lg font-bold">Flight Booking</h2>
//               </div>
//               <button
//                 onClick={() => setMobileMenuOpen(false)}
//                 className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
//               >
//                 <X className="w-5 h-5" />
//               </button>
//             </div>

//             <div className="p-4 space-y-3">
//               {/* Support */}
//               <div>
//                 <button
//                   onClick={() => toggleMobileDropdown("support")}
//                   className="flex w-full items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg"
//                 >
//                   <span className="font-medium">Customer Support</span>
//                   <ChevronDown
//                     className={`w-4 h-4 transition-transform ${
//                       mobileDropdowns.support ? "rotate-180" : ""
//                     }`}
//                   />
//                 </button>
//                 {mobileDropdowns.support && (
//                   <div className="ml-3 mt-1 space-y-1 border-l-2 border-gray-200 dark:border-gray-700 pl-4">
//                     {supportMenu.map((item) => (
//                       <Link
//                         key={item.label}
//                         to={item.href}
//                         onClick={() => setMobileMenuOpen(false)}
//                         className="block py-2 text-sm text-gray-600 hover:text-cyan-600"
//                       >
//                         {item.label}
//                       </Link>
//                     ))}
//                   </div>
//                 )}
//               </div>

//               <Link
//                 to="/explore"
//                 onClick={() => setMobileMenuOpen(false)}
//                 className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg"
//               >
//                 <Globe className="w-5 h-5" />
//                 <span className="font-medium">Explore</span>
//               </Link>

//               {/* Language */}
//               <div>
//                 <button
//                   onClick={() => toggleMobileDropdown("language")}
//                   className="flex w-full items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg"
//                 >
//                   <div className="flex items-center gap-3">
//                     <img
//                       src={selectedCountry.flag}
//                       alt=""
//                       className="w-6 h-4 rounded"
//                     />
//                     <span className="font-medium">Language & Region</span>
//                   </div>
//                   <ChevronDown
//                     className={`w-4 h-4 transition-transform ${
//                       mobileDropdowns.language ? "rotate-180" : ""
//                     }`}
//                   />
//                 </button>
//                 {mobileDropdowns.language && (
//                   <div className="ml-3 mt-2 space-y-2">
//                     {countries.map((country) => (
//                       <button
//                         key={country.code}
//                         onClick={() => {
//                           setSelectedCountry(country);
//                           toggleMobileDropdown("language");
//                         }}
//                         className={`flex w-full items-center gap-3 p-2 rounded ${
//                           selectedCountry.code === country.code
//                             ? "bg-blue-50"
//                             : "hover:bg-gray-50"
//                         }`}
//                       >
//                         <img
//                           src={country.flag}
//                           alt=""
//                           className="w-6 h-4 rounded"
//                         />
//                         <div className="text-left">
//                           <div className="font-medium text-sm">
//                             {country.name}
//                           </div>
//                           <div className="text-xs text-gray-500">
//                             {country.label}
//                           </div>
//                         </div>
//                       </button>
//                     ))}
//                   </div>
//                 )}
//               </div>

//               <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
//                 <button
//                   onClick={handleAuthClick}
//                   className="flex w-full items-center justify-center gap-2 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 transition"
//                 >
//                   {isLoggedIn ? (
//                     <>
//                       <UserMinus className="w-5 h-5" /> Logout
//                     </>
//                   ) : (
//                     <>
//                       <UserPlus className="w-5 h-5" /> Login
//                     </>
//                   )}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

// export default Header;

// src/components/Header.tsx

import React, { useState, useEffect, useRef } from "react";
import {
  Menu,
  Plane,
  X,
  ChevronDown,
  UserPlus,
  UserMinus,
  Globe,
} from "lucide-react";
import { Menu as HeadlessMenu, Transition } from "@headlessui/react";
import { Link } from "react-router-dom";

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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const authButtonRef = useRef<HTMLButtonElement>(null);

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

  const supportMenu = [
    { label: "Contact Us", href: "/support/contact" },
    { label: "FAQ", href: "/support/faq" },
    { label: "Live Chat", href: "/support/chat" },
  ];

  const handleAuthClick = () => {
    setIsLoggedIn(!isLoggedIn);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 border-b border-gray-200/50 dark:border-gray-800">
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

              {/* EXPLORE LINK — NOW WORKS PERFECTLY */}
              <Link
                to="/explore"
                className="text-gray-700 dark:text-gray-300 hover:text-cyan-600 transition font-medium"
              >
                Explore
              </Link>

              {/* Language Selector */}
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

              {/* Auth Button */}
              <div className="relative">
                <button
                  ref={authButtonRef}
                  onClick={handleAuthClick}
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition group"
                >
                  {isLoggedIn ? (
                    <UserMinus className="w-6 h-6 text-gray-700 dark:text-gray-300 group-hover:text-red-600 transition-colors" />
                  ) : (
                    <UserPlus className="w-6 h-6 text-gray-700 dark:text-gray-300 group-hover:text-cyan-600 transition-colors" />
                  )}
                </button>

                {showTooltip && (
                  <div className="absolute right-0 top-full mt-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg whitespace-nowrap z-50">
                    {isLoggedIn ? "Logout" : "Login"}
                    <div className="absolute -top-1 right-3 w-2 h-2 bg-gray-900 rotate-45"></div>
                  </div>
                )}
              </div>
            </nav>

            {/* Mobile Auth */}
            <div className="lg:hidden">
              <button
                onClick={handleAuthClick}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                {isLoggedIn ? (
                  <UserMinus className="w-6 h-6" />
                ) : (
                  <UserPlus className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[9999]">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div
            ref={mobileMenuRef}
            className="absolute top-0 left-0 h-full w-4/5 max-w-sm bg-white dark:bg-gray-900 shadow-xl overflow-y-auto"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between p-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
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

              {/* EXPLORE LINK — NOW WORKS IN MOBILE TOO */}
              <Link
                to="/explore"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg"
              >
                <Globe className="w-5 h-5" />
                <span className="font-medium">Explore</span>
              </Link>

              {/* Language */}
              <div>
                <button
                  onClick={() => toggleMobileDropdown("language")}
                  className="flex w-full items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedCountry.flag}
                      alt=""
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
                            : "hover:bg-gray-50"
                        }`}
                      >
                        <img
                          src={country.flag}
                          alt=""
                          className="w-6 h-4 rounded"
                        />
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

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleAuthClick}
                  className="flex w-full items-center justify-center gap-2 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 transition"
                >
                  {isLoggedIn ? (
                    <>
                      <UserMinus className="w-5 h-5" /> Logout
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-5 h-5" /> Login
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
