import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// src/components/HeroSearch.tsx
import { useState, useRef, useEffect } from "react";
import { Search, Plane, MapPin, Calendar, Users, ArrowLeftRight, Hotel, FileText, ChevronLeft, ChevronRight, } from "lucide-react";
import { airports } from "../data/mockData";
const HeroSearch = () => {
    const [activeTab, setActiveTab] = useState("flight");
    const [tripType, setTripType] = useState("oneWay");
    const [cabinClass, setCabinClass] = useState("economy");
    const [formData, setFormData] = useState({
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
    const [activeCalendar, setActiveCalendar] = useState(null);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const fromRef = useRef(null);
    const toRef = useRef(null);
    const passengerRef = useRef(null);
    const calendarRef = useRef(null);
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (fromRef.current && !fromRef.current.contains(event.target))
                setShowFromDropdown(false);
            if (toRef.current && !toRef.current.contains(event.target))
                setShowToDropdown(false);
            if (passengerRef.current &&
                !passengerRef.current.contains(event.target))
                setShowPassengerDropdown(false);
            if (calendarRef.current &&
                !calendarRef.current.contains(event.target))
                setActiveCalendar(null);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    const filteredFromAirports = airports.filter((airport) => [airport.name, airport.city, airport.code].some((field) => field.toLowerCase().includes(searchFrom.toLowerCase())));
    const filteredToAirports = airports.filter((airport) => [airport.name, airport.city, airport.code].some((field) => field.toLowerCase().includes(searchTo.toLowerCase())));
    const handleSwapLocations = () => setFormData((prev) => ({ ...prev, from: prev.to, to: prev.from }));
    const handleSelectFrom = (airport) => {
        setFormData((prev) => ({ ...prev, from: airport }));
        setShowFromDropdown(false);
        setSearchFrom("");
    };
    const handleSelectTo = (airport) => {
        setFormData((prev) => ({ ...prev, to: airport }));
        setShowToDropdown(false);
        setSearchTo("");
    };
    const handlePassengerChange = (type, delta) => {
        setFormData((prev) => ({
            ...prev,
            passengers: {
                ...prev.passengers,
                [type]: Math.max(type === "adults" ? 1 : 0, prev.passengers[type] + delta),
            },
        }));
    };
    const handleRoomChange = (delta) => {
        setFormData((prev) => ({
            ...prev,
            rooms: Math.max(1, prev.rooms + delta),
        }));
    };
    const getTotalPassengers = () => formData.passengers.adults +
        formData.passengers.children +
        formData.passengers.infants;
    const handleSearch = () => console.log("Search:", { ...formData, tripType, cabinClass, activeTab });
    const today = new Date().toISOString().split("T")[0];
    const formatDateDisplay = (dateString) => {
        if (!dateString)
            return { date: "Select Date", day: "" };
        const date = new Date(dateString);
        return {
            date: date.toLocaleDateString("en-US", { day: "numeric", month: "long" }),
            day: date.toLocaleDateString("en-US", { weekday: "long" }),
        };
    };
    const getDaysInMonth = (date) => {
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
    const handleDateSelect = (date, field) => {
        setFormData((prev) => ({ ...prev, [field]: date }));
        setActiveCalendar(null);
    };
    const CalendarPicker = ({ selectedDate, onSelectDate, minDate, }) => {
        const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth);
        const monthName = currentMonth.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
        });
        const days = [];
        for (let i = 0; i < startingDayOfWeek; i++)
            days.push(_jsx("div", { className: "h-10" }, `empty-${i}`));
        for (let day = 1; day <= daysInMonth; day++) {
            const dateString = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const isSelected = selectedDate === dateString;
            const isDisabled = minDate && dateString < minDate;
            const isToday = dateString === today;
            days.push(_jsx("button", { onClick: () => !isDisabled && onSelectDate(dateString), disabled: isDisabled, className: `h-10 rounded-lg font-medium transition ${isSelected
                    ? "bg-cyan-600 text-white"
                    : isToday
                        ? "bg-cyan-50 text-cyan-600 border-2 border-cyan-600"
                        : isDisabled
                            ? "text-gray-300 cursor-not-allowed"
                            : "hover:bg-gray-100 text-gray-700"}`, children: day }, day));
        }
        return (_jsxs("div", { className: "p-4 bg-white rounded-lg shadow-2xl border border-gray-200 w-80", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("button", { onClick: () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)), className: "p-2 hover:bg-gray-100 rounded-lg", children: _jsx(ChevronLeft, { className: "w-5 h-5" }) }), _jsx("div", { className: "font-semibold text-gray-900", children: monthName }), _jsx("button", { onClick: () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)), className: "p-2 hover:bg-gray-100 rounded-lg", children: _jsx(ChevronRight, { className: "w-5 h-5" }) })] }), _jsx("div", { className: "grid grid-cols-7 gap-1 mb-2", children: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (_jsx("div", { className: "h-10 flex items-center justify-center text-sm font-semibold text-gray-600", children: day }, day))) }), _jsx("div", { className: "grid grid-cols-7 gap-1", children: days })] }));
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
    return (_jsx("section", { className: "bg-gradient-to-r from-cyan-600 to-blue-600 pb-20 pt-20", children: _jsx("div", { className: "container mx-auto px-4", children: _jsxs("div", { className: "bg-white rounded-2xl shadow-2xl p-6 md:p-8 max-w-6xl mx-auto", children: [_jsx("div", { className: "flex flex-wrap gap-2 md:gap-4 mb-8 border-b px-8 pb-4", children: [
                            { id: "flight", icon: Plane, label: "Book a flight" },
                            { id: "visa", icon: FileText, label: "Visa" },
                            { id: "hotel", icon: Hotel, label: "Hotel" },
                            { id: "package", icon: MapPin, label: "Holiday Package" },
                        ].map((tab) => (_jsxs("button", { onClick: () => setActiveTab(tab.id), className: `flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${activeTab === tab.id
                                ? "bg-cyan-50 text-cyan-700"
                                : "text-gray-500 hover:bg-gray-50"}`, children: [_jsx(tab.icon, { className: "w-5 h-5" }), _jsx("span", { className: "hidden sm:inline", children: tab.label })] }, tab.id))) }), activeTab === "flight" && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 relative", children: [_jsxs("div", { className: "relative", ref: fromRef, children: [_jsxs("div", { className: "bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition cursor-pointer border-2 border-transparent hover:border-cyan-200", onClick: () => {
                                                    setShowFromDropdown(!showFromDropdown);
                                                    setShowToDropdown(false);
                                                    setShowPassengerDropdown(false);
                                                    setActiveCalendar(null);
                                                }, children: [_jsx("label", { className: "text-sm text-gray-600 block mb-2 font-medium", children: "From" }), _jsx("div", { className: "font-semibold text-lg", children: formData.from?.city || "Select City" }), _jsxs("div", { className: "text-sm text-gray-500 truncate", children: [formData.from?.code, ",", " ", formData.from?.name.substring(0, 25), "..."] })] }), showFromDropdown && (_jsxs("div", { className: "absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-2xl z-50 border border-gray-200 max-h-96 overflow-hidden", children: [_jsx("div", { className: "p-3 border-b", children: _jsx("input", { type: "text", placeholder: "Search...", value: searchFrom, onChange: (e) => setSearchFrom(e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500", autoFocus: true }) }), _jsx("div", { className: "overflow-y-auto max-h-80", children: filteredFromAirports.map((airport) => (_jsxs("div", { onClick: () => handleSelectFrom(airport), className: "p-3 hover:bg-cyan-50 cursor-pointer transition border-b last:border-b-0", children: [_jsx("div", { className: "font-semibold text-gray-900", children: airport.city }), _jsxs("div", { className: "text-sm text-gray-600", children: [airport.code, " - ", airport.name] })] }, airport.code))) })] }))] }), _jsxs("div", { className: "relative", ref: toRef, children: [_jsxs("div", { className: "bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition cursor-pointer relative border-2 border-transparent hover:border-cyan-200", onClick: () => {
                                                    setShowToDropdown(!showToDropdown);
                                                    setShowFromDropdown(false);
                                                    setShowPassengerDropdown(false);
                                                    setActiveCalendar(null);
                                                }, children: [_jsx("label", { className: "text-sm text-gray-600 block mb-2 font-medium", children: "To" }), _jsx("div", { className: "font-semibold text-lg", children: formData.to?.city || "Select City" }), _jsxs("div", { className: "text-sm text-gray-500 truncate", children: [formData.to?.code, ", ", formData.to?.name.substring(0, 25), "..."] })] }), _jsx("button", { onClick: (e) => {
                                                    e.stopPropagation();
                                                    handleSwapLocations();
                                                }, className: "hidden md:flex absolute -left-6 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow-md hover:shadow-lg hover:bg-cyan-50 transition group z-10 border-2 border-gray-200", "aria-label": "Swap locations", children: _jsx(ArrowLeftRight, { className: "w-4 h-4 text-gray-600 group-hover:text-cyan-600" }) }), showToDropdown && (_jsxs("div", { className: "absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-2xl z-50 border border-gray-200 max-h-96 overflow-hidden", children: [_jsx("div", { className: "p-3 border-b", children: _jsx("input", { type: "text", placeholder: "Search...", value: searchTo, onChange: (e) => setSearchTo(e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500", autoFocus: true }) }), _jsx("div", { className: "overflow-y-auto max-h-80", children: filteredToAirports.map((airport) => (_jsxs("div", { onClick: () => handleSelectTo(airport), className: "p-3 hover:bg-cyan-50 cursor-pointer transition border-b last:border-b-0", children: [_jsx("div", { className: "font-semibold text-gray-900", children: airport.city }), _jsxs("div", { className: "text-sm text-gray-600", children: [airport.code, " - ", airport.name] })] }, airport.code))) })] }))] }), _jsxs("div", { className: "relative", ref: calendarRef, children: [_jsxs("div", { className: "bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition cursor-pointer border-2 border-transparent hover:border-cyan-200", onClick: () => {
                                                    setActiveCalendar("departure");
                                                    setShowFromDropdown(false);
                                                    setShowToDropdown(false);
                                                    setShowPassengerDropdown(false);
                                                }, children: [_jsxs("label", { className: "text-sm text-gray-600 block mb-2 font-medium flex items-center gap-2", children: [_jsx(Calendar, { className: "w-4 h-4" }), "Departure Date"] }), _jsx("div", { className: "font-semibold text-lg", children: formatDateDisplay(formData.departureDate).date }), _jsx("div", { className: "text-sm text-gray-500", children: formatDateDisplay(formData.departureDate).day })] }), activeCalendar === "departure" && (_jsx("div", { className: "absolute top-full left-0 mt-2 z-50", children: _jsx(CalendarPicker, { selectedDate: formData.departureDate, onSelectDate: (date) => handleDateSelect(date, "departureDate"), minDate: today }) }))] }), tripType === "return" ? (_jsxs("div", { className: "relative", ref: calendarRef, children: [_jsxs("div", { className: "bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition cursor-pointer border-2 border-transparent hover:border-cyan-200", onClick: () => {
                                                    setActiveCalendar("return");
                                                    setShowFromDropdown(false);
                                                    setShowToDropdown(false);
                                                    setShowPassengerDropdown(false);
                                                }, children: [_jsxs("label", { className: "text-sm text-gray-600 block mb-2 font-medium flex items-center gap-2", children: [_jsx(Calendar, { className: "w-4 h-4" }), "Return Date"] }), _jsx("div", { className: "font-semibold text-lg", children: formatDateDisplay(formData.returnDate).date }), _jsx("div", { className: "text-sm text-gray-500", children: formatDateDisplay(formData.returnDate).day })] }), activeCalendar === "return" && (_jsx("div", { className: "absolute top-full left-0 mt-2 z-50", children: _jsx(CalendarPicker, { selectedDate: formData.returnDate, onSelectDate: (date) => handleDateSelect(date, "returnDate"), minDate: formData.departureDate || today }) }))] })) : (_jsxs("div", { className: "relative", ref: passengerRef, children: [_jsxs("div", { className: "bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition cursor-pointer border-2 border-transparent hover:border-cyan-200", onClick: () => {
                                                    setShowPassengerDropdown(!showPassengerDropdown);
                                                    setShowFromDropdown(false);
                                                    setShowToDropdown(false);
                                                    setActiveCalendar(null);
                                                }, children: [_jsxs("label", { className: "text-sm text-gray-600 block mb-2 font-medium flex items-center gap-2", children: [_jsx(Users, { className: "w-4 h-4" }), "Room & Traveler"] }), _jsxs("div", { className: "font-semibold text-lg", children: [formData.rooms, " Room, ", getTotalPassengers(), " Traveler"] }), _jsxs("div", { className: "text-sm text-gray-500", children: [formData.passengers.adults, " Adult", formData.passengers.children > 0 &&
                                                                `, ${formData.passengers.children} Child`, formData.passengers.infants > 0 &&
                                                                `, ${formData.passengers.infants} Infant`] })] }), showPassengerDropdown && (_jsx("div", { className: "absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-2xl z-50 border border-gray-200 p-4 min-w-[280px]", children: _jsxs("div", { className: "space-y-4", children: [[
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
                                                        ].map(({ type, label, subtitle }) => (_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("div", { className: "font-semibold text-gray-900", children: label }), _jsx("div", { className: "text-sm text-gray-500", children: subtitle })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("button", { onClick: () => handlePassengerChange(type, -1), disabled: type === "adults"
                                                                                ? formData.passengers.adults <= 1
                                                                                : formData.passengers[type] <= 0, className: "w-8 h-8 rounded-full border-2 border-gray-300 hover:border-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed font-semibold", children: "-" }), _jsx("span", { className: "w-8 text-center font-semibold", children: formData.passengers[type] }), _jsx("button", { onClick: () => handlePassengerChange(type, 1), className: "w-8 h-8 rounded-full border-2 border-gray-300 hover:border-cyan-500 font-semibold", children: "+" })] })] }, type))), _jsxs("div", { className: "flex items-center justify-between pt-4 border-t", children: [_jsx("div", { className: "font-semibold text-gray-900", children: "Rooms" }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("button", { onClick: () => handleRoomChange(-1), disabled: formData.rooms <= 1, className: "w-8 h-8 rounded-full border-2 border-gray-300 hover:border-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed font-semibold", children: "-" }), _jsx("span", { className: "w-8 text-center font-semibold", children: formData.rooms }), _jsx("button", { onClick: () => handleRoomChange(1), className: "w-8 h-8 rounded-full border-2 border-gray-300 hover:border-cyan-500 font-semibold", children: "+" })] })] }), _jsx("button", { onClick: () => setShowPassengerDropdown(false), className: "w-full bg-cyan-600 text-white py-2 rounded-lg hover:bg-cyan-700 transition font-semibold", children: "Done" })] }) }))] }))] }), _jsxs("div", { className: "flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4", children: [_jsxs("div", { className: "flex flex-wrap items-center gap-4 md:gap-6", children: [[
                                                { value: "oneWay", label: "One Way" },
                                                { value: "return", label: "Return" },
                                                { value: "multiCity", label: "Multi City" },
                                            ].map((t) => (_jsxs("label", { className: "flex items-center gap-2 cursor-pointer", children: [_jsx("input", { type: "radio", name: "trip", checked: tripType === t.value, onChange: () => setTripType(t.value), className: "w-4 h-4 text-cyan-600 focus:ring-cyan-500" }), _jsx("span", { className: "font-medium text-gray-700", children: t.label })] }, t.value))), _jsxs("select", { value: cabinClass, onChange: (e) => setCabinClass(e.target.value), className: "border border-gray-200 rounded-lg px-3 py-2 font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white", children: [_jsx("option", { value: "economy", children: "Economy" }), _jsx("option", { value: "business", children: "Business" }), _jsx("option", { value: "firstClass", children: "First Class" })] })] }), _jsxs("button", { onClick: handleSearch, className: "w-full lg:w-auto bg-cyan-400 text-white px-8 py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-cyan-500 transition font-semibold shadow-md hover:shadow-lg", children: [_jsx(Search, { className: "w-5 h-5" }), "Search Flight"] })] })] })), activeTab === "visa" && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "grid grid-cols-2 md:grid-cols-3 gap-4 mb-6", children: [_jsxs("div", { className: "bg-gray-50 p-4 rounded-lg", children: [_jsx("label", { className: "text-sm text-gray-600 block mb-2 font-medium", children: "Country" }), _jsxs("select", { value: formData.visaCountry, onChange: (e) => setFormData((prev) => ({
                                                    ...prev,
                                                    visaCountry: e.target.value,
                                                })), className: "w-full py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500", children: [_jsx("option", { value: "", children: "Select Country" }), countries.map((country) => (_jsx("option", { value: country, children: country }, country)))] })] }), _jsxs("div", { className: "bg-gray-50 p-4 rounded-lg", children: [_jsx("label", { className: "text-sm text-gray-600 block mb-2 font-medium", children: "Nationality" }), _jsxs("select", { value: formData.nationality, onChange: (e) => setFormData((prev) => ({
                                                    ...prev,
                                                    nationality: e.target.value,
                                                })), className: "w-full py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500", children: [_jsx("option", { value: "", children: "Select Nationality" }), countries.map((country) => (_jsx("option", { value: country, children: country }, country)))] })] }), _jsxs("div", { className: "relative", ref: calendarRef, children: [_jsxs("div", { className: "bg-gray-50 p-4 rounded-lg cursor-pointer hover:bg-gray-100 transition", onClick: () => setActiveCalendar("visa"), children: [_jsxs("label", { className: "text-sm text-gray-600 block mb-2 font-medium flex items-center gap-2", children: [_jsx(Calendar, { className: "w-4 h-4" }), "Travel Date"] }), _jsx("div", { className: "font-semibold text-lg", children: formatDateDisplay(formData.visaTravelDate).date }), _jsx("div", { className: "text-sm text-gray-500", children: formatDateDisplay(formData.visaTravelDate).day })] }), activeCalendar === "visa" && (_jsx("div", { className: "absolute top-full left-0 mt-2 z-50", children: _jsx(CalendarPicker, { selectedDate: formData.visaTravelDate, onSelectDate: (date) => handleDateSelect(date, "visaTravelDate"), minDate: today }) }))] })] }), _jsxs("button", { onClick: handleSearch, className: "w-full lg:w-auto bg-cyan-400 text-white px-8 py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-cyan-500 transition font-semibold shadow-md hover:shadow-lg ml-auto", children: [_jsx(Search, { className: "w-5 h-5" }), "Search Visa"] })] })), activeTab === "hotel" && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6", children: [_jsxs("div", { className: "bg-gray-50 p-4 rounded-lg", children: [_jsxs("label", { className: "text-sm text-gray-600 block mb-2 font-medium flex items-center gap-2", children: [_jsx(MapPin, { className: "w-4 h-4" }), "Destination"] }), _jsx("input", { type: "text", value: formData.hotelDestination, onChange: (e) => setFormData((prev) => ({
                                                    ...prev,
                                                    hotelDestination: e.target.value,
                                                })), placeholder: "City or hotel name", className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500" })] }), _jsxs("div", { className: "relative", ref: calendarRef, children: [_jsxs("div", { className: "bg-gray-50 p-4 rounded-lg cursor-pointer hover:bg-gray-100 transition", onClick: () => setActiveCalendar("checkIn"), children: [_jsxs("label", { className: "text-sm text-gray-600 block mb-2 font-medium flex items-center gap-2", children: [_jsx(Calendar, { className: "w-4 h-4" }), "Check-in"] }), _jsx("div", { className: "font-semibold text-lg", children: formatDateDisplay(formData.checkInDate).date }), _jsx("div", { className: "text-sm text-gray-500", children: formatDateDisplay(formData.checkInDate).day })] }), activeCalendar === "checkIn" && (_jsx("div", { className: "absolute top-full left-0 mt-2 z-50", children: _jsx(CalendarPicker, { selectedDate: formData.checkInDate, onSelectDate: (date) => handleDateSelect(date, "checkInDate"), minDate: today }) }))] }), _jsxs("div", { className: "relative", ref: calendarRef, children: [_jsxs("div", { className: "bg-gray-50 p-4 rounded-lg cursor-pointer hover:bg-gray-100 transition", onClick: () => setActiveCalendar("checkOut"), children: [_jsxs("label", { className: "text-sm text-gray-600 block mb-2 font-medium flex items-center gap-2", children: [_jsx(Calendar, { className: "w-4 h-4" }), "Check-out"] }), _jsx("div", { className: "font-semibold text-lg", children: formatDateDisplay(formData.checkOutDate).date }), _jsx("div", { className: "text-sm text-gray-500", children: formatDateDisplay(formData.checkOutDate).day })] }), activeCalendar === "checkOut" && (_jsx("div", { className: "absolute top-full left-0 mt-2 z-50", children: _jsx(CalendarPicker, { selectedDate: formData.checkOutDate, onSelectDate: (date) => handleDateSelect(date, "checkOutDate"), minDate: formData.checkInDate || today }) }))] }), _jsxs("div", { className: "relative", ref: passengerRef, children: [_jsxs("div", { className: "bg-gray-50 p-4 rounded-lg cursor-pointer hover:bg-gray-100 transition", onClick: () => setShowPassengerDropdown(!showPassengerDropdown), children: [_jsxs("label", { className: "text-sm text-gray-600 block mb-2 font-medium flex items-center gap-2", children: [_jsx(Users, { className: "w-4 h-4" }), "Guests & Rooms"] }), _jsxs("div", { className: "font-semibold text-lg", children: [formData.rooms, " Room, ", getTotalPassengers(), " Guests"] }), _jsxs("div", { className: "text-sm text-gray-500", children: [formData.passengers.adults, " Adult"] })] }), showPassengerDropdown && (_jsx("div", { className: "absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-2xl z-50 border border-gray-200 p-4 min-w-[280px]", children: _jsxs("div", { className: "space-y-4", children: [[
                                                            { type: "adults", label: "Adults" },
                                                            { type: "children", label: "Children" },
                                                        ].map(({ type, label }) => (_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("div", { className: "font-semibold text-gray-900", children: label }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("button", { onClick: () => handlePassengerChange(type, -1), disabled: type === "adults" &&
                                                                                formData.passengers.adults <= 1, className: "w-8 h-8 rounded-full border-2 border-gray-300 hover:border-cyan-500 disabled:opacity-50 font-semibold", children: "-" }), _jsx("span", { className: "w-8 text-center font-semibold", children: formData.passengers[type] }), _jsx("button", { onClick: () => handlePassengerChange(type, 1), className: "w-8 h-8 rounded-full border-2 border-gray-300 hover:border-cyan-500 font-semibold", children: "+" })] })] }, type))), _jsxs("div", { className: "flex items-center justify-between pt-4 border-t", children: [_jsx("div", { className: "font-semibold text-gray-900", children: "Rooms" }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("button", { onClick: () => handleRoomChange(-1), disabled: formData.rooms <= 1, className: "w-8 h-8 rounded-full border-2 border-gray-300 hover:border-cyan-500 disabled:opacity-50 font-semibold", children: "-" }), _jsx("span", { className: "w-8 text-center font-semibold", children: formData.rooms }), _jsx("button", { onClick: () => handleRoomChange(1), className: "w-8 h-8 rounded-full border-2 border-gray-300 hover:border-cyan-500 font-semibold", children: "+" })] })] }), _jsx("button", { onClick: () => setShowPassengerDropdown(false), className: "w-full bg-cyan-600 text-white py-2 rounded-lg hover:bg-cyan-700 transition font-semibold", children: "Done" })] }) }))] })] }), _jsxs("button", { onClick: handleSearch, className: "w-full lg:w-auto bg-cyan-400 text-white px-8 py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-cyan-500 transition font-semibold shadow-md hover:shadow-lg ml-auto", children: [_jsx(Search, { className: "w-5 h-5" }), "Search Hotels"] })] })), activeTab === "package" && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "grid grid-cols-2 md:grid-cols-3 gap-4 mb-6", children: [_jsxs("div", { className: "bg-gray-50 p-4 rounded-lg", children: [_jsxs("label", { className: "text-sm text-gray-600 block mb-2 font-medium flex items-center gap-2", children: [_jsx(MapPin, { className: "w-4 h-4" }), "Destination"] }), _jsx("input", { type: "text", value: formData.packageDestination, onChange: (e) => setFormData((prev) => ({
                                                    ...prev,
                                                    packageDestination: e.target.value,
                                                })), placeholder: "Enter destination", className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500" })] }), _jsxs("div", { className: "relative", ref: calendarRef, children: [_jsxs("div", { className: "bg-gray-50 p-4 rounded-lg cursor-pointer hover:bg-gray-100 transition", onClick: () => setActiveCalendar("package"), children: [_jsxs("label", { className: "text-sm text-gray-600 block mb-2 font-medium flex items-center gap-2", children: [_jsx(Calendar, { className: "w-4 h-4" }), "Start Date"] }), _jsx("div", { className: "font-semibold text-lg", children: formatDateDisplay(formData.packageStartDate).date }), _jsx("div", { className: "text-sm text-gray-500", children: formatDateDisplay(formData.packageStartDate).day })] }), activeCalendar === "package" && (_jsx("div", { className: "absolute top-full left-0 mt-2 z-50", children: _jsx(CalendarPicker, { selectedDate: formData.packageStartDate, onSelectDate: (date) => handleDateSelect(date, "packageStartDate"), minDate: today }) }))] }), _jsxs("div", { className: "bg-gray-50 p-4 rounded-lg", children: [_jsx("label", { className: "text-sm text-gray-600 block mb-2 font-medium", children: "Budget Range" }), _jsx("input", { type: "range", min: "10000", max: "500000", step: "10000", value: formData.budgetRange, onChange: (e) => setFormData((prev) => ({
                                                    ...prev,
                                                    budgetRange: Number(e.target.value),
                                                })), className: "w-full mb-2" }), _jsxs("div", { className: "font-semibold text-lg", children: ["GHS ", formData.budgetRange.toLocaleString()] })] })] }), _jsxs("button", { onClick: handleSearch, className: "w-full lg:w-auto bg-cyan-400 text-white px-8 py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-cyan-500 transition font-semibold shadow-md hover:shadow-lg ml-auto", children: [_jsx(Search, { className: "w-5 h-5" }), "Search Packages"] })] }))] }) }) }));
};
export default HeroSearch;
