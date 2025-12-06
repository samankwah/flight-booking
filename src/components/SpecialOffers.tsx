// src/components/SpecialOffers.tsx
import React from "react";
import { specialOffers } from "../data/mockData";
import { ChevronRight } from "lucide-react";

const SpecialOffers: React.FC = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-2xl md:text-4xl font-bold text-gray-900">
            Special Offers
          </h2>
          <button className="text-cyan-600 font-semibold hover:text-cyan-700 transition flex items-center gap-1 group">
            View all
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {specialOffers.map((offer) => (
            <div
              key={offer.id}
              className="relative rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer group"
            >
              <img
                src={offer.image}
                alt={offer.name}
                className="w-full h-64 sm:h-72 md:h-80 object-cover group-hover:scale-105 transition-transform duration-500"
              />

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Text overlay */}
              <div className="absolute bottom-4 left-4 text-white">
                <h3 className="text-xl md:text-2xl font-bold drop-shadow-lg">
                  {offer.name}
                </h3>
                <p className="text-base md:text-lg mt-1 drop-shadow">
                  Starting from GHS {offer.price.toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SpecialOffers;
