import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef } from "react";
import { Send, MessageCircle, User, Clock, Check } from "lucide-react";
const LiveChat = () => {
    const [messages, setMessages] = useState([
        {
            id: 1,
            text: "Hello! Welcome to Flight Booking Support. How can I help you today?",
            sender: "agent",
            time: "10:00 AM",
        },
        {
            id: 2,
            text: "Hi, I need help with my booking modification.",
            sender: "user",
            time: "10:01 AM",
        },
        {
            id: 3,
            text: "Sure, I'd be happy to help with that. Can you please provide your booking reference number?",
            sender: "agent",
            time: "10:02 AM",
        },
    ]);
    const [newMessage, setNewMessage] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [agentStatus, setAgentStatus] = useState("online");
    const messagesEndRef = useRef(null);
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    useEffect(() => {
        scrollToBottom();
    }, [messages]);
    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim())
            return;
        const userMessage = {
            id: messages.length + 1,
            text: newMessage,
            sender: "user",
            time: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            }),
        };
        setMessages((prev) => [...prev, userMessage]);
        setNewMessage("");
        // Simulate agent typing
        setIsTyping(true);
        setTimeout(() => {
            const agentMessage = {
                id: messages.length + 2,
                text: "Thank you for your message. Our support agent will respond shortly.",
                sender: "agent",
                time: new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                }),
            };
            setMessages((prev) => [...prev, agentMessage]);
            setIsTyping(false);
        }, 2000);
    };
    return (_jsx("div", { className: "min-h-screen bg-gradient-to-b from-cyan-50 to-white dark:from-gray-900 dark:to-gray-800", children: _jsx("div", { className: "container mx-auto px-4 py-12", children: _jsx("div", { className: "max-w-6xl mx-auto", children: _jsxs("div", { className: "flex flex-col lg:flex-row gap-8", children: [_jsx("div", { className: "lg:w-2/3", children: _jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden", children: [_jsx("div", { className: "p-6 border-b border-gray-200 dark:border-gray-700", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "p-2 bg-green-100 dark:bg-green-900/30 rounded-lg", children: _jsx(MessageCircle, { className: "w-6 h-6 text-green-600 dark:text-green-400" }) }), _jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900 dark:text-white", children: "Live Chat Support" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: `w-2 h-2 rounded-full ${agentStatus === "online"
                                                                                ? "bg-green-500"
                                                                                : "bg-gray-400"}` }), _jsxs("span", { className: "text-sm text-gray-600 dark:text-gray-400", children: ["Support Agent \u2022", " ", agentStatus === "online" ? "Online now" : "Away"] })] })] })] }), _jsxs("div", { className: "flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400", children: [_jsx(Clock, { className: "w-4 h-4" }), _jsx("span", { children: "Avg. response time: 2 min" })] })] }) }), _jsx("div", { className: "h-[500px] overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900/50", children: _jsxs("div", { className: "space-y-4", children: [messages.map((message) => (_jsx("div", { className: `flex ${message.sender === "user"
                                                        ? "justify-end"
                                                        : "justify-start"}`, children: _jsxs("div", { className: `max-w-[70%] rounded-2xl px-4 py-3 ${message.sender === "user"
                                                            ? "bg-cyan-500 text-white rounded-br-none"
                                                            : "bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none border border-gray-200 dark:border-gray-600"}`, children: [_jsx("p", { children: message.text }), _jsxs("div", { className: `flex items-center gap-1 mt-1 text-xs ${message.sender === "user"
                                                                    ? "text-cyan-200"
                                                                    : "text-gray-500"}`, children: [_jsx("span", { children: message.time }), message.sender === "user" && (_jsx(Check, { className: "w-3 h-3" }))] })] }) }, message.id))), isTyping && (_jsx("div", { className: "flex justify-start", children: _jsx("div", { className: "bg-white dark:bg-gray-700 rounded-2xl rounded-bl-none px-4 py-3 border border-gray-200 dark:border-gray-600", children: _jsxs("div", { className: "flex items-center gap-1", children: [_jsx("div", { className: "w-2 h-2 bg-gray-400 rounded-full animate-bounce" }), _jsx("div", { className: "w-2 h-2 bg-gray-400 rounded-full animate-bounce", style: { animationDelay: "0.2s" } }), _jsx("div", { className: "w-2 h-2 bg-gray-400 rounded-full animate-bounce", style: { animationDelay: "0.4s" } })] }) }) })), _jsx("div", { ref: messagesEndRef })] }) }), _jsx("div", { className: "p-6 border-t border-gray-200 dark:border-gray-700", children: _jsxs("form", { onSubmit: handleSendMessage, className: "flex gap-3", children: [_jsx("input", { type: "text", value: newMessage, onChange: (e) => setNewMessage(e.target.value), placeholder: "Type your message here...", className: "flex-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent" }), _jsxs("button", { type: "submit", className: "px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-colors flex items-center gap-2", children: [_jsx(Send, { className: "w-5 h-5" }), "Send"] })] }) })] }) }), _jsx("div", { className: "lg:w-1/3", children: _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg", children: [_jsx("h3", { className: "text-xl font-semibold text-gray-900 dark:text-white mb-4", children: "Quick Actions" }), _jsxs("div", { className: "space-y-3", children: [_jsx("button", { className: "w-full px-4 py-3 text-left rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors", children: "\uD83D\uDCCB Request booking modification" }), _jsx("button", { className: "w-full px-4 py-3 text-left rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors", children: "\uD83D\uDCB0 Check refund status" }), _jsx("button", { className: "w-full px-4 py-3 text-left rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors", children: "\uD83E\uDDF3 Baggage inquiry" })] })] }), _jsxs("div", { className: "bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl p-6 text-white", children: [_jsxs("div", { className: "flex items-center gap-3 mb-4", children: [_jsx("div", { className: "p-2 bg-white/20 rounded-lg", children: _jsx(User, { className: "w-6 h-6" }) }), _jsxs("div", { children: [_jsx("h3", { className: "text-xl font-semibold", children: "Support Agent" }), _jsx("p", { className: "opacity-90", children: "Sarah Johnson" })] })] }), _jsxs("p", { className: "mb-4 opacity-90", children: ["Average rating: ", _jsx("span", { className: "font-semibold", children: "4.8/5" })] }), _jsxs("div", { className: "text-sm opacity-80", children: [_jsx("p", { children: "\u2022 24/7 availability" }), _jsx("p", { children: "\u2022 2 min average response time" }), _jsx("p", { children: "\u2022 98% satisfaction rate" })] })] }), _jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg", children: [_jsx("h3", { className: "text-xl font-semibold text-gray-900 dark:text-white mb-4", children: "Other Ways to Contact" }), _jsxs("div", { className: "space-y-3", children: [_jsx("a", { href: "/support/contact", className: "block px-4 py-3 rounded-lg border border-cyan-200 dark:border-cyan-800 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 transition-colors", children: "\uD83D\uDCE7 Send an Email" }), _jsx("a", { href: "/support/faq", className: "block px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors", children: "\u2753 Browse FAQ" }), _jsx("button", { className: "w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors", children: "\uD83D\uDCDE Call: +1 (800) 123-4567" })] })] })] }) })] }) }) }) }));
};
export default LiveChat;
