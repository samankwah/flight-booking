// src/components/MultiCityFlightForm.tsx
import React, { useState, useRef, useEffect } from "react";
import {
  MdLocationOn as MapPin,
  MdCalendarToday as Calendar,
  MdAdd as Plus,
  MdClose as X,
} from "react-icons/md";
import { searchAirports } from "../services/flightApi";
import type { Airport } from "../types";

interface FlightSegment {
  id: string;
  from: Airport | null;
  to: Airport | null;
  departureDate: string;
}

interface MultiCityFlightFormProps {
  onSegmentsChange: (segments: FlightSegment[]) => void;
  initialSegments?: FlightSegment[];
}

const MultiCityFlightForm: React.FC<MultiCityFlightFormProps> = ({
  onSegmentsChange,
  initialSegments,
}) => {
  const [segments, setSegments] = useState<FlightSegment[]>(
    initialSegments || [
      {
        id: "1",
        from: null,
        to: null,
        departureDate: "",
      },
      {
        id: "2",
        from: null,
        to: null,
        departureDate: "",
      },
    ]
  );

  const [activeDropdown, setActiveDropdown] = useState<{
    segmentId: string;
    field: "from" | "to";
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeCalendar, setActiveCalendar] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    onSegmentsChange(segments);
  }, [segments]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      const isClickOnCalendar =
        target.closest(".calendar-picker") ||
        target.closest('[class*="CalendarPicker"]');

      if (!isClickOnCalendar && activeCalendar) {
        setActiveCalendar(null);
      }

      if (activeDropdown) {
        const key = `${activeDropdown.segmentId}-${activeDropdown.field}`;
        if (
          dropdownRefs.current[key] &&
          !dropdownRefs.current[key]!.contains(target)
        ) {
          setActiveDropdown(null);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeDropdown, activeCalendar]);

  const handleAirportSearch = async (keyword: string) => {
    if (keyword.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchAirports(keyword);
      setSearchResults(results);
    } catch (error) {
      console.error("Error searching airports:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    const timeoutId = setTimeout(() => handleAirportSearch(value), 300);
    return () => clearTimeout(timeoutId);
  };

  const handleSelectAirport = (
    segmentId: string,
    field: "from" | "to",
    airport: Airport
  ) => {
    setSegments((prev) =>
      prev.map((seg) =>
        seg.id === segmentId ? { ...seg, [field]: airport } : seg
      )
    );
    setActiveDropdown(null);
    setSearchQuery("");
    setSearchResults([]);
  };

  const addSegment = () => {
    const newSegment: FlightSegment = {
      id: Date.now().toString(),
      from: segments[segments.length - 1]?.to || null,
      to: null,
      departureDate: "",
    };
    setSegments([...segments, newSegment]);
  };

  const removeSegment = (segmentId: string) => {
    if (segments.length > 2) {
      setSegments(segments.filter((seg) => seg.id !== segmentId));
    }
  };

  const updateSegmentDate = (segmentId: string, date: string) => {
    setSegments((prev) =>
      prev.map((seg) =>
        seg.id === segmentId ? { ...seg, departureDate: date } : seg
      )
    );
    setActiveCalendar(null);
  };

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

    const today = new Date().toISOString().split("T")[0];
    const days = [];

    for (let i = 0; i < startingDayOfWeek; i++)
      days.push(<div key={`empty-${i}`} className="h-10"></div>);

    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
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
      <div className="calendar-picker p-4 bg-white rounded-lg shadow-2xl border border-gray-200 w-80">
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
            ←
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
            →
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

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-4">
      {segments.map((segment, index) => (
        <div
          key={segment.id}
          className="relative bg-gray-50 p-4 rounded-lg border-2 border-gray-200"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Flight {index + 1}</h3>
            {segments.length > 2 && (
              <button
                onClick={() => removeSegment(segment.id)}
                className="text-red-500 hover:text-red-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* From */}
            <div
              className="relative"
              ref={(el) =>
                (dropdownRefs.current[`${segment.id}-from`] = el)
              }
            >
              <div
                onClick={() => {
                  setActiveDropdown({ segmentId: segment.id, field: "from" });
                  setActiveCalendar(null);
                }}
                className="bg-white p-3 rounded-lg cursor-pointer border-2 border-transparent hover:border-cyan-200 transition"
              >
                <label className="text-xs text-gray-600 block mb-1 font-medium flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  From
                </label>
                <div className="font-semibold text-sm">
                  {segment.from?.city || "Select City"}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {segment.from?.code || ""}
                </div>
              </div>
              {activeDropdown?.segmentId === segment.id &&
                activeDropdown?.field === "from" && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-2xl z-50 border border-gray-200 max-h-80 overflow-hidden">
                    <div className="p-3 border-b">
                      <input
                        type="text"
                        placeholder="Search airports..."
                        value={searchQuery}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                        autoFocus
                      />
                    </div>
                    <div className="overflow-y-auto max-h-64">
                      {isSearching ? (
                        <div className="p-3 text-center text-gray-500">
                          Searching...
                        </div>
                      ) : searchResults.length === 0 ? (
                        <div className="p-3 text-center text-gray-500">
                          {searchQuery.length < 2
                            ? "Type to search..."
                            : "No airports found"}
                        </div>
                      ) : (
                        searchResults.map((airport) => (
                          <div
                            key={airport.iataCode}
                            onClick={() =>
                              handleSelectAirport(segment.id, "from", {
                                code: airport.iataCode,
                                name: airport.name,
                                city: airport.address.cityName,
                                country: airport.address.countryCode,
                              })
                            }
                            className="p-3 hover:bg-cyan-50 cursor-pointer border-b last:border-b-0"
                          >
                            <div className="font-semibold">{airport.name}</div>
                            <div className="text-sm text-gray-600">
                              {airport.iataCode} - {airport.address.cityName}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
            </div>

            {/* To */}
            <div
              className="relative"
              ref={(el) => (dropdownRefs.current[`${segment.id}-to`] = el)}
            >
              <div
                onClick={() => {
                  setActiveDropdown({ segmentId: segment.id, field: "to" });
                  setActiveCalendar(null);
                }}
                className="bg-white p-3 rounded-lg cursor-pointer border-2 border-transparent hover:border-cyan-200 transition"
              >
                <label className="text-xs text-gray-600 block mb-1 font-medium flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  To
                </label>
                <div className="font-semibold text-sm">
                  {segment.to?.city || "Select City"}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {segment.to?.code || ""}
                </div>
              </div>
              {activeDropdown?.segmentId === segment.id &&
                activeDropdown?.field === "to" && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-2xl z-50 border border-gray-200 max-h-80 overflow-hidden">
                    <div className="p-3 border-b">
                      <input
                        type="text"
                        placeholder="Search airports..."
                        value={searchQuery}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                        autoFocus
                      />
                    </div>
                    <div className="overflow-y-auto max-h-64">
                      {isSearching ? (
                        <div className="p-3 text-center text-gray-500">
                          Searching...
                        </div>
                      ) : searchResults.length === 0 ? (
                        <div className="p-3 text-center text-gray-500">
                          {searchQuery.length < 2
                            ? "Type to search..."
                            : "No airports found"}
                        </div>
                      ) : (
                        searchResults.map((airport) => (
                          <div
                            key={airport.iataCode}
                            onClick={() =>
                              handleSelectAirport(segment.id, "to", {
                                code: airport.iataCode,
                                name: airport.name,
                                city: airport.address.cityName,
                                country: airport.address.countryCode,
                              })
                            }
                            className="p-3 hover:bg-cyan-50 cursor-pointer border-b last:border-b-0"
                          >
                            <div className="font-semibold">{airport.name}</div>
                            <div className="text-sm text-gray-600">
                              {airport.iataCode} - {airport.address.cityName}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
            </div>

            {/* Departure Date */}
            <div className="relative">
              <div
                onClick={() => {
                  setActiveCalendar(segment.id);
                  setActiveDropdown(null);
                }}
                className="bg-white p-3 rounded-lg cursor-pointer border-2 border-transparent hover:border-cyan-200 transition"
              >
                <label className="text-xs text-gray-600 block mb-1 font-medium flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Departure
                </label>
                <div className="font-semibold text-sm">
                  {formatDateDisplay(segment.departureDate).date}
                </div>
                <div className="text-xs text-gray-500">
                  {formatDateDisplay(segment.departureDate).day}
                </div>
              </div>
              {activeCalendar === segment.id && (
                <div className="absolute top-full left-0 mt-2 z-50">
                  <CalendarPicker
                    selectedDate={segment.departureDate}
                    onSelectDate={(date) => updateSegmentDate(segment.id, date)}
                    minDate={
                      index > 0
                        ? segments[index - 1].departureDate || today
                        : today
                    }
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

      {segments.length < 5 && (
        <button
          onClick={addSegment}
          className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-600 hover:border-cyan-400 hover:text-cyan-600 transition flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Another Flight
        </button>
      )}
    </div>
  );
};

export default MultiCityFlightForm;
