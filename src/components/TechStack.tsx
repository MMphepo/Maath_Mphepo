'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api-config'

interface Technology {
  name: string
  icon: string
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
  const [loading, setLoading] = useState(true)

  // Fetch comprehensive skills from Django API
  const fetchSkills = async () => {
    try {
      setLoading(true)
      const response = await api.skills.list();


      if (!response.success && !response.data) {
        // Transform Django skills data to match component interface
        let transformedCategories: SkillCategory[] = []

        if (response.data.skillsByCategory && Array.isArray(response.data.skillsByCategory)) {
          transformedCategories = response.data.skillsByCategory.map((category: any) => ({
            id: category.id,
            name: category.name,
            slug: category.slug,
            description: category.description,
            icon_class: category.icon_class,
            color: category.color,
            skills: category.skills ? category.skills.map((skill: any) => ({
              name: skill.name || 'Unknown',
              icon: skill.icon_class || getDefaultIcon(skill.name),
              description: skill.description || `${skill.name} technology`,
              color: category.color || '#10B981',
              level: skill.proficiency_percentage || 85,
              proficiency_percentage: skill.proficiency_percentage || 85,
              years_experience: skill.years_experience || 1
            })) : []
          }))
        }

        if (transformedCategories.length > 0) {
          setSkillCategories(transformedCategories)
        } else {
          console.log('No skill categories found in API response, using defaults')
          setSkillCategories(getDefaultSkillCategories())
        }
      } else {
        console.error('Error fetching skills:', response.error)
        // Fallback to default categories if API fails
        setSkillCategories(getDefaultSkillCategories())
      }
    } catch (error) {
      console.error('Error fetching skills:', error)
      setSkillCategories(getDefaultSkillCategories())
    } finally {
      setLoading(false)
    }
  }

  // Helper function to get default icon based on skill name
  const getDefaultIcon = (skillName: string): string => {
    const iconMap: Record<string, string> = {
      'Python': '🐍',
      'Django': '🎯',
      'Laravel': '🔥',
      'PostgreSQL': '🐘',
      'MySQL': '🗄️',
      'Git': '📚',
      'REST API': '🔗',
      'Docker': '🐳',
      'JavaScript': '⚡',
      'TypeScript': '📘',
      'React': '⚛️',
      'Vue': '💚',
      'Node.js': '🟢',
      'MongoDB': '🍃',
      'Redis': '🔴',
      'AWS': '☁️',
      'Linux': '🐧'
    }
    return iconMap[skillName] || '⚙️'
  }

  // Helper function to get color gradient for skill
  const getColorForSkill = (skillName: string, index: number): string => {
    const colors = [
      'from-yellow-400 to-blue-500',
      'from-green-400 to-green-600',
      'from-red-400 to-red-600',
      'from-blue-400 to-blue-600',
      'from-purple-400 to-purple-600',
      'from-orange-400 to-orange-600',
      'from-pink-400 to-pink-600',
      'from-indigo-400 to-indigo-600'
    ]
    return colors[index % colors.length]
  }

  // Default skill categories fallback
  const getDefaultSkillCategories = (): SkillCategory[] => [
    {
      id: 1,
      name: 'Languages',
      slug: 'languages',
      description: 'Programming languages I work with',
      icon_class: 'fas fa-code',
      color: '#10B981',
      skills: [
        { name: 'Python', icon: '🐍', description: 'Primary backend language', color: '#10B981', level: 95, proficiency_percentage: 95, years_experience: 3 },
        { name: 'PHP', icon: '🔥', description: 'Laravel development', color: '#10B981', level: 85, proficiency_percentage: 85, years_experience: 2 },
        { name: 'JavaScript', icon: '⚡', description: 'Frontend and Node.js', color: '#10B981', level: 80, proficiency_percentage: 80, years_experience: 2 }
      ]
    },
    {
      id: 2,
      name: 'Backend Frameworks',
      slug: 'backend-frameworks',
      description: 'Server-side frameworks',
      icon_class: 'fas fa-server',
      color: '#3B82F6',
      skills: [
        { name: 'Django', icon: '🎯', description: 'REST API development', color: '#3B82F6', level: 90, proficiency_percentage: 90, years_experience: 3 },
        { name: 'Laravel', icon: '🔥', description: 'PHP web framework', color: '#3B82F6', level: 85, proficiency_percentage: 85, years_experience: 2 }
      ]
    },
    {
      id: 3,
      name: 'Databases',
      slug: 'databases',
      description: 'Database systems',
      icon_class: 'fas fa-database',
      color: '#F59E0B',
      skills: [
        { name: 'MySQL', icon: '🗄️', description: 'Production databases', color: '#F59E0B', level: 85, proficiency_percentage: 85, years_experience: 3 },
        { name: 'PostgreSQL', icon: '🐘', description: 'Advanced relational DB', color: '#F59E0B', level: 80, proficiency_percentage: 80, years_experience: 2 }
      ]
    }
  ]

  useEffect(() => {
    fetchSkills()
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
                          {/* Check if icon is a Font Awesome class or emoji */}
                          {skill.icon.startsWith('fa') ? (
                            <i className={skill.icon} style={{ color: category.color }}></i>
                          ) : (
                            <span>{skill.icon}</span>
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
                          <div className="text-gray-300 text-xs leading-relaxed break-words">
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
