import Amadeus from "amadeus";
import dotenv from "dotenv";

dotenv.config();

let amadeusInstance = null;

const getAmadeusClient = () => {
  if (!amadeusInstance) {
    amadeusInstance = new Amadeus({
      clientId: process.env.AMADEUS_API_KEY,
      clientSecret: process.env.AMADEUS_API_SECRET,
      hostname: process.env.AMADEUS_HOSTNAME || "test",
    });
  }
  return amadeusInstance;
};

export default getAmadeusClient;
