// src/pages/SpecialOffersPage.tsx
import React from "react";
import { specialOffers } from "../data/mockData";
import { MdArrowBack, MdFlight, MdLocationOn, MdStar } from "react-icons/md";
import { Link } from "react-router-dom";

const SpecialOffersPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
              >
                <MdArrowBack className="w-5 h-5" />
                Back to Home
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Special Offers
                </h1>
                <p className="text-gray-600 mt-1">
                  Discover amazing deals on your dream destinations
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Offers Grid */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {specialOffers.map((offer) => (
            <div
              key={offer.id}
              className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group"
            >
              {/* Image */}
              <div className="relative overflow-hidden">
                <img
                  src={offer.image}
                  alt={offer.name}
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

                {/* Country Badge */}
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
                  <span className="text-sm font-medium text-gray-900">
                    {offer.country}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {offer.name}
                    </h3>
                    <div className="flex items-center gap-1 text-gray-600">
                      <MdLocationOn className="w-4 h-4" />
                      <span className="text-sm">{offer.country}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-cyan-600">
                      GHS {offer.price.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500">per person</div>
                  </div>
                </div>

                {/* Description placeholder - you can add real descriptions to mockData */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  Experience the beauty and culture of {offer.name} with our
                  exclusive flight deals. Book now and save on your next
                  adventure!
                </p>

                {/* Features */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1 text-green-600">
                    <MdFlight className="w-4 h-4" />
                    <span className="text-sm font-medium">Direct Flights</span>
                  </div>
                  <div className="flex items-center gap-1 text-amber-600">
                    <MdStar className="w-4 h-4" />
                    <span className="text-sm font-medium">Top Rated</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button className="flex-1 bg-cyan-600 text-white py-2 px-4 rounded-lg hover:bg-cyan-700 transition font-medium">
                    Book Now
                  </button>
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl p-8 text-white">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Ready to Start Your Journey?
            </h2>
            <p className="text-cyan-100 mb-6 max-w-2xl mx-auto">
              Don't miss out on these incredible deals. Contact our travel
              experts or book directly through our platform for the best
              experience.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/flights"
                className="bg-white text-cyan-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
              >
                Search Flights
              </Link>
              <Link
                to="/contact"
                className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-cyan-600 transition"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpecialOffersPage;
