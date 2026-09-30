import type { Metadata } from 'next'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import PortfolioFooter from '@/components/PortfolioFooter'
import { portfolioProjects } from '@/data/portfolio'

export const metadata: Metadata = {
  title: 'Selected work — Maath Mphepo',
  description: 'A directory of systems, products, institutional software and API projects.',
}

export default function WorkPage() {
  return (
    <div className="portfolio-site">
      <Navigation />
      <main>
        <header className="portfolio-page-hero portfolio-container">
          <p className="portfolio-eyebrow">Selected work · 01—05</p>
          <h1>Projects shaped around real systems.</h1>
          <p className="portfolio-lede">
            Product and engineering work across payments, verification, personal planning,
            institutional information and data integration.
          </p>
        </header>
        <section className="portfolio-section portfolio-section--compact">
          <div className="portfolio-container project-directory">
            {portfolioProjects.map((project, index) => (
              <Link
                className="directory-row"
                href={`/work/${project.slug}`}
                key={project.slug}
              >
                <span className="directory-row__index">0{index + 1}</span>
                <div>
                  <p className="project-row__category">{project.category}</p>
                  <h2>{project.title}</h2>
                  <p>{project.summary}</p>
                </div>
                <span aria-hidden="true" className="project-row__arrow">↗</span>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <PortfolioFooter />
    </div>
  )
}
