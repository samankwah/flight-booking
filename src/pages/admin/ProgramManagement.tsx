// src/pages/admin/ProgramManagement.tsx
import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import DataTable from '../../components/admin/DataTable';
import ExportButton from '../../components/admin/ExportButton';
import toast from 'react-hot-toast';
import {
  MdRefresh,
  MdBook,
  MdSchool,
  MdAdd,
  MdEdit,
  MdDelete,
  MdDescription,
  MdAttachMoney,
  MdTimeline,
  MdPeople,
  MdVerified,
  MdLanguage,
  MdGrade,
  MdCalendarToday
} from 'react-icons/md';
import { API_BASE_URL } from '../../utils/apiConfig';

interface ProgramProfile {
  id: string;
  basicInfo: {
    name: string;
    universityId: string;
    universityName: string;
    degree: 'undergraduate' | 'postgraduate' | 'phd' | 'certificate' | 'diploma';
    field: string;
    subfield: string;
    duration: string;
    language: string;
    description: string;
  };
  academics: {
    credits: number;
    curriculum: {
      courses: Array<{
        name: string;
        credits: number;
        semester: number;
        type: 'core' | 'elective' | 'practicum';
      }>;
      specializations: string[];
      learningOutcomes: string[];
    };
    accreditation: string[];
    ranking: number;
  };
  admission: {
    requirements: {
      academic: string[];
      english: string[];
      documents: string[];
      experience?: string;
    };
    deadlines: {
      fall: string;
      spring: string;
      summer: string;
    };
    process: string;
    interviews: boolean;
  };
  fees: {
    tuition: {
      amount: number;
      currency: string;
      frequency: 'year' | 'semester' | 'program';
    };
    scholarships: Array<{
      name: string;
      amount: number;
      currency: string;
      eligibility: string;
      deadline: string;
    }>;
    additionalFees: Array<{
      name: string;
      amount: number;
      currency: string;
      mandatory: boolean;
    }>;
  };
  career: {
    jobProspects: string[];
    averageSalary: {
      amount: number;
      currency: string;
      period: string;
    };
    industries: string[];
    employers: string[];
  };
  settings: {
    isActive: boolean;
    isFeatured: boolean;
    priority: number;
    tags: string[];
    targetStudents: string[];
    lastUpdated: string;
    createdAt: string;
  };
}

interface ProgramSummary {
  id: string;
  name: string;
  universityName: string;
  degree: string;
  field: string;
  duration: string;
  tuition: number;
  currency: string;
  isActive: boolean;
  isFeatured: boolean;
  totalCredits: number;
  scholarshipCount: number;
  createdAt: string;
}

export default function ProgramManagement() {
  const { currentUser } = useAuth();
  const [programs, setPrograms] = useState<ProgramSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [degreeFilter, setDegreeFilter] = useState('all');
  const [universityFilter, setUniversityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedProgram, setSelectedProgram] = useState<ProgramProfile | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    fetchPrograms();
  }, [degreeFilter, universityFilter, statusFilter]);

  const fetchPrograms = async () => {
    setLoading(true);
    try {
      if (!currentUser) return;

      const token = await currentUser.getIdToken();
      let url = `${API_BASE_URL}/admin/programs?limit=100`;

      if (degreeFilter !== 'all') {
        url += `&degree=${degreeFilter}`;
      }
      if (universityFilter !== 'all') {
        url += `&university=${universityFilter}`;
      }
      if (statusFilter !== 'all') {
        url += `&status=${statusFilter}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch programs');
      }

      const data = await response.json();

      if (data.success) {
        // Transform data to summary format
        const summaries: ProgramSummary[] = data.programs.map((prog: any) => ({
          id: prog.id,
          name: prog.basicInfo?.name || prog.name,
          universityName: prog.basicInfo?.universityName || prog.universityName,
          degree: prog.basicInfo?.degree || prog.degree,
          field: prog.basicInfo?.field || prog.field,
          duration: prog.basicInfo?.duration || prog.duration,
          tuition: prog.fees?.tuition?.amount || prog.tuition || 0,
          currency: prog.fees?.tuition?.currency || prog.currency || 'USD',
          isActive: prog.settings?.isActive || prog.isActive,
          isFeatured: prog.settings?.isFeatured || prog.isFeatured,
          totalCredits: prog.academics?.credits || 0,
          scholarshipCount: prog.fees?.scholarships?.length || 0,
          createdAt: prog.settings?.createdAt || prog.createdAt
        }));
        setPrograms(summaries);
      } else {
        toast.error('Failed to load programs');
      }
    } catch (error) {
      console.error('Error fetching programs:', error);
      toast.error('Failed to load programs');
    } finally {
      setLoading(false);
    }
  };

  const handleViewProfile = async (programId: string) => {
    try {
      if (!currentUser) return;

      const token = await currentUser.getIdToken();
      const response = await fetch(`${API_BASE_URL}/admin/programs/${programId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch program profile');
      }

      const data = await response.json();
      if (data.success) {
        setSelectedProgram(data.program);
        setShowProfileModal(true);
      }
    } catch (error) {
      console.error('Error fetching program profile:', error);
      toast.error('Failed to load program profile');
    }
  };

  const handleDelete = async (programId: string) => {
    if (!confirm('Are you sure you want to delete this program? This action cannot be undone.')) return;

    try {
      if (!currentUser) return;

      const token = await currentUser.getIdToken();
      const response = await fetch(`${API_BASE_URL}/admin/programs/${programId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Delete failed');
      }

      toast.success('Program deleted successfully');
      fetchPrograms(); // Refresh
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete program');
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Program',
      sortable: true,
      render: (value: string, row: ProgramSummary) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
            {value.charAt(0)}
          </div>
          <div>
            <div className="font-medium text-gray-900">{value}</div>
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <MdSchool className="w-3 h-3" />
              {row.universityName}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'degree',
      label: 'Degree Type',
      sortable: true,
      render: (value: string) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
          {value}
        </span>
      )
    },
    {
      key: 'field',
      label: 'Field',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center gap-1">
          <MdBook className="w-4 h-4 text-green-500" />
          <span className="text-sm font-medium">{value}</span>
        </div>
      )
    },
    {
      key: 'duration',
      label: 'Duration',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center gap-1">
          <MdTimeline className="w-4 h-4 text-purple-500" />
          <span className="text-sm font-medium">{value}</span>
        </div>
      )
    },
    {
      key: 'totalCredits',
      label: 'Credits',
      sortable: true,
      render: (value: number) => (
        value > 0 ? (
          <span className="text-sm font-medium">{value}</span>
        ) : (
          <span className="text-gray-400">-</span>
        )
      )
    },
    {
      key: 'tuition',
      label: 'Tuition',
      sortable: true,
      render: (value: number, row: ProgramSummary) => (
        <div className="flex items-center gap-1">
          <MdAttachMoney className="w-4 h-4 text-green-600" />
          <span className="font-semibold text-green-600">{row.currency} {value.toLocaleString()}</span>
        </div>
      )
    },
    {
      key: 'scholarshipCount',
      label: 'Scholarships',
      sortable: true,
      render: (value: number) => (
        <div className="flex items-center gap-1">
          <MdGrade className="w-4 h-4 text-yellow-500" />
          <span className="text-sm font-medium">{value}</span>
        </div>
      )
    },
    {
      key: 'isFeatured',
      label: 'Featured',
      sortable: true,
      render: (value: boolean) => (
        value ? (
          <MdVerified className="w-5 h-5 text-yellow-500" />
        ) : (
          <MdVerified className="w-5 h-5 text-gray-400 opacity-30" />
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
      render: (_: any, row: ProgramSummary) => (
        <div className="flex gap-1">
          <button
            onClick={() => handleViewProfile(row.id)}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
            title="View full program profile"
          >
            <MdDescription className="w-4 h-4" />
          </button>
          <button
            onClick={() => {/* Toggle featured */}}
            className={`p-1.5 rounded ${
              row.isFeatured ? 'text-yellow-600 hover:bg-yellow-50' : 'text-gray-400 hover:bg-gray-50'
            }`}
            title={row.isFeatured ? 'Remove from featured' : 'Mark as featured'}
          >
            {row.isFeatured ? <MdVerified className="w-4 h-4" /> : <MdVerified className="w-4 h-4 opacity-30" />}
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="p-1.5 text-red-600 hover:bg-red-50 rounded"
            title="Delete program"
          >
            <MdDelete className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  // Get unique universities for filter
  const universities = Array.from(new Set(programs.map(p => p.universityName))).sort();

  // Calculate stats
  const totalPrograms = programs.length;
  const activePrograms = programs.filter(p => p.isActive).length;
  const featuredPrograms = programs.filter(p => p.isFeatured).length;
  const totalScholarships = programs.reduce((sum, p) => sum + p.scholarshipCount, 0);

  return (
    <div>
      {/* Header with Stats */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Academic Program Management</h1>
            <p className="text-gray-600 mt-2">Comprehensive program content and curriculum management</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {/* Add new program modal */}}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition"
            >
              <MdAdd className="w-4 h-4" />
              Add Program
            </button>
            <ExportButton endpoint="/admin/export/programs" filename="programs" />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <MdBook className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{totalPrograms}</div>
                <div className="text-sm text-gray-500">Total Programs</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <MdVerified className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{activePrograms}</div>
                <div className="text-sm text-gray-500">Active Programs</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <MdGrade className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{totalScholarships}</div>
                <div className="text-sm text-gray-500">Scholarships</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <MdPeople className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{featuredPrograms}</div>
                <div className="text-sm text-gray-500">Featured</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <MdBook className="w-4 h-4 text-gray-500" />
            <select
              value={degreeFilter}
              onChange={(e) => setDegreeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-sm"
            >
              <option value="all">All Degrees</option>
              <option value="undergraduate">Undergraduate</option>
              <option value="postgraduate">Postgraduate</option>
              <option value="phd">PhD</option>
              <option value="certificate">Certificate</option>
              <option value="diploma">Diploma</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <MdSchool className="w-4 h-4 text-gray-500" />
            <select
              value={universityFilter}
              onChange={(e) => setUniversityFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-sm"
            >
              <option value="all">All Universities</option>
              {universities.map(university => (
                <option key={university} value={university}>{university}</option>
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

          <button
            onClick={fetchPrograms}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition text-sm"
          >
            <MdRefresh className="w-4 h-4" />
            Refresh
          </button>

          <div className="ml-auto text-sm text-gray-600">
            {programs.length} program{programs.length !== 1 ? 's' : ''} found
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <DataTable
          data={programs}
          columns={columns}
          loading={loading}
          emptyMessage="No programs found matching your criteria"
        />
      </div>

      {/* Program Profile Modal */}
      {showProfileModal && selectedProgram && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Program Profile</h2>
                <button
                  onClick={() => setShowProfileModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <MdClose className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Program Header */}
              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl">
                  {selectedProgram.basicInfo?.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900">{selectedProgram.basicInfo?.name}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                    <span className="flex items-center gap-1">
                      <MdSchool className="w-4 h-4" />
                      {selectedProgram.basicInfo?.universityName}
                    </span>
                    <span className="flex items-center gap-1">
                      <MdBook className="w-4 h-4" />
                      {selectedProgram.basicInfo?.degree} • {selectedProgram.basicInfo?.field}
                    </span>
                    <span className="flex items-center gap-1">
                      <MdTimeline className="w-4 h-4" />
                      {selectedProgram.basicInfo?.duration}
                    </span>
                  </div>
                </div>
              </div>

              {/* Profile Tabs would go here - Academics, Fees, Requirements, Career, etc. */}
              <div className="text-center py-8 text-gray-500">
                <MdDescription className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Full program profile management interface</p>
                <p className="text-sm mt-2">Complete CRUD operations for comprehensive program data</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
