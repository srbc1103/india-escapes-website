# Translation & Currency Setup Guide

## Overview

This project supports **multi-language translations** and **dynamic currency conversion** with live exchange rates.

### Supported Languages
- **English** (en)
- **Spanish** (es)
- **French** (fr)
- **German** (de)
- **Italian** (it)
- **Portuguese** (pt)
- **Dutch** (nl)
- **Polish** (pl)
- **Russian** (ru)
- **Chinese** (zh)
- **Japanese** (ja)
- **Korean** (ko)

### Supported Currencies
- INR (Indian Rupee)
- USD (US Dollar)
- EUR (Euro)
- GBP (British Pound)
- AUD (Australian Dollar)
- CAD (Canadian Dollar)
- JPY (Japanese Yen)
- CNY (Chinese Yuan)

---

## Translation System

### How It Works

1. **Static Translations**: Pre-defined translations for UI elements (navigation, buttons, etc.) are stored in `lib/translations.js`

2. **Dynamic Translation**: Content that's not pre-translated automatically uses Google Translate API

3. **Caching**: Translations are cached to minimize API calls

### Setup Google Translate API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable **Cloud Translation API**
4. Create credentials (API Key)
5. Add to your `.env.local`:
   ```bash
   NEXT_PUBLIC_GOOGLE_TRANSLATE_API_KEY=your_api_key_here
   ```

### Usage in Components

```javascript
import { useTranslation } from '../hooks/useTranslation';

function MyComponent() {
  const { t, tDynamic, language } = useTranslation();

  // For static UI text (fast, uses dictionary)
  const buttonText = t('nav.contact');

  // For dynamic content (uses Google Translate API)
  const translatedDescription = await tDynamic(description);

  return (
    <div>
      <button>{buttonText}</button>
      <p>{translatedDescription}</p>
    </div>
  );
}
```

### Adding New Translation Keys

Edit `lib/translations.js` and add your keys:

```javascript
export const translations = {
  en: {
    'your.new.key': 'Your English Text',
  },
  es: {
    'your.new.key': 'Tu Texto en Español',
  },
  // Add for other languages...
};
```

---

## Currency Exchange System

### How It Works

1. **Live Exchange Rates**: Fetched daily from Exchange Rate API
2. **24-Hour Cache**: Rates are cached for 24 hours to reduce API calls
3. **Fallback Rates**: If API fails, fallback rates are used from `constants.js`

### Setup Exchange Rate API

#### Option 1: Free API (Recommended for development)
No setup needed! The app uses the free API by default:
```bash
EXCHANGE_RATE_API_URL=https://api.exchangerate-api.com/v4/latest/INR
```

Limits: 1500 requests/month

#### Option 2: ExchangeRate-API.com (Recommended for production)
1. Sign up at [ExchangeRate-API.com](https://www.exchangerate-api.com/)
2. Get your free API key (100,000 requests/month on free tier)
3. Add to `.env.local`:
   ```bash
   EXCHANGE_RATE_API_URL=https://v6.exchangerate-api.com/v6/YOUR_API_KEY/latest/INR
   EXCHANGE_RATE_API_KEY=your_api_key_here
   ```

#### Option 3: Open Exchange Rates
1. Sign up at [OpenExchangeRates.org](https://openexchangerates.org/)
2. Get your API key
3. Add to `.env.local`:
   ```bash
   EXCHANGE_RATE_API_URL=https://openexchangerates.org/api/latest.json
   EXCHANGE_RATE_API_KEY=your_api_key_here
   ```

### Usage in Components

```javascript
import { useCurrency } from '../context/CurrencyContext';

function PriceDisplay() {
  const {
    currency,
    changeCurrency,
    formatPrice,
    convertPrice,
    exchangeRates,
    ratesLoading,
  } = useCurrency();

  const priceInINR = 50000; // Base price in INR

  return (
    <div>
      {/* Format price with symbol */}
      <p>{formatPrice(priceInINR)}</p> {/* Displays: $600 */}

      {/* Get converted value only */}
      <p>{convertPrice(priceInINR, 'EUR')}</p> {/* Displays: 550.00 */}

      {/* Change currency */}
      <button onClick={() => changeCurrency('USD')}>
        Switch to USD
      </button>

      {/* Show exchange rates */}
      <pre>{JSON.stringify(exchangeRates, null, 2)}</pre>
    </div>
  );
}
```

### API Route

Exchange rates are fetched through `/api/exchange-rates`:

```javascript
// Fetch rates manually
const response = await fetch('/api/exchange-rates');
const data = await response.json();

console.log(data);
// {
//   status: 'success',
//   rates: { INR: 1, USD: 0.012, EUR: 0.011, ... },
//   source: 'api', // or 'cache' or 'fallback'
//   lastUpdated: '2025-01-15T10:30:00.000Z'
// }
```

---

## Best Practices

### Translations

1. **Use `t()` for UI elements**: Navigation, buttons, labels, static text
2. **Use `tDynamic()` for content**: Descriptions, user-generated content, dynamic text
3. **Add keys to dictionary**: For frequently used text to avoid API calls
4. **Cache translations**: The system caches translations automatically

### Currency

1. **Store prices in INR**: Always store base prices in INR in your database
2. **Convert on display**: Use `formatPrice()` to display in user's currency
3. **Refresh rates**: The system auto-refreshes rates every 24 hours
4. **Manual refresh**: Call `refreshRates()` if needed

### Performance

1. **Minimize API calls**: Use static translations where possible
2. **Batch translations**: Use Google Translate batch API for multiple texts
3. **Cache aggressively**: Both translations and exchange rates are cached
4. **Lazy loading**: Only translate what's visible to the user

---

## Testing

### Test Translations

```javascript
// Change language
changeLanguage('fr'); // Switch to French
changeLanguage('de'); // Switch to German

// Check if translation works
console.log(t('nav.contact')); // Should display in selected language
```

### Test Currency Conversion

```javascript
// Change currency
changeCurrency('EUR');

// Check conversion
console.log(formatPrice(10000)); // Should display: €110
console.log(convertPrice(10000, 'USD')); // Should return: "120.00"
```

### Test Exchange Rate API

Visit: `http://localhost:3000/api/exchange-rates`

You should see:
```json
{
  "status": "success",
  "rates": {
    "INR": 1,
    "USD": 0.012,
    "EUR": 0.011,
    ...
  },
  "source": "api",
  "lastUpdated": "2025-01-15T10:30:00.000Z"
}
```

---

## Troubleshooting

### Translations not working

1. **Check API key**: Ensure `NEXT_PUBLIC_GOOGLE_TRANSLATE_API_KEY` is set
2. **Check console**: Look for translation errors in browser console
3. **Verify language code**: Ensure language code is valid (en, es, fr, etc.)
4. **Clear cache**: Try clearing browser cache and localStorage

### Currency not converting

1. **Check API**: Visit `/api/exchange-rates` to verify API is working
2. **Check console**: Look for errors in browser console
3. **Verify fallback**: Fallback rates should work even if API fails
4. **Wait for cache**: Initial load might take a moment to fetch rates

### API Rate Limits

If you hit rate limits:
1. **Upgrade API plan**: Get a paid plan for higher limits
2. **Increase cache duration**: Modify cache duration in `route.js`
3. **Use fallback rates**: The app works fine with fallback rates

---

## Support

For issues or questions:
- Check the `.env.local.example` file for configuration examples
- Review the API documentation for your chosen services
- Check the browser console for error messages
