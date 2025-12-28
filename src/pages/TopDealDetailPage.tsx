// src/pages/TopDealDetailPage.tsx
import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  MdHome,
  MdLocationOn,
  MdStar,
  MdStarHalf,
  MdStarBorder,
  MdArrowBack,
  MdChevronRight,
  MdLocalOffer,
  MdNightsStay,
  MdCheckCircle,
  MdRestaurant,
  MdPool,
  MdFitnessCenter,
  MdWifi,
  MdLocalParking,
  MdAcUnit,
  MdPeople,
  MdRoomService,
} from "react-icons/md";
import { useLocalization } from "../contexts/LocalizationContext";
import { topDeals } from "../data/mockData";
import { getAirportCode, getSmartDepartureDate, getSmartReturnDate } from "../utils/airportLookup";
import type { Deal } from "../types";

type ImageCategory = "exterior" | "rooms" | "dining" | "amenities" | "pool" | "spa";

interface DealImage {
  category: ImageCategory;
  url: string;
  title: string;
}

// Helper function to build flight search URL from deal
const buildDealSearchUrl = (deal: Deal): string => {
  const departureDate = getSmartDepartureDate();
  const returnDate = getSmartReturnDate(departureDate);
  const destinationCode = getAirportCode(deal.name, deal.country);

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
    dealId: deal.id,
    suggestedPrice: deal.price.toString(),
  });

  return `/flights?${params.toString()}`;
};

const TopDealDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { convertCurrency, formatPrice } = useLocalization();
  const [activeImageCategory, setActiveImageCategory] = useState<ImageCategory>("exterior");

  // Find the deal from all categories
  let deal = null;
  for (const category in topDeals) {
    const found = topDeals[category].find((d) => d.id === id);
    if (found) {
      deal = found;
      break;
    }
  }

  if (!deal) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <MdLocalOffer className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Deal Not Found</h2>
          <p className="text-gray-600 mb-6">The deal you're looking for doesn't exist.</p>
          <Link
            to="/deals"
            className="inline-flex items-center gap-2 bg-cyan-600 text-white px-6 py-3 rounded-lg hover:bg-cyan-700 transition"
          >
            <MdArrowBack />
            Back to Deals
          </Link>
        </div>
      </div>
    );
  }

  // Mock image gallery data
  const imageGallery: DealImage[] = [
    {
      category: "exterior",
      url: deal.image,
      title: "Main View",
    },
    {
      category: "exterior",
      url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop",
      title: "Exterior View",
    },
    {
      category: "exterior",
      url: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&h=600&fit=crop",
      title: "Night View",
    },
    {
      category: "rooms",
      url: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&h=600&fit=crop",
      title: "Deluxe Room",
    },
    {
      category: "rooms",
      url: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&h=600&fit=crop",
      title: "Suite",
    },
    {
      category: "rooms",
      url: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop",
      title: "Bathroom",
    },
    {
      category: "dining",
      url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop",
      title: "Restaurant",
    },
    {
      category: "dining",
      url: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&h=600&fit=crop",
      title: "Bar",
    },
    {
      category: "dining",
      url: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&h=600&fit=crop",
      title: "Breakfast Area",
    },
    {
      category: "amenities",
      url: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&h=600&fit=crop",
      title: "Lobby",
    },
    {
      category: "amenities",
      url: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop",
      title: "Lounge Area",
    },
    {
      category: "amenities",
      url: "https://images.unsplash.com/photo-1595846519845-68e298c2edd8?w=800&h=600&fit=crop",
      title: "Conference Room",
    },
    {
      category: "pool",
      url: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800&h=600&fit=crop",
      title: "Outdoor Pool",
    },
    {
      category: "pool",
      url: "https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?w=800&h=600&fit=crop",
      title: "Pool Deck",
    },
    {
      category: "pool",
      url: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&h=600&fit=crop",
      title: "Poolside Bar",
    },
    {
      category: "spa",
      url: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&h=600&fit=crop",
      title: "Spa & Wellness",
    },
    {
      category: "spa",
      url: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&h=600&fit=crop",
      title: "Fitness Center",
    },
    {
      category: "spa",
      url: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&h=600&fit=crop",
      title: "Treatment Room",
    },
  ];

  const categories: { value: ImageCategory; label: string }[] = [
    { value: "exterior", label: "Exterior" },
    { value: "rooms", label: "Rooms" },
    { value: "dining", label: "Dining" },
    { value: "amenities", label: "Amenities" },
    { value: "pool", label: "Pool" },
    { value: "spa", label: "Spa & Wellness" },
  ];

  const filteredImages = imageGallery.filter((img) => img.category === activeImageCategory);
  const [selectedImage, setSelectedImage] = useState(filteredImages[0]);

  // Render star rating
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<MdStar key={`full-${i}`} className="w-5 h-5 text-amber-400" />);
    }
    if (hasHalfStar) {
      stars.push(<MdStarHalf key="half" className="w-5 h-5 text-amber-400" />);
    }
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<MdStarBorder key={`empty-${i}`} className="w-5 h-5 text-amber-400" />);
    }
    return stars;
  };

  const amenities = [
    { icon: MdWifi, name: "Free WiFi", color: "text-blue-600" },
    { icon: MdPool, name: "Swimming Pool", color: "text-cyan-600" },
    { icon: MdRestaurant, name: "Restaurant", color: "text-orange-600" },
    { icon: MdFitnessCenter, name: "Fitness Center", color: "text-green-600" },
    { icon: MdLocalParking, name: "Free Parking", color: "text-gray-600" },
    { icon: MdAcUnit, name: "Air Conditioning", color: "text-blue-500" },
    { icon: MdRoomService, name: "Room Service", color: "text-purple-600" },
    { icon: MdPeople, name: "Conference Room", color: "text-indigo-600" },
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
            <Link to="/deals" className="text-gray-600 hover:text-cyan-600 transition">
              Top Deals
            </Link>
            <MdChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-900 font-medium">{deal.name}</span>
          </nav>

          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-cyan-600 hover:text-cyan-700 font-medium mb-4"
          >
            <MdArrowBack className="w-5 h-5" />
            Back to Deals
          </button>

          {/* Deal Header */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                  {deal.name}
                </h1>
                <span className="px-3 py-1 bg-red-500 text-white text-sm font-bold rounded-full animate-pulse">
                  HOT DEAL
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-3">
                <div className="flex items-center gap-1">
                  <MdLocationOn className="w-5 h-5 text-cyan-600" />
                  <span>{deal.country}</span>
                </div>
                <div className="flex items-center gap-1">
                  {renderStars(deal.rating)}
                  <span className="ml-1 font-semibold text-gray-900">{deal.rating}</span>
                  <span className="text-sm">({deal.reviews} reviews)</span>
                </div>
              </div>
              <span className="inline-block px-4 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-full text-sm font-semibold">
                {deal.category} Experience
              </span>
            </div>
            <Link
              to={buildDealSearchUrl(deal)}
              className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-cyan-700 hover:to-blue-700 transition shadow-lg hover:shadow-xl text-center"
            >
              Search Flights for This Deal
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
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Deal</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                {deal.description || `Discover the wonders of ${deal.name} in ${deal.country}.`}
              </p>
              <p className="text-gray-700 leading-relaxed">
                This top-rated {deal.category.toLowerCase()} destination offers incredible experiences,
                rich culture, and unforgettable memories. With a {deal.rating}/5 rating from {deal.reviews}
                satisfied travelers, this is an experience you won't want to miss!
              </p>
            </div>

            {/* Amenities & Features */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Amenities & Features</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {amenities.map((amenity, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                  >
                    <amenity.icon className={`w-6 h-6 ${amenity.color}`} />
                    <span className="text-sm font-medium text-gray-900">{amenity.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* What's Included */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">What's Included</h2>
              <div className="grid gap-3">
                {[
                  "Accommodation as per itinerary",
                  "Daily breakfast buffet",
                  "Airport transfers (round trip)",
                  "Local guide services",
                  "All taxes and service charges",
                  "Travel insurance",
                  "24/7 customer support",
                  "Flexible cancellation policy",
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
              <div className="bg-gradient-to-r from-cyan-50 to-blue-50 p-4 rounded-xl border border-cyan-100 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                  <MdNightsStay className="w-4 h-4" />
                  <span>{deal.perNight ? "Per Night" : "Package Price"}</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-gray-900">
                    {formatPrice(convertCurrency(deal.price, deal.currency))}
                  </span>
                  {deal.perNight && <span className="text-gray-600">/night</span>}
                </div>
                <p className="text-xs text-gray-600 mt-2">Best available rate</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm font-semibold text-green-600">Save 25%</span>
                  <span className="text-xs text-gray-500 line-through">
                    {formatPrice(convertCurrency(Math.round(deal.price * 1.33), deal.currency))}
                  </span>
                </div>
              </div>

              {/* Quick Info */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between pb-3 border-b">
                  <span className="text-sm text-gray-600">Category</span>
                  <span className="font-semibold text-gray-900">{deal.category}</span>
                </div>
                <div className="flex items-center justify-between pb-3 border-b">
                  <span className="text-sm text-gray-600">Location</span>
                  <span className="font-semibold text-gray-900">{deal.country}</span>
                </div>
                <div className="flex items-center justify-between pb-3 border-b">
                  <span className="text-sm text-gray-600">Rating</span>
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-gray-900">{deal.rating}</span>
                    <MdStar className="w-4 h-4 text-amber-500" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Reviews</span>
                  <span className="font-semibold text-gray-900">{deal.reviews} reviews</span>
                </div>
              </div>

              {/* Book Button */}
              <Link
                to={buildDealSearchUrl(deal)}
                className="block w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-cyan-700 hover:to-blue-700 transition shadow-lg hover:shadow-xl text-center mb-3"
              >
                Search Flights for This Deal
              </Link>
              <p className="text-xs text-center text-gray-500">
                Free cancellation up to 24 hours before arrival
              </p>
            </div>

            {/* Why Book With Us */}
            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl p-6 border border-cyan-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Why Book With Us?</h3>
              <ul className="space-y-3 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <MdCheckCircle className="w-5 h-5 text-cyan-600 mt-0.5 flex-shrink-0" />
                  <span>Best price guarantee</span>
                </li>
                <li className="flex items-start gap-2">
                  <MdCheckCircle className="w-5 h-5 text-cyan-600 mt-0.5 flex-shrink-0" />
                  <span>Instant confirmation</span>
                </li>
                <li className="flex items-start gap-2">
                  <MdCheckCircle className="w-5 h-5 text-cyan-600 mt-0.5 flex-shrink-0" />
                  <span>24/7 customer support</span>
                </li>
                <li className="flex items-start gap-2">
                  <MdCheckCircle className="w-5 h-5 text-cyan-600 mt-0.5 flex-shrink-0" />
                  <span>Flexible payment options</span>
                </li>
                <li className="flex items-start gap-2">
                  <MdCheckCircle className="w-5 h-5 text-cyan-600 mt-0.5 flex-shrink-0" />
                  <span>Secure booking process</span>
                </li>
                <li className="flex items-start gap-2">
                  <MdCheckCircle className="w-5 h-5 text-cyan-600 mt-0.5 flex-shrink-0" />
                  <span>No hidden fees</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopDealDetailPage;
