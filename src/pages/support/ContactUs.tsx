import React from "react";

const ContactUs: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
            Contact Us
          </h1>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 mb-6 sm:mb-8">
            We're here to help! Get in touch with our customer support team.
          </p>

          <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 mb-8 sm:mb-10 md:mb-12">
            {/* Contact Info */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-5 md:p-6 shadow-lg">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
                Contact Information
              </h2>

              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-700 dark:text-gray-300">
                    Email
                  </h3>
                  <p className="text-cyan-600 dark:text-cyan-400">
                    support@flightbooking.com
                  </p>
                </div>

                <div>
                  <h3 className="font-medium text-gray-700 dark:text-gray-300">
                    Phone
                  </h3>
                  <p className="text-gray-900 dark:text-white">
                    +1 (800) 123-4567
                  </p>
                </div>

                <div>
                  <h3 className="font-medium text-gray-700 dark:text-gray-300">
                    Business Hours
                  </h3>
                  <p className="text-gray-900 dark:text-white">
                    24/7 Customer Support
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-5 md:p-6 shadow-lg">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
                Send us a Message
              </h2>

              <form className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Message
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="How can we help you?"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 sm:py-3 px-4 text-sm sm:text-base bg-cyan-400 hover:bg-cyan-500 text-white font-medium rounded-lg transition-colors"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>

          {/* FAQ Preview */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-5 md:p-6 shadow-lg">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
              Quick Help
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-3 sm:mb-4">
              Check our{" "}
              <a
                href="/support/faq"
                className="text-cyan-600 dark:text-cyan-400 hover:underline"
              >
                FAQ page
              </a>{" "}
              for quick answers to common questions.
            </p>
            <a
              href="/support/chat"
              className="inline-flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
            >
              Start Live Chat
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
