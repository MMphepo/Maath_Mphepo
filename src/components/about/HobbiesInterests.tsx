'use client'

import { motion } from 'framer-motion'
import { Sprout, Lightbulb, BookOpen, TrendingUp } from 'lucide-react'
import { useEffect, useState } from 'react'

interface Hobby {
  icon: any
  title: string
  description: string
  details: string[]
  color: string
  bgGradient: string
}

const HobbiesInterests = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [hoveredHobby, setHoveredHobby] = useState<string | null>(null)

  const hobbies: Hobby[] = [
    {
      icon: Sprout,
      title: 'Agriculture & Sustainability',
      description: 'Passionate about sustainable farming and agricultural technology',
      details: [
        'Exploring precision agriculture and IoT in farming',
        'Researching sustainable farming practices',
        'Building tech solutions for small-scale farmers',
        'Growing organic vegetables in my backyard garden'
      ],
      color: 'text-green-400',
      bgGradient: 'from-green-500 to-emerald-600'
    },
    {
      icon: TrendingUp,
      title: 'Entrepreneurship',
      description: 'Building solutions that create value and solve real problems',
      details: [
        'Developing SaaS products for small businesses',
        'Mentoring aspiring tech entrepreneurs',
        'Studying market trends and business models',
        'Building MVPs and validating product ideas'
      ],
      color: 'text-blue-400',
      bgGradient: 'from-blue-500 to-cyan-600'
    },
    {
      icon: Lightbulb,
      title: 'Motivational Content',
      description: 'Creating and sharing content that inspires growth and learning',
      details: [
        'Writing technical blogs and tutorials',
        'Sharing coding tips and best practices',
        'Creating educational content for developers',
        'Speaking at local tech meetups and events'
      ],
      color: 'text-yellow-400',
      bgGradient: 'from-yellow-500 to-orange-600'
    },
    {
      icon: BookOpen,
      title: 'Continuous Learning',
      description: 'Always exploring new technologies and expanding knowledge',
      details: [
        'Reading technical books and research papers',
        'Taking online courses in emerging technologies',
        'Experimenting with new programming languages',
        'Contributing to open-source projects'
      ],
      color: 'text-purple-400',
      bgGradient: 'from-purple-500 to-pink-600'
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

    const element = document.getElementById('hobbies')
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
    <section id="hobbies" className="py-20 bg-dark-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            🌟 Beyond <span className="text-primary">Code</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            The passions and interests that fuel my creativity and drive for innovation
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {hobbies.map((hobby, index) => {
            const IconComponent = hobby.icon
            const isHovered = hoveredHobby === hobby.title

            return (
              <motion.div
                key={hobby.title}
                initial={{ opacity: 0, y: 50 }}
                animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                transition={{ 
                  duration: 0.6, 
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 100
                }}
                whileHover={{ 
                  y: -10,
                  rotateY: 5,
                  rotateX: 5,
                  transition: { duration: 0.3 }
                }}
                onHoverStart={() => setHoveredHobby(hobby.title)}
                onHoverEnd={() => setHoveredHobby(null)}
                className="group cursor-pointer"
                style={{ transformStyle: 'preserve-3d' }}
              >
                <div className="glass rounded-xl p-6 h-full relative overflow-hidden transition-all duration-300 group-hover:shadow-2xl">
                  {/* Icon */}
                  <motion.div
                    animate={{ 
                      rotate: isHovered ? 360 : 0,
                      scale: isHovered ? 1.1 : 1
                    }}
                    transition={{ duration: 0.5 }}
                    className={`w-16 h-16 rounded-full bg-gradient-to-r ${hobby.bgGradient} p-4 mb-6 mx-auto group-hover:shadow-lg`}
                  >
                    <IconComponent className="w-full h-full text-white" />
                  </motion.div>

                  {/* Title */}
                  <h3 className={`text-lg font-semibold mb-3 text-center group-hover:${hobby.color} transition-colors duration-300 text-white`}>
                    {hobby.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-400 text-center mb-4 leading-relaxed text-sm">
                    {hobby.description}
                  </p>

                  {/* Details List */}
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
                      <ul className="space-y-2">
                        {hobby.details.map((detail, detailIndex) => (
                          <motion.li
                            key={detailIndex}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{
                              opacity: isHovered ? 1 : 0,
                              x: isHovered ? 0 : -20
                            }}
                            transition={{ duration: 0.3, delay: detailIndex * 0.1 }}
                            className="flex items-start gap-2 text-gray-300 text-xs"
                          >
                            <span className={`${hobby.color} mt-1 text-xs`}>•</span>
                            {detail}
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>

                  {/* Hover Glow Effect */}
                  <motion.div
                    animate={{ 
                      opacity: isHovered ? 0.3 : 0,
                      scale: isHovered ? 1 : 0.8
                    }}
                    className={`absolute inset-0 bg-gradient-to-r ${hobby.bgGradient} rounded-xl blur-xl -z-10`}
                  />

                  {/* Hover Indicator */}
                  <motion.div
                    animate={{ opacity: isHovered ? 0 : 1 }}
                    className="absolute bottom-3 right-3 text-gray-500 text-xs"
                  >
                    Hover for details
                  </motion.div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Bottom Quote */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="text-center mt-16"
        >
          <div className="glass rounded-xl p-8 max-w-4xl mx-auto">
            <motion.p
              animate={{ 
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="text-xl font-medium bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent bg-300% leading-relaxed"
            >
              "The best developers are not just coders—they're curious minds who find inspiration 
              everywhere and bring diverse perspectives to every problem they solve."
            </motion.p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default HobbiesInterests
