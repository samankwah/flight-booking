// src/pages/UniversityDetailPage.tsx
import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  MdHome,
  MdSchool,
  MdLocationOn,
  MdCalendarToday,
  MdCheckCircle,
  MdPeople,
  MdPublic,
  MdStar,
  MdAttachMoney,
  MdArrowBack,
  MdChevronRight,
} from "react-icons/md";
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
      "Architecture",
    ],
    scholarshipAvailable: true,
    applicationFee: 75,
    currency: "GBP",
    acceptanceRate: "75%",
    ranking: "Top 50 UK",
    description:
      "A prestigious institution known for excellence in research and teaching",
    establishedYear: 1836,
    totalStudents: 50000,
    internationalStudents: 15000,
  },
  {
    id: "2",
    schoolName: "Columbia University",
    city: "New York",
    country: "United States",
    region: "America",
    image:
      "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=600&h=400&fit=crop",
    applicationDeadline: "15th March 2026",
    programs: [
      "Computer Science",
      "Business",
      "Engineering",
      "Journalism",
      "International Relations",
      "Medicine",
    ],
    scholarshipAvailable: true,
    applicationFee: 85,
    currency: "USD",
    acceptanceRate: "65%",
    ranking: "Ivy League",
    description:
      "An Ivy League institution with world-class faculty and research facilities",
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
      "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&h=400&fit=crop",
    applicationDeadline: "20th May 2026",
    programs: [
      "Engineering",
      "Health Sciences",
      "Arts & Humanities",
      "Life Sciences",
      "Physical Sciences",
      "Social Sciences",
    ],
    scholarshipAvailable: true,
    applicationFee: 125,
    currency: "CAD",
    acceptanceRate: "80%",
    ranking: "Top 3 Canada",
    description: "Canada's leading university with exceptional research output",
    establishedYear: 1827,
    totalStudents: 91000,
    internationalStudents: 23000,
  },
  {
    id: "4",
    schoolName: "Technical University of Berlin",
    city: "Berlin",
    country: "Germany",
    region: "Europe",
    image:
      "https://images.unsplash.com/photo-1564981797816-1043664bf78d?w=600&h=400&fit=crop",
    applicationDeadline: "15th Germany 2026",
    programs: [
      "Engineering",
      "Technology",
      "Architecture",
      "Computer Science",
      "Mathematics",
      "Physics",
    ],
    scholarshipAvailable: true,
    applicationFee: 100,
    currency: "EUR",
    acceptanceRate: "70%",
    ranking: "Top 10 Germany",
    description:
      "Leading technical university with cutting-edge research facilities",
    establishedYear: 1879,
    totalStudents: 34000,
    internationalStudents: 9000,
  },
  {
    id: "5",
    schoolName: "National University of Singapore",
    city: "Singapore",
    country: "Singapore",
    region: "Asia",
    image:
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&h=400&fit=crop",
    applicationDeadline: "30th April 2026",
    programs: [
      "Business",
      "Engineering",
      "Computing",
      "Science",
      "Law",
      "Medicine",
    ],
    scholarshipAvailable: true,
    applicationFee: 20,
    currency: "SGD",
    acceptanceRate: "85%",
    ranking: "Top 1 Asia",
    description: "Asia's leading university with global recognition",
    establishedYear: 1905,
    totalStudents: 40000,
    internationalStudents: 8000,
  },
  {
    id: "6",
    schoolName: "University of Melbourne",
    city: "Melbourne",
    country: "Australia",
    region: "Oceania",
    image:
      "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=600&h=400&fit=crop",
    applicationDeadline: "31st October 2025",
    programs: [
      "Medicine",
      "Law",
      "Business",
      "Engineering",
      "Arts",
      "Science",
    ],
    scholarshipAvailable: true,
    applicationFee: 100,
    currency: "AUD",
    acceptanceRate: "70%",
    ranking: "Top 1 Australia",
    description: "Australia's top-ranked university with excellent research",
    establishedYear: 1853,
    totalStudents: 51000,
    internationalStudents: 18000,
  },
  {
    id: "7",
    schoolName: "University of Cape Town",
    city: "Cape Town",
    country: "South Africa",
    region: "Africa",
    image:
      "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&h=400&fit=crop",
    applicationDeadline: "30th September 2025",
    programs: [
      "Health Sciences",
      "Engineering",
      "Commerce",
      "Humanities",
      "Law",
      "Science",
    ],
    scholarshipAvailable: true,
    applicationFee: 400,
    currency: "ZAR",
    acceptanceRate: "55%",
    ranking: "Top 1 Africa",
    description: "Africa's leading research institution",
    establishedYear: 1829,
    totalStudents: 29000,
    internationalStudents: 4000,
  },
  {
    id: "8",
    schoolName: "University of Tokyo",
    city: "Tokyo",
    country: "Japan",
    region: "Asia",
    image:
      "https://images.unsplash.com/photo-1492571350019-22de08371fd3?w=600&h=400&fit=crop",
    applicationDeadline: "28th February 2026",
    programs: [
      "Engineering",
      "Science",
      "Medicine",
      "Law",
      "Economics",
      "Literature",
    ],
    scholarshipAvailable: true,
    applicationFee: 30,
    currency: "JPY",
    acceptanceRate: "60%",
    ranking: "Top 1 Japan",
    description: "Japan's premier university with world-class research",
    establishedYear: 1877,
    totalStudents: 28000,
    internationalStudents: 4000,
  },
  {
    id: "9",
    schoolName: "ETH Zurich",
    city: "Zurich",
    country: "Switzerland",
    region: "Europe",
    image:
      "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=600&h=400&fit=crop",
    applicationDeadline: "15th December 2025",
    programs: [
      "Engineering",
      "Natural Sciences",
      "Mathematics",
      "Computer Science",
      "Architecture",
      "Management",
    ],
    scholarshipAvailable: true,
    applicationFee: 150,
    currency: "CHF",
    acceptanceRate: "65%",
    ranking: "Top 10 Global",
    description:
      "World-renowned for science and technology education and research",
    establishedYear: 1855,
    totalStudents: 23000,
    internationalStudents: 9000,
  },
  {
    id: "10",
    schoolName: "University of São Paulo",
    city: "São Paulo",
    country: "Brazil",
    region: "America",
    image:
      "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=600&h=400&fit=crop",
    applicationDeadline: "30th November 2025",
    programs: [
      "Medicine",
      "Law",
      "Engineering",
      "Economics",
      "Architecture",
      "Pharmacy",
    ],
    scholarshipAvailable: true,
    applicationFee: 200,
    currency: "BRL",
    acceptanceRate: "50%",
    ranking: "Top 1 Latin America",
    description: "Latin America's largest and most prestigious university",
    establishedYear: 1934,
    totalStudents: 98000,
    internationalStudents: 5000,
  },
  {
    id: "11",
    schoolName: "Seoul National University",
    city: "Seoul",
    country: "South Korea",
    region: "Asia",
    image:
      "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&h=400&fit=crop",
    applicationDeadline: "31st January 2026",
    programs: [
      "Engineering",
      "Business",
      "Medicine",
      "Law",
      "Natural Sciences",
      "Liberal Arts",
    ],
    scholarshipAvailable: true,
    applicationFee: 80,
    currency: "KRW",
    acceptanceRate: "55%",
    ranking: "Top 1 Korea",
    description: "South Korea's most prestigious university",
    establishedYear: 1946,
    totalStudents: 28000,
    internationalStudents: 4500,
  },
  {
    id: "12",
    schoolName: "University of Amsterdam",
    city: "Amsterdam",
    country: "Netherlands",
    region: "Europe",
    image:
      "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=600&h=400&fit=crop",
    applicationDeadline: "1st May 2026",
    programs: [
      "Economics & Business",
      "Law",
      "Social Sciences",
      "Science",
      "Humanities",
      "Medicine",
    ],
    scholarshipAvailable: true,
    applicationFee: 100,
    currency: "EUR",
    acceptanceRate: "72%",
    ranking: "Top 5 Netherlands",
    description: "Historic university with a strong international focus",
    establishedYear: 1632,
    totalStudents: 42000,
    internationalStudents: 6000,
  },
];

type ImageCategory = "campus" | "facilities" | "labs" | "library" | "dorms" | "sports";

interface UniversityImage {
  category: ImageCategory;
  url: string;
  title: string;
}

const UniversityDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { convertCurrency, formatPrice } = useLocalization();
  const [activeImageCategory, setActiveImageCategory] = useState<ImageCategory>("campus");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const university = universities.find((uni) => uni.id === id);

  if (!university) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <MdSchool className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">University Not Found</h2>
          <p className="text-gray-600 mb-6">The university you're looking for doesn't exist.</p>
          <Link
            to="/universities"
            className="inline-flex items-center gap-2 bg-cyan-600 text-white px-6 py-3 rounded-lg hover:bg-cyan-700 transition"
          >
            <MdArrowBack />
            Back to Universities
          </Link>
        </div>
      </div>
    );
  }

  // Mock image gallery data - in production, this would come from the backend
  const imageGallery: UniversityImage[] = [
    {
      category: "campus",
      url: university.image,
      title: "Main Campus View",
    },
    {
      category: "campus",
      url: "https://images.unsplash.com/photo-1562774053-701939374585?w=800&h=600&fit=crop",
      title: "Campus Grounds",
    },
    {
      category: "campus",
      url: "https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=800&h=600&fit=crop",
      title: "Main Building",
    },
    {
      category: "facilities",
      url: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop",
      title: "Student Center",
    },
    {
      category: "facilities",
      url: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&h=600&fit=crop",
      title: "Cafeteria",
    },
    {
      category: "facilities",
      url: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&h=600&fit=crop",
      title: "Study Spaces",
    },
    {
      category: "labs",
      url: "https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?w=800&h=600&fit=crop",
      title: "Computer Lab",
    },
    {
      category: "labs",
      url: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800&h=600&fit=crop",
      title: "Science Lab",
    },
    {
      category: "labs",
      url: "https://images.unsplash.com/photo-1576086213369-97a306d36557?w=800&h=600&fit=crop",
      title: "Research Facilities",
    },
    {
      category: "library",
      url: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800&h=600&fit=crop",
      title: "Main Library",
    },
    {
      category: "library",
      url: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=600&fit=crop",
      title: "Reading Room",
    },
    {
      category: "library",
      url: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800&h=600&fit=crop",
      title: "Study Area",
    },
    {
      category: "dorms",
      url: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&h=600&fit=crop",
      title: "Residence Hall",
    },
    {
      category: "dorms",
      url: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&h=600&fit=crop",
      title: "Student Room",
    },
    {
      category: "dorms",
      url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop",
      title: "Common Area",
    },
    {
      category: "sports",
      url: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&h=600&fit=crop",
      title: "Sports Complex",
    },
    {
      category: "sports",
      url: "https://images.unsplash.com/photo-1540747913346-19e32664f986?w=800&h=600&fit=crop",
      title: "Gym & Fitness Center",
    },
    {
      category: "sports",
      url: "https://images.unsplash.com/photo-1519505907962-0a6cb0167c73?w=800&h=600&fit=crop",
      title: "Swimming Pool",
    },
  ];

  const categories: { value: ImageCategory; label: string }[] = [
    { value: "campus", label: "Campus" },
    { value: "facilities", label: "Facilities" },
    { value: "labs", label: "Labs" },
    { value: "library", label: "Library" },
    { value: "dorms", label: "Dorms" },
    { value: "sports", label: "Sports" },
  ];

  const filteredImages = imageGallery.filter((img) => img.category === activeImageCategory);
  const [selectedImage, setSelectedImage] = useState(filteredImages[0]);

  const handleApply = () => {
    setIsModalOpen(true);
  };

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
            <Link
              to="/universities"
              className="text-gray-600 hover:text-cyan-600 transition"
            >
              Universities
            </Link>
            <MdChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-900 font-medium">{university.schoolName}</span>
          </nav>

          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-cyan-600 hover:text-cyan-700 font-medium mb-4"
          >
            <MdArrowBack className="w-5 h-5" />
            Back to Universities
          </button>

          {/* University Header */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                {university.schoolName}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-gray-600">
                <div className="flex items-center gap-1">
                  <MdLocationOn className="w-5 h-5 text-cyan-600" />
                  <span>{university.city}, {university.country}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MdStar className="w-5 h-5 text-amber-500" />
                  <span className="font-semibold">{university.ranking}</span>
                </div>
              </div>
            </div>
            <button
              onClick={handleApply}
              className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-cyan-700 hover:to-blue-700 transition shadow-lg hover:shadow-xl"
            >
              Apply Now
            </button>
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
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About {university.schoolName}</h2>
              <p className="text-gray-700 leading-relaxed mb-4">{university.description}</p>
              <p className="text-gray-700 leading-relaxed">
                Founded in {university.establishedYear}, {university.schoolName} has been at the forefront of
                education and research for over {new Date().getFullYear() - university.establishedYear} years.
                Our institution is committed to fostering academic excellence, innovation, and global citizenship.
              </p>
            </div>

            {/* Programs Offered */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Programs Offered</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {university.programs.map((program, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-gradient-to-r from-cyan-50 to-blue-50 p-3 rounded-lg border border-cyan-100"
                  >
                    <MdCheckCircle className="w-5 h-5 text-cyan-600 flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-900">{program}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Quick Info */}
          <div className="lg:col-span-1">
            {/* Key Information */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 sticky top-4">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Key Information</h3>

              <div className="space-y-4">
                {/* Application Deadline */}
                <div className="flex items-start gap-3 pb-4 border-b">
                  <MdCalendarToday className="w-5 h-5 text-orange-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Application Deadline</p>
                    <p className="font-semibold text-gray-900">{university.applicationDeadline}</p>
                  </div>
                </div>

                {/* Application Fee */}
                <div className="flex items-start gap-3 pb-4 border-b">
                  <MdAttachMoney className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Application Fee</p>
                    <p className="font-semibold text-gray-900">
                      {formatPrice(convertCurrency(university.applicationFee, university.currency))}
                    </p>
                  </div>
                </div>

                {/* Acceptance Rate */}
                <div className="flex items-start gap-3 pb-4 border-b">
                  <MdCheckCircle className="w-5 h-5 text-cyan-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Acceptance Rate</p>
                    <p className="font-semibold text-gray-900">{university.acceptanceRate}</p>
                  </div>
                </div>

                {/* Total Students */}
                <div className="flex items-start gap-3 pb-4 border-b">
                  <MdPeople className="w-5 h-5 text-purple-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Students</p>
                    <p className="font-semibold text-gray-900">{university.totalStudents.toLocaleString()}</p>
                  </div>
                </div>

                {/* International Students */}
                <div className="flex items-start gap-3 pb-4 border-b">
                  <MdPublic className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">International Students</p>
                    <p className="font-semibold text-gray-900">
                      {university.internationalStudents.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Scholarship */}
                <div className="flex items-start gap-3">
                  <MdStar className="w-5 h-5 text-amber-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Scholarships</p>
                    <p className={`font-semibold ${university.scholarshipAvailable ? "text-green-600" : "text-red-600"}`}>
                      {university.scholarshipAvailable ? "Available" : "Not Available"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Apply Button */}
              <button
                onClick={handleApply}
                className="w-full mt-6 bg-gradient-to-r from-cyan-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-cyan-700 hover:to-blue-700 transition shadow-lg hover:shadow-xl"
              >
                Apply to {university.schoolName}
              </button>
            </div>

            {/* Requirements Card */}
            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl p-6 border border-cyan-100">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Admission Requirements</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <MdCheckCircle className="w-4 h-4 text-cyan-600 mt-0.5" />
                  <span>Completed application form</span>
                </li>
                <li className="flex items-start gap-2">
                  <MdCheckCircle className="w-4 h-4 text-cyan-600 mt-0.5" />
                  <span>Academic transcripts</span>
                </li>
                <li className="flex items-start gap-2">
                  <MdCheckCircle className="w-4 h-4 text-cyan-600 mt-0.5" />
                  <span>English proficiency test scores</span>
                </li>
                <li className="flex items-start gap-2">
                  <MdCheckCircle className="w-4 h-4 text-cyan-600 mt-0.5" />
                  <span>Letters of recommendation</span>
                </li>
                <li className="flex items-start gap-2">
                  <MdCheckCircle className="w-4 h-4 text-cyan-600 mt-0.5" />
                  <span>Personal statement/essay</span>
                </li>
                <li className="flex items-start gap-2">
                  <MdCheckCircle className="w-4 h-4 text-cyan-600 mt-0.5" />
                  <span>Valid passport copy</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Application Modal */}
      <ApplicationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        university={{ id: university.id, schoolName: university.schoolName }}
      />
    </div>
  );
};

export default UniversityDetailPage;
