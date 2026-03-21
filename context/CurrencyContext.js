'use client'

import { createContext, useContext, useState, useEffect } from "react";
import { FALLBACK_EXCHANGE_RATES } from "../constants";

const CurrencyContext = createContext();

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState(() => {
    // Load from localStorage or default to 'INR'
    return typeof window !== "undefined"
      ? localStorage.getItem("currency") || "INR"
      : "INR";
  });

  const [exchangeRates, setExchangeRates] = useState(FALLBACK_EXCHANGE_RATES);
  const [ratesLoading, setRatesLoading] = useState(true);
  const [ratesError, setRatesError] = useState(null);

  // Fetch exchange rates on mount
  useEffect(() => {
    fetchExchangeRates();
  }, []);

  useEffect(() => {
    localStorage.setItem("currency", currency);
  }, [currency]);

  const fetchExchangeRates = async () => {
    try {
      setRatesLoading(true);
      setRatesError(null);

      const response = await fetch('/api/exchange-rates');
      const data = await response.json();

      if (data.status === 'success' && data.rates) {
        setExchangeRates(data.rates);
        // console.log(`Exchange rates loaded from ${data.source}`, data.lastUpdated);
      } else {
        throw new Error('Failed to fetch exchange rates');
      }
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
      setRatesError(error.message);
      // Keep using fallback rates
      setExchangeRates(FALLBACK_EXCHANGE_RATES);
    } finally {
      setRatesLoading(false);
    }
  };

  const changeCurrency = (newCurrency) => {
    setCurrency(newCurrency);
  };

  const convertPrice = (priceInINR, toCurrency = currency) => {
    if (!priceInINR || priceInINR === 0) return 0;
    const rate = exchangeRates[toCurrency] || 1;
    return (priceInINR * rate).toFixed(2);
  };

  const formatPrice = (priceInINR, toCurrency = currency) => {
    const converted = convertPrice(priceInINR, toCurrency);
    const currencySymbols = {
      INR: '₹',
      USD: '$',
      EUR: '€',
      GBP: '£',
      AUD: 'A$',
      CAD: 'C$',
      JPY: '¥',
      CNY: '¥',
    };
    const symbol = currencySymbols[toCurrency] || toCurrency;

    // Format with commas for better readability
    const formatted = Number(converted).toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

    return `${symbol}${formatted}`;
  };

  return (
    <CurrencyContext.Provider value={{
      currency,
      changeCurrency,
      exchangeRates,
      ratesLoading,
      ratesError,
      convertPrice,
      formatPrice,
      refreshRates: fetchExchangeRates,
    }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);