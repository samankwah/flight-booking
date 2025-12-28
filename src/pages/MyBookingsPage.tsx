// src/pages/MyBookingsPage.tsx
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '../utils/apiConfig';
import { MdFlight, MdRefresh, MdFilterList } from 'react-icons/md';
import toast from 'react-hot-toast';
import type { Booking } from '../types';

type FilterType = 'all' | 'upcoming' | 'past' | 'cancelled';

export default function MyBookingsPage() {
  const { currentUser } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');

  useEffect(() => {
    if (currentUser) {
      fetchBookings();
    }
  }, [currentUser]);

  useEffect(() => {
    filterBookings();
  }, [filter, bookings]);

  const fetchBookings = async () => {
    if (!currentUser) return;

    setLoading(true);
    try {
      const token = await currentUser.getIdToken();
      const response = await fetch(`${API_BASE_URL}/bookings/user/${currentUser.uid}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }

      const data = await response.json();
      if (data.success) {
        setBookings(data.bookings || []);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load your bookings');
    } finally {
      setLoading(false);
    }
  };

  const filterBookings = () => {
    const now = new Date();

    let filtered = bookings;

    if (filter === 'upcoming') {
      filtered = bookings.filter(booking => {
        const departureDate = new Date(booking.flightDetails.departureTime);
        return departureDate > now && booking.status !== 'cancelled';
      });
    } else if (filter === 'past') {
      filtered = bookings.filter(booking => {
        const departureDate = new Date(booking.flightDetails.departureTime);
        return departureDate <= now && booking.status !== 'cancelled';
      });
    } else if (filter === 'cancelled') {
      filtered = bookings.filter(booking => booking.status === 'cancelled');
    }

    setFilteredBookings(filtered);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const formatTime = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      confirmed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusClasses[status as keyof typeof statusClasses] || statusClasses.pending}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please log in to view your bookings</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <MdFlight className="w-8 h-8 text-cyan-600" />
            My Bookings
          </h1>
          <p className="text-gray-600 mt-2">View and manage your flight bookings</p>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 text-gray-700">
              <MdFilterList className="w-5 h-5" />
              <span className="font-medium">Filter:</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {[
                { value: 'all', label: 'All Bookings' },
                { value: 'upcoming', label: 'Upcoming' },
                { value: 'past', label: 'Past' },
                { value: 'cancelled', label: 'Cancelled' }
              ].map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setFilter(value as FilterType)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filter === value
                      ? 'bg-cyan-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <button
              onClick={fetchBookings}
              className="ml-auto flex items-center gap-2 px-4 py-2 text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors"
              disabled={loading}
            >
              <MdRefresh className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredBookings.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <MdFlight className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No bookings found</h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all'
                ? "You haven't made any bookings yet. Start planning your trip!"
                : `No ${filter} bookings found.`}
            </p>
            <a
              href="/"
              className="inline-block bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Search Flights
            </a>
          </div>
        )}

        {/* Bookings Grid */}
        {!loading && filteredBookings.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBookings.map(booking => (
              <div key={booking.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                {/* Card Header */}
                <div className="p-4 border-b">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Booking Reference</p>
                      <p className="font-mono font-bold text-cyan-600 text-sm">{booking.id}</p>
                    </div>
                    {getStatusBadge(booking.status)}
                  </div>
                </div>

                {/* Flight Info */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex-1">
                      <p className="text-xl font-bold text-gray-900">
                        {booking.flightDetails.departureAirport}
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatTime(booking.flightDetails.departureTime)}
                      </p>
                    </div>
                    <div className="flex-shrink-0 px-4">
                      <MdFlight className="w-6 h-6 text-cyan-600 rotate-90" />
                    </div>
                    <div className="flex-1 text-right">
                      <p className="text-xl font-bold text-gray-900">
                        {booking.flightDetails.arrivalAirport}
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatTime(booking.flightDetails.arrivalTime)}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span className="font-medium">{formatDate(booking.flightDetails.departureTime)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Airline:</span>
                      <span className="font-medium">{booking.flightDetails.airline}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Passenger:</span>
                      <span className="font-medium">
                        {booking.passengerInfo.firstName} {booking.passengerInfo.lastName}
                      </span>
                    </div>
                    {booking.selectedSeats && booking.selectedSeats.length > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Seats:</span>
                        <span className="font-medium">{booking.selectedSeats.join(', ')}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer */}
                <div className="p-4 bg-gray-50 rounded-b-lg border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Amount</span>
                    <span className="text-lg font-bold text-green-600">
                      {booking.currency} {booking.totalPrice.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Results Count */}
        {!loading && filteredBookings.length > 0 && (
          <div className="mt-6 text-center text-sm text-gray-600">
            Showing {filteredBookings.length} of {bookings.length} total bookings
          </div>
        )}
      </div>
    </div>
  );
}
