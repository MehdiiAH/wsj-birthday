'use client'

import { useLocale } from 'next-intl'
import { usePathname, useRouter } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'

const LOCALES: { code: Locale; flag: string }[] = [
  { code: 'fr', flag: '🇫🇷' },
  { code: 'en', flag: '🇬🇧' },
  { code: 'es', flag: '🇪🇸' },
  { code: 'ja', flag: '🇯🇵' },
  { code: 'pt', flag: '🇧🇷' },
  { code: 'de', flag: '🇩🇪' },
  { code: 'it', flag: '🇮🇹' },
]

export function LocaleSwitcher() {
  const locale = useLocale() as Locale
  const pathname = usePathname()
  const router = useRouter()

  return (
    <div className="flex items-center justify-center gap-1 flex-wrap">
      {LOCALES.map(l => {
        const isActive = l.code === locale
        return (
          <button
            key={l.code}
            onClick={() => router.push(pathname, { locale: l.code })}
            className={`
              flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-colors
              ${isActive
                ? 'bg-wsj-red/15 text-wsj-red font-semibold'
                : 'text-wsj-muted hover:text-white hover:bg-wsj-border'
              }
            `}
          >
            <span>{l.flag}</span>
            <span className="uppercase tracking-wide">{l.code}</span>
          </button>
        )
      })}
    </div>
  )
}
