'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { List } from 'lucide-react'
import { generateTableOfContents } from '@/lib/blog-utils'
import { TOCItem } from '@/types/blog'

interface BlogTableOfContentsProps {
  content: string
}

const BlogTableOfContents = ({ content }: BlogTableOfContentsProps) => {
  const [tocItems, setTocItems] = useState<TOCItem[]>([])
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    const items = generateTableOfContents(content)
    setTocItems(items)
  }, [content])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      { rootMargin: '-20% 0% -35% 0%' }
    )

    // Observe all headings
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
    headings.forEach((heading) => observer.observe(heading))

    return () => observer.disconnect()
  }, [])

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const renderTocItem = (item: TOCItem, index: number) => (
    <motion.li
      key={item.id}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className={`mb-2 ${item.level > 2 ? 'ml-4' : ''}`}
    >
      <button
        onClick={() => scrollToHeading(item.id)}
        className={`text-left w-full text-sm transition-colors duration-300 hover:text-primary ${
          activeId === item.id
            ? 'text-primary font-medium'
            : 'text-gray-400'
        }`}
      >
        {item.title}
      </button>
      {item.children && (
        <ul className="mt-2 ml-4">
          {item.children.map((child, childIndex) => 
            renderTocItem(child, childIndex)
          )}
        </ul>
      )}
    </motion.li>
  )

  if (tocItems.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="sticky top-24"
    >
      <div className="glass rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <List className="w-4 h-4 text-primary" />
          <h3 className="text-white font-semibold">Table of Contents</h3>
        </div>
        
        <nav>
          <ul>
            {tocItems.map((item, index) => renderTocItem(item, index))}
          </ul>
        </nav>
      </div>
    </motion.div>
  )
}

export default BlogTableOfContents
