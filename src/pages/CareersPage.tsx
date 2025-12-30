import React, { useState } from "react";
import {
  MdRocketLaunch,
  MdGroups,
  MdCardTravel,
  MdHealthAndSafety,
  MdSchool,
  MdAttachMoney,
  MdLocationOn,
  MdAccessTime,
  MdArrowForward,
} from "react-icons/md";

const CareersPage: React.FC = () => {
  const [selectedDepartment, setSelectedDepartment] = useState("all");

  const benefits = [
    {
      icon: MdCardTravel,
      title: "Travel Perks",
      description:
        "Exclusive discounts on flights and travel packages for you and your family",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: MdHealthAndSafety,
      title: "Health & Wellness",
      description:
        "Comprehensive health insurance, mental health support, and wellness programs",
      gradient: "from-green-500 to-emerald-500",
    },
    {
      icon: MdSchool,
      title: "Learning & Development",
      description:
        "Continuous learning opportunities, conferences, and skill development programs",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: MdAttachMoney,
      title: "Competitive Salary",
      description:
        "Market-leading compensation packages with performance bonuses and equity options",
      gradient: "from-yellow-500 to-orange-500",
    },
  ];

  const openings = [
    {
      id: 1,
      title: "Senior Frontend Developer",
      department: "Engineering",
      location: "Remote / Accra, Ghana",
      type: "Full-time",
      salary: "$80k - $120k",
      description:
        "Build and optimize user-facing features for our flight booking platform using React and modern web technologies.",
      skills: ["React", "TypeScript", "Tailwind CSS"],
    },
    {
      id: 2,
      title: "Product Manager",
      department: "Product",
      location: "Remote / New York, USA",
      type: "Full-time",
      salary: "$100k - $150k",
      description:
        "Lead product strategy and development for new travel features, working cross-functionally with engineering and design.",
      skills: ["Product Strategy", "Agile", "Analytics"],
    },
    {
      id: 3,
      title: "Customer Success Specialist",
      department: "Support",
      location: "Lagos, Nigeria",
      type: "Full-time",
      salary: "$35k - $50k",
      description:
        "Provide exceptional support to travelers, resolve booking issues, and ensure customer satisfaction.",
      skills: ["Communication", "Problem Solving", "CRM"],
    },
    {
      id: 4,
      title: "Data Analyst",
      department: "Data",
      location: "Remote",
      type: "Full-time",
      salary: "$70k - $95k",
      description:
        "Analyze travel trends and user behavior to drive business decisions and optimize our platform.",
      skills: ["SQL", "Python", "Data Visualization"],
    },
    {
      id: 5,
      title: "UX/UI Designer",
      department: "Design",
      location: "Remote / London, UK",
      type: "Full-time",
      salary: "$65k - $90k",
      description:
        "Create intuitive and beautiful user experiences for our platform, from wireframes to final designs.",
      skills: ["Figma", "User Research", "Prototyping"],
    },
    {
      id: 6,
      title: "Backend Engineer",
      department: "Engineering",
      location: "Remote / San Francisco, USA",
      type: "Full-time",
      salary: "$90k - $130k",
      description:
        "Build scalable APIs and systems for our booking infrastructure using Node.js and microservices.",
      skills: ["Node.js", "PostgreSQL", "AWS"],
    },
    {
      id: 7,
      title: "Marketing Manager",
      department: "Marketing",
      location: "Dubai, UAE",
      type: "Full-time",
      salary: "$60k - $85k",
      description:
        "Drive growth strategies and campaigns for the MENA region, manage paid advertising and brand awareness.",
      skills: ["Digital Marketing", "SEO", "Analytics"],
    },
    {
      id: 8,
      title: "DevOps Engineer",
      department: "Engineering",
      location: "Remote",
      type: "Contract",
      salary: "$75k - $110k",
      description:
        "Maintain and improve our cloud infrastructure, deployment pipelines, and monitoring systems.",
      skills: ["Docker", "Kubernetes", "CI/CD"],
    },
  ];

  const departments = [
    "all",
    "Engineering",
    "Product",
    "Design",
    "Support",
    "Marketing",
    "Data",
  ];

  const filteredOpenings =
    selectedDepartment === "all"
      ? openings
      : openings.filter((job) => job.department === selectedDepartment);

  const departmentColors: Record<string, string> = {
    Engineering: "bg-blue-100 text-blue-700",
    Product: "bg-purple-100 text-purple-700",
    Design: "bg-pink-100 text-pink-700",
    Support: "bg-green-100 text-green-700",
    Marketing: "bg-orange-100 text-orange-700",
    Data: "bg-cyan-100 text-cyan-700",
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-cyan-600 via-blue-600 to-indigo-700 text-white py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-20 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-20 w-80 h-80 bg-cyan-300 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <MdGroups className="w-5 h-5" />
              <span className="text-sm font-semibold">We're Hiring!</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
              Join Our Team of Travel Enthusiasts
              {/* <span className="block bg-gradient-to-r from-cyan-200 to-white bg-clip-text text-transparent">
                
              </span> */}
            </h1>
            <p className="text-xl md:text-2xl text-cyan-100 leading-relaxed max-w-3xl mx-auto mb-8">
              Help us connect travelers to their dream destinations and build
              the future of travel booking
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full">
                <span className="font-bold">{openings.length}</span> Open
                Positions
              </div>
              <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full">
                <span className="font-bold">6</span> Departments
              </div>
              <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full">
                <span className="font-bold">Remote</span> Friendly
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="container mx-auto px-4 -mt-16 relative z-20 mb-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="group bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <div
                className={`w-14 h-14 rounded-xl bg-gradient-to-br ${benefit.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
              >
                <benefit.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {benefit.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Why Work With Us Section */}
      <div className="bg-gradient-to-br from-gray-50 to-cyan-50 py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div>
              <div className="inline-block bg-white text-cyan-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                Why Flight Booking?
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                Build Something Amazing Together
              </h2>
              <div className="space-y-4 text-lg text-gray-700 leading-relaxed">
                <p>
                  At Flight Booking, we're passionate about making travel
                  accessible to everyone. Join a team of innovators,
                  problem-solvers, and travel enthusiasts.
                </p>
                <p>
                  We offer competitive salaries, comprehensive benefits, and a
                  culture that values work-life balance, continuous learning,
                  and personal growth.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-3xl transform rotate-3"></div>
              <img
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop"
                alt="Team collaboration"
                className="relative rounded-3xl shadow-2xl w-full h-96 object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Open Positions Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <div className="inline-block bg-cyan-100 text-cyan-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            Open Positions
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Find Your Perfect Role
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Explore opportunities across different departments and locations
          </p>
        </div>

        {/* Department Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {departments.map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDepartment(dept)}
              className={`px-6 py-3 rounded-full font-semibold transition-all transform ${
                selectedDepartment === dept
                  ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg scale-105"
                  : "bg-white text-gray-700 hover:bg-gray-100 shadow-md hover:shadow-lg"
              }`}
            >
              {dept === "all" ? "All Departments" : dept}
            </button>
          ))}
        </div>

        {/* Job Listings */}
        <div className="max-w-5xl mx-auto space-y-6">
          {filteredOpenings.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-justify shadow-lg">
              <p className="text-gray-600 text-lg">
                No openings in this department at the moment.
              </p>
            </div>
          ) : (
            filteredOpenings.map((job) => (
              <div
                key={job.id}
                className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-cyan-300"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                          departmentColors[job.department]
                        }`}
                      >
                        {job.department}
                      </span>
                      <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                        <MdLocationOn className="w-4 h-4" />
                        {job.location}
                      </span>
                      <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                        <MdAccessTime className="w-4 h-4" />
                        {job.type}
                      </span>
                    </div>

                    <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-cyan-600 transition-colors">
                      {job.title}
                    </h3>

                    <p className="text-gray-600 leading-relaxed mb-4">
                      {job.description}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {job.skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>

                    <div className="text-lg font-bold text-cyan-600">
                      {job.salary}
                    </div>
                  </div>

                  <button className="group/btn bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bold py-4 px-8 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center gap-2 whitespace-nowrap self-start">
                    Apply Now
                    <MdArrowForward className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-br from-gray-50 to-blue-50 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center bg-gradient-to-br from-cyan-600 to-blue-700 rounded-3xl p-12 text-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -ml-32 -mt-32"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mb-32"></div>
            <div className="relative z-10">
              <MdRocketLaunch className="w-16 h-16 mx-auto mb-6" />
              <h2 className="text-3xl font-bold mb-6">
                Don't See a Perfect Fit?
              </h2>
              <p className="text-xl text-cyan-100 mb-8">
                We're always looking for talented individuals. Send us your
                resume and let us know how you can contribute to Flight
                Booking's success.
              </p>
              <a
                href="mailto:careers@flightbooking.com"
                className="inline-block bg-white text-cyan-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-cyan-50 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Send Your Resume
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CareersPage;
