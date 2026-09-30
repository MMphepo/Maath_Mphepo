import type { Metadata } from 'next'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import PortfolioFooter from '@/components/PortfolioFooter'
import { capabilities, portfolioProjects, technicalCapabilities } from '@/data/portfolio'

export const metadata: Metadata = {
  title: 'About — Maath Mphepo',
  description:
    'How Maath Mphepo approaches requirements, systems, software and delivery.',
}

export default function AboutPage() {
  return (
    <div className="portfolio-site">
      <Navigation />
      <main>
        <header className="portfolio-page-hero portfolio-container">
          <p className="portfolio-eyebrow">About</p>
          <h1>I care about what software makes possible.</h1>
          <p className="portfolio-lede">
            My work starts with the organisation, its people and the problem in front of them. From
            there, I help shape requirements into systems and software that can be put to use.
          </p>
        </header>

        <section className="portfolio-section portfolio-section--stone">
          <div className="portfolio-container about-prose">
            <p className="portfolio-eyebrow">How I think about technology</p>
            <div>
              <h2>Software is part of a larger system.</h2>
              <p>
                A useful solution depends on understanding how people work, what information they
                need and how decisions move through an organisation. The interface and the code
                matter, but so do the requirements, workflows and boundaries that give them purpose.
              </p>
              <p>
                I bring that perspective to digital payments, academic verification, planning tools,
                institutional websites and data APIs: understand the context, make the system
                legible, then build toward the need.
              </p>
            </div>
          </div>
        </section>

        <section className="portfolio-section">
          <div className="portfolio-container">
            <div className="portfolio-section-heading">
              <p className="portfolio-eyebrow">Approach</p>
              <h2>Understand → Design → Build → Deliver</h2>
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

        <section className="portfolio-section portfolio-section--graphite">
          <div className="portfolio-container">
            <div className="portfolio-section-heading">
              <p className="portfolio-eyebrow">Technical capabilities</p>
              <h2>Tools in service of the system.</h2>
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
          <div className="portfolio-container">
            <div className="portfolio-section-heading">
              <p className="portfolio-eyebrow">Experience</p>
              <h2>Evidence through the work.</h2>
              <p className="portfolio-copy">
                The available profile material does not include verified employer histories or
                dates. These projects show the range of system contexts represented here.
              </p>
            </div>
            <div className="experience-projects">
              {portfolioProjects.map((project) => (
                <Link href={`/work/${project.slug}`} key={project.slug}>
                  <span>{project.category}</span>
                  <strong>{project.title}</strong>
                  <span aria-hidden="true">↗</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="portfolio-section portfolio-section--stone">
          <div className="portfolio-container about-education">
            <p className="portfolio-eyebrow">Education</p>
            <p>
              Formal education details are not included in the profile information available for
              this portfolio.
            </p>
          </div>
        </section>
        <section className="portfolio-contact-band">
          <div className="portfolio-container portfolio-contact-band__inner">
            <p className="portfolio-eyebrow">Current direction</p>
            <h2>Building software around the way people and organisations work.</h2>
            <Link className="portfolio-button portfolio-button--light" href="/contact">
              Get in touch <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </section>
      </main>
      <PortfolioFooter />
    </div>
  )
}
