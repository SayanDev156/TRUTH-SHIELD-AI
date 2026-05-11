'use client';

import { LocaleProvider } from '@/lib/locale';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return <LocaleProvider>{children}</LocaleProvider>;
}
