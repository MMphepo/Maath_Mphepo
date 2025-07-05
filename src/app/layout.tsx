import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import '@fortawesome/fontawesome-free/css/all.min.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Maath Mphepo - Backend Developer & Problem Solver',
  description: 'I build reliable, scalable, and elegant backend systems using Django, Laravel, and modern databases to power real-world applications.',
  keywords: 'Backend Developer, Django, Laravel, Python, PHP, API Development, Database Design, Malawi Developer',
  authors: [{ name: 'Maath Mphepo' }],
  creator: 'Maath Mphepo',
  openGraph: {
    title: 'Maath Mphepo - Backend Developer & Problem Solver',
    description: 'I build reliable, scalable, and elegant backend systems using Django, Laravel, and modern databases to power real-world applications.',
    url: 'https://maathmphepo.dev',
    siteName: 'Maath Mphepo Portfolio',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Maath Mphepo - Backend Developer & Problem Solver',
    description: 'I build reliable, scalable, and elegant backend systems using Django, Laravel, and modern databases to power real-world applications.',
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
