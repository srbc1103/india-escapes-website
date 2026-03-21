'use client'

import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { getTranslationSync } from '../lib/translations';
import { translateText } from '../lib/googleTranslate';

export function useTranslation() {
  const { language } = useLanguage();
  const [translatedUI, setTranslatedUI] = useState({});
  const [isTranslating, setIsTranslating] = useState(false);

  /**
   * Translate using static dictionary (fast, no API cost)
   * Falls back to Google Translate API for missing translations
   * Use this for UI elements, buttons, navigation, etc.
   */
  const t = (key) => {
    // First, try to get from static translations
    const staticTranslation = getTranslationSync(language, key);

    // If it's not English and we got the English fallback (meaning no translation exists),
    // we might need to use Google Translate API
    // But for performance, we return the static translation immediately
    // and cache API translations for future use
    return staticTranslation;
  };

  /**
   * Translate dynamic text using Google Translate API
   * Use this for user-generated content, descriptions, etc.
   * @param {string} text - Text to translate
   * @returns {Promise<string>} - Translated text
   */
  const tDynamic = async (text) => {
    if (language === 'en' || !text) {
      return text;
    }
    return await translateText(text, language, 'en');
  };

  /**
   * Translate UI text with Google Translate API if not available in static dictionary
   * This is useful for languages we don't have full translations for yet
   * @param {string} key - Translation key
   * @returns {Promise<string>} - Translated text
   */
  const tWithAPI = async (key) => {
    const staticTranslation = getTranslationSync(language, key);
    const englishText = getTranslationSync('en', key);

    // If we have a proper translation (not just the key), return it
    if (staticTranslation !== englishText && staticTranslation !== key) {
      return staticTranslation;
    }

    // If target is English, return as is
    if (language === 'en') {
      return englishText;
    }

    // Check cache first
    if (translatedUI[key]) {
      return translatedUI[key];
    }

    // Use Google Translate API
    try {
      const translated = await translateText(englishText, language, 'en');
      // Cache the result
      setTranslatedUI(prev => ({ ...prev, [key]: translated }));
      return translated;
    } catch (error) {
      console.error('Translation error:', error);
      return englishText; // Fallback to English
    }
  };

  return { t, tDynamic, tWithAPI, language, isTranslating };
}

/**
 * Hook for translating dynamic content with loading state
 * Useful for package descriptions, reviews, etc.
 */
export function useDynamicTranslation(text, shouldTranslate = true) {
  const { language } = useLanguage();
  const [translatedText, setTranslatedText] = useState(text);
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    if (!shouldTranslate || language === 'en' || !text) {
      setTranslatedText(text);
      return;
    }

    setIsTranslating(true);
    translateText(text, language, 'en')
      .then(translated => {
        setTranslatedText(translated);
      })
      .catch(error => {
        console.error('Translation error:', error);
        setTranslatedText(text); // Fallback to original
      })
      .finally(() => {
        setIsTranslating(false);
      });
  }, [text, language, shouldTranslate]);

  return { translatedText, isTranslating };
}
