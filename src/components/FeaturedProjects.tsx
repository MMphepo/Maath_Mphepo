'use client'

import { motion } from 'framer-motion'
import { ExternalLink, Github } from 'lucide-react'
import { useEffect, useState } from 'react'

const FeaturedProjects = () => {
  const [isVisible, setIsVisible] = useState(false)

  const projects = [
    {
      title: 'E-Commerce API Platform',
      description: 'Built a scalable REST API for an e-commerce platform handling 10k+ daily transactions with Django and PostgreSQL.',
      tags: ['Django', 'PostgreSQL', 'REST API', 'Redis'],
      image: '/api/placeholder/400/250',
      demoUrl: '#',
      githubUrl: '#',
      delay: 0.1
    },
    {
      title: 'Task Management System',
      description: 'Developed a comprehensive task management backend with real-time notifications using Laravel and WebSockets.',
      tags: ['Laravel', 'MySQL', 'WebSockets', 'Vue.js'],
      image: '/api/placeholder/400/250',
      demoUrl: '#',
      githubUrl: '#',
      delay: 0.2
    },
    {
      title: 'Analytics Dashboard API',
      description: 'Created a high-performance analytics API processing millions of data points with advanced caching strategies.',
      tags: ['Python', 'FastAPI', 'MongoDB', 'Docker'],
      image: '/api/placeholder/400/250',
      demoUrl: '#',
      githubUrl: '#',
      delay: 0.3
    }
  ]

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    const element = document.getElementById('projects')
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
    <section id="projects" className="py-20 bg-dark-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Featured <span className="text-primary">Projects</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Here are some of the backend systems I've built that solve real-world problems
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.6, delay: project.delay }}
              whileHover={{ y: -10 }}
              className="glass rounded-xl overflow-hidden group cursor-pointer"
            >
              {/* Project Image Placeholder */}
              <div className="relative h-48 bg-gradient-to-br from-primary/20 to-secondary/20 overflow-hidden">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center"
                >
                  <div className="text-center">
                    <div className="w-16 h-16 bg-white/20 rounded-lg mx-auto mb-2 flex items-center justify-center">
                      <span className="text-2xl">🚀</span>
                    </div>
                    <p className="text-white text-sm">Project Screenshot</p>
                  </div>
                </motion.div>
                
                {/* Overlay with links */}
                <div className="absolute inset-0 bg-dark-100/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                  <motion.a
                    href={project.demoUrl}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-primary text-white p-3 rounded-full hover:bg-primary/90 transition-colors duration-300"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </motion.a>
                  <motion.a
                    href={project.githubUrl}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-white text-dark-100 p-3 rounded-full hover:bg-gray-200 transition-colors duration-300"
                  >
                    <Github className="w-5 h-5" />
                  </motion.a>
                </div>
              </div>

              {/* Project Content */}
              <div className="p-6">
                <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-primary transition-colors duration-300">
                  {project.title}
                </h3>
                
                <p className="text-gray-400 mb-4 text-sm leading-relaxed">
                  {project.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tags.map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      className="px-3 py-1 bg-primary/20 text-primary text-xs rounded-full border border-primary/30"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* View Project Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full bg-transparent border border-primary text-primary py-2 rounded-lg hover:bg-primary hover:text-white transition-all duration-300 font-medium"
                >
                  View Project
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View All Projects Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isVisible ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mt-12"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-primary text-white px-8 py-3 rounded-full font-semibold hover:bg-primary/90 transition-colors duration-300"
          >
            View All Projects
          </motion.button>
        </motion.div>
      </div>
    </section>
  )
}

export default FeaturedProjects
