'use client'

import { motion } from 'framer-motion'
import { Quote, Star } from 'lucide-react'
import { useEffect, useState } from 'react'

const Testimonial = () => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.3 }
    )

    const element = document.getElementById('testimonial')
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
    <section id="testimonial" className="py-20 bg-dark-200/30">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          {/* Section Title */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-3xl sm:text-4xl font-bold text-white mb-4"
          >
            Client <span className="text-primary">Testimonials</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-gray-400 text-lg mb-12"
          >
            What clients say about working with me
          </motion.p>

          {/* Testimonial Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isVisible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="glass rounded-2xl p-8 sm:p-12 relative overflow-hidden"
          >
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute -top-4 -right-4 w-8 h-8 border border-primary/20 rounded-full"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="absolute -bottom-4 -left-4 w-6 h-6 border border-secondary/20 rounded-full"
              />
            </div>

            {/* Quote Icon */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={isVisible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="relative z-10 mb-6"
            >
              <Quote className="w-12 h-12 text-primary mx-auto" />
            </motion.div>

            {/* Testimonial Text */}
            <motion.blockquote
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="text-xl sm:text-2xl text-white font-medium leading-relaxed mb-8 relative z-10"
            >
              "Working with Maath was a great experience. His backend logic was clean, 
              efficient, and delivered on time. The API he built for our e-commerce platform 
              handles thousands of requests daily without any issues. Highly recommended!"
            </motion.blockquote>

            {/* Stars */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isVisible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.6, delay: 1 }}
              className="flex justify-center gap-1 mb-6 relative z-10"
            >
              {[...Array(5)].map((_, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, rotate: -180 }}
                  animate={isVisible ? { opacity: 1, rotate: 0 } : { opacity: 0, rotate: -180 }}
                  transition={{ duration: 0.5, delay: 1.2 + index * 0.1 }}
                >
                  <Star className="w-6 h-6 text-yellow-400 fill-current" />
                </motion.div>
              ))}
            </motion.div>

            {/* Client Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 1.4 }}
              className="relative z-10"
            >
              <div className="flex items-center justify-center gap-4">
                {/* Client Avatar Placeholder */}
                <div className="w-12 h-12 bg-gradient-to-br from-primary/30 to-secondary/30 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">JD</span>
                </div>
                
                <div className="text-left">
                  <p className="text-white font-semibold">John Doe</p>
                  <p className="text-gray-400 text-sm">CEO, TechStart Inc.</p>
                </div>
              </div>
            </motion.div>

            {/* Signature Effect */}
            <motion.div
              initial={{ pathLength: 0 }}
              animate={isVisible ? { pathLength: 1 } : { pathLength: 0 }}
              transition={{ duration: 2, delay: 1.6 }}
              className="absolute bottom-4 right-4 opacity-20"
            >
              <svg width="60" height="30" viewBox="0 0 60 30" className="text-primary">
                <motion.path
                  d="M5 25 Q 30 5 55 25"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  initial={{ pathLength: 0 }}
                  animate={isVisible ? { pathLength: 1 } : { pathLength: 0 }}
                  transition={{ duration: 2, delay: 1.6 }}
                />
              </svg>
            </motion.div>

            {/* Subtle Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5 rounded-2xl" />
          </motion.div>

          {/* Additional Testimonials Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isVisible ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.6, delay: 1.8 }}
            className="flex justify-center gap-2 mt-8"
          >
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                  index === 0 ? 'bg-primary' : 'bg-gray-600'
                }`}
              />
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

export default Testimonial
