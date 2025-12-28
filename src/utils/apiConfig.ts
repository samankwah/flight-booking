// Centralized API configuration
// This ensures consistent API URL usage across the entire application

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Validation: Warn if the API URL doesn't include '/api'
if (!API_BASE_URL.includes('/api')) {
  console.warn(
    '⚠️ API_BASE_URL configuration warning: URL should include "/api" suffix.',
    `Current value: ${API_BASE_URL}`
  );
}

export { API_BASE_URL };
export default API_BASE_URL;
