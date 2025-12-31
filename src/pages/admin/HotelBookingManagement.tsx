// src/pages/admin/HotelBookingManagement.tsx
import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import DataTable from '../../components/admin/DataTable';
import StatusBadge from '../../components/admin/StatusBadge';
import ExportButton from '../../components/admin/ExportButton';
import toast from 'react-hot-toast';
import { MdRefresh } from 'react-icons/md';
import { API_BASE_URL } from '../../utils/apiConfig';

interface HotelBooking {
  id: string;
  userId: string;
  guestInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  hotelDetails: {
    name: string;
    city: string;
    country: string;
    checkInDate: string;
    checkOutDate: string;
  };
  status: string;
  paymentStatus: string;
  totalPrice: number;
  currency: string;
  bookingDate: string;
}

export default function HotelBookingManagement() {
  const { currentUser } = useAuth();
  const [bookings, setBookings] = useState<HotelBooking[]>([]);
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
        ? `${API_BASE_URL}/admin/hotel-bookings?limit=100`
        : `${API_BASE_URL}/admin/hotel-bookings?status=${statusFilter}&limit=100`;

      console.log('Fetching hotel bookings from:', url);

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`Failed to fetch hotel bookings (${response.status})`);
      }

      const data = await response.json();
      console.log('Hotel bookings data received:', data);

      if (data.success) {
        console.log('Setting bookings:', data.bookings.length);
        setBookings(data.bookings);
      } else {
        console.error('Response not successful:', data);
        toast.error('Failed to load hotel bookings: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error fetching hotel bookings:', error);
      toast.error('Failed to load hotel bookings: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (bookingId: string, newStatus: string) => {
    try {
      if (!currentUser) return;

      const token = await currentUser.getIdToken();
      const response = await fetch(`${API_BASE_URL}/admin/hotel-bookings/${bookingId}/status`, {
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

      toast.success('Hotel booking status updated successfully');
      fetchBookings(); // Refresh
    } catch (error) {
      console.error('Status update error:', error);
      toast.error('Failed to update hotel booking status');
    }
  };

  const handleDelete = async (bookingId: string) => {
    if (!confirm('Are you sure you want to delete this hotel booking? This action cannot be undone.')) return;

    try {
      if (!currentUser) return;

      const token = await currentUser.getIdToken();
      const response = await fetch(`${API_BASE_URL}/admin/hotel-bookings/${bookingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Delete failed');
      }

      toast.success('Hotel booking deleted successfully');
      fetchBookings(); // Refresh
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete hotel booking');
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
      key: 'guestInfo',
      label: 'Guest',
      sortable: false,
      render: (_: any, row: HotelBooking) => (
        <div>
          <div className="font-medium">{row.guestInfo?.firstName} {row.guestInfo?.lastName}</div>
          <div className="text-xs text-gray-500">{row.guestInfo?.email}</div>
        </div>
      )
    },
    {
      key: 'hotelDetails',
      label: 'Hotel & Dates',
      sortable: false,
      render: (_: any, row: HotelBooking) => (
        <div>
          <div className="font-medium">{row.hotelDetails?.name}</div>
          <div className="text-xs text-gray-500">{row.hotelDetails?.city}, {row.hotelDetails?.country}</div>
          <div className="text-xs text-gray-500">
            {row.hotelDetails?.checkInDate} - {row.hotelDetails?.checkOutDate}
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
      render: (value: number, row: HotelBooking) => (
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
      render: (_: any, row: HotelBooking) => (
        <div className="flex gap-2">
          <select
            value={row.status}
            onChange={(e) => handleStatusUpdate(row.id, e.target.value)}
            className="text-xs px-2 py-1 border border-gray-300 rounded"
          >
            <option value="confirmed">Confirmed</option>
            <option value="checked_in">Checked In</option>
            <option value="checked_out">Checked Out</option>
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
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Hotel Booking Management</h1>
            <p className="text-sm md:text-base text-gray-600 mt-1 md:mt-2">Manage hotel bookings, check-ins, and cancellations</p>
          </div>
          <ExportButton endpoint="/admin/export/hotel-bookings" filename="hotel-bookings" />
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
          <option value="checked_in">Checked In</option>
          <option value="checked_out">Checked Out</option>
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
        emptyMessage="No hotel bookings found"
      />
    </div>
  );
}
