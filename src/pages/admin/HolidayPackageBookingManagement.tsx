// src/pages/admin/HolidayPackageBookingManagement.tsx
import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import DataTable from '../../components/admin/DataTable';
import StatusBadge from '../../components/admin/StatusBadge';
import ExportButton from '../../components/admin/ExportButton';
import toast from 'react-hot-toast';
import { MdRefresh } from 'react-icons/md';
import { API_BASE_URL } from '../../utils/apiConfig';

interface HolidayPackageBooking {
  id: string;
  userId: string;
  travelerInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  packageDetails: {
    name: string;
    destination: string;
    duration: number;
    departureDate: string;
    returnDate: string;
  };
  status: string;
  paymentStatus: string;
  totalPrice: number;
  currency: string;
  bookingDate: string;
}

export default function HolidayPackageBookingManagement() {
  const { currentUser } = useAuth();
  const [bookings, setBookings] = useState<HolidayPackageBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      if (!currentUser) {
        console.warn('No current user - skipping fetch');
        return;
      }

      const token = await currentUser.getIdToken();
      const url = statusFilter === 'all'
        ? `${API_BASE_URL}/admin/holiday-package-bookings?limit=100`
        : `${API_BASE_URL}/admin/holiday-package-bookings?status=${statusFilter}&limit=100`;

      console.log('Fetching holiday package bookings from:', url);

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`Failed to fetch holiday package bookings (${response.status})`);
      }

      const data = await response.json();
      console.log('Holiday package bookings data received:', data);

      if (data.success) {
        console.log('Setting bookings:', data.bookings.length);
        setBookings(data.bookings);
      } else {
        console.error('Response not successful:', data);
        toast.error('Failed to load holiday package bookings: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error fetching holiday package bookings:', error);
      toast.error('Failed to load holiday package bookings: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (bookingId: string, newStatus: string) => {
    try {
      if (!currentUser) return;

      const token = await currentUser.getIdToken();
      const response = await fetch(`${API_BASE_URL}/admin/holiday-package-bookings/${bookingId}/status`, {
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

      toast.success('Holiday package booking status updated successfully');
      fetchBookings(); // Refresh
    } catch (error) {
      console.error('Status update error:', error);
      toast.error('Failed to update holiday package booking status');
    }
  };

  const handleDelete = async (bookingId: string) => {
    if (!confirm('Are you sure you want to delete this holiday package booking? This action cannot be undone.')) return;

    try {
      if (!currentUser) return;

      const token = await currentUser.getIdToken();
      const response = await fetch(`${API_BASE_URL}/admin/holiday-package-bookings/${bookingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Delete failed');
      }

      toast.success('Holiday package booking deleted successfully');
      fetchBookings(); // Refresh
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete holiday package booking');
    }
  };

  const columns = [
    {
      key: 'id',
      label: 'Booking ID',
      sortable: true,
      render: (value: string) => (
        <span className="font-mono text-xs">{value.substring(0, 8)}...</span>
      )
    },
    {
      key: 'travelerInfo',
      label: 'Traveler',
      sortable: false,
      render: (_: any, row: HolidayPackageBooking) => (
        <div>
          <div className="font-medium">{row.travelerInfo?.firstName} {row.travelerInfo?.lastName}</div>
          <div className="text-xs text-gray-500">{row.travelerInfo?.email}</div>
        </div>
      )
    },
    {
      key: 'packageDetails',
      label: 'Package & Dates',
      sortable: false,
      render: (_: any, row: HolidayPackageBooking) => (
        <div>
          <div className="font-medium">{row.packageDetails?.name}</div>
          <div className="text-xs text-gray-500">{row.packageDetails?.destination}</div>
          <div className="text-xs text-gray-500">
            {row.packageDetails?.duration} nights • {row.packageDetails?.departureDate} - {row.packageDetails?.returnDate}
          </div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value: string) => <StatusBadge status={value} type="booking" />
    },
    {
      key: 'paymentStatus',
      label: 'Payment',
      sortable: true,
      render: (value: string) => <StatusBadge status={value} type="payment" />
    },
    {
      key: 'totalPrice',
      label: 'Amount',
      sortable: true,
      render: (value: number, row: HolidayPackageBooking) => (
        <span className="font-semibold">{row.currency} {value}</span>
      )
    },
    {
      key: 'bookingDate',
      label: 'Booked',
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString()
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (_: any, row: HolidayPackageBooking) => (
        <div className="flex gap-2">
          <select
            value={row.status}
            onChange={(e) => handleStatusUpdate(row.id, e.target.value)}
            className="text-xs px-2 py-1 border border-gray-300 rounded"
          >
            <option value="confirmed">Confirmed</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="refunded">Refunded</option>
          </select>
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
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Holiday Package Booking Management</h1>
            <p className="text-sm md:text-base text-gray-600 mt-1 md:mt-2">Manage holiday package bookings and travel arrangements</p>
          </div>
          <ExportButton endpoint="/admin/export/holiday-package-bookings" filename="holiday-package-bookings" />
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
          <option value="confirmed">Confirmed</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="refunded">Refunded</option>
        </select>

        <button
          onClick={fetchBookings}
          className="flex items-center gap-2 px-3 md:px-4 py-2 text-sm md:text-base bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          <MdRefresh className="w-4 h-4" />
          <span>Refresh</span>
        </button>

        <div className="ml-auto text-xs md:text-sm text-gray-600">
          {bookings.length} booking{bookings.length !== 1 ? 's' : ''} found
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={bookings}
        columns={columns}
        loading={loading}
        emptyMessage="No holiday package bookings found"
      />
    </div>
  );
}




