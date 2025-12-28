import React, { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from "firebase/firestore";
import { db } from "../../firebase";
import type { Booking } from "../../types";
import {
  MdSearch as Search,
  MdFilterList as Filter,
  MdCheckCircle as CheckCircle,
  MdPending as Clock,
  MdCancel as XCircle,
  MdDelete as Trash2,
  MdVisibility as Eye,
} from "react-icons/md";
import toast from "react-hot-toast";

const BookingManagement: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "confirmed" | "pending" | "cancelled">("all");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    let filtered = bookings;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (booking) =>
          booking.passengerInfo.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.passengerInfo.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.passengerInfo.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((booking) => booking.status === statusFilter);
    }

    setFilteredBookings(filtered);
  }, [searchTerm, statusFilter, bookings]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, "bookings"), orderBy("bookingDate", "desc"));
      const bookingsSnapshot = await getDocs(q);
      const bookingsData: Booking[] = bookingsSnapshot.docs.map((doc) => ({
        ...(doc.data() as Booking),
        id: doc.id,
      }));
      setBookings(bookingsData);
      setFilteredBookings(bookingsData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error("Failed to load bookings");
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (bookingId: string, newStatus: "confirmed" | "pending" | "cancelled") => {
    try {
      const bookingRef = doc(db, "bookings", bookingId);
      await updateDoc(bookingRef, {
        status: newStatus,
      });

      // Update local state
      setBookings(
        bookings.map((b) =>
          b.id === bookingId ? { ...b, status: newStatus } : b
        )
      );

      toast.success(`Booking status updated to ${newStatus}`);
    } catch (error) {
      console.error("Error updating booking status:", error);
      toast.error("Failed to update booking status");
    }
  };

  const handleDeleteBooking = async (bookingId: string) => {
    if (!window.confirm("Are you sure you want to delete this booking?")) {
      return;
    }

    try {
      await deleteDoc(doc(db, "bookings", bookingId));
      setBookings(bookings.filter((b) => b.id !== bookingId));
      toast.success("Booking deleted successfully");
    } catch (error) {
      console.error("Error deleting booking:", error);
      toast.error("Failed to delete booking");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="w-4 h-4" />;
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "cancelled":
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Booking Management
        </h2>
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, email, or booking ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-600 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-600 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Booking ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Passenger
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Flight
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Departure Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {booking.id.substring(0, 8)}...
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {booking.passengerInfo.firstName} {booking.passengerInfo.lastName}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {booking.passengerInfo.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {booking.flightDetails.departureAirport} → {booking.flightDetails.arrivalAirport}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {booking.flightDetails.airline}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    {new Date(booking.flightDetails.departureTime).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {booking.currency} {booking.totalPrice.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex items-center gap-1 text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                        booking.status
                      )}`}
                    >
                      {getStatusIcon(booking.status)}
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setSelectedBooking(booking)}
                        className="text-cyan-600 hover:text-cyan-900 dark:hover:text-cyan-400"
                        title="View details"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      {booking.status === "pending" && (
                        <button
                          onClick={() => handleUpdateStatus(booking.id, "confirmed")}
                          className="text-green-600 hover:text-green-900 dark:hover:text-green-400"
                          title="Confirm booking"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                      )}
                      {booking.status !== "cancelled" && (
                        <button
                          onClick={() => handleUpdateStatus(booking.id, "cancelled")}
                          className="text-yellow-600 hover:text-yellow-900 dark:hover:text-yellow-400"
                          title="Cancel booking"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteBooking(booking.id)}
                        className="text-red-600 hover:text-red-900 dark:hover:text-red-400"
                        title="Delete booking"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredBookings.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No bookings found</p>
          </div>
        )}
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Booking Details
              </h3>
              <button
                onClick={() => setSelectedBooking(null)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Booking Information */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Booking Information
                </h4>
                <dl className="grid grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm text-gray-600 dark:text-gray-400">Booking ID</dt>
                    <dd className="text-sm font-medium text-gray-900 dark:text-white">
                      {selectedBooking.id}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-600 dark:text-gray-400">Booking Date</dt>
                    <dd className="text-sm font-medium text-gray-900 dark:text-white">
                      {new Date(selectedBooking.bookingDate).toLocaleDateString()}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-600 dark:text-gray-400">Status</dt>
                    <dd>
                      <span
                        className={`px-2 inline-flex items-center gap-1 text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                          selectedBooking.status
                        )}`}
                      >
                        {getStatusIcon(selectedBooking.status)}
                        {selectedBooking.status}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-600 dark:text-gray-400">Total Price</dt>
                    <dd className="text-sm font-medium text-gray-900 dark:text-white">
                      {selectedBooking.currency} {selectedBooking.totalPrice.toLocaleString()}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Passenger Information */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Passenger Information
                </h4>
                <dl className="grid grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm text-gray-600 dark:text-gray-400">Name</dt>
                    <dd className="text-sm font-medium text-gray-900 dark:text-white">
                      {selectedBooking.passengerInfo.firstName} {selectedBooking.passengerInfo.lastName}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-600 dark:text-gray-400">Email</dt>
                    <dd className="text-sm font-medium text-gray-900 dark:text-white">
                      {selectedBooking.passengerInfo.email}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-600 dark:text-gray-400">Phone</dt>
                    <dd className="text-sm font-medium text-gray-900 dark:text-white">
                      {selectedBooking.passengerInfo.phone}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Flight Details */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Flight Details
                </h4>
                <dl className="grid grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm text-gray-600 dark:text-gray-400">Airline</dt>
                    <dd className="text-sm font-medium text-gray-900 dark:text-white">
                      {selectedBooking.flightDetails.airline}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-600 dark:text-gray-400">Flight Number</dt>
                    <dd className="text-sm font-medium text-gray-900 dark:text-white">
                      {selectedBooking.flightDetails.airlineCode || "N/A"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-600 dark:text-gray-400">From</dt>
                    <dd className="text-sm font-medium text-gray-900 dark:text-white">
                      {selectedBooking.flightDetails.departureAirport}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-600 dark:text-gray-400">To</dt>
                    <dd className="text-sm font-medium text-gray-900 dark:text-white">
                      {selectedBooking.flightDetails.arrivalAirport}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-600 dark:text-gray-400">Departure</dt>
                    <dd className="text-sm font-medium text-gray-900 dark:text-white">
                      {new Date(selectedBooking.flightDetails.departureTime).toLocaleString()}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-600 dark:text-gray-400">Arrival</dt>
                    <dd className="text-sm font-medium text-gray-900 dark:text-white">
                      {new Date(selectedBooking.flightDetails.arrivalTime).toLocaleString()}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-600 dark:text-gray-400">Duration</dt>
                    <dd className="text-sm font-medium text-gray-900 dark:text-white">
                      {Math.floor(selectedBooking.flightDetails.duration / 60)}h{" "}
                      {selectedBooking.flightDetails.duration % 60}m
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-600 dark:text-gray-400">Stops</dt>
                    <dd className="text-sm font-medium text-gray-900 dark:text-white">
                      {selectedBooking.flightDetails.stops === 0
                        ? "Direct"
                        : `${selectedBooking.flightDetails.stops} stop(s)`}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Seats */}
              {selectedBooking.selectedSeats && selectedBooking.selectedSeats.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Selected Seats
                  </h4>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {selectedBooking.selectedSeats.join(", ")}
                  </p>
                </div>
              )}

              {/* Payment Information */}
              {selectedBooking.paymentId && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Payment Information
                  </h4>
                  <dl className="grid grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm text-gray-600 dark:text-gray-400">Payment ID</dt>
                      <dd className="text-sm font-medium text-gray-900 dark:text-white">
                        {selectedBooking.paymentId}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-600 dark:text-gray-400">Payment Status</dt>
                      <dd>
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            selectedBooking.paymentStatus === "paid"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : selectedBooking.paymentStatus === "pending"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          }`}
                        >
                          {selectedBooking.paymentStatus || "N/A"}
                        </span>
                      </dd>
                    </div>
                  </dl>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setSelectedBooking(null)}
                className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingManagement;
