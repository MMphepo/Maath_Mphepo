'use client'

import { motion } from 'framer-motion'
import { Brain, Code, Layers } from 'lucide-react'
import { useEffect, useState } from 'react'

const MissionPhilosophy = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [expandedCard, setExpandedCard] = useState<number | null>(null)

  const philosophies = [
    {
      icon: Code,
      title: "Craftsmanship",
      subtitle: "Every Line Matters",
      description: "I treat each line of code like a building block of something greater.",
      expandedContent: "When I built the school power schedule API, I spent extra time refactoring the authentication system to make it not just functional, but elegant. Clean code isn't just about today—it's about the developer who will maintain it tomorrow.",
      quote: "Code is poetry written for machines but read by humans.",
      color: "from-primary to-green-600"
    },
    {
      icon: Brain,
      title: "Problem Solving First",
      subtitle: "Understanding Before Building",
      description: "I focus on solving problems before choosing the stack.",
      expandedContent: "Before writing a single line of code for the student task tracking system, I spent days understanding the workflow. The result? A system that didn't just work—it transformed how students managed their academic responsibilities.",
      quote: "The best code solves problems you didn't know you had.",
      color: "from-blue-500 to-purple-600"
    },
    {
      icon: Layers,
      title: "End-to-End Understanding",
      subtitle: "Systems, Not Just Syntax",
      description: "I understand systems, not just syntax.",
      expandedContent: "When building e-commerce APIs, I don't just think about endpoints. I consider database performance, caching strategies, security implications, and how the system will scale when traffic grows 10x.",
      quote: "Great backends are invisible—they just work, seamlessly.",
      color: "from-orange-500 to-red-600"
    }
  ]

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.2 }
    )

    const element = document.getElementById('philosophy')
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
    <section id="philosophy" className="py-20 bg-dark-200/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            🧠 How I <span className="text-primary">Think</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            My development philosophy shapes every project I build
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {philosophies.map((philosophy, index) => {
            const IconComponent = philosophy.icon
            const isExpanded = expandedCard === index

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                whileHover={{ y: -10 }}
                onHoverStart={() => setExpandedCard(index)}
                onHoverEnd={() => setExpandedCard(null)}
                className="relative group cursor-pointer"
              >
                <div className={`glass rounded-xl p-8 h-full transition-all duration-500 ${
                  isExpanded ? 'scale-105 shadow-2xl' : ''
                }`}>
                  {/* Icon */}
                  <motion.div
                    animate={{ 
                      rotate: isExpanded ? 360 : 0,
                      scale: isExpanded ? 1.2 : 1
                    }}
                    transition={{ duration: 0.5 }}
                    className={`w-16 h-16 rounded-full bg-gradient-to-r ${philosophy.color} p-4 mb-6 mx-auto`}
                  >
                    <IconComponent className="w-full h-full text-white" />
                  </motion.div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-white mb-2 text-center">
                    {philosophy.title}
                  </h3>
                  
                  <p className="text-primary text-sm font-medium text-center mb-4">
                    {philosophy.subtitle}
                  </p>

                  {/* Base Description */}
                  <motion.p
                    animate={{ opacity: isExpanded ? 0.7 : 1 }}
                    className="text-gray-400 text-center mb-6 leading-relaxed"
                  >
                    {philosophy.description}
                  </motion.p>

                  {/* Expanded Content */}
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ 
                      opacity: isExpanded ? 1 : 0,
                      height: isExpanded ? 'auto' : 0
                    }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-gray-600 pt-6">
                      <p className="text-gray-300 text-sm leading-relaxed mb-4">
                        {philosophy.expandedContent}
                      </p>
                      
                      <motion.blockquote
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ 
                          opacity: isExpanded ? 1 : 0,
                          x: isExpanded ? 0 : -20
                        }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                        className="border-l-4 border-primary pl-4 italic text-primary text-sm"
                      >
                        "{philosophy.quote}"
                      </motion.blockquote>
                    </div>
                  </motion.div>

                  {/* Hover Glow Effect */}
                  <motion.div
                    animate={{ 
                      opacity: isExpanded ? 0.3 : 0,
                      scale: isExpanded ? 1 : 0.8
                    }}
                    className={`absolute inset-0 bg-gradient-to-r ${philosophy.color} rounded-xl blur-xl -z-10`}
                  />
                </div>

                {/* 3D Tilt Effect */}
                <motion.div
                  animate={{
                    rotateX: isExpanded ? 5 : 0,
                    rotateY: isExpanded ? 5 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 pointer-events-none"
                  style={{ transformStyle: 'preserve-3d' }}
                />
              </motion.div>
            )
          })}
        </div>

        {/* Bottom Quote */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-center mt-16"
        >
          <motion.p
            animate={{ 
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="text-2xl font-medium bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent bg-300% italic"
          >
            "Building software is not just about writing code—it's about crafting solutions that stand the test of time."
          </motion.p>
        </motion.div>
      </div>
    </section>
  )
}

export default MissionPhilosophy
