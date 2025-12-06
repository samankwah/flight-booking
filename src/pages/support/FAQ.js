import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { ChevronDown, ChevronUp, Search } from "lucide-react";
const FAQ = () => {
    const [openIndex, setOpenIndex] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const faqCategories = [
        {
            category: "Booking & Reservations",
            questions: [
                {
                    question: "How do I book a flight?",
                    answer: "You can book flights through our website or mobile app. Simply enter your departure and destination cities, select travel dates, choose your flight, and complete the payment process.",
                },
                {
                    question: "Can I modify my booking?",
                    answer: "Yes, you can modify your booking up to 24 hours before departure. Log into your account, go to 'My Bookings', and select the booking you want to modify. Changes may be subject to fees.",
                },
                {
                    question: "What is your cancellation policy?",
                    answer: "Cancellations made more than 24 hours before departure receive a full refund. Cancellations within 24 hours may incur a fee. Please check your specific fare rules for exact cancellation terms.",
                },
            ],
        },
        {
            category: "Payment & Refunds",
            questions: [
                {
                    question: "What payment methods do you accept?",
                    answer: "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, Apple Pay, Google Pay, and bank transfers in select regions.",
                },
                {
                    question: "How long do refunds take?",
                    answer: "Refunds are processed within 7-10 business days. The time it takes to appear in your account depends on your bank or payment provider.",
                },
            ],
        },
        {
            category: "Baggage & Check-in",
            questions: [
                {
                    question: "What is the baggage allowance?",
                    answer: "Baggage allowance varies by airline and fare type. Typically, economy class includes 1 carry-on (up to 7kg) and 1 checked bag (up to 23kg). Check your booking details for specific allowances.",
                },
                {
                    question: "When can I check in online?",
                    answer: "Online check-in opens 24 hours before departure and closes 2 hours before departure for domestic flights, and 3 hours for international flights.",
                },
            ],
        },
    ];
    const filteredFAQs = faqCategories
        .map((category) => ({
        ...category,
        questions: category.questions.filter((q) => q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
            q.answer.toLowerCase().includes(searchTerm.toLowerCase())),
    }))
        .filter((category) => category.questions.length > 0);
    return (_jsx("div", { className: "min-h-screen bg-gradient-to-b from-cyan-50 to-white dark:from-gray-900 dark:to-gray-800", children: _jsx("div", { className: "container mx-auto px-4 py-12", children: _jsxs("div", { className: "max-w-4xl mx-auto", children: [_jsx("h1", { className: "text-4xl font-bold text-gray-900 dark:text-white mb-2", children: "Frequently Asked Questions" }), _jsx("p", { className: "text-lg text-gray-600 dark:text-gray-300 mb-8", children: "Find answers to common questions about booking, payments, and more." }), _jsxs("div", { className: "relative mb-8", children: [_jsx(Search, { className: "absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" }), _jsx("input", { type: "text", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), placeholder: "Search for questions...", className: "w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent" })] }), _jsx("div", { className: "space-y-6", children: filteredFAQs.map((category, categoryIndex) => (_jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden", children: [_jsx("div", { className: "p-6 border-b border-gray-200 dark:border-gray-700", children: _jsx("h2", { className: "text-2xl font-semibold text-gray-900 dark:text-white", children: category.category }) }), _jsx("div", { className: "divide-y divide-gray-200 dark:divide-gray-700", children: category.questions.map((item, index) => {
                                        const faqIndex = categoryIndex * 10 + index;
                                        const isOpen = openIndex === faqIndex;
                                        return (_jsxs("div", { className: "p-6", children: [_jsxs("button", { onClick: () => setOpenIndex(isOpen ? null : faqIndex), className: "flex items-center justify-between w-full text-left", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 dark:text-white pr-4", children: item.question }), isOpen ? (_jsx(ChevronUp, { className: "w-5 h-5 text-gray-500 flex-shrink-0" })) : (_jsx(ChevronDown, { className: "w-5 h-5 text-gray-500 flex-shrink-0" }))] }), isOpen && (_jsx("div", { className: "mt-4 animate-expand", children: _jsx("p", { className: "text-gray-600 dark:text-gray-300", children: item.answer }) }))] }, index));
                                    }) })] }, categoryIndex))) }), _jsxs("div", { className: "mt-8 p-6 bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-xl text-white", children: [_jsx("h3", { className: "text-xl font-semibold mb-2", children: "Still need help?" }), _jsx("p", { className: "mb-4 opacity-90", children: "Can't find what you're looking for? Our support team is ready to help." }), _jsxs("div", { className: "flex flex-wrap gap-4", children: [_jsx("a", { href: "/support/contact", className: "px-6 py-2 bg-white text-cyan-600 font-medium rounded-lg hover:bg-cyan-50 transition-colors", children: "Contact Us" }), _jsx("a", { href: "/support/chat", className: "px-6 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors", children: "Live Chat" })] })] })] }) }) }));
};
export default FAQ;
