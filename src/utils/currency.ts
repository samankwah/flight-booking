/**
 * Currency utility functions
 */

/**
 * Converts currency code to its symbol
 * @param currencyCode - ISO 4217 currency code (e.g., 'USD', 'EUR', 'GHS')
 * @returns Currency symbol or code if symbol not found
 */
export const getCurrencySymbol = (currencyCode?: string): string => {
  const code = currencyCode?.toUpperCase() || 'USD';
  const symbols: Record<string, string> = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'GHS': 'GHS',
    'NGN': '₦',
    'ZAR': 'R',
    'KES': 'KSh',
    'EGP': 'E£',
    'MAD': 'MAD',
    'TZS': 'TSh',
    'UGX': 'USh',
    'XOF': 'CFA',
    'XAF': 'FCFA',
    'AED': 'AED',
    'PKR': 'Rs',
  };
  return symbols[code] || code;
};

/**
 * Formats a price with currency symbol
 * @param amount - The amount to format
 * @param currencyCode - ISO 4217 currency code
 * @returns Formatted price string with currency symbol
 */
export const formatPrice = (amount: number, currencyCode?: string): string => {
  const symbol = getCurrencySymbol(currencyCode);
  return `${symbol}${amount.toLocaleString()}`;
};
