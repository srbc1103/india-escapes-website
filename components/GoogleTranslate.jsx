'use client'

import { useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function GoogleTranslate() {
  const { language } = useLanguage();

  // Load the Google Translate widget script once on mount
  useEffect(() => {
    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        { pageLanguage: 'en', autoDisplay: false },
        'google_translate_element'
      );
    };

    const script = document.createElement('script');
    script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // Apply language change via the widget's internal select element
  useEffect(() => {
    const applyTranslation = () => {
      const select = document.querySelector('.goog-te-combo');
      if (!select) return;

      if (language === 'en') {
        select.value = '';
      } else {
        select.value = language;
      }

      select.dispatchEvent(new Event('change', { bubbles: true }));
    };

    // The widget may not be ready immediately; retry a few times
    const attempts = [300, 700, 1500];
    const timers = attempts.map(delay => setTimeout(applyTranslation, delay));
    return () => timers.forEach(clearTimeout);
  }, [language]);

  return (
    <>
      {/* Hidden container for the Google Translate widget */}
      <div id="google_translate_element" style={{ display: 'none' }} />

      {/* Suppress the Google Translate banner that pushes the page down */}
      <style>{`
        .goog-te-banner-frame.skiptranslate { display: none !important; }
        body { top: 0px !important; }
        .goog-te-gadget { display: none !important; }
        #goog-gt-tt, .goog-te-balloon-frame { display: none !important; }
      `}</style>
    </>
  );
}
