/**
 * Language Hook
 * 
 * This file contains hooks for language and translation functionality.
 */
import { useCallback, useMemo } from 'react';
import { translations } from '../constants';

/**
 * Hook for language utilities
 * @param {string} language - Current language code
 * @returns {Object} Language utilities
 */
export const useLanguage = (language) => {
  /**
   * Translate a key to the current language
   * @param {string} key - Translation key
   * @returns {string} Translated text
   */
  const t = useCallback((key) => {
    return translations[language]?.[key] || key;
  }, [language]);
  
  /**
   * Check if the current language is RTL
   */
  const isRTL = useMemo(() => language === 'he', [language]);
  
  /**
   * Get the text direction based on the current language
   */
  const direction = useMemo(() => isRTL ? 'rtl' : 'ltr', [isRTL]);
  
  return {
    t,
    isRTL,
    direction
  };
};

export default useLanguage;
