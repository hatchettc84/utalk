import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'UtalkWe Listen — You Talk. We Listen.',
  description: 'Haven is your 24/7 AI voice companion. No app. No login. Just call. Faith-based guidance, practical wisdom, and real support — whenever you need it.',
  keywords: 'AI voice support, mental wellness, faith-based guidance, emotional support, Haven, UtalkWe Listen',
  openGraph: {
    title: 'UtalkWe Listen — You Talk. We Listen.',
    description: 'Haven remembers you. Call anytime. No app required.',
    type: 'website',
    url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://utalwelisten.com',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'UtalkWe Listen',
    description: 'Haven is your 24/7 AI voice companion. Call anytime.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  )
}
