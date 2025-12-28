// src/pages/admin/UniversityManagement.tsx
import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import DataTable from '../../components/admin/DataTable';
import ExportButton from '../../components/admin/ExportButton';
import toast from 'react-hot-toast';
import { MdRefresh, MdStar, MdStarBorder, MdDelete, MdSchool } from 'react-icons/md';
import { API_BASE_URL } from '../../utils/apiConfig';

interface University {
  id: string;
  name: string;
  country: string;
  city: string;
  ranking: number;
  logo: string;
  isFeatured: boolean;
  isActive: boolean;
  programs: string[];
  tuitionFees: {
    undergraduate: number;
    postgraduate: number;
    currency: string;
  };
  createdAt: string;
}

export default function UniversityManagement() {
  const { currentUser } = useAuth();
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [countryFilter, setCountryFilter] = useState('all');
  const [featuredFilter, setFeaturedFilter] = useState('all');

  useEffect(() => {
    fetchUniversities();
  }, [countryFilter, featuredFilter]);

  const fetchUniversities = async () => {
    setLoading(true);
    try {
      if (!currentUser) return;

      const token = await currentUser.getIdToken();
      let url = `${API_BASE_URL}/admin/universities?limit=100`;

      if (countryFilter !== 'all') {
        url += `&country=${countryFilter}`;
      }
      if (featuredFilter !== 'all') {
        url += `&featured=${featuredFilter}`;
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
        setUniversities(data.universities);
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
      key: 'logo',
      label: 'Logo',
      sortable: false,
      render: (value: string, row: University) => (
        <div className="flex items-center gap-2">
          {value ? (
            <img src={value} alt={row.name} className="w-10 h-10 rounded object-cover" />
          ) : (
            <div className="w-10 h-10 rounded bg-gray-200 flex items-center justify-center">
              <MdSchool className="w-6 h-6 text-gray-400" />
            </div>
          )}
        </div>
      )
    },
    {
      key: 'name',
      label: 'University',
      sortable: true,
      render: (value: string, row: University) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-xs text-gray-500">{row.city}, {row.country}</div>
        </div>
      )
    },
    {
      key: 'ranking',
      label: 'Ranking',
      sortable: true,
      render: (value: number) => (
        <span className="font-semibold">#{value}</span>
      )
    },
    {
      key: 'programs',
      label: 'Programs',
      sortable: false,
      render: (value: string[]) => (
        <span className="text-sm">{value?.length || 0} programs</span>
      )
    },
    {
      key: 'tuitionFees',
      label: 'Tuition (UG)',
      sortable: false,
      render: (_: any, row: University) => (
        <span className="text-sm">
          {row.tuitionFees?.currency || '$'} {row.tuitionFees?.undergraduate?.toLocaleString() || 'N/A'}
        </span>
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
          <MdStarBorder className="w-5 h-5 text-gray-300" />
        )
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
      render: (_: any, row: University) => (
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggleFeatured(row.id, row.isFeatured);
            }}
            className={`text-xs px-3 py-1 rounded transition ${
              row.isFeatured
                ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            title={row.isFeatured ? 'Remove from featured' : 'Add to featured'}
          >
            {row.isFeatured ? 'Unfeature' : 'Feature'}
          </button>
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

  // Get unique countries for filter
  const countries = Array.from(new Set(universities.map(u => u.country))).sort();

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">University Management</h1>
          <p className="text-gray-600 mt-2">Manage universities and study abroad programs</p>
        </div>
        <ExportButton endpoint="/admin/export/universities" filename="universities" />
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4 items-center">
        <select
          value={countryFilter}
          onChange={(e) => setCountryFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
        >
          <option value="all">All Countries</option>
          {countries.map(country => (
            <option key={country} value={country}>{country}</option>
          ))}
        </select>

        <select
          value={featuredFilter}
          onChange={(e) => setFeaturedFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
        >
          <option value="all">All Universities</option>
          <option value="true">Featured Only</option>
          <option value="false">Not Featured</option>
        </select>

        <button
          onClick={fetchUniversities}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          <MdRefresh className="w-4 h-4" />
          Refresh
        </button>

        <div className="ml-auto text-sm text-gray-600">
          {universities.length} universit{universities.length !== 1 ? 'ies' : 'y'} found
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={universities}
        columns={columns}
        loading={loading}
        emptyMessage="No universities found"
      />
    </div>
  );
}
