'use client'

import { motion } from 'framer-motion'
import { Code, Brain, Rocket, MapPin } from 'lucide-react'
import { useEffect, useState } from 'react'

const QuickHighlights = () => {
  const [isVisible, setIsVisible] = useState(false)

  const highlights = [
    {
      icon: Code,
      text: '3+ Years of Backend Development',
      delay: 0.1
    },
    {
      icon: Brain,
      text: 'Strong with Django, Laravel & APIs',
      delay: 0.2
    },
    {
      icon: Rocket,
      text: 'Built Scalable Systems & APIs for Clients',
      delay: 0.3
    },
    {
      icon: MapPin,
      text: 'Based in Malawi, working globally',
      delay: 0.4
    }
  ]

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    const element = document.getElementById('highlights')
    if (element) {
      observer.observe(element)
    }

    return () => {
      if (element) {
        observer.unobserve(element)
      }
    }
  }, [])

  return (
    <section id="highlights" className="py-16 bg-dark-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {highlights.map((highlight, index) => {
            const IconComponent = highlight.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                transition={{ 
                  duration: 0.6, 
                  delay: highlight.delay,
                  ease: "easeOut"
                }}
                className="text-center group"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="inline-flex items-center justify-center w-16 h-16 bg-primary/20 rounded-full mb-4 group-hover:bg-primary/30 transition-colors duration-300"
                >
                  <IconComponent className="w-8 h-8 text-primary" />
                </motion.div>
                
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={isVisible ? { opacity: 1 } : { opacity: 0 }}
                  transition={{ duration: 0.6, delay: highlight.delay + 0.2 }}
                  className="text-white font-medium text-sm sm:text-base group-hover:text-primary transition-colors duration-300"
                >
                  {highlight.text}
                </motion.p>
              </motion.div>
            )
          })}
        </div>

        {/* Decorative Line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={isVisible ? { scaleX: 1 } : { scaleX: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="h-px bg-gradient-to-r from-transparent via-primary to-transparent mt-12 origin-center"
        />
      </div>
    </section>
  )
}

export default QuickHighlights
