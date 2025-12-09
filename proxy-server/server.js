require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Simulated Amadeus API endpoint
app.get('/api/amadeus/flights', async (req, res) => {
  console.log('Received request for /api/amadeus/flights');
  console.log('Query parameters:', req.query);

  const { from, to, departureDate, adults } = req.query;

  // In a real scenario, you would:
  // 1. Get Amadeus access token using CLIENT_ID and CLIENT_SECRET
  // 2. Make an actual API call to Amadeus using fetch/axios
  // 3. Handle Amadeus API response and errors

  // For now, let's simulate a response
  const simulatedFlights = [
    {
      id: 'FL9001',
      airline: { id: '1', name: 'Simulated Air', code: 'SA' },
      flightNumber: 'SA101',
      departureAirport: { code: from || 'UNKNOWN', name: 'Unknown From', city: 'Unknown City', country: 'Unknown Country' },
      arrivalAirport: { code: to || 'UNKNOWN', name: 'Unknown To', city: 'Unknown City', country: 'Unknown Country' },
      departureTime: '09:00 AM',
      arrivalTime: '11:30 AM',
      duration: '2h 30m',
      stops: 0,
      price: 150 + Math.floor(Math.random() * 100),
      currency: 'USD',
      departureDate: departureDate || '2025-01-01',
      arrivalDate: departureDate || '2025-01-01',
      cabinClass: 'economy',
    },
    {
      id: 'FL9002',
      airline: { id: '2', name: 'Mock Flights', code: 'MF' },
      flightNumber: 'MF202',
      departureAirport: { code: from || 'UNKNOWN', name: 'Unknown From', city: 'Unknown City', country: 'Unknown Country' },
      arrivalAirport: { code: to || 'UNKNOWN', name: 'Unknown To', city: 'Unknown City', country: 'Unknown Country' },
      departureTime: '01:00 PM',
      arrivalTime: '05:00 PM',
      duration: '4h 00m',
      stops: 1,
      price: 250 + Math.floor(Math.random() * 150),
      currency: 'USD',
      departureDate: departureDate || '2025-01-01',
      arrivalDate: departureDate || '2025-01-01',
      cabinClass: 'economy',
    },
  ];

  // Introduce a slight delay to simulate network latency
  setTimeout(() => {
    res.json(simulatedFlights);
  }, 500);
});

app.listen(PORT, () => {
  console.log(`Proxy server listening on port ${PORT}`);
});
