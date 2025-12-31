// src/pages/admin/ApplicationManagement.tsx
import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import DataTable from '../../components/admin/DataTable';
import StatusBadge from '../../components/admin/StatusBadge';
import ExportButton from '../../components/admin/ExportButton';
import toast from 'react-hot-toast';
import {
  MdRefresh,
  MdCheckCircle,
  MdCancel,
  MdPending,
  MdEmail,
  MdAttachFile,
  MdTimeline,
  MdPayment,
  MdAssignment,
  MdMessage,
  MdAnalytics,
  MdFilterList,
  MdFilter,
  MdDownload,
  MdEdit,
  MdVisibility,
  MdDelete,
  MdAdd,
  MdSearch,
  MdPerson,
  MdSchool,
  MdDateRange,
  MdCheckBox,
  MdSend,
  MdReply,
  MdClose
} from 'react-icons/md';
import { API_BASE_URL } from '../../utils/apiConfig';

interface ApplicationWorkflow {
  id: string;
  applicant: {
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    nationality: string;
    passportNumber: string;
  };
  university: {
    id: string;
    name: string;
    country: string;
    applicationFee: number;
    currency: string;
  };
  program: {
    name: string;
    degree: string;
    intakePeriod: string;
    startDate: string;
  };
  academics: {
    currentEducation: string;
    gpa: number;
    graduationYear: number;
    previousInstitution: string;
    englishProficiency: {
      test: string;
      score: number;
      date: string;
    };
  };
  documents: {
    passport: { status: 'pending' | 'verified' | 'rejected'; notes?: string; };
    transcripts: { status: 'pending' | 'verified' | 'rejected'; notes?: string; };
    certificates: { status: 'pending' | 'verified' | 'rejected'; notes?: string; };
    essay: { status: 'pending' | 'verified' | 'rejected'; notes?: string; };
    recommendations: { status: 'pending' | 'verified' | 'rejected'; notes?: string; };
    financialProof: { status: 'pending' | 'verified' | 'rejected'; notes?: string; };
  };
  payment: {
    amount: number;
    currency: string;
    status: 'pending' | 'paid' | 'refunded' | 'failed';
    transactionId?: string;
    paymentDate?: string;
    method?: string;
  };
  workflow: {
    status: 'submitted' | 'document_review' | 'academic_review' | 'interview' | 'decision' | 'accepted' | 'rejected' | 'waitlisted' | 'enrolled' | 'withdrawn';
    currentStep: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    assignedTo?: string;
    deadline?: string;
    submittedAt: string;
    updatedAt: string;
  };
  communications: Array<{
    id: string;
    type: 'email' | 'note' | 'call' | 'meeting';
    direction: 'inbound' | 'outbound';
    subject: string;
    message: string;
    timestamp: string;
    sentBy: string;
  }>;
  timeline: Array<{
    id: string;
    action: string;
    description: string;
    timestamp: string;
    performedBy: string;
    metadata?: any;
  }>;
  analytics: {
    timeToReview: number; // days
    documentsVerified: number;
    totalDocuments: number;
    communicationsCount: number;
  };
}

interface ApplicationSummary {
  id: string;
  applicantName: string;
  email: string;
  universityName: string;
  programName: string;
  status: string;
  priority: string;
  submittedAt: string;
  deadline?: string;
  documentsVerified: number;
  totalDocuments: number;
  paymentStatus: string;
  assignedTo?: string;
}

export default function ApplicationManagement() {
  const { currentUser } = useAuth();
  const [applications, setApplications] = useState<ApplicationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [universityFilter, setUniversityFilter] = useState('all');
  const [assignedFilter, setAssignedFilter] = useState('all');
  const [selectedApplication, setSelectedApplication] = useState<ApplicationWorkflow | null>(null);
  const [showWorkflowModal, setShowWorkflowModal] = useState(false);
  const [showCommunicationModal, setShowCommunicationModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'communications' | 'timeline' | 'analytics'>('overview');
  const [communicationMessage, setCommunicationMessage] = useState('');
  const [bulkSelected, setBulkSelected] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, [statusFilter, priorityFilter, universityFilter, assignedFilter]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      if (!currentUser) return;

      const token = await currentUser.getIdToken();
      let url = `${API_BASE_URL}/admin/applications?limit=100`;

      // Build filter query
      const filters: string[] = [];
      if (statusFilter !== 'all') filters.push(`status=${statusFilter}`);
      if (priorityFilter !== 'all') filters.push(`priority=${priorityFilter}`);
      if (universityFilter !== 'all') filters.push(`university=${universityFilter}`);
      if (assignedFilter !== 'all') filters.push(`assigned=${assignedFilter}`);

      if (filters.length > 0) {
        url += `&${filters.join('&')}`;
      }

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
        // Transform data to summary format
        const summaries: ApplicationSummary[] = data.applications.map((app: any) => ({
          id: app.id,
          applicantName: `${app.applicant?.firstName || app.firstName} ${app.applicant?.lastName || app.lastName}`,
          email: app.applicant?.email || app.email,
          universityName: app.university?.name || app.universityName,
          programName: app.program?.name || app.programs?.[0] || 'N/A',
          status: app.workflow?.status || app.status,
          priority: app.workflow?.priority || 'medium',
          submittedAt: app.workflow?.submittedAt || app.submittedAt,
          deadline: app.workflow?.deadline,
          documentsVerified: app.analytics?.documentsVerified || 0,
          totalDocuments: app.analytics?.totalDocuments || 6,
          paymentStatus: app.payment?.status || app.paymentStatus || 'pending',
          assignedTo: app.workflow?.assignedTo
        }));
        setApplications(summaries);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  // Workflow Management Functions
  const handleViewWorkflow = async (applicationId: string) => {
    try {
      if (!currentUser) return;

      const token = await currentUser.getIdToken();
      const response = await fetch(`${API_BASE_URL}/admin/applications/${applicationId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch application details');
      }

      const data = await response.json();
      if (data.success) {
        setSelectedApplication(data.application);
        setShowWorkflowModal(true);
        setActiveTab('overview');
      }
    } catch (error) {
      console.error('Error fetching application details:', error);
      toast.error('Failed to load application details');
    }
  };

  const handleStatusChange = async (applicationId: string, newStatus: string, notes?: string) => {
    const statusLabels: Record<string, string> = {
      submitted: 'reset to Submitted',
      document_review: 'move to Document Review',
      academic_review: 'move to Academic Review',
      interview: 'schedule for Interview',
      decision: 'move to Final Decision',
      accepted: 'ACCEPT this application',
      rejected: 'REJECT this application',
      waitlisted: 'add to Waitlist',
      enrolled: 'mark as Enrolled',
      withdrawn: 'mark as Withdrawn'
    };

    const confirmMessage = notes ?
      `Are you sure you want to ${statusLabels[newStatus]}?\n\nNotes: ${notes}` :
      `Are you sure you want to ${statusLabels[newStatus]}?`;

    if (!confirm(confirmMessage)) return;

    try {
      if (!currentUser) return;

      const token = await currentUser.getIdToken();
      const response = await fetch(`${API_BASE_URL}/admin/applications/${applicationId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus, notes, adminId: currentUser.uid })
      });

      if (!response.ok) {
        throw new Error('Failed to update application status');
      }

      toast.success('Application status updated successfully');
      fetchApplications();
      if (selectedApplication) {
        handleViewWorkflow(applicationId); // Refresh the workflow modal
      }
    } catch (error) {
      console.error('Error updating application status:', error);
      toast.error('Failed to update application status');
    }
  };

  const handleDocumentVerification = async (applicationId: string, documentType: string, status: 'verified' | 'rejected', notes?: string) => {
    try {
      if (!currentUser) return;

      const token = await currentUser.getIdToken();
      const response = await fetch(`${API_BASE_URL}/admin/applications/${applicationId}/documents/${documentType}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status, notes, verifiedBy: currentUser.uid })
      });

      if (!response.ok) {
        throw new Error('Failed to update document status');
      }

      toast.success('Document verification updated');
      handleViewWorkflow(applicationId); // Refresh
    } catch (error) {
      console.error('Error updating document status:', error);
      toast.error('Failed to update document verification');
    }
  };

  const handleSendCommunication = async (applicationId: string, type: 'email' | 'note', subject: string, message: string) => {
    try {
      if (!currentUser) return;

      const token = await currentUser.getIdToken();
      const response = await fetch(`${API_BASE_URL}/admin/applications/${applicationId}/communications`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type,
          direction: 'outbound',
          subject,
          message,
          sentBy: currentUser.uid
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send communication');
      }

      toast.success('Communication sent successfully');
      setCommunicationMessage('');
      setShowCommunicationModal(false);
      handleViewWorkflow(applicationId); // Refresh
    } catch (error) {
      console.error('Error sending communication:', error);
      toast.error('Failed to send communication');
    }
  };

  const handleAssignApplication = async (applicationId: string, assignedTo: string) => {
    try {
      if (!currentUser) return;

      const token = await currentUser.getIdToken();
      const response = await fetch(`${API_BASE_URL}/admin/applications/${applicationId}/assign`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ assignedTo, assignedBy: currentUser.uid })
      });

      if (!response.ok) {
        throw new Error('Failed to assign application');
      }

      toast.success('Application assigned successfully');
      fetchApplications();
    } catch (error) {
      console.error('Error assigning application:', error);
      toast.error('Failed to assign application');
    }
  };

  const handleBulkAction = async (action: string, selectedIds: string[]) => {
    if (selectedIds.length === 0) return;

    const actionLabels: Record<string, string> = {
      'mark_under_review': 'mark selected applications as Under Review',
      'assign_to_me': 'assign selected applications to yourself',
      'export_selected': 'export selected applications',
      'send_bulk_email': 'send bulk email to selected applicants'
    };

    if (!confirm(`Are you sure you want to ${actionLabels[action]}?`)) return;

    try {
      if (!currentUser) return;

      const token = await currentUser.getIdToken();

      switch (action) {
        case 'mark_under_review':
          await Promise.all(selectedIds.map(id =>
            fetch(`${API_BASE_URL}/admin/applications/${id}/status`, {
              method: 'PATCH',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ status: 'document_review', adminId: currentUser.uid })
            })
          ));
          toast.success('Applications moved to Document Review');
          break;

        case 'assign_to_me':
          await Promise.all(selectedIds.map(id =>
            fetch(`${API_BASE_URL}/admin/applications/${id}/assign`, {
              method: 'PATCH',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ assignedTo: currentUser.uid, assignedBy: currentUser.uid })
            })
          ));
          toast.success('Applications assigned to you');
          break;
      }

      setBulkSelected([]);
      setShowBulkActions(false);
      fetchApplications();
    } catch (error) {
      console.error('Error performing bulk action:', error);
      toast.error('Failed to perform bulk action');
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
      key: 'firstName',
      label: 'Student',
      sortable: false,
      render: (_: any, row: Application) => (
        <div>
          <div className="font-medium">{row.firstName} {row.lastName}</div>
          <div className="text-xs text-gray-500">{row.email}</div>
          <div className="text-xs text-gray-500">{row.nationality}</div>
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
          <div className="text-xs text-gray-500">
            {row.programs && row.programs.length > 0 ? row.programs.join(', ') : 'No programs'}
          </div>
        </div>
      )
    },
    {
      key: 'gpa',
      label: 'GPA',
      sortable: false,
      render: (value: string) => (
        <span className="text-sm font-semibold">{value || 'N/A'}</span>
      )
    },
    {
      key: 'intakePeriod',
      label: 'Intake',
      sortable: true,
      render: (value: string) => (
        <span className="text-sm">{value || 'Not specified'}</span>
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
      render: (value: string) => {
        if (!value) return <span className="text-sm text-gray-400">N/A</span>;

        const date = new Date(value);
        return (
          <span className="text-sm">
            {date.toLocaleDateString()} {date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </span>
        );
      }
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

  // Calculate stats
  const totalApplications = applications.length;
  const pendingReview = applications.filter(app => app.status === 'submitted' || app.status === 'document_review').length;
  const underReview = applications.filter(app => app.status === 'academic_review' || app.status === 'interview').length;
  const completed = applications.filter(app => app.status === 'accepted' || app.status === 'enrolled').length;
  const urgentApplications = applications.filter(app => app.priority === 'urgent').length;

  return (
    <div>
      {/* Header with Stats */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Application Workflow Management</h1>
            <p className="text-gray-600 mt-2">Comprehensive application processing and student journey management</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowBulkActions(!showBulkActions)}
              disabled={bulkSelected.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <MdCheckBox className="w-4 h-4" />
              Bulk Actions ({bulkSelected.length})
            </button>
            <ExportButton endpoint="/admin/export/applications" filename="applications" />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <MdAssignment className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{totalApplications}</div>
                <div className="text-sm text-gray-500">Total Apps</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <MdPending className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{pendingReview}</div>
                <div className="text-sm text-gray-500">Pending Review</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <MdTimeline className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{underReview}</div>
                <div className="text-sm text-gray-500">Under Review</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <MdCheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{completed}</div>
                <div className="text-sm text-gray-500">Completed</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <MdAnalytics className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{urgentApplications}</div>
                <div className="text-sm text-gray-500">Urgent</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {showBulkActions && bulkSelected.length > 0 && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-4">
            <span className="font-medium text-purple-900">Bulk Actions:</span>
            <button
              onClick={() => handleBulkAction('mark_under_review', bulkSelected)}
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
            >
              Move to Review
            </button>
            <button
              onClick={() => handleBulkAction('assign_to_me', bulkSelected)}
              className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
            >
              Assign to Me
            </button>
            <button
              onClick={() => handleBulkAction('export_selected', bulkSelected)}
              className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
            >
              Export Selected
            </button>
          </div>
        </div>
      )}

      {/* Advanced Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <MdFilter className="w-4 h-4 text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-sm"
            >
              <option value="all">All Status</option>
              <option value="submitted">Submitted</option>
              <option value="document_review">Document Review</option>
              <option value="academic_review">Academic Review</option>
              <option value="interview">Interview</option>
              <option value="decision">Final Decision</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
              <option value="waitlisted">Waitlisted</option>
              <option value="enrolled">Enrolled</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <MdAnalytics className="w-4 h-4 text-gray-500" />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-sm"
            >
              <option value="all">All Priorities</option>
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
              <option value="urgent">Urgent</option>
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
              {Array.from(new Set(applications.map(app => app.universityName))).map(university => (
                <option key={university} value={university}>{university}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <MdPerson className="w-4 h-4 text-gray-500" />
            <select
              value={assignedFilter}
              onChange={(e) => setAssignedFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-sm"
            >
              <option value="all">All Assignments</option>
              <option value="assigned">Assigned to Me</option>
              <option value="unassigned">Unassigned</option>
            </select>
          </div>

          <button
            onClick={fetchApplications}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition text-sm"
          >
            <MdRefresh className="w-4 h-4" />
            Refresh
          </button>

          <div className="ml-auto text-sm text-gray-600">
            {applications.length} application{applications.length !== 1 ? 's' : ''} found
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <DataTable
          data={applications}
          columns={columns}
          loading={loading}
          emptyMessage="No applications found matching your criteria"
        />
      </div>

      {/* Application Workflow Modal */}
      {showWorkflowModal && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Application Workflow</h2>
                  <p className="text-gray-600 mt-1">
                    {selectedApplication.applicant.firstName} {selectedApplication.applicant.lastName} •
                    {selectedApplication.university.name} • {selectedApplication.program.name}
                  </p>
                </div>
                <button
                  onClick={() => setShowWorkflowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <MdClose className="w-6 h-6" />
                </button>
              </div>

              {/* Workflow Tabs */}
              <div className="flex gap-1 mt-6">
                {[
                  { id: 'overview', label: 'Overview', icon: MdAssignment },
                  { id: 'documents', label: 'Documents', icon: MdAttachFile },
                  { id: 'communications', label: 'Communications', icon: MdMessage },
                  { id: 'timeline', label: 'Timeline', icon: MdTimeline },
                  { id: 'analytics', label: 'Analytics', icon: MdAnalytics }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
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

            <div className="flex-1 overflow-y-auto p-6">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Status & Actions */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">Current Status</h3>
                        <StatusBadge status={selectedApplication.workflow.status} type="application" />
                      </div>
                      <div className="flex gap-2">
                        <select
                          onChange={(e) => {
                            if (e.target.value) {
                              handleStatusChange(selectedApplication.id, e.target.value);
                              e.target.value = '';
                            }
                          }}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          defaultValue=""
                        >
                          <option value="" disabled>Change Status</option>
                          <option value="submitted">Reset to Submitted</option>
                          <option value="document_review">Document Review</option>
                          <option value="academic_review">Academic Review</option>
                          <option value="interview">Interview</option>
                          <option value="decision">Final Decision</option>
                          <option value="accepted">Accept</option>
                          <option value="rejected">Reject</option>
                          <option value="waitlisted">Waitlist</option>
                        </select>
                        <button
                          onClick={() => setShowCommunicationModal(true)}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                        >
                          <MdSend className="w-4 h-4" />
                          Send Message
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Application Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-semibold text-gray-900">Applicant Information</h3>
                      <div className="space-y-2 text-sm">
                        <div><strong>Name:</strong> {selectedApplication.applicant.firstName} {selectedApplication.applicant.lastName}</div>
                        <div><strong>Email:</strong> {selectedApplication.applicant.email}</div>
                        <div><strong>Phone:</strong> {selectedApplication.applicant.phone}</div>
                        <div><strong>Nationality:</strong> {selectedApplication.applicant.nationality}</div>
                        <div><strong>Passport:</strong> {selectedApplication.applicant.passportNumber}</div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-semibold text-gray-900">Academic Information</h3>
                      <div className="space-y-2 text-sm">
                        <div><strong>Current Education:</strong> {selectedApplication.academics.currentEducation}</div>
                        <div><strong>GPA:</strong> {selectedApplication.academics.gpa}</div>
                        <div><strong>Graduation Year:</strong> {selectedApplication.academics.graduationYear}</div>
                        <div><strong>Previous Institution:</strong> {selectedApplication.academics.previousInstitution}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Documents Tab */}
              {activeTab === 'documents' && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 mb-4">Document Verification</h3>
                  {Object.entries(selectedApplication.documents).map(([docType, status]) => (
                    <div key={docType} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <MdAttachFile className="w-5 h-5 text-gray-500" />
                        <div>
                          <div className="font-medium capitalize">{docType.replace(/([A-Z])/g, ' $1')}</div>
                          {status.notes && <div className="text-sm text-gray-600">{status.notes}</div>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          status.status === 'verified' ? 'bg-green-100 text-green-800' :
                          status.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {status.status}
                        </span>
                        {status.status === 'pending' && (
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleDocumentVerification(selectedApplication.id, docType, 'verified')}
                              className="p-1 text-green-600 hover:bg-green-50 rounded"
                              title="Verify"
                            >
                              <MdCheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDocumentVerification(selectedApplication.id, docType, 'rejected')}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                              title="Reject"
                            >
                              <MdCancel className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Communications Tab */}
              {activeTab === 'communications' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Communication History</h3>
                    <button
                      onClick={() => setShowCommunicationModal(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                    >
                      <MdSend className="w-4 h-4" />
                      Send Message
                    </button>
                  </div>
                  <div className="space-y-3">
                    {selectedApplication.communications.map((comm) => (
                      <div key={comm.id} className={`p-4 rounded-lg ${
                        comm.direction === 'outbound' ? 'bg-blue-50 ml-8' : 'bg-gray-50 mr-8'
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 text-xs rounded ${
                              comm.type === 'email' ? 'bg-blue-100 text-blue-800' :
                              comm.type === 'note' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {comm.type}
                            </span>
                            <span className="text-sm font-medium">{comm.subject}</span>
                          </div>
                          <span className="text-xs text-gray-500">{new Date(comm.timestamp).toLocaleString()}</span>
                        </div>
                        <p className="text-sm text-gray-700">{comm.message}</p>
                        <div className="text-xs text-gray-500 mt-1">by {comm.sentBy}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Timeline Tab */}
              {activeTab === 'timeline' && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Application Timeline</h3>
                  <div className="space-y-4">
                    {selectedApplication.timeline.map((event) => (
                      <div key={event.id} className="flex items-start gap-4">
                        <div className="w-3 h-3 bg-cyan-500 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-900">{event.action}</span>
                            <span className="text-sm text-gray-500">{new Date(event.timestamp).toLocaleString()}</span>
                          </div>
                          <p className="text-sm text-gray-600">{event.description}</p>
                          <div className="text-xs text-gray-500">by {event.performedBy}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Analytics Tab */}
              {activeTab === 'analytics' && (
                <div className="space-y-6">
                  <h3 className="font-semibold text-gray-900">Application Analytics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{selectedApplication.analytics.timeToReview}</div>
                      <div className="text-sm text-blue-800">Days to First Review</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{selectedApplication.analytics.documentsVerified}</div>
                      <div className="text-sm text-green-800">Documents Verified</div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{selectedApplication.analytics.communicationsCount}</div>
                      <div className="text-sm text-purple-800">Communications</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Communication Modal */}
      {showCommunicationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Send Communication</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Subject"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                value={communicationMessage}
                onChange={(e) => setCommunicationMessage(e.target.value)}
              />
              <textarea
                placeholder="Message"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                rows={6}
                value={communicationMessage}
                onChange={(e) => setCommunicationMessage(e.target.value)}
              />
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => handleSendCommunication(selectedApplication!.id, 'email', 'Application Update', communicationMessage)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Send Email
              </button>
              <button
                onClick={() => {
                  setShowCommunicationModal(false);
                  setCommunicationMessage('');
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
