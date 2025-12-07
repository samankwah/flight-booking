// src/data/mockData.ts

import type {
  Airline,
  Destination,
  Deal,
  Testimonial,
  Statistic,
  PaymentMethod,
  NavigationLink,
  Airport,
  FlightResult, // Import FlightResult
} from "../types";

export const airports: Airport[] = [
  {
    code: "DAC",
    name: "Hazrat Shahjalal International Airport",
    city: "Dhaka",
    country: "Bangladesh",
  },
  {
    code: "CXB",
    name: "Cox's Bazar Airport",
    city: "Cox's Bazar",
    country: "Bangladesh",
  },
  {
    code: "JFK",
    name: "John F. Kennedy International Airport",
    city: "New York",
    country: "USA",
  },
  {
    code: "LHR",
    name: "London Heathrow Airport",
    city: "London",
    country: "UK",
  },
  {
    code: "DXB",
    name: "Dubai International Airport",
    city: "Dubai",
    country: "UAE",
  },
];

export const airlines: Airline[] = [
  { id: "1", name: "Air Sial", code: "PF" },
  { id: "2", name: "PIA", code: "PK" },
  { id: "3", name: "SereneAir", code: "ER" },
  { id: "4", name: "FlyJinnah", code: "9P" },
  { id: "5", name: "airblue", code: "PA" },
  { id: "6", name: "flydubai", code: "FZ" },
  { id: "7", name: "Air Arabia", code: "G9" },
];

export const flightResultsMock: FlightResult[] = [
  {
    id: "FL001",
    airline: airlines[0], // Air Sial
    flightNumber: "AS123",
    departureAirport: airports[0], // DAC
    arrivalAirport: airports[2], // JFK
    departureTime: "08:00 AM",
    arrivalTime: "02:00 PM",
    duration: "18h 00m", // Example with layover
    stops: 1,
    price: 1200,
    currency: "USD",
    departureDate: "2025-01-15",
    arrivalDate: "2025-01-15",
    cabinClass: "economy",
  },
  {
    id: "FL002",
    airline: airlines[1], // PIA
    flightNumber: "PK456",
    departureAirport: airports[3], // LHR
    arrivalAirport: airports[4], // DXB
    departureTime: "10:30 AM",
    arrivalTime: "07:30 PM",
    duration: "7h 00m",
    stops: 0,
    price: 850,
    currency: "USD",
    departureDate: "2025-01-20",
    arrivalDate: "2025-01-20",
    cabinClass: "business",
  },
  {
    id: "FL003",
    airline: airlines[2], // SereneAir
    flightNumber: "ER789",
    departureAirport: airports[0], // DAC
    arrivalAirport: airports[3], // LHR
    departureTime: "05:00 PM",
    arrivalTime: "11:00 PM",
    duration: "13h 00m",
    stops: 1,
    price: 1100,
    currency: "USD",
    departureDate: "2025-01-22",
    arrivalDate: "2025-01-22",
    cabinClass: "economy",
  },
  {
    id: "FL004",
    airline: airlines[5], // flydubai
    flightNumber: "FZ010",
    departureAirport: airports[4], // DXB
    arrivalAirport: airports[0], // DAC
    departureTime: "01:00 AM",
    arrivalTime: "09:00 AM",
    duration: "4h 00m",
    stops: 0,
    price: 400,
    currency: "USD",
    departureDate: "2025-02-01",
    arrivalDate: "2025-02-01",
    cabinClass: "economy",
  },
  {
    id: "FL005",
    airline: airlines[6], // Air Arabia
    flightNumber: "G9112",
    departureAirport: airports[2], // JFK
    arrivalAirport: airports[1], // CXB
    departureTime: "09:00 PM",
    arrivalTime: "07:00 AM",
    duration: "20h 00m",
    stops: 2,
    price: 1500,
    currency: "USD",
    departureDate: "2025-02-05",
    arrivalDate: "2025-02-06",
    cabinClass: "firstClass",
  },
];

export const specialOffers: Destination[] = [
  {
    id: "1",
    name: "Melbourne",
    country: "Australia",
    image:
      "https://images.unsplash.com/photo-1514395462725-fb4566210144?w=600&h=400&fit=crop",
    price: 1800,
    currency: "PKR",
  },
  {
    id: "2",
    name: "Jakarta",
    country: "Indonesia",
    image:
      "https://images.unsplash.com/photo-1555899434-94d1eb7e0b7c?w=600&h=400&fit=crop",
    price: 2199,
    currency: "PKR",
  },
  {
    id: "3",
    name: "Antarctica",
    country: "Antarctica",
    image:
      "https://images.unsplash.com/photo-1483664852095-d6cc6870702d?w=600&h=400&fit=crop",
    price: 1800,
    currency: "PKR",
  },
  {
    id: "4",
    name: "Australia",
    country: "Australia",
    image:
      "https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=600&h=400&fit=crop",
    price: 1200,
    currency: "PKR",
  },
];

export const topDeals: Record<string, Deal[]> = {
  Bangkok: [
    {
      id: "1",
      name: "Alhambra",
      country: "Spain",
      image:
        "https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=600&h=400&fit=crop",
      rating: 4.6,
      reviews: 250,
      price: 1800,
      currency: "PKR",
      perNight: true,
      category: "Bangkok",
    },
    {
      id: "2",
      name: "Pyramids of Giza",
      country: "Egypt",
      image:
        "https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=600&h=400&fit=crop",
      rating: 4.5,
      reviews: 110,
      price: 1853,
      currency: "PKR",
      perNight: true,
      category: "Bangkok",
    },
    {
      id: "3",
      name: "Petra",
      country: "Jordan",
      image:
        "https://images.unsplash.com/photo-1578895101408-1a36b834405b?w=600&h=400&fit=crop",
      rating: 3.6,
      reviews: 180,
      price: 2593,
      currency: "PKR",
      perNight: true,
      category: "Bangkok",
    },
    {
      id: "4",
      name: "Colosseum",
      country: "Italy",
      image:
        "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=600&h=400&fit=crop",
      rating: 5.0,
      reviews: 240,
      price: 3950,
      currency: "PKR",
      perNight: true,
      category: "Bangkok",
    },
  ],
  Cambodia: [
    {
      id: "5",
      name: "Angkor Wat",
      country: "Cambodia",
      image:
        "https://images.unsplash.com/photo-1598954982060-2b36e68c295f?w=600&h=400&fit=crop",
      rating: 4.8,
      reviews: 320,
      price: 2200,
      currency: "PKR",
      perNight: true,
      category: "Cambodia",
    },
    {
      id: "6",
      name: "Phnom Penh",
      country: "Cambodia",
      image:
        "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=600&h=400&fit=crop",
      rating: 4.3,
      reviews: 150,
      price: 1900,
      currency: "PKR",
      perNight: true,
      category: "Cambodia",
    },
  ],
  USA: [
    {
      id: "7",
      name: "Grand Canyon",
      country: "USA",
      image:
        "https://images.unsplash.com/photo-1474044159687-1ee9f3a51722?w=600&h=400&fit=crop",
      rating: 4.9,
      reviews: 450,
      price: 5500,
      currency: "PKR",
      perNight: true,
      category: "USA",
    },
    {
      id: "8",
      name: "Statue of Liberty",
      country: "USA",
      image:
        "https://images.unsplash.com/photo-1485738422979-f5c462d49f74?w=600&h=400&fit=crop",
      rating: 4.7,
      reviews: 380,
      price: 6200,
      currency: "PKR",
      perNight: true,
      category: "USA",
    },
  ],
  Jordan: [
    {
      id: "9",
      name: "Wadi Rum",
      country: "Jordan",
      image:
        "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=600&h=400&fit=crop",
      rating: 4.8,
      reviews: 210,
      price: 2800,
      currency: "PKR",
      perNight: true,
      category: "Jordan",
    },
  ],
  Italy: [
    {
      id: "10",
      name: "Venice Canals",
      country: "Italy",
      image:
        "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=600&h=400&fit=crop",
      rating: 4.9,
      reviews: 520,
      price: 4200,
      currency: "PKR",
      perNight: true,
      category: "Italy",
    },
  ],
};

export const testimonials: Testimonial[] = [
  {
    id: "1",
    name: "Ruse Jammie",
    role: "Verified Customer",
    rating: 5,
    comment:
      "The team exceeded our expectations! And Their all professionalism and attention to detail were outstanding.",
    verified: true,
  },
  {
    id: "2",
    name: "Ahmed Anas",
    role: "Verified Customer",
    rating: 4,
    comment:
      "Our experience was absolutely amazing! From the moment we inquired about our trip to the final day of our vacation",
    verified: true,
  },
  {
    id: "3",
    name: "Rahil Khan",
    role: "Verified Customer",
    rating: 2,
    comment:
      "We were the most incredible experience. They took care of everything ensuring that our trip was perfect",
    verified: true,
  },
];

export const statistics: Statistic[] = [
  {
    id: "1",
    title: "We offer exclusive deals",
    description:
      "Enjoy limited-time offers and special discounts on top destinations.",
    icon: "users",
    iconColor: "orange",
  },
  {
    id: "2",
    title: "Customized Travel Itineraries",
    description: "Tailored trips to suit your personal preferences ensuring.",
    icon: "calendar",
    iconColor: "blue",
  },
  {
    id: "3",
    title: "Expert Destination Knowledge",
    description:
      "Leverage our local expertise for tips on the best sights and activities.",
    icon: "map-pin",
    iconColor: "green",
  },
  {
    id: "4",
    title: "Seamless Travel Planning",
    description:
      "Let us handle all the details from flights to accommodations.",
    icon: "plane",
    iconColor: "purple",
  },
];

export const paymentMethods: PaymentMethod[] = [
  { id: "1", name: "Visa", logo: "visa" },
  { id: "2", name: "Mastercard", logo: "mastercard" },
  { id: "3", name: "Apple Pay", logo: "apple-pay" },
  { id: "4", name: "PayPal", logo: "paypal" },
  { id: "5", name: "Nayax", logo: "nayax" },
];

export const navigationLinks: Record<string, NavigationLink[]> = {
  pages: [
    { href: "/hotels", label: "Hotels in Ghana" },
    { href: "/resorts", label: "Beach Resorts" },
    { href: "/guest-houses", label: "Guest Houses" },
    { href: "/apartments", label: "Serviced Apartments" },
    { href: "/eco-lodges", label: "Eco Lodges" },
    { href: "/vacation-rentals", label: "Vacation Rentals" },
  ],
  other: [
    { href: "/about", label: "About GhanaStay" },
    { href: "/contact", label: "Contact Us" },
    { href: "/faq", label: "FAQ - Ghana Travel" },
    { href: "/cancellation", label: "Cancellation Policy" },
    { href: "/safety", label: "Travel Safety Ghana" },
    { href: "/visa-info", label: "Ghana Visa Information" },
  ],
};

export const ghanaDestinations = [
  { name: "Accra", href: "/accra", description: "Capital City" },
  { name: "Kumasi", href: "/kumasi", description: "Ashanti Kingdom" },
  { name: "Cape Coast", href: "/cape-coast", description: "Historic Castles" },
  { name: "Takoradi", href: "/takoradi", description: "Western Region" },
  { name: "Tamale", href: "/tamale", description: "Northern Region" },
  {
    name: "Volta Region",
    href: "/volta",
    description: "Waterfalls & Mountains",
  },
];
