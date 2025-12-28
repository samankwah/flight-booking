import React from "react";

const TermsPage: React.FC = () => {
  const sections = [
    {
      title: "1. Acceptance of Terms",
      content: `By accessing and using Flight Booking's website and services, you accept and agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you may not use our services.

These terms apply to all users, including browsers, customers, and contributors of content. We reserve the right to update, change, or replace any part of these Terms and Conditions at any time. It is your responsibility to check this page periodically for changes.`,
    },
    {
      title: "2. Use of Services",
      content: `You agree to use our services only for lawful purposes and in accordance with these Terms. You must not:

• Use our services in any way that violates applicable laws or regulations
• Impersonate any person or entity, or falsely state your affiliation
• Engage in any conduct that restricts or inhibits anyone's use of our services
• Use automated systems (bots, scripts, etc.) to access our services without authorization
• Attempt to gain unauthorized access to our systems or networks
• Transmit viruses, malware, or any other harmful code
• Collect or store personal data about other users without consent

We reserve the right to refuse service, terminate accounts, or cancel bookings at our discretion.`,
    },
    {
      title: "3. Account Registration",
      content: `To access certain features, you may be required to create an account. You agree to:

• Provide accurate, current, and complete information during registration
• Maintain and promptly update your account information
• Maintain the security of your password and account credentials
• Notify us immediately of any unauthorized use of your account
• Accept responsibility for all activities that occur under your account

You may not use another person's account without permission. We reserve the right to suspend or terminate accounts that violate these terms.`,
    },
    {
      title: "4. Bookings and Payments",
      content: `When you make a booking through our platform:

• You enter into a contract with the airline or service provider, not with Flight Booking
• You are responsible for ensuring all passenger information is accurate
• Prices are subject to change until payment is confirmed
• All payments must be made in full before travel
• Additional fees (baggage, seat selection, etc.) may apply from airlines
• Currency conversion fees may apply for international bookings

We act as an intermediary between you and the airline. Final terms and conditions are governed by the airline's policies.`,
    },
    {
      title: "5. Pricing and Availability",
      content: `Flight Booking strives to provide accurate pricing and availability information:

• Prices displayed are subject to availability and may change without notice
• We reserve the right to correct pricing errors at any time
• If a price error occurs after booking, we will notify you and give you the option to cancel
• Promotional codes and discounts are subject to specific terms and conditions
• Taxes, fees, and surcharges are included unless otherwise stated

Flight availability is subject to airline capacity and booking policies.`,
    },
    {
      title: "6. Cancellations and Refunds",
      content: `Cancellation and refund policies vary by airline and fare type:

• Refund eligibility depends on the fare conditions selected at booking
• Non-refundable tickets may only receive taxes back (subject to airline policy)
• Cancellation fees may apply as per airline terms
• Refund processing may take 7-21 business days depending on payment method
• Flight Booking service fees are generally non-refundable

Please review our detailed Refund Policy page for complete information.`,
    },
    {
      title: "7. Travel Documents",
      content: `You are responsible for ensuring you have all required travel documents:

• Valid passport (must be valid for at least 6 months from travel date)
• Visas and entry permits for your destination
• Health certificates or vaccination records as required
• Any other documentation required by airlines or authorities

Flight Booking is not responsible for denied boarding or entry due to missing or invalid documents.`,
    },
    {
      title: "8. Travel Insurance",
      content: `We strongly recommend purchasing travel insurance to protect against:

• Trip cancellations and interruptions
• Medical emergencies while traveling
• Lost or delayed baggage
• Flight delays and missed connections

Travel insurance is optional but highly recommended. Flight Booking is not liable for losses that could have been covered by insurance.`,
    },
    {
      title: "9. Limitation of Liability",
      content: `To the fullest extent permitted by law:

• Flight Booking acts as an intermediary and is not liable for airline delays, cancellations, or service issues
• We are not responsible for any indirect, consequential, or punitive damages
• Our total liability is limited to the amount you paid for our booking services
• We do not guarantee uninterrupted or error-free service
• We are not liable for third-party content or services linked from our platform

Airlines are responsible for flight operations and passenger services.`,
    },
    {
      title: "10. Intellectual Property",
      content: `All content on Flight Booking's platform is protected by copyright and trademark laws:

• You may not reproduce, distribute, or create derivative works without permission
• Our logo, brand name, and trademarks are our property
• User-generated content may be used by Flight Booking for promotional purposes
• You grant us a license to use feedback and suggestions you provide

Unauthorized use of our intellectual property may result in legal action.`,
    },
    {
      title: "11. Dispute Resolution",
      content: `In the event of a dispute:

• Contact our customer support team first to seek resolution
• If unresolved, disputes may be subject to binding arbitration
• Arbitration will be conducted under the rules of [Arbitration Association]
• You agree to waive the right to participate in class action lawsuits
• Governing law is [Jurisdiction]

These terms do not limit any statutory rights that cannot be waived.`,
    },
    {
      title: "12. Force Majeure",
      content: `Flight Booking is not liable for failure to perform due to circumstances beyond our control, including:

• Natural disasters, pandemics, or health emergencies
• War, terrorism, or civil unrest
• Government actions or regulations
• Strikes or labor disputes
• Technical failures or internet outages

In such cases, we will make reasonable efforts to resume service as soon as possible.`,
    },
    {
      title: "13. Amendments",
      content: `We reserve the right to modify these Terms and Conditions at any time. Changes will be effective immediately upon posting to our website. Your continued use of our services after changes constitutes acceptance of the modified terms.`,
    },
    {
      title: "14. Contact Information",
      content: `For questions about these Terms and Conditions, contact us at:

Email: legal@flightbooking.com
Phone: +1-800-FLIGHT-BOOK
Address: Flight Booking Inc., 123 Aviation Blvd, Sky City, SC 12345`,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-cyan-600 to-blue-700 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              Terms & Conditions
            </h1>
            <p className="text-xl text-cyan-100">
              Last updated: December 27, 2025
            </p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 py-12 text-justify">
        <div className="max-w-4xl mx-auto">
          {/* Introduction */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <p className="text-lg text-gray-700 leading-relaxed">
              Welcome to Flight Booking. These Terms and Conditions govern your
              use of our website and booking services. Please read these terms
              carefully before using our platform. By accessing or using our
              services, you agree to be bound by these terms.
            </p>
          </div>

          {/* Terms Sections */}
          {sections.map((section, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-8 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {section.title}
              </h2>
              <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                {section.content}
              </div>
            </div>
          ))}

          {/* Acknowledgment */}
          <div className="bg-cyan-50 rounded-xl p-6 border-l-4 border-cyan-600">
            <p className="text-gray-700">
              <strong>
                By using Flight Booking's services, you acknowledge that you
                have read, understood, and agree to be bound by these Terms and
                Conditions.
              </strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
