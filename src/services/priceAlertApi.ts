// src/services/priceAlertApi.ts
import { getAuth } from "firebase/auth";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface PriceAlertData {
  route: {
    from: string;
    to: string;
    departureDate: string;
    returnDate?: string | null;
  };
  targetPrice: number;
  currentPrice?: number;
  currency?: string;
  travelClass?: string;
  passengers?: {
    adults: number;
    children?: number;
    infants?: number;
  };
  frequency?: 'hourly' | 'daily' | 'weekly';
  active?: boolean;
}

export interface PriceAlert extends PriceAlertData {
  id: string;
  userId: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  lastChecked: string | null;
  priceHistory: Array<{ price: number; timestamp: string }>;
}

/**
 * Get fresh auth token from Firebase
 */
const getAuthToken = async (): Promise<string | null> => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return null;

    const token = await user.getIdToken();
    return token;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

/**
 * Create a new price alert
 */
export const createPriceAlert = async (alertData: PriceAlertData): Promise<PriceAlert> => {
  const token = await getAuthToken();
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`${API_BASE_URL}/price-alerts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(alertData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create price alert');
  }

  const result = await response.json();
  return result.data;
};

/**
 * Get all price alerts for the current user
 */
export const getPriceAlerts = async (activeOnly?: boolean): Promise<PriceAlert[]> => {
  const token = await getAuthToken();
  if (!token) {
    throw new Error('Authentication required');
  }

  const url = new URL(`${API_BASE_URL}/price-alerts`);
  if (activeOnly !== undefined) {
    url.searchParams.append('active', String(activeOnly));
  }

  const response = await fetch(url.toString(), {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch price alerts');
  }

  const result = await response.json();
  return result.data;
};

/**
 * Get a specific price alert
 */
export const getPriceAlert = async (id: string): Promise<PriceAlert> => {
  const token = await getAuthToken();
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`${API_BASE_URL}/price-alerts/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch price alert');
  }

  const result = await response.json();
  return result.data;
};

/**
 * Update a price alert
 */
export const updatePriceAlert = async (
  id: string,
  updates: Partial<PriceAlertData>
): Promise<PriceAlert> => {
  const token = await getAuthToken();
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`${API_BASE_URL}/price-alerts/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update price alert');
  }

  const result = await response.json();
  return result.data;
};

/**
 * Delete a price alert
 */
export const deletePriceAlert = async (id: string): Promise<void> => {
  const token = await getAuthToken();
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`${API_BASE_URL}/price-alerts/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete price alert');
  }
};

/**
 * Toggle a price alert's active status
 */
export const togglePriceAlert = async (id: string): Promise<{ id: string; active: boolean }> => {
  const token = await getAuthToken();
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`${API_BASE_URL}/price-alerts/${id}/toggle`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to toggle price alert');
  }

  const result = await response.json();
  return result.data;
};
