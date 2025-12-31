// src/pages/admin/UniversityManagement.tsx
import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import DataTable from '../../components/admin/DataTable';
import ExportButton from '../../components/admin/ExportButton';
import toast from 'react-hot-toast';
import {
  MdRefresh,
  MdStar,
  MdStarBorder,
  MdDelete,
  MdSchool,
  MdEdit,
  MdAdd,
  MdLocationOn,
  MdPhone,
  MdEmail,
  MdLanguage,
  MdVerified,
  MdPhoto,
  MdDescription,
  MdTimeline,
  MdClose,
  MdPayment
} from 'react-icons/md';
import { API_BASE_URL } from '../../utils/apiConfig';

interface UniversityProfile {
  id: string;
  basicInfo: {
    name: string;
    country: string;
    city: string;
    address: string;
    website: string;
    phone: string;
    email: string;
  };
  academics: {
    ranking: {
      world: number;
      national: number;
      source: string;
      year: number;
    };
    accreditations: string[];
    totalStudents: number;
    internationalStudents: number;
    facultyCount: number;
    studentFacultyRatio: string;
  };
  facilities: {
    campusSize: string;
    library: boolean;
    sportsFacilities: boolean;
    dormitories: boolean;
    diningFacilities: boolean;
    medicalCenter: boolean;
    wifiCampus: boolean;
    description: string;
  };
  programs: {
    undergraduate: string[];
    postgraduate: string[];
    phd: string[];
    totalPrograms: number;
  };
  fees: {
    undergraduate: { min: number; max: number; currency: string; };
    postgraduate: { min: number; max: number; currency: string; };
    applicationFee: number;
    currency: string;
  };
  admission: {
    requirements: string[];
    englishProficiency: string[];
    deadlines: { fall: string; spring: string; summer: string; };
    applicationProcess: string;
  };
  partnerships: {
    isPartnered: boolean;
    agreementType: string;
    commissionRate: number;
    specialBenefits: string[];
    contactPerson: string;
  };
  media: {
    logo: string;
    bannerImage: string;
    gallery: string[];
    virtualTour: string;
    videos: string[];
  };
  settings: {
    isActive: boolean;
    isFeatured: boolean;
    featuredPriority: number;
    tags: string[];
    targetCountries: string[];
    lastUpdated: string;
    createdAt: string;
  };
}

interface UniversitySummary {
  id: string;
  name: string;
  country: string;
  city: string;
  ranking: number;
  isFeatured: boolean;
  isActive: boolean;
  totalPrograms: number;
  totalStudents: number;
  isPartnered: boolean;
  createdAt: string;
}

// University Profile Modal Component
interface UniversityProfileModalProps {
  university: UniversityProfile | null;
  onSave: (data: any) => void;
  onClose: () => void;
  isSubmitting: boolean;
}

function UniversityProfileModal({ university, onSave, onClose, isSubmitting }: UniversityProfileModalProps) {
  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState<any>(university || {
    basicInfo: { name: '', country: '', city: '', address: '', website: '', phone: '', email: '' },
    academics: {
      ranking: { world: 0, national: 0, source: '', year: new Date().getFullYear() },
      accreditations: [],
      totalStudents: 0,
      internationalStudents: 0,
      facultyCount: 0,
      studentFacultyRatio: ''
    },
    facilities: {
      campusSize: '',
      library: false,
      sportsFacilities: false,
      dormitories: false,
      diningFacilities: false,
      medicalCenter: false,
      wifiCampus: false,
      description: ''
    },
    programs: { undergraduate: [], postgraduate: [], phd: [], totalPrograms: 0 },
    fees: { undergraduate: { min: 0, max: 0, currency: 'USD' }, postgraduate: { min: 0, max: 0, currency: 'USD' }, applicationFee: 0, currency: 'USD' },
    admission: { requirements: [], englishProficiency: [], deadlines: { fall: '', spring: '', summer: '' }, applicationProcess: '' },
    partnerships: { isPartnered: false, agreementType: '', commissionRate: 0, specialBenefits: [], contactPerson: '' },
    media: { logo: '', bannerImage: '', gallery: [], virtualTour: '', videos: [] },
    settings: { isActive: true, isFeatured: false, featuredPriority: 0, tags: [], targetCountries: [], lastUpdated: new Date().toISOString(), createdAt: new Date().toISOString() }
  });

  const handleInputChange = (section: string, field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleNestedInputChange = (section: string, subsection: string, field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subsection]: {
          ...prev[section][subsection],
          [field]: value
        }
      }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: MdSchool },
    { id: 'academics', label: 'Academics', icon: MdTimeline },
    { id: 'facilities', label: 'Facilities', icon: MdLocationOn },
    { id: 'programs', label: 'Programs', icon: MdDescription },
    { id: 'fees', label: 'Fees', icon: MdPayment },
    { id: 'admission', label: 'Admission', icon: MdVerified },
    { id: 'partnerships', label: 'Partnerships', icon: MdStar },
    { id: 'media', label: 'Media', icon: MdPhoto },
    { id: 'settings', label: 'Settings', icon: MdEdit }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              {university ? 'Edit University' : 'Add New University'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              disabled={isSubmitting}
            >
              <MdClose className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col h-[calc(90vh-80px)]">
          {/* Tabs */}
          <div className="border-b border-gray-200 bg-gray-50">
            <div className="flex gap-1 p-4 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                    activeTab === tab.id
                      ? 'bg-cyan-100 text-cyan-700 border-b-2 border-cyan-500'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Basic Info Tab */}
            {activeTab === 'basic' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">University Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.basicInfo.name}
                      onChange={(e) => handleInputChange('basicInfo', 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                      placeholder="Enter university name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Country *</label>
                    <input
                      type="text"
                      required
                      value={formData.basicInfo.country}
                      onChange={(e) => handleInputChange('basicInfo', 'country', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                      placeholder="Enter country"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                    <input
                      type="text"
                      required
                      value={formData.basicInfo.city}
                      onChange={(e) => handleInputChange('basicInfo', 'city', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                      placeholder="Enter city"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                    <input
                      type="url"
                      value={formData.basicInfo.website}
                      onChange={(e) => handleInputChange('basicInfo', 'website', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                      placeholder="https://www.university.edu"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={formData.basicInfo.phone}
                      onChange={(e) => handleInputChange('basicInfo', 'phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                      placeholder="+1-555-0123"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={formData.basicInfo.email}
                      onChange={(e) => handleInputChange('basicInfo', 'email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                      placeholder="info@university.edu"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <textarea
                    value={formData.basicInfo.address}
                    onChange={(e) => handleInputChange('basicInfo', 'address', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                    rows={3}
                    placeholder="Full address"
                  />
                </div>
              </div>
            )}

            {/* Academics Tab */}
            {activeTab === 'academics' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">World Ranking</label>
                    <input
                      type="number"
                      value={formData.academics.ranking.world}
                      onChange={(e) => handleNestedInputChange('academics', 'ranking', 'world', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">National Ranking</label>
                    <input
                      type="number"
                      value={formData.academics.ranking.national}
                      onChange={(e) => handleNestedInputChange('academics', 'ranking', 'national', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ranking Year</label>
                    <input
                      type="number"
                      value={formData.academics.ranking.year}
                      onChange={(e) => handleNestedInputChange('academics', 'ranking', 'year', parseInt(e.target.value) || new Date().getFullYear())}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                      placeholder={new Date().getFullYear().toString()}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Total Students</label>
                    <input
                      type="number"
                      value={formData.academics.totalStudents}
                      onChange={(e) => handleInputChange('academics', 'totalStudents', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">International Students</label>
                    <input
                      type="number"
                      value={formData.academics.internationalStudents}
                      onChange={(e) => handleInputChange('academics', 'internationalStudents', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Faculty Count</label>
                    <input
                      type="number"
                      value={formData.academics.facultyCount}
                      onChange={(e) => handleInputChange('academics', 'facultyCount', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Student-Faculty Ratio</label>
                  <input
                    type="text"
                    value={formData.academics.studentFacultyRatio}
                    onChange={(e) => handleInputChange('academics', 'studentFacultyRatio', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                    placeholder="15:1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Accreditations (comma-separated)</label>
                  <input
                    type="text"
                    value={formData.academics.accreditations.join(', ')}
                    onChange={(e) => handleInputChange('academics', 'accreditations', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                    placeholder="AACSB, ABET, CACREP"
                  />
                </div>
              </div>
            )}

            {/* Facilities Tab */}
            {activeTab === 'facilities' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Campus Size</label>
                  <input
                    type="text"
                    value={formData.facilities.campusSize}
                    onChange={(e) => handleInputChange('facilities', 'campusSize', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                    placeholder="500 acres"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-gray-700">Campus Facilities</h4>
                    {[
                      { key: 'library', label: 'Library' },
                      { key: 'sportsFacilities', label: 'Sports Facilities' },
                      { key: 'dormitories', label: 'Dormitories' },
                      { key: 'diningFacilities', label: 'Dining Facilities' },
                      { key: 'medicalCenter', label: 'Medical Center' },
                      { key: 'wifiCampus', label: 'Campus WiFi' }
                    ].map(({ key, label }) => (
                      <div key={key} className="flex items-center">
                        <input
                          type="checkbox"
                          id={key}
                          checked={formData.facilities[key as keyof typeof formData.facilities] as boolean}
                          onChange={(e) => handleInputChange('facilities', key, e.target.checked)}
                          className="w-4 h-4 text-cyan-600 bg-gray-100 border-gray-300 rounded focus:ring-cyan-500"
                        />
                        <label htmlFor={key} className="ml-2 text-sm text-gray-700">
                          {label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Facilities Description</label>
                  <textarea
                    value={formData.facilities.description}
                    onChange={(e) => handleInputChange('facilities', 'description', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                    rows={4}
                    placeholder="Describe the campus facilities and amenities..."
                  />
                </div>
              </div>
            )}

            {/* Programs Tab */}
            {activeTab === 'programs' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Total Programs</label>
                  <input
                    type="number"
                    value={formData.programs.totalPrograms}
                    onChange={(e) => handleInputChange('programs', 'totalPrograms', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                    placeholder="0"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Undergraduate Programs (comma-separated)</label>
                    <textarea
                      value={formData.programs.undergraduate.join(', ')}
                      onChange={(e) => handleInputChange('programs', 'undergraduate', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                      rows={4}
                      placeholder="Computer Science, Business, Engineering..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Postgraduate Programs (comma-separated)</label>
                    <textarea
                      value={formData.programs.postgraduate.join(', ')}
                      onChange={(e) => handleInputChange('programs', 'postgraduate', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                      rows={4}
                      placeholder="MBA, PhD in Computer Science..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">PhD Programs (comma-separated)</label>
                    <textarea
                      value={formData.programs.phd.join(', ')}
                      onChange={(e) => handleInputChange('programs', 'phd', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                      rows={4}
                      placeholder="Computer Science, Engineering..."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Fees Tab */}
            {activeTab === 'fees' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Application Fee</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={formData.fees.applicationFee}
                      onChange={(e) => handleInputChange('fees', 'applicationFee', parseFloat(e.target.value) || 0)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                      placeholder="75"
                    />
                    <select
                      value={formData.fees.currency}
                      onChange={(e) => handleInputChange('fees', 'currency', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                    >
                      <option value="USD">USD</option>
                      <option value="CAD">CAD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-4">Undergraduate Tuition</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Minimum</label>
                        <input
                          type="number"
                          value={formData.fees.undergraduate.min}
                          onChange={(e) => handleNestedInputChange('fees', 'undergraduate', 'min', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                          placeholder="30000"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Maximum</label>
                        <input
                          type="number"
                          value={formData.fees.undergraduate.max}
                          onChange={(e) => handleNestedInputChange('fees', 'undergraduate', 'max', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                          placeholder="60000"
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-4">Postgraduate Tuition</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Minimum</label>
                        <input
                          type="number"
                          value={formData.fees.postgraduate.min}
                          onChange={(e) => handleNestedInputChange('fees', 'postgraduate', 'min', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                          placeholder="20000"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Maximum</label>
                        <input
                          type="number"
                          value={formData.fees.postgraduate.max}
                          onChange={(e) => handleNestedInputChange('fees', 'postgraduate', 'max', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                          placeholder="50000"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Admission Tab */}
            {activeTab === 'admission' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Application Process Description</label>
                  <textarea
                    value={formData.admission.applicationProcess}
                    onChange={(e) => handleInputChange('admission', 'applicationProcess', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                    rows={4}
                    placeholder="Describe the application process..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fall Deadline</label>
                    <input
                      type="date"
                      value={formData.admission.deadlines.fall}
                      onChange={(e) => handleNestedInputChange('admission', 'deadlines', 'fall', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Spring Deadline</label>
                    <input
                      type="date"
                      value={formData.admission.deadlines.spring}
                      onChange={(e) => handleNestedInputChange('admission', 'deadlines', 'spring', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Summer Deadline</label>
                    <input
                      type="date"
                      value={formData.admission.deadlines.summer}
                      onChange={(e) => handleNestedInputChange('admission', 'deadlines', 'summer', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Admission Requirements (comma-separated)</label>
                  <textarea
                    value={formData.admission.requirements.join(', ')}
                    onChange={(e) => handleInputChange('admission', 'requirements', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                    rows={3}
                    placeholder="High school diploma, GPA 3.0+, TOEFL 90+..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">English Proficiency Tests (comma-separated)</label>
                  <input
                    type="text"
                    value={formData.admission.englishProficiency.join(', ')}
                    onChange={(e) => handleInputChange('admission', 'englishProficiency', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                    placeholder="TOEFL: 90+, IELTS: 7.0+, PTE: 65+"
                  />
                </div>
              </div>
            )}

            {/* Partnerships Tab */}
            {activeTab === 'partnerships' && (
              <div className="space-y-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isPartnered"
                    checked={formData.partnerships.isPartnered}
                    onChange={(e) => handleInputChange('partnerships', 'isPartnered', e.target.checked)}
                    className="w-4 h-4 text-cyan-600 bg-gray-100 border-gray-300 rounded focus:ring-cyan-500"
                  />
                  <label htmlFor="isPartnered" className="ml-2 text-sm font-medium text-gray-700">
                    University Partnership Active
                  </label>
                </div>

                {formData.partnerships.isPartnered && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Agreement Type</label>
                        <select
                          value={formData.partnerships.agreementType}
                          onChange={(e) => handleInputChange('partnerships', 'agreementType', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                        >
                          <option value="">Select type</option>
                          <option value="Strategic Partnership">Strategic Partnership</option>
                          <option value="Study Abroad Agreement">Study Abroad Agreement</option>
                          <option value="Exchange Program">Exchange Program</option>
                          <option value="Dual Degree">Dual Degree Program</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Commission Rate (%)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.partnerships.commissionRate}
                          onChange={(e) => handleInputChange('partnerships', 'commissionRate', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                          placeholder="0.15"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Contact Person</label>
                      <input
                        type="text"
                        value={formData.partnerships.contactPerson}
                        onChange={(e) => handleInputChange('partnerships', 'contactPerson', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                        placeholder="Dr. John Smith"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Special Benefits (comma-separated)</label>
                      <textarea
                        value={formData.partnerships.specialBenefits.join(', ')}
                        onChange={(e) => handleInputChange('partnerships', 'specialBenefits', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                        rows={3}
                        placeholder="Priority admission, Scholarship opportunities, Dedicated support..."
                      />
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Media Tab */}
            {activeTab === 'media' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">University Logo URL</label>
                  <input
                    type="url"
                    value={formData.media.logo}
                    onChange={(e) => handleInputChange('media', 'logo', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                    placeholder="https://example.com/logo.png"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Banner Image URL</label>
                  <input
                    type="url"
                    value={formData.media.bannerImage}
                    onChange={(e) => handleInputChange('media', 'bannerImage', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                    placeholder="https://example.com/banner.jpg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Virtual Tour URL</label>
                  <input
                    type="url"
                    value={formData.media.virtualTour}
                    onChange={(e) => handleInputChange('media', 'virtualTour', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                    placeholder="https://example.com/virtual-tour"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gallery Images (comma-separated URLs)</label>
                  <textarea
                    value={formData.media.gallery.join(', ')}
                    onChange={(e) => handleInputChange('media', 'gallery', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                    rows={3}
                    placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Video URLs (comma-separated)</label>
                  <textarea
                    value={formData.media.videos.join(', ')}
                    onChange={(e) => handleInputChange('media', 'videos', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                    rows={3}
                    placeholder="https://youtube.com/watch?v=..., https://vimeo.com/..."
                  />
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isActive"
                        checked={formData.settings.isActive}
                        onChange={(e) => handleInputChange('settings', 'isActive', e.target.checked)}
                        className="w-4 h-4 text-cyan-600 bg-gray-100 border-gray-300 rounded focus:ring-cyan-500"
                      />
                      <label htmlFor="isActive" className="ml-2 text-sm font-medium text-gray-700">
                        Active University
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isFeatured"
                        checked={formData.settings.isFeatured}
                        onChange={(e) => handleInputChange('settings', 'isFeatured', e.target.checked)}
                        className="w-4 h-4 text-cyan-600 bg-gray-100 border-gray-300 rounded focus:ring-cyan-500"
                      />
                      <label htmlFor="isFeatured" className="ml-2 text-sm font-medium text-gray-700">
                        Featured University
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Featured Priority</label>
                    <input
                      type="number"
                      value={formData.settings.featuredPriority}
                      onChange={(e) => handleInputChange('settings', 'featuredPriority', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={formData.settings.tags.join(', ')}
                    onChange={(e) => handleInputChange('settings', 'tags', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                    placeholder="Ivy League, Research University, Top Ranked"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : (university ? 'Update University' : 'Create University')}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function UniversityManagement() {
  const { currentUser } = useAuth();
  const [universities, setUniversities] = useState<UniversitySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [countryFilter, setCountryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [partnershipFilter, setPartnershipFilter] = useState('all');
  const [selectedUniversity, setSelectedUniversity] = useState<UniversityProfile | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editingUniversity, setEditingUniversity] = useState<UniversityProfile | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchUniversities();
  }, [countryFilter, statusFilter, partnershipFilter]);

  const fetchUniversities = async () => {
    setLoading(true);
    try {
      if (!currentUser) return;

      const token = await currentUser.getIdToken();
      let url = `${API_BASE_URL}/admin/universities?limit=100`;

      if (countryFilter !== 'all') {
        url += `&country=${countryFilter}`;
      }
      if (statusFilter !== 'all') {
        url += `&status=${statusFilter}`;
      }
      if (partnershipFilter !== 'all') {
        url += `&partnership=${partnershipFilter}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch universities');
      }

      const data = await response.json();

      if (data.success) {
        // Transform data to summary format
        const summaries: UniversitySummary[] = data.universities.map((uni: any) => ({
          id: uni.id,
          name: uni.basicInfo?.name || uni.name || 'Unknown University',
          country: uni.basicInfo?.country || uni.country || 'Unknown',
          city: uni.basicInfo?.city || uni.city || 'Unknown',
          ranking: uni.academics?.ranking?.world || uni.ranking || 0,
          isFeatured: uni.settings?.isFeatured || uni.isFeatured || false,
          isActive: uni.settings?.isActive || uni.isActive !== false, // Default to true
          totalPrograms: uni.programs?.totalPrograms || (uni.programs?.undergraduate?.length || 0) + (uni.programs?.postgraduate?.length || 0) + (uni.programs?.phd?.length || 0),
          totalStudents: uni.academics?.totalStudents || uni.totalStudents || 0,
          isPartnered: uni.partnerships?.isPartnered || uni.isPartnered || false,
          createdAt: uni.settings?.createdAt || uni.createdAt
        }));
        setUniversities(summaries);
      } else {
        toast.error('Failed to load universities');
      }
    } catch (error) {
      console.error('Error fetching universities:', error);
      toast.error('Failed to load universities');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFeatured = async (universityId: string, isFeatured: boolean) => {
    try {
      if (!currentUser) return;

      const token = await currentUser.getIdToken();
      const response = await fetch(`${API_BASE_URL}/admin/universities/${universityId}/featured`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ featured: !isFeatured })
      });

      if (!response.ok) {
        throw new Error('Failed to update featured status');
      }

      toast.success(`University ${!isFeatured ? 'featured' : 'unfeatured'} successfully`);
      fetchUniversities(); // Refresh
    } catch (error) {
      console.error('Toggle featured error:', error);
      toast.error('Failed to update featured status');
    }
  };

  const handleViewProfile = async (universityId: string) => {
    try {
      if (!currentUser) return;

      const token = await currentUser.getIdToken();
      const response = await fetch(`${API_BASE_URL}/admin/universities/${universityId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch university profile');
      }

      const data = await response.json();
      if (data.success) {
        setSelectedUniversity(data.university);
        setShowProfileModal(true);
      }
    } catch (error) {
      console.error('Error fetching university profile:', error);
      toast.error('Failed to load university profile');
    }
  };

  const handleAddUniversity = () => {
    setEditingUniversity(null);
    setShowAddEditModal(true);
  };

  const handleEditUniversity = async (universityId: string) => {
    try {
      if (!currentUser) return;

      const token = await currentUser.getIdToken();
      const response = await fetch(`${API_BASE_URL}/admin/universities/${universityId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch university for editing');
      }

      const data = await response.json();
      if (data.success) {
        setEditingUniversity(data.university);
        setShowAddEditModal(true);
      }
    } catch (error) {
      console.error('Error fetching university for editing:', error);
      toast.error('Failed to load university for editing');
    }
  };

  const handleSaveUniversity = async (universityData: any) => {
    setIsSubmitting(true);
    try {
      if (!currentUser) return;

      const token = await currentUser.getIdToken();
      const url = editingUniversity
        ? `${API_BASE_URL}/admin/universities/${editingUniversity.id}`
        : `${API_BASE_URL}/admin/universities`;

      const method = editingUniversity ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(universityData)
      });

      if (!response.ok) {
        throw new Error('Failed to save university');
      }

      const result = await response.json();
      if (result.success) {
        toast.success(editingUniversity ? 'University updated successfully' : 'University created successfully');
        setShowAddEditModal(false);
        setEditingUniversity(null);
        fetchUniversities();
      } else {
        throw new Error(result.message || 'Failed to save university');
      }
    } catch (error) {
      console.error('Save university error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save university');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (universityId: string) => {
    if (!confirm('Are you sure you want to delete this university? This action cannot be undone.')) return;

    try {
      if (!currentUser) return;

      const token = await currentUser.getIdToken();
      const response = await fetch(`${API_BASE_URL}/admin/universities/${universityId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Delete failed');
      }

      toast.success('University deleted successfully');
      fetchUniversities(); // Refresh
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete university');
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'University',
      sortable: true,
      render: (value: string, row: UniversitySummary) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
            {(value || 'U').charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-medium text-gray-900">{value || 'Unknown University'}</div>
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <MdLocationOn className="w-3 h-3" />
              {row.city || 'Unknown'}, {row.country || 'Unknown'}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'ranking',
      label: 'World Ranking',
      sortable: true,
      render: (value: number) => (
        value > 0 ? (
          <div className="flex items-center gap-1">
            <MdTimeline className="w-4 h-4 text-blue-500" />
            <span className="font-semibold text-blue-600">#{value}</span>
          </div>
        ) : (
          <span className="text-gray-400">-</span>
        )
      )
    },
    {
      key: 'totalPrograms',
      label: 'Programs',
      sortable: true,
      render: (value: number) => (
        <div className="flex items-center gap-1">
          <MdSchool className="w-4 h-4 text-green-500" />
          <span className="text-sm font-medium">{value}</span>
        </div>
      )
    },
    {
      key: 'totalStudents',
      label: 'Students',
      sortable: true,
      render: (value: number) => (
        value > 0 ? (
          <span className="text-sm font-medium">{value.toLocaleString()}</span>
        ) : (
          <span className="text-gray-400">-</span>
        )
      )
    },
    {
      key: 'isPartnered',
      label: 'Partnership',
      sortable: true,
      render: (value: boolean) => (
        value ? (
          <div className="flex items-center gap-1">
            <MdVerified className="w-4 h-4 text-green-500" />
            <span className="text-xs text-green-600 font-medium">Partner</span>
          </div>
        ) : (
          <span className="text-xs text-gray-400">Standard</span>
        )
      )
    },
    {
      key: 'isFeatured',
      label: 'Featured',
      sortable: true,
      render: (value: boolean) => (
        value ? (
          <MdStar className="w-5 h-5 text-yellow-500" />
        ) : (
          <MdStarBorder className="w-5 h-5 text-gray-400" />
        )
      )
    },
    {
      key: 'isActive',
      label: 'Status',
      sortable: true,
      render: (value: boolean) => (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
          value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {value ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (_: any, row: UniversitySummary) => (
        <div className="flex gap-1">
          <button
            onClick={() => handleViewProfile(row.id)}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
            title="View full profile"
          >
            <MdDescription className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleEditUniversity(row.id)}
            className="p-1.5 text-green-600 hover:bg-green-50 rounded"
            title="Edit university"
          >
            <MdEdit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleToggleFeatured(row.id, row.isFeatured)}
            className={`p-1.5 rounded ${
              row.isFeatured ? 'text-yellow-600 hover:bg-yellow-50' : 'text-gray-400 hover:bg-gray-50'
            }`}
            title={row.isFeatured ? 'Remove from featured' : 'Mark as featured'}
          >
            {row.isFeatured ? <MdStar className="w-4 h-4" /> : <MdStarBorder className="w-4 h-4" />}
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="p-1.5 text-red-600 hover:bg-red-50 rounded"
            title="Delete university"
          >
            <MdDelete className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  // Get unique countries for filter
  const countries = Array.from(new Set(universities.map(u => u.country))).sort();

  // Calculate stats
  const totalUniversities = universities.length;
  const featuredUniversities = universities.filter(u => u.isFeatured).length;
  const partneredUniversities = universities.filter(u => u.isPartnered).length;
  const activeUniversities = universities.filter(u => u.isActive).length;

  return (
    <div>
      {/* Header with Stats */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">University Content Management</h1>
            <p className="text-gray-600 mt-2">Comprehensive university profiles and study abroad content</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleAddUniversity}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition"
            >
              <MdAdd className="w-4 h-4" />
              Add University
            </button>
            <ExportButton endpoint="/admin/export/universities" filename="universities" />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <MdSchool className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{totalUniversities}</div>
                <div className="text-sm text-gray-500">Total Universities</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <MdStar className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{featuredUniversities}</div>
                <div className="text-sm text-gray-500">Featured</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <MdVerified className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{partneredUniversities}</div>
                <div className="text-sm text-gray-500">Partners</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <MdTimeline className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{activeUniversities}</div>
                <div className="text-sm text-gray-500">Active</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <MdLocationOn className="w-4 h-4 text-gray-500" />
            <select
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-sm"
            >
              <option value="all">All Countries</option>
              {countries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <MdTimeline className="w-4 h-4 text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-sm"
            >
              <option value="all">All Status</option>
              <option value="true">Active Only</option>
              <option value="false">Inactive Only</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <MdVerified className="w-4 h-4 text-gray-500" />
            <select
              value={partnershipFilter}
              onChange={(e) => setPartnershipFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-sm"
            >
              <option value="all">All Partnerships</option>
              <option value="true">Partners Only</option>
              <option value="false">Non-Partners</option>
            </select>
          </div>

          <button
            onClick={fetchUniversities}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition text-sm"
          >
            <MdRefresh className="w-4 h-4" />
            Refresh
          </button>

          <div className="ml-auto text-sm text-gray-600">
            {universities.length} universit{universities.length !== 1 ? 'ies' : 'y'} found
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <DataTable
          data={universities}
          columns={columns}
          loading={loading}
          emptyMessage="No universities found matching your criteria"
        />
      </div>

      {/* University Profile Modal */}
      {showProfileModal && selectedUniversity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">University Profile</h2>
                <button
                  onClick={() => setShowProfileModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <MdClose className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* University Header */}
              <div className="flex items-start gap-4 mb-6">
                <img
                  src={selectedUniversity.media?.logo || '/default-university-logo.png'}
                  alt={selectedUniversity.basicInfo?.name}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900">{selectedUniversity.basicInfo?.name}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                    <span className="flex items-center gap-1">
                      <MdLocationOn className="w-4 h-4" />
                      {selectedUniversity.basicInfo?.city}, {selectedUniversity.basicInfo?.country}
                    </span>
                    <span className="flex items-center gap-1">
                      <MdTimeline className="w-4 h-4" />
                      World Rank #{selectedUniversity.academics?.ranking?.world || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Profile Tabs would go here - Basic Info, Academics, Facilities, Programs, etc. */}
              <div className="text-center py-8 text-gray-500">
                <MdDescription className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Full university profile management interface</p>
                <p className="text-sm mt-2">Complete CRUD operations for comprehensive university data</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit University Modal */}
      {showAddEditModal && (
        <UniversityProfileModal
          university={editingUniversity}
          onSave={handleSaveUniversity}
          onClose={() => {
            setShowAddEditModal(false);
            setEditingUniversity(null);
          }}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}
