import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Plane, Mail, Phone, MapPin } from "lucide-react";
const Footer = () => {
    const popularDestinations = [
        "New York",
        "London",
        "Paris",
        "Tokyo",
        "Dubai",
        "Singapore",
        "Sydney",
        "Bangkok",
        "Istanbul",
        "Barcelona",
    ];
    const topAirlines = [
        "Emirates",
        "Qatar Airways",
        "Singapore Airlines",
        "Lufthansa",
        "British Airways",
        "Air France",
        "Turkish Airlines",
        "Etihad",
    ];
    const support = [
        { label: "Help Center", href: "/help" },
        { label: "FAQs", href: "/faq" },
        { label: "How to Book", href: "/how-to-book" },
        { label: "Contact Us", href: "/contact" },
        { label: "Travel Alerts", href: "/alerts" },
    ];
    const company = [
        { label: "About Us", href: "/about" },
        { label: "Careers", href: "/careers" },
        { label: "Press Room", href: "/press" },
        { label: "Partner with Us", href: "/partners" },
        { label: "Affiliate Program", href: "/affiliate" },
    ];
    const legal = [
        { label: "Terms & Conditions", href: "/terms" },
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Cookie Policy", href: "/cookies" },
        { label: "Refund Policy", href: "/refund" },
        { label: "Security", href: "/security" },
    ];
    return (_jsxs("footer", { className: "bg-slate-900 text-white", children: [_jsxs("div", { className: "container mx-auto px-4 py-12", children: [_jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-8 pb-8 border-b border-slate-800", children: [_jsxs("div", { children: [_jsxs("h3", { className: "font-bold text-lg mb-4 flex items-center gap-2", children: [_jsx(MapPin, { className: "w-5 h-5 text-cyan-400" }), "Popular Destinations"] }), _jsx("div", { className: "flex flex-wrap gap-2", children: popularDestinations.map((dest, index) => (_jsx("a", { href: `/destination/${dest.toLowerCase().replace(" ", "-")}`, className: "px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm text-gray-300 hover:text-white transition", children: dest }, index))) })] }), _jsxs("div", { children: [_jsxs("h3", { className: "font-bold text-lg mb-4 flex items-center gap-2", children: [_jsx(Plane, { className: "w-5 h-5 text-cyan-400" }), "Top Airlines"] }), _jsx("div", { className: "flex flex-wrap gap-2", children: topAirlines.map((airline, index) => (_jsx("a", { href: `/airline/${airline.toLowerCase().replace(" ", "-")}`, className: "px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm text-gray-300 hover:text-white transition", children: airline }, index))) })] })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 py-10 border-b border-slate-800", children: [_jsxs("div", { className: "lg:col-span-2", children: [_jsxs("div", { className: "flex items-center gap-2 mb-4", children: [_jsx(Plane, { className: "w-8 h-8 text-cyan-400" }), _jsx("h3", { className: "font-bold text-2xl", children: "Flight Booking" })] }), _jsx("p", { className: "text-gray-400 text-sm mb-6 leading-relaxed", children: "Your trusted travel companion for the best flight deals, hotel bookings, and holiday packages worldwide. Travel smarter with us." }), _jsxs("div", { className: "mb-6", children: [_jsx("h4", { className: "font-semibold text-sm mb-3", children: "Subscribe to our newsletter" }), _jsxs("div", { className: "flex gap-2", children: [_jsxs("div", { className: "flex-1 relative", children: [_jsx(Mail, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" }), _jsx("input", { type: "email", placeholder: "Enter your email", className: "w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white placeholder-gray-500" })] }), _jsx("button", { className: "px-6 py-2.5 bg-cyan-600 hover:bg-cyan-700 rounded-lg font-semibold text-sm transition whitespace-nowrap", children: "Subscribe" })] }), _jsx("p", { className: "text-xs text-gray-500 mt-2", children: "Get exclusive deals and travel tips" })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-semibold text-sm mb-3", children: "Follow Us" }), _jsx("div", { className: "flex gap-3", children: [
                                                    {
                                                        icon: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
                                                        label: "Facebook",
                                                    },
                                                    {
                                                        icon: "M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z",
                                                        label: "Twitter",
                                                    },
                                                    {
                                                        icon: "M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121L8.08 13.768l-2.91-.908c-.632-.196-.64-.632.135-.936l11.37-4.38c.528-.176.99.128.82.877z",
                                                        label: "Telegram",
                                                    },
                                                    {
                                                        icon: "M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z",
                                                        label: "Instagram",
                                                    },
                                                ].map((social, index) => (_jsx("a", { href: "#", className: "w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-cyan-600 transition group", "aria-label": social.label, children: _jsx("svg", { className: "w-5 h-5 text-gray-400 group-hover:text-white transition", fill: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { d: social.icon }) }) }, index))) })] })] }), _jsxs("div", { children: [_jsx("h3", { className: "font-bold text-lg mb-4", children: "Company" }), _jsx("ul", { className: "space-y-2.5", children: company.map((link, index) => (_jsx("li", { children: _jsxs("a", { href: link.href, className: "text-gray-400 hover:text-white transition text-sm flex items-center gap-2 group", children: [_jsx("span", { className: "w-1 h-1 bg-cyan-400 rounded-full opacity-0 group-hover:opacity-100 transition" }), link.label] }) }, index))) })] }), _jsxs("div", { children: [_jsx("h3", { className: "font-bold text-lg mb-4", children: "Legal" }), _jsx("ul", { className: "space-y-2.5", children: legal.map((link, index) => (_jsx("li", { children: _jsxs("a", { href: link.href, className: "text-gray-400 hover:text-white transition text-sm flex items-center gap-2 group", children: [_jsx("span", { className: "w-1 h-1 bg-cyan-400 rounded-full opacity-0 group-hover:opacity-100 transition" }), link.label] }) }, index))) })] })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-8 py-8 border-b border-slate-800", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-bold text-lg mb-4", children: "Contact Information" }), _jsxs("div", { className: "space-y-3", children: [_jsxs("a", { href: "tel:+1234567890", className: "flex items-center gap-3 text-gray-400 hover:text-white transition group", children: [_jsx("div", { className: "w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center group-hover:bg-cyan-600 transition", children: _jsx(Phone, { className: "w-5 h-5" }) }), _jsxs("div", { children: [_jsx("div", { className: "text-xs text-gray-500", children: "Call us" }), _jsx("div", { className: "font-semibold", children: "+233 (244) 000-000" })] })] }), _jsxs("a", { href: "mailto:support@flightbooking.com", className: "flex items-center gap-3 text-gray-400 hover:text-white transition group", children: [_jsx("div", { className: "w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center group-hover:bg-cyan-600 transition", children: _jsx(Mail, { className: "w-5 h-5" }) }), _jsxs("div", { children: [_jsx("div", { className: "text-xs text-gray-500", children: "Email us" }), _jsx("div", { className: "font-semibold", children: "support@flightbooking.com" })] })] }), _jsxs("div", { className: "flex items-center gap-3 text-gray-400", children: [_jsx("div", { className: "w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center", children: _jsx(MapPin, { className: "w-5 h-5" }) }), _jsxs("div", { children: [_jsx("div", { className: "text-xs text-gray-500", children: "Address" }), _jsx("div", { className: "font-semibold", children: "7 Mbomou Street, GA-303-0722" })] })] })] })] }), _jsxs("div", { children: [_jsx("h3", { className: "font-bold text-lg mb-4", children: "We Accept" }), _jsx("div", { className: "flex flex-wrap gap-3 mb-4", children: [
                                            { name: "VISA", color: "text-blue-600", bg: "bg-white" },
                                            {
                                                name: "Mastercard",
                                                color: "text-orange-500",
                                                bg: "bg-white",
                                            },
                                            { name: "PayPal", color: "text-blue-600", bg: "bg-white" },
                                            { name: "Amex", color: "text-blue-500", bg: "bg-white" },
                                            { name: "Discover", color: "text-orange-600", bg: "bg-white" },
                                            { name: "Apple Pay", color: "text-black", bg: "bg-white" },
                                        ].map((payment, index) => (_jsx("div", { className: `${payment.bg} px-4 py-2.5 rounded-lg flex items-center justify-center font-bold text-sm ${payment.color} shadow-sm hover:shadow-md transition`, children: payment.name }, index))) }), _jsxs("div", { className: "flex items-center gap-2 text-sm text-gray-400", children: [_jsx("svg", { className: "w-5 h-5 text-green-500", fill: "currentColor", viewBox: "0 0 20 20", children: _jsx("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z", clipRule: "evenodd" }) }), _jsx("span", { children: "Secure payments powered by SSL encryption" })] })] })] }), _jsx("div", { className: "pt-8", children: _jsx("div", { className: "flex flex-col lg:flex-row justify-between items-center gap-4", children: _jsx("div", { className: "text-gray-400 text-sm text-center lg:text-left", children: "\u00A9 2025 Flight Booking. All rights reserved. | Designed by ByteShift" }) }) })] }), _jsx("div", { className: "bg-slate-950 py-6", children: _jsx("div", { className: "container mx-auto px-4", children: _jsxs("div", { className: "flex flex-wrap justify-center items-center gap-6 text-sm text-gray-400", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("svg", { className: "w-6 h-6 text-cyan-400", fill: "currentColor", viewBox: "0 0 20 20", children: _jsx("path", { fillRule: "evenodd", d: "M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z", clipRule: "evenodd" }) }), "Verified & Secure"] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("svg", { className: "w-6 h-6 text-cyan-400", fill: "currentColor", viewBox: "0 0 20 20", children: _jsx("path", { d: "M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" }) }), "Trusted by 10M+ Travelers"] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("svg", { className: "w-6 h-6 text-cyan-400", fill: "currentColor", viewBox: "0 0 20 20", children: _jsx("path", { fillRule: "evenodd", d: "M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z", clipRule: "evenodd" }) }), "Best Price Guarantee"] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("svg", { className: "w-6 h-6 text-cyan-400", fill: "currentColor", viewBox: "0 0 20 20", children: _jsx("path", { fillRule: "evenodd", d: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z", clipRule: "evenodd" }) }), "24/7 Customer Support"] })] }) }) })] }));
};
export default Footer;
