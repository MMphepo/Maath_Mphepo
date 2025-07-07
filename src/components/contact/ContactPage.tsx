'use client'

import { motion } from 'framer-motion'
import ContactHero from './ContactHero'
import ContactForm from './ContactForm'
import ContactSidebar from './ContactSidebar'
import ContactCTA from './ContactCTA'

const ContactPage = () => {
  return (
    <div className="min-h-screen bg-dark-100">
      {/* Hero Section */}
      <ContactHero />
      
      {/* Main Contact Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Contact Form - Takes 2/3 on desktop */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-2"
            >
              <ContactForm />
            </motion.div>
            
            {/* Contact Sidebar - Takes 1/3 on desktop */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="lg:col-span-1"
            >
              <ContactSidebar />
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* CTA Footer */}
      <ContactCTA />
    </div>
  )
}

export default ContactPage
