import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import '@/styles/portfolio.css'
import '@fortawesome/fontawesome-free/css/all.min.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Maath Mphepo — Software, systems and delivery',
  description:
    'I work from organisational needs and requirements through system design, software and delivery.',
  keywords: 'Software engineering, systems design, API development, Malawi',
  authors: [{ name: 'Maath Mphepo' }],
  creator: 'Maath Mphepo',
  openGraph: {
    title: 'Maath Mphepo — Software, systems and delivery',
    description:
      'I work from organisational needs and requirements through system design, software and delivery.',
    url: 'https://maathmphepo.dev',
    siteName: 'Maath Mphepo Portfolio',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Maath Mphepo — Software, systems and delivery',
    description:
      'I work from organisational needs and requirements through system design, software and delivery.',
    creator: '@maathmphepo',
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
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
