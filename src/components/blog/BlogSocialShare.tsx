'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Share2, Twitter, Linkedin, Facebook, MessageCircle, Copy, Check } from 'lucide-react'
import { socialShareButtons } from '@/lib/blog-utils'

interface BlogSocialShareProps {
  title: string
  url: string
}

const BlogSocialShare = ({ title, url }: BlogSocialShareProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [copiedUrl, setCopiedUrl] = useState(false)

  const handleShare = async (platform: string, shareUrl: string) => {
    if (platform === 'copy') {
      try {
        await navigator.clipboard.writeText(url)
        setCopiedUrl(true)
        setTimeout(() => setCopiedUrl(false), 2000)
      } catch (error) {
        console.error('Failed to copy URL:', error)
      }
    } else {
      window.open(shareUrl, '_blank', 'width=600,height=400')
    }
  }

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Twitter': return Twitter
      case 'Linkedin': return Linkedin
      case 'Facebook': return Facebook
      case 'MessageCircle': return MessageCircle
      case 'Copy': return copiedUrl ? Check : Copy
      default: return Share2
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="py-8 border-b border-dark-300"
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-white font-semibold mb-2">Share this article</h3>
          <p className="text-gray-400 text-sm">Help others discover this content</p>
        </div>

        <div className="relative">
          <motion.button
            onClick={() => setIsOpen(!isOpen)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors duration-300"
          >
            <Share2 className="w-4 h-4" />
            Share
          </motion.button>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 top-full mt-2 bg-dark-200 border border-dark-300 rounded-xl p-4 shadow-xl z-10 min-w-[200px]"
              >
                <div className="grid grid-cols-1 gap-2">
                  {socialShareButtons.map((button) => {
                    const Icon = getIcon(button.icon)
                    const shareUrl = button.shareUrl({ title, text: title, url })
                    
                    return (
                      <motion.button
                        key={button.platform}
                        onClick={() => handleShare(button.platform, shareUrl)}
                        whileHover={{ scale: 1.02, x: 5 }}
                        className="flex items-center gap-3 px-3 py-2 text-left text-gray-300 hover:text-white hover:bg-dark-300 rounded-lg transition-all duration-300"
                      >
                        <Icon 
                          className="w-4 h-4" 
                          style={{ color: button.color }}
                        />
                        <span className="text-sm">
                          {button.platform === 'copy' && copiedUrl ? 'Copied!' : button.label}
                        </span>
                      </motion.button>
                    )
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Quick Share Buttons */}
      <div className="flex items-center gap-3 mt-6">
        <span className="text-gray-400 text-sm">Quick share:</span>
        {socialShareButtons.slice(0, 4).map((button) => {
          const Icon = getIcon(button.icon)
          const shareUrl = button.shareUrl({ title, text: title, url })
          
          return (
            <motion.button
              key={button.platform}
              onClick={() => handleShare(button.platform, shareUrl)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300 hover:bg-dark-300"
              style={{ color: button.color }}
            >
              <Icon className="w-4 h-4" />
            </motion.button>
          )
        })}
      </div>
    </motion.div>
  )
}

export default BlogSocialShare
