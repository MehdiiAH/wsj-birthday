import type { Viewport } from 'next'
import { Bebas_Neue, Inter } from 'next/font/google'
import { getLocale } from 'next-intl/server'
import './globals.css'

const bebas = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-bebas',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const viewport: Viewport = {
  themeColor: '#080808',
  colorScheme: 'dark',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale()
  return (
    <html lang={locale} className={`${bebas.variable} ${inter.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased noise">{children}</body>
    </html>
  )
}
