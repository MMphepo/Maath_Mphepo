'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Mail, MessageCircle, Calendar } from 'lucide-react'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api-config'

const AboutCTAFooter = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [isPulsing, setIsPulsing] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.5 }
    )

    const element = document.getElementById('about-cta-footer')
    if (element) {
      observer.observe(element)
    }

    return () => {
      if (element) {
        observer.unobserve(element)
      }
    }
  }, [])

  // Pulsing CTA button every 10 seconds
  useEffect(() => {
    const pulseTimer = setInterval(() => {
      setIsPulsing(true)
      setTimeout(() => setIsPulsing(false), 2000)
    }, 10000)

    return () => clearInterval(pulseTimer)
  }, [])

  const handleContactClick = () => {
    // Navigate to contact section or open contact modal
    const contactElement = document.querySelector('#contact')
    if (contactElement) {
      contactElement.scrollIntoView({ behavior: 'smooth' })
    } else {
      // Navigate to home page contact section
      window.location.href = '/#contact'
    }
  }

  const handleEmailClick = async () => {
    try {
      // Try to get contact info from API first
      const response = await api.contact.info()
      const email = response.success && response.data?.email
        ? response.data.email
        : 'maathmphepo@gmail.com' // fallback

      window.location.href = `mailto:${email}`
    } catch (error) {
      // Fallback to default email
      window.location.href = 'mailto:maathmphepo@gmail.com'
    }
  }

  const handleScheduleClick = () => {
    // This would typically open a calendar booking system
    window.open('https://calendly.com/maathmphepo', '_blank')
  }

  return (
    <section id="about-cta-footer" className="py-20 bg-gradient-to-br from-dark-200 via-dark-100 to-dark-200 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -top-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -80, 0],
            y: [0, 60, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -bottom-40 -right-40 w-96 h-96 bg-secondary/5 rounded-full blur-3xl"
        />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          {/* Main Heading */}
          <motion.h2
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isVisible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6"
          >
            Ready to Build Something{' '}
            <span className="text-primary">Amazing</span>?
          </motion.h2>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            I'm always excited to discuss new projects, innovative ideas, or opportunities to create 
            impactful backend solutions. Let's turn your vision into reality.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16"
          >
            {/* Primary CTA Button */}
            <motion.button
              onClick={handleContactClick}
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 20px 40px rgba(16, 185, 129, 0.4)"
              }}
              whileTap={{ scale: 0.95 }}
              animate={isPulsing ? {
                scale: [1, 1.1, 1],
                boxShadow: [
                  "0 0 0 0 rgba(16, 185, 129, 0.7)",
                  "0 0 0 20px rgba(16, 185, 129, 0)",
                  "0 0 0 0 rgba(16, 185, 129, 0)"
                ]
              } : {}}
              transition={isPulsing ? {
                duration: 2,
                ease: "easeOut"
              } : {}}
              className="bg-primary text-white px-10 py-4 rounded-full font-bold text-lg flex items-center gap-3 hover:bg-primary/90 transition-all duration-300 group relative overflow-hidden"
            >
              <span className="relative z-10">Let's Work Together</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300 relative z-10" />
              
              {/* Button shine effect */}
              <motion.div
                animate={{ x: [-100, 200] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
              />
            </motion.button>

            {/* Secondary Actions */}
            <div className="flex gap-4">
              <motion.button
                onClick={handleEmailClick}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-12 h-12 bg-dark-300 rounded-full flex items-center justify-center text-white hover:bg-primary transition-colors duration-300 group"
                title="Send Email"
              >
                <Mail className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              </motion.button>

              <motion.button
                onClick={handleScheduleClick}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-12 h-12 bg-dark-300 rounded-full flex items-center justify-center text-white hover:bg-secondary transition-colors duration-300 group"
                title="Schedule a Call"
              >
                <Calendar className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              </motion.button>
            </div>
          </motion.div>

          {/* Stats or Social Proof */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto"
          >
            <div className="glass rounded-xl p-6 text-center">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0 }}
                className="text-3xl font-bold text-primary mb-2"
              >
                15+
              </motion.div>
              <div className="text-gray-400">Projects Delivered</div>
            </div>

            <div className="glass rounded-xl p-6 text-center">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                className="text-3xl font-bold text-secondary mb-2"
              >
                100%
              </motion.div>
              <div className="text-gray-400">Client Satisfaction</div>
            </div>

            <div className="glass rounded-xl p-6 text-center">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                className="text-3xl font-bold text-primary mb-2"
              >
                24h
              </motion.div>
              <div className="text-gray-400">Response Time</div>
            </div>
          </motion.div>

          {/* Final Message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isVisible ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 1, delay: 1.2 }}
            className="mt-12"
          >
            <p className="text-gray-400 text-lg italic">
              "Every great project starts with a conversation. Let's start ours today."
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-primary"></div>
    </section>
  )
}

export default AboutCTAFooter
