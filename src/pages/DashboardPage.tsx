import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";
import { db } from "../firebase";
import { collection, query, where, onSnapshot, doc, updateDoc } from "firebase/firestore";
import type { Booking } from "../types";
import { MdPerson as User, MdEmail as Mail, MdEdit as Edit, MdSave as Save } from "react-icons/md"; // Removed Plane, Calendar, Phone
import { updateProfile } from "firebase/auth"; // Import updateProfile

const DashboardPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
  const [pastBookings, setPastBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [profileName, setProfileName] = useState(currentUser?.displayName || "");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileUpdateLoading, setProfileUpdateLoading] = useState(false);
  const [profileUpdateError, setProfileUpdateError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser) {
      setLoadingBookings(false);
      return;
    }

    const q = query(
      collection(db, "bookings"),
      where("userId", "==", currentUser.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const bookingsData: Booking[] = snapshot.docs.map((doc) => ({
          ...(doc.data() as Booking),
          id: doc.id,
        }));

        const now = new Date();
        const upcoming: Booking[] = [];
        const past: Booking[] = [];

        bookingsData.forEach((booking) => {
          const departureDate = new Date(booking.flightDetails.departureDate);
          if (departureDate >= now) {
            upcoming.push(booking);
          } else {
            past.push(booking);
          }
        });

        // Sort by date
        upcoming.sort((a, b) => new Date(a.flightDetails.departureDate).getTime() - new Date(b.flightDetails.departureDate).getTime());
        past.sort((a, b) => new Date(b.flightDetails.departureDate).getTime() - new Date(a.flightDetails.departureDate).getTime());


        setUpcomingBookings(upcoming);
        setPastBookings(past);
        setLoadingBookings(false);
      },
      (error) => {
        console.error("Error fetching bookings:", error);
        setLoadingBookings(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  const handleUpdateProfile = async () => {
    if (!currentUser) return;
    setProfileUpdateLoading(true);
    setProfileUpdateError(null);
    try {
      // Update Firestore user document (assuming you have a 'users' collection)
      // This is optional and depends on your data model.
      // If you're only storing displayName in Auth, this part can be removed.
      // For now, assuming a 'users' collection with uid as doc ID
      const userDocRef = doc(db, "users", currentUser.uid);
      await updateDoc(userDocRef, {
        displayName: profileName,
      });

      // Update Firebase Auth profile
      await updateProfile(currentUser, { displayName: profileName });
      setIsEditingProfile(false);
      setProfileUpdateLoading(false);
    } catch (error: unknown) {
      setProfileUpdateLoading(false);
      if (error instanceof Error) {
        setProfileUpdateError(error.message);
      } else {
        setProfileUpdateError("Failed to update profile.");
      }
      console.error("Error updating profile:", error);
    }
  };


  if (loadingBookings) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Loading dashboard...</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
        Welcome to your Dashboard, {currentUser?.displayName || currentUser?.email}!
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Section: Upcoming Bookings */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Upcoming Bookings
          </h2>
          {upcomingBookings.length > 0 ? (
            <div className="space-y-4">
              {upcomingBookings.map((booking) => (
                <div key={booking.id} className="border border-gray-200 dark:border-gray-700 p-4 rounded-lg">
                  <p className="font-semibold text-lg">
                    {booking.flightDetails.departureAirport.code} to {booking.flightDetails.arrivalAirport.code}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(booking.flightDetails.departureDate).toLocaleDateString()} &bull; {booking.flightDetails.airline.name}
                  </p>
                  <p className="text-lg font-bold text-cyan-600 dark:text-cyan-400">
                    {booking.currency} {booking.totalPrice.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-400">
              You have no upcoming bookings.
            </p>
          )}
          <Link
            to="/flights"
            className="mt-4 inline-block bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 transition"
          >
            Find Flights
          </Link>
        </div>

        {/* Section: Past Bookings */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Past Bookings
          </h2>
          {pastBookings.length > 0 ? (
            <div className="space-y-4">
              {pastBookings.map((booking) => (
                <div key={booking.id} className="border border-gray-200 dark:border-gray-700 p-4 rounded-lg opacity-75">
                  <p className="font-semibold text-lg">
                    {booking.flightDetails.departureAirport.code} to {booking.flightDetails.arrivalAirport.code}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(booking.flightDetails.departureDate).toLocaleDateString()} &bull; {booking.flightDetails.airline.name}
                  </p>
                  <p className="text-lg font-bold text-cyan-600 dark:text-cyan-400">
                    {booking.currency} {booking.totalPrice.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-400">
              You have no past bookings.
            </p>
          )}
        </div>

        {/* Section: Profile Information */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Profile Information
          </h2>
          {profileUpdateError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <strong className="font-bold">Error!</strong>
              <span className="block sm:inline"> {profileUpdateError}</span>
            </div>
          )}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <User className="w-5 h-5" />
              <span className="font-semibold">Name:</span>{" "}
              {isEditingProfile ? (
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="px-2 py-1 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              ) : (
                <span>{currentUser?.displayName || "N/A"}</span>
              )}
            </div>
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <Mail className="w-5 h-5" />
              <span className="font-semibold">Email:</span>{" "}
              <span>{currentUser?.email || "N/A"}</span>
            </div>
            {/* Add more profile fields if needed */}
          </div>
          <div className="mt-4">
            {isEditingProfile ? (
              <button
                onClick={handleUpdateProfile}
                disabled={profileUpdateLoading}
                className="flex items-center gap-2 bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {profileUpdateLoading ? "Saving..." : "Save Profile"}{" "}
                <Save className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={() => setIsEditingProfile(true)}
                className="flex items-center gap-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                Edit Profile <Edit className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
