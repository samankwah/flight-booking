import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CountryData {
  code: string;
  name: string;
  flag: string;
  currency: string;
  currencySymbol: string;
  language: string;
  locale: string;
  label: string;
}

export const countries: CountryData[] = [
  {
    code: 'gh',
    name: 'Ghana',
    flag: 'https://flagcdn.com/32x24/gh.png',
    currency: 'GHS',
    currencySymbol: 'GHS',
    language: 'English',
    locale: 'en-GH',
    label: 'English (GH)',
  },
  {
    code: 'us',
    name: 'USA',
    flag: 'https://flagcdn.com/32x24/us.png',
    currency: 'USD',
    currencySymbol: '$',
    language: 'English',
    locale: 'en-US',
    label: 'English (US)',
  },
  {
    code: 'gb',
    name: 'UK',
    flag: 'https://flagcdn.com/32x24/gb.png',
    currency: 'GBP',
    currencySymbol: '£',
    language: 'English',
    locale: 'en-GB',
    label: 'English (UK)',
  },
  {
    code: 'de',
    name: 'Germany',
    flag: 'https://flagcdn.com/32x24/de.png',
    currency: 'EUR',
    currencySymbol: '€',
    language: 'German',
    locale: 'de-DE',
    label: 'Deutsch',
  },
  {
    code: 'fr',
    name: 'France',
    flag: 'https://flagcdn.com/32x24/fr.png',
    currency: 'EUR',
    currencySymbol: '€',
    language: 'French',
    locale: 'fr-FR',
    label: 'Français',
  },
  {
    code: 'jp',
    name: 'Japan',
    flag: 'https://flagcdn.com/32x24/jp.png',
    currency: 'JPY',
    currencySymbol: '¥',
    language: 'Japanese',
    locale: 'ja-JP',
    label: '日本語',
  },
  {
    code: 'ng',
    name: 'Nigeria',
    flag: 'https://flagcdn.com/32x24/ng.png',
    currency: 'NGN',
    currencySymbol: '₦',
    language: 'English',
    locale: 'en-NG',
    label: 'English (NG)',
  },
  {
    code: 'za',
    name: 'South Africa',
    flag: 'https://flagcdn.com/32x24/za.png',
    currency: 'ZAR',
    currencySymbol: 'R',
    language: 'English',
    locale: 'en-ZA',
    label: 'English (ZA)',
  },
  {
    code: 'ke',
    name: 'Kenya',
    flag: 'https://flagcdn.com/32x24/ke.png',
    currency: 'KES',
    currencySymbol: 'KSh',
    language: 'English',
    locale: 'en-KE',
    label: 'English (KE)',
  },
  {
    code: 'ae',
    name: 'UAE',
    flag: 'https://flagcdn.com/32x24/ae.png',
    currency: 'AED',
    currencySymbol: 'AED',
    language: 'English',
    locale: 'en-AE',
    label: 'English (AE)',
  },
];

interface ExchangeRates {
  [currency: string]: number;
}

interface LocalizationContextType {
  selectedCountry: CountryData;
  setSelectedCountry: (country: CountryData) => void;
  currency: string;
  currencySymbol: string;
  locale: string;
  language: string;
  exchangeRates: ExchangeRates;
  convertCurrency: (amount: number, fromCurrency: string, toCurrency?: string) => number;
  formatPrice: (amount: number, currency?: string) => string;
  isLoadingRates: boolean;
}

const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

const STORAGE_KEY = 'user_localization_preferences';
const EXCHANGE_RATES_KEY = 'exchange_rates_cache';
const CACHE_DURATION = 3600000; // 1 hour in milliseconds

interface LocalizationProviderProps {
  children: ReactNode;
}

export const LocalizationProvider: React.FC<LocalizationProviderProps> = ({ children }) => {
  const [selectedCountry, setSelectedCountryState] = useState<CountryData>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const country = countries.find(c => c.code === parsed.countryCode);
        return country || countries[0];
      } catch {
        return countries[0];
      }
    }
    return countries[0];
  });

  const [exchangeRates, setExchangeRates] = useState<ExchangeRates>(() => {
    const cached = localStorage.getItem(EXCHANGE_RATES_KEY);
    if (cached) {
      try {
        const { rates, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_DURATION) {
          return rates;
        }
      } catch {
        // Invalid cache, will fetch fresh rates
      }
    }
    return { USD: 1 }; // Default base rate
  });

  const [isLoadingRates, setIsLoadingRates] = useState(false);

  // Fetch exchange rates
  useEffect(() => {
    const fetchExchangeRates = async () => {
      try {
        setIsLoadingRates(true);

        // Using exchangerate-api.com (free tier: 1,500 requests/month)
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');

        if (!response.ok) {
          throw new Error('Failed to fetch exchange rates');
        }

        const data = await response.json();
        const rates = data.rates;

        setExchangeRates(rates);

        // Cache the rates
        localStorage.setItem(EXCHANGE_RATES_KEY, JSON.stringify({
          rates,
          timestamp: Date.now(),
        }));
      } catch (error) {
        console.error('Error fetching exchange rates:', error);
        // Keep using cached rates or defaults
      } finally {
        setIsLoadingRates(false);
      }
    };

    // Check if we need to fetch fresh rates
    const cached = localStorage.getItem(EXCHANGE_RATES_KEY);
    let shouldFetch = true;

    if (cached) {
      try {
        const { timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_DURATION) {
          shouldFetch = false;
        }
      } catch {
        // Invalid cache, will fetch
      }
    }

    if (shouldFetch) {
      fetchExchangeRates();
    }
  }, []);

  const setSelectedCountry = (country: CountryData) => {
    setSelectedCountryState(country);

    // Persist to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      countryCode: country.code,
    }));
  };

  const convertCurrency = (amount: number, fromCurrency: string, toCurrency?: string): number => {
    const targetCurrency = toCurrency || selectedCountry.currency;

    if (fromCurrency === targetCurrency) {
      return amount;
    }

    // Convert to USD first (base currency)
    const amountInUSD = fromCurrency === 'USD'
      ? amount
      : amount / (exchangeRates[fromCurrency] || 1);

    // Convert from USD to target currency
    const convertedAmount = targetCurrency === 'USD'
      ? amountInUSD
      : amountInUSD * (exchangeRates[targetCurrency] || 1);

    return Math.round(convertedAmount * 100) / 100; // Round to 2 decimal places
  };

  const formatPrice = (amount: number, currency?: string): string => {
    const curr = currency || selectedCountry.currency;
    const symbol = currency
      ? countries.find(c => c.currency === currency)?.currencySymbol || curr
      : selectedCountry.currencySymbol;

    // Format using the selected locale
    try {
      const formatted = new Intl.NumberFormat(selectedCountry.locale, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(amount);

      return `${symbol}${formatted}`;
    } catch {
      // Fallback formatting
      return `${symbol}${amount.toLocaleString()}`;
    }
  };

  const value: LocalizationContextType = {
    selectedCountry,
    setSelectedCountry,
    currency: selectedCountry.currency,
    currencySymbol: selectedCountry.currencySymbol,
    locale: selectedCountry.locale,
    language: selectedCountry.language,
    exchangeRates,
    convertCurrency,
    formatPrice,
    isLoadingRates,
  };

  return (
    <LocalizationContext.Provider value={value}>
      {children}
    </LocalizationContext.Provider>
  );
};

export const useLocalization = (): LocalizationContextType => {
  const context = useContext(LocalizationContext);
  if (!context) {
    throw new Error('useLocalization must be used within a LocalizationProvider');
  }
  return context;
};
