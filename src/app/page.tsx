import type { Metadata } from 'next'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import PortfolioFooter from '@/components/PortfolioFooter'
import { capabilities, portfolioProjects, technicalCapabilities } from '@/data/portfolio'

export const metadata: Metadata = {
  title: 'Maath Mphepo — Software, systems and delivery',
  description:
    'I work from organisational needs and requirements through system design, software and delivery.',
}

export default function HomePage() {
  const featuredProjects = portfolioProjects.filter((project) => project.featured)

  return (
    <div className="portfolio-site">
      <Navigation />
      <main>
        <section className="portfolio-hero portfolio-container">
          <p className="portfolio-eyebrow">Software · Systems · Delivery</p>
          <h1>Better software begins with understanding the work.</h1>
          <div className="portfolio-hero__bottom">
            <p className="portfolio-lede">
              I connect organisational needs to considered systems, useful software and clear
              delivery — working across requirements, product design, APIs and interfaces.
            </p>
            <div className="portfolio-actions">
              <Link className="portfolio-button" href="/work">
                Explore selected work <span aria-hidden="true">↗</span>
              </Link>
              <Link className="portfolio-text-link" href="/contact">
                Get in touch
              </Link>
            </div>
          </div>
          <div className="portfolio-hero__note">
            <span>Based in Malawi</span>
            <span>Working across product and software systems</span>
          </div>
        </section>

        <section className="portfolio-section portfolio-section--stone">
          <div className="portfolio-container">
            <div className="portfolio-section-heading">
              <p className="portfolio-eyebrow">How I work</p>
              <h2>From the real need to a system people can use.</h2>
            </div>
            <ol className="method-list">
              {capabilities.map((step, index) => (
                <li className="method-list__item" key={step.title}>
                  <span className="method-list__number">0{index + 1}</span>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="portfolio-section" id="work">
          <div className="portfolio-container">
            <div className="portfolio-section-heading portfolio-section-heading--row">
              <div>
                <p className="portfolio-eyebrow">Selected work</p>
                <h2>Systems with a job to do.</h2>
              </div>
              <Link className="portfolio-text-link" href="/work">
                View all five projects <span aria-hidden="true">↗</span>
              </Link>
            </div>
            <div className="project-list">
              {featuredProjects.map((project, index) => (
                <Link className="project-row" href={`/work/${project.slug}`} key={project.slug}>
                  <span className="project-row__index">0{index + 1}</span>
                  <div className="project-row__body">
                    <p className="project-row__category">{project.category}</p>
                    <h3>{project.title}</h3>
                    <p>{project.summary}</p>
                  </div>
                  <span aria-hidden="true" className="project-row__arrow">↗</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="portfolio-section portfolio-section--graphite">
          <div className="portfolio-container capability-layout">
            <div className="portfolio-section-heading">
              <p className="portfolio-eyebrow">Capabilities</p>
              <h2>Fluent across the layers of a product.</h2>
              <p className="portfolio-copy">
                The right tools follow the problem. I focus on making the requirements, system
                boundaries and implementation work together.
              </p>
            </div>
            <dl className="capability-list">
              {technicalCapabilities.map((capability) => (
                <div className="capability-list__row" key={capability.area}>
                  <dt>{capability.area}</dt>
                  <dd>{capability.items}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="portfolio-section">
          <div className="portfolio-container experience-layout">
            <div className="portfolio-section-heading">
              <p className="portfolio-eyebrow">Experience in practice</p>
              <h2>Work that starts with context.</h2>
            </div>
            <div className="experience-copy">
              <p>
                The project work spans digital payments, academic verification, personal planning,
                institutional information and power-schedule data. Each asks a different question
                of the system — from how trust is established to how information becomes actionable.
              </p>
              <Link className="portfolio-text-link" href="/about">
                More about my approach <span aria-hidden="true">↗</span>
              </Link>
            </div>
          </div>
        </section>

        <section className="portfolio-section portfolio-section--stone">
          <div className="portfolio-container writing-preview">
            <div>
              <p className="portfolio-eyebrow">Writing</p>
              <h2>Notes on building useful software.</h2>
            </div>
            <div>
              <p className="portfolio-copy">
                Technical writing on systems, software decisions and the work between a real-world
                need and its implementation.
              </p>
              <Link className="portfolio-text-link" href="/blog">
                Visit the journal <span aria-hidden="true">↗</span>
              </Link>
            </div>
          </div>
        </section>

        <section className="portfolio-contact-band">
          <div className="portfolio-container portfolio-contact-band__inner">
            <p className="portfolio-eyebrow">Contact</p>
            <h2>Have a system that needs to work better?</h2>
            <Link className="portfolio-button portfolio-button--light" href="/contact">
              Start a conversation <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </section>
      </main>
      <PortfolioFooter />
    </div>
  )
}
