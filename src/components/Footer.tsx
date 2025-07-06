'use client'

import { motion } from 'framer-motion'
import { Github, Linkedin, Mail, ArrowUp, Heart, Twitter } from 'lucide-react'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api-config'

interface ContactInfo {
  email: string
  phone?: string
  location: string
  socialLinks: Array<{
    platform: string
    url: string
    is_active: boolean
  }>
  availability: {
    status: string
    responseTime: string
    timezone: string
  }
}

const Footer = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null)
  const [loading, setLoading] = useState(true)

  const quickLinks = [
    { name: 'Home', href: '#home' },
    { name: 'Projects', href: '#projects' },
    { name: 'About', href: '#about' },
    { name: 'Skills', href: '#skills' },
    { name: 'Contact', href: '#contact' },
  ]

  // Fetch contact information from Django API
  const fetchContactInfo = async () => {
    try {
      setLoading(true)
      const response = await api.contact.info()

      if (response.success && response.data) {
        setContactInfo(response.data)
      } else {
        console.error('Error fetching contact info:', response.error)
        // Fallback to default contact info
        setContactInfo(getDefaultContactInfo())
      }
    } catch (error) {
      console.error('Error fetching contact info:', error)
      setContactInfo(getDefaultContactInfo())
    } finally {
      setLoading(false)
    }
  }

  // Default contact info fallback
  const getDefaultContactInfo = (): ContactInfo => ({
    email: 'maathmphepo@gmail.com',
    location: 'Malawi, Working Globally',
    socialLinks: [
      { platform: 'GitHub', url: 'https://github.com/maathmphepo', is_active: true },
      { platform: 'LinkedIn', url: 'https://linkedin.com/in/maathmphepo', is_active: true },
      { platform: 'Twitter', url: 'https://twitter.com/maathmphepo', is_active: true }
    ],
    availability: {
      status: 'Available for projects',
      responseTime: '24-48 hours',
      timezone: 'UTC+2 (CAT)'
    }
  })

  // Map platform names to icons and colors
  const getSocialIcon = (platform: string) => {
    const iconMap: Record<string, { icon: any, color: string }> = {
      'GitHub': { icon: Github, color: 'hover:text-gray-300' },
      'LinkedIn': { icon: Linkedin, color: 'hover:text-blue-400' },
      'Twitter': { icon: Twitter, color: 'hover:text-blue-400' },
      'Email': { icon: Mail, color: 'hover:text-primary' }
    }
    return iconMap[platform] || { icon: Mail, color: 'hover:text-primary' }
  }

  useEffect(() => {
    fetchContactInfo()
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500)
    }

    const element = document.getElementById('contact')
    if (element) {
      observer.observe(element)
    }

    window.addEventListener('scroll', handleScroll)

    return () => {
      if (element) {
        observer.unobserve(element)
      }
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer id="contact" className="bg-dark-300 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-10 left-10 w-32 h-32 bg-primary/5 rounded-full blur-xl"
        />
        <motion.div
          animate={{
            x: [0, -40, 0],
            y: [0, 40, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-10 right-10 w-24 h-24 bg-secondary/5 rounded-full blur-xl"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Main Footer Content */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
          className="py-16"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Brand Section */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={isVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center md:text-left"
            >
              <h3 className="text-2xl font-bold text-white mb-4">
                <span className="text-primary">Maath</span> Mphepo
              </h3>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Backend Developer specializing in building scalable, efficient, 
                and elegant backend systems that power real-world applications.
              </p>
              <div className="flex justify-center md:justify-start gap-4">
                {loading ? (
                  // Loading skeleton for social links
                  [...Array(3)].map((_, i) => (
                    <div key={i} className="w-10 h-10 bg-dark-300/50 rounded-full animate-pulse" />
                  ))
                ) : contactInfo?.socialLinks ? (
                  contactInfo.socialLinks
                    .filter(social => social.is_active)
                    .map((social, index) => {
                      const { icon: IconComponent, color } = getSocialIcon(social.platform)
                      return (
                        <motion.a
                          key={social.platform}
                          href={social.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          initial={{ opacity: 0, scale: 0 }}
                          animate={isVisible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
                          transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                          whileHover={{
                            scale: 1.2,
                            rotate: 360,
                            transition: { duration: 0.3 }
                          }}
                          whileTap={{ scale: 0.9 }}
                          className={`w-12 h-12 bg-dark-200 rounded-full flex items-center justify-center text-white transition-all duration-300 ${color} hover:shadow-lg`}
                        >
                          <IconComponent className="w-5 h-5" />
                        </motion.a>
                      )
                    })
                ) : null}
              </div>
            </motion.div>

            {/* Quick Links */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-center"
            >
              <h4 className="text-lg font-semibold text-white mb-6">Quick Links</h4>
              <ul className="space-y-3">
                {quickLinks.map((link, index) => (
                  <motion.li
                    key={link.name}
                    initial={{ opacity: 0, x: 20 }}
                    animate={isVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
                    transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                  >
                    <motion.button
                      onClick={() => scrollToSection(link.href)}
                      whileHover={{ x: 5 }}
                      className="text-gray-400 hover:text-primary transition-colors duration-300 font-medium"
                    >
                      {link.name}
                    </motion.button>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={isVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="text-center md:text-right"
            >
              <h4 className="text-lg font-semibold text-white mb-6">Get In Touch</h4>
              {loading ? (
                <div className="space-y-4 animate-pulse">
                  <div className="h-12 bg-dark-300/50 rounded" />
                  <div className="h-12 bg-dark-300/50 rounded" />
                  <div className="h-12 bg-dark-300/50 rounded" />
                </div>
              ) : contactInfo ? (
                <div className="space-y-4">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="text-gray-400"
                  >
                    <p className="font-medium text-white mb-1">Email</p>
                    <a
                      href={`mailto:${contactInfo.email}`}
                      className="hover:text-primary transition-colors duration-300"
                    >
                      {contactInfo.email}
                    </a>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="text-gray-400"
                  >
                    <p className="font-medium text-white mb-1">Location</p>
                    <p>{contactInfo.location}</p>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="text-gray-400"
                  >
                    <p className="font-medium text-white mb-1">Availability</p>
                    <div className="flex items-center justify-center md:justify-end gap-2">
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-green-400">{contactInfo.availability.status}</span>
                    </div>
                  </motion.div>
                </div>
              ) : null}
            </motion.div>
          </div>
        </motion.div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isVisible ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="border-t border-gray-700 py-8"
        >
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <motion.p
              whileHover={{ scale: 1.05 }}
              className="text-gray-400 text-sm flex items-center gap-2"
            >
              © 2025 Maath Mphepo. Made with 
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <Heart className="w-4 h-4 text-red-500 fill-current" />
              </motion.span>
              All rights reserved.
            </motion.p>
            
            <motion.p
              whileHover={{ scale: 1.05 }}
              className="text-gray-400 text-sm"
            >
              Built with Next.js & Tailwind CSS
            </motion.p>
          </div>
        </motion.div>
      </div>

      {/* Scroll to Top Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0 }}
        animate={{ 
          opacity: showScrollTop ? 1 : 0, 
          scale: showScrollTop ? 1 : 0 
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={scrollToTop}
        className="fixed bottom-8 right-8 bg-primary text-white p-3 rounded-full shadow-lg hover:bg-primary/90 transition-colors duration-300 z-50"
      >
        <ArrowUp className="w-6 h-6" />
      </motion.button>
    </footer>
  )
}

export default Footer
