import React, { useState } from "react";
import { MdClose, MdCheckCircle } from "react-icons/md";

interface ApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  university: { id: string; schoolName: string } | null;
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
    programs: [] as string[],
    essay: "",
    documents: [] as File[],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen || !university) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    setIsSuccess(true);
  };

  const programs = ["Computer Science", "Business", "Engineering", "Medicine", "Law", "Arts"];
  const totalSteps = 4;
  const progressPercent = (currentStep / totalSteps) * 100;

  return (
    <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-gray-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 md:p-7 flex items-start justify-between">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white mb-1">Application Form</h2>
            <p className="text-white/90 text-sm md:text-base">{university.schoolName}</p>
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

              {/* Step 3: Academic Interests */}
              {currentStep === 3 && (
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

              {/* Step 4: Documents */}
              {currentStep === 4 && (
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
                Your application to {university.schoolName} has been successfully submitted. We'll review your
                application and contact you within 2-3 weeks.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 md:p-5 text-left">
                <p className="text-xs md:text-sm text-gray-900">
                  <span className="font-semibold block mb-2">Next Steps:</span>
                  Check your email for confirmation and application reference number
                </p>
              </div>
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

          <button
            onClick={currentStep === totalSteps ? handleSubmit : handleNextStep}
            disabled={isSubmitting || isSuccess}
            className="px-4 md:px-6 py-2 md:py-2.5 text-sm md:text-base font-medium rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors active:scale-95"
          >
            {isSubmitting ? "Submitting..." : currentStep === totalSteps ? "Submit Application" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApplicationModal;
