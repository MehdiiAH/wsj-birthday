import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'

// Per-locale SEO metadata
const META: Record<string, { title: string; description: string }> = {
  fr: {
    title: 'Jump Birthday — Ton numéro de naissance',
    description:
      'Découvre quel numéro de Weekly Shōnen Jump est sorti le jour de ta naissance.',
  },
  en: {
    title: 'Jump Birthday — Your birthday issue',
    description: 'Find out which Weekly Shōnen Jump issue came out on your birthday.',
  },
  es: {
    title: 'Jump Birthday — Tu número de nacimiento',
    description:
      'Descubre qué número de Weekly Shōnen Jump salió el día de tu nacimiento.',
  },
  ja: {
    title: 'ジャンプ誕生日 — あなたの誕生号',
    description: '生まれた日に発売された週刊少年ジャンプの号を調べよう。',
  },
  pt: {
    title: 'Jump Birthday — Sua edição de nascimento',
    description:
      'Descubra qual edição da Weekly Shōnen Jump saiu no dia do seu nascimento.',
  },
  de: {
    title: 'Jump Birthday — Deine Geburtsausgabe',
    description:
      'Finde heraus, welche Weekly Shōnen Jump-Ausgabe an deinem Geburtstag erschien.',
  },
  it: {
    title: 'Jump Birthday — Il tuo numero di nascita',
    description:
      'Scopri quale numero di Weekly Shōnen Jump è uscito il giorno della tua nascita.',
  },
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const meta = META[locale] ?? META.fr
  return {
    title: meta.title,
    description: meta.description,
    openGraph: {
      title: 'Jump Birthday 🗞️',
      description: meta.description,
      type: 'website',
    },
    twitter: { card: 'summary_large_image', title: 'Jump Birthday 🗞️' },
  }
}

export function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound()
  }

  const messages = await getMessages()

  return (
    <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>
  )
}
