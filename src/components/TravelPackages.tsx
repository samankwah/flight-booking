// // src/components/TravelPackages.tsx
// import React, { useState } from "react";
// import {
//   MdChevronRight,
//   MdLocationOn,
//   MdCalendarToday,
//   MdSchool,
//   MdCheckCircle,
// } from "react-icons/md";
// import { Link } from "react-router-dom";
// import { useLocalization } from "../contexts/LocalizationContext";
// import ApplicationModal from "./ApplicationModal";

// interface UniversityAd {
//   id: string;
//   schoolName: string;
//   city: string;
//   country: string;
//   region: string;
//   image: string;
//   logo?: string;
//   applicationDeadline: string;
//   programs: string[];
//   scholarshipAvailable: boolean;
//   applicationFee: number;
//   currency: string;
//   acceptanceRate: string;
//   ranking?: string;
// }

// const universities: UniversityAd[] = [
//   {
//     id: "1",
//     schoolName: "University of London",
//     city: "London",
//     country: "United Kingdom",
//     region: "Europe",
//     image:
//       "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&h=400&fit=crop",
//     applicationDeadline: "31st March 2026",
//     programs: ["Business", "Engineering", "Medicine"],
//     scholarshipAvailable: true,
//     applicationFee: 150,
//     currency: "GHS",
//     acceptanceRate: "75%",
//     ranking: "Top 50 UK",
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
//     programs: ["Computer Science", "Business", "Law"],
//     scholarshipAvailable: true,
//     applicationFee: 250,
//     currency: "GHS",
//     acceptanceRate: "65%",
//     ranking: "Ivy League",
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
//     programs: ["Engineering", "Health Sciences", "Arts"],
//     scholarshipAvailable: true,
//     applicationFee: 200,
//     currency: "GHS",
//     acceptanceRate: "80%",
//     ranking: "Top 20 Canada",
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
//     programs: ["Engineering", "Technology", "Architecture"],
//     scholarshipAvailable: true,
//     applicationFee: 100,
//     currency: "GHS",
//     acceptanceRate: "70%",
//     ranking: "Top 10 Germany",
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
//     programs: ["Medicine", "Science", "Mathematics"],
//     scholarshipAvailable: true,
//     applicationFee: 120,
//     currency: "GHS",
//     acceptanceRate: "72%",
//     ranking: "Top 5 Russia",
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
//     programs: ["Arts", "Humanities", "Science"],
//     scholarshipAvailable: true,
//     applicationFee: 180,
//     currency: "GHS",
//     acceptanceRate: "68%",
//     ranking: "Top 3 France",
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
//     programs: ["Business", "Engineering", "Media"],
//     scholarshipAvailable: false,
//     applicationFee: 220,
//     currency: "GHS",
//     acceptanceRate: "82%",
//     ranking: "Top 5 UAE",
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
//     programs: ["Social Sciences", "Economics", "Law"],
//     scholarshipAvailable: true,
//     applicationFee: 160,
//     currency: "GHS",
//     acceptanceRate: "76%",
//     ranking: "Top 100 Global",
//   },
// ];

// const regions = ["All", "Europe", "America", "Middle East"];

// const TravelPackages: React.FC = () => {
//   const { convertCurrency, formatPrice } = useLocalization();
//   const [activeRegion, setActiveRegion] = useState("All");
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [selectedUniversity, setSelectedUniversity] = useState<{ id: string; schoolName: string } | null>(null);

//   const filteredUniversities =
//     activeRegion === "All"
//       ? universities
//       : universities.filter((uni) => uni.region === activeRegion);

//   const handleApplyNow = (universityId: string, universityName: string) => {
//     setSelectedUniversity({ id: universityId, schoolName: universityName });
//     setIsModalOpen(true);
//   };

//   const handleCloseModal = () => {
//     setIsModalOpen(false);
//     setTimeout(() => setSelectedUniversity(null), 300);
//   };

//   return (
//     <section className="py-16 bg-gradient-to-b from-white to-gray-50">
//       <div className="container mx-auto px-4">
//         {/* Header */}
//         <div className="mb-10">
//           <div className="flex justify-between items-start mb-6">
//             <div>
//               <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2">
//                 Study Abroad Opportunities
//               </h2>
//               <p className="text-gray-600">
//                 Top universities accepting international applications now
//               </p>
//             </div>
//             <Link
//               to="/universities"
//               className="text-cyan-600 font-semibold hover:text-cyan-700 transition flex items-center gap-1 group"
//             >
//               View all
//               <MdChevronRight className="w-5 h-5 group-hover:translate-x-1 transition" />
//             </Link>
//           </div>

//           {/* Region Tabs */}
//           <div className="flex flex-wrap gap-4 md:gap-4">
//             {regions.map((region) => (
//               <button
//                 key={region}
//                 onClick={() => setActiveRegion(region)}
//                 className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 ${
//                   activeRegion === region
//                     ? "bg-cyan-400 text-white shadow-md"
//                     : "bg-gray-100 text-gray-600 hover:bg-gray-200"
//                 }`}
//               >
//                 {region}
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* Universities Grid */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//           {filteredUniversities.slice(0, 8).map((uni) => (
//             <div
//               key={uni.id}
//               className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group cursor-pointer"
//             >
//               {/* Image */}
//               <div className="relative h-56 overflow-hidden">
//                 <img
//                   src={uni.image}
//                   alt={uni.schoolName}
//                   className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
//                 />
//                 <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

//                 {/* Badges */}
//                 <div className="absolute top-3 left-3 flex flex-col gap-2">
//                   <div className="flex items-center gap-1 bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold">
//                     <MdSchool className="w-3 h-3" />
//                     {uni.ranking}
//                   </div>
//                 </div>

//                 {uni.scholarshipAvailable && (
//                   <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
//                     <MdCheckCircle className="inline w-3 h-3 mr-1" />
//                     Scholarship
//                   </div>
//                 )}

//                 {/* School Name Overlay */}
//                 <div className="absolute bottom-3 left-3 right-3">
//                   <h3 className="text-white font-bold text-lg drop-shadow-lg line-clamp-2">
//                     {uni.schoolName}
//                   </h3>
//                 </div>
//               </div>

//               {/* Content */}
//               <div className="p-5">
//                 {/* Location */}
//                 <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
//                   <MdLocationOn className="w-4 h-4 text-cyan-600" />
//                   <span>
//                     {uni.city}, {uni.country}
//                   </span>
//                 </div>

//                 {/* Application Deadline */}
//                 <div className="flex items-center gap-2 text-sm mb-3">
//                   <MdCalendarToday className="w-4 h-4 text-orange-500" />
//                   <span className="text-gray-700">
//                     <span className="font-semibold">Deadline:</span>{" "}
//                     {uni.applicationDeadline}
//                   </span>
//                 </div>

//                 {/* Programs */}
//                 <div className="mb-4">
//                   <p className="text-xs text-gray-500 mb-2 font-semibold">
//                     Popular Programs:
//                   </p>
//                   <div className="flex flex-wrap gap-1">
//                     {uni.programs.slice(0, 3).map((program, index) => (
//                       <span
//                         key={index}
//                         className="inline-block bg-cyan-50 text-cyan-700 px-2 py-1 rounded text-xs font-medium"
//                       >
//                         {program}
//                       </span>
//                     ))}
//                   </div>
//                 </div>

//                 {/* Stats */}
//                 <div className="grid grid-cols-2 gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
//                   <div>
//                     <p className="text-xs text-gray-500">Acceptance</p>
//                     <p className="text-sm font-bold text-gray-900">
//                       {uni.acceptanceRate}
//                     </p>
//                   </div>
//                   <div>
//                     <p className="text-xs text-gray-500">App Fee</p>
//                     <p className="text-sm font-bold text-gray-900">
//                       {formatPrice(convertCurrency(uni.applicationFee, uni.currency))}
//                     </p>
//                   </div>
//                 </div>

//                 {/* Apply Button */}
//                 <button
//                   onClick={() => handleApplyNow(uni.id, uni.schoolName)}
//                   className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white py-2.5 rounded-lg font-semibold hover:from-cyan-700 hover:to-blue-700 transition shadow-md hover:shadow-lg"
//                 >
//                   Apply Now
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* View More Button */}
//         {/* <div className="text-center mt-12">
//           <Link
//             to="/universities"
//             className="inline-block bg-green-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-green-700 transition shadow-lg hover:shadow-xl"
//           >
//             View All Universities
//           </Link>
//         </div> */}
//       </div>

//       {/* Application Modal */}
//       <ApplicationModal
//         isOpen={isModalOpen}
//         onClose={handleCloseModal}
//         university={selectedUniversity}
//       />
//     </section>
//   );
// };

// export default TravelPackages;

// src/components/TravelPackages.tsx

import React, { useState } from "react";
import {
  MdChevronRight,
  MdLocationOn,
  MdCalendarToday,
  MdSchool,
  MdCheckCircle,
} from "react-icons/md";
import { Link } from "react-router-dom";
import { useLocalization } from "../contexts/LocalizationContext";
import ApplicationModal from "./ApplicationModal";

interface UniversityAd {
  id: string;
  schoolName: string;
  city: string;
  country: string;
  region: string;
  image: string;
  logo?: string;
  applicationDeadline: string;
  programs: string[];
  scholarshipAvailable: boolean;
  applicationFee: number;
  currency: string;
  acceptanceRate: string;
  ranking?: string;
}

const universities: UniversityAd[] = [
  {
    id: "1",
    schoolName: "University of London",
    city: "London",
    country: "United Kingdom",
    region: "Europe",
    image:
      "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&h=400&fit=crop",
    applicationDeadline: "31st March 2026",
    programs: ["Business", "Engineering", "Medicine"],
    scholarshipAvailable: true,
    applicationFee: 150,
    currency: "GHS",
    acceptanceRate: "75%",
    ranking: "Top 50 UK",
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
    programs: ["Computer Science", "Business", "Law"],
    scholarshipAvailable: true,
    applicationFee: 250,
    currency: "GHS",
    acceptanceRate: "65%",
    ranking: "Ivy League",
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
    programs: ["Engineering", "Health Sciences", "Arts"],
    scholarshipAvailable: true,
    applicationFee: 200,
    currency: "GHS",
    acceptanceRate: "80%",
    ranking: "Top 20 Canada",
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
    programs: ["Engineering", "Technology", "Architecture"],
    scholarshipAvailable: true,
    applicationFee: 100,
    currency: "GHS",
    acceptanceRate: "70%",
    ranking: "Top 10 Germany",
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
    programs: ["Medicine", "Science", "Mathematics"],
    scholarshipAvailable: true,
    applicationFee: 120,
    currency: "GHS",
    acceptanceRate: "72%",
    ranking: "Top 5 Russia",
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
    programs: ["Arts", "Humanities", "Science"],
    scholarshipAvailable: true,
    applicationFee: 180,
    currency: "GHS",
    acceptanceRate: "68%",
    ranking: "Top 3 France",
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
    programs: ["Business", "Engineering", "Media"],
    scholarshipAvailable: false,
    applicationFee: 220,
    currency: "GHS",
    acceptanceRate: "82%",
    ranking: "Top 5 UAE",
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
    programs: ["Social Sciences", "Economics", "Law"],
    scholarshipAvailable: true,
    applicationFee: 160,
    currency: "GHS",
    acceptanceRate: "76%",
    ranking: "Top 100 Global",
  },
];

const regions = ["All", "Europe", "America", "Middle East"];

const TravelPackages: React.FC = () => {
  const { convertCurrency, formatPrice } = useLocalization();
  const [activeRegion, setActiveRegion] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUniversity, setSelectedUniversity] = useState<{
    id: string;
    schoolName: string;
  } | null>(null);

  const filteredUniversities =
    activeRegion === "All"
      ? universities
      : universities.filter((uni) => uni.region === activeRegion);

  const handleApplyNow = (universityId: string, universityName: string) => {
    setSelectedUniversity({ id: universityId, schoolName: universityName });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedUniversity(null), 300);
  };

  return (
    <section className="py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-10">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2">
                Study Abroad
              </h2>
              <p className="text-gray-600">
                Top universities accepting international applications now
              </p>
            </div>
            <Link
              to="/universities"
              className="text-cyan-600 font-semibold hover:text-cyan-700 transition flex items-center gap-1 group flex-shrink-0"
            >
              View all
              <MdChevronRight className="w-5 h-5 group-hover:translate-x-1 transition" />
            </Link>
          </div>

          {/* Region Tabs - Horizontal Scroll on Mobile */}
          <div className="relative -mx-4 px-4 md:mx-0 md:px-0">
            <div className="overflow-x-auto scrollbar-hide">
              <div className="flex gap-3 md:gap-4 pb-2 min-w-min">
                {regions.map((region) => (
                  <button
                    key={region}
                    onClick={() => setActiveRegion(region)}
                    className={`px-5 md:px-6 py-2 rounded-lg font-medium transition-all duration-300 whitespace-nowrap flex-shrink-0 ${
                      activeRegion === region
                        ? "bg-cyan-400 text-white shadow-md"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {region}
                  </button>
                ))}
              </div>
            </div>

            {/* Scroll Indicator - Mobile Only */}
            <div className="md:hidden absolute right-0 top-0 bottom-2 w-12 bg-gradient-to-l from-gray-50 via-gray-50 to-transparent pointer-events-none" />
          </div>
        </div>

        {/* Universities Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredUniversities.slice(0, 8).map((uni) => (
            <div
              key={uni.id}
              className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group cursor-pointer"
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
                <div className="absolute top-3 left-3 flex flex-col gap-2">
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

                {/* School Name Overlay */}
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

                {/* Application Deadline */}
                <div className="flex items-center gap-2 text-sm mb-3">
                  <MdCalendarToday className="w-4 h-4 text-orange-500" />
                  <span className="text-gray-700">
                    <span className="font-semibold">Deadline:</span>{" "}
                    {uni.applicationDeadline}
                  </span>
                </div>

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

                {/* Apply Button */}
                <button
                  onClick={() => handleApplyNow(uni.id, uni.schoolName)}
                  className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white py-2.5 rounded-lg font-semibold hover:from-cyan-700 hover:to-blue-700 transition shadow-md hover:shadow-lg"
                >
                  Apply Now
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* View More Button */}
        {/* <div className="text-center mt-12">
          <Link
            to="/universities"
            className="inline-block bg-green-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-green-700 transition shadow-lg hover:shadow-xl"
          >
            View All Universities
          </Link>
        </div> */}
      </div>

      {/* Application Modal */}
      <ApplicationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        university={selectedUniversity}
      />
    </section>
  );
};

export default TravelPackages;
