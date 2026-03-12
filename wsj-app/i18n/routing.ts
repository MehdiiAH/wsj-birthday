import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['fr', 'en', 'es', 'ja', 'pt', 'de', 'it'],
  defaultLocale: 'en',
  localeDetection: true,
})

export type Locale = (typeof routing.locales)[number]
