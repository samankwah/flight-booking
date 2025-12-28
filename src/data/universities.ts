export interface University {
  id: string;
  schoolName: string;
  city: string;
  country: string;
  region: string;
  imageUrl: string;
  applicationDeadline: string;
  programs: string[];
  scholarship: boolean;
  applicationFee: number;
  currency: string;
  acceptanceRate: string;
  ranking: string;
  description: string;
  establishedYear: number;
  totalStudents: number;
  internationalStudents: number;
  location: string;
  deadline: string;
}

const universities: University[] = [
  {
    id: "1",
    schoolName: "University of London",
    city: "London",
    country: "United Kingdom",
    region: "Europe",
    imageUrl:
      "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&h=400&fit=crop",
    applicationDeadline: "31st March 2026",
    programs: [
      "Business Administration",
      "Engineering",
      "Medicine",
      "Law",
      "Computer Science",
    ],
    scholarship: true,
    applicationFee: 150,
    currency: "GHS",
    acceptanceRate: "75%",
    ranking: "Top 50 UK",
    description:
      "A prestigious institution offering world-class education with state-of-the-art facilities and renowned faculty members.",
    establishedYear: 1836,
    totalStudents: 45000,
    internationalStudents: 15000,
    location: "London, United Kingdom",
    deadline: "31st March 2026",
  },
  {
    id: "2",
    schoolName: "Columbia University",
    city: "New York",
    country: "United States",
    region: "America",
    imageUrl:
      "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600&h=400&fit=crop",
    applicationDeadline: "15th April 2026",
    programs: [
      "Computer Science",
      "Business",
      "Law",
      "Medicine",
      "Engineering",
    ],
    scholarship: true,
    applicationFee: 250,
    currency: "GHS",
    acceptanceRate: "65%",
    ranking: "Ivy League",
    description:
      "An Ivy League institution known for academic excellence, research innovation, and producing global leaders.",
    establishedYear: 1754,
    totalStudents: 33000,
    internationalStudents: 12000,
    location: "New York, United States",
    deadline: "15th April 2026",
  },
  {
    id: "3",
    schoolName: "University of Toronto",
    city: "Toronto",
    country: "Canada",
    region: "America",
    imageUrl:
      "https://images.unsplash.com/photo-1517935706615-2717063c2225?w=600&h=400&fit=crop",
    applicationDeadline: "20th May 2026",
    programs: [
      "Engineering",
      "Health Sciences",
      "Arts",
      "Business",
      "Technology",
    ],
    scholarship: true,
    applicationFee: 200,
    currency: "GHS",
    acceptanceRate: "80%",
    ranking: "Top 20 Canada",
    description:
      "Canada's leading research university offering diverse programs and excellent career opportunities.",
    establishedYear: 1827,
    totalStudents: 92000,
    internationalStudents: 25000,
    location: "Toronto, Canada",
    deadline: "20th May 2026",
  },
  {
    id: "4",
    schoolName: "Technical University of Berlin",
    city: "Berlin",
    country: "Germany",
    region: "Europe",
    imageUrl:
      "https://images.unsplash.com/photo-1560969184-10fe8719e047?w=600&h=400&fit=crop",
    applicationDeadline: "15th June 2026",
    programs: [
      "Engineering",
      "Technology",
      "Architecture",
      "Computer Science",
      "Mathematics",
    ],
    scholarship: true,
    applicationFee: 100,
    currency: "GHS",
    acceptanceRate: "70%",
    ranking: "Top 10 Germany",
    description:
      "Leading technical university with cutting-edge research facilities and strong industry connections.",
    establishedYear: 1879,
    totalStudents: 35000,
    internationalStudents: 8000,
    location: "Berlin, Germany",
    deadline: "15th June 2026",
  },
  {
    id: "5",
    schoolName: "Moscow State University",
    city: "Moscow",
    country: "Russia",
    region: "Europe",
    imageUrl:
      "https://images.unsplash.com/photo-1513326738677-b964603b136d?w=600&h=400&fit=crop",
    applicationDeadline: "30th April 2026",
    programs: ["Medicine", "Science", "Mathematics", "Physics", "Chemistry"],
    scholarship: true,
    applicationFee: 120,
    currency: "GHS",
    acceptanceRate: "72%",
    ranking: "Top 5 Russia",
    description:
      "Russia's oldest and most prestigious university with a strong focus on scientific research.",
    establishedYear: 1755,
    totalStudents: 47000,
    internationalStudents: 11000,
    location: "Moscow, Russia",
    deadline: "30th April 2026",
  },
  {
    id: "6",
    schoolName: "Sorbonne University",
    city: "Paris",
    country: "France",
    region: "Europe",
    imageUrl:
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&h=400&fit=crop",
    applicationDeadline: "10th May 2026",
    programs: ["Arts", "Humanities", "Science", "Medicine", "Law"],
    scholarship: true,
    applicationFee: 180,
    currency: "GHS",
    acceptanceRate: "68%",
    ranking: "Top 3 France",
    description:
      "Historic university in the heart of Paris, renowned for arts, humanities, and scientific excellence.",
    establishedYear: 1257,
    totalStudents: 55000,
    internationalStudents: 10000,
    location: "Paris, France",
    deadline: "10th May 2026",
  },
  {
    id: "7",
    schoolName: "American University of Dubai",
    city: "Dubai",
    country: "UAE",
    region: "Middle East",
    imageUrl:
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&h=400&fit=crop",
    applicationDeadline: "25th March 2026",
    programs: ["Business", "Engineering", "Media", "Architecture", "Design"],
    scholarship: false,
    applicationFee: 220,
    currency: "GHS",
    acceptanceRate: "82%",
    ranking: "Top 5 UAE",
    description:
      "Modern university offering American-style education in the vibrant city of Dubai.",
    establishedYear: 1995,
    totalStudents: 2500,
    internationalStudents: 2000,
    location: "Dubai, UAE",
    deadline: "25th March 2026",
  },
  {
    id: "8",
    schoolName: "University of Amsterdam",
    city: "Amsterdam",
    country: "Netherlands",
    region: "Europe",
    imageUrl:
      "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=600&h=400&fit=crop",
    applicationDeadline: "1st June 2026",
    programs: ["Social Sciences", "Economics", "Law", "Business", "Psychology"],
    scholarship: true,
    applicationFee: 160,
    currency: "GHS",
    acceptanceRate: "76%",
    ranking: "Top 100 Global",
    description:
      "Leading European research university with a strong international orientation and liberal atmosphere.",
    establishedYear: 1632,
    totalStudents: 41000,
    internationalStudents: 6000,
    location: "Amsterdam, Netherlands",
    deadline: "1st June 2026",
  },
  {
    id: "9",
    schoolName: "ETH Zurich",
    city: "Zurich",
    country: "Switzerland",
    region: "Europe",
    imageUrl:
      "https://images.unsplash.com/photo-1527866959252-deab85ef7d1b?w=600&h=400&fit=crop",
    applicationDeadline: "15th May 2026",
    programs: [
      "Engineering",
      "Natural Sciences",
      "Mathematics",
      "Computer Science",
      "Architecture",
    ],
    scholarship: true,
    applicationFee: 140,
    currency: "GHS",
    acceptanceRate: "62%",
    ranking: "Top 10 Global",
    description:
      "World-renowned science and technology university, consistently ranked among the best globally.",
    establishedYear: 1855,
    totalStudents: 23000,
    internationalStudents: 9000,
    location: "Zurich, Switzerland",
    deadline: "15th May 2026",
  },
  {
    id: "10",
    schoolName: "University of Melbourne",
    city: "Melbourne",
    country: "Australia",
    region: "Oceania",
    imageUrl:
      "https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=600&h=400&fit=crop",
    applicationDeadline: "10th April 2026",
    programs: ["Medicine", "Engineering", "Business", "Law", "Arts"],
    scholarship: true,
    applicationFee: 190,
    currency: "GHS",
    acceptanceRate: "73%",
    ranking: "Top 1 Australia",
    description:
      "Australia's leading university offering exceptional education and research opportunities.",
    establishedYear: 1853,
    totalStudents: 50000,
    internationalStudents: 18000,
    location: "Melbourne, Australia",
    deadline: "10th April 2026",
  },
  {
    id: "11",
    schoolName: "National University of Singapore",
    city: "Singapore",
    country: "Singapore",
    region: "Asia",
    imageUrl:
      "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=600&h=400&fit=crop",
    applicationDeadline: "20th March 2026",
    programs: ["Engineering", "Business", "Computing", "Science", "Medicine"],
    scholarship: true,
    applicationFee: 170,
    currency: "GHS",
    acceptanceRate: "69%",
    ranking: "Top 1 Asia",
    description:
      "Asia's premier university with cutting-edge research and strong industry partnerships.",
    establishedYear: 1905,
    totalStudents: 40000,
    internationalStudents: 13000,
    location: "Singapore, Singapore",
    deadline: "20th March 2026",
  },
  {
    id: "12",
    schoolName: "McGill University",
    city: "Montreal",
    country: "Canada",
    region: "America",
    imageUrl:
      "https://images.unsplash.com/photo-1571846080032-e94c7e5a9e84?w=600&h=400&fit=crop",
    applicationDeadline: "5th May 2026",
    programs: ["Medicine", "Law", "Engineering", "Science", "Arts"],
    scholarship: true,
    applicationFee: 185,
    currency: "GHS",
    acceptanceRate: "74%",
    ranking: "Top 5 Canada",
    description:
      "Canada's most international university with a rich history of academic excellence.",
    establishedYear: 1821,
    totalStudents: 40000,
    internationalStudents: 12000,
    location: "Montreal, Canada",
    deadline: "5th May 2026",
  },
];

export default universities;
