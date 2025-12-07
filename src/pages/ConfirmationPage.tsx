import React from "react";
import { Link } from "react-router-dom";
import { CheckCircle } from "lucide-react";

const ConfirmationPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-10 rounded-2xl shadow-2xl text-center">
        <CheckCircle className="mx-auto h-24 w-24 text-green-500" />
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          Booking Confirmed!
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Thank you for your booking. A confirmation email with your ticket
          details has been sent to your inbox.
        </p>
        <div className="mt-8">
          <Link
            to="/"
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
          >
            Go to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPage;
