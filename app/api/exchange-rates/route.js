// app/api/exchange-rates/route.js   (or pages/api/exchange-rates.js)
import { NextResponse } from 'next/server';
import { FALLBACK_EXCHANGE_RATES } from '../../../constants';

const EXCHANGE_API_URL =
  process.env.EXCHANGE_RATE_API_URL || 'https://api.exchangerate-api.com/v4/latest/INR';
const EXCHANGE_API_KEY = process.env.EXCHANGE_RATE_API_KEY; // optional for some providers

export async function GET() {
  try {
    // Build the request URL
    const url = EXCHANGE_API_KEY
      ? `${EXCHANGE_API_URL}?access_key=${EXCHANGE_API_KEY}`
      : EXCHANGE_API_URL;

    const res = await fetch(url, {
      // ISR revalidation – keeps edge cache fresh every 24h without blocking the request
      next: { revalidate: 86_400 },
    });

    if (!res.ok) {
      throw new Error(`Exchange rate API error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();

    // Normalise to INR as base currency
    const base = data.base || 'INR';
    let rates = {};

    if (base === 'INR') {
      rates = {
        INR: 1,
        USD: data.rates?.USD ?? FALLBACK_EXCHANGE_RATES.USD,
        EUR: data.rates?.EUR ?? FALLBACK_EXCHANGE_RATES.EUR,
        GBP: data.rates?.GBP ?? FALLBACK_EXCHANGE_RATES.GBP,
        AUD: data.rates?.AUD ?? FALLBACK_EXCHANGE_RATES.AUD,
        CAD: data.rates?.CAD ?? FALLBACK_EXCHANGE_RATES.CAD,
        JPY: data.rates?.JPY ?? FALLBACK_EXCHANGE_RATES.JPY,
        CNY: data.rates?.CNY ?? FALLBACK_EXCHANGE_RATES.CNY,
      };
    } else if (base === 'EUR' || base === 'USD') {
      // Convert any non-INR base to INR base
      const inrRate = data.rates?.INR;
      if (!inrRate) throw new Error('INR rate missing in API response');

      const convert = (foreignRate) => (foreignRate ? foreignRate / inrRate : null);

      rates = {
        INR: 1,
        USD: convert(data.rates?.USD) ?? FALLBACK_EXCHANGE_RATES.USD,
        EUR: convert(data.rates?.EUR) ?? FALLBACK_EXCHANGE_RATES.EUR,
        GBP: convert(data.rates?.GBP) ?? FALLBACK_EXCHANGE_RATES.GBP,
        AUD: convert(data.rates?.AUD) ?? FALLBACK_EXCHANGE_RATES.AUD,
        CAD: convert(data.rates?.CAD) ?? FALLBACK_EXCHANGE_RATES.CAD,
        JPY: convert(data.rates?.JPY) ?? FALLBACK_EXCHANGE_RATES.JPY,
        CNY: convert(data.rates?.CNY) ?? FALLBACK_EXCHANGE_RATES.CNY,
      };

      // Clean rounding
      Object.keys(rates).forEach((k) => {
        if (k !== 'INR' && rates[k] !== null) {
          rates[k] = Number(rates[k].toFixed(6));
        }
      });
    } else {
      throw new Error(`Unsupported base currency: ${base}`);
    }

    return NextResponse.json({
      status: 'success',
      rates,
      source: 'api',
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Exchange rate fetch failed:', error.message);

    return NextResponse.json(
      {
        status: 'success', // keep 200 so the UI never breaks
        rates: FALLBACK_EXCHANGE_RATES,
        source: 'fallback',
        error: error.message,
        lastUpdated: null,
      },
      { status: 200 }
    );
  }
}