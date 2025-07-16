'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Globe,
  Lock,
  Star,
  Calendar,
  TrendingUp,
  Heart,
  RefreshCw
} from 'lucide-react'

// Local interface for management list view
interface BlogManagementPost {
  id: number
  title: string
  slug: string
  description: string
  banner_image?: string
  tags: string[]
  is_published: boolean
  is_featured: boolean
  views: number
  likes: number
  created_at: string
  updated_at: string
  author_name: string
}

interface BlogManagementProps {
  onCreateNew: () => void
  onEdit: (post: BlogManagementPost) => void
  onDelete: (postId: number) => void
}

const BlogManagement = ({ onCreateNew, onEdit, onDelete }: BlogManagementProps) => {
  const [posts, setPosts] = useState<BlogManagementPost[]>([])
  const [filteredPosts, setFilteredPosts] = useState<BlogManagementPost[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'featured'>('all')
  const [sortBy, setSortBy] = useState<'created_at' | 'updated_at' | 'views' | 'likes'>('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    fetchPosts()
  }, [])

  useEffect(() => {
    filterAndSortPosts()
  }, [posts, searchTerm, statusFilter, sortBy, sortOrder])

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/blog/admin/posts/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        // Map API response to local interface
        const mappedPosts = (data.results || data).map((post: any) => ({
          id: post.id,
          title: post.title,
          slug: post.slug,
          description: post.description,
          banner_image: post.banner_image,
          tags: post.tags || [],
          is_published: post.is_published,
          is_featured: post.is_featured,
          views: post.views || 0,
          likes: post.likes || 0,
          created_at: post.created_at,
          updated_at: post.updated_at,
          author_name: post.author?.name || post.author_name || 'Unknown'
        }))
        setPosts(mappedPosts)
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortPosts = () => {
    let filtered = [...posts]

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Apply status filter
    switch (statusFilter) {
      case 'published':
        filtered = filtered.filter(post => post.is_published)
        break
      case 'draft':
        filtered = filtered.filter(post => !post.is_published)
        break
      case 'featured':
        filtered = filtered.filter(post => post.is_featured)
        break
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy]
      let bValue: any = b[sortBy]

      if (sortBy === 'created_at' || sortBy === 'updated_at') {
        aValue = new Date(aValue).getTime()
        bValue = new Date(bValue).getTime()
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    setFilteredPosts(filtered)
  }

  const handleTogglePublish = async (post: BlogManagementPost) => {
    try {
      const response = await fetch(`/api/blog/admin/posts/${post.id}/toggle_publish/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        setPosts(prev => prev.map(p => 
          p.id === post.id ? { ...p, is_published: !p.is_published } : p
        ))
      }
    } catch (error) {
      console.error('Failed to toggle publish status:', error)
    }
  }

  const handleToggleFeatured = async (post: BlogManagementPost) => {
    try {
      const response = await fetch(`/api/blog/admin/posts/${post.id}/toggle_featured/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        setPosts(prev => prev.map(p => 
          p.id === post.id ? { ...p, is_featured: !p.is_featured } : p
        ))
      }
    } catch (error) {
      console.error('Failed to toggle featured status:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Blog Management</h1>
          <p className="text-gray-400">Manage your blog posts and content</p>
        </div>
        
        <button
          onClick={onCreateNew}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-green-600 transition-colors duration-300"
        >
          <Plus className="w-5 h-5" />
          New Post
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-dark-200/30 border border-dark-300 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Posts</p>
              <p className="text-2xl font-bold text-white">{posts.length}</p>
            </div>
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-dark-200/30 border border-dark-300 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Published</p>
              <p className="text-2xl font-bold text-white">
                {posts.filter(p => p.is_published).length}
              </p>
            </div>
            <div className="p-3 bg-green-500/20 rounded-lg">
              <Globe className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-dark-200/30 border border-dark-300 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Views</p>
              <p className="text-2xl font-bold text-white">
                {posts.reduce((sum, post) => sum + post.views, 0).toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-purple-500/20 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-400" />
            </div>
          </div>
        </div>

        <div className="bg-dark-200/30 border border-dark-300 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Likes</p>
              <p className="text-2xl font-bold text-white">
                {posts.reduce((sum, post) => sum + post.likes, 0).toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-red-500/20 rounded-lg">
              <Heart className="w-6 h-6 text-red-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-dark-200/50 border border-dark-300 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary transition-colors duration-300"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="px-4 py-3 bg-dark-200/50 border border-dark-300 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary transition-colors duration-300"
        >
          <option value="all">All Posts</option>
          <option value="published">Published</option>
          <option value="draft">Drafts</option>
          <option value="featured">Featured</option>
        </select>

        <select
          value={`${sortBy}-${sortOrder}`}
          onChange={(e) => {
            const [field, order] = e.target.value.split('-')
            setSortBy(field as any)
            setSortOrder(order as any)
          }}
          className="px-4 py-3 bg-dark-200/50 border border-dark-300 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary transition-colors duration-300"
        >
          <option value="created_at-desc">Newest First</option>
          <option value="created_at-asc">Oldest First</option>
          <option value="updated_at-desc">Recently Updated</option>
          <option value="views-desc">Most Views</option>
          <option value="likes-desc">Most Likes</option>
        </select>
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">No posts found</p>
          </div>
        ) : (
          filteredPosts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-dark-200/30 border border-dark-300 rounded-lg p-6 hover:border-primary/50 transition-colors duration-300"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-white hover:text-primary cursor-pointer">
                      {post.title}
                    </h3>
                    
                    <div className="flex items-center gap-2">
                      {post.is_published ? (
                        <span className="flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
                          <Globe className="w-3 h-3" />
                          Published
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 px-2 py-1 bg-gray-500/20 text-gray-400 rounded-full text-xs">
                          <Lock className="w-3 h-3" />
                          Draft
                        </span>
                      )}
                      
                      {post.is_featured && (
                        <span className="flex items-center gap-1 px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">
                          <Star className="w-3 h-3" />
                          Featured
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-gray-400 mb-3 line-clamp-2">{post.description}</p>

                  <div className="flex items-center gap-6 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(post.created_at)}
                    </span>
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      {post.views.toLocaleString()} views
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      {post.likes.toLocaleString()} likes
                    </span>
                  </div>

                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {post.tags.slice(0, 3).map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
                          className="px-2 py-1 bg-primary/20 text-primary rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                      {post.tags.length > 3 && (
                        <span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded text-xs">
                          +{post.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleTogglePublish(post)}
                    className={`p-2 rounded-lg transition-colors duration-300 ${
                      post.is_published
                        ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                        : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'
                    }`}
                    title={post.is_published ? 'Unpublish' : 'Publish'}
                  >
                    {post.is_published ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => handleToggleFeatured(post)}
                    className={`p-2 rounded-lg transition-colors duration-300 ${
                      post.is_featured
                        ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                        : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'
                    }`}
                    title={post.is_featured ? 'Unfeature' : 'Feature'}
                  >
                    <Star className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onEdit(post)}
                    className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors duration-300"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onDelete(post.id)}
                    className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors duration-300"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}

export default BlogManagement
