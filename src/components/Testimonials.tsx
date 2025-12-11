// src/components/Testimonials.tsx

import React from "react";
import { MdStar as Star, MdCheckCircle as CheckCircle2 } from "react-icons/md";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/autoplay";

const ghanaTestimonials = [
  {
    id: 1,
    name: "Kwame Osei",
    location: "Accra, Greater Accra",
    comment:
      "Booked a family trip to Cape Coast and Elmina — everything was perfectly organized! The driver was on time and very professional.",
    rating: 5,
  },
  {
    id: 2,
    name: "Abena Mensah",
    location: "Kumasi, Ashanti Region",
    comment:
      "Best experience ever! They helped us plan our Mole National Park safari. The lodge was amazing and the guide knew everything about Ghanaian wildlife.",
    rating: 5,
  },
  {
    id: 3,
    name: "Issahaku Salifu",
    location: "Tamale, Northern Region",
    comment:
      "I booked flights from Tamale to Accra during peak season and got the best price. Customer service responded in minutes on WhatsApp!",
    rating: 5,
  },
  {
    id: 4,
    name: "Efua Ansah",
    location: "Takoradi, Western Region",
    comment:
      "Used them for a business trip to Busua Beach Resort. Hotel booking, transport, everything seamless. Will always use this platform!",
    rating: 5,
  },
  {
    id: 5,
    name: "Nana Yaw Boateng",
    location: "Ho, Volta Region",
    comment:
      "Planned our Wli Waterfalls and Mount Afadja trip. The team gave us local tips no one else knows. Truly authentic Ghanaian hospitality!",
    rating: 5,
  },
  {
    id: 6,
    name: "Mawusi Amedume",
    location: "Sunyani, Bono Region",
    comment:
      "Amazing service! Booked a cultural tour to the Kintampo Waterfalls. Driver spoke perfect Twi and English. Highly recommend.",
    rating: 5,
  },
];

const Testimonials: React.FC = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Title - Left Aligned */}
        <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-10">
          Our Authentic Feedbacks!
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* Overall Rating Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-md p-8 border border-gray-100 text-center lg:text-left h-full flex flex-col justify-center">
              <p className="text-lg text-gray-600 mb-3">Customer Rating</p>
              <div className="flex items-center justify-center lg:justify-start gap-2 mb-4">
                <span className="text-6xl font-bold text-gray-900">4.8</span>
                <span className="text-3xl text-gray-500 mt-3">/5</span>
              </div>
              <div className="flex justify-center lg:justify-start gap-1 mb-5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-7 h-7 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
              <p className="text-gray-600 font-medium">
                <span className="text-xl font-bold text-gray-800">18,530</span>{" "}
                Verified
              </p>
              <p className="text-gray-600">Customers in Ghana</p>
            </div>
          </div>

          {/* Testimonial Carousel - All cards same height */}
          <div className="lg:col-span-3">
            <Swiper
              modules={[Autoplay]}
              spaceBetween={24}
              slidesPerView={1}
              breakpoints={{
                640: { slidesPerView: 1 },
                768: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
              }}
              autoplay={{ delay: 4000, disableOnInteraction: false }}
              loop={true}
              className="h-full"
            >
              {ghanaTestimonials.map((t) => (
                <SwiperSlide key={t.id}>
                  <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300 h-full flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">
                          {t.name}
                        </h3>
                        <p className="text-sm text-gray-500">{t.location}</p>
                      </div>
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckCircle2 className="w-5 h-5" />
                        <span className="text-sm font-medium">Verified</span>
                      </div>
                    </div>

                    {/* Comment */}
                    <p className="text-gray-700 text-sm leading-relaxed flex-grow italic mb-5">
                      "{t.comment}"
                    </p>

                    {/* Stars */}
                    <div className="flex gap-1 mt-auto">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-5 h-5 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
