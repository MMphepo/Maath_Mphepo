import contactData from '@/data/contact.json'
import ContactForm from './ContactForm'

const contact = contactData.data

export default function ContactPage() {
  return (
    <div>
      <header className="portfolio-page-hero portfolio-container">
        <p className="portfolio-eyebrow">Contact</p>
        <h1>Let’s talk about the work.</h1>
        <p className="portfolio-lede">
          Share the problem, project or system you have in mind. A clear first conversation starts
          with context.
        </p>
      </header>
      <section className="portfolio-section portfolio-section--stone">
        <div className="portfolio-container contact-layout">
          <ContactForm />
          <aside className="contact-details">
            <p className="portfolio-eyebrow">Direct contact</p>
            <h2>Prefer email?</h2>
            <a href={`mailto:${contact.email}`}>{contact.email}</a>
            <dl>
              <div>
                <dt>Based in</dt>
                <dd>{contact.location}</dd>
              </div>
              <div>
                <dt>Time zone</dt>
                <dd>{contact.availability.timezone}</dd>
              </div>
            </dl>
            <div className="contact-socials">
              {contact.socialLinks
                .filter((link) => link.is_active && ['LinkedIn', 'GitHub'].includes(link.platform))
                .map((link) => (
                  <a href={link.url} key={link.platform} rel="noreferrer" target="_blank">
                    {link.platform} <span aria-hidden="true">↗</span>
                  </a>
                ))}
            </div>
          </aside>
        </div>
      </section>
    </div>
  )
}
