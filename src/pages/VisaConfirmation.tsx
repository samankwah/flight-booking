import React from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

export default function VisaConfirmation() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const applicationId = searchParams.get("applicationId") || "APP" + Date.now();

  const handleDownloadReceipt = () => {
    // In a real app, this would generate and download a PDF receipt
    alert("Receipt download functionality would be implemented here");
  };

  const handleEmailConfirmation = () => {
    // In a real app, this would send a confirmation email
    alert("Confirmation email sent!");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Success Header */}
      <div className="bg-green-600 text-white">
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <svg className="w-16 h-16 text-green-200 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h1 className="text-3xl font-bold mb-2">Application Submitted Successfully!</h1>
          <p className="text-green-100 text-lg">
            Your visa application has been received and is being processed
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Application Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Application Details
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Application ID</span>
                  <span className="font-medium text-gray-900">{applicationId}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Submission Date</span>
                  <span className="font-medium text-gray-900">
                    {new Date().toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Status</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle cx={12} cy={12} r={10} />
                      <polyline points="12,6 12,12 16,14" />
                    </svg>
                    Under Review
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Processing Time</span>
                  <span className="font-medium text-gray-900">3-5 weeks</span>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                What Happens Next?
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">1</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Application Review</h3>
                    <p className="text-gray-600 text-sm">
                      Our team will review your application and documents within 2-3 business days.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">2</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Additional Information</h3>
                    <p className="text-gray-600 text-sm">
                      If we need any additional documents or information, we'll contact you via email.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">3</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Decision & Delivery</h3>
                    <p className="text-gray-600 text-sm">
                      Once approved, your visa will be delivered to your specified address or embassy.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Track Application */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Track Your Application
              </h2>
              <p className="text-gray-600 mb-4">
                You can track the status of your application using your Application ID.
              </p>
              <button
                onClick={() => navigate(`/visa/track?applicationId=${applicationId}`)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Track Application Status
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button
                  onClick={handleDownloadReceipt}
                  className="w-full flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download Receipt
                </button>
                <button
                  onClick={handleEmailConfirmation}
                  className="w-full flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Email Confirmation
                </button>
                <button
                  onClick={() => window.open('tel:+1234567890', '_self')}
                  className="w-full flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Call Support
                </button>
              </div>
            </div>

            {/* Important Information */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-yellow-800 mb-3">
                Important Information
              </h3>
              <ul className="text-sm text-yellow-700 space-y-2">
                <li>• Keep your Application ID safe</li>
                <li>• Check your email for updates</li>
                <li>• Have your passport ready for embassy appointment</li>
                <li>• Processing times may vary during peak seasons</li>
              </ul>
            </div>

            {/* Contact Support */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">
                Need Help?
              </h3>
              <p className="text-blue-700 mb-4">
                Our support team is here to help with any questions about your application.
              </p>
              <div className="space-y-2">
                <p className="text-sm text-blue-700">
                  <strong>Email:</strong> support@visaapp.com
                </p>
                <p className="text-sm text-blue-700">
                  <strong>Phone:</strong> +1 (555) 123-4567
                </p>
                <p className="text-sm text-blue-700">
                  <strong>Hours:</strong> Mon-Fri 9AM-6PM GMT
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate("/")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    </div>
  );
}
