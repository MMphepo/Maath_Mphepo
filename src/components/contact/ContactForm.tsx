'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { api } from '@/lib/api-config'
import { ContactFormData, ContactFormErrors } from '@/types/contact'
// Note: Using console.log for now, will implement toast later

const ContactForm = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
    honeypot: ''
  })

  const [errors, setErrors] = useState<ContactFormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)
  
  const formRef = useRef<HTMLFormElement>(null)

  // Validation functions
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validateForm = (): boolean => {
    const newErrors: ContactFormErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters'
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required'
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear error when user starts typing
    if (errors[name as keyof ContactFormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Bot prevention - if honeypot is filled, it's likely a bot
    if (formData.honeypot) {
      return
    }
    
    if (!validateForm()) {
      console.error('Please fix the errors below')
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const response = await api.contact.submit({
        name: formData.name.trim(),
        email: formData.email.trim(),
        subject: formData.subject.trim() || 'Contact Form Submission',
        message: formData.message.trim()
      })
      
      if (response.success) {
        setIsSubmitted(true)
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: '',
          honeypot: ''
        })
        console.log('Message sent successfully! I\'ll get back to you within 24 hours.')
      } else {
        throw new Error(response.error || 'Failed to send message')
      }
    } catch (error: any) {
      console.error('Contact form error:', error)
      console.error(error.message || 'Failed to send message. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const inputVariants = {
    focused: { scale: 1.02, transition: { duration: 0.2 } },
    unfocused: { scale: 1, transition: { duration: 0.2 } }
  }

  const labelVariants = {
    focused: { y: -25, scale: 0.85, color: '#10B981' },
    unfocused: { y: 0, scale: 1, color: '#9CA3AF' }
  }

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
        >
          <CheckCircle className="w-16 h-16 text-primary-500 mx-auto mb-4" />
        </motion.div>
        <h3 className="text-2xl font-bold text-white mb-2">Message Sent!</h3>
        <p className="text-gray-300 mb-6">
          Thank you for reaching out. I'll get back to you within 24 hours.
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsSubmitted(false)}
          className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
        >
          Send Another Message
        </motion.button>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8"
    >
      <h2 className="text-3xl font-bold text-white mb-8">Get In Touch</h2>
      
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
        {/* Honeypot field - hidden from users */}
        <input
          type="text"
          name="honeypot"
          value={formData.honeypot}
          onChange={handleInputChange}
          style={{ display: 'none' }}
          tabIndex={-1}
          autoComplete="off"
        />
        
        {/* Name Field */}
        <div className="relative">
          <motion.input
            variants={inputVariants}
            animate={focusedField === 'name' ? 'focused' : 'unfocused'}
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            onFocus={() => setFocusedField('name')}
            onBlur={() => setFocusedField(null)}
            className={`w-full px-4 py-4 bg-dark-300/50 border rounded-lg text-white placeholder-transparent focus:outline-none focus:ring-2 transition-all duration-300 ${
              errors.name 
                ? 'border-red-500 focus:ring-red-500/50' 
                : 'border-gray-600 focus:border-primary-500 focus:ring-primary-500/50'
            }`}
            placeholder="Full Name"
            required
          />
          <motion.label
            variants={labelVariants}
            animate={focusedField === 'name' || formData.name ? 'focused' : 'unfocused'}
            htmlFor="name"
            className="absolute left-4 top-4 pointer-events-none transition-all duration-300"
          >
            Full Name *
          </motion.label>
          <AnimatePresence>
            {errors.name && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center mt-2 text-red-400 text-sm"
              >
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.name}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Email Field */}
        <div className="relative">
          <motion.input
            variants={inputVariants}
            animate={focusedField === 'email' ? 'focused' : 'unfocused'}
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            onFocus={() => setFocusedField('email')}
            onBlur={() => setFocusedField(null)}
            className={`w-full px-4 py-4 bg-dark-300/50 border rounded-lg text-white placeholder-transparent focus:outline-none focus:ring-2 transition-all duration-300 ${
              errors.email 
                ? 'border-red-500 focus:ring-red-500/50' 
                : 'border-gray-600 focus:border-primary-500 focus:ring-primary-500/50'
            }`}
            placeholder="Email Address"
            required
          />
          <motion.label
            variants={labelVariants}
            animate={focusedField === 'email' || formData.email ? 'focused' : 'unfocused'}
            htmlFor="email"
            className="absolute left-4 top-4 pointer-events-none transition-all duration-300"
          >
            Email Address *
          </motion.label>
          <AnimatePresence>
            {errors.email && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center mt-2 text-red-400 text-sm"
              >
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.email}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Subject Field */}
        <div className="relative">
          <motion.input
            variants={inputVariants}
            animate={focusedField === 'subject' ? 'focused' : 'unfocused'}
            type="text"
            name="subject"
            value={formData.subject}
            onChange={handleInputChange}
            onFocus={() => setFocusedField('subject')}
            onBlur={() => setFocusedField(null)}
            className="w-full px-4 py-4 bg-dark-300/50 border border-gray-600 rounded-lg text-white placeholder-transparent focus:outline-none focus:ring-2 focus:border-primary-500 focus:ring-primary-500/50 transition-all duration-300"
            placeholder="Subject"
          />
          <motion.label
            variants={labelVariants}
            animate={focusedField === 'subject' || formData.subject ? 'focused' : 'unfocused'}
            htmlFor="subject"
            className="absolute left-4 top-4 pointer-events-none transition-all duration-300"
          >
            Subject (Optional)
          </motion.label>
        </div>

        {/* Message Field */}
        <div className="relative">
          <motion.textarea
            variants={inputVariants}
            animate={focusedField === 'message' ? 'focused' : 'unfocused'}
            name="message"
            value={formData.message}
            onChange={handleInputChange}
            onFocus={() => setFocusedField('message')}
            onBlur={() => setFocusedField(null)}
            rows={6}
            className={`w-full px-4 py-4 bg-dark-300/50 border rounded-lg text-white placeholder-transparent focus:outline-none focus:ring-2 transition-all duration-300 resize-none ${
              errors.message 
                ? 'border-red-500 focus:ring-red-500/50' 
                : 'border-gray-600 focus:border-primary-500 focus:ring-primary-500/50'
            }`}
            placeholder="Your Message"
            required
          />
          <motion.label
            variants={labelVariants}
            animate={focusedField === 'message' || formData.message ? 'focused' : 'unfocused'}
            htmlFor="message"
            className="absolute left-4 top-4 pointer-events-none transition-all duration-300"
          >
            Your Message *
          </motion.label>
          <AnimatePresence>
            {errors.message && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center mt-2 text-red-400 text-sm"
              >
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.message}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={isSubmitting}
          whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
          whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
          className={`w-full py-4 px-6 rounded-lg font-semibold text-white transition-all duration-300 flex items-center justify-center space-x-2 ${
            isSubmitting
              ? 'bg-gray-600 cursor-not-allowed'
              : 'bg-primary-600 hover:bg-primary-700 hover:shadow-lg hover:shadow-primary-500/25'
          }`}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Sending...</span>
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              <span>Send Message</span>
            </>
          )}
        </motion.button>
      </form>
    </motion.div>
  )
}

export default ContactForm
