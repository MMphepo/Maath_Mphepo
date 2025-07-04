'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Quote, Play, Pause } from 'lucide-react'
import { useEffect, useState } from 'react'

interface QuoteItem {
  text: string
  author: string
  context: string
}

const QuotesCarousel = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [currentQuote, setCurrentQuote] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [typewriterText, setTypewriterText] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  const quotes: QuoteItem[] = [
    {
      text: "Good code is not written once. It's evolved over time with purpose and clarity.",
      author: "Maath Mphepo",
      context: "On code craftsmanship and maintainability"
    },
    {
      text: "The best APIs are invisible—they solve problems so elegantly that developers forget they exist.",
      author: "Maath Mphepo", 
      context: "On API design philosophy"
    },
    {
      text: "Every database query is a conversation with your data. Make sure you're asking the right questions.",
      author: "Maath Mphepo",
      context: "On database optimization"
    },
    {
      text: "Scalability isn't just about handling more users—it's about building systems that grow gracefully.",
      author: "Maath Mphepo",
      context: "On system architecture"
    },
    {
      text: "Documentation is love letters to your future self and your teammates.",
      author: "Maath Mphepo",
      context: "On the importance of documentation"
    }
  ]

  // Typewriter effect for current quote
  useEffect(() => {
    const currentQuoteText = quotes[currentQuote].text
    setIsTyping(true)
    setTypewriterText('')
    
    let index = 0
    const timer = setInterval(() => {
      if (index < currentQuoteText.length) {
        setTypewriterText(currentQuoteText.slice(0, index + 1))
        index++
      } else {
        setIsTyping(false)
        clearInterval(timer)
      }
    }, 50)

    return () => clearInterval(timer)
  }, [currentQuote])

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return

    const timer = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % quotes.length)
    }, 6000) // Change quote every 6 seconds

    return () => clearInterval(timer)
  }, [isAutoPlaying, quotes.length])

  // Intersection observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.3 }
    )

    const element = document.getElementById('quotes')
    if (element) {
      observer.observe(element)
    }

    return () => {
      if (element) {
        observer.unobserve(element)
      }
    }
  }, [])

  const nextQuote = () => {
    setCurrentQuote((prev) => (prev + 1) % quotes.length)
  }

  const prevQuote = () => {
    setCurrentQuote((prev) => (prev - 1 + quotes.length) % quotes.length)
  }

  const toggleAutoPlay = () => {
    setIsAutoPlaying(!isAutoPlaying)
  }

  return (
    <section id="quotes" className="py-20 bg-dark-200/30">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            🧭 My <span className="text-primary">Principles</span>
          </h2>
          <p className="text-gray-400 text-lg">
            Guiding philosophies that shape my approach to development
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={isVisible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative"
        >
          {/* Main Quote Card */}
          <div className="glass rounded-2xl p-8 sm:p-12 relative overflow-hidden min-h-[300px] flex flex-col justify-center">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="absolute -top-10 -right-10 w-20 h-20 border border-primary/20 rounded-full"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="absolute -bottom-10 -left-10 w-16 h-16 border border-secondary/20 rounded-full"
              />
            </div>

            {/* Quote Icon */}
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="relative z-10 mb-6"
            >
              <Quote className="w-12 h-12 text-primary mx-auto" />
            </motion.div>

            {/* Quote Text with Typewriter Effect */}
            <AnimatePresence mode="wait">
              <motion.blockquote
                key={currentQuote}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="text-xl sm:text-2xl text-white font-medium leading-relaxed mb-8 relative z-10 text-center min-h-[120px] flex items-center justify-center"
              >
                <span>
                  "{typewriterText}"
                  {isTyping && (
                    <motion.span
                      animate={{ opacity: [1, 0] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                      className="inline-block w-0.5 h-6 bg-primary ml-1"
                    />
                  )}
                </span>
              </motion.blockquote>
            </AnimatePresence>

            {/* Author & Context */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`author-${currentQuote}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-center relative z-10"
              >
                <p className="text-primary font-semibold text-lg mb-2">
                  — {quotes[currentQuote].author}
                </p>
                <p className="text-gray-400 text-sm italic">
                  {quotes[currentQuote].context}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Subtle Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5 rounded-2xl" />
          </div>

          {/* Navigation Controls */}
          <div className="flex justify-center items-center gap-4 mt-8">
            {/* Previous Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={prevQuote}
              className="w-12 h-12 bg-dark-300 rounded-full flex items-center justify-center text-white hover:bg-primary transition-colors duration-300"
            >
              <ChevronLeft className="w-6 h-6" />
            </motion.button>

            {/* Quote Indicators */}
            <div className="flex gap-2">
              {quotes.map((_, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.8 }}
                  onClick={() => setCurrentQuote(index)}
                  className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                    index === currentQuote ? 'bg-primary' : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>

            {/* Next Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={nextQuote}
              className="w-12 h-12 bg-dark-300 rounded-full flex items-center justify-center text-white hover:bg-primary transition-colors duration-300"
            >
              <ChevronRight className="w-6 h-6" />
            </motion.button>
          </div>

          {/* Auto-play Control */}
          <div className="flex justify-center mt-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleAutoPlay}
              className="flex items-center gap-2 px-4 py-2 bg-dark-300 rounded-full text-white hover:bg-primary transition-colors duration-300 text-sm"
            >
              {isAutoPlaying ? (
                <>
                  <Pause className="w-4 h-4" />
                  Pause Auto-play
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Resume Auto-play
                </>
              )}
            </motion.button>
          </div>

          {/* Progress Bar for Auto-play */}
          {isAutoPlaying && (
            <div className="mt-4 w-full bg-gray-700 rounded-full h-1 overflow-hidden">
              <motion.div
                key={currentQuote}
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 6, ease: 'linear' }}
                className="h-full bg-gradient-to-r from-primary to-secondary"
              />
            </div>
          )}
        </motion.div>
      </div>
    </section>
  )
}

export default QuotesCarousel
