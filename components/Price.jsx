'use client'

import { useCurrency } from '../context/CurrencyContext';
import { formatNumber } from '../functions';

/**
 * Component to display formatted prices with automatic currency conversion
 * @param {number} amount - Price in INR
 * @param {string} [currency] - Currency code (optional, defaults to user's selected currency)
 * @param {string} [className] - CSS classes
 */
export default function Price({ amount, currency, className = '' }) {
  const { currency: userCurrency, exchangeRates } = useCurrency();

  const currencyCode = currency || userCurrency;
  const formatted = formatNumber(amount, currencyCode, exchangeRates);

  return <span className={className}>{formatted}</span>;
}

/**
 * Component to display price range
 */
export function PriceRange({ from, to, currency, className = '' }) {
  const { currency: userCurrency, exchangeRates } = useCurrency();

  const currencyCode = currency || userCurrency;
  const formattedFrom = formatNumber(from, currencyCode, exchangeRates);
  const formattedTo = formatNumber(to, currencyCode, exchangeRates);

  return (
    <span className={className}>
      {formattedFrom} - {formattedTo}
    </span>
  );
}
