// src/pages/admin/ProgramManagement.tsx
import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import DataTable from '../../components/admin/DataTable';
import ExportButton from '../../components/admin/ExportButton';
import toast from 'react-hot-toast';
import { MdRefresh, MdBook, MdSchool } from 'react-icons/md';
import { API_BASE_URL } from '../../utils/apiConfig';

interface Program {
  id: string;
  name: string;
  universityId: string;
  universityName: string;
  degree: 'undergraduate' | 'postgraduate' | 'phd' | 'certificate';
  field: string;
  duration: string;
  description: string;
  tuition: number;
  currency: string;
  requirements: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function ProgramManagement() {
  const { currentUser } = useAuth();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [degreeFilter, setDegreeFilter] = useState('all');

  useEffect(() => {
    fetchPrograms();
  }, [degreeFilter]);

  const fetchPrograms = async () => {
    setLoading(true);
    try {
      if (!currentUser) return;

      const token = await currentUser.getIdToken();
      let url = `${API_BASE_URL}/admin/programs?limit=100`;

      if (degreeFilter !== 'all') {
        url += `&degree=${degreeFilter}`;
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
        setPrograms(data.programs);
      }
    } catch (error) {
      console.error('Error fetching programs:', error);
      toast.error('Failed to load programs');
    } finally {
      setLoading(false);
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
      render: (value: string, row: Program) => (
        <div>
          <div className="font-medium flex items-center gap-2">
            <MdBook className="w-4 h-4 text-cyan-600" />
            {value}
          </div>
          <div className="text-xs text-gray-500">{row.field}</div>
        </div>
      )
    },
    {
      key: 'universityName',
      label: 'University',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <MdSchool className="w-4 h-4 text-gray-400" />
          <span className="text-sm">{value}</span>
        </div>
      )
    },
    {
      key: 'degree',
      label: 'Degree',
      sortable: true,
      render: (value: string) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
          {value}
        </span>
      )
    },
    {
      key: 'duration',
      label: 'Duration',
      sortable: true,
      render: (value: string) => (
        <span className="text-sm">{value}</span>
      )
    },
    {
      key: 'tuition',
      label: 'Tuition',
      sortable: true,
      render: (value: number, row: Program) => (
        <span className="font-semibold">{row.currency} {value.toLocaleString()}</span>
      )
    },
    {
      key: 'requirements',
      label: 'Requirements',
      sortable: false,
      render: (value: string[]) => (
        <span className="text-sm text-gray-600">{value?.length || 0} requirement{value?.length !== 1 ? 's' : ''}</span>
      )
    },
    {
      key: 'isActive',
      label: 'Status',
      sortable: true,
      render: (value: boolean) => (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
            value
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {value ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      key: 'createdAt',
      label: 'Created',
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString()
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (_: any, row: Program) => (
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(row.id);
            }}
            className="text-xs px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
          >
            Delete
          </button>
        </div>
      )
    }
  ];

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Program Management</h1>
          <p className="text-gray-600 mt-2">Manage study abroad programs</p>
        </div>
        <ExportButton endpoint="/admin/export/programs" filename="programs" />
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4 items-center">
        <select
          value={degreeFilter}
          onChange={(e) => setDegreeFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
        >
          <option value="all">All Degrees</option>
          <option value="undergraduate">Undergraduate</option>
          <option value="postgraduate">Postgraduate</option>
          <option value="phd">PhD</option>
          <option value="certificate">Certificate</option>
        </select>

        <button
          onClick={fetchPrograms}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          <MdRefresh className="w-4 h-4" />
          Refresh
        </button>

        <div className="ml-auto text-sm text-gray-600">
          {programs.length} program{programs.length !== 1 ? 's' : ''} found
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={programs}
        columns={columns}
        loading={loading}
        emptyMessage="No programs found"
      />
    </div>
  );
}
