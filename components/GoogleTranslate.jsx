'use client'

import { useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

// Sets the googtrans cookie that the widget reads on both root path and domain root
// so the selection persists across client-side navigations without re-init
function setGoogTransCookie(lang) {
  const value = lang === 'en' ? '/en/en' : `/en/${lang}`;
  document.cookie = `googtrans=${value}; path=/`;
  document.cookie = `googtrans=${value}; path=/; domain=.${window.location.hostname}`;
}

export default function GoogleTranslate() {
  const { language } = useLanguage();

  // Load the widget script exactly once
  useEffect(() => {
    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        { pageLanguage: 'en', autoDisplay: false, gaTrack: false },
        'google_translate_element'
      );
    };

    const script = document.createElement('script');
    script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) document.body.removeChild(script);
    };
  }, []);

  // On language change: write the cookie first (persists across navigations),
  // then nudge the widget's select element.  One retry at 500 ms covers the case
  // where the widget hasn't fully initialised yet on first load.
  useEffect(() => {
    setGoogTransCookie(language);

    const apply = () => {
      const select = document.querySelector('.goog-te-combo');
      if (!select) return;
      select.value = language === 'en' ? '' : language;
      select.dispatchEvent(new Event('change', { bubbles: true }));
    };

    apply();
    const timer = setTimeout(apply, 500);
    return () => clearTimeout(timer);
  }, [language]);

  return <div id="google_translate_element" style={{ display: 'none' }} />;
}
