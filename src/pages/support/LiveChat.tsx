import React, { useState, useEffect, useRef } from "react";
import { Send, MessageCircle, User, Clock, Check } from "lucide-react";

const LiveChat: React.FC = () => {
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      text: newMessage,
      sender: "user" as const,
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
        sender: "agent" as const,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, agentMessage]);
      setIsTyping(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Chat Window */}
            <div className="lg:w-2/3">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden">
                {/* Chat Header */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <MessageCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                          Live Chat Support
                        </h1>
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              agentStatus === "online"
                                ? "bg-green-500"
                                : "bg-gray-400"
                            }`}
                          />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Support Agent •{" "}
                            {agentStatus === "online" ? "Online now" : "Away"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Clock className="w-4 h-4" />
                      <span>Avg. response time: 2 min</span>
                    </div>
                  </div>
                </div>

                {/* Messages Container */}
                <div className="h-[500px] overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900/50">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.sender === "user"
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                            message.sender === "user"
                              ? "bg-cyan-500 text-white rounded-br-none"
                              : "bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none border border-gray-200 dark:border-gray-600"
                          }`}
                        >
                          <p>{message.text}</p>
                          <div
                            className={`flex items-center gap-1 mt-1 text-xs ${
                              message.sender === "user"
                                ? "text-cyan-200"
                                : "text-gray-500"
                            }`}
                          >
                            <span>{message.time}</span>
                            {message.sender === "user" && (
                              <Check className="w-3 h-3" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="bg-white dark:bg-gray-700 rounded-2xl rounded-bl-none px-4 py-3 border border-gray-200 dark:border-gray-600">
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                            <div
                              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0.2s" }}
                            />
                            <div
                              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0.4s" }}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>
                </div>

                {/* Message Input */}
                <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                  <form onSubmit={handleSendMessage} className="flex gap-3">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message here..."
                      className="flex-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <button
                      type="submit"
                      className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-colors flex items-center gap-2"
                    >
                      <Send className="w-5 h-5" />
                      Send
                    </button>
                  </form>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:w-1/3">
              <div className="space-y-6">
                {/* Quick Actions */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Quick Actions
                  </h3>
                  <div className="space-y-3">
                    <button className="w-full px-4 py-3 text-left rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      📋 Request booking modification
                    </button>
                    <button className="w-full px-4 py-3 text-left rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      💰 Check refund status
                    </button>
                    <button className="w-full px-4 py-3 text-left rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      🧳 Baggage inquiry
                    </button>
                  </div>
                </div>

                {/* Support Info */}
                <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl p-6 text-white">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <User className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">Support Agent</h3>
                      <p className="opacity-90">Sarah Johnson</p>
                    </div>
                  </div>
                  <p className="mb-4 opacity-90">
                    Average rating: <span className="font-semibold">4.8/5</span>
                  </p>
                  <div className="text-sm opacity-80">
                    <p>• 24/7 availability</p>
                    <p>• 2 min average response time</p>
                    <p>• 98% satisfaction rate</p>
                  </div>
                </div>

                {/* Alternative Contact */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Other Ways to Contact
                  </h3>
                  <div className="space-y-3">
                    <a
                      href="/support/contact"
                      className="block px-4 py-3 rounded-lg border border-cyan-200 dark:border-cyan-800 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 transition-colors"
                    >
                      📧 Send an Email
                    </a>
                    <a
                      href="/support/faq"
                      className="block px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      ❓ Browse FAQ
                    </a>
                    <button className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      📞 Call: +1 (800) 123-4567
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveChat;
