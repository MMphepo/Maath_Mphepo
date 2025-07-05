'use client'

import { motion } from 'framer-motion'
import { ExternalLink, Github } from 'lucide-react'
import { useEffect, useState } from 'react'
import api from '@/lib/api-config'

interface Project {
  id: string
  title: string
  description: string
  detailed_description?: string
  tech_stack: (string | { name: string; [key: string]: any })[]
  image?: string
  demo_url?: string
  github_url?: string
  live_link?: string
  github_link?: string
  slug: string
  is_featured: boolean
  status: string
  my_role: string
  features?: string[]
}

const FeaturedProjects = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showAll, setShowAll] = useState(false)

  // Fetch projects from Django API
  const fetchProjects = async () => {
    try {
      setLoading(true)
      const response = await api.projects.list()

      if (response.success && response.data) {
        // Get all projects and sort by featured status
        const allProjects = response.data.projects || []
        const sortedProjects = allProjects.sort((a: Project, b: Project) => {
          // Featured projects first, then by title
          if (a.is_featured && !b.is_featured) return -1
          if (!a.is_featured && b.is_featured) return 1
          return a.title.localeCompare(b.title)
        })
        setProjects(sortedProjects)
      } else {
        console.error('Error fetching projects:', response.error)
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

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
            Project <span className="text-primary">Portfolio</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            A comprehensive showcase of backend systems, web applications, and IoT projects I've built
          </p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="glass rounded-xl overflow-hidden animate-pulse">
                <div className="h-48 bg-dark-300/50" />
                <div className="p-6">
                  <div className="h-6 bg-dark-300/50 rounded mb-3" />
                  <div className="h-4 bg-dark-300/50 rounded mb-2" />
                  <div className="h-4 bg-dark-300/50 rounded mb-4 w-3/4" />
                  <div className="flex gap-2 mb-4">
                    <div className="h-6 w-16 bg-dark-300/50 rounded-full" />
                    <div className="h-6 w-20 bg-dark-300/50 rounded-full" />
                  </div>
                  <div className="h-10 bg-dark-300/50 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {(showAll ? projects : projects.slice(0, 6)).map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 50 }}
                  animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -10 }}
                  className="glass rounded-xl overflow-hidden group cursor-pointer"
                >
                  {/* Project Image */}
                  <div className="relative h-48 overflow-hidden">
                    {project.image ? (
                      <motion.img
                        src={project.image}
                        alt={project.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
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
                  )}

                  {/* Overlay with links */}
                  <div className="absolute inset-0 bg-dark-100/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                    {(project.demo_url || project.live_link) && (
                      <motion.a
                        href={project.demo_url || project.live_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-primary text-white p-3 rounded-full hover:bg-primary/90 transition-colors duration-300"
                      >
                        <ExternalLink className="w-5 h-5" />
                      </motion.a>
                    )}
                    {(project.github_url || project.github_link) && (
                      <motion.a
                        href={project.github_url || project.github_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-white text-dark-100 p-3 rounded-full hover:bg-gray-200 transition-colors duration-300"
                      >
                        <Github className="w-5 h-5" />
                      </motion.a>
                    )}
                  </div>
                </div>

                {/* Project Content */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-semibold text-white group-hover:text-primary transition-colors duration-300">
                      {project.title}
                    </h3>
                    {project.is_featured && (
                      <span className="px-2 py-1 bg-primary/20 text-primary text-xs rounded-full border border-primary/30">
                        Featured
                      </span>
                    )}
                  </div>

                  <div className="mb-3">
                    <span className="text-xs text-gray-500 uppercase tracking-wide">
                      {project.my_role} • {project.status}
                    </span>
                  </div>

                  <p className="text-gray-400 mb-4 text-sm leading-relaxed">
                    {project.description}
                  </p>

                  {/* Features (if available) */}
                  {project.features && project.features.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {project.features.slice(0, 3).map((feature, featureIndex) => (
                          <span
                            key={featureIndex}
                            className="px-2 py-1 bg-dark-300/50 text-gray-300 text-xs rounded"
                          >
                            {feature}
                          </span>
                        ))}
                        {project.features.length > 3 && (
                          <span className="px-2 py-1 bg-dark-300/50 text-gray-300 text-xs rounded">
                            +{project.features.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Tech Stack Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.tech_stack?.map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="px-3 py-1 bg-primary/20 text-primary text-xs rounded-full border border-primary/30"
                      >
                        {typeof tag === 'string' ? tag : (tag?.name || 'Technology')}
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

            {/* Show More/Less Button */}
            {projects.length > 6 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={isVisible ? { opacity: 1 } : { opacity: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="text-center mt-12"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowAll(!showAll)}
                  className="bg-primary text-white px-8 py-3 rounded-full font-semibold hover:bg-primary/90 transition-colors duration-300"
                >
                  {showAll ? 'Show Less' : `Show All ${projects.length} Projects`}
                </motion.button>
              </motion.div>
            )}
          </>
        )}
      </div>
    </section>
  )
}

export default FeaturedProjects
