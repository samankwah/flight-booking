// src/pages/SpecialOfferDetailPage.tsx
import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  MdHome,
  MdLocationOn,
  MdStar,
  MdArrowBack,
  MdChevronRight,
  MdLocalOffer,
  MdCheckCircle,
  MdFlight,
  MdRestaurant,
  MdHotel,
  MdDirectionsCar,
  MdCameraAlt,
  MdCardGiftcard,
  MdEventSeat,
  MdLuggage,
} from "react-icons/md";
import { useLocalization } from "../contexts/LocalizationContext";
import { specialOffers } from "../data/mockData";
import { getAirportCode, getSmartDepartureDate, getSmartReturnDate } from "../utils/airportLookup";
import type { Destination } from "../types";

type ImageCategory = "destination" | "activities" | "hotels" | "dining" | "attractions" | "transport";

interface OfferImage {
  category: ImageCategory;
  url: string;
  title: string;
}

// Helper function to build flight search URL from offer
const buildOfferSearchUrl = (offer: Destination): string => {
  const departureDate = getSmartDepartureDate();
  const returnDate = getSmartReturnDate(departureDate);
  const destinationCode = getAirportCode(offer.name, offer.country);

  const params = new URLSearchParams({
    tripType: 'return',
    from: 'ACC', // Default origin - could be made dynamic based on user location
    to: destinationCode,
    departureDate: departureDate,
    returnDate: returnDate,
    adults: '1',
    children: '0',
    infants: '0',
    travelClass: 'ECONOMY',
    offerId: offer.id,
    suggestedPrice: offer.price.toString(),
  });

  return `/flights?${params.toString()}`;
};

const SpecialOfferDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { convertCurrency, formatPrice } = useLocalization();
  const [activeImageCategory, setActiveImageCategory] = useState<ImageCategory>("destination");

  const offer = specialOffers.find((o) => o.id === id);

  if (!offer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <MdLocalOffer className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Offer Not Found</h2>
          <p className="text-gray-600 mb-6">The offer you're looking for doesn't exist.</p>
          <Link
            to="/offers"
            className="inline-flex items-center gap-2 bg-cyan-600 text-white px-6 py-3 rounded-lg hover:bg-cyan-700 transition"
          >
            <MdArrowBack />
            Back to Special Offers
          </Link>
        </div>
      </div>
    );
  }

  // Mock image gallery data
  const imageGallery: OfferImage[] = [
    {
      category: "destination",
      url: offer.image,
      title: `${offer.name} Overview`,
    },
    {
      category: "destination",
      url: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&h=600&fit=crop",
      title: "Scenic View",
    },
    {
      category: "destination",
      url: "https://images.unsplash.com/photo-1503220317375-aaad61436b1b?w=800&h=600&fit=crop",
      title: "City Landscape",
    },
    {
      category: "activities",
      url: "https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=800&h=600&fit=crop",
      title: "Beach Activities",
    },
    {
      category: "activities",
      url: "https://images.unsplash.com/photo-1527004013197-933c4bb611b3?w=800&h=600&fit=crop",
      title: "Adventure Tours",
    },
    {
      category: "activities",
      url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
      title: "Mountain Hiking",
    },
    {
      category: "hotels",
      url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop",
      title: "Luxury Hotel",
    },
    {
      category: "hotels",
      url: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&h=600&fit=crop",
      title: "Hotel Room",
    },
    {
      category: "hotels",
      url: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop",
      title: "Hotel Lobby",
    },
    {
      category: "dining",
      url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop",
      title: "Local Cuisine",
    },
    {
      category: "dining",
      url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop",
      title: "Fine Dining",
    },
    {
      category: "dining",
      url: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=800&h=600&fit=crop",
      title: "Street Food",
    },
    {
      category: "attractions",
      url: "https://images.unsplash.com/photo-1513581166391-887a96ddeafd?w=800&h=600&fit=crop",
      title: "Historic Sites",
    },
    {
      category: "attractions",
      url: "https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=800&h=600&fit=crop",
      title: "Museums",
    },
    {
      category: "attractions",
      url: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&h=600&fit=crop",
      title: "Cultural Events",
    },
    {
      category: "transport",
      url: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&h=600&fit=crop",
      title: "Flight Experience",
    },
    {
      category: "transport",
      url: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&h=600&fit=crop",
      title: "Airport Transfer",
    },
    {
      category: "transport",
      url: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&h=600&fit=crop",
      title: "Local Transport",
    },
  ];

  const categories: { value: ImageCategory; label: string }[] = [
    { value: "destination", label: "Destination" },
    { value: "activities", label: "Activities" },
    { value: "hotels", label: "Hotels" },
    { value: "dining", label: "Dining" },
    { value: "attractions", label: "Attractions" },
    { value: "transport", label: "Transport" },
  ];

  const filteredImages = imageGallery.filter((img) => img.category === activeImageCategory);
  const [selectedImage, setSelectedImage] = useState(filteredImages[0]);

  const features = [
    { icon: MdFlight, name: "Direct Flights", color: "text-blue-600" },
    { icon: MdHotel, name: "4-Star Accommodation", color: "text-purple-600" },
    { icon: MdRestaurant, name: "Meals Included", color: "text-orange-600" },
    { icon: MdDirectionsCar, name: "Airport Transfers", color: "text-green-600" },
    { icon: MdCameraAlt, name: "Guided Tours", color: "text-pink-600" },
    { icon: MdCardGiftcard, name: "Free Upgrades", color: "text-yellow-600" },
    { icon: MdEventSeat, name: "Priority Boarding", color: "text-indigo-600" },
    { icon: MdLuggage, name: "Extra Baggage", color: "text-red-600" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm mb-4">
            <Link
              to="/"
              className="flex items-center gap-1.5 text-gray-600 hover:text-cyan-600 transition"
            >
              <MdHome className="w-4 h-4" />
              <span>Home</span>
            </Link>
            <MdChevronRight className="w-4 h-4 text-gray-400" />
            <Link to="/offers" className="text-gray-600 hover:text-cyan-600 transition">
              Special Offers
            </Link>
            <MdChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-900 font-medium">{offer.name}</span>
          </nav>

          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-cyan-600 hover:text-cyan-700 font-medium mb-4"
          >
            <MdArrowBack className="w-5 h-5" />
            Back to Special Offers
          </button>

          {/* Offer Header */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                  {offer.name}
                </h1>
                <span className="px-3 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-bold rounded-full animate-pulse">
                  SPECIAL OFFER
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-3">
                <div className="flex items-center gap-1">
                  <MdLocationOn className="w-5 h-5 text-cyan-600" />
                  <span>{offer.country}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MdStar className="w-5 h-5 text-amber-500" />
                  <span className="font-semibold">Top Rated Destination</span>
                </div>
              </div>
            </div>
            <Link
              to={buildOfferSearchUrl(offer)}
              className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-cyan-700 hover:to-blue-700 transition shadow-lg hover:shadow-xl text-center"
            >
              Search Flights for This Offer
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Image Gallery */}
          <div className="lg:col-span-2">
            {/* Main Image */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
              <div className="relative h-96 overflow-hidden">
                <img
                  src={selectedImage.url}
                  alt={selectedImage.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                  <h3 className="text-white text-xl font-semibold">{selectedImage.title}</h3>
                </div>
              </div>

              {/* Category Tabs */}
              <div className="p-4 bg-gray-50 border-b">
                <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                  {categories.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => {
                        setActiveImageCategory(cat.value);
                        const newImages = imageGallery.filter((img) => img.category === cat.value);
                        setSelectedImage(newImages[0]);
                      }}
                      className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${
                        activeImageCategory === cat.value
                          ? "bg-cyan-600 text-white"
                          : "bg-white text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Thumbnail Grid */}
              <div className="p-4">
                <div className="grid grid-cols-3 gap-3">
                  {filteredImages.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(img)}
                      className={`relative h-24 rounded-lg overflow-hidden transition-all ${
                        selectedImage.url === img.url
                          ? "ring-4 ring-cyan-600 scale-105"
                          : "hover:scale-105"
                      }`}
                    >
                      <img
                        src={img.url}
                        alt={img.title}
                        className="w-full h-full object-cover"
                      />
                      {selectedImage.url === img.url && (
                        <div className="absolute inset-0 bg-cyan-600/20" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* About Section */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Offer</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                {offer.description || `Experience the beauty and culture of ${offer.name} with our exclusive flight deals.`}
              </p>
              <p className="text-gray-700 leading-relaxed">
                This special offer includes direct flights to {offer.name}, {offer.country}, with flexible booking
                options and competitive pricing. Discover amazing attractions, delicious cuisine, and unforgettable
                experiences that make this destination a must-visit on your travel list.
              </p>
            </div>

            {/* Features & Inclusions */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">What's Included</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                  >
                    <feature.icon className={`w-6 h-6 ${feature.color}`} />
                    <span className="text-sm font-medium text-gray-900">{feature.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Package Details */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Package Details</h2>
              <div className="grid gap-3">
                {[
                  "Round-trip flight tickets",
                  "4-star hotel accommodation",
                  "Daily breakfast buffet",
                  "Airport pickup and drop-off",
                  "City tour with local guide",
                  "Travel insurance coverage",
                  "24/7 customer support",
                  "Free cancellation up to 48 hours",
                  "Flexible date changes",
                  "Complimentary welcome drink",
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <MdCheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Booking Info */}
          <div className="lg:col-span-1">
            {/* Pricing Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 sticky top-4">
              <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-xl border border-orange-100 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                  <MdLocalOffer className="w-4 h-4" />
                  <span>Starting from</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-gray-900">
                    {formatPrice(convertCurrency(offer.price, offer.currency))}
                  </span>
                  <span className="text-gray-600">/person</span>
                </div>
                <p className="text-xs text-gray-600 mt-2">Exclusive offer price</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm font-semibold text-green-600">Save 30%</span>
                  <span className="text-xs text-gray-500 line-through">
                    {formatPrice(convertCurrency(Math.round(offer.price * 1.43), offer.currency))}
                  </span>
                </div>
              </div>

              {/* Quick Info */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between pb-3 border-b">
                  <span className="text-sm text-gray-600">Destination</span>
                  <span className="font-semibold text-gray-900">{offer.name}</span>
                </div>
                <div className="flex items-center justify-between pb-3 border-b">
                  <span className="text-sm text-gray-600">Country</span>
                  <span className="font-semibold text-gray-900">{offer.country}</span>
                </div>
                <div className="flex items-center justify-between pb-3 border-b">
                  <span className="text-sm text-gray-600">Offer Type</span>
                  <span className="font-semibold text-gray-900">Flight + Hotel</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Validity</span>
                  <span className="font-semibold text-gray-900">Limited Time</span>
                </div>
              </div>

              {/* Book Button */}
              <Link
                to={buildOfferSearchUrl(offer)}
                className="block w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-cyan-700 hover:to-blue-700 transition shadow-lg hover:shadow-xl text-center mb-3"
              >
                Search Flights for This Offer
              </Link>
              <p className="text-xs text-center text-gray-500">
                Limited availability - Book now to secure your spot!
              </p>
            </div>

            {/* Why Choose This Offer */}
            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl p-6 border border-cyan-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Why Choose This Offer?</h3>
              <ul className="space-y-3 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <MdCheckCircle className="w-5 h-5 text-cyan-600 mt-0.5 flex-shrink-0" />
                  <span>Unbeatable prices</span>
                </li>
                <li className="flex items-start gap-2">
                  <MdCheckCircle className="w-5 h-5 text-cyan-600 mt-0.5 flex-shrink-0" />
                  <span>Direct flights included</span>
                </li>
                <li className="flex items-start gap-2">
                  <MdCheckCircle className="w-5 h-5 text-cyan-600 mt-0.5 flex-shrink-0" />
                  <span>Quality accommodation</span>
                </li>
                <li className="flex items-start gap-2">
                  <MdCheckCircle className="w-5 h-5 text-cyan-600 mt-0.5 flex-shrink-0" />
                  <span>Instant confirmation</span>
                </li>
                <li className="flex items-start gap-2">
                  <MdCheckCircle className="w-5 h-5 text-cyan-600 mt-0.5 flex-shrink-0" />
                  <span>Flexible cancellation</span>
                </li>
                <li className="flex items-start gap-2">
                  <MdCheckCircle className="w-5 h-5 text-cyan-600 mt-0.5 flex-shrink-0" />
                  <span>Expert support team</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpecialOfferDetailPage;
