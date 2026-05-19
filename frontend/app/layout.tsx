import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/context/AuthContext'

export const metadata: Metadata = {
  title: 'Kompete — AI Competitor Intelligence',
  description: 'Autonomous competitor research agent. Boardroom-ready SWOT reports in 60 seconds, powered by Gemini 2.5 Flash.',
  keywords: ['competitor analysis', 'SWOT analysis', 'AI research', 'competitive intelligence'],
  openGraph: {
    title: 'Kompete — AI Competitor Intelligence',
    description: 'Boardroom-ready competitive intelligence reports in 60 seconds.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-slate-950 text-slate-100 min-h-screen antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
