const API_BASE_URL = "http://localhost:3001/api";

export const searchFlights = async (searchParams) => {
  const response = await fetch(`${API_BASE_URL}/flights/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(searchParams),
  });

  if (!response.ok) {
    throw new Error("Flight search failed");
  }

  return response.json();
};

export const searchAirports = async (keyword) => {
  const response = await fetch(
    `${API_BASE_URL}/flights/airports?keyword=${encodeURIComponent(keyword)}`
  );

  if (!response.ok) {
    throw new Error("Airport search failed");
  }

  return response.json();
};
