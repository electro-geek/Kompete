import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/context/AuthContext'

const BASE_URL = 'https://prepstudio.mritunjay.live'

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),

  title: {
    default: 'Kompete — AI Competitive Intelligence',
    template: '%s | Kompete',
  },
  description:
    'Kompete uses four AI agents to research news, financials, reviews, and social signals — then synthesizes a full SWOT report in under 60 seconds. Free competitive intelligence for teams.',
  keywords: [
    'competitive intelligence',
    'competitor analysis',
    'SWOT analysis',
    'AI research tool',
    'market analysis',
    'competitive research',
    'business intelligence',
    'startup research',
    'AI agent',
    'competitive landscape',
    'Kompete',
  ],
  authors: [{ name: 'Kompete' }],
  creator: 'Kompete',
  publisher: 'Kompete',

  alternates: {
    canonical: BASE_URL,
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },

  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: BASE_URL,
    siteName: 'Kompete',
    title: 'Kompete — AI Competitive Intelligence',
    description:
      'Four AI agents research your competitors across news, financials, reviews, and social signals. Get a boardroom-ready SWOT report in under 60 seconds.',
    images: [
      {
        url: `${BASE_URL}/preview.png`,
        width: 1200,
        height: 630,
        alt: 'Kompete — AI Competitive Intelligence',
        type: 'image/png',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    site: '@kompete_ai',
    title: 'Kompete — AI Competitive Intelligence',
    description:
      'Four AI agents research your competitors and generate a full SWOT in under 60 seconds. Free to try.',
    images: [`${BASE_URL}/preview.png`],
  },

  category: 'technology',
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Kompete',
  url: BASE_URL,
  description:
    'AI-powered competitive intelligence platform. Four autonomous agents research competitors across news, financials, reviews, and social signals, then synthesize a boardroom-ready SWOT report in under 60 seconds.',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  browserRequirements: 'Requires JavaScript',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
    description: 'Free tier with one analysis; unlimited with own API key.',
  },
  featureList: [
    'Multi-agent competitive research',
    'AI-generated SWOT analysis',
    'Financial snapshot',
    'Sentiment scoring',
    'Strategic recommendations',
    'One-click PDF export',
  ],
  screenshot: `${BASE_URL}/preview.png`,
  inLanguage: 'en',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="theme-color" content="#6366f1" />
        <meta name="color-scheme" content="dark" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen antialiased" style={{ background: 'var(--bg)', color: 'var(--fg)' }}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
