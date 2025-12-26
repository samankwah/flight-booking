import React from "react";
import HeroSearch from "../components/HeroSearch";
import FeaturedPartners from "../components/FeaturedPartners";
import SpecialOffers from "../components/SpecialOffers";
import TopDeals from "../components/TopDeals";
import TravelPackages from "../components/TravelPackages";
import Statistics from "../components/Statistics";
import Testimonials from "../components/Testimonials";
// import Footer from "../components/Footer";

const HomePage: React.FC = () => {
  return (
    <>
      <HeroSearch />
      <FeaturedPartners />
      <SpecialOffers />
      <TopDeals />
      <TravelPackages />
      <Statistics />
      <Testimonials />
      {/* <Footer /> */}
    </>
  );
};

export default HomePage;
