'use client'

import { motion } from 'framer-motion'
import { 
  Code, 
  Database, 
  Server, 
  Shield, 
  Brain, 
  MessageSquare, 
  FileText, 
  Users 
} from 'lucide-react'
import { useEffect, useState } from 'react'

interface Strength {
  icon: any
  title: string
  description: string
  example: string
  color: string
}

const CoreStrengths = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [hoveredStrength, setHoveredStrength] = useState<string | null>(null)

  const technicalStrengths: Strength[] = [
    {
      icon: Code,
      title: 'API Development & Documentation',
      description: 'Building robust, scalable APIs with comprehensive documentation',
      example: 'Built e-commerce API serving 10k+ daily requests with auto-generated OpenAPI docs',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Server,
      title: 'RESTful Architecture',
      description: 'Designing clean, maintainable REST APIs following best practices',
      example: 'Architected student management system with 50+ endpoints, all following REST principles',
      color: 'from-green-500 to-teal-500'
    },
    {
      icon: Database,
      title: 'Relational Database Design',
      description: 'Optimizing database schemas for performance and scalability',
      example: 'Designed normalized database schema reducing query time by 60% for school scheduling system',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Shield,
      title: 'Backend Logic & Scalability',
      description: 'Implementing complex business logic with performance in mind',
      example: 'Built task tracking system handling 1000+ concurrent users with Redis caching',
      color: 'from-orange-500 to-red-500'
    }
  ]

  const softSkills: Strength[] = [
    {
      icon: Brain,
      title: 'Problem-solving',
      description: 'Breaking down complex challenges into manageable solutions',
      example: 'Debugged critical payment processing issue affecting 500+ transactions in 2 hours',
      color: 'from-indigo-500 to-purple-500'
    },
    {
      icon: MessageSquare,
      title: 'Clear Communication',
      description: 'Explaining technical concepts to both technical and non-technical stakeholders',
      example: 'Led client meetings explaining API integration process, resulting in 100% client satisfaction',
      color: 'from-cyan-500 to-blue-500'
    },
    {
      icon: FileText,
      title: 'Documentation Discipline',
      description: 'Creating comprehensive documentation for maintainable codebases',
      example: 'Documented entire Django project with 95% code coverage, enabling seamless team onboarding',
      color: 'from-teal-500 to-green-500'
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Working effectively in cross-functional teams and mentoring junior developers',
      example: 'Led 3-person backend team, mentored 2 junior developers who are now mid-level engineers',
      color: 'from-pink-500 to-rose-500'
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

    const element = document.getElementById('core-strengths')
    if (element) {
      observer.observe(element)
    }

    return () => {
      if (element) {
        observer.unobserve(element)
      }
    }
  }, [])

  const StrengthCard = ({ strength, index, isLeft }: { strength: Strength, index: number, isLeft: boolean }) => {
    const IconComponent = strength.icon
    const isHovered = hoveredStrength === strength.title

    return (
      <motion.div
        initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
        animate={isVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: isLeft ? -50 : 50 }}
        transition={{ duration: 0.6, delay: index * 0.1 }}
        whileHover={{ scale: 1.02 }}
        onHoverStart={() => setHoveredStrength(strength.title)}
        onHoverEnd={() => setHoveredStrength(null)}
        className="glass rounded-xl p-6 cursor-pointer group relative overflow-hidden"
      >
        {/* Icon */}
        <motion.div
          animate={{ 
            rotate: isHovered ? 360 : 0,
            scale: isHovered ? 1.1 : 1
          }}
          transition={{ duration: 0.5 }}
          className={`w-12 h-12 rounded-lg bg-gradient-to-r ${strength.color} p-3 mb-4 group-hover:shadow-lg transition-shadow duration-300`}
        >
          <IconComponent className="w-full h-full text-white" />
        </motion.div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-white mb-3 group-hover:text-primary transition-colors duration-300">
          {strength.title}
        </h3>

        {/* Description */}
        <p className="text-gray-400 mb-4 leading-relaxed">
          {strength.description}
        </p>

        {/* Expandable Example */}
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{
            opacity: isHovered ? 1 : 0,
            height: isHovered ? 'auto' : 0
          }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <div className="border-t border-gray-600 pt-4">
            <p className="text-sm text-primary font-medium mb-2">Real-world application:</p>
            <p className="text-sm text-gray-300 leading-relaxed">
              {strength.example}
            </p>
          </div>
        </motion.div>

        {/* Hover Glow Effect */}
        <motion.div
          animate={{ 
            opacity: isHovered ? 0.2 : 0,
            scale: isHovered ? 1 : 0.8
          }}
          className={`absolute inset-0 bg-gradient-to-r ${strength.color} rounded-xl blur-xl -z-10`}
        />

        {/* Expand Indicator */}
        <motion.div
          animate={{ opacity: isHovered ? 0 : 1 }}
          className="absolute bottom-4 right-4 text-gray-500 text-xs"
        >
          Hover for example
        </motion.div>
      </motion.div>
    )
  }

  return (
    <section id="core-strengths" className="py-20 bg-dark-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            💼 What Sets Me <span className="text-primary">Apart</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            The combination of technical expertise and soft skills that drive successful projects
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Technical Strengths */}
          <div>
            <motion.h3
              initial={{ opacity: 0, x: -30 }}
              animate={isVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-2xl font-bold text-white mb-8 flex items-center gap-3"
            >
              <span className="text-primary">⚡</span>
              Technical Strengths
            </motion.h3>
            
            <div className="space-y-6">
              {technicalStrengths.map((strength, index) => (
                <StrengthCard 
                  key={strength.title} 
                  strength={strength} 
                  index={index} 
                  isLeft={true} 
                />
              ))}
            </div>
          </div>

          {/* Soft Skills */}
          <div>
            <motion.h3
              initial={{ opacity: 0, x: 30 }}
              animate={isVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-2xl font-bold text-white mb-8 flex items-center gap-3"
            >
              <span className="text-secondary">🤝</span>
              Soft Skills
            </motion.h3>
            
            <div className="space-y-6">
              {softSkills.map((strength, index) => (
                <StrengthCard 
                  key={strength.title} 
                  strength={strength} 
                  index={index} 
                  isLeft={false} 
                />
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Summary */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="mt-16 text-center"
        >
          <div className="glass rounded-xl p-8 max-w-4xl mx-auto">
            <motion.p
              animate={{ 
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
              }}
              transition={{ duration: 4, repeat: Infinity }}
              className="text-xl font-medium bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent bg-300% leading-relaxed"
            >
              "The best backend developers don't just write code—they solve problems, 
              communicate clearly, and build systems that empower entire teams to succeed."
            </motion.p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default CoreStrengths
