'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark.css'

interface BlogContentRendererProps {
  content: string
  className?: string
  isPreview?: boolean
}

const BlogContentRenderer = ({ 
  content, 
  className = "",
  isPreview = false 
}: BlogContentRendererProps) => {
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Highlight code blocks after content is rendered
    if (contentRef.current) {
      const codeBlocks = contentRef.current.querySelectorAll('pre code')
      codeBlocks.forEach((block) => {
        hljs.highlightElement(block as HTMLElement)
      })

      // Add click handlers for images (lightbox effect)
      const images = contentRef.current.querySelectorAll('img')
      images.forEach((img) => {
        img.addEventListener('click', handleImageClick)
        img.style.cursor = 'pointer'
      })

      // Add smooth scrolling for anchor links
      const links = contentRef.current.querySelectorAll('a[href^="#"]')
      links.forEach((link) => {
        link.addEventListener('click', handleAnchorClick)
      })

      // Cleanup event listeners
      return () => {
        images.forEach((img) => {
          img.removeEventListener('click', handleImageClick)
        })
        links.forEach((link) => {
          link.removeEventListener('click', handleAnchorClick)
        })
      }
    }
  }, [content])

  const handleImageClick = (e: Event) => {
    const img = e.target as HTMLImageElement
    // Create lightbox overlay
    const overlay = document.createElement('div')
    overlay.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 cursor-pointer'
    overlay.onclick = () => document.body.removeChild(overlay)

    const enlargedImg = document.createElement('img')
    enlargedImg.src = img.src
    enlargedImg.alt = img.alt
    enlargedImg.className = 'max-w-full max-h-full object-contain'

    overlay.appendChild(enlargedImg)
    document.body.appendChild(overlay)
  }

  const handleAnchorClick = (e: Event) => {
    e.preventDefault()
    const link = e.target as HTMLAnchorElement
    const targetId = link.getAttribute('href')?.substring(1)
    if (targetId) {
      const targetElement = document.getElementById(targetId)
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  // Process content to add IDs to headings for table of contents
  const processContent = (htmlContent: string) => {
    return htmlContent.replace(
      /<h([1-6])([^>]*)>(.*?)<\/h[1-6]>/g,
      (match, level, attrs, text) => {
        const cleanText = text.replace(/<[^>]*>/g, '')
        const id = cleanText
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
          .trim()
        
        return `<h${level}${attrs} id="${id}">${text}</h${level}>`
      }
    )
  }

  const processedContent = processContent(content)

  return (
    <motion.div
      ref={contentRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`blog-content-renderer ${className} ${isPreview ? 'preview-mode' : ''}`}
      dangerouslySetInnerHTML={{ __html: processedContent }}
    />
  )
}

export default BlogContentRenderer
