// Map destination names to IATA airport codes
const DESTINATION_AIRPORTS: Record<string, string> = {
  // From specialOffers (mockData.ts)
  'Melbourne': 'MEL',
  'Jakarta': 'CGK',
  'Antarctica': 'TNM', // Teniente R. Marsh Airport
  'Australia': 'SYD', // Default to Sydney

  // From topDeals (mockData.ts)
  'Alhambra': 'GRX', // Granada, Spain
  'Pyramids of Giza': 'CAI', // Cairo, Egypt
  'Petra': 'AMM', // Amman, Jordan (closest major airport)
  'Colosseum': 'FCO', // Rome, Italy
  'Angkor Wat': 'REP', // Siem Reap, Cambodia
  'Phnom Penh': 'PNH',
  'Grand Canyon': 'LAS', // Las Vegas, USA (closest major)
  'Statue of Liberty': 'JFK', // New York, USA
  'Wadi Rum': 'AMM', // Amman, Jordan
  'Venice Canals': 'VCE', // Venice, Italy

  // Country defaults
  'Spain': 'MAD', // Madrid
  'Egypt': 'CAI',
  'Jordan': 'AMM',
  'Italy': 'FCO',
  'Cambodia': 'PNH',
  'USA': 'JFK',
  'Indonesia': 'CGK',
};

/**
 * Get IATA airport code for a destination
 * @param destination - Destination name (e.g., "Melbourne", "Pyramids of Giza")
 * @param country - Country name (e.g., "Australia", "Egypt")
 * @returns IATA airport code (e.g., "MEL", "CAI")
 */
export const getAirportCode = (destination: string, country: string): string => {
  // Try exact destination match
  if (DESTINATION_AIRPORTS[destination]) {
    return DESTINATION_AIRPORTS[destination];
  }

  // Try country match
  if (DESTINATION_AIRPORTS[country]) {
    return DESTINATION_AIRPORTS[country];
  }

  // Default fallback
  console.warn(`No airport code found for ${destination}, ${country}. Using default ACC.`);
  return 'ACC'; // Accra as default
};

/**
 * Generate smart departure date (2 weeks from today)
 * @returns ISO date string (YYYY-MM-DD)
 */
export const getSmartDepartureDate = (): string => {
  const date = new Date();
  date.setDate(date.getDate() + 14);
  return date.toISOString().split('T')[0];
};

/**
 * Generate smart return date (1 week after departure)
 * @param departureDate - Departure date in ISO format (YYYY-MM-DD)
 * @returns ISO date string (YYYY-MM-DD)
 */
export const getSmartReturnDate = (departureDate: string): string => {
  const date = new Date(departureDate);
  date.setDate(date.getDate() + 7);
  return date.toISOString().split('T')[0];
};
