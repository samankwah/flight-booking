import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home, MessageCircle, HelpCircle, Mail, } from "lucide-react";
const SupportLayout = ({ children }) => {
    const location = useLocation();
    const breadcrumbs = [
        { name: "Home", path: "/", icon: Home },
        { name: "Support", path: "/support" },
    ];
    if (location.pathname === "/support/contact") {
        breadcrumbs.push({
            name: "Contact Us",
            path: "/support/contact",
            icon: Mail,
        });
    }
    else if (location.pathname === "/support/faq") {
        breadcrumbs.push({ name: "FAQ", path: "/support/faq", icon: HelpCircle });
    }
    else if (location.pathname === "/support/chat") {
        breadcrumbs.push({
            name: "Live Chat",
            path: "/support/chat",
            icon: MessageCircle,
        });
    }
    const supportLinks = [
        {
            name: "Contact Us",
            path: "/support/contact",
            icon: Mail,
            description: "Get in touch with our team",
        },
        {
            name: "FAQ",
            path: "/support/faq",
            icon: HelpCircle,
            description: "Find answers to common questions",
        },
        {
            name: "Live Chat",
            path: "/support/chat",
            icon: MessageCircle,
            description: "Chat with support agents",
        },
    ];
    return (_jsxs("div", { className: "min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800", children: [_jsx("div", { className: "border-b border-gray-200 dark:border-gray-800", children: _jsx("div", { className: "container mx-auto px-4 py-4", children: _jsx("nav", { className: "flex items-center space-x-2 text-sm", children: breadcrumbs.map((item, index) => (_jsxs(React.Fragment, { children: [_jsxs(Link, { to: item.path, className: `flex items-center gap-1 ${index === breadcrumbs.length - 1
                                        ? "text-gray-900 dark:text-white font-medium"
                                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"}`, children: [item.icon && _jsx(item.icon, { className: "w-4 h-4" }), _jsx("span", { children: item.name })] }), index < breadcrumbs.length - 1 && (_jsx(ChevronRight, { className: "w-4 h-4 text-gray-400" }))] }, item.path))) }) }) }), _jsx("div", { className: "container mx-auto px-4 py-8", children: _jsxs("div", { className: "flex flex-col lg:flex-row gap-8", children: [location.pathname !== "/support/chat" && (_jsx("div", { className: "lg:w-1/4", children: _jsxs("div", { className: "sticky top-24 space-y-6", children: [_jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 dark:text-white mb-4", children: "Support Center" }), _jsx("div", { className: "space-y-2", children: supportLinks.map((link) => (_jsxs(Link, { to: link.path, className: `flex items-start gap-3 p-3 rounded-lg transition-colors ${location.pathname === link.path
                                                        ? "bg-blue-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400"
                                                        : "hover:bg-gray-50 dark:hover:bg-gray-700"}`, children: [_jsx(link.icon, { className: "w-5 h-5 mt-0.5 flex-shrink-0" }), _jsxs("div", { children: [_jsx("div", { className: "font-medium", children: link.name }), _jsx("div", { className: "text-xs text-gray-500 dark:text-gray-400", children: link.description })] })] }, link.path))) })] }), _jsxs("div", { className: "bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl p-6 text-white", children: [_jsx("h3", { className: "text-lg font-semibold mb-2", children: "Need Immediate Help?" }), _jsx("p", { className: "text-sm opacity-90 mb-4", children: "Our support team is available 24/7 to assist you." }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between text-sm", children: [_jsx("span", { children: "Phone Support" }), _jsx("span", { className: "font-semibold", children: "+1 (800) 123-4567" })] }), _jsxs("div", { className: "flex items-center justify-between text-sm", children: [_jsx("span", { children: "Email" }), _jsx("span", { className: "font-semibold", children: "support@flightbooking.com" })] })] })] })] }) })), _jsx("div", { className: location.pathname === "/support/chat" ? "w-full" : "lg:w-3/4", children: children })] }) })] }));
};
export default SupportLayout;
