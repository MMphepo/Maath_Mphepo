import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Navigation from '@/components/Navigation'
import PortfolioFooter from '@/components/PortfolioFooter'
import { portfolioProjects } from '@/data/portfolio'

interface ProjectPageProps {
  params: { slug: string }
}

export function generateStaticParams() {
  return portfolioProjects.map(({ slug }) => ({ slug }))
}

export function generateMetadata({ params }: ProjectPageProps): Metadata {
  const project = portfolioProjects.find((item) => item.slug === params.slug)

  if (!project) {
    return { title: 'Project not found — Maath Mphepo' }
  }

  return {
    title: `${project.title} — Maath Mphepo`,
    description: project.summary,
  }
}

export default function ProjectPage({ params }: ProjectPageProps) {
  const project = portfolioProjects.find((item) => item.slug === params.slug)

  if (!project) {
    notFound()
  }

  return (
    <div className="portfolio-site">
      <Navigation />
      <main>
        <header className="case-hero portfolio-container">
          <Link className="portfolio-text-link case-back" href="/work">
            <span aria-hidden="true">←</span> All work
          </Link>
          <p className="portfolio-eyebrow">{project.category}</p>
          <h1>{project.title}</h1>
          <p className="portfolio-lede">{project.summary}</p>
          <dl className="case-meta">
            <div>
              <dt>Role / focus</dt>
              <dd>{project.role}</dd>
            </div>
            <div>
              <dt>Project type</dt>
              <dd>{project.category}</dd>
            </div>
          </dl>
        </header>

        <section className="portfolio-section portfolio-section--stone">
          <div className="portfolio-container case-section">
            <p className="portfolio-eyebrow">01 · Context</p>
            <div>
              <h2>The setting</h2>
              <p>{project.context}</p>
            </div>
          </div>
        </section>

        <section className="portfolio-section">
          <div className="portfolio-container case-section">
            <p className="portfolio-eyebrow">02 · Problem</p>
            <div>
              <h2>What the system needs to solve</h2>
              <p>{project.problem}</p>
            </div>
          </div>
        </section>

        <section className="portfolio-section portfolio-section--stone">
          <div className="portfolio-container case-section">
            <p className="portfolio-eyebrow">03 · Approach</p>
            <div>
              <h2>Make the workflow clear</h2>
              <p>{project.approach}</p>
            </div>
          </div>
        </section>

        <section className="portfolio-section">
          <div className="portfolio-container">
            <div className="portfolio-section-heading">
              <p className="portfolio-eyebrow">04 · Architecture / workflow</p>
              <h2>A view of the system in motion.</h2>
              <p className="portfolio-copy">
                A project-level workflow based on the documented scope.
              </p>
            </div>
            <ol className="workflow-list">
              {project.workflow.map((step, index) => (
                <li className="workflow-list__step" key={step}>
                  <span>0{index + 1}</span>
                  <strong>{step}</strong>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="portfolio-section portfolio-section--graphite">
          <div className="portfolio-container case-two-column">
            <div>
              <p className="portfolio-eyebrow">05 · Technical implementation</p>
              <h2>What the implementation covers.</h2>
            </div>
            <ul className="case-points">
              {project.implementation.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
        </section>

        <section className="portfolio-section">
          <div className="portfolio-container case-two-column">
            <div>
              <p className="portfolio-eyebrow">06 · Key decisions</p>
              <h2>Designing for the system, not just the screen.</h2>
              <p className="portfolio-copy">
                These notes focus on system-level decisions; undocumented implementation and
                deployment details are not inferred.
              </p>
            </div>
            <ul className="case-points case-points--dark">
              {project.decisions.map((decision) => <li key={decision}>{decision}</li>)}
            </ul>
          </div>
        </section>

        <section className="portfolio-section portfolio-section--stone">
          <div className="portfolio-container case-section">
            <p className="portfolio-eyebrow">07 · Outcome / status</p>
            <div>
              <h2>What this work demonstrates</h2>
              <p>{project.outcome}</p>
            </div>
          </div>
        </section>
        <nav aria-label="Other case studies" className="portfolio-container case-next">
          <Link className="portfolio-text-link" href="/work">
            Return to the project directory <span aria-hidden="true">↗</span>
          </Link>
        </nav>
      </main>
      <PortfolioFooter />
    </div>
  )
}
