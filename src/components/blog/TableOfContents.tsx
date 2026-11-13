'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { List, ChevronRight, ChevronDown } from 'lucide-react'

interface TOCItem {
  level: number
  id: string
  title: string
}

interface TableOfContentsProps {
  items: TOCItem[]
  className?: string
  isSticky?: boolean
}

const TableOfContents = ({ 
  items, 
  className = "",
  isSticky = true 
}: TableOfContentsProps) => {
  const [activeId, setActiveId] = useState<string>('')
  const [isCollapsed, setIsCollapsed] = useState(false)

  useEffect(() => {
    if (items.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      {
        rootMargin: '-20% 0% -35% 0%',
        threshold: 0
      }
    )

    // Observe all headings
    items.forEach((item) => {
      const element = document.getElementById(item.id)
      if (element) {
        observer.observe(element)
      }
    })

    return () => observer.disconnect()
  }, [items])

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      const offset = 80 // Account for fixed header
      const elementPosition = element.offsetTop - offset
      
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      })
    }
  }

  const getIndentLevel = (level: number) => {
    return Math.max(0, level - 1) * 16 // 16px per level
  }

  if (items.length === 0) {
    return null
  }

  return (
      <div className={`${className} ${isSticky ? 'sticky top-24' : ''}`}>
        <div className="bg-stone border border-border rounded-lg overflow-hidden">
          {/* Header */}
          <div 
            className="flex items-center justify-between p-4 border-b border-border cursor-pointer hover:bg-stone/50 transition-colors duration-300"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            <div className="flex items-center gap-2">
              <List className="w-5 h-5 text-blue" />
              <h3 className="font-semibold text-ink">Table of Contents</h3>
            </div>
            
            <motion.div
              animate={{ rotate: isCollapsed ? 0 : 90 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronRight className="w-4 h-4 text-muted" />
            </motion.div>
          </div>

          {/* Content */}
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <nav className="p-4 space-y-1 max-h-96 overflow-y-auto">
                  {items.map((item, index) => (
                    <motion.button
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      onClick={() => scrollToHeading(item.id)}
                      className={`w-full text-left py-2 px-3 rounded-lg transition-all duration-300 hover:bg-stone/50 group ${
                        activeId === item.id
                          ? 'bg-blue/20 text-blue border-l-2 border-blue'
                          : 'text-muted hover:text-ink'
                      }`}
                      style={{ paddingLeft: `${12 + getIndentLevel(item.level)}px` }}
                    >
                      <div className="flex items-center gap-2">
                        {/* Level indicator */}
                        <div 
                          className={`w-1 h-1 rounded-full transition-colors duration-300 ${
                            activeId === item.id ? 'bg-blue' : 'bg-slate'
                          }`}
                        />
                        
                        {/* Title */}
                        <span 
                          className={`text-sm line-clamp-2 transition-colors duration-300 ${
                            item.level === 1 ? 'font-semibold' : 
                            item.level === 2 ? 'font-medium' : 'font-normal'
                          }`}
                        >
                          {item.title}
                        </span>
                      </div>
                    </motion.button>
                  ))}
                </nav>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Progress indicator */}
        <div className="mt-4 bg-stone border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted">Reading Progress</span>
            <span className="text-sm text-blue font-medium">
              {Math.round(((items.findIndex(item => item.id === activeId) + 1) / items.length) * 100) || 0}%
            </span>
          </div>
          
          <div className="w-full bg-stone rounded-full h-2">
            <motion.div
              className="bg-blue h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ 
                width: `${((items.findIndex(item => item.id === activeId) + 1) / items.length) * 100}%` 
              }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>
  )
}

export default TableOfContents
