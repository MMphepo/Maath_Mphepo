import type { Metadata } from 'next'
import Navigation from '@/components/Navigation'
import PortfolioFooter from '@/components/PortfolioFooter'
import ContactPage from '@/components/contact/ContactPage'

export const metadata: Metadata = {
  title: 'Contact — Maath Mphepo',
  description: 'Get in touch with Maath Mphepo about a project or system.',
}

export default function Contact() {
  return (
    <div className="portfolio-site">
      <Navigation />
      <main><ContactPage /></main>
      <PortfolioFooter />
    </div>
  )
}
