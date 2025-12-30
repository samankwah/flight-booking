// src/components/HeroSearch.tsx

import React, { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import {
  MdSearch as Search,
  MdFlight as Plane,
  MdLocationOn as MapPin,
  MdCalendarToday as Calendar,
  MdPeople as Users,
  MdSwapHoriz as ArrowLeftRight,
  MdHotel as Hotel,
  MdDescription as FileText,
  MdChevronLeft as ChevronLeft,
  MdChevronRight as ChevronRight,
} from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { airports } from "../data/mockData";
import type { Airport, MultiCitySegment } from "../types";
import { searchAirports } from "../services/flightApi";
import MultiCityFlightForm from "./MultiCityFlightForm";

interface SearchFormData {
  from: Airport | null;
  to: Airport | null;
  departureDate: string;
  returnDate: string;
  passengers: { adults: number; children: number; infants: number };
  rooms: number;
  visaCountry: string;
  nationality: string;
  visaTravelDate: string;
  hotelDestination: string;
  checkInDate: string;
  checkOutDate: string;
  packageDestination: string;
  packageStartDate: string;
  packageEndDate: string;
  duration: number;
  packageType: "budget" | "standard" | "luxury";
  budgetRange: number;
}

const HeroSearch: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<
    "flight" | "visa" | "hotel" | "package"
  >("flight");
  const [tripType, setTripType] = useState<"oneWay" | "return" | "multiCity">(
    "oneWay"
  );
  const [cabinClass, setCabinClass] = useState<
    "economy" | "business" | "firstClass"
  >("economy");

  // Multi-city segments state
  const [multiCitySegments, setMultiCitySegments] = useState<
    MultiCitySegment[]
  >([]);

  // Set default dates for hotel check-in (tomorrow) and check-out (day after tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfterTomorrow = new Date();
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

  const [formData, setFormData] = useState<SearchFormData>({
    from: airports[0],
    to: airports[1],
    departureDate: "",
    returnDate: "",
    passengers: { adults: 1, children: 0, infants: 0 },
    rooms: 1,
    visaCountry: "",
    nationality: "Ghana", // Default to Ghana for Ghanaian users
    visaTravelDate: "",
    hotelDestination: "",
    checkInDate: tomorrow.toISOString().split("T")[0],
    checkOutDate: dayAfterTomorrow.toISOString().split("T")[0],
    packageDestination: "",
    packageStartDate: tomorrow.toISOString().split("T")[0],
    packageEndDate: dayAfterTomorrow.toISOString().split("T")[0],
    duration: 7,
    packageType: "standard" as "budget" | "standard" | "luxury",
    budgetRange: 50000,
  });

  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);
  const [showPassengerDropdown, setShowPassengerDropdown] = useState(false);
  const [searchFrom, setSearchFrom] = useState("");
  const [searchTo, setSearchTo] = useState("");

  // Airport search state
  const [fromAirports, setFromAirports] = useState<AirportSearchResult[]>([]);
  const [toAirports, setToAirports] = useState<AirportSearchResult[]>([]);
  const [fromLoading, setFromLoading] = useState(false);
  const [toLoading, setToLoading] = useState(false);
  const [fromSearchTimeout, setFromSearchTimeout] =
    useState<NodeJS.Timeout | null>(null);
  const [toSearchTimeout, setToSearchTimeout] = useState<NodeJS.Timeout | null>(
    null
  );

  // Nearby airports state
  const [nearbyAirports, setNearbyAirports] = useState<NearbyAirportResult[]>(
    []
  );
  const [locationLoading, setLocationLoading] = useState(false);

  // Hotel search state
  const [hotelSearchResults, setHotelSearchResults] = useState<
    HotelSearchResult[]
  >([]);
  const [hotelLoading, setHotelLoading] = useState(false);
  const [showHotelDropdown, setShowHotelDropdown] = useState(false);
  const [hotelSearchTimeout, setHotelSearchTimeout] =
    useState<NodeJS.Timeout | null>(null);

  const [activeCalendar, setActiveCalendar] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const fromRef = useRef<HTMLDivElement>(null);
  const toRef = useRef<HTMLDivElement>(null);
  const passengerRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const returnCalendarRef = useRef<HTMLDivElement>(null);
  const hotelRef = useRef<HTMLDivElement>(null);
  const checkInRef = useRef<HTMLDivElement>(null);
  const checkOutRef = useRef<HTMLDivElement>(null);

  // Get user's location and set default "From" airport
  useEffect(() => {
    const getUserLocation = async () => {
      if (!navigator.geolocation) {
        console.log("Geolocation not supported");
        return;
      }

      setLocationLoading(true);
      try {
        const position = await new Promise<GeolocationPosition>(
          (resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 300000, // 5 minutes
            });
          }
        );

        const { latitude, longitude } = position.coords;
        console.log("📍 User location:", { latitude, longitude });

        // Check if user is in Ghana (rough coordinate bounds)
        // Ghana coordinates: approximately 4.5°N to 11°N latitude, 3.1°W to 1.2°E longitude
        const isInGhana =
          latitude >= 4.5 &&
          latitude <= 11 &&
          longitude >= -3.1 &&
          longitude <= 1.2;

        if (isInGhana) {
          console.log(
            "🇬🇭 User detected in Ghana, setting ACC (Kotoka International Airport) as default"
          );
          setFormData((prev) => ({
            ...prev,
            from: {
              code: "ACC",
              name: "Kotoka International Airport",
              city: "Accra",
              country: "GH",
            },
          }));
        } else {
          // Try to get nearby airports for other locations
          const nearby = await getNearbyAirports(latitude, longitude, 100);
          setNearbyAirports(nearby);

          if (nearby.length > 0) {
            const nearest = nearby[0];
            console.log("🏠 Setting nearest airport as default:", nearest);

            setFormData((prev) => ({
              ...prev,
              from: {
                code: nearest.iataCode,
                name: nearest.name,
                city: nearest.address.cityName,
                country: nearest.address.countryCode,
              },
            }));
          } else {
            // Fallback to JFK if no nearby airports found
            setFormData((prev) => ({
              ...prev,
              from: {
                code: "JFK",
                name: "John F Kennedy International",
                city: "New York",
                country: "US",
              },
            }));
          }
        }
      } catch (error) {
        console.error("❌ Error getting user location:", error);
        // If geolocation fails, try to detect based on browser locale or fallback to ACC for Ghana
        const userLocale = navigator.language || "en-US";
        const isLikelyGhana =
          userLocale.includes("en-GH") || userLocale.includes("GH");

        if (isLikelyGhana) {
          console.log(
            "🇬🇭 Browser locale suggests Ghana, setting ACC as default"
          );
          setFormData((prev) => ({
            ...prev,
            from: {
              code: "ACC",
              name: "Kotoka International Airport",
              city: "Accra",
              country: "GH",
            },
          }));
        } else {
          // Default fallback
          setFormData((prev) => ({
            ...prev,
            from: {
              code: "JFK",
              name: "John F Kennedy International",
              city: "New York",
              country: "US",
            },
          }));
        }
      } finally {
        setLocationLoading(false);
      }
    };

    getUserLocation();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;

      // Check if click is on calendar picker (don't close if clicking on calendar)
      const isClickOnCalendar =
        target.closest(".calendar-picker") ||
        target.closest('[class*="CalendarPicker"]') ||
        target.closest(".grid.grid-cols-7");

      if (fromRef.current && !fromRef.current.contains(target))
        setShowFromDropdown(false);
      if (toRef.current && !toRef.current.contains(target))
        setShowToDropdown(false);
      if (hotelRef.current && !hotelRef.current.contains(target))
        setShowHotelDropdown(false);

      // Only close calendar if not clicking on calendar itself
      if (!isClickOnCalendar) {
        if (checkInRef.current && !checkInRef.current.contains(target))
          setActiveCalendar(null);
        if (checkOutRef.current && !checkOutRef.current.contains(target))
          setActiveCalendar(null);
      }

      if (passengerRef.current && !passengerRef.current.contains(target))
        setShowPassengerDropdown(false);
      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.target as Node)
      )
        setActiveCalendar(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      // Cleanup timeouts
      if (fromSearchTimeout) clearTimeout(fromSearchTimeout);
      if (toSearchTimeout) clearTimeout(toSearchTimeout);
    };
  }, [fromSearchTimeout, toSearchTimeout]);

  // Debounced search functions for airports
  const searchFromAirports = async (keyword: string) => {
    if (keyword.length < 2) {
      setFromAirports([]);
      return;
    }

    setFromLoading(true);
    try {
      const results = await searchAirports(keyword);
      setFromAirports(results);
    } catch (error) {
      console.error("Error searching from airports:", error);
      setFromAirports([]);
    } finally {
      setFromLoading(false);
    }
  };

  const searchToAirports = async (keyword: string) => {
    if (keyword.length < 2) {
      setToAirports([]);
      return;
    }

    setToLoading(true);
    try {
      const results = await searchAirports(keyword);
      setToAirports(results);
    } catch (error) {
      console.error("Error searching to airports:", error);
      setToAirports([]);
    } finally {
      setToLoading(false);
    }
  };

  // Handle search input changes with debouncing
  const handleFromSearchChange = (value: string) => {
    setSearchFrom(value);

    // Clear existing timeout
    if (fromSearchTimeout) {
      clearTimeout(fromSearchTimeout);
    }

    // Set new timeout for debounced search
    const timeout = setTimeout(() => {
      searchFromAirports(value);
    }, 300);

    setFromSearchTimeout(timeout);
  };

  const handleToSearchChange = (value: string) => {
    setSearchTo(value);

    // Clear existing timeout
    if (toSearchTimeout) {
      clearTimeout(toSearchTimeout);
    }

    // Set new timeout for debounced search
    const timeout = setTimeout(() => {
      searchToAirports(value);
    }, 300);

    setToSearchTimeout(timeout);
  };

  // Hotel search functions
  const searchHotelsByKeyword = async (keyword: string) => {
    setHotelLoading(true);
    try {
      // If keyword is empty or very short, search for "paris" to show some results
      const searchTerm = keyword.length < 1 ? "paris" : keyword;
      const results = await searchHotels(searchTerm);
      setHotelSearchResults(results);
    } catch (error) {
      console.error("Error searching hotels:", error);
      setHotelSearchResults([]);
    } finally {
      setHotelLoading(false);
    }
  };

  const handleHotelSearchChange = (value: string) => {
    setFormData((prev) => ({ ...prev, hotelDestination: value }));

    // Clear existing timeout
    if (hotelSearchTimeout) {
      clearTimeout(hotelSearchTimeout);
    }

    // Set new timeout for debounced search
    const timeout = setTimeout(() => {
      searchHotelsByKeyword(value);
      setShowHotelDropdown(value.length > 0);
    }, 200); // Reduced delay for better UX

    setHotelSearchTimeout(timeout);
  };

  const handleSelectHotel = (hotel: HotelSearchResult) => {
    setFormData((prev) => ({
      ...prev,
      hotelDestination: `${hotel.name} - ${hotel.address.cityName}, ${hotel.address.countryCode}`,
    }));
    setShowHotelDropdown(false);
    setHotelSearchResults([]);
  };

  const handleSwapLocations = () =>
    setFormData((prev) => ({ ...prev, from: prev.to, to: prev.from }));
  const handleSelectFrom = (airport: Airport) => {
    setFormData((prev) => ({ ...prev, from: airport }));
    setShowFromDropdown(false);
    setSearchFrom("");
  };
  const handleSelectTo = (airport: Airport) => {
    setFormData((prev) => ({ ...prev, to: airport }));
    setShowToDropdown(false);
    setSearchTo("");
  };

  const handlePassengerChange = (
    type: "adults" | "children" | "infants",
    delta: number
  ) => {
    setFormData((prev) => ({
      ...prev,
      passengers: {
        ...prev.passengers,
        [type]: Math.max(
          type === "adults" ? 1 : 0,
          prev.passengers[type] + delta
        ),
      },
    }));
  };

  const handleRoomChange = (delta: number) => {
    setFormData((prev) => ({
      ...prev,
      rooms: Math.max(1, prev.rooms + delta),
    }));
  };

  const getTotalPassengers = () =>
    formData.passengers.adults +
    formData.passengers.children +
    formData.passengers.infants;
  const handleSearch = () => {
    console.log("🔍 Search triggered for tab:", activeTab);
    console.log("📋 Current form data:", formData);

    if (activeTab === "flight") {
      console.log("✈️ Flight search - checking required fields");

      // Handle multi-city search
      if (tripType === "multiCity") {
        // Validate all segments
        const invalidSegment = multiCitySegments.find(
          (seg) => !seg.from?.code || !seg.to?.code || !seg.departureDate
        );

        if (invalidSegment || multiCitySegments.length < 2) {
          toast.error(
            "Please complete all flight segments with airports and dates"
          );
          return;
        }

        // Navigate with multi-city data
        const params = new URLSearchParams();
        params.append("tripType", "multiCity");
        params.append("segments", JSON.stringify(multiCitySegments));
        params.append("adults", formData.passengers.adults.toString());
        if (formData.passengers.children)
          params.append("children", formData.passengers.children.toString());
        if (formData.passengers.infants)
          params.append("infants", formData.passengers.infants.toString());

        const travelClass =
          cabinClass === "economy"
            ? "ECONOMY"
            : cabinClass === "business"
            ? "BUSINESS"
            : "FIRST";
        params.append("travelClass", travelClass);

        console.log("✈️ Multi-city search params:", params.toString());
        navigate(`/flights?${params.toString()}`);
        return;
      }

      // Handle one-way and return flights
      if (
        !formData.from?.code ||
        !formData.to?.code ||
        !formData.departureDate
      ) {
        toast.error(
          "Please select departure airport, destination, and departure date"
        );
        return;
      }

      // Build flight search parameters
      const params = new URLSearchParams();

      if (formData.from?.code) params.append("from", formData.from.code);
      if (formData.to?.code) params.append("to", formData.to.code);
      if (formData.departureDate)
        params.append("departureDate", formData.departureDate);
      if (formData.returnDate) params.append("returnDate", formData.returnDate);
      if (formData.passengers.adults)
        params.append("adults", formData.passengers.adults.toString());
      if (formData.passengers.children)
        params.append("children", formData.passengers.children.toString());
      if (formData.passengers.infants)
        params.append("infants", formData.passengers.infants.toString());

      // Add travel class
      const travelClass =
        cabinClass === "economy"
          ? "ECONOMY"
          : cabinClass === "business"
          ? "BUSINESS"
          : cabinClass === "firstClass"
          ? "FIRST"
          : "ECONOMY";
      params.append("travelClass", travelClass);

      console.log("✈️ Navigating to flights with params:", params.toString());
      // Navigate to flights page with search parameters
      navigate(`/flights?${params.toString()}`);
    } else if (activeTab === "hotel") {
      console.log("🏨 Hotel search - checking required fields");
      if (
        !formData.hotelDestination ||
        !formData.checkInDate ||
        !formData.checkOutDate
      ) {
        toast.error("Please select destination, check-in and check-out dates");
        return;
      }

      // Build hotel search parameters
      const params = new URLSearchParams();

      if (formData.hotelDestination)
        params.append("destination", formData.hotelDestination);
      if (formData.checkInDate)
        params.append("checkInDate", formData.checkInDate);
      if (formData.checkOutDate)
        params.append("checkOutDate", formData.checkOutDate);
      if (formData.passengers.adults)
        params.append("adults", formData.passengers.adults.toString());
      if (formData.rooms) params.append("rooms", formData.rooms.toString());

      console.log("🏨 Navigating to hotels with params:", params.toString());
      // Navigate to hotels page with search parameters
      navigate(`/hotels?${params.toString()}`);
    } else if (activeTab === "package") {
      console.log("🎁 Package search - checking required fields");
      if (
        !formData.packageDestination ||
        !formData.packageStartDate ||
        !formData.duration
      ) {
        toast.error("Please select destination, departure date, and duration");
        return;
      }

      // Build holiday package search parameters
      const params = new URLSearchParams();

      if (formData.packageDestination)
        params.append("destination", formData.packageDestination.trim());
      if (formData.packageStartDate)
        params.append("departureDate", formData.packageStartDate);
      if (formData.duration)
        params.append("duration", formData.duration.toString());
      if (formData.packageType)
        params.append("packageType", formData.packageType);
      if (formData.passengers.adults)
        params.append("adults", formData.passengers.adults.toString());
      if (formData.passengers.children)
        params.append("children", formData.passengers.children.toString());
      if (formData.budgetRange)
        params.append("budget", formData.budgetRange.toString());

      // Calculate return date based on duration if not already set
      if (!formData.packageEndDate) {
        const returnDate = new Date(formData.packageStartDate);
        returnDate.setDate(returnDate.getDate() + formData.duration);
        params.append("returnDate", returnDate.toISOString().split("T")[0]);
      }

      // Calculate return date based on duration
      const returnDate = new Date(formData.packageStartDate);
      returnDate.setDate(returnDate.getDate() + formData.duration);
      params.append("returnDate", returnDate.toISOString().split("T")[0]);

      console.log("🎁 Navigating to packages with params:", params.toString());
      // Navigate to packages page with search parameters
      navigate(`/packages?${params.toString()}`);
    } else if (activeTab === "visa") {
      console.log("🛂 Visa search - checking required fields");
      if (!formData.visaCountry || !formData.nationality) {
        toast.error("Please select destination country and your nationality");
        return;
      }

      // Build visa search parameters
      const params = new URLSearchParams();

      if (formData.visaCountry) params.append("country", formData.visaCountry);
      if (formData.nationality)
        params.append("nationality", formData.nationality);
      if (formData.visaTravelDate)
        params.append("travelDate", formData.visaTravelDate);

      console.log(
        "🛂 Navigating to visa results with params:",
        params.toString()
      );
      // Navigate to visa results page with search parameters
      navigate(`/visa/results?${params.toString()}`);
    } else {
      console.error("❌ Unknown tab:", activeTab);
      toast.error("Unknown search type. Please try again.");
    }
  };
  const today = new Date().toISOString().split("T")[0];

  const formatDateDisplay = (dateString: string) => {
    if (!dateString) return { date: "Select Date", day: "" };
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("en-US", { day: "numeric", month: "long" }),
      day: date.toLocaleDateString("en-US", { weekday: "long" }),
    };
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    return {
      daysInMonth: lastDay.getDate(),
      startingDayOfWeek: firstDay.getDay(),
      year,
      month,
    };
  };

  const handleDateSelect = (date: string, field: keyof SearchFormData) => {
    setFormData((prev) => ({ ...prev, [field]: date }));
    setActiveCalendar(null);
  };

  const CalendarPicker = ({
    selectedDate,
    onSelectDate,
    minDate,
  }: {
    selectedDate: string;
    onSelectDate: (date: string) => void;
    minDate?: string;
  }) => {
    const { daysInMonth, startingDayOfWeek, year, month } =
      getDaysInMonth(currentMonth);
    const monthName = currentMonth.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++)
      days.push(<div key={`empty-${i}`} className="h-10"></div>);

    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `${year}-${String(month + 1).padStart(
        2,
        "0"
      )}-${String(day).padStart(2, "0")}`;
      const isSelected = selectedDate === dateString;
      const isDisabled = minDate && dateString < minDate;
      const isToday = dateString === today;

      days.push(
        <button
          key={day}
          onClick={() => !isDisabled && onSelectDate(dateString)}
          disabled={!!isDisabled}
          className={`h-10 rounded-lg font-medium transition ${
            isSelected
              ? "bg-cyan-600 text-white"
              : isToday
              ? "bg-cyan-50 text-cyan-600 border-2 border-cyan-600"
              : isDisabled
              ? "text-gray-300 cursor-not-allowed"
              : "hover:bg-gray-100 text-gray-700"
          }`}
        >
          {day}
        </button>
      );
    }

    return (
      <div className="calendar-picker p-4 bg-white rounded-lg shadow-2xl border border-gray-200 w-[90vw] sm:w-80 max-w-sm">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() =>
              setCurrentMonth(
                new Date(
                  currentMonth.getFullYear(),
                  currentMonth.getMonth() - 1
                )
              )
            }
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="font-semibold text-gray-900">{monthName}</div>
          <button
            onClick={() =>
              setCurrentMonth(
                new Date(
                  currentMonth.getFullYear(),
                  currentMonth.getMonth() + 1
                )
              )
            }
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
            <div
              key={day}
              className="h-10 flex items-center justify-center text-sm font-semibold text-gray-600"
            >
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">{days}</div>
      </div>
    );
  };

  const countries = [
    "USA",
    "UK",
    "Canada",
    "Australia",
    "Ghana",
    "Germany",
    "France",
    "Japan",
    "UAE",
    "Singapore",
  ];

  return (
    <section
      className="relative pb-6 lg:pb-20 pt-2 lg:pt-20 bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1600&q=80')",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/20"></div>
      <div className="container mx-auto px-4 relative z-10">
        {/* Tabs - Overlapping the white card */}
        <div className="flex justify-center mb-0 max-w-5xl mx-auto relative z-20">
          <div className="inline-flex bg-white rounded-md p-1 gap-1 shadow-lg translate-y-3">
            {[
              { id: "flight", icon: Plane, label: "Book a flight" },
              { id: "visa", icon: FileText, label: "Visa" },
              { id: "hotel", icon: Hotel, label: "Hotel" },
              { id: "package", icon: MapPin, label: "Holiday Package" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition text-sm ${
                  activeTab === tab.id
                    ? "bg-cyan-50 text-gray-900"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* White Card Container */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 pt-10 pb-8 max-w-5xl mx-auto min-h-[300px]">
          {/* FLIGHT TAB */}
          {activeTab === "flight" && (
            <>
              {tripType === "multiCity" ? (
                <div className="mb-6">
                  <MultiCityFlightForm
                    onSegmentsChange={setMultiCitySegments}
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-5 relative">
                  {/* From */}
                  <div className="relative" ref={fromRef}>
                    <div
                      className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 hover:ring-2 hover:ring-cyan-400 transition cursor-pointer h-full"
                      onClick={() => {
                        setShowFromDropdown(!showFromDropdown);
                        setShowToDropdown(false);
                        setShowPassengerDropdown(false);
                        setActiveCalendar(null);
                      }}
                    >
                      <label className="text-xs text-gray-500 block mb-1 font-medium flex items-center gap-1">
                        From
                        {locationLoading && (
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-cyan-500"></div>
                        )}
                      </label>
                      <div className="font-semibold text-sm">
                        {locationLoading
                          ? "Detecting..."
                          : formData.from?.city || "Select City"}
                      </div>
                      <div className="text-xs text-gray-400 truncate">
                        {locationLoading
                          ? "Finding airport..."
                          : formData.from?.code
                          ? `${
                              formData.from.code
                            }, ${formData.from.name.substring(0, 20)}...`
                          : ""}
                      </div>
                    </div>
                    {showFromDropdown && (
                      <div className="fixed sm:absolute inset-x-4 sm:inset-x-auto top-20 sm:top-full sm:left-0 sm:right-0 mt-0 sm:mt-2 bg-white rounded-lg shadow-2xl z-[100] border border-gray-200 max-h-[70vh] sm:max-h-96 overflow-hidden">
                        <div className="p-3 border-b">
                          <input
                            type="text"
                            placeholder="Search airports and cities..."
                            value={searchFrom}
                            onChange={(e) =>
                              handleFromSearchChange(e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            autoFocus
                          />
                        </div>
                        <div className="overflow-y-auto max-h-80">
                          {fromLoading ? (
                            <div className="p-3 text-center text-gray-500">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-500 mx-auto mb-2"></div>
                              Searching...
                            </div>
                          ) : searchFrom.length === 0 ? (
                            <div className="p-3 text-center text-gray-500">
                              Start typing to search airports and cities...
                            </div>
                          ) : !Array.isArray(fromAirports) ||
                            fromAirports.length === 0 ? (
                            <div className="p-3 text-center text-gray-500">
                              No airports found
                            </div>
                          ) : (
                            fromAirports.map((airport) => (
                              <div
                                key={`${airport.iataCode}-${airport.subType}`}
                                onClick={() =>
                                  handleSelectFrom({
                                    code: airport.iataCode,
                                    name: airport.name,
                                    city: airport.address.cityName,
                                    country: airport.address.countryCode,
                                  })
                                }
                                className="p-3 hover:bg-cyan-50 cursor-pointer transition border-b last:border-b-0"
                              >
                                <div className="font-semibold text-gray-900">
                                  {airport.name}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {airport.iataCode} -{" "}
                                  {airport.address.cityName},{" "}
                                  {airport.address.countryCode}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* To */}
                  <div className="relative" ref={toRef}>
                    <div
                      className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 hover:ring-2 hover:ring-cyan-400 transition cursor-pointer h-full relative"
                      onClick={() => {
                        setShowToDropdown(!showToDropdown);
                        setShowFromDropdown(false);
                        setShowPassengerDropdown(false);
                        setActiveCalendar(null);
                      }}
                    >
                      <label className="text-xs text-gray-500 block mb-1 font-medium">
                        To
                      </label>
                      <div className="font-semibold text-sm">
                        {formData.to?.city || "Select City"}
                      </div>
                      <div className="text-xs text-gray-400 truncate">
                        {formData.to?.code
                          ? `${formData.to.code}, ${formData.to.name.substring(
                              0,
                              20
                            )}...`
                          : ""}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSwapLocations();
                      }}
                      className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 bg-white p-1.5 rounded-full shadow-md hover:shadow-lg hover:bg-cyan-50 transition group z-10 border border-gray-300"
                      aria-label="Swap locations"
                    >
                      <ArrowLeftRight className="w-3 h-3 text-gray-600 group-hover:text-cyan-600" />
                    </button>
                    {showToDropdown && (
                      <div className="fixed sm:absolute inset-x-4 sm:inset-x-auto top-20 sm:top-full sm:left-0 sm:right-0 mt-0 sm:mt-2 bg-white rounded-lg shadow-2xl z-[100] border border-gray-200 max-h-[70vh] sm:max-h-96 overflow-hidden">
                        <div className="p-3 border-b">
                          <input
                            type="text"
                            placeholder="Search airports and cities..."
                            value={searchTo}
                            onChange={(e) =>
                              handleToSearchChange(e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            autoFocus
                          />
                        </div>
                        <div className="overflow-y-auto max-h-80">
                          {toLoading ? (
                            <div className="p-3 text-center text-gray-500">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-500 mx-auto mb-2"></div>
                              Searching...
                            </div>
                          ) : searchTo.length === 0 ? (
                            <div className="p-3 text-center text-gray-500">
                              Start typing to search airports and cities...
                            </div>
                          ) : !Array.isArray(toAirports) ||
                            toAirports.length === 0 ? (
                            <div className="p-3 text-center text-gray-500">
                              No airports found
                            </div>
                          ) : (
                            toAirports.map((airport) => (
                              <div
                                key={`${airport.iataCode}-${airport.subType}`}
                                onClick={() =>
                                  handleSelectTo({
                                    code: airport.iataCode,
                                    name: airport.name,
                                    city: airport.address.cityName,
                                    country: airport.address.countryCode,
                                  })
                                }
                                className="p-3 hover:bg-cyan-50 cursor-pointer transition border-b last:border-b-0"
                              >
                                <div className="font-semibold text-gray-900">
                                  {airport.name}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {airport.iataCode} -{" "}
                                  {airport.address.cityName},{" "}
                                  {airport.address.countryCode}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Departure Date */}
                  <div className="relative" ref={calendarRef}>
                    <div
                      className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 hover:ring-2 hover:ring-cyan-400 transition cursor-pointer h-full"
                      onClick={() => {
                        setActiveCalendar("departure");
                        setShowFromDropdown(false);
                        setShowToDropdown(false);
                        setShowPassengerDropdown(false);
                      }}
                    >
                      <label className="text-xs text-gray-500 block mb-1 font-medium flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Departure Date
                      </label>
                      <div className="font-semibold text-sm">
                        {formatDateDisplay(formData.departureDate).date ||
                          "Select Date"}
                      </div>
                      <div className="text-xs text-gray-400">
                        {formatDateDisplay(formData.departureDate).day}
                      </div>
                    </div>
                    {activeCalendar === "departure" && (
                      <div className="fixed sm:absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 sm:top-full sm:left-0 sm:translate-x-0 sm:translate-y-0 mt-0 sm:mt-2 z-[100]">
                        <CalendarPicker
                          selectedDate={formData.departureDate}
                          onSelectDate={(date) =>
                            handleDateSelect(date, "departureDate")
                          }
                          minDate={today}
                        />
                      </div>
                    )}
                  </div>

                  {/* Return Date */}
                  <div className="relative" ref={returnCalendarRef}>
                    <div
                      className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 hover:ring-2 hover:ring-cyan-400 transition cursor-pointer h-full"
                      onClick={() => {
                        if (tripType !== "oneWay") {
                          setActiveCalendar("return");
                        }
                        setShowFromDropdown(false);
                        setShowToDropdown(false);
                        setShowPassengerDropdown(false);
                      }}
                    >
                      <label className="text-xs text-gray-500 block mb-1 font-medium flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Return Date
                      </label>
                      <div className="font-semibold text-sm">
                        {tripType === "oneWay"
                          ? "One Way"
                          : formatDateDisplay(formData.returnDate).date ||
                            "Select Date"}
                      </div>
                      <div className="text-xs text-gray-400">
                        {tripType !== "oneWay" &&
                          formatDateDisplay(formData.returnDate).day}
                      </div>
                    </div>
                    {activeCalendar === "return" && (
                      <div className="fixed sm:absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 sm:top-full sm:left-0 sm:translate-x-0 sm:translate-y-0 mt-0 sm:mt-2 z-[100]">
                        <CalendarPicker
                          selectedDate={formData.returnDate}
                          onSelectDate={(date) =>
                            handleDateSelect(date, "returnDate")
                          }
                          minDate={formData.departureDate || today}
                        />
                      </div>
                    )}
                  </div>

                  {/* Passengers */}
                  <div className="relative" ref={passengerRef}>
                    <div
                      className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 hover:ring-2 hover:ring-cyan-400 transition cursor-pointer h-full"
                      onClick={() => {
                        setShowPassengerDropdown(!showPassengerDropdown);
                        setShowFromDropdown(false);
                        setShowToDropdown(false);
                        setActiveCalendar(null);
                      }}
                    >
                      <label className="text-xs text-gray-500 block mb-1 font-medium flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        Room & Traveler
                      </label>
                      <div className="font-semibold text-sm">
                        {formData.rooms} Room, {getTotalPassengers()} Traveler
                        {getTotalPassengers() !== 1 ? "s" : ""}
                      </div>
                      <div className="text-xs text-gray-400">
                        {formData.passengers.adults} Adult
                        {formData.passengers.children > 0 &&
                          `, ${formData.passengers.children} Child`}
                        {formData.passengers.infants > 0 &&
                          `, ${formData.passengers.infants} Infant`}
                      </div>
                    </div>
                    {showPassengerDropdown && (
                      <div className="fixed sm:absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 sm:top-full sm:left-0 sm:right-0 sm:translate-x-0 sm:translate-y-0 mt-0 sm:mt-2 bg-white rounded-lg shadow-2xl z-[100] border border-gray-200 p-4 w-[90vw] sm:w-auto sm:min-w-[280px] max-w-md">
                        <div className="space-y-4">
                          {[
                            {
                              type: "adults",
                              label: "Adults",
                              subtitle: "12+ years",
                            },
                            {
                              type: "children",
                              label: "Children",
                              subtitle: "2-11 years",
                            },
                            {
                              type: "infants",
                              label: "Infants",
                              subtitle: "Under 2 years",
                            },
                          ].map(({ type, label, subtitle }) => (
                            <div
                              key={type}
                              className="flex items-center justify-between"
                            >
                              <div>
                                <div className="font-semibold text-gray-900">
                                  {label}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {subtitle}
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() =>
                                    handlePassengerChange(
                                      type as "adults" | "children" | "infants",
                                      -1
                                    )
                                  }
                                  disabled={
                                    type === "adults"
                                      ? formData.passengers.adults <= 1
                                      : formData.passengers[
                                          type as keyof typeof formData.passengers
                                        ] <= 0
                                  }
                                  className="w-8 h-8 rounded-full border-2 border-gray-300 hover:border-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                                >
                                  -
                                </button>
                                <span className="w-8 text-center font-semibold">
                                  {
                                    formData.passengers[
                                      type as keyof typeof formData.passengers
                                    ]
                                  }
                                </span>
                                <button
                                  onClick={() =>
                                    handlePassengerChange(
                                      type as "adults" | "children" | "infants",
                                      1
                                    )
                                  }
                                  className="w-8 h-8 rounded-full border-2 border-gray-300 hover:border-cyan-500 font-semibold"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          ))}
                          <div className="flex items-center justify-between pt-4 border-t">
                            <div className="font-semibold text-gray-900">
                              Rooms
                            </div>
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => handleRoomChange(-1)}
                                disabled={formData.rooms <= 1}
                                className="w-8 h-8 rounded-full border-2 border-gray-300 hover:border-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                              >
                                -
                              </button>
                              <span className="w-8 text-center font-semibold">
                                {formData.rooms}
                              </span>
                              <button
                                onClick={() => handleRoomChange(1)}
                                className="w-8 h-8 rounded-full border-2 border-gray-300 hover:border-cyan-500 font-semibold"
                              >
                                +
                              </button>
                            </div>
                          </div>
                          <button
                            onClick={() => setShowPassengerDropdown(false)}
                            className="w-full bg-cyan-600 text-white py-2 rounded-lg hover:bg-cyan-700 transition font-semibold"
                          >
                            Done
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-6 mt-4 border-t border-gray-200">
                <div className="flex flex-wrap items-center gap-4">
                  {[
                    { value: "oneWay", label: "One Way" },
                    { value: "return", label: "Return" },
                    { value: "multiCity", label: "Multi City" },
                  ].map((t) => (
                    <label
                      key={t.value}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="trip"
                        checked={tripType === t.value}
                        onChange={() => setTripType(t.value as typeof tripType)}
                        className="w-4 h-4 text-cyan-600 focus:ring-cyan-500"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        {t.label}
                      </span>
                    </label>
                  ))}
                  <div className="ml-2">
                    <select
                      value={cabinClass}
                      onChange={(e) =>
                        setCabinClass(
                          e.target.value as
                            | "economy"
                            | "business"
                            | "firstClass"
                        )
                      }
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white hover:border-cyan-400 transition"
                    >
                      <option value="economy">Economy</option>
                      <option value="business">Business</option>
                      <option value="firstClass">First Class</option>
                    </select>
                  </div>
                </div>
                <button
                  onClick={handleSearch}
                  className="w-full sm:w-auto bg-cyan-600 text-white px-6 py-2 rounded-md flex items-center justify-center gap-2 hover:bg-cyan-700 transition font-semibold shadow-sm hover:shadow-md text-sm"
                >
                  <Search className="w-4 h-4" />
                  Search Flight
                </button>
              </div>
            </>
          )}

          {/* VISA TAB */}
          {activeTab === "visa" && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="text-sm text-gray-600 block mb-2 font-medium">
                    Country
                  </label>
                  <select
                    value={formData.visaCountry}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        visaCountry: e.target.value,
                      }))
                    }
                    className="w-full py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="">Select Country</option>
                    {countries.map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="text-sm text-gray-600 block mb-2 font-medium">
                    Nationality
                  </label>
                  <select
                    value={formData.nationality}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        nationality: e.target.value,
                      }))
                    }
                    className="w-full py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="">Select Nationality</option>
                    {countries.map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="relative" ref={calendarRef}>
                  <div
                    className="bg-gray-50 p-4 rounded-lg cursor-pointer hover:bg-gray-100 transition"
                    onClick={() => setActiveCalendar("visa")}
                  >
                    <label className="text-sm text-gray-600 block mb-2 font-medium flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Travel Date
                    </label>
                    <div className="font-semibold text-lg">
                      {formatDateDisplay(formData.visaTravelDate).date}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDateDisplay(formData.visaTravelDate).day}
                    </div>
                  </div>
                  {activeCalendar === "visa" && (
                    <div className="fixed sm:absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 sm:top-full sm:left-0 sm:translate-x-0 sm:translate-y-0 mt-0 sm:mt-2 z-[100]">
                      <CalendarPicker
                        selectedDate={formData.visaTravelDate}
                        onSelectDate={(date) =>
                          handleDateSelect(date, "visaTravelDate")
                        }
                        minDate={today}
                      />
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={handleSearch}
                className="w-full sm:w-auto bg-cyan-600 text-white px-6 py-2 rounded-md flex items-center justify-center gap-2 hover:bg-cyan-700 transition font-semibold shadow-sm hover:shadow-md text-sm ml-auto"
              >
                <Search className="w-4 h-4" />
                Search Visa
              </button>
            </>
          )}

          {/* HOTEL TAB */}
          {activeTab === "hotel" && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div
                  className="relative bg-gray-50 p-4 rounded-lg"
                  ref={hotelRef}
                >
                  <label className="text-sm text-gray-600 block mb-2 font-medium flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Destination
                  </label>
                  <input
                    type="text"
                    value={formData.hotelDestination}
                    onChange={(e) => handleHotelSearchChange(e.target.value)}
                    onFocus={() =>
                      formData.hotelDestination && setShowHotelDropdown(true)
                    }
                    placeholder="City or hotel name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                  {showHotelDropdown && (
                    <div className="fixed sm:absolute inset-x-4 sm:inset-x-auto top-20 sm:top-full sm:left-0 sm:right-0 mt-0 sm:mt-1 bg-white rounded-lg shadow-2xl z-[100] border border-gray-200 max-h-[70vh] sm:max-h-80 overflow-y-auto">
                      {hotelLoading ? (
                        <div className="p-3 text-center text-gray-500">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-500 mx-auto mb-2"></div>
                          Searching hotels...
                        </div>
                      ) : hotelSearchResults.length === 0 ? (
                        <div className="p-3 text-center text-gray-500">
                          {formData.hotelDestination.length === 0
                            ? "Start typing to search hotels and cities..."
                            : `No hotels found for "${formData.hotelDestination}"`}
                        </div>
                      ) : (
                        hotelSearchResults.map((hotel, index) => (
                          <div
                            key={`${
                              hotel.hotelIds?.[0] || hotel.name
                            }-${index}`}
                            onClick={() => handleSelectHotel(hotel)}
                            className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                          >
                            <div className="font-semibold text-gray-900">
                              {hotel.name}
                            </div>
                            <div className="text-sm text-gray-600">
                              {hotel.address.cityName},{" "}
                              {hotel.address.countryCode}
                              {hotel.iataCode && ` (${hotel.iataCode})`}
                            </div>
                            {hotel.relevance && (
                              <div className="text-xs text-gray-500 mt-1">
                                Relevance: {hotel.relevance}%
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
                <div className="relative" ref={checkInRef}>
                  <div
                    className="bg-gray-50 p-4 rounded-lg cursor-pointer hover:bg-gray-100 transition"
                    onClick={() => setActiveCalendar("checkIn")}
                  >
                    <label className="text-sm text-gray-600 block mb-2 font-medium flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Check-in
                    </label>
                    <div className="font-semibold text-lg">
                      {formatDateDisplay(formData.checkInDate).date}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDateDisplay(formData.checkInDate).day}
                    </div>
                  </div>
                  {activeCalendar === "checkIn" && (
                    <div className="fixed sm:absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 sm:top-full sm:left-0 sm:translate-x-0 sm:translate-y-0 mt-0 sm:mt-2 z-[100]">
                      <CalendarPicker
                        selectedDate={formData.checkInDate}
                        onSelectDate={(date) =>
                          handleDateSelect(date, "checkInDate")
                        }
                        minDate={today}
                      />
                    </div>
                  )}
                </div>
                <div className="relative" ref={checkOutRef}>
                  <div
                    className="bg-gray-50 p-4 rounded-lg cursor-pointer hover:bg-gray-100 transition"
                    onClick={() => setActiveCalendar("checkOut")}
                  >
                    <label className="text-sm text-gray-600 block mb-2 font-medium flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Check-out
                    </label>
                    <div className="font-semibold text-lg">
                      {formatDateDisplay(formData.checkOutDate).date}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDateDisplay(formData.checkOutDate).day}
                    </div>
                  </div>
                  {activeCalendar === "checkOut" && (
                    <div className="fixed sm:absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 sm:top-full sm:left-0 sm:translate-x-0 sm:translate-y-0 mt-0 sm:mt-2 z-[100]">
                      <CalendarPicker
                        selectedDate={formData.checkOutDate}
                        onSelectDate={(date) =>
                          handleDateSelect(date, "checkOutDate")
                        }
                        minDate={formData.checkInDate || today}
                      />
                    </div>
                  )}
                </div>
                <div className="relative" ref={passengerRef}>
                  <div
                    className="bg-gray-50 p-4 rounded-lg cursor-pointer hover:bg-gray-100 transition"
                    onClick={() =>
                      setShowPassengerDropdown(!showPassengerDropdown)
                    }
                  >
                    <label className="text-sm text-gray-600 block mb-2 font-medium flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Guests & Rooms
                    </label>
                    <div className="font-semibold text-lg">
                      {formData.rooms} Room, {getTotalPassengers()} Guests
                    </div>
                    <div className="text-sm text-gray-500">
                      {formData.passengers.adults} Adult
                    </div>
                  </div>
                  {showPassengerDropdown && (
                    <div className="fixed sm:absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 sm:top-full sm:left-0 sm:right-0 sm:translate-x-0 sm:translate-y-0 mt-0 sm:mt-2 bg-white rounded-lg shadow-2xl z-[100] border border-gray-200 p-4 w-[90vw] sm:w-auto sm:min-w-[280px] max-w-md">
                      <div className="space-y-4">
                        {[
                          { type: "adults", label: "Adults" },
                          { type: "children", label: "Children" },
                        ].map(({ type, label }) => (
                          <div
                            key={type}
                            className="flex items-center justify-between"
                          >
                            <div className="font-semibold text-gray-900">
                              {label}
                            </div>
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() =>
                                  handlePassengerChange(
                                    type as "adults" | "children" | "infants",
                                    -1
                                  )
                                }
                                disabled={
                                  type === "adults" &&
                                  formData.passengers.adults <= 1
                                }
                                className="w-8 h-8 rounded-full border-2 border-gray-300 hover:border-cyan-500 disabled:opacity-50 font-semibold"
                              >
                                -
                              </button>
                              <span className="w-8 text-center font-semibold">
                                {
                                  formData.passengers[
                                    type as keyof typeof formData.passengers
                                  ]
                                }
                              </span>
                              <button
                                onClick={() =>
                                  handlePassengerChange(
                                    type as "adults" | "children" | "infants",
                                    1
                                  )
                                }
                                className="w-8 h-8 rounded-full border-2 border-gray-300 hover:border-cyan-500 font-semibold"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        ))}
                        <div className="flex items-center justify-between pt-4 border-t">
                          <div className="font-semibold text-gray-900">
                            Rooms
                          </div>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleRoomChange(-1)}
                              disabled={formData.rooms <= 1}
                              className="w-8 h-8 rounded-full border-2 border-gray-300 hover:border-cyan-500 disabled:opacity-50 font-semibold"
                            >
                              -
                            </button>
                            <span className="w-8 text-center font-semibold">
                              {formData.rooms}
                            </span>
                            <button
                              onClick={() => handleRoomChange(1)}
                              className="w-8 h-8 rounded-full border-2 border-gray-300 hover:border-cyan-500 font-semibold"
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <button
                          onClick={() => setShowPassengerDropdown(false)}
                          className="w-full bg-cyan-600 text-white py-2 rounded-lg hover:bg-cyan-700 transition font-semibold"
                        >
                          Done
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={handleSearch}
                className="w-full sm:w-auto bg-cyan-600 text-white px-6 py-2 rounded-md flex items-center justify-center gap-2 hover:bg-cyan-700 transition font-semibold shadow-sm hover:shadow-md text-sm ml-auto"
              >
                <Search className="w-4 h-4" />
                Search Hotels
              </button>
            </>
          )}

          {/* PACKAGE TAB */}
          {activeTab === "package" && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="bg-gray-50 p-4 rounded-lg relative">
                  <label className="text-sm text-gray-600 block mb-2 font-medium flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Destination
                  </label>
                  <input
                    type="text"
                    value={formData.packageDestination}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        packageDestination: e.target.value,
                      }))
                    }
                    placeholder="e.g., Paris, Barcelona, Dubai"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                  {/* Popular Destinations Suggestions */}
                  {/* <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-40 overflow-y-auto">
                    <div className="p-2">
                      <div className="text-xs text-gray-500 mb-2 font-medium">Popular Destinations</div>
                      <div className="grid grid-cols-3 gap-1">
                        {[
                          'Paris, France',
                          'Barcelona, Spain',
                          'Dubai, UAE',
                          'London, UK',
                          'New York, USA',
                          'Tokyo, Japan',
                          'Cape Town, South Africa',
                          'Accra, Ghana'
                        ].map((dest) => (
                          <button
                            key={dest}
                            onClick={() => setFormData((prev) => ({ ...prev, packageDestination: dest }))}
                            className="text-left text-sm p-2 hover:bg-gray-50 rounded text-gray-700 hover:text-cyan-600"
                          >
                            {dest}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div> */}
                </div>

                <div className="relative" ref={calendarRef}>
                  <div
                    className="bg-gray-50 p-4 rounded-lg cursor-pointer hover:bg-gray-100 transition"
                    onClick={() => setActiveCalendar("package")}
                  >
                    <label className="text-sm text-gray-600 block mb-2 font-medium flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Departure
                    </label>
                    <div className="font-semibold text-lg">
                      {formatDateDisplay(formData.packageStartDate).date}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDateDisplay(formData.packageStartDate).day}
                    </div>
                  </div>
                  {activeCalendar === "package" && (
                    <div className="fixed sm:absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 sm:top-full sm:left-0 sm:translate-x-0 sm:translate-y-0 mt-0 sm:mt-2 z-[100]">
                      <CalendarPicker
                        selectedDate={formData.packageStartDate}
                        onSelectDate={(date) =>
                          handleDateSelect(date, "packageStartDate")
                        }
                        minDate={today}
                      />
                    </div>
                  )}
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="text-sm text-gray-600 block mb-2 font-medium">
                    Duration
                  </label>
                  <select
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        duration: Number(e.target.value),
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value={3}>3 Nights</option>
                    <option value={5}>5 Nights</option>
                    <option value={7}>7 Nights</option>
                    <option value={10}>10 Nights</option>
                    <option value={14}>14 Nights</option>
                  </select>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="text-sm text-gray-600 block mb-2 font-medium">
                    Package Type
                  </label>
                  <select
                    value={formData.packageType}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        packageType: e.target.value as
                          | "budget"
                          | "standard"
                          | "luxury",
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="budget">Budget</option>
                    <option value="standard">Standard</option>
                    <option value="luxury">Luxury</option>
                  </select>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="text-sm text-gray-600 block mb-2 font-medium">
                    Max Budget
                  </label>
                  <input
                    type="range"
                    min="10000"
                    max="500000"
                    step="5000"
                    value={formData.budgetRange}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        budgetRange: Number(e.target.value),
                      }))
                    }
                    className="w-full mb-2"
                  />
                  <div className="font-semibold text-lg">
                    GHS {formData.budgetRange.toLocaleString()}
                  </div>
                </div>
              </div>
              <button
                onClick={handleSearch}
                className="w-full sm:w-auto bg-cyan-600 text-white px-6 py-2 rounded-md flex items-center justify-center gap-2 hover:bg-cyan-700 transition font-semibold shadow-sm hover:shadow-md text-sm ml-auto"
              >
                <Search className="w-4 h-4" />
                Search Packages
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default HeroSearch;
