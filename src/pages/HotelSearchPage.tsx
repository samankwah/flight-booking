// src/pages/HotelSearchPage.tsx

import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  MdLocationOn as MapPin,
  MdCalendarToday as Calendar,
  MdPeople as Users,
  MdStar as Star,
  MdWifi as Wifi,
  MdPool as Pool,
  MdLocalParking as Parking,
  MdRestaurant as Restaurant,
  MdPets as Pets,
  MdFitnessCenter as Gym,
  MdSpa as Spa,
} from "react-icons/md";
import {
  searchHotelsByCity,
  searchHotelsByGeocode,
  getHotelOffers,
  getHotelSentiments,
  HotelListResult,
  HotelOffersResult,
  HotelSentimentResult
} from "../services/amadeusService";
import LoadingWrapper from "../components/LoadingWrapper";

interface HotelSearchFilters {
  cityCode?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  amenities?: string;
  ratings?: string;
  priceRange?: { min: number; max: number };
  sortBy?: 'price' | 'rating' | 'distance' | 'name';
}

const HotelSearchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [hotels, setHotels] = useState<HotelListResult[]>([]);
  const [hotelOffers, setHotelOffers] = useState<{ [key: string]: HotelOffersResult }>({});
  const [hotelSentiments, setHotelSentiments] = useState<{ [key: string]: HotelSentimentResult }>({});
  const [loading, setLoading] = useState(true);
  const [offersLoading, setOffersLoading] = useState<{ [key: string]: boolean }>({});
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<HotelSearchFilters>({
    sortBy: 'price'
  });

  // Extract search parameters
  const destination = searchParams.get('destination') || '';
  const checkInDate = searchParams.get('checkInDate') || '';
  const checkOutDate = searchParams.get('checkOutDate') || '';
  const adults = parseInt(searchParams.get('adults') || '1');
  const rooms = parseInt(searchParams.get('rooms') || '1');

  useEffect(() => {
    const searchHotels = async () => {
      if (!destination || !checkInDate || !checkOutDate) {
        setError('Missing required search parameters');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Try to extract city name from destination (e.g., "Paris" from "Hilton Paris Opera - Paris, France")
        let cityName = destination;
        if (destination.includes(' - ')) {
          const parts = destination.split(' - ');
          cityName = parts[parts.length - 1].split(',')[0].trim();
        }

        // For demo purposes, map common city names to codes
        const cityCodeMap: { [key: string]: string } = {
          'Paris': 'PAR',
          'London': 'LON',
          'New York': 'NYC',
          'Tokyo': 'TYO',
          'Dubai': 'DXB',
          'Singapore': 'SIN',
          'Barcelona': 'BCN',
          'Rome': 'ROM',
          'Amsterdam': 'AMS',
          'Berlin': 'BER',
          'Madrid': 'MAD',
          'Vienna': 'VIE',
          'Prague': 'PRG',
          'Budapest': 'BUD'
        };

        const cityCode = cityCodeMap[cityName] || 'PAR'; // Default to Paris

        console.log('Searching hotels for destination:', destination, 'city:', cityName, 'code:', cityCode);

        const hotelResults = await searchHotelsByCity({
          cityCode: cityCode,
          ...filters
        });

        setHotels(hotelResults);
      } catch (err) {
        console.error('Error searching hotels:', err);
        setError('Failed to search hotels. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    searchHotels();
  }, [destination, checkInDate, checkOutDate, filters]);

  const loadHotelOffers = async (hotel: HotelListResult) => {
    if (hotelOffers[hotel.hotelId] || offersLoading[hotel.hotelId]) {
      return;
    }

    setOffersLoading(prev => ({ ...prev, [hotel.hotelId]: true }));

    try {
      const offers = await getHotelOffers({
        hotelIds: hotel.hotelId,
        checkInDate,
        checkOutDate,
        adults,
        roomQuantity: rooms
      });

      if (offers.length > 0) {
        setHotelOffers(prev => ({ ...prev, [hotel.hotelId]: offers[0] }));

        // Also load sentiment data
        try {
          const sentiments = await getHotelSentiments([hotel.hotelId]);
          if (sentiments.length > 0) {
            setHotelSentiments(prev => ({ ...prev, [hotel.hotelId]: sentiments[0] }));
          }
        } catch (sentimentError) {
          console.warn('Failed to load hotel sentiments:', sentimentError);
        }
      }
    } catch (err) {
      console.error('Error loading hotel offers:', err);
    } finally {
      setOffersLoading(prev => ({ ...prev, [hotel.hotelId]: false }));
    }
  };

  const formatPrice = (price: string, currency: string) => {
    return `${currency} ${parseFloat(price).toFixed(2)}`;
  };

  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case 'wifi': return <Wifi className="w-4 h-4" />;
      case 'pool': case 'swimming_pool': return <Pool className="w-4 h-4" />;
      case 'parking': return <Parking className="w-4 h-4" />;
      case 'restaurant': return <Restaurant className="w-4 h-4" />;
      case 'pets': return <Pets className="w-4 h-4" />;
      case 'gym': case 'fitness': return <Gym className="w-4 h-4" />;
      case 'spa': return <Spa className="w-4 h-4" />;
      default: return null;
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating / 20) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const sortedHotels = [...hotels].sort((a, b) => {
    switch (filters.sortBy) {
      case 'price':
        const aOffer = hotelOffers[a.hotelId]?.offers?.[0];
        const bOffer = hotelOffers[b.hotelId]?.offers?.[0];
        if (aOffer && bOffer) {
          return parseFloat(aOffer.price.total) - parseFloat(bOffer.price.total);
        }
        return 0;
      case 'rating':
        const aSentiment = hotelSentiments[a.hotelId];
        const bSentiment = hotelSentiments[b.hotelId];
        if (aSentiment && bSentiment) {
          return bSentiment.overallRating - aSentiment.overallRating;
        }
        return 0;
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Hotel Search Error</h1>
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
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Hotel Search Results</h1>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-sm">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-cyan-600 flex-shrink-0" />
            <div className="min-w-0">
              <div className="font-semibold text-gray-900">Destination</div>
              <div className="text-gray-600 truncate">{destination}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-cyan-600 flex-shrink-0" />
            <div>
              <div className="font-semibold text-gray-900">Dates</div>
              <div className="text-gray-600 text-xs sm:text-sm">{checkInDate} - {checkOutDate}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-cyan-600 flex-shrink-0" />
            <div>
              <div className="font-semibold text-gray-900">Guests & Rooms</div>
              <div className="text-gray-600 text-xs sm:text-sm">{adults} Adult{adults > 1 ? 's' : ''}, {rooms} Room{rooms > 1 ? 's' : ''}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex flex-wrap gap-3 sm:gap-4 items-center">
          <label className="font-semibold text-gray-700 text-sm sm:text-base">Sort by:</label>
          <select
            value={filters.sortBy}
            onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm sm:text-base"
          >
            <option value="price">Price (Low to High)</option>
            <option value="rating">Rating (High to Low)</option>
            <option value="name">Name (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Results */}
      <LoadingWrapper loading={loading} skeletonType="hotel" skeletonCount={6}>
        {sortedHotels.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No hotels found</h2>
            <p className="text-gray-600">Try adjusting your search criteria</p>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedHotels.map((hotel) => {
              const offers = hotelOffers[hotel.hotelId];
              const sentiment = hotelSentiments[hotel.hotelId];
              const isLoadingOffers = offersLoading[hotel.hotelId];

              return (
                <div key={hotel.hotelId} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="p-4 sm:p-6">
                    <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
                      {/* Hotel Image Placeholder */}
                      <div className="w-full lg:w-64 h-40 sm:h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                        <MapPin className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" />
                      </div>

                      {/* Hotel Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 sm:mb-2 gap-2">
                          <h3 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight">{hotel.name}</h3>
                          {sentiment && (
                            <div className="sm:text-right flex-shrink-0">
                              <div className="flex items-center gap-1 mb-1">
                                {renderStars(sentiment.overallRating)}
                              </div>
                              <div className="text-xs sm:text-sm text-gray-600">
                                {sentiment.numberOfReviews} reviews
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="text-sm text-gray-600 mb-3">
                          {hotel.iataCode} • {hotel.address.countryCode}
                        </div>

                        {/* Amenities placeholder - would come from API */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {[Wifi, Pool, Parking, Restaurant].map((Icon, index) => (
                            <div key={index} className="flex items-center gap-1 text-gray-600 text-xs sm:text-sm">
                              <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span>Amenity {index + 1}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Pricing */}
                      <div className="lg:w-64 text-center sm:text-right flex-shrink-0">
                        {isLoadingOffers ? (
                          <div className="flex items-center justify-center h-16 sm:h-20">
                            <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-cyan-500"></div>
                          </div>
                        ) : offers ? (
                          <div>
                            <div className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                              {formatPrice(offers.offers[0].price.total, offers.offers[0].price.currency)}
                            </div>
                            <div className="text-xs sm:text-sm text-gray-600 mb-3">
                              per night ({checkInDate} - {checkOutDate})
                            </div>
                            <button
                              onClick={() => loadHotelOffers(hotel)}
                              className="w-full bg-cyan-600 text-white py-2 px-4 rounded-lg hover:bg-cyan-700 transition text-sm sm:text-base"
                            >
                              View Details
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => loadHotelOffers(hotel)}
                            className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition text-sm sm:text-base"
                          >
                            Check Prices
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </LoadingWrapper>
    </div>
  );
};

export default HotelSearchPage;
