// src/pages/HolidayPackagePage.tsx

import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  MdLocationOn as MapPin,
  MdCalendarToday as Calendar,
  MdPeople as Users,
  MdStar as Star,
  MdFlight as Flight,
  MdHotel as Hotel,
  MdLocalActivity as Activity,
  MdCheck as Check,
  MdArrowForward as Arrow,
} from "react-icons/md";
import {
  searchHolidayPackages,
  HolidayPackage,
  HolidayPackageSearchParams,
} from "../services/amadeusService";
import LoadingWrapper from "../components/LoadingWrapper";
import { useLocalization } from "../contexts/LocalizationContext";

const HolidayPackagePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { convertCurrency, formatPrice } = useLocalization();

  const [packages, setPackages] = useState<HolidayPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'price' | 'rating' | 'duration'>('price');

  // Extract search parameters
  const destination = searchParams.get('destination') || '';
  const departureDate = searchParams.get('departureDate') || '';
  const returnDate = searchParams.get('returnDate') || '';
  const duration = parseInt(searchParams.get('duration') || '7');
  const packageType = (searchParams.get('packageType') || 'standard') as 'budget' | 'standard' | 'luxury';
  const adults = parseInt(searchParams.get('adults') || '2');
  const children = parseInt(searchParams.get('children') || '0');
  const budget = parseInt(searchParams.get('budget') || '100000');

  // Get current date for display
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  useEffect(() => {
    const searchPackages = async () => {
      if (!destination || !departureDate) {
        setError('Missing required search parameters');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const searchParams: HolidayPackageSearchParams = {
          origin: 'ACC', // Default to Accra, Ghana
          destination,
          departureDate,
          returnDate,
          adults,
          children: children || undefined,
          budget,
          duration,
          packageType,
        };

        const packageResults = await searchHolidayPackages(searchParams);
        setPackages(packageResults);
      } catch (err) {
        console.error('Error searching holiday packages:', err);
        setError('Failed to search holiday packages. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    searchPackages();
  }, [destination, departureDate, returnDate, duration, packageType, adults, children, budget]);

  const sortedPackages = [...packages].sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return a.totalPrice - b.totalPrice;
      case 'rating':
        return b.hotel.rating - a.hotel.rating;
      case 'duration':
        return b.duration - a.duration;
      default:
        return 0;
    }
  });

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Holiday Package Search Error</h1>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-cyan-600 text-white px-6 py-2 rounded-lg hover:bg-cyan-700"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search Summary */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Holiday Package Results</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 text-sm">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-cyan-600 flex-shrink-0" />
            <div className="min-w-0">
              <div className="font-semibold text-gray-900">Destination</div>
              <div className="text-gray-600 truncate">{destination || 'All Destinations'}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-cyan-600 flex-shrink-0" />
            <div>
              <div className="font-semibold text-gray-900">Duration</div>
              <div className="text-gray-600">{duration} nights</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-cyan-600 flex-shrink-0" />
            <div>
              <div className="font-semibold text-gray-900">Travelers</div>
              <div className="text-gray-600">{adults + children} {adults + children === 1 ? 'person' : 'people'}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-cyan-600 rounded flex-shrink-0"></div>
            <div>
              <div className="font-semibold text-gray-900">Package Type</div>
              <div className="text-cyan-600 capitalize">{packageType}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-green-600 font-bold text-lg flex-shrink-0">₵</div>
            <div className="min-w-0">
              <div className="font-semibold text-gray-900">Max Budget</div>
              <div className="text-gray-600 truncate">₵{budget.toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="min-w-0 flex-1">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">
              {loading ? 'Searching holiday packages...' : `${sortedPackages.length} Holiday Package${sortedPackages.length !== 1 ? 's' : ''} Found`}
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              {loading ? 'Please wait while we find the best deals for you' : 'Compare prices and book your perfect holiday'}
            </p>
          </div>
          {!loading && sortedPackages.length > 0 && (
            <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
              <label className="font-semibold text-gray-700 text-xs sm:text-sm hidden sm:inline">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'price' | 'rating' | 'duration')}
                className="border border-gray-300 rounded-lg px-2 sm:px-3 py-1 sm:py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-xs sm:text-sm"
              >
                <option value="price">Price (Low to High)</option>
                <option value="rating">Hotel Rating (High to Low)</option>
                <option value="duration">Duration (Long to Short)</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <LoadingWrapper loading={loading} skeletonType="package" skeletonCount={6}>
        {sortedPackages.length === 0 && !loading ? (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg shadow-md p-8 max-w-md mx-auto">
              <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No holiday packages found</h2>
              <p className="text-gray-600 mb-4">
                We couldn't find packages matching your criteria for "{destination}".
              </p>
              <div className="text-sm text-gray-500 mb-4">
                Try:
                <ul className="list-disc list-inside mt-2 text-left">
                  <li>Increasing your budget</li>
                  <li>Selecting a different package type</li>
                  <li>Choosing a different duration</li>
                  <li>Searching for a different destination</li>
                </ul>
              </div>
              <button
                onClick={() => navigate('/')}
                className="bg-cyan-600 text-white px-6 py-2 rounded-lg hover:bg-cyan-700 transition"
              >
                Search Again
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedPackages.map((pkg) => (
              <div key={pkg.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Package Image Placeholder */}
                    <div className="w-full lg:w-80 h-48 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
                      <div className="text-white text-center">
                        <MapPin className="w-12 h-12 mx-auto mb-2" />
                        <div className="font-semibold">{pkg.destination.name}</div>
                      </div>
                    </div>

                    {/* Package Details */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-2">
                            {pkg.destination.name} Holiday Package
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {pkg.duration} Nights
                            </span>
                            <span className="flex items-center gap-1">
                              <Flight className="w-4 h-4" />
                              Return Flights
                            </span>
                            <span className="flex items-center gap-1">
                              <Hotel className="w-4 h-4" />
                              {pkg.hotel.name}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold text-cyan-600 mb-1">
                            {formatPrice(convertCurrency(pkg.totalPrice, pkg.currency))}
                          </div>
                          <div className="text-sm text-gray-500">per person</div>
                        </div>
                      </div>

                      {/* Hotel Info */}
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                            <Hotel className="w-4 h-4" />
                            {pkg.hotel.name}
                          </h4>
                          <div className="flex items-center gap-1">
                            {renderStars(pkg.hotel.rating)}
                            <span className="text-sm text-gray-600 ml-1">
                              {pkg.hotel.rating}/5
                            </span>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">
                          {formatPrice(convertCurrency(pkg.hotel.pricePerNight, pkg.hotel.currency))} per night •
                          {pkg.hotel.amenities.slice(0, 3).join(', ')}
                          {pkg.hotel.amenities.length > 3 && '...'}
                        </div>
                      </div>

                      {/* Flights Info */}
                      <div className="bg-blue-50 rounded-lg p-4 mb-4">
                        <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-2">
                          <Flight className="w-4 h-4" />
                          Flights Included
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="font-medium">Outbound</div>
                            <div className="text-gray-600">
                              {pkg.flights.outbound.airline} • {pkg.flights.outbound.departureTime} - {pkg.flights.outbound.arrivalTime}
                            </div>
                          </div>
                          <div>
                            <div className="font-medium">Return</div>
                            <div className="text-gray-600">
                              {pkg.flights.return.airline} • {pkg.flights.return.departureTime} - {pkg.flights.return.arrivalTime}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Activities */}
                      {pkg.activities.length > 0 && (
                        <div className="bg-green-50 rounded-lg p-4 mb-4">
                          <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-2">
                            <Activity className="w-4 h-4" />
                            Activities Included
                          </h4>
                          <div className="text-sm text-gray-600">
                            {pkg.activities.slice(0, 2).map(activity => activity.name).join(', ')}
                            {pkg.activities.length > 2 && ` +${pkg.activities.length - 2} more`}
                          </div>
                        </div>
                      )}

                      {/* Package Highlights */}
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Package Highlights</h4>
                        <div className="flex flex-wrap gap-2">
                          {pkg.highlights.slice(0, 4).map((highlight, index) => (
                            <span key={index} className="bg-cyan-100 text-cyan-800 text-xs px-2 py-1 rounded-full">
                              {highlight}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Inclusions */}
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-900 mb-2">What's Included</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-1 text-sm">
                          {pkg.inclusions.map((inclusion, index) => (
                            <div key={index} className="flex items-center gap-2 text-gray-600">
                              <Check className="w-4 h-4 text-green-500" />
                              {inclusion}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Booking Section */}
                    <div className="lg:w-80">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="text-center mb-4">
                          <div className="text-2xl font-bold text-gray-900 mb-1">
                            {formatPrice(convertCurrency(pkg.totalPrice, pkg.currency))}
                          </div>
                          <div className="text-sm text-gray-600">Per person</div>
                        </div>

                        <button className="w-full bg-cyan-600 text-white py-3 px-4 rounded-lg hover:bg-cyan-700 transition font-semibold flex items-center justify-center gap-2 mb-3">
                          Book Now
                          <Arrow className="w-4 h-4" />
                        </button>

                        <div className="text-xs text-gray-500 text-center">
                          Free cancellation up to 24 hours before departure
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </LoadingWrapper>
    </div>
  );
};

export default HolidayPackagePage;
