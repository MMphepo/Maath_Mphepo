'use client'

import { motion } from 'framer-motion'
import { Filter, SortAsc } from 'lucide-react'
import { useEffect, useState } from 'react'

interface Skill {
  name: string
  category: 'Languages' | 'Frameworks' | 'Databases' | 'Tools'
  level: 'Most Used' | 'Recently Used' | 'Learning Now'
  description: string
  icon: string
  color: string
}

const SkillsTechnologies = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [sortBy, setSortBy] = useState<string>('Most Used')
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null)

  const skills: Skill[] = [
    {
      name: 'Python',
      category: 'Languages',
      level: 'Most Used',
      description: 'Powerful programming language for backend development',
      icon: '🐍',
      color: 'from-yellow-400 to-blue-500'
    },
    {
      name: 'PHP',
      category: 'Languages',
      level: 'Most Used',
      description: 'Server-side scripting language for web development',
      icon: '🐘',
      color: 'from-purple-500 to-blue-600'
    },
    {
      name: 'SQL',
      category: 'Languages',
      level: 'Most Used',
      description: 'Database query language for data manipulation',
      icon: '🗃️',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      name: 'Django',
      category: 'Frameworks',
      level: 'Most Used',
      description: 'High-level Python web framework for rapid development',
      icon: '🎯',
      color: 'from-green-500 to-green-700'
    },
    {
      name: 'Laravel',
      category: 'Frameworks',
      level: 'Most Used',
      description: 'Elegant PHP framework for web artisans',
      icon: '🔥',
      color: 'from-red-500 to-orange-600'
    },
    {
      name: 'FastAPI',
      category: 'Frameworks',
      level: 'Recently Used',
      description: 'Modern, fast web framework for building APIs with Python',
      icon: '⚡',
      color: 'from-teal-500 to-green-600'
    },
    {
      name: 'PostgreSQL',
      category: 'Databases',
      level: 'Most Used',
      description: 'Advanced open-source relational database',
      icon: '🐘',
      color: 'from-blue-600 to-indigo-700'
    },
    {
      name: 'MySQL',
      category: 'Databases',
      level: 'Most Used',
      description: 'Popular open-source relational database management system',
      icon: '🗄️',
      color: 'from-orange-500 to-yellow-600'
    },
    {
      name: 'Redis',
      category: 'Databases',
      level: 'Recently Used',
      description: 'In-memory data structure store for caching',
      icon: '⚡',
      color: 'from-red-500 to-red-700'
    },
    {
      name: 'Git',
      category: 'Tools',
      level: 'Most Used',
      description: 'Distributed version control system',
      icon: '📚',
      color: 'from-orange-500 to-red-600'
    },
    {
      name: 'Docker',
      category: 'Tools',
      level: 'Recently Used',
      description: 'Containerization platform for consistent deployments',
      icon: '🐳',
      color: 'from-blue-500 to-cyan-600'
    },
    {
      name: 'Postman',
      category: 'Tools',
      level: 'Most Used',
      description: 'API development and testing tool',
      icon: '📮',
      color: 'from-orange-500 to-pink-600'
    },
    {
      name: 'VS Code',
      category: 'Tools',
      level: 'Most Used',
      description: 'Powerful code editor with extensive extensions',
      icon: '💻',
      color: 'from-blue-600 to-purple-700'
    }
  ]

  const categories = ['All', 'Languages', 'Frameworks', 'Databases', 'Tools']
  const sortOptions = ['Most Used', 'Recently Used', 'Learning Now']

  const filteredAndSortedSkills = skills
    .filter(skill => selectedCategory === 'All' || skill.category === selectedCategory)
    .sort((a, b) => {
      if (sortBy === 'Most Used') {
        return a.level === 'Most Used' ? -1 : 1
      } else if (sortBy === 'Recently Used') {
        return a.level === 'Recently Used' ? -1 : 1
      } else {
        return a.level === 'Learning Now' ? -1 : 1
      }
    })

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.2 }
    )

    const element = document.getElementById('skills-tech')
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
    <section id="skills-tech" className="py-20 bg-dark-200/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            🛠️ Technologies I <span className="text-primary">Use</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            My toolkit for building robust backend systems
          </p>
        </motion.div>

        {/* Filter Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
        >
          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-primary" />
            <span className="text-white font-medium">Filter:</span>
            <div className="flex gap-2">
              {categories.map((category) => (
                <motion.button
                  key={category}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    selectedCategory === category
                      ? 'bg-primary text-white'
                      : 'bg-dark-300 text-gray-400 hover:text-white'
                  }`}
                >
                  {category}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Sort Control */}
          <div className="flex items-center gap-2">
            <SortAsc className="w-5 h-5 text-secondary" />
            <span className="text-white font-medium">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-dark-300 text-white px-4 py-2 rounded-full text-sm font-medium border border-gray-600 focus:border-secondary focus:outline-none"
            >
              {sortOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </motion.div>

        {/* Skills Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredAndSortedSkills.map((skill, index) => (
            <motion.div
              key={skill.name}
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
              onHoverStart={() => setHoveredSkill(skill.name)}
              onHoverEnd={() => setHoveredSkill(null)}
              className="relative group cursor-pointer"
            >
              <div className={`glass rounded-xl p-6 text-center transition-all duration-300 group-hover:shadow-2xl bg-gradient-to-br ${skill.color} bg-opacity-10 relative overflow-hidden`}>
                {/* Skill Icon */}
                <motion.div
                  animate={{ 
                    rotate: hoveredSkill === skill.name ? 360 : 0,
                    scale: hoveredSkill === skill.name ? 1.2 : 1
                  }}
                  transition={{ duration: 0.5 }}
                  className="text-4xl mb-3"
                >
                  {skill.icon}
                </motion.div>
                
                {/* Skill Name */}
                <h3 className="text-white font-semibold mb-2 group-hover:text-primary transition-colors duration-300">
                  {skill.name}
                </h3>

                {/* Level Badge */}
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                  skill.level === 'Most Used' 
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : skill.level === 'Recently Used'
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                }`}>
                  {skill.level}
                </span>

                {/* Glow Effect */}
                <motion.div
                  animate={{ 
                    opacity: hoveredSkill === skill.name ? 0.6 : 0,
                    scale: hoveredSkill === skill.name ? 1 : 0.8
                  }}
                  className={`absolute inset-0 bg-gradient-to-r ${skill.color} rounded-xl blur-xl -z-10`}
                />
              </div>

              {/* Tooltip */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ 
                  opacity: hoveredSkill === skill.name ? 1 : 0,
                  y: hoveredSkill === skill.name ? 0 : 10
                }}
                className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-dark-300 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap z-20 pointer-events-none border border-gray-600"
              >
                {skill.description}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-dark-300"></div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Skills Summary */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="mt-16 text-center"
        >
          <div className="glass rounded-xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-6">
              🎯 My <span className="text-primary">Expertise</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">5+</div>
                <div className="text-gray-400">Core Technologies</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-secondary mb-2">3+</div>
                <div className="text-gray-400">Years Experience</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">15+</div>
                <div className="text-gray-400">Projects Built</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default SkillsTechnologies
