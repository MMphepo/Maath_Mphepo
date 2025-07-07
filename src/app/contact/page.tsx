import { Metadata } from 'next'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import ContactPage from '@/components/contact/ContactPage'

export const metadata: Metadata = {
  title: 'Contact - Maath Mphepo | Full-Stack Developer',
  description: 'Get in touch with Maath Mphepo for your next project. I typically respond within 24 hours and am available for full-stack development, consulting, and collaboration opportunities.',
  keywords: ['contact', 'hire developer', 'full-stack developer', 'web development', 'consultation', 'Maath Mphepo'],
  openGraph: {
    title: 'Contact - Maath Mphepo | Full-Stack Developer',
    description: 'Ready to work together? Drop me a message and let\'s build something great.',
    type: 'website',
    locale: 'en_US',
    siteName: 'Maath Mphepo Portfolio',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact - Maath Mphepo | Full-Stack Developer',
    description: 'Ready to work together? Drop me a message and let\'s build something great.',
    creator: '@maathmphepo',
  },
  alternates: {
    canonical: 'https://maathmphepo.com/contact',
  },
}

export default function Contact() {
  return (
    <main className="min-h-screen bg-dark-100 overflow-x-hidden">
      <Navigation />
      <ContactPage />
      <Footer />
    </main>
  )
}
