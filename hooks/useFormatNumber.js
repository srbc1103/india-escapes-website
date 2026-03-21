'use client'

import { useCurrency } from '../context/CurrencyContext';
import { formatNumber } from '../functions';

/**
 * Hook that wraps formatNumber with automatic exchange rates from context
 * @returns {function} - formatNumber function with context-aware exchange rates
 */
export function useFormatNumber() {
  const { currency, exchangeRates } = useCurrency();

  /**
   * Format a number with currency symbol and exchange rate
   * @param {number} num - Number to format (in INR)
   * @param {string} [currencyCode] - Currency code (defaults to user's selected currency)
   * @returns {string} - Formatted price string
   */
  const format = (num, currencyCode = currency) => {
    return formatNumber(num, currencyCode, exchangeRates);
  };

  return format;
}
