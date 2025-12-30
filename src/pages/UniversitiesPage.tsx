// // src/pages/UniversitiesPage.tsx
// import React, { useState } from "react";
// import {
//   MdHome,
//   MdSchool,
//   MdLocationOn,
//   MdCalendarToday,
//   MdCheckCircle,
//   MdChevronLeft,
//   MdChevronRight,
//   MdSearch,
//   MdChevronRight as ChevronRightIcon,
// } from "react-icons/md";
// import { Link } from "react-router-dom";
// import { useLocalization } from "../contexts/LocalizationContext";
// import ApplicationModal from "../components/ApplicationModal";

// interface University {
//   id: string;
//   schoolName: string;
//   city: string;
//   country: string;
//   region: string;
//   image: string;
//   applicationDeadline: string;
//   programs: string[];
//   scholarshipAvailable: boolean;
//   applicationFee: number;
//   currency: string;
//   acceptanceRate: string;
//   ranking: string;
//   description: string;
//   establishedYear: number;
//   totalStudents: number;
//   internationalStudents: number;
// }

// const universities: University[] = [
//   {
//     id: "1",
//     schoolName: "University of London",
//     city: "London",
//     country: "United Kingdom",
//     region: "Europe",
//     image:
//       "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&h=400&fit=crop",
//     applicationDeadline: "31st March 2026",
//     programs: [
//       "Business Administration",
//       "Engineering",
//       "Medicine",
//       "Law",
//       "Computer Science",
//     ],
//     scholarshipAvailable: true,
//     applicationFee: 150,
//     currency: "GHS",
//     acceptanceRate: "75%",
//     ranking: "Top 50 UK",
//     description:
//       "A prestigious institution offering world-class education with state-of-the-art facilities and renowned faculty members.",
//     establishedYear: 1836,
//     totalStudents: 45000,
//     internationalStudents: 15000,
//   },
//   {
//     id: "2",
//     schoolName: "Columbia University",
//     city: "New York",
//     country: "United States",
//     region: "America",
//     image:
//       "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600&h=400&fit=crop",
//     applicationDeadline: "15th April 2026",
//     programs: [
//       "Computer Science",
//       "Business",
//       "Law",
//       "Medicine",
//       "Engineering",
//     ],
//     scholarshipAvailable: true,
//     applicationFee: 250,
//     currency: "GHS",
//     acceptanceRate: "65%",
//     ranking: "Ivy League",
//     description:
//       "An Ivy League institution known for academic excellence, research innovation, and producing global leaders.",
//     establishedYear: 1754,
//     totalStudents: 33000,
//     internationalStudents: 12000,
//   },
//   {
//     id: "3",
//     schoolName: "University of Toronto",
//     city: "Toronto",
//     country: "Canada",
//     region: "America",
//     image:
//       "https://images.unsplash.com/photo-1517935706615-2717063c2225?w=600&h=400&fit=crop",
//     applicationDeadline: "20th May 2026",
//     programs: [
//       "Engineering",
//       "Health Sciences",
//       "Arts",
//       "Business",
//       "Technology",
//     ],
//     scholarshipAvailable: true,
//     applicationFee: 200,
//     currency: "GHS",
//     acceptanceRate: "80%",
//     ranking: "Top 20 Canada",
//     description:
//       "Canada's leading research university offering diverse programs and excellent career opportunities.",
//     establishedYear: 1827,
//     totalStudents: 92000,
//     internationalStudents: 25000,
//   },
//   {
//     id: "4",
//     schoolName: "Technical University of Berlin",
//     city: "Berlin",
//     country: "Germany",
//     region: "Europe",
//     image:
//       "https://images.unsplash.com/photo-1560969184-10fe8719e047?w=600&h=400&fit=crop",
//     applicationDeadline: "15th June 2026",
//     programs: [
//       "Engineering",
//       "Technology",
//       "Architecture",
//       "Computer Science",
//       "Mathematics",
//     ],
//     scholarshipAvailable: true,
//     applicationFee: 100,
//     currency: "GHS",
//     acceptanceRate: "70%",
//     ranking: "Top 10 Germany",
//     description:
//       "Leading technical university with cutting-edge research facilities and strong industry connections.",
//     establishedYear: 1879,
//     totalStudents: 35000,
//     internationalStudents: 8000,
//   },
//   {
//     id: "5",
//     schoolName: "Moscow State University",
//     city: "Moscow",
//     country: "Russia",
//     region: "Europe",
//     image:
//       "https://images.unsplash.com/photo-1513326738677-b964603b136d?w=600&h=400&fit=crop",
//     applicationDeadline: "30th April 2026",
//     programs: ["Medicine", "Science", "Mathematics", "Physics", "Chemistry"],
//     scholarshipAvailable: true,
//     applicationFee: 120,
//     currency: "GHS",
//     acceptanceRate: "72%",
//     ranking: "Top 5 Russia",
//     description:
//       "Russia's oldest and most prestigious university with a strong focus on scientific research.",
//     establishedYear: 1755,
//     totalStudents: 47000,
//     internationalStudents: 11000,
//   },
//   {
//     id: "6",
//     schoolName: "Sorbonne University",
//     city: "Paris",
//     country: "France",
//     region: "Europe",
//     image:
//       "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&h=400&fit=crop",
//     applicationDeadline: "10th May 2026",
//     programs: ["Arts", "Humanities", "Science", "Medicine", "Law"],
//     scholarshipAvailable: true,
//     applicationFee: 180,
//     currency: "GHS",
//     acceptanceRate: "68%",
//     ranking: "Top 3 France",
//     description:
//       "Historic university in the heart of Paris, renowned for arts, humanities, and scientific excellence.",
//     establishedYear: 1257,
//     totalStudents: 55000,
//     internationalStudents: 10000,
//   },
//   {
//     id: "7",
//     schoolName: "American University of Dubai",
//     city: "Dubai",
//     country: "UAE",
//     region: "Middle East",
//     image:
//       "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&h=400&fit=crop",
//     applicationDeadline: "25th March 2026",
//     programs: ["Business", "Engineering", "Media", "Architecture", "Design"],
//     scholarshipAvailable: false,
//     applicationFee: 220,
//     currency: "GHS",
//     acceptanceRate: "82%",
//     ranking: "Top 5 UAE",
//     description:
//       "Modern university offering American-style education in the vibrant city of Dubai.",
//     establishedYear: 1995,
//     totalStudents: 2500,
//     internationalStudents: 2000,
//   },
//   {
//     id: "8",
//     schoolName: "University of Amsterdam",
//     city: "Amsterdam",
//     country: "Netherlands",
//     region: "Europe",
//     image:
//       "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=600&h=400&fit=crop",
//     applicationDeadline: "1st June 2026",
//     programs: ["Social Sciences", "Economics", "Law", "Business", "Psychology"],
//     scholarshipAvailable: true,
//     applicationFee: 160,
//     currency: "GHS",
//     acceptanceRate: "76%",
//     ranking: "Top 100 Global",
//     description:
//       "Leading European research university with a strong international orientation and liberal atmosphere.",
//     establishedYear: 1632,
//     totalStudents: 41000,
//     internationalStudents: 6000,
//   },
//   {
//     id: "9",
//     schoolName: "ETH Zurich",
//     city: "Zurich",
//     country: "Switzerland",
//     region: "Europe",
//     image:
//       "https://images.unsplash.com/photo-1527866959252-deab85ef7d1b?w=600&h=400&fit=crop",
//     applicationDeadline: "15th May 2026",
//     programs: [
//       "Engineering",
//       "Natural Sciences",
//       "Mathematics",
//       "Computer Science",
//       "Architecture",
//     ],
//     scholarshipAvailable: true,
//     applicationFee: 140,
//     currency: "GHS",
//     acceptanceRate: "62%",
//     ranking: "Top 10 Global",
//     description:
//       "World-renowned science and technology university, consistently ranked among the best globally.",
//     establishedYear: 1855,
//     totalStudents: 23000,
//     internationalStudents: 9000,
//   },
//   {
//     id: "10",
//     schoolName: "University of Melbourne",
//     city: "Melbourne",
//     country: "Australia",
//     region: "Oceania",
//     image:
//       "https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=600&h=400&fit=crop",
//     applicationDeadline: "10th April 2026",
//     programs: ["Medicine", "Engineering", "Business", "Law", "Arts"],
//     scholarshipAvailable: true,
//     applicationFee: 190,
//     currency: "GHS",
//     acceptanceRate: "73%",
//     ranking: "Top 1 Australia",
//     description:
//       "Australia's leading university offering exceptional education and research opportunities.",
//     establishedYear: 1853,
//     totalStudents: 50000,
//     internationalStudents: 18000,
//   },
//   {
//     id: "11",
//     schoolName: "National University of Singapore",
//     city: "Singapore",
//     country: "Singapore",
//     region: "Asia",
//     image:
//       "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=600&h=400&fit=crop",
//     applicationDeadline: "20th March 2026",
//     programs: ["Engineering", "Business", "Computing", "Science", "Medicine"],
//     scholarshipAvailable: true,
//     applicationFee: 170,
//     currency: "GHS",
//     acceptanceRate: "69%",
//     ranking: "Top 1 Asia",
//     description:
//       "Asia's premier university with cutting-edge research and strong industry partnerships.",
//     establishedYear: 1905,
//     totalStudents: 40000,
//     internationalStudents: 13000,
//   },
//   {
//     id: "12",
//     schoolName: "McGill University",
//     city: "Montreal",
//     country: "Canada",
//     region: "America",
//     image:
//       "https://images.unsplash.com/photo-1571846080032-e94c7e5a9e84?w=600&h=400&fit=crop",
//     applicationDeadline: "5th May 2026",
//     programs: ["Medicine", "Law", "Engineering", "Science", "Arts"],
//     scholarshipAvailable: true,
//     applicationFee: 185,
//     currency: "GHS",
//     acceptanceRate: "74%",
//     ranking: "Top 5 Canada",
//     description:
//       "Canada's most international university with a rich history of academic excellence.",
//     establishedYear: 1821,
//     totalStudents: 40000,
//     internationalStudents: 12000,
//   },
// ];

// const regions = ["All", "Europe", "America", "Middle East", "Asia", "Oceania"];

// const UniversitiesPage: React.FC = () => {
//   const { convertCurrency, formatPrice } = useLocalization();
//   const [activeRegion, setActiveRegion] = useState<string>("All");
//   const [currentPage, setCurrentPage] = useState<number>(1);
//   const [searchTerm, setSearchTerm] = useState<string>("");
//   const [scholarshipFilter, setScholarshipFilter] = useState<boolean>(false);
//   const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
//   const [selectedUniversity, setSelectedUniversity] = useState<{
//     id: string;
//     schoolName: string;
//   } | null>(null);
//   const universitiesPerPage = 8;

//   // Filter universities
//   const filteredUniversities = universities.filter((uni) => {
//     const matchesRegion = activeRegion === "All" || uni.region === activeRegion;
//     const matchesSearch =
//       uni.schoolName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       uni.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       uni.country.toLowerCase().includes(searchTerm.toLowerCase());
//     const matchesScholarship = !scholarshipFilter || uni.scholarshipAvailable;

//     return matchesRegion && matchesSearch && matchesScholarship;
//   });

//   // Pagination
//   const totalPages = Math.ceil(
//     filteredUniversities.length / universitiesPerPage
//   );
//   const indexOfLastUni = currentPage * universitiesPerPage;
//   const indexOfFirstUni = indexOfLastUni - universitiesPerPage;
//   const currentUniversities = filteredUniversities.slice(
//     indexOfFirstUni,
//     indexOfLastUni
//   );

//   const handlePageChange = (pageNumber: number) => {
//     setCurrentPage(pageNumber);
//     window.scrollTo({ top: 0, behavior: "smooth" });
//   };

//   const handleRegionChange = (region: string) => {
//     setActiveRegion(region);
//     setCurrentPage(1);
//   };

//   const handleApplyNow = (universityId: string, universityName: string) => {
//     setSelectedUniversity({ id: universityId, schoolName: universityName });
//     setIsModalOpen(true);
//   };

//   const handleCloseModal = () => {
//     setIsModalOpen(false);
//     setTimeout(() => setSelectedUniversity(null), 300);
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
//       {/* Header Section */}
//       <div className="bg-white shadow-sm border-b">
//         <div className="container mx-auto px-4 py-4">
//           {/* Breadcrumb */}
//           <nav className="flex items-center gap-2 text-sm mb-4">
//             <Link
//               to="/"
//               className="flex items-center gap-1.5 text-gray-600 hover:text-cyan-600 transition"
//             >
//               <MdHome className="w-4 h-4" />
//               <span>Home</span>
//             </Link>
//             <ChevronRightIcon className="w-4 h-4 text-gray-400" />
//             <div className="flex items-center gap-1.5 text-gray-900 font-medium">
//               <MdSchool className="w-4 h-4 text-cyan-600" />
//               <span>Study Abroad</span>
//             </div>
//           </nav>

//           {/* Title */}
//           <div className="mb-6">
//             <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
//               Study Abroad Opportunities
//             </h1>
//             <p className="text-gray-600 mt-1 text-sm md:text-base">
//               Discover top universities accepting applications worldwide
//             </p>
//           </div>

//           {/* Filters */}
//           <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
//             {/* Region Filter */}
//             <div className="flex flex-wrap gap-2">
//               <span className="text-sm font-semibold text-gray-700 whitespace-nowrap flex items-center">
//                 Region:
//               </span>
//               {regions.map((region) => (
//                 <button
//                   key={region}
//                   onClick={() => handleRegionChange(region)}
//                   className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
//                     activeRegion === region
//                       ? "bg-cyan-600 text-white shadow-lg shadow-cyan-200"
//                       : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//                   }`}
//                 >
//                   {region}
//                 </button>
//               ))}
//             </div>

//             {/* Scholarship Filter */}
//             <label className="flex items-center gap-2 cursor-pointer">
//               <input
//                 type="checkbox"
//                 checked={scholarshipFilter}
//                 onChange={(e) => {
//                   setScholarshipFilter(e.target.checked);
//                   setCurrentPage(1);
//                 }}
//                 className="w-4 h-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
//               />
//               <span className="text-sm font-medium text-gray-700">
//                 Scholarships Available
//               </span>
//             </label>
//           </div>
//         </div>
//       </div>

//       {/* Universities Grid */}
//       <div className="container mx-auto px-4 py-10">
//         {currentUniversities.length > 0 ? (
//           <>
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//               {currentUniversities.map((uni) => (
//                 <div
//                   key={uni.id}
//                   className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group border border-gray-100"
//                 >
//                   {/* Image */}
//                   <div className="relative h-56 overflow-hidden">
//                     <img
//                       src={uni.image}
//                       alt={uni.schoolName}
//                       className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
//                     />
//                     <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

//                     {/* Badges */}
//                     <div className="absolute top-3 left-3">
//                       <div className="flex items-center gap-1 bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold">
//                         <MdSchool className="w-3 h-3" />
//                         {uni.ranking}
//                       </div>
//                     </div>

//                     {uni.scholarshipAvailable && (
//                       <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
//                         <MdCheckCircle className="inline w-3 h-3 mr-1" />
//                         Scholarship
//                       </div>
//                     )}

//                     {/* School Name */}
//                     <div className="absolute bottom-3 left-3 right-3">
//                       <h3 className="text-white font-bold text-lg drop-shadow-lg line-clamp-2">
//                         {uni.schoolName}
//                       </h3>
//                     </div>
//                   </div>

//                   {/* Content */}
//                   <div className="p-5">
//                     {/* Location */}
//                     <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
//                       <MdLocationOn className="w-4 h-4 text-cyan-600" />
//                       <span>
//                         {uni.city}, {uni.country}
//                       </span>
//                     </div>

//                     {/* Deadline */}
//                     <div className="flex items-center gap-2 text-sm mb-3">
//                       <MdCalendarToday className="w-4 h-4 text-orange-500" />
//                       <span className="text-gray-700">
//                         <span className="font-semibold">Deadline:</span>{" "}
//                         {uni.applicationDeadline}
//                       </span>
//                     </div>

//                     {/* Description */}
//                     <p className="text-xs text-gray-600 mb-3 line-clamp-2">
//                       {uni.description}
//                     </p>

//                     {/* Programs */}
//                     <div className="mb-4">
//                       <p className="text-xs text-gray-500 mb-2 font-semibold">
//                         Popular Programs:
//                       </p>
//                       <div className="flex flex-wrap gap-1">
//                         {uni.programs.slice(0, 3).map((program, index) => (
//                           <span
//                             key={index}
//                             className="inline-block bg-cyan-50 text-cyan-700 px-2 py-1 rounded text-xs font-medium"
//                           >
//                             {program}
//                           </span>
//                         ))}
//                       </div>
//                     </div>

//                     {/* Stats */}
//                     <div className="grid grid-cols-2 gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
//                       <div>
//                         <p className="text-xs text-gray-500">Acceptance</p>
//                         <p className="text-sm font-bold text-gray-900">
//                           {uni.acceptanceRate}
//                         </p>
//                       </div>
//                       <div>
//                         <p className="text-xs text-gray-500">App Fee</p>
//                         <p className="text-sm font-bold text-gray-900">
//                           {formatPrice(
//                             convertCurrency(uni.applicationFee, uni.currency)
//                           )}
//                         </p>
//                       </div>
//                     </div>

//                     {/* Action Buttons */}
//                     <div className="flex gap-2">
//                       <Link
//                         to={`/university/${uni.id}`}
//                         className="flex-1 border-2 border-cyan-600 text-cyan-600 py-2 rounded-lg hover:bg-cyan-50 transition font-semibold text-center text-sm"
//                       >
//                         Details
//                       </Link>
//                       <button
//                         onClick={() => handleApplyNow(uni.id, uni.schoolName)}
//                         className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 text-white py-2 rounded-lg font-semibold hover:from-cyan-700 hover:to-blue-700 transition shadow-md hover:shadow-lg text-sm"
//                       >
//                         Apply Now
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>

//             {/* Pagination */}
//             {totalPages > 1 && (
//               <div className="mt-12 flex items-center justify-center gap-2">
//                 <button
//                   onClick={() => handlePageChange(currentPage - 1)}
//                   disabled={currentPage === 1}
//                   className={`flex items-center gap-1 px-4 py-2 rounded-lg font-medium transition ${
//                     currentPage === 1
//                       ? "bg-gray-100 text-gray-400 cursor-not-allowed"
//                       : "bg-white border border-gray-300 text-gray-700 hover:bg-cyan-50 hover:border-cyan-600 hover:text-cyan-600"
//                   }`}
//                 >
//                   <MdChevronLeft className="w-5 h-5" />
//                   <span className="hidden sm:inline">Previous</span>
//                 </button>

//                 <div className="flex items-center gap-1">
//                   {Array.from({ length: totalPages }, (_, i) => i + 1).map(
//                     (pageNumber) => {
//                       const showPage =
//                         pageNumber === 1 ||
//                         pageNumber === totalPages ||
//                         (pageNumber >= currentPage - 1 &&
//                           pageNumber <= currentPage + 1);

//                       if (!showPage) {
//                         if (
//                           pageNumber === currentPage - 2 ||
//                           pageNumber === currentPage + 2
//                         ) {
//                           return (
//                             <span
//                               key={pageNumber}
//                               className="px-2 text-gray-400"
//                             >
//                               ...
//                             </span>
//                           );
//                         }
//                         return null;
//                       }

//                       return (
//                         <button
//                           key={pageNumber}
//                           onClick={() => handlePageChange(pageNumber)}
//                           className={`w-10 h-10 rounded-lg font-medium transition ${
//                             currentPage === pageNumber
//                               ? "bg-cyan-600 text-white shadow-md"
//                               : "bg-white border border-gray-300 text-gray-700 hover:bg-cyan-50 hover:border-cyan-600 hover:text-cyan-600"
//                           }`}
//                         >
//                           {pageNumber}
//                         </button>
//                       );
//                     }
//                   )}
//                 </div>

//                 <button
//                   onClick={() => handlePageChange(currentPage + 1)}
//                   disabled={currentPage === totalPages}
//                   className={`flex items-center gap-1 px-4 py-2 rounded-lg font-medium transition ${
//                     currentPage === totalPages
//                       ? "bg-gray-100 text-gray-400 cursor-not-allowed"
//                       : "bg-white border border-gray-300 text-gray-700 hover:bg-cyan-50 hover:border-cyan-600 hover:text-cyan-600"
//                   }`}
//                 >
//                   <span className="hidden sm:inline">Next</span>
//                   <MdChevronRight className="w-5 h-5" />
//                 </button>
//               </div>
//             )}
//           </>
//         ) : (
//           <div className="text-center py-16">
//             <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
//               <MdSchool className="w-10 h-10 text-gray-400" />
//             </div>
//             <h3 className="text-xl font-semibold text-gray-900 mb-2">
//               No universities found
//             </h3>
//             <p className="text-gray-600">
//               Try adjusting your search or filters to find more universities.
//             </p>
//           </div>
//         )}

//         {/* CTA Section */}
//         <div className="mt-16">
//           <div className="bg-gradient-to-br from-cyan-600 via-blue-600 to-indigo-700 rounded-3xl p-8 md:p-12 text-white shadow-2xl overflow-hidden relative">
//             <div className="absolute inset-0 opacity-10">
//               <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
//               <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full translate-y-1/2 -translate-x-1/2"></div>
//             </div>

//             <div className="relative z-10">
//               <div className="text-center max-w-3xl mx-auto">
//                 <h2 className="text-3xl md:text-4xl font-bold mb-4">
//                   Ready to Start Your Journey?
//                 </h2>
//                 <p className="text-cyan-100 mb-8 text-lg">
//                   Need help choosing the right university? Our education
//                   consultants are here to guide you through the application
//                   process.
//                 </p>
//                 <div className="flex flex-col sm:flex-row gap-4 justify-center">
//                   <Link
//                     to="/support/contact"
//                     className="bg-white text-cyan-600 px-8 py-4 rounded-xl font-bold hover:bg-gray-100 transition shadow-lg hover:shadow-xl text-lg"
//                   >
//                     Get Free Consultation
//                   </Link>
//                   <Link
//                     to="/flights"
//                     className="border-2 border-white text-white px-8 py-4 rounded-xl font-bold hover:bg-white hover:text-cyan-600 transition shadow-lg text-lg"
//                   >
//                     Book Your Flight
//                   </Link>
//                 </div>
//               </div>

//               {/* Stats */}
//               <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 pt-8 border-t border-white/20">
//                 <div className="text-center">
//                   <div className="text-3xl md:text-4xl font-bold mb-1">
//                     100+
//                   </div>
//                   <div className="text-cyan-100 text-sm">Universities</div>
//                 </div>
//                 <div className="text-center">
//                   <div className="text-3xl md:text-4xl font-bold mb-1">50+</div>
//                   <div className="text-cyan-100 text-sm">Countries</div>
//                 </div>
//                 <div className="text-center">
//                   <div className="text-3xl md:text-4xl font-bold mb-1">
//                     10K+
//                   </div>
//                   <div className="text-cyan-100 text-sm">Students Helped</div>
//                 </div>
//                 <div className="text-center">
//                   <div className="text-3xl md:text-4xl font-bold mb-1">95%</div>
//                   <div className="text-cyan-100 text-sm">Success Rate</div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Application Modal */}
//       <ApplicationModal
//         isOpen={isModalOpen}
//         onClose={handleCloseModal}
//         university={selectedUniversity}
//       />
//     </div>
//   );
// };

// export default UniversitiesPage;

// src/pages/UniversitiesPage.tsx
import React, { useState } from "react";
import {
  MdHome,
  MdSchool,
  MdLocationOn,
  MdCalendarToday,
  MdCheckCircle,
  MdChevronLeft,
  MdChevronRight,
  MdSearch,
  MdChevronRight as ChevronRightIcon,
} from "react-icons/md";
import { Link } from "react-router-dom";
import { useLocalization } from "../contexts/LocalizationContext";
import ApplicationModal from "../components/ApplicationModal";

interface University {
  id: string;
  schoolName: string;
  city: string;
  country: string;
  region: string;
  image: string;
  applicationDeadline: string;
  programs: string[];
  scholarshipAvailable: boolean;
  applicationFee: number;
  currency: string;
  acceptanceRate: string;
  ranking: string;
  description: string;
  establishedYear: number;
  totalStudents: number;
  internationalStudents: number;
}

const universities: University[] = [
  {
    id: "1",
    schoolName: "University of London",
    city: "London",
    country: "United Kingdom",
    region: "Europe",
    image:
      "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&h=400&fit=crop",
    applicationDeadline: "31st March 2026",
    programs: [
      "Business Administration",
      "Engineering",
      "Medicine",
      "Law",
      "Computer Science",
    ],
    scholarshipAvailable: true,
    applicationFee: 150,
    currency: "GHS",
    acceptanceRate: "75%",
    ranking: "Top 50 UK",
    description:
      "A prestigious institution offering world-class education with state-of-the-art facilities and renowned faculty members.",
    establishedYear: 1836,
    totalStudents: 45000,
    internationalStudents: 15000,
  },
  {
    id: "2",
    schoolName: "Columbia University",
    city: "New York",
    country: "United States",
    region: "America",
    image:
      "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600&h=400&fit=crop",
    applicationDeadline: "15th April 2026",
    programs: [
      "Computer Science",
      "Business",
      "Law",
      "Medicine",
      "Engineering",
    ],
    scholarshipAvailable: true,
    applicationFee: 250,
    currency: "GHS",
    acceptanceRate: "65%",
    ranking: "Ivy League",
    description:
      "An Ivy League institution known for academic excellence, research innovation, and producing global leaders.",
    establishedYear: 1754,
    totalStudents: 33000,
    internationalStudents: 12000,
  },
  {
    id: "3",
    schoolName: "University of Toronto",
    city: "Toronto",
    country: "Canada",
    region: "America",
    image:
      "https://images.unsplash.com/photo-1517935706615-2717063c2225?w=600&h=400&fit=crop",
    applicationDeadline: "20th May 2026",
    programs: [
      "Engineering",
      "Health Sciences",
      "Arts",
      "Business",
      "Technology",
    ],
    scholarshipAvailable: true,
    applicationFee: 200,
    currency: "GHS",
    acceptanceRate: "80%",
    ranking: "Top 20 Canada",
    description:
      "Canada's leading research university offering diverse programs and excellent career opportunities.",
    establishedYear: 1827,
    totalStudents: 92000,
    internationalStudents: 25000,
  },
  {
    id: "4",
    schoolName: "Technical University of Berlin",
    city: "Berlin",
    country: "Germany",
    region: "Europe",
    image:
      "https://images.unsplash.com/photo-1560969184-10fe8719e047?w=600&h=400&fit=crop",
    applicationDeadline: "15th June 2026",
    programs: [
      "Engineering",
      "Technology",
      "Architecture",
      "Computer Science",
      "Mathematics",
    ],
    scholarshipAvailable: true,
    applicationFee: 100,
    currency: "GHS",
    acceptanceRate: "70%",
    ranking: "Top 10 Germany",
    description:
      "Leading technical university with cutting-edge research facilities and strong industry connections.",
    establishedYear: 1879,
    totalStudents: 35000,
    internationalStudents: 8000,
  },
  {
    id: "5",
    schoolName: "Moscow State University",
    city: "Moscow",
    country: "Russia",
    region: "Europe",
    image:
      "https://images.unsplash.com/photo-1513326738677-b964603b136d?w=600&h=400&fit=crop",
    applicationDeadline: "30th April 2026",
    programs: ["Medicine", "Science", "Mathematics", "Physics", "Chemistry"],
    scholarshipAvailable: true,
    applicationFee: 120,
    currency: "GHS",
    acceptanceRate: "72%",
    ranking: "Top 5 Russia",
    description:
      "Russia's oldest and most prestigious university with a strong focus on scientific research.",
    establishedYear: 1755,
    totalStudents: 47000,
    internationalStudents: 11000,
  },
  {
    id: "6",
    schoolName: "Sorbonne University",
    city: "Paris",
    country: "France",
    region: "Europe",
    image:
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&h=400&fit=crop",
    applicationDeadline: "10th May 2026",
    programs: ["Arts", "Humanities", "Science", "Medicine", "Law"],
    scholarshipAvailable: true,
    applicationFee: 180,
    currency: "GHS",
    acceptanceRate: "68%",
    ranking: "Top 3 France",
    description:
      "Historic university in the heart of Paris, renowned for arts, humanities, and scientific excellence.",
    establishedYear: 1257,
    totalStudents: 55000,
    internationalStudents: 10000,
  },
  {
    id: "7",
    schoolName: "American University of Dubai",
    city: "Dubai",
    country: "UAE",
    region: "Middle East",
    image:
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&h=400&fit=crop",
    applicationDeadline: "25th March 2026",
    programs: ["Business", "Engineering", "Media", "Architecture", "Design"],
    scholarshipAvailable: false,
    applicationFee: 220,
    currency: "GHS",
    acceptanceRate: "82%",
    ranking: "Top 5 UAE",
    description:
      "Modern university offering American-style education in the vibrant city of Dubai.",
    establishedYear: 1995,
    totalStudents: 2500,
    internationalStudents: 2000,
  },
  {
    id: "8",
    schoolName: "University of Amsterdam",
    city: "Amsterdam",
    country: "Netherlands",
    region: "Europe",
    image:
      "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=600&h=400&fit=crop",
    applicationDeadline: "1st June 2026",
    programs: ["Social Sciences", "Economics", "Law", "Business", "Psychology"],
    scholarshipAvailable: true,
    applicationFee: 160,
    currency: "GHS",
    acceptanceRate: "76%",
    ranking: "Top 100 Global",
    description:
      "Leading European research university with a strong international orientation and liberal atmosphere.",
    establishedYear: 1632,
    totalStudents: 41000,
    internationalStudents: 6000,
  },
  {
    id: "9",
    schoolName: "ETH Zurich",
    city: "Zurich",
    country: "Switzerland",
    region: "Europe",
    image:
      "https://images.unsplash.com/photo-1527866959252-deab85ef7d1b?w=600&h=400&fit=crop",
    applicationDeadline: "15th May 2026",
    programs: [
      "Engineering",
      "Natural Sciences",
      "Mathematics",
      "Computer Science",
      "Architecture",
    ],
    scholarshipAvailable: true,
    applicationFee: 140,
    currency: "GHS",
    acceptanceRate: "62%",
    ranking: "Top 10 Global",
    description:
      "World-renowned science and technology university, consistently ranked among the best globally.",
    establishedYear: 1855,
    totalStudents: 23000,
    internationalStudents: 9000,
  },
  {
    id: "10",
    schoolName: "University of Melbourne",
    city: "Melbourne",
    country: "Australia",
    region: "Oceania",
    image:
      "https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=600&h=400&fit=crop",
    applicationDeadline: "10th April 2026",
    programs: ["Medicine", "Engineering", "Business", "Law", "Arts"],
    scholarshipAvailable: true,
    applicationFee: 190,
    currency: "GHS",
    acceptanceRate: "73%",
    ranking: "Top 1 Australia",
    description:
      "Australia's leading university offering exceptional education and research opportunities.",
    establishedYear: 1853,
    totalStudents: 50000,
    internationalStudents: 18000,
  },
  {
    id: "11",
    schoolName: "National University of Singapore",
    city: "Singapore",
    country: "Singapore",
    region: "Asia",
    image:
      "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=600&h=400&fit=crop",
    applicationDeadline: "20th March 2026",
    programs: ["Engineering", "Business", "Computing", "Science", "Medicine"],
    scholarshipAvailable: true,
    applicationFee: 170,
    currency: "GHS",
    acceptanceRate: "69%",
    ranking: "Top 1 Asia",
    description:
      "Asia's premier university with cutting-edge research and strong industry partnerships.",
    establishedYear: 1905,
    totalStudents: 40000,
    internationalStudents: 13000,
  },
  {
    id: "12",
    schoolName: "McGill University",
    city: "Montreal",
    country: "Canada",
    region: "America",
    image:
      "https://images.unsplash.com/photo-1571846080032-e94c7e5a9e84?w=600&h=400&fit=crop",
    applicationDeadline: "5th May 2026",
    programs: ["Medicine", "Law", "Engineering", "Science", "Arts"],
    scholarshipAvailable: true,
    applicationFee: 185,
    currency: "GHS",
    acceptanceRate: "74%",
    ranking: "Top 5 Canada",
    description:
      "Canada's most international university with a rich history of academic excellence.",
    establishedYear: 1821,
    totalStudents: 40000,
    internationalStudents: 12000,
  },
];

const regions = ["All", "Europe", "America", "Middle East", "Asia", "Oceania"];

const UniversitiesPage: React.FC = () => {
  const { convertCurrency, formatPrice } = useLocalization();
  const [activeRegion, setActiveRegion] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [scholarshipFilter, setScholarshipFilter] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedUniversity, setSelectedUniversity] = useState<{
    id: string;
    schoolName: string;
  } | null>(null);
  const universitiesPerPage = 8;

  // Filter universities
  const filteredUniversities = universities.filter((uni) => {
    const matchesRegion = activeRegion === "All" || uni.region === activeRegion;
    const matchesSearch =
      uni.schoolName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      uni.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      uni.country.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesScholarship = !scholarshipFilter || uni.scholarshipAvailable;

    return matchesRegion && matchesSearch && matchesScholarship;
  });

  // Pagination
  const totalPages = Math.ceil(
    filteredUniversities.length / universitiesPerPage
  );
  const indexOfLastUni = currentPage * universitiesPerPage;
  const indexOfFirstUni = indexOfLastUni - universitiesPerPage;
  const currentUniversities = filteredUniversities.slice(
    indexOfFirstUni,
    indexOfLastUni
  );

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRegionChange = (region: string) => {
    setActiveRegion(region);
    setCurrentPage(1);
  };

  const handleApplyNow = (universityId: string, universityName: string) => {
    setSelectedUniversity({ id: universityId, schoolName: universityName });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedUniversity(null), 300);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header Section */}
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
            <ChevronRightIcon className="w-4 h-4 text-gray-400" />
            <div className="flex items-center gap-1.5 text-gray-900 font-medium">
              <MdSchool className="w-4 h-4 text-cyan-600" />
              <span>Study Abroad</span>
            </div>
          </nav>

          {/* Title */}
          <div className="mb-6">
            <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
              Study Abroad Opportunities
            </h1>
            <p className="text-gray-600 mt-1 text-sm md:text-base">
              Discover top universities accepting applications worldwide
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col gap-4">
            {/* Region Filter - Horizontal Scroll on Mobile */}
            <div className="relative -mx-4 px-4 md:mx-0 md:px-0">
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-gray-700 whitespace-nowrap flex-shrink-0">
                  Region:
                </span>
                <div className="overflow-x-auto scrollbar-hide flex-1">
                  <div className="flex gap-2 pb-2 min-w-min">
                    {regions.map((region) => (
                      <button
                        key={region}
                        onClick={() => handleRegionChange(region)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 whitespace-nowrap flex-shrink-0 ${
                          activeRegion === region
                            ? "bg-cyan-600 text-white shadow-lg shadow-cyan-200"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {region}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Scroll Indicator - Mobile Only */}
              <div className="md:hidden absolute right-0 top-0 bottom-2 w-12 bg-gradient-to-l from-white via-white to-transparent pointer-events-none" />
            </div>

            {/* Scholarship Filter */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={scholarshipFilter}
                onChange={(e) => {
                  setScholarshipFilter(e.target.checked);
                  setCurrentPage(1);
                }}
                className="w-4 h-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Scholarships Available
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Universities Grid */}
      <div className="container mx-auto px-4 py-10">
        {currentUniversities.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {currentUniversities.map((uni) => (
                <div
                  key={uni.id}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group border border-gray-100"
                >
                  {/* Image */}
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={uni.image}
                      alt={uni.schoolName}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

                    {/* Badges */}
                    <div className="absolute top-3 left-3">
                      <div className="flex items-center gap-1 bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                        <MdSchool className="w-3 h-3" />
                        {uni.ranking}
                      </div>
                    </div>

                    {uni.scholarshipAvailable && (
                      <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                        <MdCheckCircle className="inline w-3 h-3 mr-1" />
                        Scholarship
                      </div>
                    )}

                    {/* School Name */}
                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="text-white font-bold text-lg drop-shadow-lg line-clamp-2">
                        {uni.schoolName}
                      </h3>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    {/* Location */}
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                      <MdLocationOn className="w-4 h-4 text-cyan-600" />
                      <span>
                        {uni.city}, {uni.country}
                      </span>
                    </div>

                    {/* Deadline */}
                    <div className="flex items-center gap-2 text-sm mb-3">
                      <MdCalendarToday className="w-4 h-4 text-orange-500" />
                      <span className="text-gray-700">
                        <span className="font-semibold">Deadline:</span>{" "}
                        {uni.applicationDeadline}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                      {uni.description}
                    </p>

                    {/* Programs */}
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-2 font-semibold">
                        Popular Programs:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {uni.programs.slice(0, 3).map((program, index) => (
                          <span
                            key={index}
                            className="inline-block bg-cyan-50 text-cyan-700 px-2 py-1 rounded text-xs font-medium"
                          >
                            {program}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-xs text-gray-500">Acceptance</p>
                        <p className="text-sm font-bold text-gray-900">
                          {uni.acceptanceRate}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">App Fee</p>
                        <p className="text-sm font-bold text-gray-900">
                          {formatPrice(
                            convertCurrency(uni.applicationFee, uni.currency)
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Link
                        to={`/university/${uni.id}`}
                        className="flex-1 border-2 border-cyan-600 text-cyan-600 py-2 rounded-lg hover:bg-cyan-50 transition font-semibold text-center text-sm"
                      >
                        Details
                      </Link>
                      <button
                        onClick={() => handleApplyNow(uni.id, uni.schoolName)}
                        className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 text-white py-2 rounded-lg font-semibold hover:from-cyan-700 hover:to-blue-700 transition shadow-md hover:shadow-lg text-sm"
                      >
                        Apply Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`flex items-center gap-1 px-4 py-2 rounded-lg font-medium transition ${
                    currentPage === 1
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white border border-gray-300 text-gray-700 hover:bg-cyan-50 hover:border-cyan-600 hover:text-cyan-600"
                  }`}
                >
                  <MdChevronLeft className="w-5 h-5" />
                  <span className="hidden sm:inline">Previous</span>
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (pageNumber) => {
                      const showPage =
                        pageNumber === 1 ||
                        pageNumber === totalPages ||
                        (pageNumber >= currentPage - 1 &&
                          pageNumber <= currentPage + 1);

                      if (!showPage) {
                        if (
                          pageNumber === currentPage - 2 ||
                          pageNumber === currentPage + 2
                        ) {
                          return (
                            <span
                              key={pageNumber}
                              className="px-2 text-gray-400"
                            >
                              ...
                            </span>
                          );
                        }
                        return null;
                      }

                      return (
                        <button
                          key={pageNumber}
                          onClick={() => handlePageChange(pageNumber)}
                          className={`w-10 h-10 rounded-lg font-medium transition ${
                            currentPage === pageNumber
                              ? "bg-cyan-600 text-white shadow-md"
                              : "bg-white border border-gray-300 text-gray-700 hover:bg-cyan-50 hover:border-cyan-600 hover:text-cyan-600"
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    }
                  )}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`flex items-center gap-1 px-4 py-2 rounded-lg font-medium transition ${
                    currentPage === totalPages
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white border border-gray-300 text-gray-700 hover:bg-cyan-50 hover:border-cyan-600 hover:text-cyan-600"
                  }`}
                >
                  <span className="hidden sm:inline">Next</span>
                  <MdChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
              <MdSchool className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No universities found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search or filters to find more universities.
            </p>
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-16">
          <div className="bg-gradient-to-br from-cyan-600 via-blue-600 to-indigo-700 rounded-3xl p-8 md:p-12 text-white shadow-2xl overflow-hidden relative">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full translate-y-1/2 -translate-x-1/2"></div>
            </div>

            <div className="relative z-10">
              <div className="text-center max-w-3xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Ready to Start Your Journey?
                </h2>
                <p className="text-cyan-100 mb-8 text-lg">
                  Need help choosing the right university? Our education
                  consultants are here to guide you through the application
                  process.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    to="/support/contact"
                    className="bg-white text-cyan-600 px-8 py-4 rounded-xl font-bold hover:bg-gray-100 transition shadow-lg hover:shadow-xl text-lg"
                  >
                    Get Free Consultation
                  </Link>
                  <Link
                    to="/flights"
                    className="border-2 border-white text-white px-8 py-4 rounded-xl font-bold hover:bg-white hover:text-cyan-600 transition shadow-lg text-lg"
                  >
                    Book Your Flight
                  </Link>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 pt-8 border-t border-white/20">
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold mb-1">
                    100+
                  </div>
                  <div className="text-cyan-100 text-sm">Universities</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold mb-1">50+</div>
                  <div className="text-cyan-100 text-sm">Countries</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold mb-1">
                    10K+
                  </div>
                  <div className="text-cyan-100 text-sm">Students Helped</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold mb-1">95%</div>
                  <div className="text-cyan-100 text-sm">Success Rate</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Application Modal */}
      <ApplicationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        university={selectedUniversity}
      />
    </div>
  );
};

export default UniversitiesPage;
