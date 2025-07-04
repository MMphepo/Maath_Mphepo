'use client'

import { motion } from 'framer-motion'
import { Tag, TrendingUp, Calendar, Eye, Heart } from 'lucide-react'
import { BlogTag } from '@/types/blog'

interface BlogFiltersProps {
  tags: BlogTag[]
  selectedTag: string
  sortBy: 'createdAt' | 'views' | 'likes'
  onTagChange: (tag: string) => void
  onSortChange: (sort: 'createdAt' | 'views' | 'likes') => void
}

const BlogFilters = ({
  tags,
  selectedTag,
  sortBy,
  onTagChange,
  onSortChange
}: BlogFiltersProps) => {
  const sortOptions = [
    { value: 'createdAt', label: 'Latest', icon: Calendar },
    { value: 'views', label: 'Most Viewed', icon: Eye },
    { value: 'likes', label: 'Most Liked', icon: Heart }
  ] as const

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      className="glass rounded-xl p-6 mb-8"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sort Options */}
        <div>
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Sort By
          </h3>
          <div className="flex flex-wrap gap-3">
            {sortOptions.map((option) => (
              <motion.button
                key={option.value}
                onClick={() => onSortChange(option.value)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  sortBy === option.value
                    ? 'bg-primary text-white shadow-lg shadow-primary/25'
                    : 'bg-dark-300 text-gray-300 hover:bg-dark-200 hover:text-white'
                }`}
              >
                <option.icon className="w-4 h-4" />
                {option.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Tag Filters */}
        <div>
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Tag className="w-4 h-4 text-primary" />
            Filter by Topic
          </h3>
          <div className="flex flex-wrap gap-2">
            {/* All Tags Button */}
            <motion.button
              onClick={() => onTagChange('')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                !selectedTag
                  ? 'bg-primary text-white shadow-lg shadow-primary/25'
                  : 'bg-dark-300 text-gray-300 hover:bg-dark-200 hover:text-white'
              }`}
            >
              All Topics
            </motion.button>

            {/* Individual Tag Buttons */}
            {tags.map((tag) => (
              <motion.button
                key={tag.id}
                onClick={() => onTagChange(tag.name)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  selectedTag === tag.name
                    ? 'bg-primary text-white shadow-lg shadow-primary/25'
                    : 'bg-dark-300 text-gray-300 hover:bg-dark-200 hover:text-white'
                }`}
              >
                {tag.name}
                <span className="text-xs opacity-75">({tag.count})</span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Active Filters Summary */}
      {(selectedTag || sortBy !== 'createdAt') && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 pt-6 border-t border-dark-300"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span>Active filters:</span>
              {selectedTag && (
                <span className="px-2 py-1 bg-primary/20 text-primary rounded text-xs">
                  Topic: {selectedTag}
                </span>
              )}
              {sortBy !== 'createdAt' && (
                <span className="px-2 py-1 bg-secondary/20 text-secondary rounded text-xs">
                  Sort: {sortOptions.find(opt => opt.value === sortBy)?.label}
                </span>
              )}
            </div>
            
            <motion.button
              onClick={() => {
                onTagChange('')
                onSortChange('createdAt')
              }}
              whileHover={{ scale: 1.05 }}
              className="text-xs text-primary hover:text-secondary transition-colors duration-300"
            >
              Clear all
            </motion.button>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

export default BlogFilters
