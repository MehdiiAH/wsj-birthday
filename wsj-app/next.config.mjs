import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'comicvine.gamespot.com',
        pathname: '/a/uploads/**',
      },
    ],
  },
}

export default withNextIntl(nextConfig)
