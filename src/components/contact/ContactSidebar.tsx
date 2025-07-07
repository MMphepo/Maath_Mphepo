'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Mail, Clock, MapPin, Github, Linkedin, Twitter, ExternalLink } from 'lucide-react'
import { api } from '@/lib/api-config'
import { ContactInfo } from '@/types/contact'

const ContactSidebar = () => {
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        const response = await api.contact.info()
        if (response.success && response.data) {
          setContactInfo(response.data)
        } else {
          // Fallback to default contact info
          setContactInfo(getDefaultContactInfo())
        }
      } catch (error) {
        console.error('Failed to fetch contact info:', error)
        setContactInfo(getDefaultContactInfo())
      } finally {
        setLoading(false)
      }
    }

    fetchContactInfo()
  }, [])

  const getDefaultContactInfo = (): ContactInfo => ({
    email: 'maathmphepo80@gmail.com',
    location: 'Malawi, Lilongwe, Working Globally',
    socialLinks: [
      { platform: 'GitHub', url: 'https://github.com/Mmphepo', is_active: true },
      { platform: 'LinkedIn', url: 'https://linkedin.com/in/maathmphepo', is_active: true },
      { platform: 'Twitter', url: 'https://x.com/MMphepo32688', is_active: true }
    ],
    availability: {
      status: 'Available for projects',
      responseTime: '24 hours',
      timezone: 'UTC+2 (CAT)'
    }
  })

  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'github':
        return Github
      case 'linkedin':
        return Linkedin
      case 'twitter':
        return Twitter
      default:
        return ExternalLink
    }
  }



  if (loading) {
    return (
      <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-6 bg-gray-600 rounded w-3/4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-600 rounded"></div>
            <div className="h-4 bg-gray-600 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!contactInfo) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Contact Information */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8"
      >
        <h3 className="text-2xl font-bold text-white mb-6">Contact Information</h3>
        
        <div className="space-y-6">
          {/* Email */}
          <motion.div
            whileHover={{ x: 5 }}
            className="flex items-start space-x-4 group cursor-pointer"
            onClick={() => window.location.href = `mailto:${contactInfo.email}`}
          >
            <div className="flex-shrink-0 w-12 h-12 bg-primary-500/20 rounded-lg flex items-center justify-center group-hover:bg-primary-500/30 transition-colors">
              <Mail className="w-6 h-6 text-primary-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Email</p>
              <p className="text-white font-medium group-hover:text-primary-400 transition-colors">
                maathmphepo80@gmail.com
              </p>
            </div>
          </motion.div>

          {/* Location */}
          <motion.div
            whileHover={{ x: 5 }}
            className="flex items-start space-x-4"
          >
            <div className="flex-shrink-0 w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <MapPin className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Location</p>
              <p className="text-white font-medium">{contactInfo.location}</p>
            </div>
          </motion.div>

          {/* Response Time */}
          <motion.div
            whileHover={{ x: 5 }}
            className="flex items-start space-x-4"
          >
            <div className="flex-shrink-0 w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Response Time</p>
              <p className="text-white font-medium">
                I typically respond within {contactInfo.availability.responseTime}
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Social Links */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8"
      >
        <h3 className="text-2xl font-bold text-white mb-6">Connect With Me</h3>
        
        <div className="space-y-4">
          {contactInfo.socialLinks
            .filter(link => link.is_active)
            .map((link, index) => {
              const Icon = getSocialIcon(link.platform)
              return (
                <motion.a
                  key={link.platform}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, x: 10 }}
                  className="flex items-center space-x-4 p-4 rounded-lg bg-dark-300/30 hover:bg-dark-300/50 transition-all duration-300 group"
                >
                  <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center group-hover:shadow-lg group-hover:shadow-primary-500/25 transition-all duration-300">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium group-hover:text-primary-400 transition-colors">
                      {link.platform}
                    </p>
                    <p className="text-gray-400 text-sm">
                      @{link.url.split('/').pop()}
                    </p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-primary-400 transition-colors" />
                </motion.a>
              )
            })}
        </div>
      </motion.div>

      {/* Availability Status */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8"
      >
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <h3 className="text-xl font-bold text-white">Availability</h3>
        </div>
        
        <p className="text-green-400 font-medium mb-2">
          {contactInfo.availability.status}
        </p>
        <p className="text-gray-400 text-sm">
          Timezone: {contactInfo.availability.timezone}
        </p>
      </motion.div>
    </div>
  )
}

export default ContactSidebar
