import React, { useState, useEffect } from "react";
import { MdClose, MdCheckCircle } from "react-icons/md";
import { getAuth } from "firebase/auth";
import paystackService, { PaystackResponse } from "../services/paystackService";
import toast from "react-hot-toast";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

/**
 * Get fresh auth token from Firebase
 */
const getAuthToken = async (): Promise<string | null> => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return null;

    const token = await user.getIdToken();
    return token;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

interface ApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  university: { id: string; name?: string; schoolName?: string } | null;
}

const ApplicationModal: React.FC<ApplicationModalProps> = ({ isOpen, onClose, university }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    nationality: "",
    passportNumber: "",
    // Academic details
    currentEducation: "",
    gpa: "",
    previousInstitution: "",
    universityName: "",
    graduationYear: "",
    intakePeriod: "",
    startDate: "",
    // Application details
    programs: [] as string[],
    essay: "",
    documents: [] as File[],
    // Payment
    applicationFee: 150, // GHS
    paymentStatus: "pending" as "pending" | "completed",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // University search states
  const [showInstitutionDropdown, setShowInstitutionDropdown] = useState(false);
  const [institutionSearchResults, setInstitutionSearchResults] = useState<string[]>([]);
  const [isSearchingInstitution, setIsSearchingInstitution] = useState(false);

  // Auto-populate university name when modal opens
  useEffect(() => {
    if (isOpen && university) {
      setFormData(prev => ({
        ...prev,
        universityName: university.name || university.schoolName
      }));
    }
  }, [isOpen, university]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.institution-search-container')) {
        setShowInstitutionDropdown(false);
      }
    };

    if (showInstitutionDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showInstitutionDropdown]);

  if (!isOpen || !university) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Handle university search for previous institution
    if (name === 'previousInstitution') {
      handleInstitutionSearch(value);
    }
  };

  // Search universities for autocomplete
  const handleInstitutionSearch = async (keyword: string) => {
    if (keyword.length < 2) {
      setInstitutionSearchResults([]);
      setShowInstitutionDropdown(false);
      setIsSearchingInstitution(false);
      return;
    }

    setIsSearchingInstitution(true);

    try {
      const response = await fetch(`${API_BASE_URL}/universities/search?query=${encodeURIComponent(keyword)}`);
      const data = await response.json();

      if (data.success) {
        const results = data.universities.map((uni: { schoolName: string }) => uni.schoolName);
        setInstitutionSearchResults(results);
        setShowInstitutionDropdown(results.length > 0);
      } else {
        console.error('University search failed:', data.error);
        setInstitutionSearchResults([]);
        setShowInstitutionDropdown(false);
      }
    } catch (error) {
      console.error('Error searching universities:', error);
      setInstitutionSearchResults([]);
      setShowInstitutionDropdown(false);
    } finally {
      setIsSearchingInstitution(false);
    }
  };

  // Handle university selection from dropdown
  const handleInstitutionSelect = (universityName: string) => {
    setFormData(prev => ({ ...prev, previousInstitution: universityName }));
    setShowInstitutionDropdown(false);
    setInstitutionSearchResults([]);
  };

  const handleProgramToggle = (program: string) => {
    setFormData((prev) => ({
      ...prev,
      programs: prev.programs.includes(program)
        ? prev.programs.filter((p) => p !== program)
        : [...prev.programs, program],
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData((prev) => ({ ...prev, documents: files }));
  };

  const handleNextStep = () => {
    // Basic validation before allowing next step
    if (currentStep === 1) {
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.dateOfBirth) {
        alert('Please fill in all required personal information fields.');
        return;
      }
    } else if (currentStep === 2) {
      if (!formData.nationality || !formData.passportNumber) {
        alert('Please fill in your nationality and passport number.');
        return;
      }
    } else if (currentStep === 3) {
      if (!formData.currentEducation || !formData.gpa || !formData.graduationYear || !formData.intakePeriod) {
        alert('Please fill in all required academic details.');
        return;
      }
    } else if (currentStep === 4) {
      if (!formData.programs || formData.programs.length === 0 || !formData.essay) {
        alert('Please select at least one program and write your motivation essay.');
        return;
      }
    }

    if (currentStep < 6) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handlePayment = async () => {
    if (!university) return;

    try {
      console.log('💳 Starting Paystack payment for application fee...');

      await paystackService.initializePayment({
        amount: formData.applicationFee,
        currency: 'GHS',
        email: formData.email,
        reference: `application-${university.id}-${Date.now()}`,
        metadata: {
          universityId: university.id,
          universityName: university.name || university.schoolName,
          applicantName: `${formData.firstName} ${formData.lastName}`,
          applicationType: 'university',
          intakePeriod: formData.intakePeriod,
        },
        callback: (response: PaystackResponse) => {
          console.log('✅ Application payment successful:', response);

          if (response.status === 'success') {
            // Update payment status
            setFormData(prev => ({
              ...prev,
              paymentStatus: 'completed'
            }));

            toast.success('Payment completed successfully! You can now submit your application.');
          } else {
            toast.error('Payment was not successful. Please try again.');
          }
        },
        onClose: () => {
          console.log('⚠️ Payment modal closed');
          toast('Payment was cancelled. You can try again when ready.', { icon: 'ℹ️' });
        },
      });
    } catch (error) {
      console.error('❌ Payment initialization failed:', error);
      toast.error('Failed to initialize payment. Please try again.');
    }
  };

  const handleSubmit = async () => {
    if (!university) return;

    // Final validation before submission
    if (formData.paymentStatus !== 'completed') {
      alert('Please complete the application fee payment first.');
      setCurrentStep(6); // Go to payment step
      return;
    }

    // Ensure all required documents are uploaded
    if (!formData.documents || formData.documents.length === 0) {
      alert('Please upload at least one document before submitting.');
      setCurrentStep(5); // Go to documents step
      return;
    }

    setIsSubmitting(true);
    try {
      const token = await getAuthToken();
      if (!token) {
        throw new Error('Authentication required. Please log in to submit your application.');
      }

      const response = await fetch(`${API_BASE_URL}/applications/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          universityId: university.id
        })
      });

      const data = await response.json();

      if (data.success) {
        setIsSuccess(true);
        console.log('✅ Application submitted successfully:', data.applicationId);

        // Close modal after 3 seconds to show success message
        setTimeout(() => {
          onClose();
        }, 3000);
      } else {
        throw new Error(data.error || 'Failed to submit application');
      }
    } catch (error) {
      console.error('❌ Application submission failed:', error);
      alert(`Failed to submit application: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const programs = ["Computer Science", "Business", "Engineering", "Medicine", "Law", "Arts"];
  const intakePeriods = ["Fall 2025", "Spring 2025", "Fall 2026", "Spring 2026"];
  const totalSteps = 6;
  const progressPercent = (currentStep / totalSteps) * 100;

  return (
    <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-gray-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 md:p-7 flex items-start justify-between">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white mb-1">Application Form</h2>
            <p className="text-white/90 text-sm md:text-base">{university.name || university.schoolName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 p-1.5 rounded-full transition-colors"
            aria-label="Close modal"
          >
            <MdClose className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-5 md:px-7 pt-6 md:pt-8">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs md:text-sm font-semibold text-gray-600 uppercase tracking-wide">
              Step {currentStep} of {totalSteps}
            </span>
            <span className="text-xs md:text-sm font-semibold text-gray-900">{Math.round(progressPercent)}%</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-grow overflow-y-auto px-5 md:px-7 py-6 md:py-8">
          {!isSuccess ? (
            <>
              {/* Step 1: Personal Information */}
              {currentStep === 1 && (
                <div className="space-y-5">
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-6">Personal Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                        First Name *
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="John"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 text-sm md:text-base"
                      />
                    </div>
                    <div>
                      <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="Doe"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 text-sm md:text-base"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="john@example.com"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 text-sm md:text-base"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                        Phone *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+233 24 000 0000"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 text-sm md:text-base"
                      />
                    </div>
                    <div>
                      <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                        Date of Birth *
                      </label>
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 text-sm md:text-base"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Passport & Nationality */}
              {currentStep === 2 && (
                <div className="space-y-5">
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-6">Passport & Nationality</h3>

                  <div>
                    <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                      Nationality *
                    </label>
                    <select
                      name="nationality"
                      value={formData.nationality}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 text-sm md:text-base cursor-pointer"
                    >
                      <option value="">Select your nationality</option>
                      <option value="GH">Ghana</option>
                      <option value="NG">Nigeria</option>
                      <option value="KE">Kenya</option>
                      <option value="ZA">South Africa</option>
                      <option value="US">United States</option>
                      <option value="UK">United Kingdom</option>
                      <option value="CA">Canada</option>
                      <option value="AU">Australia</option>
                      <option value="IN">India</option>
                      <option value="CN">China</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                      Passport Number *
                    </label>
                    <input
                      type="text"
                      name="passportNumber"
                      value={formData.passportNumber}
                      onChange={handleInputChange}
                      placeholder="G0000000"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 text-sm md:text-base"
                    />
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 md:p-5">
                    <p className="text-xs md:text-sm text-gray-900">
                      <span className="font-semibold">Note:</span> Your information is secure and encrypted. We never
                      share your personal data.
                    </p>
                  </div>
                </div>
              )}

              {/* Step 3: Academic Details */}
              {currentStep === 3 && (
                <div className="space-y-5">
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-6">Academic Details</h3>

                  {/* University Name (Auto-populated) */}
                  <div>
                    <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                      University Applying To
                    </label>
                    <input
                      type="text"
                      value={formData.universityName}
                      readOnly
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 text-sm md:text-base cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 mt-1">Auto-filled from the university page</p>
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                      Current Education Level *
                    </label>
                    <select
                      name="currentEducation"
                      value={formData.currentEducation}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 text-sm md:text-base cursor-pointer"
                    >
                      <option value="">Select your current education</option>
                      <option value="high_school">High School</option>
                      <option value="college">College/University</option>
                      <option value="masters">Master's Degree</option>
                      <option value="phd">PhD</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                        GPA/Grade *
                      </label>
                      <input
                        type="text"
                        name="gpa"
                        value={formData.gpa}
                        onChange={handleInputChange}
                        placeholder="3.8 or A+"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 text-sm md:text-base"
                      />
                    </div>
                    <div>
                      <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                        Graduation Year *
                      </label>
                      <input
                        type="number"
                        name="graduationYear"
                        value={formData.graduationYear}
                        onChange={handleInputChange}
                        placeholder="2024"
                        min="2020"
                        max="2030"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 text-sm md:text-base"
                      />
                    </div>
                  </div>

                  <div className="relative institution-search-container">
                    <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                      Previous Institution
                    </label>
                    <input
                      type="text"
                      name="previousInstitution"
                      value={formData.previousInstitution}
                      onChange={handleInputChange}
                      onFocus={() => {
                        if (formData.previousInstitution.length >= 2 && institutionSearchResults.length > 0) {
                          setShowInstitutionDropdown(true);
                        }
                      }}
                      onBlur={() => {
                        // Delay hiding dropdown to allow clicks on options
                        setTimeout(() => setShowInstitutionDropdown(false), 200);
                      }}
                      placeholder="Start typing to search universities..."
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 text-sm md:text-base"
                    />

                    {/* Loading indicator */}
                    {isSearchingInstitution && (
                      <div className="absolute right-3 top-9 text-gray-400">
                        <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-blue-500 rounded-full"></div>
                      </div>
                    )}

                    {/* Autocomplete Dropdown */}
                    {showInstitutionDropdown && institutionSearchResults.length > 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {institutionSearchResults.map((universityName, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => handleInstitutionSelect(universityName)}
                            className="w-full px-4 py-2 text-left hover:bg-blue-50 hover:text-blue-700 transition-colors text-sm md:text-base border-b border-gray-100 last:border-b-0"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-gray-600">🎓</span>
                              <span>{universityName}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* No results message */}
                    {showInstitutionDropdown && institutionSearchResults.length === 0 && formData.previousInstitution.length >= 2 && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4">
                        <div className="flex items-center gap-2 text-gray-500">
                          <span>❌</span>
                          <span className="text-sm">No universities found. You can still type your institution name manually.</span>
                        </div>
                      </div>
                    )}

                    <p className="text-xs text-gray-500 mt-1">
                      Start typing to see university suggestions, or enter your institution name manually.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                        Intake Period *
                      </label>
                      <select
                        name="intakePeriod"
                        value={formData.intakePeriod}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 text-sm md:text-base cursor-pointer"
                      >
                        <option value="">Select intake period</option>
                        {intakePeriods.map((period) => (
                          <option key={period} value={period}>{period}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                        Expected Start Date
                      </label>
                      <input
                        type="date"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 text-sm md:text-base"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Academic Interests */}
              {currentStep === 4 && (
                <div className="space-y-5">
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-6">Academic Interests</h3>

                  <div>
                    <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
                      Select your programs of interest *
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {programs.map((program) => (
                        <button
                          key={program}
                          type="button"
                          onClick={() => handleProgramToggle(program)}
                          className={`p-3 md:p-4 rounded-lg border-2 transition-all duration-300 text-sm md:text-base font-medium text-left ${
                            formData.programs.includes(program)
                              ? "border-blue-600 bg-blue-50 text-blue-600"
                              : "border-gray-300 bg-white text-gray-900 hover:border-blue-300"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                                formData.programs.includes(program) ? "bg-blue-600 border-blue-600" : "border-gray-300"
                              }`}
                            >
                              {formData.programs.includes(program) && (
                                <MdCheckCircle className="w-4 h-4 text-white" />
                              )}
                            </div>
                            {program}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                      Motivation Essay *
                    </label>
                    <textarea
                      name="essay"
                      value={formData.essay}
                      onChange={handleInputChange}
                      placeholder="Tell us why you're interested in studying abroad..."
                      rows={5}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 text-sm md:text-base resize-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">{formData.essay.length}/500 characters</p>
                  </div>
                </div>
              )}

              {/* Step 5: Documents */}
              {currentStep === 5 && (
                <div className="space-y-5">
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-6">Upload Documents</h3>

                  <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 md:p-8 text-center bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer">
                    <input
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer block">
                      <div className="text-4xl mb-3">📄</div>
                      <p className="text-sm md:text-base font-semibold text-gray-900 mb-1">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs md:text-sm text-gray-600">PDF, DOC, DOCX, JPG, PNG (Max 10MB)</p>
                    </label>
                  </div>

                  {formData.documents.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-gray-900">
                        Uploaded Files ({formData.documents.length})
                      </p>
                      {formData.documents.map((file, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <span className="text-lg">📎</span>
                          <span className="text-sm text-gray-900 truncate">{file.name}</span>
                          <span className="text-xs text-gray-600 ml-auto">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 md:p-5">
                    <p className="text-xs md:text-sm text-gray-900">
                      <span className="font-semibold">Required Documents:</span> Passport copy, Academic transcripts,
                      Test scores (TOEFL/IELTS), Letters of recommendation
                    </p>
                  </div>
                </div>
              )}

              {/* Step 6: Payment */}
              {currentStep === 6 && (
                <div className="space-y-5">
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-6">Application Fee Payment</h3>

                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
                    <div className="text-center">
                      <div className="text-3xl mb-2">💰</div>
                      <h4 className="text-lg font-bold text-gray-900 mb-2">Application Fee</h4>
                      <div className="text-3xl font-bold text-green-600 mb-2">
                        GHS {formData.applicationFee}
                      </div>
                      <p className="text-sm text-gray-600">
                        One-time non-refundable application processing fee
                      </p>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 md:p-5">
                    <h5 className="font-semibold text-gray-900 mb-2">Payment Information:</h5>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Secure payment powered by Paystack</li>
                      <li>• Multiple payment methods accepted</li>
                      <li>• Instant confirmation upon successful payment</li>
                      <li>• Application processing begins after payment</li>
                    </ul>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 md:p-5">
                    <p className="text-xs md:text-sm text-gray-900">
                      <span className="font-semibold">Important:</span> Payment must be completed to submit your application.
                      You will receive a confirmation email with your application details and reference number.
                    </p>
                  </div>

                  {/* Payment Status */}
                  {formData.paymentStatus === 'completed' && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <MdCheckCircle className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-green-800">Payment Completed</p>
                          <p className="text-sm text-green-600">Ready to submit application</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            /* Success State */
            <div className="text-center py-8 md:py-12">
              <div className="mb-6">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <MdCheckCircle className="w-8 h-8 md:w-10 md:h-10 text-green-600" />
                </div>
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h3>
              <p className="text-sm md:text-base text-gray-600 mb-6 max-w-sm mx-auto">
                Your application to {university.name || university.schoolName} has been successfully submitted! Check your email for your application form and payment receipt. We'll review your application and contact you within 2-3 weeks.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 md:p-5 text-left mb-6">
                <p className="text-xs md:text-sm text-gray-900">
                  <span className="font-semibold block mb-2">Next Steps:</span>
                  Check your email for confirmation and application reference number
                </p>
              </div>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
              >
                Close
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 bg-gray-50 px-5 md:px-7 py-4 md:py-5 flex items-center justify-between gap-3">
          <button
            onClick={handlePrevStep}
            disabled={currentStep === 1 || isSuccess || isSubmitting}
            className="px-4 md:px-6 py-2 md:py-2.5 text-sm md:text-base font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Back
          </button>

          {currentStep === 6 ? (
            // Payment step
            formData.paymentStatus === 'completed' ? (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || isSuccess}
                className="px-4 md:px-6 py-2 md:py-2.5 text-sm md:text-base font-medium rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors active:scale-95"
              >
                {isSubmitting ? "Submitting..." : "Submit Application"}
              </button>
            ) : (
              <button
                onClick={handlePayment}
                className="px-4 md:px-6 py-2 md:py-2.5 text-sm md:text-base font-medium rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 transition-colors active:scale-95"
              >
                Pay GHS {formData.applicationFee}
              </button>
            )
          ) : (
            // Regular next button for steps 1-5
            <button
              onClick={handleNextStep}
              disabled={isSubmitting || isSuccess}
              className="px-4 md:px-6 py-2 md:py-2.5 text-sm md:text-base font-medium rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors active:scale-95"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationModal;
