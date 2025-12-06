// src/components/HeroSearch.tsx

import React, { useState, useRef, useEffect } from "react";
import {
  Search,
  Plane,
  MapPin,
  Calendar,
  Users,
  ArrowLeftRight,
  Hotel,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { airports } from "../data/mockData";
import type { Airport } from "../types";

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
  budgetRange: number;
}

const HeroSearch: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "flight" | "visa" | "hotel" | "package"
  >("flight");
  const [tripType, setTripType] = useState<"oneWay" | "return" | "multiCity">(
    "oneWay"
  );
  const [cabinClass, setCabinClass] = useState<
    "economy" | "business" | "firstClass"
  >("economy");

  const [formData, setFormData] = useState<SearchFormData>({
    from: airports[0],
    to: airports[1],
    departureDate: "",
    returnDate: "",
    passengers: { adults: 1, children: 0, infants: 0 },
    rooms: 1,
    visaCountry: "",
    nationality: "",
    visaTravelDate: "",
    hotelDestination: "",
    checkInDate: "",
    checkOutDate: "",
    packageDestination: "",
    packageStartDate: "",
    budgetRange: 50000,
  });

  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);
  const [showPassengerDropdown, setShowPassengerDropdown] = useState(false);
  const [searchFrom, setSearchFrom] = useState("");
  const [searchTo, setSearchTo] = useState("");

  const [activeCalendar, setActiveCalendar] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const fromRef = useRef<HTMLDivElement>(null);
  const toRef = useRef<HTMLDivElement>(null);
  const passengerRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (fromRef.current && !fromRef.current.contains(event.target as Node))
        setShowFromDropdown(false);
      if (toRef.current && !toRef.current.contains(event.target as Node))
        setShowToDropdown(false);
      if (
        passengerRef.current &&
        !passengerRef.current.contains(event.target as Node)
      )
        setShowPassengerDropdown(false);
      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.target as Node)
      )
        setActiveCalendar(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredFromAirports = airports.filter((airport) =>
    [airport.name, airport.city, airport.code].some((field) =>
      field.toLowerCase().includes(searchFrom.toLowerCase())
    )
  );

  const filteredToAirports = airports.filter((airport) =>
    [airport.name, airport.city, airport.code].some((field) =>
      field.toLowerCase().includes(searchTo.toLowerCase())
    )
  );

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
  const handleSearch = () =>
    console.log("Search:", { ...formData, tripType, cabinClass, activeTab });
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
          disabled={isDisabled}
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
      <div className="p-4 bg-white rounded-lg shadow-2xl border border-gray-200 w-80">
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
    <section className="bg-gradient-to-r from-cyan-600 to-blue-600 pb-20 pt-20">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 max-w-6xl mx-auto">
          {/* Tabs */}
          <div className="flex flex-wrap gap-2 md:gap-4 mb-8 border-b px-8 pb-4">
            {[
              { id: "flight", icon: Plane, label: "Book a flight" },
              { id: "visa", icon: FileText, label: "Visa" },
              { id: "hotel", icon: Hotel, label: "Hotel" },
              { id: "package", icon: MapPin, label: "Holiday Package" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                  activeTab === tab.id
                    ? "bg-cyan-50 text-cyan-700"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* FLIGHT TAB */}
          {activeTab === "flight" && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 relative">
                {/* From */}
                <div className="relative" ref={fromRef}>
                  <div
                    className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition cursor-pointer border-2 border-transparent hover:border-cyan-200"
                    onClick={() => {
                      setShowFromDropdown(!showFromDropdown);
                      setShowToDropdown(false);
                      setShowPassengerDropdown(false);
                      setActiveCalendar(null);
                    }}
                  >
                    <label className="text-sm text-gray-600 block mb-2 font-medium">
                      From
                    </label>
                    <div className="font-semibold text-lg">
                      {formData.from?.city || "Select City"}
                    </div>
                    <div className="text-sm text-gray-500 truncate">
                      {formData.from?.code},{" "}
                      {formData.from?.name.substring(0, 25)}...
                    </div>
                  </div>
                  {showFromDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-2xl z-50 border border-gray-200 max-h-96 overflow-hidden">
                      <div className="p-3 border-b">
                        <input
                          type="text"
                          placeholder="Search..."
                          value={searchFrom}
                          onChange={(e) => setSearchFrom(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                          autoFocus
                        />
                      </div>
                      <div className="overflow-y-auto max-h-80">
                        {filteredFromAirports.map((airport) => (
                          <div
                            key={airport.code}
                            onClick={() => handleSelectFrom(airport)}
                            className="p-3 hover:bg-cyan-50 cursor-pointer transition border-b last:border-b-0"
                          >
                            <div className="font-semibold text-gray-900">
                              {airport.city}
                            </div>
                            <div className="text-sm text-gray-600">
                              {airport.code} - {airport.name}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* To */}
                <div className="relative" ref={toRef}>
                  <div
                    className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition cursor-pointer relative border-2 border-transparent hover:border-cyan-200"
                    onClick={() => {
                      setShowToDropdown(!showToDropdown);
                      setShowFromDropdown(false);
                      setShowPassengerDropdown(false);
                      setActiveCalendar(null);
                    }}
                  >
                    <label className="text-sm text-gray-600 block mb-2 font-medium">
                      To
                    </label>
                    <div className="font-semibold text-lg">
                      {formData.to?.city || "Select City"}
                    </div>
                    <div className="text-sm text-gray-500 truncate">
                      {formData.to?.code}, {formData.to?.name.substring(0, 25)}
                      ...
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSwapLocations();
                    }}
                    className="hidden md:flex absolute -left-6 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow-md hover:shadow-lg hover:bg-cyan-50 transition group z-10 border-2 border-gray-200"
                    aria-label="Swap locations"
                  >
                    <ArrowLeftRight className="w-4 h-4 text-gray-600 group-hover:text-cyan-600" />
                  </button>
                  {showToDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-2xl z-50 border border-gray-200 max-h-96 overflow-hidden">
                      <div className="p-3 border-b">
                        <input
                          type="text"
                          placeholder="Search..."
                          value={searchTo}
                          onChange={(e) => setSearchTo(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                          autoFocus
                        />
                      </div>
                      <div className="overflow-y-auto max-h-80">
                        {filteredToAirports.map((airport) => (
                          <div
                            key={airport.code}
                            onClick={() => handleSelectTo(airport)}
                            className="p-3 hover:bg-cyan-50 cursor-pointer transition border-b last:border-b-0"
                          >
                            <div className="font-semibold text-gray-900">
                              {airport.city}
                            </div>
                            <div className="text-sm text-gray-600">
                              {airport.code} - {airport.name}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Departure Date */}
                <div className="relative" ref={calendarRef}>
                  <div
                    className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition cursor-pointer border-2 border-transparent hover:border-cyan-200"
                    onClick={() => {
                      setActiveCalendar("departure");
                      setShowFromDropdown(false);
                      setShowToDropdown(false);
                      setShowPassengerDropdown(false);
                    }}
                  >
                    <label className="text-sm text-gray-600 block mb-2 font-medium flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Departure Date
                    </label>
                    <div className="font-semibold text-lg">
                      {formatDateDisplay(formData.departureDate).date}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDateDisplay(formData.departureDate).day}
                    </div>
                  </div>
                  {activeCalendar === "departure" && (
                    <div className="absolute top-full left-0 mt-2 z-50">
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

                {/* Return Date or Passengers */}
                {tripType === "return" ? (
                  <div className="relative" ref={calendarRef}>
                    <div
                      className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition cursor-pointer border-2 border-transparent hover:border-cyan-200"
                      onClick={() => {
                        setActiveCalendar("return");
                        setShowFromDropdown(false);
                        setShowToDropdown(false);
                        setShowPassengerDropdown(false);
                      }}
                    >
                      <label className="text-sm text-gray-600 block mb-2 font-medium flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Return Date
                      </label>
                      <div className="font-semibold text-lg">
                        {formatDateDisplay(formData.returnDate).date}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDateDisplay(formData.returnDate).day}
                      </div>
                    </div>
                    {activeCalendar === "return" && (
                      <div className="absolute top-full left-0 mt-2 z-50">
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
                ) : (
                  <div className="relative" ref={passengerRef}>
                    <div
                      className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition cursor-pointer border-2 border-transparent hover:border-cyan-200"
                      onClick={() => {
                        setShowPassengerDropdown(!showPassengerDropdown);
                        setShowFromDropdown(false);
                        setShowToDropdown(false);
                        setActiveCalendar(null);
                      }}
                    >
                      <label className="text-sm text-gray-600 block mb-2 font-medium flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Room & Traveler
                      </label>
                      <div className="font-semibold text-lg">
                        {formData.rooms} Room, {getTotalPassengers()} Traveler
                      </div>
                      <div className="text-sm text-gray-500">
                        {formData.passengers.adults} Adult
                        {formData.passengers.children > 0 &&
                          `, ${formData.passengers.children} Child`}
                        {formData.passengers.infants > 0 &&
                          `, ${formData.passengers.infants} Infant`}
                      </div>
                    </div>
                    {showPassengerDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-2xl z-50 border border-gray-200 p-4 min-w-[280px]">
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
                                    handlePassengerChange(type as any, -1)
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
                                    handlePassengerChange(type as any, 1)
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
                )}
              </div>

              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-4 md:gap-6">
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
                        onChange={() => setTripType(t.value as any)}
                        className="w-4 h-4 text-cyan-600 focus:ring-cyan-500"
                      />
                      <span className="font-medium text-gray-700">
                        {t.label}
                      </span>
                    </label>
                  ))}
                  <select
                    value={cabinClass}
                    onChange={(e) => setCabinClass(e.target.value as any)}
                    className="border border-gray-200 rounded-lg px-3 py-2 font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white"
                  >
                    <option value="economy">Economy</option>
                    <option value="business">Business</option>
                    <option value="firstClass">First Class</option>
                  </select>
                </div>
                <button
                  onClick={handleSearch}
                  className="w-full lg:w-auto bg-cyan-400 text-white px-8 py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-cyan-500 transition font-semibold shadow-md hover:shadow-lg"
                >
                  <Search className="w-5 h-5" />
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
                    <div className="absolute top-full left-0 mt-2 z-50">
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
                className="w-full lg:w-auto bg-cyan-400 text-white px-8 py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-cyan-500 transition font-semibold shadow-md hover:shadow-lg ml-auto"
              >
                <Search className="w-5 h-5" />
                Search Visa
              </button>
            </>
          )}

          {/* HOTEL TAB */}
          {activeTab === "hotel" && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="text-sm text-gray-600 block mb-2 font-medium flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Destination
                  </label>
                  <input
                    type="text"
                    value={formData.hotelDestination}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        hotelDestination: e.target.value,
                      }))
                    }
                    placeholder="City or hotel name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div className="relative" ref={calendarRef}>
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
                    <div className="absolute top-full left-0 mt-2 z-50">
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
                <div className="relative" ref={calendarRef}>
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
                    <div className="absolute top-full left-0 mt-2 z-50">
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
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-2xl z-50 border border-gray-200 p-4 min-w-[280px]">
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
                                  handlePassengerChange(type as any, -1)
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
                                  handlePassengerChange(type as any, 1)
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
                className="w-full lg:w-auto bg-cyan-400 text-white px-8 py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-cyan-500 transition font-semibold shadow-md hover:shadow-lg ml-auto"
              >
                <Search className="w-5 h-5" />
                Search Hotels
              </button>
            </>
          )}

          {/* PACKAGE TAB */}
          {activeTab === "package" && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
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
                    placeholder="Enter destination"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div className="relative" ref={calendarRef}>
                  <div
                    className="bg-gray-50 p-4 rounded-lg cursor-pointer hover:bg-gray-100 transition"
                    onClick={() => setActiveCalendar("package")}
                  >
                    <label className="text-sm text-gray-600 block mb-2 font-medium flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Start Date
                    </label>
                    <div className="font-semibold text-lg">
                      {formatDateDisplay(formData.packageStartDate).date}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDateDisplay(formData.packageStartDate).day}
                    </div>
                  </div>
                  {activeCalendar === "package" && (
                    <div className="absolute top-full left-0 mt-2 z-50">
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
                    Budget Range
                  </label>
                  <input
                    type="range"
                    min="10000"
                    max="500000"
                    step="10000"
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
                className="w-full lg:w-auto bg-cyan-400 text-white px-8 py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-cyan-500 transition font-semibold shadow-md hover:shadow-lg ml-auto"
              >
                <Search className="w-5 h-5" />
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
