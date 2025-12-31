import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

interface ApplicationStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  completed: boolean;
}

interface ApplicationData {
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  nationality: string;
  passportNumber: string;
  passportExpiry: string;

  // Travel Information
  purpose: string;
  destination: string;
  departureDate: string;
  returnDate: string;
  accommodation: string;
  hostContact: string;

  // Documents
  passportPhoto: File | null;
  applicationPhoto: File | null;
  supportingDocuments: File[];

  // Payment
  paymentMethod: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  billingAddress: string;
}

const steps: ApplicationStep[] = [
  {
    id: "personal",
    title: "Personal Information",
    description: "Your basic personal details",
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>,
    completed: false
  },
  {
    id: "travel",
    title: "Travel Details",
    description: "Purpose and itinerary of your trip",
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>,
    completed: false
  },
  {
    id: "documents",
    title: "Documents",
    description: "Upload required documents",
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>,
    completed: false
  },
  {
    id: "payment",
    title: "Payment",
    description: "Complete your application payment",
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <rect x={1} y={4} width={22} height={16} rx={2} ry={2} />
      <line x1={1} y1={10} x2={23} y2={10} />
    </svg>,
    completed: false
  }
];

export default function VisaApplication() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [applicationData, setApplicationData] = useState<ApplicationData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    nationality: "",
    passportNumber: "",
    passportExpiry: "",
    purpose: "",
    destination: "",
    departureDate: "",
    returnDate: "",
    accommodation: "",
    hostContact: "",
    passportPhoto: null,
    applicationPhoto: null,
    supportingDocuments: [],
    paymentMethod: "card",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    billingAddress: ""
  });

  const visaId = searchParams.get("visaId");
  const visaCountry = searchParams.get("country");
  const nationality = searchParams.get("nationality");
  const travelDate = searchParams.get("travelDate");

  useEffect(() => {
    // Pre-fill some data from search params
    if (nationality) {
      setApplicationData(prev => ({ ...prev, nationality }));
    }
    if (visaCountry) {
      setApplicationData(prev => ({ ...prev, destination: visaCountry }));
    }
    if (travelDate) {
      setApplicationData(prev => ({ ...prev, departureDate: travelDate }));
    }
  }, [nationality, visaCountry, travelDate]);

  const updateApplicationData = (field: keyof ApplicationData, value: any) => {
    setApplicationData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (field: keyof ApplicationData, file: File) => {
    if (field === "supportingDocuments") {
      setApplicationData(prev => ({
        ...prev,
        supportingDocuments: [...prev.supportingDocuments, file]
      }));
    } else {
      setApplicationData(prev => ({ ...prev, [field]: file }));
    }
  };

  const removeFile = (field: keyof ApplicationData, index?: number) => {
    if (field === "supportingDocuments" && index !== undefined) {
      setApplicationData(prev => ({
        ...prev,
        supportingDocuments: prev.supportingDocuments.filter((_, i) => i !== index)
      }));
    } else {
      setApplicationData(prev => ({ ...prev, [field]: null }));
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      // Get authentication token
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      if (!currentUser?.token) {
        alert('Please log in to submit your visa application');
        return;
      }

      // Prepare the data for submission
      const submissionData = {
        personalInfo: {
          firstName: applicationData.firstName,
          lastName: applicationData.lastName,
          email: applicationData.email,
          phone: applicationData.phone,
          dateOfBirth: applicationData.dateOfBirth,
          gender: applicationData.gender,
          nationality: applicationData.nationality,
          passportNumber: applicationData.passportNumber,
          passportExpiry: applicationData.passportExpiry
        },
        travelDetails: {
          purpose: applicationData.purpose,
          destination: applicationData.destination,
          departureDate: applicationData.departureDate,
          returnDate: applicationData.returnDate,
          accommodation: applicationData.accommodation,
          hostContact: applicationData.accommodation === 'host' ? applicationData.hostContact : undefined
        },
        documents: {
          passportPhoto: applicationData.passportPhoto,
          applicationPhoto: applicationData.applicationPhoto,
          supportingDocuments: applicationData.supportingDocuments
        },
        paymentInfo: {
          paymentMethod: applicationData.paymentMethod,
          cardNumber: applicationData.cardNumber,
          expiryDate: applicationData.expiryDate,
          cvv: applicationData.cvv,
          billingAddress: applicationData.billingAddress
        }
      };

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'}/api/visa-applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`
        },
        body: JSON.stringify(submissionData)
      });

      if (!response.ok) {
        throw new Error('Failed to submit visa application');
      }

      const result = await response.json();

      if (result.success) {
        navigate(`/visa/confirmation?applicationId=${result.application.id}`);
      } else {
        throw new Error(result.error || 'Failed to submit application');
      }
    } catch (error) {
      console.error('Error submitting visa application:', error);
      alert('Failed to submit visa application. Please try again.');
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Personal Information
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  value={applicationData.firstName}
                  onChange={(e) => updateApplicationData("firstName", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={applicationData.lastName}
                  onChange={(e) => updateApplicationData("lastName", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={applicationData.email}
                  onChange={(e) => updateApplicationData("email", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={applicationData.phone}
                  onChange={(e) => updateApplicationData("phone", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Birth *
                </label>
                <input
                  type="date"
                  value={applicationData.dateOfBirth}
                  onChange={(e) => updateApplicationData("dateOfBirth", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender *
                </label>
                <select
                  value={applicationData.gender}
                  onChange={(e) => updateApplicationData("gender", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nationality
                </label>
                <input
                  type="text"
                  value={applicationData.nationality}
                  onChange={(e) => updateApplicationData("nationality", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  readOnly
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Passport Number *
                </label>
                <input
                  type="text"
                  value={applicationData.passportNumber}
                  onChange={(e) => updateApplicationData("passportNumber", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Passport Expiry Date *
                </label>
                <input
                  type="date"
                  value={applicationData.passportExpiry}
                  onChange={(e) => updateApplicationData("passportExpiry", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
          </div>
        );

      case 1: // Travel Details
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Purpose of Travel *
              </label>
              <select
                value={applicationData.purpose}
                onChange={(e) => updateApplicationData("purpose", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Purpose</option>
                <option value="tourism">Tourism</option>
                <option value="business">Business</option>
                <option value="visiting-family">Visiting Family/Friends</option>
                <option value="medical">Medical Treatment</option>
                <option value="education">Education/Training</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Destination Country
                </label>
                <input
                  type="text"
                  value={applicationData.destination}
                  onChange={(e) => updateApplicationData("destination", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Departure Date *
                </label>
                <input
                  type="date"
                  value={applicationData.departureDate}
                  onChange={(e) => updateApplicationData("departureDate", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Return Date *
                </label>
                <input
                  type="date"
                  value={applicationData.returnDate}
                  onChange={(e) => updateApplicationData("returnDate", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Accommodation Type *
                </label>
                <select
                  value={applicationData.accommodation}
                  onChange={(e) => updateApplicationData("accommodation", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Accommodation</option>
                  <option value="hotel">Hotel</option>
                  <option value="host">Staying with Host</option>
                  <option value="rented">Rented Property</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {applicationData.accommodation === "host" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Host Contact Information *
                </label>
                <textarea
                  value={applicationData.hostContact}
                  onChange={(e) => updateApplicationData("hostContact", e.target.value)}
                  placeholder="Name, address, phone number, and relationship to host"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  required
                />
              </div>
            )}
          </div>
        );

      case 2: // Documents
        return (
          <div className="space-y-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <h4 className="text-sm font-medium text-yellow-800 mb-2">Required Documents:</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Valid passport (with at least 6 months validity)</li>
                <li>• Recent passport-sized photograph</li>
                <li>• Proof of travel purpose</li>
                <li>• Financial proof</li>
                <li>• Accommodation details</li>
              </ul>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Passport Photo (First Page) *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => e.target.files && handleFileUpload("passportPhoto", e.target.files[0])}
                    className="hidden"
                    id="passport-photo"
                  />
                  <label htmlFor="passport-photo" className="cursor-pointer">
                    <div className="text-center">
                      <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="text-sm text-gray-600">
                        {applicationData.passportPhoto ? applicationData.passportPhoto.name : "Click to upload passport photo"}
                      </p>
                    </div>
                  </label>
                </div>
                {applicationData.passportPhoto && (
                  <div className="mt-2 flex items-center justify-between bg-gray-50 p-2 rounded">
                    <span className="text-sm text-gray-700">{applicationData.passportPhoto.name}</span>
                    <button
                      onClick={() => removeFile("passportPhoto")}
                      className="text-red-500 hover:text-red-700"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Application Photo *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files && handleFileUpload("applicationPhoto", e.target.files[0])}
                    className="hidden"
                    id="application-photo"
                  />
                  <label htmlFor="application-photo" className="cursor-pointer">
                    <div className="text-center">
                      <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="text-sm text-gray-600">
                        {applicationData.applicationPhoto ? applicationData.applicationPhoto.name : "Click to upload application photo"}
                      </p>
                    </div>
                  </label>
                </div>
                {applicationData.applicationPhoto && (
                  <div className="mt-2 flex items-center justify-between bg-gray-50 p-2 rounded">
                    <span className="text-sm text-gray-700">{applicationData.applicationPhoto.name}</span>
                    <button
                      onClick={() => removeFile("applicationPhoto")}
                      className="text-red-500 hover:text-red-700"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Supporting Documents
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <input
                    type="file"
                    accept="image/*,.pdf,.doc,.docx"
                    multiple
                    onChange={(e) => {
                      if (e.target.files) {
                        Array.from(e.target.files).forEach(file => handleFileUpload("supportingDocuments", file));
                      }
                    }}
                    className="hidden"
                    id="supporting-documents"
                  />
                  <label htmlFor="supporting-documents" className="cursor-pointer">
                    <div className="text-center">
                      <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="text-sm text-gray-600">
                        Click to upload supporting documents
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Proof of funds, invitation letters, hotel bookings, etc.
                      </p>
                    </div>
                  </label>
                </div>
                {applicationData.supportingDocuments.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {applicationData.supportingDocuments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <span className="text-sm text-gray-700">{file.name}</span>
                        <button
                          onClick={() => removeFile("supportingDocuments", index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 3: // Payment
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Application Summary</h3>
              <div className="space-y-2 text-sm text-blue-800">
                <p><strong>Name:</strong> {applicationData.firstName} {applicationData.lastName}</p>
                <p><strong>Destination:</strong> {applicationData.destination}</p>
                <p><strong>Travel Dates:</strong> {applicationData.departureDate} - {applicationData.returnDate}</p>
                <p><strong>Purpose:</strong> {applicationData.purpose}</p>
                <div className="mt-4 pt-4 border-t border-blue-300">
                  <p className="text-lg font-bold">Amount: £95.00</p>
                  <p className="text-xs">Includes processing fee and service charge</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="card"
                      checked={applicationData.paymentMethod === "card"}
                      onChange={(e) => updateApplicationData("paymentMethod", e.target.value)}
                      className="text-blue-600"
                    />
                    <span className="ml-2">Credit/Debit Card</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="paypal"
                      checked={applicationData.paymentMethod === "paypal"}
                      onChange={(e) => updateApplicationData("paymentMethod", e.target.value)}
                      className="text-blue-600"
                    />
                    <span className="ml-2">PayPal</span>
                  </label>
                </div>
              </div>

              {applicationData.paymentMethod === "card" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Card Number *
                    </label>
                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      value={applicationData.cardNumber}
                      onChange={(e) => updateApplicationData("cardNumber", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Expiry Date *
                      </label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        value={applicationData.expiryDate}
                        onChange={(e) => updateApplicationData("expiryDate", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CVV *
                      </label>
                      <input
                        type="text"
                        placeholder="123"
                        value={applicationData.cvv}
                        onChange={(e) => updateApplicationData("cvv", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Billing Address *
                </label>
                <textarea
                  value={applicationData.billingAddress}
                  onChange={(e) => updateApplicationData("billingAddress", e.target.value)}
                  placeholder="Full billing address"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  required
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Visa Application
              </h1>
              <p className="text-gray-600 mt-1">
                {visaCountry} Visa • {nationality} Citizen
              </p>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              ← Back
            </button>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                index <= currentStep ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
              }`}>
                {step.icon}
              </div>
              <div className="ml-3 hidden md:block">
                <p className={`text-sm font-medium ${
                  index <= currentStep ? "text-blue-600" : "text-gray-600"
                }`}>
                  {step.title}
                </p>
                <p className="text-xs text-gray-500">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-12 h-0.5 mx-4 ${
                  index < currentStep ? "bg-blue-600" : "bg-gray-200"
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            {steps[currentStep].title}
          </h2>
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium ${
              currentStep === 0
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-gray-600 hover:bg-gray-700 text-white"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </button>

          {currentStep === steps.length - 1 ? (
            <button
              onClick={handleSubmit}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium"
            >
              Submit Application
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          ) : (
            <button
              onClick={nextStep}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
            >
              Next
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
