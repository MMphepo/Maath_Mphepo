'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

const TechStack = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [hoveredTech, setHoveredTech] = useState<string | null>(null)

  const technologies = [
    {
      name: 'Python',
      icon: '🐍',
      description: 'Powerful programming language for backend development',
      color: 'from-yellow-400 to-blue-500'
    },
    {
      name: 'Django',
      icon: '🎯',
      description: 'High-level Python web framework for rapid development',
      color: 'from-green-400 to-green-600'
    },
    {
      name: 'Laravel',
      icon: '🔥',
      description: 'Elegant PHP framework for web artisans',
      color: 'from-red-400 to-red-600'
    },
    {
      name: 'PostgreSQL',
      icon: '🐘',
      description: 'Advanced open-source relational database',
      color: 'from-blue-400 to-blue-600'
    },
    {
      name: 'Git',
      icon: '📚',
      description: 'Distributed version control system',
      color: 'from-orange-400 to-orange-600'
    },
    {
      name: 'REST APIs',
      icon: '🔗',
      description: 'Building scalable and maintainable APIs',
      color: 'from-purple-400 to-purple-600'
    },
    {
      name: 'Docker',
      icon: '🐳',
      description: 'Containerization for consistent deployments',
      color: 'from-blue-400 to-cyan-500'
    },
    {
      name: 'Redis',
      icon: '⚡',
      description: 'In-memory data structure store for caching',
      color: 'from-red-500 to-red-700'
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

    const element = document.getElementById('skills')
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
    <section id="skills" className="py-20 bg-dark-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Tech <span className="text-primary">Stack</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Technologies and tools I use to build robust backend systems
          </p>
        </motion.div>

        {/* Tech Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
          {technologies.map((tech, index) => (
            <motion.div
              key={tech.name}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={isVisible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
              transition={{ 
                duration: 0.5, 
                delay: index * 0.1,
                type: "spring",
                stiffness: 100
              }}
              whileHover={{ 
                scale: 1.1, 
                y: -10,
                transition: { duration: 0.2 }
              }}
              onHoverStart={() => setHoveredTech(tech.name)}
              onHoverEnd={() => setHoveredTech(null)}
              className="relative group cursor-pointer"
            >
              <div className={`glass rounded-xl p-6 text-center transition-all duration-300 group-hover:shadow-2xl bg-gradient-to-br ${tech.color} bg-opacity-10`}>
                <motion.div
                  animate={{ 
                    rotate: hoveredTech === tech.name ? 360 : 0,
                    scale: hoveredTech === tech.name ? 1.2 : 1
                  }}
                  transition={{ duration: 0.5 }}
                  className="text-4xl mb-3"
                >
                  {tech.icon}
                </motion.div>
                
                <h3 className="text-white font-semibold mb-2 group-hover:text-primary transition-colors duration-300">
                  {tech.name}
                </h3>

                {/* Tooltip */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ 
                    opacity: hoveredTech === tech.name ? 1 : 0,
                    y: hoveredTech === tech.name ? 0 : 10
                  }}
                  className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-dark-300 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap z-10 pointer-events-none"
                >
                  {tech.description}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-dark-300"></div>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Skills Progress Bars */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <h3 className="text-2xl font-bold text-white text-center mb-8">
            Proficiency <span className="text-primary">Levels</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { skill: 'Backend Development', level: 95 },
              { skill: 'API Design', level: 90 },
              { skill: 'Database Design', level: 88 },
              { skill: 'System Architecture', level: 85 }
            ].map((item, index) => (
              <motion.div
                key={item.skill}
                initial={{ opacity: 0, x: -50 }}
                animate={isVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
                transition={{ duration: 0.6, delay: 1 + index * 0.1 }}
                className="mb-4"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white font-medium">{item.skill}</span>
                  <span className="text-primary font-semibold">{item.level}%</span>
                </div>
                <div className="w-full bg-dark-300 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={isVisible ? { width: `${item.level}%` } : { width: 0 }}
                    transition={{ duration: 1, delay: 1.2 + index * 0.1 }}
                    className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default TechStack
