// src/pages/admin/ApplicationManagement.tsx
import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import DataTable from '../../components/admin/DataTable';
import StatusBadge from '../../components/admin/StatusBadge';
import ExportButton from '../../components/admin/ExportButton';
import toast from 'react-hot-toast';
import { MdRefresh, MdCheckCircle, MdCancel, MdPending } from 'react-icons/md';
import { API_BASE_URL } from '../../utils/apiConfig';

interface Application {
  id: string;
  userId: string;
  universityId: string;
  universityName: string;
  program: string;
  studentInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    nationality: string;
    gpa: number;
  };
  status: 'submitted' | 'under_review' | 'accepted' | 'rejected' | 'waitlisted';
  intakePeriod: string;
  submittedAt: string;
  updatedAt: string;
  adminNotes?: string;
}

export default function ApplicationManagement() {
  const { currentUser } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchApplications();
  }, [statusFilter]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      if (!currentUser) return;

      const token = await currentUser.getIdToken();
      const url = statusFilter === 'all'
        ? `${API_BASE_URL}/admin/applications?limit=100`
        : `${API_BASE_URL}/admin/applications?status=${statusFilter}&limit=100`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch applications');
      }

      const data = await response.json();
      if (data.success) {
        setApplications(data.applications);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (applicationId: string, newStatus: string) => {
    const statusLabels: Record<string, string> = {
      under_review: 'mark this application as Under Review',
      accepted: 'ACCEPT this application',
      rejected: 'REJECT this application',
      waitlisted: 'add this application to the Waitlist'
    };

    if (!confirm(`Are you sure you want to ${statusLabels[newStatus]}?`)) return;

    try {
      if (!currentUser) return;

      const token = await currentUser.getIdToken();
      const response = await fetch(`${API_BASE_URL}/admin/applications/${applicationId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update application status');
      }

      toast.success(`Application status updated to ${newStatus.replace('_', ' ')}`);
      fetchApplications(); // Refresh
    } catch (error) {
      console.error('Status update error:', error);
      toast.error('Failed to update application status');
    }
  };

  const handleAddNotes = async () => {
    if (!selectedApplication) return;

    try {
      if (!currentUser) return;

      const token = await currentUser.getIdToken();
      const response = await fetch(`${API_BASE_URL}/admin/applications/${selectedApplication.id}/notes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ note: notes })
      });

      if (!response.ok) {
        throw new Error('Failed to add notes');
      }

      toast.success('Notes added successfully');
      setShowNotesModal(false);
      setNotes('');
      setSelectedApplication(null);
      fetchApplications(); // Refresh
    } catch (error) {
      console.error('Add notes error:', error);
      toast.error('Failed to add notes');
    }
  };

  const handleDelete = async (applicationId: string) => {
    if (!confirm('Are you sure you want to delete this application? This action cannot be undone.')) return;

    try {
      if (!currentUser) return;

      const token = await currentUser.getIdToken();
      const response = await fetch(`${API_BASE_URL}/admin/applications/${applicationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Delete failed');
      }

      toast.success('Application deleted successfully');
      fetchApplications(); // Refresh
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete application');
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
      key: 'studentInfo',
      label: 'Student',
      sortable: false,
      render: (_: any, row: Application) => (
        <div>
          <div className="font-medium">{row.studentInfo?.firstName} {row.studentInfo?.lastName}</div>
          <div className="text-xs text-gray-500">{row.studentInfo?.email}</div>
        </div>
      )
    },
    {
      key: 'universityName',
      label: 'University',
      sortable: true,
      render: (value: string, row: Application) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-xs text-gray-500">{row.program}</div>
        </div>
      )
    },
    {
      key: 'studentInfo.gpa',
      label: 'GPA',
      sortable: false,
      render: (_: any, row: Application) => (
        <span className="text-sm font-semibold">{row.studentInfo?.gpa?.toFixed(2) || 'N/A'}</span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value: string) => <StatusBadge status={value} type="application" />
    },
    {
      key: 'intakePeriod',
      label: 'Intake',
      sortable: true,
      render: (value: string) => (
        <span className="text-sm">{value}</span>
      )
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
      render: (_: any, row: Application) => (
        <div className="flex flex-col gap-1">
          <div className="flex gap-1">
            {row.status === 'submitted' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleStatusChange(row.id, 'under_review');
                }}
                className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition"
                title="Mark as Under Review"
              >
                <MdPending className="w-4 h-4" />
              </button>
            )}
            {(row.status === 'submitted' || row.status === 'under_review') && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStatusChange(row.id, 'accepted');
                  }}
                  className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition"
                  title="Accept"
                >
                  <MdCheckCircle className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStatusChange(row.id, 'rejected');
                  }}
                  className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
                  title="Reject"
                >
                  <MdCancel className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
          <div className="flex gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedApplication(row);
                setNotes(row.adminNotes || '');
                setShowNotesModal(true);
              }}
              className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition"
            >
              Notes
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(row.id);
              }}
              className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
            >
              Delete
            </button>
          </div>
        </div>
      )
    }
  ];

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Application Management</h1>
          <p className="text-gray-600 mt-2">Manage study abroad applications</p>
        </div>
        <ExportButton endpoint="/admin/export/applications" filename="applications" />
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4 items-center">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
        >
          <option value="all">All Status</option>
          <option value="submitted">Submitted</option>
          <option value="under_review">Under Review</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
          <option value="waitlisted">Waitlisted</option>
        </select>

        <button
          onClick={fetchApplications}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          <MdRefresh className="w-4 h-4" />
          Refresh
        </button>

        <div className="ml-auto text-sm text-gray-600">
          {applications.length} application{applications.length !== 1 ? 's' : ''} found
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={applications}
        columns={columns}
        loading={loading}
        emptyMessage="No applications found"
      />

      {/* Notes Modal */}
      {showNotesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Admin Notes</h3>
            <p className="text-sm text-gray-600 mb-4">
              Application for {selectedApplication?.studentInfo?.firstName} {selectedApplication?.studentInfo?.lastName}
            </p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              rows={6}
              placeholder="Enter admin notes..."
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleAddNotes}
                className="flex-1 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition"
              >
                Save Notes
              </button>
              <button
                onClick={() => {
                  setShowNotesModal(false);
                  setNotes('');
                  setSelectedApplication(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
