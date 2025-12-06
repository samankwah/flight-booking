import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import HomePage from "./pages/HomePage";
import ContactUs from "./pages/support/ContactUs";
import FAQ from "./pages/support/FAQ";
import LiveChat from "./pages/support/LiveChat";
import SupportLayout from "./components/SupportLayout";
import ExplorePage from "./pages/ExplorePage";
const App = () => {
    return (_jsx(Router, { children: _jsxs("div", { className: "min-h-screen bg-gradient-to-b from-slate-50 to-white", children: [_jsx(Header, {}), _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(HomePage, {}) }), _jsx(Route, { path: "/support", element: _jsx(SupportLayout, { children: _jsxs("div", { className: "container mx-auto px-4 py-16 text-center", children: [_jsx("h1", { className: "text-4xl font-bold text-gray-900 dark:text-white mb-4", children: "Customer Support" }), _jsx("p", { className: "text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto", children: "Welcome to our support center. How can we help you today?" })] }) }) }), _jsx(Route, { path: "/support/contact", element: _jsx(SupportLayout, { children: _jsx(ContactUs, {}) }) }), _jsx(Route, { path: "/support/faq", element: _jsx(SupportLayout, { children: _jsx(FAQ, {}) }) }), _jsx(Route, { path: "/explore", element: _jsx(ExplorePage, {}) }), _jsx(Route, { path: "/support/chat", element: _jsx(SupportLayout, { children: _jsx(LiveChat, {}) }) })] })] }) }));
};
export default App;
