'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getAuthSession } from '@/lib/auth';

export type AppLocale = 'en' | 'hi' | 'bn';

const LOCALE_KEY = 'truthshield.locale';
const SUPPORTED_LOCALES: AppLocale[] = ['en', 'hi', 'bn'];

type LocaleContextValue = {
  locale: AppLocale;
  setLocale: (nextLocale: string) => void;
  formatDateTime: (value: string | Date) => string;
  formatDate: (value: string | Date) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

function normalizeLocale(value: string | null | undefined): AppLocale {
  const base = (value ?? '').toLowerCase().split('-')[0] as AppLocale;
  return SUPPORTED_LOCALES.includes(base) ? base : 'en';
}

function readStoredLocale(): AppLocale | null {
  if (typeof window === 'undefined') return null;
  return normalizeLocale(window.localStorage.getItem(LOCALE_KEY));
}

function readSessionLocale(): AppLocale | null {
  if (typeof window === 'undefined') return null;
  return normalizeLocale(getAuthSession()?.user.locale);
}

function toDate(value: string | Date) {
  return value instanceof Date ? value : new Date(value);
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<AppLocale>('en');

  useEffect(() => {
    const nextLocale = readStoredLocale() ?? readSessionLocale() ?? 'en';
    setLocaleState(nextLocale);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    window.localStorage.setItem(LOCALE_KEY, locale);
  }, [locale]);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== LOCALE_KEY && event.key !== 'truthshield.auth') return;
      const nextLocale = readStoredLocale() ?? readSessionLocale();
      if (nextLocale) {
        setLocaleState((currentLocale) => (currentLocale === nextLocale ? currentLocale : nextLocale));
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const setLocale = useCallback((nextLocale: string) => {
    const normalizedLocale = normalizeLocale(nextLocale);
    setLocaleState(normalizedLocale);
  }, []);

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      setLocale,
      formatDateTime: (value) => new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(toDate(value)),
      formatDate: (value) => new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(toDate(value)),
    }),
    [locale, setLocale]
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useAppLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useAppLocale must be used within a LocaleProvider');
  }
  return context;
}
