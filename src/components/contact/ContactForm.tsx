'use client'

import { useState } from 'react'
import { api } from '@/lib/api-config'
import type { ContactFormData } from '@/types/contact'

const initialForm: ContactFormData = {
  name: '',
  email: '',
  subject: '',
  message: '',
  phone: '',
  honeypot: '',
}

export default function ContactForm() {
  const [form, setForm] = useState(initialForm)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const updateField = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setError('')
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (submitting) return

    if (form.honeypot) {
      setError('The form could not be submitted. Please try again.')
      return
    }

    if (!form.name.trim() || !form.email.trim() || form.message.trim().length < 10) {
      setError('Add your name, a valid email address and a message of at least 10 characters.')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const response = await api.contact.submit({
        name: form.name.trim(),
        email: form.email.trim(),
        subject: form.subject.trim() || 'Contact Form Submission',
        message: form.message.trim(),
        ...(form.phone?.trim() ? { phone: form.phone.trim() } : {}),
      })

      if (!response.success) {
        throw new Error(response.error || 'The message could not be sent.')
      }

      setSubmitted(true)
      setForm(initialForm)
    } catch (submitError) {
      console.error('Contact form submission failed:', submitError)
      setError('Your message could not be sent right now. Please email me directly instead.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div aria-live="polite" className="contact-form contact-form--success" role="status">
        <p className="portfolio-eyebrow">Message sent</p>
        <h2>Thank you for getting in touch.</h2>
        <p>Your message has been submitted.</p>
        <button className="portfolio-text-link" onClick={() => setSubmitted(false)} type="button">
          Send another message
        </button>
      </div>
    )
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <p className="portfolio-eyebrow">Send a message</p>
      <h2>Tell me a little about it.</h2>
      <div aria-hidden="true" className="contact-form__trap">
        <label htmlFor="contact-website">Leave this field empty</label>
        <input
          autoComplete="off"
          id="contact-website"
          name="honeypot"
          onChange={updateField}
          tabIndex={-1}
          value={form.honeypot}
        />
      </div>
      <div className="contact-form__grid">
        <label>
          Name
          <input
            autoComplete="name"
            name="name"
            onChange={updateField}
            required
            value={form.name}
          />
        </label>
        <label>
          Email
          <input
            autoComplete="email"
            name="email"
            onChange={updateField}
            required
            type="email"
            value={form.email}
          />
        </label>
      </div>
      <label>
        Subject <span>(optional)</span>
        <input name="subject" onChange={updateField} value={form.subject} />
      </label>
      <label>
        Message
        <textarea
          minLength={10}
          name="message"
          onChange={updateField}
          required
          rows={6}
          value={form.message}
        />
      </label>
      {error && <p className="contact-form__error" role="alert">{error}</p>}
      <button className="portfolio-button" disabled={submitting} type="submit">
        {submitting ? 'Sending…' : 'Send message'} <span aria-hidden="true">↗</span>
      </button>
    </form>
  )
}
