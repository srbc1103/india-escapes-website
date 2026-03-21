# Translation Examples

## Example 1: Simple UI Component (Static Translation)

```javascript
'use client'

import { useTranslation } from './hooks/useTranslation';

export default function SimpleComponent() {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('nav.trips')}</h1>
      <button>{t('common.viewAll')}</button>
    </div>
  );
}
```

## Example 2: Package Description (Dynamic Translation)

```javascript
'use client'

import { useDynamicTranslation } from './hooks/useTranslation';

export default function PackageDescription({ description }) {
  const { translatedText, isTranslating } = useDynamicTranslation(description);

  return (
    <div>
      {isTranslating ? (
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      ) : (
        <p>{translatedText}</p>
      )}
    </div>
  );
}
```

## Example 3: Mixed (Static + Dynamic)

```javascript
'use client'

import { useTranslation, useDynamicTranslation } from './hooks/useTranslation';

export default function PackageCard({ name, description, price }) {
  const { t } = useTranslation();
  const { translatedText: translatedDesc } = useDynamicTranslation(description);

  return (
    <div className="border rounded-lg p-4">
      {/* Package name stays in original language */}
      <h2 className="text-xl font-bold">{name}</h2>

      {/* Description is translated */}
      <p className="text-gray-600">{translatedDesc}</p>

      {/* Static UI elements */}
      <div className="mt-4">
        <span className="text-sm text-gray-500">{t('common.from')}</span>
        <span className="text-lg font-bold ml-2">{price}</span>
        <span className="text-sm text-gray-500 ml-1">{t('common.perPerson')}</span>
      </div>

      <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">
        {t('detail.getQuote')}
      </button>
    </div>
  );
}
```

## Example 4: Translating Multiple Texts

```javascript
'use client'

import { useTranslation } from './hooks/useTranslation';
import { translateBatch } from './lib/googleTranslate';
import { useState, useEffect } from 'react';

export default function Reviews({ reviews }) {
  const { language } = useTranslation();
  const [translatedReviews, setTranslatedReviews] = useState(reviews);

  useEffect(() => {
    if (language === 'en') {
      setTranslatedReviews(reviews);
      return;
    }

    const texts = reviews.map(r => r.text);
    translateBatch(texts, language).then(translated => {
      const newReviews = reviews.map((review, i) => ({
        ...review,
        text: translated[i]
      }));
      setTranslatedReviews(newReviews);
    });
  }, [reviews, language]);

  return (
    <div>
      {translatedReviews.map((review, i) => (
        <div key={i} className="border-b py-4">
          <p className="font-bold">{review.author}</p>
          <p>{review.text}</p>
        </div>
      ))}
    </div>
  );
}
```

## Example 5: Conditional Translation (Save API Calls)

```javascript
'use client'

import { useDynamicTranslation } from './hooks/useTranslation';

export default function ConditionalTranslation({ text, shouldTranslate = true }) {
  // Only translate if shouldTranslate is true (e.g., user preference)
  const { translatedText, isTranslating } = useDynamicTranslation(
    text,
    shouldTranslate
  );

  return <p>{translatedText}</p>;
}

// Usage:
<ConditionalTranslation
  text="This is English content"
  shouldTranslate={userPreference.autoTranslate}
/>
```

## Example 6: Form with Translations

```javascript
'use client'

import { useTranslation } from './hooks/useTranslation';
import { useState } from 'react';

export default function ContactForm() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  return (
    <form className="space-y-4">
      <div>
        <label className="block text-sm font-medium">
          {t('form.name')}
        </label>
        <input
          type="text"
          placeholder={t('form.name')}
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">
          {t('form.email')}
        </label>
        <input
          type="email"
          placeholder={t('form.email')}
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">
          {t('form.message')}
        </label>
        <textarea
          placeholder={t('form.message')}
          value={formData.message}
          onChange={(e) => setFormData({...formData, message: e.target.value})}
          className="w-full border rounded px-3 py-2"
          rows={4}
        />
      </div>

      <button type="submit" className="bg-blue-500 text-white px-6 py-2 rounded">
        {t('form.submit')}
      </button>
    </form>
  );
}
```

## Example 7: SEO Meta Tags with Translation

```javascript
'use client'

import { useTranslation, useDynamicTranslation } from './hooks/useTranslation';
import Head from 'next/head';

export default function PackagePage({ pkg }) {
  const { t } = useTranslation();
  const { translatedText: translatedTitle } = useDynamicTranslation(pkg.seoTitle);
  const { translatedText: translatedDesc } = useDynamicTranslation(pkg.seoDescription);

  return (
    <>
      <Head>
        <title>{translatedTitle}</title>
        <meta name="description" content={translatedDesc} />
      </Head>

      <div>
        <h1>{pkg.name}</h1>
        {/* ... rest of content */}
      </div>
    </>
  );
}
```

## Example 8: Translation Toggle Button

```javascript
'use client'

import { useLanguage } from './context/LanguageContext';
import { LANGUAGES } from './constants';

export default function LanguageSwitcher() {
  const { language, changeLanguage } = useLanguage();

  return (
    <div className="flex gap-2">
      {LANGUAGES.map((lang) => (
        <button
          key={lang.code}
          onClick={() => changeLanguage(lang.code)}
          className={`px-3 py-1 rounded ${
            language === lang.code
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200'
          }`}
        >
          {lang.name}
        </button>
      ))}
    </div>
  );
}
```

## Performance Tips

### 1. Memoize Translations

```javascript
import { useMemo } from 'react';
import { useTranslation } from './hooks/useTranslation';

function MyComponent() {
  const { t } = useTranslation();

  // Memoize translated values
  const translations = useMemo(() => ({
    title: t('nav.trips'),
    subtitle: t('common.viewAll'),
    button: t('detail.getQuote')
  }), [t]);

  return <div>{translations.title}</div>;
}
```

### 2. Batch API Calls

```javascript
// Instead of translating one by one:
// ❌ BAD
const text1 = await translateText(description1, 'hi');
const text2 = await translateText(description2, 'hi');
const text3 = await translateText(description3, 'hi');

// ✅ GOOD - Use batch translation
const [text1, text2, text3] = await translateBatch(
  [description1, description2, description3],
  'hi'
);
```

### 3. Pre-translate on Build

For static content, pre-translate during build time:

```javascript
// In getStaticProps or during build
export async function getStaticProps() {
  const packages = await fetchPackages();

  // Pre-translate for all languages
  const translations = {};
  for (const lang of LANGUAGES) {
    translations[lang.code] = await translateBatch(
      packages.map(p => p.description),
      lang.code
    );
  }

  return { props: { packages, translations } };
}
```
