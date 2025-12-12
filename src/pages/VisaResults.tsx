import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

interface VisaOption {
  id: string;
  type: string;
  name: string;
  description: string;
  processingTime: string;
  validity: string;
  price: number;
  currency: string;
  requiredDocuments: string[];
  features: string[];
  recommended: boolean;
  urgent: boolean;
}

const mockVisaOptions: VisaOption[] = [
  {
    id: "uk-standard-visitor",
    type: "visitor",
    name: "Standard Visitor Visa",
    description: "Perfect for tourism, visiting family, or short business trips",
    processingTime: "3-5 weeks",
    validity: "Up to 6 months",
    price: 95,
    currency: "GBP",
    requiredDocuments: [
      "Valid passport",
      "Recent passport-sized photos",
      "Proof of travel purpose",
      "Financial proof",
      "Accommodation details"
    ],
    features: [
      "Multiple entries allowed",
      "Family visits permitted",
      "Business meetings possible",
      "90 days maximum stay"
    ],
    recommended: true,
    urgent: false
  },
  {
    id: "uk-super-priority-visitor",
    type: "visitor",
    name: "Super Priority Visitor Visa",
    description: "Express processing for urgent travel needs",
    processingTime: "1-2 days",
    validity: "Up to 6 months",
    price: 195,
    currency: "GBP",
    requiredDocuments: [
      "Valid passport",
      "Recent passport-sized photos",
      "Proof of urgent travel",
      "Financial proof",
      "Flight itinerary"
    ],
    features: [
      "Fast-track processing",
      "Priority appointment",
      "Express delivery",
      "Same validity as standard visa"
    ],
    recommended: false,
    urgent: true
  },
  {
    id: "uk-business-visa",
    type: "business",
    name: "Business Visa",
    description: "For business meetings, conferences, and commercial activities",
    processingTime: "2-4 weeks",
    validity: "Up to 5 years",
    price: 120,
    currency: "GBP",
    requiredDocuments: [
      "Valid passport",
      "Business invitation letter",
      "Company documents",
      "Financial statements",
      "Travel itinerary"
    ],
    features: [
      "Multiple entries",
      "Long-term validity",
      "Business activities permitted",
      "Family accompaniment possible"
    ],
    recommended: false,
    urgent: false
  }
];

function VisaResults() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [selectedVisa, setSelectedVisa] = useState<VisaOption | null>(null);
  const [visaOptions, setVisaOptions] = useState<VisaOption[]>([]);

  const visaCountry = searchParams.get("country") || "";
  const nationality = searchParams.get("nationality") || "";
  const travelDate = searchParams.get("travelDate") || "";

  useEffect(() => {
    // Filter visa options based on search parameters
    // In a real app, this would be an API call
    let filteredOptions = [...mockVisaOptions];

    // For demo purposes, we'll show all options
    // In production, filter based on nationality requirements
    setVisaOptions(filteredOptions);
  }, [visaCountry, nationality]);

  const handleApplyNow = (visa: VisaOption) => {
    setSelectedVisa(visa);
    // Navigate to application page with visa details
    navigate(`/visa/apply?visaId=${visa.id}&country=${visaCountry}&nationality=${nationality}&travelDate=${travelDate}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Visa Options for {nationality} Citizens
              </h1>
              <p className="text-gray-600 mt-1">
                Traveling to {visaCountry} • Departure: {travelDate ? new Date(travelDate).toLocaleDateString() : "Not specified"}
              </p>
            </div>
            <button
              onClick={() => navigate("/")}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              ← Back to Search
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Visa Options */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  Available Visa Options
                </h2>
                <p className="text-gray-600 mt-1">
                  Choose the visa type that best fits your travel purpose
                </p>
              </div>

              <div className="divide-y divide-gray-200">
                {visaOptions.map((visa) => (
                  <div key={visa.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {visa.name}
                          </h3>
                          {visa.recommended && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Recommended
                            </span>
                          )}
                          {visa.urgent && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <circle cx={12} cy={12} r={10} />
                                <line x1={12} y1={8} x2={12} y2={12} />
                                <line x1={12} y1={16} x2={12.01} y2={16} />
                              </svg>
                              Express
                            </span>
                          )}
                        </div>

                        <p className="text-gray-600 mb-4">{visa.description}</p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <circle cx={12} cy={12} r={10} />
                              <polyline points="12,6 12,12 16,14" />
                            </svg>
                            <div>
                              <p className="text-sm font-medium text-gray-900">Processing</p>
                              <p className="text-xs text-gray-600">{visa.processingTime}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <rect x={3} y={4} width={18} height={18} rx={2} ry={2} />
                              <line x1={16} y1={2} x2={16} y2={6} />
                              <line x1={8} y1={2} x2={8} y2={6} />
                              <line x1={3} y1={10} x2={21} y2={10} />
                            </svg>
                            <div>
                              <p className="text-sm font-medium text-gray-900">Validity</p>
                              <p className="text-xs text-gray-600">{visa.validity}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <line x1={12} y1={1} x2={12} y2={23} />
                              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                            </svg>
                            <div>
                              <p className="text-sm font-medium text-gray-900">Price</p>
                              <p className="text-xs text-gray-600">{visa.currency} {visa.price}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                              <circle cx={9} cy={7} r={4} />
                              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                            </svg>
                            <div>
                              <p className="text-sm font-medium text-gray-900">Type</p>
                              <p className="text-xs text-gray-600 capitalize">{visa.type}</p>
                            </div>
                          </div>
                        </div>

                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Key Features:</h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {visa.features.slice(0, 2).map((feature, index) => (
                              <li key={index} className="flex items-center gap-2">
                                <svg className="w-3 h-3 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <button
                          onClick={() => handleApplyNow(visa)}
                          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                        >
                          Apply Now
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Search Summary */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Search Summary
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Destination Country</p>
                  <p className="font-medium text-gray-900">{visaCountry || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Nationality</p>
                  <p className="font-medium text-gray-900">{nationality || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Travel Date</p>
                  <p className="font-medium text-gray-900">
                    {travelDate ? new Date(travelDate).toLocaleDateString() : "Not specified"}
                  </p>
                </div>
              </div>
            </div>

            {/* Help Section */}
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">
                Need Help Choosing?
              </h3>
              <p className="text-blue-700 mb-4">
                Our visa experts can help you select the right visa type for your specific situation.
              </p>
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                Get Expert Help
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VisaResults;
