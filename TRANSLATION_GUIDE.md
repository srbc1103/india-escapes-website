# Translation System Guide

This project uses a **hybrid translation approach**:
- **Static translations** for UI elements (fast, no cost)
- **Google Translate API** for dynamic content (automatic, many languages)

## Setup

### 1. Get Google Translate API Key (Optional but Recommended)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable "Cloud Translation API"
4. Go to "Credentials" → "Create Credentials" → "API Key"
5. Copy the API key

### 2. Add API Key to Environment Variables

Create/edit `.env.local` in your project root:

```env
NEXT_PUBLIC_GOOGLE_TRANSLATE_API_KEY=your_api_key_here
```

**Note:** Without this key, only static translations will work (which is fine for most UI elements).

## Usage

### Option 1: Static Translations (Recommended for UI)

**Best for:** Buttons, navigation, labels, common phrases

```javascript
import { useTranslation } from './hooks/useTranslation';

function MyComponent() {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('nav.trips')}</h1>
      <button>{t('common.viewAll')}</button>
      <p>{t('footer.contactUs')}</p>
    </div>
  );
}
```

**Pros:**
- ✅ Fast (no API call)
- ✅ No cost
- ✅ Works offline
- ✅ Consistent translations

**Cons:**
- ❌ Need to manually add translations for new languages
- ❌ Limited to pre-defined phrases

### Option 2: Dynamic Translation (Google Translate API)

**Best for:** Package descriptions, user reviews, blog content

```javascript
import { useTranslation } from './hooks/useTranslation';

function PackageDescription({ description }) {
  const { tDynamic } = useTranslation();
  const [translated, setTranslated] = useState(description);

  useEffect(() => {
    tDynamic(description).then(setTranslated);
  }, [description]);

  return <p>{translated}</p>;
}
```

**Or use the hook with loading state:**

```javascript
import { useDynamicTranslation } from './hooks/useTranslation';

function PackageDescription({ description }) {
  const { translatedText, isTranslating } = useDynamicTranslation(description);

  if (isTranslating) {
    return <p>Translating...</p>;
  }

  return <p>{translatedText}</p>;
}
```

**Pros:**
- ✅ Automatic for any text
- ✅ Supports 100+ languages
- ✅ No manual translation needed
- ✅ Always up-to-date

**Cons:**
- ❌ Requires API key
- ❌ Costs money (but very cheap: $20 per 1M characters)
- ❌ Slower (API call)
- ❌ Requires internet

## Supported Languages

Currently configured languages in constants.js:

| Code | Language | Static | Dynamic (API) |
|------|----------|--------|---------------|
| en   | English  | ✅     | ✅            |
| hi   | Hindi    | ✅     | ✅            |
| es   | Spanish  | ✅     | ✅            |
| ta   | Tamil    | ✅     | ✅            |
| te   | Telugu   | ✅     | ✅            |
| kn   | Kannada  | ✅     | ✅            |
| ml   | Malayalam| ✅     | ✅            |
| bn   | Bengali  | ✅     | ✅            |
| mr   | Marathi  | ✅     | ✅            |

**To add more languages:**

1. Add to `constants.js`:
```javascript
export const LANGUAGES = [
  // ... existing
  { code: "fr", name: "French" },
];
```

2. If using static translations, add to `lib/translations.js`:
```javascript
fr: {
  'nav.trips': 'Voyages',
  // ... more translations
}
```

3. If using dynamic translation, it works automatically! 🎉

## Available Translation Keys

### Navigation
- `nav.trips`, `nav.deals`, `nav.contact`, `nav.about`
- `nav.tripTypes`, `nav.destinations`

### Common
- `common.from`, `common.perPerson`, `common.viewAll`
- `common.day`, `common.days`, `common.night`, `common.nights`

### Package Details
- `package.hotels`, `package.sightSeeing`, `package.meals`, `package.transport`
- `package.inclusions`, `package.itinerary`, `package.gallery`

### Detail Page
- `detail.description`, `detail.itinerary`, `detail.overview`
- `detail.getCallback`, `detail.getQuote`, `detail.talkToExpert`
- `detail.showMore`, `detail.showLess`

### Footer
- `footer.talkToSpecialist`, `footer.sendQuery`
- `footer.destinations`, `footer.tours`, `footer.aboutUs`

### Home Page
- `home.hero`, `home.searchPlaceholder`
- `home.aboutUs`, `home.whyBest`, `home.bestMarket`

[See full list in `lib/translations.js`]

## Best Practices

### ✅ DO:
1. **Use static translations (`t()`) for:**
   - Navigation menus
   - Button labels
   - Form fields
   - Common UI elements

2. **Use dynamic translation (`tDynamic()`) for:**
   - Package descriptions
   - User-generated content
   - Blog posts
   - Long paragraphs

3. **Cache dynamic translations** when possible
4. **Show loading state** during translation
5. **Fallback to English** if translation fails

### ❌ DON'T:
1. Don't translate the same text multiple times
2. Don't use dynamic translation for frequently used UI elements (costly)
3. Don't forget to handle loading states
4. Don't translate user names, place names, or proper nouns

## Cost Estimation

Google Translate API pricing:
- **$20 per 1 million characters**
- Average webpage: ~5,000 characters = $0.10
- 10,000 page views = $10/month

**Free alternative:** Use only static translations (already included for 9 languages!)

## Testing

Test translations:
```bash
# Set language in browser
# Check localStorage: language = 'hi'

# Or programmatically:
import { useLanguage } from './context/LanguageContext';
const { changeLanguage } = useLanguage();
changeLanguage('hi');
```

## Troubleshooting

**Issue:** Translations not showing
- Check if API key is set (for dynamic)
- Check browser console for errors
- Verify language code is supported

**Issue:** "Translation API error"
- Check if API key is valid
- Ensure Translation API is enabled in Google Cloud
- Check API quota limits

**Issue:** Slow translations
- Use static translations for UI elements
- Implement caching
- Consider pre-translating content

## Migration from Manual to Google Translate

If you want to reduce manual translations and use Google Translate:

1. Keep existing static translations for UI (fast, free)
2. Remove manual translations for content descriptions
3. Use `useDynamicTranslation` for those fields
4. Monitor API costs

## Support

For more information:
- [Google Translate API Docs](https://cloud.google.com/translate/docs)
- [Next.js i18n](https://nextjs.org/docs/advanced-features/i18n-routing)
