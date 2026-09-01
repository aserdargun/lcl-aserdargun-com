/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext } from 'react'

export type Locale = 'tr' | 'en'

const LocaleContext = createContext<Locale>('tr')

export function LocaleProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>
}

export function useLocale() {
  return useContext(LocaleContext)
}

export function pick<T>(locale: Locale, values: { tr: T; en: T }) {
  return values[locale]
}

export function formatDate(value: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale === 'tr' ? 'tr-TR' : 'en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  }).format(new Date(value))
}
