// src/components/TopDeals.tsx

import React, { useState } from "react";
import { topDeals } from "../data/mockData";
import { ChevronRight } from "lucide-react";

const TopDeals: React.FC = () => {
  const [activeTab, setActiveTab] = useState("Bangkok");
  const tabs = Object.keys(topDeals);

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-2xl md:text-4xl font-bold text-gray-900">
            Our Top deals for today
          </h2>
          <button className="text-cyan-600 font-semibold text-sm hover:text-cyan-700 transition flex items-center gap-2 group">
            View all
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-4 md:gap-4 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 ${
                activeTab === tab
                  ? "bg-cyan-400 text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Deals Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {topDeals[activeTab]?.map((deal) => (
            <div
              key={deal.id}
              className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer group"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={deal.image}
                  alt={deal.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-bold mb-2 text-gray-900 group-hover:text-cyan-600 transition">
                  {deal.name}, {deal.country}
                </h3>
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-sm font-semibold">
                    {deal.rating}/5
                  </span>
                  <span className="text-gray-500 text-sm">
                    ({deal.reviews} Reviews)
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-1">
                  {deal.perNight ? "Per Night" : "Total Price"}
                </p>
                <p className="text-xl font-bold text-gray-900">
                  GHS {deal.price.toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TopDeals;
