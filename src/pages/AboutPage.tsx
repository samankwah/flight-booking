import React from "react";
import {
  MdFlight,
  MdStar,
  MdPeople,
  MdTrendingUp,
  MdVerified,
  MdSecurity,
  MdSupport,
  MdSpeed,
} from "react-icons/md";

const AboutPage: React.FC = () => {
  const stats = [
    {
      icon: MdFlight,
      value: "10M+",
      label: "Flights Booked",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: MdStar,
      value: "4.8/5",
      label: "Customer Rating",
      gradient: "from-yellow-500 to-orange-500",
    },
    {
      icon: MdPeople,
      value: "5M+",
      label: "Happy Travelers",
      gradient: "from-green-500 to-emerald-500",
    },
    {
      icon: MdTrendingUp,
      value: "150+",
      label: "Countries Covered",
      gradient: "from-purple-500 to-pink-500",
    },
  ];

  const values = [
    {
      icon: MdVerified,
      title: "Customer First",
      description:
        "We prioritize your needs and ensure every journey is seamless and enjoyable.",
      color: "blue",
    },
    {
      icon: MdSpeed,
      title: "Best Prices",
      description:
        "We guarantee competitive prices and exclusive deals on flights worldwide.",
      color: "cyan",
    },
    {
      icon: MdSecurity,
      title: "Trust & Security",
      description:
        "Your data and transactions are protected with industry-leading security.",
      color: "green",
    },
    {
      icon: MdSupport,
      title: "24/7 Support",
      description:
        "Our dedicated team is always available to assist you, anytime, anywhere.",
      color: "purple",
    },
  ];

  const team = [
    {
      name: "Sarah Johnson",
      role: "CEO & Founder",
      image: "https://randomuser.me/api/portraits/women/44.jpg",
    },
    {
      name: "Michael Chen",
      role: "CTO",
      image: "https://randomuser.me/api/portraits/men/32.jpg",
    },
    {
      name: "Emily Rodriguez",
      role: "Head of Operations",
      image: "https://randomuser.me/api/portraits/women/65.jpg",
    },
    {
      name: "David Kim",
      role: "Head of Customer Success",
      image: "https://randomuser.me/api/portraits/men/54.jpg",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Animated Background */}
      <div className="relative bg-gradient-to-br from-cyan-600 via-blue-600 to-indigo-700 text-white py-24 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-300 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="container mx-auto px-2 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <MdFlight className="w-5 h-5" />
              <span className="text-sm font-semibold">Since 2020</span>
            </div> */}
            <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
              Making Travel Dreams
              <span className="block bg-gradient-to-r from-cyan-200 to-white bg-clip-text text-transparent">
                Come True
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-cyan-100 leading-relaxed max-w-3xl mx-auto">
              Your trusted partner for seamless flight booking experiences
              worldwide
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section with Cards */}
      <div className="container mx-auto px-4 -mt-16 relative z-20 mb-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="group bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <div
                className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
              >
                <stat.icon className="w-7 h-7 text-white" />
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {stat.value}
              </div>
              <div className="text-gray-600 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Our Story Section with Image */}
      <div className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          <div>
            <div className="inline-block bg-cyan-100 text-cyan-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              Our Story
            </div>
            <h2 className="text-2xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Connecting People Through Travel
            </h2>
            <div className="space-y-4 text-lg text-gray-700 leading-relaxed">
              <p>
                Founded in 2020, Flight Booking was born from a simple mission:
                to make air travel accessible, affordable, and stress-free for
                everyone.
              </p>
              <p>
                What started as a small startup has grown into one of the most
                trusted flight booking platforms, serving millions of travelers
                worldwide.
              </p>
              <p>
                Today, we partner with over 500 airlines globally, offering you
                access to thousands of destinations across 150+ countries.
              </p>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-3xl transform rotate-3"></div>
            <img
              src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&auto=format&fit=crop"
              alt="Airplane"
              className="relative rounded-3xl shadow-2xl w-full h-96 object-cover"
            />
          </div>
        </div>
      </div>

      {/* Our Values Section */}
      <div className="bg-gradient-to-br from-gray-50 to-cyan-50 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-block bg-white text-cyan-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              Our Values
            </div>
            <h2 className="text-2xl md:text-5xl font-bold text-gray-900 mb-4">
              What Drives Us
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our core values guide everything we do, from product development
              to customer service
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {values.map((value, index) => (
              <div
                key={index}
                className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-cyan-300"
              >
                <div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br from-${value.color}-500 to-${value.color}-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
                >
                  <value.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {value.title}
                </h3>
                <p className="text-gray-600 leading-relaxed text-lg">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mission & Vision Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-cyan-600 to-blue-700 p-10 text-white group hover:shadow-2xl transition-all">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative z-10">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
                <MdFlight className="w-7 h-7" />
              </div>
              <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
              <p className="text-lg text-cyan-100 leading-relaxed">
                To empower travelers worldwide with innovative booking solutions
                that combine affordability, convenience, and exceptional
                service, making every journey memorable and hassle-free.
              </p>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 to-purple-700 p-10 text-white group hover:shadow-2xl transition-all">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative z-10">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
                <MdTrendingUp className="w-7 h-7" />
              </div>
              <h2 className="text-3xl font-bold mb-6">Our Vision</h2>
              <p className="text-lg text-indigo-100 leading-relaxed">
                To become the world's most trusted and user-friendly flight
                booking platform, connecting people across borders and cultures
                while setting new standards in customer experience and
                technology.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="bg-gradient-to-br from-gray-50 to-blue-50 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-block bg-white text-cyan-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              Our Team
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              Meet the Leaders
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Passionate experts dedicated to making your travel dreams a
              reality
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {team.map((member, index) => (
              <div key={index} className="group text-center">
                <div className="relative mb-6 inline-block">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl transform group-hover:rotate-6 transition-transform"></div>
                  <img
                    src={member.image}
                    alt={member.name}
                    className="relative w-48 h-48 rounded-2xl object-cover shadow-xl mx-auto"
                  />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {member.name}
                </h3>
                <p className="text-cyan-600 font-medium">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center bg-gradient-to-br from-cyan-600 to-blue-700 rounded-3xl p-12 text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -ml-32 -mt-32"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mb-32"></div>
          <div className="relative z-10">
            <h2 className="text-4xl font-bold mb-6">
              Ready to Start Your Journey?
            </h2>
            <p className="text-xl text-cyan-100 mb-8">
              Join millions of happy travelers and discover the world with
              Flight Booking
            </p>
            <button className="bg-white text-cyan-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-cyan-50 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1">
              Book Your Flight Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
