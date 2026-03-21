// Google Translate API integration
// Note: You need to add NEXT_PUBLIC_GOOGLE_TRANSLATE_API_KEY to your .env.local file

const TRANSLATE_API_URL = 'https://translation.googleapis.com/language/translate/v2';
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_TRANSLATE_API_KEY;

// In-memory cache to reduce API calls
const translationCache = new Map();

/**
 * Translates text using Google Translate API
 * @param {string} text - Text to translate
 * @param {string} targetLang - Target language code (en, hi, es, etc.)
 * @param {string} sourceLang - Source language code (default: 'en')
 * @returns {Promise<string>} - Translated text
 */
export async function translateText(text, targetLang, sourceLang = 'en') {
  // If target is same as source, return as is
  if (targetLang === sourceLang) {
    return text;
  }

  // Check cache first
  const cacheKey = `${sourceLang}:${targetLang}:${text}`;
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey);
  }

  // If no API key, return original text
  if (!API_KEY) {
    console.warn('Google Translate API key not found. Set NEXT_PUBLIC_GOOGLE_TRANSLATE_API_KEY in .env.local');
    return text;
  }

  try {
    const response = await fetch(
      `${TRANSLATE_API_URL}?key=${API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: text,
          target: targetLang,
          source: sourceLang,
          format: 'text',
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Translation API error: ${response.statusText}`);
    }

    const data = await response.json();
    const translated = data.data.translations[0].translatedText;

    // Cache the result
    translationCache.set(cacheKey, translated);

    return translated;
  } catch (error) {
    console.error('Translation error:', error);
    return text; // Return original text on error
  }
}

/**
 * Translates multiple texts at once (batch translation)
 * @param {string[]} texts - Array of texts to translate
 * @param {string} targetLang - Target language code
 * @param {string} sourceLang - Source language code (default: 'en')
 * @returns {Promise<string[]>} - Array of translated texts
 */
export async function translateBatch(texts, targetLang, sourceLang = 'en') {
  if (targetLang === sourceLang) {
    return texts;
  }

  if (!API_KEY) {
    console.warn('Google Translate API key not found');
    return texts;
  }

  try {
    const response = await fetch(
      `${TRANSLATE_API_URL}?key=${API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: texts,
          target: targetLang,
          source: sourceLang,
          format: 'text',
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Translation API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data.translations.map(t => t.translatedText);
  } catch (error) {
    console.error('Batch translation error:', error);
    return texts;
  }
}

/**
 * Clear translation cache
 */
export function clearTranslationCache() {
  translationCache.clear();
}

/**
 * Get cache size
 */
export function getCacheSize() {
  return translationCache.size;
}
