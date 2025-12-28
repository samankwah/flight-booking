import React from "react";
import { MdCheckCircle, MdCancel, MdInfo } from "react-icons/md";

const RefundPolicyPage: React.FC = () => {
  const refundTypes = [
    {
      title: "Refundable Tickets",
      icon: MdCheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      items: [
        "Full refund available (minus cancellation fees)",
        "Can be cancelled up to departure time",
        "Refund processed within 7-21 business days",
        "Higher ticket price compared to non-refundable",
      ],
    },
    {
      title: "Non-Refundable Tickets",
      icon: MdCancel,
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      items: [
        "No refund for voluntary cancellations",
        "May receive tax refund only (airline dependent)",
        "Changes subject to fees and fare difference",
        "Lower ticket price but limited flexibility",
      ],
    },
    {
      title: "Partially Refundable",
      icon: MdInfo,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      items: [
        "Partial refund after deducting penalties",
        "Refund amount varies by airline and fare rules",
        "Time limits may apply for cancellations",
        "Check specific fare conditions before booking",
      ],
    },
  ];

  const sections = [
    {
      title: "1. General Refund Policy",
      content: `Our refund policy is determined by the fare rules of the airline and ticket type you've purchased. Flight Booking processes refund requests according to these airline policies.

Key Points:
• Refund eligibility depends on your ticket type (refundable vs. non-refundable)
• Processing time varies from 7-21 business days depending on payment method
• Flight Booking service fees are non-refundable in most cases
• Refunds are issued to the original payment method used for booking`,
    },
    {
      title: "2. Refund Request Process",
      content: `To request a refund, follow these steps:

1. Log in to your Flight Booking account
2. Navigate to "My Bookings"
3. Select the booking you wish to cancel
4. Click "Request Refund" or "Cancel Booking"
5. Fill out the cancellation form with reason
6. Submit the request

Alternatively, contact our customer support team:
• Email: refunds@flightbooking.com
• Phone: +1-800-FLIGHT-BOOK
• Live Chat: Available 24/7

Please have your booking reference number ready when contacting us.`,
    },
    {
      title: "3. Refund Processing Time",
      content: `Refund processing times vary by payment method:

Credit/Debit Cards: 7-14 business days
PayPal: 5-10 business days
Bank Transfer: 10-21 business days
Mobile Money: 3-7 business days

Note: Processing time starts after airline approval of the refund request. During peak travel seasons, processing may take longer.`,
    },
    {
      title: "4. Airline-Initiated Cancellations",
      content: `If your flight is cancelled by the airline:

• You are entitled to a full refund regardless of ticket type
• No cancellation fees apply
• Refunds include all taxes and fees
• You may also be entitled to rebooking or compensation

Alternative Options:
• Accept rebooking on alternative flights
• Request travel vouchers (may include additional value)
• Combination of partial refund and rebooking

Airlines must inform passengers of their rights under applicable regulations.`,
    },
    {
      title: "5. Flight Delays and Schedule Changes",
      content: `For significant flight delays or schedule changes:

• Delays over 3 hours may qualify for refund or compensation
• Schedule changes of more than 2 hours may allow free cancellation
• Check airline policy and local regulations (EU261, DOT rules, etc.)
• Compensation amounts vary by delay duration and distance

Contact the airline directly for delay compensation claims.`,
    },
    {
      title: "6. Service Fee Refunds",
      content: `Flight Booking Service Fees:

• Service fees are non-refundable in most cases
• Exception: If we make an error in processing your booking
• Exception: If airline cancels flight due to operational reasons
• Payment processing fees are non-refundable

The service fee covers our booking and support services and is charged separately from your flight ticket.`,
    },
    {
      title: "7. Special Circumstances",
      content: `Refunds may be considered for special circumstances:

Medical Emergencies:
• Provide valid medical documentation
• Subject to airline and insurance policy approval
• May require travel insurance claim

Death of Passenger or Immediate Family:
• Full refund typically provided
• Death certificate required
• Contact support immediately for expedited processing

Visa Denials:
• Refund subject to airline policy
• Proof of visa denial required
• May incur cancellation fees

Natural Disasters/Force Majeure:
• Refund or rebooking options available
• Subject to airline waiver policies
• Check travel advisories and airline announcements`,
    },
    {
      title: "8. Group Bookings",
      content: `Group booking refund policies (10+ passengers):

• Subject to specific group fare rules
• Different cancellation deadlines may apply
• Partial cancellations may be allowed
• Contact our group booking department for assistance

Group booking terms are negotiated separately and may differ from individual bookings.`,
    },
    {
      title: "9. Refund Exceptions",
      content: `Refunds will NOT be issued for:

• No-shows (failure to board without prior cancellation)
• Missed flights due to late arrival at airport
• Incorrect passenger information (name, DOB, passport)
• Denied boarding due to invalid travel documents
• Voluntary changes to travel plans (non-refundable tickets)
• Cancellations made after departure time

Always cancel before departure time to preserve refund eligibility.`,
    },
    {
      title: "10. Dispute Resolution",
      content: `If you disagree with a refund decision:

1. Contact our customer support team with your concerns
2. Provide all relevant documentation
3. Request a review of your case
4. If unresolved, escalate to our complaints department
5. Final recourse: File complaint with relevant aviation authority

We aim to resolve all disputes fairly and promptly within 30 days.`,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-cyan-600 to-blue-700 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              Refund Policy
            </h1>
            <p className="text-xl text-cyan-100">
              Last updated: December 27, 2025
            </p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 py-12 ">
        <div className="max-w-4xl mx-auto">
          {/* Introduction */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              At Flight Booking, we understand that travel plans can change.
              This Refund Policy outlines the terms and conditions for
              cancellations and refunds. Refund eligibility depends on the
              airline's fare rules and the type of ticket purchased.
            </p>
            <p className="text-gray-600">
              <strong>Important:</strong> Please review the fare conditions
              carefully before booking. We recommend purchasing travel insurance
              for added protection.
            </p>
          </div>

          {/* Refund Types */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
              Ticket Types & Refund Eligibility
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {refundTypes.map((type, index) => (
                <div
                  key={index}
                  className={`${type.bgColor} border-2 ${type.borderColor} rounded-xl p-6`}
                >
                  <type.icon className={`w-12 h-12 ${type.color} mb-4`} />
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {type.title}
                  </h3>
                  <ul className="space-y-2">
                    {type.items.map((item, idx) => (
                      <li
                        key={idx}
                        className="text-sm text-gray-700 flex items-start"
                      >
                        <span className="mr-2">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Policy Sections */}
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

          {/* Important Notice */}
          <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Important Notice
            </h3>
            <p className="text-gray-700 mb-4">
              This refund policy is a guideline. Final refund decisions are
              subject to airline policies and fare rules. We act as an
              intermediary and process refunds according to airline terms.
            </p>
            <p className="text-gray-700">
              For specific questions about your booking's refund eligibility,
              please contact our customer support team at{" "}
              <strong>refunds@flightbooking.com</strong> or call
              <strong> +1-800-FLIGHT-BOOK</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RefundPolicyPage;
