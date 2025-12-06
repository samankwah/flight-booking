// src/components/Statistics.tsx

import React from "react";

const Statistics: React.FC = () => {
  const features = [
    {
      title: "We offer exclusive deals",
      description:
        "Enjoy limited time offers and special discounts on top destinations.",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    },
    {
      title: "Customized Travel Itineraries",
      description: "Tailored trips to suit your personal preferences ensuring.",
      image:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
    },
    {
      title: "Expert Destination Knowledge",
      description:
        "Leverage our local expertise for tips on the best sights and activities.",
      image:
        "https://images.unsplash.com/photo-1554151228-14d9def656e4?w=150&h=150&fit=crop&crop=face",
    },
    {
      title: "Seamless Travel Planning",
      description:
        "Let us handle all the details from flights to accommodations.",
      image:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
    },
  ];

  return (
    <section className="py-16 bg-white">
      {/* Using the same container as your Hero, Header, etc. */}
      <div className="container mx-auto px-4">
        {/* Main Card - Full Gray Background + Container Width */}
        <div className="bg-gray-100 rounded-3xl shadow-lg overflow-hidden">
          {/* Top Counter */}
          <div className="text-center py-12 px-8">
            <h2 className="text-2xl md:text-4xl font-bold text-gray-900">
              We have helped almost{" "}
              <span className="text-cyan-500">45,358</span>
            </h2>
            <p className="text-xl text-gray-600 mt-2 font-semibold">
              travelers last month
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 px-2 pb-12">
            {features.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="relative inline-block mb-6">
                  <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-white shadow-md group-hover:ring-cyan-200 transition-all duration-300">
                    <img
                      src={feature.image}
                      alt={feature.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <h3 className="font-bold text-gray-900 text-lg mb-2 leading-tight">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm  text-balance leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {/* Bottom CTA - White Background */}
          <div className="bg-white px-8 py-10">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <h3 className="text-xl md:text-3xl font-bold text-gray-900 text-center sm:text-left leading-tight">
                We provide deal on affordable budgets!
              </h3>
              <button className="bg-cyan-400 hover:bg-cyan-500 text-white px-8 py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all whitespace-nowrap">
                View all
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Statistics;
