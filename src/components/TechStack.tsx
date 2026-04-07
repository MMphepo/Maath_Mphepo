'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import skillsData from '@/data/skills.json'

interface Technology {
  name: string
  icon_class: string
  description: string
  color: string
  level?: number
  proficiency_percentage?: number
  years_experience?: number
}

interface SkillCategory {
  id: number
  name: string
  slug: string
  description: string
  icon_class: string
  color: string
  skills: Technology[]
}

const TechStack = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [hoveredTech, setHoveredTech] = useState<string | null>(null)
  const [skillCategories, setSkillCategories] = useState<SkillCategory[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Use hardcoded skills data - instant loading
    if (skillsData?.data?.skillsByCategory) {
      setSkillCategories(skillsData.data.skillsByCategory as SkillCategory[])
    }
  }, [])

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

        {/* Comprehensive Tech Stack by Categories */}
        {loading ? (
          <div className="space-y-12">
            {[1, 2, 3].map((categoryIndex) => (
              <div key={categoryIndex} className="space-y-6">
                <div className="h-8 bg-dark-300/50 rounded w-48 mx-auto animate-pulse" />
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="glass rounded-xl p-6 text-center animate-pulse">
                      <div className="w-12 h-12 bg-dark-300/50 rounded-full mx-auto mb-3" />
                      <div className="h-4 bg-dark-300/50 rounded mb-2" />
                      <div className="h-3 bg-dark-300/50 rounded w-3/4 mx-auto" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-16">
            {skillCategories.map((category, categoryIndex) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 50 }}
                animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                transition={{ duration: 0.6, delay: categoryIndex * 0.2 }}
                className="space-y-8"
              >
                {/* Category Header */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={isVisible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.5, delay: categoryIndex * 0.2 + 0.1 }}
                  className="text-center"
                >
                  <div className="inline-flex items-center gap-3 mb-4">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white text-xl"
                      style={{ backgroundColor: category.color }}
                    >
                      <i className={category.icon_class}></i>
                    </div>
                    <h3 className="text-2xl font-bold text-white">
                      {category.name}
                    </h3>
                  </div>
                  <p className="text-gray-400 text-sm max-w-md mx-auto">
                    {category.description}
                  </p>
                </motion.div>

                {/* Skills Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                  {category.skills.map((skill, skillIndex) => (
                    <motion.div
                      key={skill.name}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={isVisible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
                      transition={{
                        duration: 0.5,
                        delay: categoryIndex * 0.2 + skillIndex * 0.1,
                        type: "spring",
                        stiffness: 100
                      }}
                      whileHover={{
                        scale: 1.05,
                        y: -5,
                        transition: { duration: 0.2 }
                      }}
                      onHoverStart={() => setHoveredTech(skill.name)}
                      onHoverEnd={() => setHoveredTech(null)}
                      className="relative group cursor-pointer"
                    >
                      <div
                        className="glass rounded-xl p-6 text-center transition-all duration-300 group-hover:shadow-2xl border-2 border-transparent group-hover:border-opacity-50"
                        style={{ borderColor: category.color }}
                      >
                        <motion.div
                          animate={{
                            rotate: hoveredTech === skill.name ? 360 : 0,
                            scale: hoveredTech === skill.name ? 1.2 : 1
                          }}
                          transition={{ duration: 0.5 }}
                          className="text-4xl mb-3"
                        >
                          {/* Render icon from Font Awesome class */}
                          {skill.icon_class ? (
                            <i className={skill.icon_class} style={{ color: category.color }}></i>
                          ) : (
                            <span>⚙️</span>
                          )}
                        </motion.div>

                        <h4 className="text-white font-semibold mb-2 group-hover:text-primary transition-colors duration-300">
                          {skill.name}
                        </h4>

                        {/* Experience Badge */}
                        <div className="text-xs text-gray-400 mb-2">
                          {skill.years_experience} year{skill.years_experience !== 1 ? 's' : ''} exp
                        </div>

                        {/* Proficiency Bar */}
                        <div className="w-full bg-dark-300 rounded-full h-2 mb-2">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={isVisible ? { width: `${skill.proficiency_percentage}%` } : { width: 0 }}
                            transition={{ duration: 1, delay: categoryIndex * 0.2 + skillIndex * 0.1 + 0.5 }}
                            className="h-2 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                        </div>
                        <div className="text-xs font-medium" style={{ color: category.color }}>
                          {skill.proficiency_percentage}%
                        </div>

                        {/* Enhanced Tooltip */}
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{
                            opacity: hoveredTech === skill.name ? 1 : 0,
                            y: hoveredTech === skill.name ? 0 : 10
                          }}
                          className="absolute -top-24 left-1/2 transform -translate-x-1/2 glass rounded-lg px-4 py-3 z-20 pointer-events-none min-w-48 max-w-64 text-center"
                          style={{
                            backdropFilter: 'blur(10px)',
                            border: `1px solid ${category.color}40`
                          }}
                        >
                          <div className="text-white text-sm font-medium mb-1">
                            {skill.name}
                          </div>
                          <div className="text-gray-300 text-xs leading-relaxed break-words z-10">
                            {skill.description}
                          </div>
                          <div className="text-xs mt-2 font-semibold" style={{ color: category.color }}>
                            {skill.proficiency_percentage}% • {skill.years_experience} year{skill.years_experience !== 1 ? 's' : ''}
                          </div>
                          {/* Tooltip Arrow */}
                          <div
                            className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent"
                            style={{ borderTopColor: 'rgba(51, 65, 85, 0.9)' }}
                          ></div>
                        </motion.div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}


      </div>
    </section>
  )
}

export default TechStack
