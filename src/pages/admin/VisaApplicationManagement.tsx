// src/pages/admin/VisaApplicationManagement.tsx
import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import DataTable from '../../components/admin/DataTable';
import StatusBadge from '../../components/admin/StatusBadge';
import ExportButton from '../../components/admin/ExportButton';
import toast from 'react-hot-toast';
import { MdRefresh } from 'react-icons/md';
import { API_BASE_URL } from '../../utils/apiConfig';

interface VisaApplication {
  id: string;
  userId: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    nationality: string;
    passportNumber: string;
  };
  travelDetails: {
    purpose: string;
    destination: string;
    departureDate: string;
    returnDate: string;
  };
  status: string;
  submittedAt: string;
}

export default function VisaApplicationManagement() {
  const { currentUser } = useAuth();
  const [applications, setApplications] = useState<VisaApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchApplications();
  }, [statusFilter]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      if (!currentUser) {
        console.warn('No current user - skipping fetch');
        return;
      }

      const token = await currentUser.getIdToken();
      const url = statusFilter === 'all'
        ? `${API_BASE_URL}/admin/visa-applications?limit=100`
        : `${API_BASE_URL}/admin/visa-applications?status=${statusFilter}&limit=100`;

      console.log('Fetching visa applications from:', url);

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`Failed to fetch visa applications (${response.status})`);
      }

      const data = await response.json();
      console.log('Visa applications data received:', data);

      if (data.success) {
        console.log('Setting applications:', data.applications.length);
        setApplications(data.applications);
      } else {
        console.error('Response not successful:', data);
        toast.error('Failed to load visa applications: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error fetching visa applications:', error);
      toast.error('Failed to load visa applications: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (applicationId: string, newStatus: string) => {
    try {
      if (!currentUser) return;

      const token = await currentUser.getIdToken();
      const response = await fetch(`${API_BASE_URL}/admin/visa-applications/${applicationId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Status update failed');
      }

      toast.success('Visa application status updated successfully');
      fetchApplications(); // Refresh
    } catch (error) {
      console.error('Status update error:', error);
      toast.error('Failed to update visa application status');
    }
  };

  const handleDelete = async (applicationId: string) => {
    if (!confirm('Are you sure you want to delete this visa application? This action cannot be undone.')) return;

    try {
      if (!currentUser) return;

      const token = await currentUser.getIdToken();
      const response = await fetch(`${API_BASE_URL}/admin/visa-applications/${applicationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Delete failed');
      }

      toast.success('Visa application deleted successfully');
      fetchApplications(); // Refresh
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete visa application');
    }
  };

  const columns = [
    {
      key: 'id',
      label: 'Application ID',
      sortable: true,
      render: (value: string) => (
        <span className="font-mono text-xs">{value.substring(0, 8)}...</span>
      )
    },
    {
      key: 'personalInfo',
      label: 'Applicant',
      sortable: false,
      render: (_: any, row: VisaApplication) => (
        <div>
          <div className="font-medium">{row.personalInfo?.firstName} {row.personalInfo?.lastName}</div>
          <div className="text-xs text-gray-500">{row.personalInfo?.email}</div>
          <div className="text-xs text-gray-500">{row.personalInfo?.nationality}</div>
        </div>
      )
    },
    {
      key: 'travelDetails',
      label: 'Travel Details',
      sortable: false,
      render: (_: any, row: VisaApplication) => (
        <div>
          <div className="font-medium">{row.travelDetails?.destination}</div>
          <div className="text-xs text-gray-500">{row.travelDetails?.purpose}</div>
          <div className="text-xs text-gray-500">
            {row.travelDetails?.departureDate} - {row.travelDetails?.returnDate}
          </div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value: string) => <StatusBadge status={value} type="application" />
    },
    {
      key: 'submittedAt',
      label: 'Submitted',
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString()
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (_: any, row: VisaApplication) => (
        <div className="flex gap-2">
          {row.status !== 'completed' && (
            <select
              value={row.status}
              onChange={(e) => handleStatusUpdate(row.id, e.target.value)}
              className="text-xs px-2 py-1 border border-gray-300 rounded"
            >
              <option value="submitted">Submitted</option>
              <option value="under_review">Under Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="completed">Completed</option>
            </select>
          )}
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
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Visa Application Management</h1>
            <p className="text-sm md:text-base text-gray-600 mt-1 md:mt-2">Manage visa applications, approvals, and rejections</p>
          </div>
          <ExportButton endpoint="/admin/export/visa-applications" filename="visa-applications" />
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 md:mb-6 flex flex-wrap gap-3 md:gap-4 items-center">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 md:px-4 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
        >
          <option value="all">All Status</option>
          <option value="submitted">Submitted</option>
          <option value="under_review">Under Review</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="completed">Completed</option>
        </select>

        <button
          onClick={fetchApplications}
          className="flex items-center gap-2 px-3 md:px-4 py-2 text-sm md:text-base bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          <MdRefresh className="w-4 h-4" />
          <span>Refresh</span>
        </button>

        <div className="ml-auto text-xs md:text-sm text-gray-600">
          {applications.length} application{applications.length !== 1 ? 's' : ''} found
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={applications}
        columns={columns}
        loading={loading}
        emptyMessage="No visa applications found"
      />
    </div>
  );
}




