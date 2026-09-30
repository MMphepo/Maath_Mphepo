import Link from 'next/link'
import contactData from '@/data/contact.json'

const contact = contactData.data

export default function PortfolioFooter() {
  return (
    <footer className="portfolio-footer">
      <div className="portfolio-container portfolio-footer__inner">
        <Link className="portfolio-wordmark" href="/">
          Maath Mphepo
        </Link>
        <p>Systems thinking, translated into useful software.</p>
        <div className="portfolio-footer__links">
          <a href={`mailto:${contact.email}`}>Email</a>
          <a href="https://www.linkedin.com/in/maathmphepo" rel="noreferrer" target="_blank">
            LinkedIn
          </a>
          <a href="https://github.com/Mmphepo" rel="noreferrer" target="_blank">
            GitHub
          </a>
          <Link href="/contact">Contact</Link>
        </div>
        <small>© {new Date().getFullYear()} Maath Mphepo</small>
      </div>
    </footer>
  )
}
