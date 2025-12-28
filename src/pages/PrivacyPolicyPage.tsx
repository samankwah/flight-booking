import React from 'react';

const PrivacyPolicyPage: React.FC = () => {
  const sections = [
    {
      title: '1. Information We Collect',
      content: `We collect information that you provide directly to us when using our services, including:

• Personal Information: Name, email address, phone number, date of birth, passport information
• Payment Information: Credit card details, billing address (processed securely through encrypted channels)
• Travel Information: Flight preferences, booking history, travel companions
• Technical Information: IP address, browser type, device information, cookies, and usage data

We collect this information to provide you with flight booking services, process payments, communicate important updates, and improve your overall experience.`,
    },
    {
      title: '2. How We Use Your Information',
      content: `Your information is used for the following purposes:

• Processing and managing your flight bookings
• Communicating booking confirmations, updates, and travel information
• Processing payments and preventing fraud
• Providing customer support and responding to inquiries
• Sending promotional offers and travel deals (with your consent)
• Improving our services and user experience
• Complying with legal obligations and regulations
• Analyzing usage patterns to enhance our platform

We never sell your personal information to third parties for their marketing purposes.`,
    },
    {
      title: '3. Information Sharing',
      content: `We may share your information with:

• Airlines and Travel Partners: To complete your bookings and provide travel services
• Payment Processors: To securely process your payments
• Service Providers: Third-party vendors who help us operate our platform (cloud hosting, analytics, customer support)
• Legal Authorities: When required by law or to protect our rights and users

All third parties are contractually obligated to keep your information confidential and use it only for the purposes we specify.`,
    },
    {
      title: '4. Data Security',
      content: `We implement robust security measures to protect your information:

• SSL/TLS encryption for all data transmission
• Secure payment processing compliant with PCI DSS standards
• Regular security audits and vulnerability assessments
• Access controls and authentication protocols
• Data encryption at rest and in transit
• Employee training on data protection and privacy

While we strive to protect your information, no method of transmission over the internet is 100% secure. We encourage you to use strong passwords and protect your account credentials.`,
    },
    {
      title: '5. Cookies and Tracking',
      content: `We use cookies and similar tracking technologies to:

• Remember your preferences and settings
• Analyze site traffic and usage patterns
• Provide personalized content and advertisements
• Enable certain features and functionality

You can control cookie settings through your browser preferences. However, disabling cookies may limit some features of our platform.`,
    },
    {
      title: '6. Your Rights',
      content: `You have the following rights regarding your personal data:

• Access: Request a copy of your personal information
• Correction: Update or correct inaccurate information
• Deletion: Request deletion of your personal data (subject to legal requirements)
• Objection: Object to certain processing of your information
• Portability: Receive your data in a portable format
• Withdrawal of Consent: Opt-out of marketing communications at any time

To exercise these rights, please contact our privacy team at privacy@flightbooking.com.`,
    },
    {
      title: '7. Data Retention',
      content: `We retain your personal information for as long as necessary to:

• Fulfill the purposes outlined in this policy
• Comply with legal, accounting, or reporting requirements
• Resolve disputes and enforce our agreements
• Maintain booking records for customer service purposes

Booking and transaction records are typically retained for 7 years for legal and accounting purposes. Marketing data is retained until you opt-out or request deletion.`,
    },
    {
      title: '8. International Data Transfers',
      content: `Your information may be transferred to and processed in countries other than your country of residence. We ensure appropriate safeguards are in place to protect your data in accordance with this privacy policy and applicable laws.`,
    },
    {
      title: '9. Children\'s Privacy',
      content: `Our services are not directed to children under 13 years of age. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.`,
    },
    {
      title: '10. Changes to This Policy',
      content: `We may update this privacy policy from time to time. We will notify you of significant changes by:

• Posting the updated policy on our website
• Sending email notifications to registered users
• Displaying a prominent notice on our platform

Your continued use of our services after changes constitutes acceptance of the updated policy.`,
    },
    {
      title: '11. Contact Us',
      content: `If you have questions or concerns about this privacy policy or our data practices, please contact us:

Email: privacy@flightbooking.com
Phone: +1-800-FLIGHT-BOOK
Address: Flight Booking Inc., 123 Aviation Blvd, Sky City, SC 12345

Data Protection Officer: dpo@flightbooking.com`,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-cyan-600 to-blue-700 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
            <p className="text-xl text-cyan-100">
              Last updated: December 27, 2025
            </p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Introduction */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <p className="text-lg text-gray-700 leading-relaxed">
              At Flight Booking, we are committed to protecting your privacy and ensuring the
              security of your personal information. This Privacy Policy explains how we collect,
              use, share, and protect your information when you use our flight booking services.
              By using our platform, you consent to the practices described in this policy.
            </p>
          </div>

          {/* Policy Sections */}
          {sections.map((section, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-8 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{section.title}</h2>
              <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                {section.content}
              </div>
            </div>
          ))}

          {/* Footer Note */}
          <div className="bg-cyan-50 rounded-xl p-6 border-l-4 border-cyan-600">
            <p className="text-gray-700">
              <strong>Note:</strong> This privacy policy is designed to comply with GDPR, CCPA, and other
              international data protection regulations. We are committed to transparency and protecting
              your rights as a user.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
