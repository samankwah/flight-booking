// src/components/FeaturedPartners.tsx
import React from "react";
import { airlines } from "../data/mockData";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules"; // Only Autoplay now

// Import Swiper styles
import "swiper/css";

const FeaturedPartners: React.FC = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-4xl font-bold text-center mb-3 text-gray-900">
          Featured Partners
        </h2>
        <p className="text-gray-600 text-center font-semibold mb-12 text-lg">
          Domestic & International Flight Partner for you
        </p>

        <Swiper
          modules={[Autoplay]}
          spaceBetween={30}
          slidesPerView={3}
          loop={true}
          autoplay={{ delay: 2500, disableOnInteraction: false }}
          breakpoints={{
            640: { slidesPerView: 3 },
            768: { slidesPerView: 4 },
            1024: { slidesPerView: 6 },
          }}
          className="py-4"
        >
          {airlines.map((airline) => (
            <SwiperSlide key={airline.id} className="flex justify-center">
              <img
                src={airline.logo} // Make sure mockData has a 'logo' field
                alt={airline.name}
                className="h-16 md:h-24 object-contain transition-transform duration-300 hover:scale-105 cursor-pointer"
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default FeaturedPartners;
