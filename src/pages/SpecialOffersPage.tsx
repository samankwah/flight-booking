// src/pages/SpecialOffersPage.tsx
import React, { useState } from "react";
import { specialOffers } from "../data/mockData";
import {
  MdHome,
  MdFlight,
  MdLocationOn,
  MdStar,
  MdLocalOffer,
  MdChevronLeft,
  MdChevronRight,
  MdChevronRight as ChevronRightIcon,
} from "react-icons/md";
import { Link } from "react-router-dom";
import { useLocalization } from "../contexts/LocalizationContext";
import type { Destination } from "../types";

const SpecialOffersPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const { convertCurrency, formatPrice } = useLocalization();
  const offersPerPage = 8;

  // Pagination logic
  const totalPages = Math.ceil(specialOffers.length / offersPerPage);
  const indexOfLastOffer = currentPage * offersPerPage;
  const indexOfFirstOffer = indexOfLastOffer - offersPerPage;
  const currentOffers = specialOffers.slice(
    indexOfFirstOffer,
    indexOfLastOffer
  );

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-2 text-sm mb-4">
            <Link
              to="/"
              className="flex items-center gap-1.5 text-gray-600 hover:text-cyan-600 transition"
            >
              <MdHome className="w-4 h-4" />
              <span>Home</span>
            </Link>
            <ChevronRightIcon className="w-4 h-4 text-gray-400" />
            <div className="flex items-center gap-1.5 text-gray-900 font-medium">
              <MdLocalOffer className="w-4 h-4 text-cyan-600" />
              <span>Special Offers</span>
            </div>
          </nav>

          {/* Title Section */}
          <div>
            <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
              Special Offers
            </h1>
            <p className="text-gray-600 mt-1 text-sm md:text-base">
              Discover amazing deals on your dream destinations
            </p>
          </div>
        </div>
      </div>

      {/* Offers Grid */}
      <div className="container mx-auto px-4 py-10">
        {currentOffers.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {currentOffers.map((offer) => (
                <div
                  key={offer.id}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group border border-gray-100"
                >
                  {/* Image */}
                  <div className="relative overflow-hidden h-56">
                    <img
                      src={offer.image}
                      alt={offer.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

                    {/* Country Badge */}
                    <div className="absolute top-3 left-3 flex items-center gap-1 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-md">
                      <MdLocationOn className="w-4 h-4 text-cyan-600" />
                      <span className="text-sm font-semibold text-gray-900">
                        {offer.country}
                      </span>
                    </div>

                    {/* Special Offer Tag */}
                    <div className="absolute bottom-3 left-3 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg animate-pulse">
                      SPECIAL OFFER
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-cyan-600 transition">
                          {offer.name}
                        </h3>
                        <div className="flex items-center gap-1 text-gray-600">
                          <MdLocationOn className="w-4 h-4" />
                          <span className="text-sm">{offer.country}</span>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      Experience the beauty and culture of {offer.name} with our
                      exclusive flight deals. Book now and save on your next
                      adventure!
                    </p>

                    {/* Features */}
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center gap-1 text-green-600">
                        <MdFlight className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          Direct Flights
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-amber-600">
                        <MdStar className="w-4 h-4" />
                        <span className="text-sm font-medium">Top Rated</span>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-200 my-4"></div>

                    {/* Pricing */}
                    <div className="flex items-end justify-between mb-4">
                      <div>
                        <div className="text-xs text-gray-600 mb-1">
                          Per Person
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-bold text-gray-900">
                            {formatPrice(
                              convertCurrency(offer.price, offer.currency)
                            )}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-green-600 font-semibold bg-green-50 px-2 py-1 rounded">
                          Save 30%
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Link
                        to={`/booking?offerId=${offer.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 bg-cyan-600 text-white py-2.5 px-4 rounded-lg hover:bg-cyan-700 transition font-semibold shadow-md hover:shadow-lg text-center"
                      >
                        Book Now
                      </Link>
                      <Link
                        to={`/offer/${offer.id}`}
                        className="px-4 py-2.5 border-2 border-cyan-600 text-cyan-600 rounded-lg hover:bg-cyan-50 hover:border-cyan-700 transition font-semibold text-center"
                      >
                        Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-2">
                {/* Previous Button */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`flex items-center gap-1 px-4 py-2 rounded-lg font-medium transition ${
                    currentPage === 1
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white border border-gray-300 text-gray-700 hover:bg-cyan-50 hover:border-cyan-600 hover:text-cyan-600"
                  }`}
                >
                  <MdChevronLeft className="w-5 h-5" />
                  <span className="hidden sm:inline">Previous</span>
                </button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (pageNumber) => {
                      // Show first page, last page, current page, and pages around current
                      const showPage =
                        pageNumber === 1 ||
                        pageNumber === totalPages ||
                        (pageNumber >= currentPage - 1 &&
                          pageNumber <= currentPage + 1);

                      // Show ellipsis
                      const showEllipsisBefore =
                        pageNumber === currentPage - 2 && currentPage > 3;
                      const showEllipsisAfter =
                        pageNumber === currentPage + 2 &&
                        currentPage < totalPages - 2;

                      if (showEllipsisBefore || showEllipsisAfter) {
                        return (
                          <span key={pageNumber} className="px-2 text-gray-400">
                            ...
                          </span>
                        );
                      }

                      if (!showPage) return null;

                      return (
                        <button
                          key={pageNumber}
                          onClick={() => handlePageChange(pageNumber)}
                          className={`w-10 h-10 rounded-lg font-medium transition ${
                            currentPage === pageNumber
                              ? "bg-cyan-600 text-white shadow-md"
                              : "bg-white border border-gray-300 text-gray-700 hover:bg-cyan-50 hover:border-cyan-600 hover:text-cyan-600"
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    }
                  )}
                </div>

                {/* Next Button */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`flex items-center gap-1 px-4 py-2 rounded-lg font-medium transition ${
                    currentPage === totalPages
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white border border-gray-300 text-gray-700 hover:bg-cyan-50 hover:border-cyan-600 hover:text-cyan-600"
                  }`}
                >
                  <span className="hidden sm:inline">Next</span>
                  <MdChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
              <MdLocalOffer className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No offers found
            </h3>
            <p className="text-gray-600">
              Check back soon for new special offers!
            </p>
          </div>
        )}

        {/* Call to Action Section */}
        <div className="mt-16">
          <div className="bg-gradient-to-br from-cyan-600 via-blue-600 to-indigo-700 rounded-3xl p-8 md:p-12 text-white shadow-2xl overflow-hidden relative">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full translate-y-1/2 -translate-x-1/2"></div>
            </div>

            {/* Content */}
            <div className="relative z-10">
              <div className="text-center max-w-3xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Ready to Start Your Journey?
                </h2>
                <p className="text-cyan-100 mb-8 text-lg">
                  Don't miss out on these incredible deals! Our travel experts
                  are here to help you plan the perfect trip with unbeatable
                  prices and exceptional service.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    to="/flights"
                    className="bg-white text-cyan-600 px-8 py-4 rounded-xl font-bold hover:bg-gray-100 transition shadow-lg hover:shadow-xl text-lg"
                  >
                    Search All Flights
                  </Link>
                  <Link
                    to="/support/contact"
                    className="border-2 border-white text-white px-8 py-4 rounded-xl font-bold hover:bg-white hover:text-cyan-600 transition shadow-lg text-lg"
                  >
                    Contact Support
                  </Link>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 pt-8 border-t border-white/20">
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold mb-1">
                    200+
                  </div>
                  <div className="text-cyan-100 text-sm">Countries</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold mb-1">
                    50K+
                  </div>
                  <div className="text-cyan-100 text-sm">Bookings</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold mb-1">4.9</div>
                  <div className="text-cyan-100 text-sm">Customer Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold mb-1">
                    24/7
                  </div>
                  <div className="text-cyan-100 text-sm">Support</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpecialOffersPage;
