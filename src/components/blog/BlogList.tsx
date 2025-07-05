'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, Calendar, Clock, Eye, Heart, Tag } from 'lucide-react'
import { BlogPost, BlogTag, BlogListResponse } from '@/types/blog'
import { formatDate, extractExcerpt } from '@/lib/blog-utils'
import { api } from '@/lib/api-config'
import BlogCard from './BlogCard'
import BlogFilters from './BlogFilters'
import BlogPagination from './BlogPagination'

const BlogList = () => {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [tags, setTags] = useState<BlogTag[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState('')
  const [sortBy, setSortBy] = useState<'createdAt' | 'views' | 'likes'>('createdAt')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showFilters, setShowFilters] = useState(false)

  // Fetch blog posts
  const fetchPosts = async () => {
    try {
      setLoading(true)
      const params = {
        page: currentPage.toString(),
        limit: '6',
        ...(searchQuery && { search: searchQuery }),
        ...(selectedTag && { tag: selectedTag }),
        sortBy,
        sortOrder: 'desc'
      }

      const response = await api.blog.list(params)

      if (response.success && response.data) {
        setPosts(response.data.posts)
        setTotalPages(response.data.totalPages)
      } else {
        console.error('Error fetching posts:', response.error)
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch tags
  const fetchTags = async () => {
    try {
      const response = await api.blog.tags()
      if (response.success && response.data) {
        setTags(response.data)
      } else {
        console.error('Error fetching tags:', response.error)
      }
    } catch (error) {
      console.error('Error fetching tags:', error)
    }
  }

  useEffect(() => {
    fetchTags()
  }, [])

  useEffect(() => {
    fetchPosts()
  }, [currentPage, searchQuery, selectedTag, sortBy])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setCurrentPage(1)
  }

  const handleTagFilter = (tag: string) => {
    setSelectedTag(tag)
    setCurrentPage(1)
  }

  const handleSortChange = (sort: 'createdAt' | 'views' | 'likes') => {
    setSortBy(sort)
    setCurrentPage(1)
  }

  return (
    <section className="py-20 bg-dark-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto mb-8">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-dark-200 border border-dark-300 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary transition-colors duration-300"
            />
          </div>

          {/* Filter Toggle */}
          <div className="flex justify-center mb-6">
            <motion.button
              onClick={() => setShowFilters(!showFilters)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-6 py-3 bg-dark-200 border border-dark-300 rounded-xl text-white hover:border-primary transition-colors duration-300"
            >
              <Filter className="w-4 h-4" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </motion.button>
          </div>

          {/* Filters */}
          <AnimatePresence>
            {showFilters && (
              <BlogFilters
                tags={tags}
                selectedTag={selectedTag}
                sortBy={sortBy}
                onTagChange={handleTagFilter}
                onSortChange={handleSortChange}
              />
            )}
          </AnimatePresence>
        </motion.div>

        {/* Results Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex justify-between items-center mb-8"
        >
          <div className="text-gray-400">
            {loading ? 'Loading...' : `${posts.length} articles found`}
            {selectedTag && (
              <span className="ml-2">
                in <span className="text-primary">{selectedTag}</span>
              </span>
            )}
          </div>
          
          {selectedTag && (
            <motion.button
              onClick={() => handleTagFilter('')}
              whileHover={{ scale: 1.05 }}
              className="text-sm text-primary hover:text-secondary transition-colors duration-300"
            >
              Clear filter
            </motion.button>
          )}
        </motion.div>

        {/* Blog Posts Grid */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {[...Array(6)].map((_, index) => (
                <div key={index} className="glass rounded-xl p-6 animate-pulse">
                  <div className="w-full h-48 bg-dark-300 rounded-lg mb-4"></div>
                  <div className="h-4 bg-dark-300 rounded mb-2"></div>
                  <div className="h-4 bg-dark-300 rounded w-3/4 mb-4"></div>
                  <div className="flex gap-2 mb-4">
                    <div className="h-6 bg-dark-300 rounded w-16"></div>
                    <div className="h-6 bg-dark-300 rounded w-20"></div>
                  </div>
                  <div className="h-3 bg-dark-300 rounded mb-2"></div>
                  <div className="h-3 bg-dark-300 rounded w-2/3"></div>
                </div>
              ))}
            </motion.div>
          ) : posts.length > 0 ? (
            <motion.div
              key="posts"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {posts.map((post, index) => (
                <BlogCard
                  key={post.id}
                  post={post}
                  index={index}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="no-posts"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-20"
            >
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-2xl font-bold text-white mb-2">No articles found</h3>
              <p className="text-gray-400 mb-6">
                {searchQuery || selectedTag
                  ? 'Try adjusting your search or filter criteria'
                  : 'Check back soon for new content!'}
              </p>
              {(searchQuery || selectedTag) && (
                <motion.button
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedTag('')
                  }}
                  whileHover={{ scale: 1.05 }}
                  className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors duration-300"
                >
                  Clear all filters
                </motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pagination */}
        {!loading && posts.length > 0 && totalPages > 1 && (
          <BlogPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </section>
  )
}

export default BlogList
