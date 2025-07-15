'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Settings, BarChart3, Users, FileText } from 'lucide-react'
import BlogManagement from '@/components/admin/BlogManagement'
import BlogEditor from '@/components/admin/BlogEditor'
import { adminBlogAPI, BlogPost, DashboardStats } from '@/lib/api/blog'
import { sanitizeContent } from '@/lib/security/contentSanitizer'

type ViewMode = 'list' | 'create' | 'edit'

const AdminBlogPage = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [editingPost, setEditingPost] = useState<BlogPost | undefined>()
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Fetch dashboard stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await adminBlogAPI.getDashboardStats()
        if (response.success) {
          setDashboardStats(response.data)
        }
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error)
      }
    }

    fetchStats()
  }, [])

  const handleCreateNew = () => {
    setEditingPost(undefined)
    setViewMode('create')
  }

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post)
    setViewMode('edit')
  }

  const handleSave = async (postData: any) => {
    setIsLoading(true)
    
    try {
      // Sanitize content before saving
      const sanitizedData = {
        ...postData,
        content: sanitizeContent(postData.content),
        description: sanitizeContent(postData.description)
      }

      let response
      if (editingPost) {
        response = await adminBlogAPI.updatePost(editingPost.id, sanitizedData)
      } else {
        response = await adminBlogAPI.createPost(sanitizedData)
      }

      if (response.success) {
        setViewMode('list')
        setEditingPost(undefined)
        // Refresh stats
        const statsResponse = await adminBlogAPI.getDashboardStats()
        if (statsResponse.success) {
          setDashboardStats(statsResponse.data)
        }
      } else {
        throw new Error(response.error || 'Failed to save post')
      }
    } catch (error) {
      console.error('Error saving post:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setViewMode('list')
    setEditingPost(undefined)
  }

  const handleDelete = async (postId: number) => {
    if (!confirm('Are you sure you want to delete this post?')) {
      return
    }

    try {
      const response = await adminBlogAPI.deletePost(postId)
      if (response.success) {
        // Refresh stats
        const statsResponse = await adminBlogAPI.getDashboardStats()
        if (statsResponse.success) {
          setDashboardStats(statsResponse.data)
        }
      }
    } catch (error) {
      console.error('Error deleting post:', error)
    }
  }

  return (
    <div className="min-h-screen bg-dark-100">
      {/* Header */}
      <div className="bg-dark-200/50 border-b border-dark-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Blog Administration</h1>
              <p className="text-gray-400 mt-1">Manage your blog posts and content</p>
            </div>

            {/* Quick Stats */}
            {dashboardStats && (
              <div className="hidden md:flex items-center gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">
                    {dashboardStats.stats.total_posts}
                  </div>
                  <div className="text-sm text-gray-400">Total Posts</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {dashboardStats.stats.published_posts}
                  </div>
                  <div className="text-sm text-gray-400">Published</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">
                    {dashboardStats.stats.draft_posts}
                  </div>
                  <div className="text-sm text-gray-400">Drafts</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">
                    {dashboardStats.stats.total_views.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-400">Total Views</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-dark-200/30 border-b border-dark-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setViewMode('list')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-300 ${
                viewMode === 'list'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                All Posts
              </div>
            </button>

            <button
              onClick={handleCreateNew}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-300 ${
                viewMode === 'create'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                New Post
              </div>
            </button>

            <button
              className="py-4 px-1 border-b-2 border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300 font-medium text-sm transition-colors duration-300"
            >
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Analytics
              </div>
            </button>

            <button
              className="py-4 px-1 border-b-2 border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300 font-medium text-sm transition-colors duration-300"
            >
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Comments
              </div>
            </button>

            <button
              className="py-4 px-1 border-b-2 border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300 font-medium text-sm transition-colors duration-300"
            >
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          key={viewMode}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {viewMode === 'list' && (
            <BlogManagement
              onCreateNew={handleCreateNew}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}

          {(viewMode === 'create' || viewMode === 'edit') && (
            <BlogEditor
              post={editingPost}
              onSave={handleSave}
              onCancel={handleCancel}
              isLoading={isLoading}
            />
          )}
        </motion.div>
      </div>

      {/* Success/Error Messages */}
      <div className="fixed bottom-4 right-4 z-50">
        {/* You can add toast notifications here */}
      </div>
    </div>
  )
}

export default AdminBlogPage
