import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { airlines } from "../data/mockData";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules"; // Only Autoplay now
// Import Swiper styles
import "swiper/css";
const FeaturedPartners = () => {
    return (_jsx("section", { className: "py-16 bg-white", children: _jsxs("div", { className: "container mx-auto px-4", children: [_jsx("h2", { className: "text-2xl md:text-4xl font-bold text-center mb-3 text-gray-900", children: "Featured Partners" }), _jsx("p", { className: "text-gray-600 text-center font-semibold mb-12 text-lg", children: "Domestic & International Flight Partner for you" }), _jsx(Swiper, { modules: [Autoplay], spaceBetween: 30, slidesPerView: 3, loop: true, autoplay: { delay: 2500, disableOnInteraction: false }, breakpoints: {
                        640: { slidesPerView: 3 },
                        768: { slidesPerView: 4 },
                        1024: { slidesPerView: 6 },
                    }, className: "py-4", children: airlines.map((airline) => (_jsx(SwiperSlide, { className: "flex justify-center", children: _jsx("img", { src: airline.logo, alt: airline.name, className: "h-16 md:h-24 object-contain transition-transform duration-300 hover:scale-105 cursor-pointer" }) }, airline.id))) })] }) }));
};
export default FeaturedPartners;
