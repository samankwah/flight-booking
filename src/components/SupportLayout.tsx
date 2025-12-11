import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  MdChevronRight as ChevronRight,
  MdHome as Home,
  MdChat as MessageCircle,
  MdHelp as HelpCircle,
  MdEmail as Mail,
} from "react-icons/md";

interface SupportLayoutProps {
  children: React.ReactNode;
}

const SupportLayout: React.FC<SupportLayoutProps> = ({ children }) => {
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
  } else if (location.pathname === "/support/faq") {
    breadcrumbs.push({ name: "FAQ", path: "/support/faq", icon: HelpCircle });
  } else if (location.pathname === "/support/chat") {
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Breadcrumb */}
      <div className="border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            {breadcrumbs.map((item, index) => (
              <React.Fragment key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-1 ${
                    index === breadcrumbs.length - 1
                      ? "text-gray-900 dark:text-white font-medium"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  {item.icon && <item.icon className="w-4 h-4" />}
                  <span>{item.name}</span>
                </Link>
                {index < breadcrumbs.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                )}
              </React.Fragment>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Show on FAQ and Contact pages */}
          {location.pathname !== "/support/chat" && (
            <div className="lg:w-1/4">
              <div className="sticky top-24 space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Support Center
                  </h3>
                  <div className="space-y-2">
                    {supportLinks.map((link) => (
                      <Link
                        key={link.path}
                        to={link.path}
                        className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                          location.pathname === link.path
                            ? "bg-blue-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400"
                            : "hover:bg-gray-50 dark:hover:bg-gray-700"
                        }`}
                      >
                        <link.icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="font-medium">{link.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {link.description}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Quick Help */}
                <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl p-6 text-white">
                  <h3 className="text-lg font-semibold mb-2">
                    Need Immediate Help?
                  </h3>
                  <p className="text-sm opacity-90 mb-4">
                    Our support team is available 24/7 to assist you.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Phone Support</span>
                      <span className="font-semibold">+1 (800) 123-4567</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Email</span>
                      <span className="font-semibold">
                        support@flightbooking.com
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Page Content */}
          <div
            className={
              location.pathname === "/support/chat" ? "w-full" : "lg:w-3/4"
            }
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportLayout;
