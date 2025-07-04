'use client'

import { motion } from 'framer-motion'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useEffect, useState } from 'react'
import timelineData from '@/data/timeline.json'

interface TimelineItem {
  year: string
  title: string
  subtitle: string
  description: string
  technologies: string[]
  achievements: string[]
  icon: string
}

const JourneyTimeline = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [expandedItem, setExpandedItem] = useState<number | null>(null)
  const [timeline] = useState<TimelineItem[]>(timelineData.timeline)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    const element = document.getElementById('timeline')
    if (element) {
      observer.observe(element)
    }

    return () => {
      if (element) {
        observer.unobserve(element)
      }
    }
  }, [])

  const toggleExpanded = (index: number) => {
    setExpandedItem(expandedItem === index ? null : index)
  }

  return (
    <section id="timeline" className="py-20 bg-dark-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            📈 My <span className="text-primary">Journey</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            From first lines of code to building scalable systems
          </p>
        </motion.div>

        <div className="relative">
          {/* Timeline Line */}
          <motion.div
            initial={{ height: 0 }}
            animate={isVisible ? { height: '100%' } : { height: 0 }}
            transition={{ duration: 2, delay: 0.5 }}
            className="absolute left-8 md:left-1/2 transform md:-translate-x-0.5 w-1 bg-gradient-to-b from-primary to-secondary"
          />

          {/* Timeline Items */}
          <div className="space-y-12">
            {timeline.map((item, index) => {
              const isExpanded = expandedItem === index
              const isLeft = index % 2 === 0

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
                  animate={isVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: isLeft ? -50 : 50 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  className={`relative flex items-center ${
                    isLeft ? 'md:flex-row' : 'md:flex-row-reverse'
                  } flex-col md:gap-8`}
                >
                  {/* Timeline Node */}
                  <motion.div
                    whileHover={{ scale: 1.2 }}
                    animate={{
                      scale: isVisible ? [0, 1.2, 1] : 0,
                    }}
                    transition={{ 
                      scale: { duration: 0.5, delay: index * 0.2 + 0.8 }
                    }}
                    className="absolute left-8 md:left-1/2 transform -translate-x-1/2 w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center text-2xl z-10 cursor-pointer"
                    onClick={() => toggleExpanded(index)}
                  >
                    <motion.span
                      animate={{ rotate: isExpanded ? 360 : 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      {item.icon}
                    </motion.span>
                    
                    {/* Ping Animation */}
                    <motion.div
                      animate={{
                        scale: [1, 2, 1],
                        opacity: [0.5, 0, 0.5],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: index * 0.5
                      }}
                      className="absolute inset-0 bg-primary rounded-full"
                    />
                  </motion.div>

                  {/* Content Card */}
                  <div className={`w-full md:w-5/12 ml-24 md:ml-0 ${
                    isLeft ? 'md:text-right' : 'md:text-left'
                  }`}>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="glass rounded-xl p-6 cursor-pointer"
                      onClick={() => toggleExpanded(index)}
                    >
                      {/* Year Badge */}
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className={`inline-block bg-primary text-white px-4 py-2 rounded-full text-sm font-bold mb-4 ${
                          isLeft ? 'md:float-right md:ml-4' : 'md:float-left md:mr-4'
                        }`}
                      >
                        {item.year}
                      </motion.div>

                      {/* Title & Subtitle */}
                      <h3 className="text-xl font-bold text-white mb-2 clear-both">
                        {item.title}
                      </h3>
                      <p className="text-primary font-medium mb-4">
                        {item.subtitle}
                      </p>

                      {/* Description */}
                      <p className="text-gray-400 leading-relaxed mb-4">
                        {item.description}
                      </p>

                      {/* Technologies */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {item.technologies.map((tech, techIndex) => (
                          <motion.span
                            key={techIndex}
                            whileHover={{ scale: 1.1 }}
                            className="px-3 py-1 bg-secondary/20 text-secondary text-xs rounded-full border border-secondary/30"
                          >
                            {tech}
                          </motion.span>
                        ))}
                      </div>

                      {/* Expand Button */}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors duration-300 font-medium"
                      >
                        {isExpanded ? 'Show Less' : 'Show Details'}
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </motion.button>

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
                        <div className="border-t border-gray-600 mt-4 pt-4">
                          <h4 className="text-white font-semibold mb-3">Key Achievements:</h4>
                          <ul className="space-y-2">
                            {item.achievements.map((achievement, achIndex) => (
                              <motion.li
                                key={achIndex}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{
                                  opacity: isExpanded ? 1 : 0,
                                  x: isExpanded ? 0 : -20
                                }}
                                transition={{ duration: 0.3, delay: achIndex * 0.1 }}
                                className="flex items-start gap-3 text-gray-300 text-sm"
                              >
                                <span className="text-primary mt-1">•</span>
                                {achievement}
                              </motion.li>
                            ))}
                          </ul>
                        </div>
                      </motion.div>
                    </motion.div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Current Status */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 1.5 }}
          className="text-center mt-16"
        >
          <div className="glass rounded-xl p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4">
              🚀 What's Next?
            </h3>
            <p className="text-gray-400 leading-relaxed">
              Currently focused on building more scalable backend architectures and exploring 
              cloud-native solutions. Always excited to take on new challenges that push the 
              boundaries of what's possible with modern backend technologies.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default JourneyTimeline
