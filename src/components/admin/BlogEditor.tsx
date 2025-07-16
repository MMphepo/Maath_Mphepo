'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Save, 
  Eye, 
  Send, 
  ArrowLeft, 
  Tag, 
  Image as ImageIcon,
  Calendar,
  User,
  Globe,
  Lock,
  Star,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react'
import RichTextEditor from './RichTextEditor'
import SimpleRichTextEditor from './SimpleRichTextEditor'
import BlogContentRenderer from '../blog/BlogContentRenderer'

// Local interface for editor form data
interface BlogEditorPost {
  id?: number
  title: string
  slug: string
  description: string
  content: string
  banner_image?: string
  banner_image_alt?: string
  meta_description?: string
  meta_keywords?: string
  tags: string[]
  is_published: boolean
  is_featured: boolean
  author_name: string
  author_bio: string
  author_avatar?: string
}

interface BlogEditorProps {
  post?: BlogEditorPost
  onSave: (post: BlogEditorPost) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

const BlogEditor = ({ post, onSave, onCancel, isLoading = false }: BlogEditorProps) => {
  const [formData, setFormData] = useState<BlogEditorPost>({
    title: '',
    slug: '',
    description: '',
    content: '',
    banner_image: '',
    banner_image_alt: '',
    meta_description: '',
    meta_keywords: '',
    tags: [],
    is_published: false,
    is_featured: false,
    author_name: 'Maath Mphepo',
    author_bio: 'Backend Developer & Software Engineer',
    author_avatar: '',
    ...post
  })

  const [activeTab, setActiveTab] = useState<'editor' | 'preview' | 'seo'>('editor')
  const [tagInput, setTagInput] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isDirty, setIsDirty] = useState(false)
  const [useSimpleEditor, setUseSimpleEditor] = useState(false)

  // Auto-generate slug from title
  useEffect(() => {
    if (formData.title && !post?.slug) {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim()
      setFormData(prev => ({ ...prev, slug }))
    }
  }, [formData.title, post?.slug])

  // Auto-generate meta description from description
  useEffect(() => {
    if (formData.description && !formData.meta_description) {
      setFormData(prev => ({ 
        ...prev, 
        meta_description: formData.description.substring(0, 160) 
      }))
    }
  }, [formData.description, formData.meta_description])

  const handleInputChange = (field: keyof BlogEditorPost, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setIsDirty(true)
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleImageUpload = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('image', file)

    try {
      const response = await fetch('/api/blog/admin/upload-image/', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()
      if (data.success) {
        return data.data.url
      } else {
        throw new Error(data.error || 'Upload failed')
      }
    } catch (error) {
      console.error('Image upload error:', error)
      throw error
    }
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      handleInputChange('tags', [...formData.tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    handleInputChange('tags', formData.tags.filter(tag => tag !== tagToRemove))
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    } else if (formData.title.length < 5) {
      newErrors.title = 'Title must be at least 5 characters'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    } else if (formData.description.length < 50) {
      newErrors.description = 'Description must be at least 50 characters'
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required'
    } else if (formData.content.length < 100) {
      newErrors.content = 'Content must be at least 100 characters'
    }

    if (formData.meta_description && formData.meta_description.length > 160) {
      newErrors.meta_description = 'Meta description should not exceed 160 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async (publish: boolean = false) => {
    if (!validateForm()) return

    const postData = {
      ...formData,
      is_published: publish || formData.is_published
    }

    try {
      await onSave(postData)
      setIsDirty(false)
    } catch (error) {
      console.error('Save error:', error)
    }
  }

  const tabs = [
    { id: 'editor', label: 'Editor', icon: <Save className="w-4 h-4" /> },
    { id: 'preview', label: 'Preview', icon: <Eye className="w-4 h-4" /> },
    { id: 'seo', label: 'SEO', icon: <Globe className="w-4 h-4" /> }
  ]

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={onCancel}
            className="flex items-center gap-2 px-4 py-2 bg-dark-300 text-gray-300 rounded-lg hover:bg-dark-200 transition-colors duration-300"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <h1 className="text-2xl font-bold text-white">
            {post ? 'Edit Blog Post' : 'Create New Blog Post'}
          </h1>
          {isDirty && (
            <span className="flex items-center gap-1 text-yellow-400 text-sm">
              <AlertCircle className="w-4 h-4" />
              Unsaved changes
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleSave(false)}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-dark-300 text-gray-300 rounded-lg hover:bg-dark-200 transition-colors duration-300 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Draft
          </button>
          
          <button
            onClick={() => handleSave(true)}
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-green-600 transition-colors duration-300 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            {formData.is_published ? 'Update' : 'Publish'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Tabs */}
          <div className="flex space-x-1 mb-6 bg-dark-300/30 p-1 rounded-lg">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors duration-300 ${
                  activeTab === tab.id
                    ? 'bg-primary text-white'
                    : 'text-gray-400 hover:text-white hover:bg-dark-200'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="space-y-6">
            {activeTab === 'editor' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className={`w-full px-4 py-3 bg-dark-200/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary transition-colors duration-300 ${
                      errors.title ? 'border-red-500' : 'border-dark-300'
                    }`}
                    placeholder="Enter blog post title..."
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-400">{errors.title}</p>
                  )}
                </div>

                {/* Slug */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Slug
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => handleInputChange('slug', e.target.value)}
                    className="w-full px-4 py-3 bg-dark-200/50 border border-dark-300 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary transition-colors duration-300"
                    placeholder="url-friendly-slug"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                    className={`w-full px-4 py-3 bg-dark-200/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary transition-colors duration-300 resize-none ${
                      errors.description ? 'border-red-500' : 'border-dark-300'
                    }`}
                    placeholder="Brief description of your blog post..."
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-400">{errors.description}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-400">
                    {formData.description.length}/500 characters
                  </p>
                </div>

                {/* Rich Text Editor */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-300">
                      Content *
                    </label>
                    <button
                      type="button"
                      onClick={() => setUseSimpleEditor(!useSimpleEditor)}
                      className="text-xs text-primary hover:text-green-400 transition-colors duration-300"
                    >
                      {useSimpleEditor ? 'Use Rich Editor' : 'Use Simple Editor'}
                    </button>
                  </div>

                  {useSimpleEditor ? (
                    <SimpleRichTextEditor
                      value={formData.content}
                      onChange={(value) => handleInputChange('content', value)}
                      onImageUpload={handleImageUpload}
                      height={500}
                    />
                  ) : (
                    <RichTextEditor
                      value={formData.content}
                      onChange={(value) => handleInputChange('content', value)}
                      onImageUpload={handleImageUpload}
                      height={500}
                    />
                  )}

                  {errors.content && (
                    <p className="mt-1 text-sm text-red-400">{errors.content}</p>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'preview' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="bg-dark-200/30 border border-dark-300 rounded-lg p-6">
                  <h1 className="text-3xl font-bold text-white mb-4">{formData.title || 'Untitled Post'}</h1>
                  <p className="text-gray-300 mb-6">{formData.description}</p>
                  <BlogContentRenderer content={formData.content} isPreview />
                </div>
              </motion.div>
            )}

            {activeTab === 'seo' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Meta Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Meta Description
                  </label>
                  <textarea
                    value={formData.meta_description}
                    onChange={(e) => handleInputChange('meta_description', e.target.value)}
                    rows={3}
                    className={`w-full px-4 py-3 bg-dark-200/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary transition-colors duration-300 resize-none ${
                      errors.meta_description ? 'border-red-500' : 'border-dark-300'
                    }`}
                    placeholder="SEO meta description..."
                  />
                  {errors.meta_description && (
                    <p className="mt-1 text-sm text-red-400">{errors.meta_description}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-400">
                    {formData.meta_description?.length || 0}/160 characters
                  </p>
                </div>

                {/* Meta Keywords */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Meta Keywords
                  </label>
                  <input
                    type="text"
                    value={formData.meta_keywords}
                    onChange={(e) => handleInputChange('meta_keywords', e.target.value)}
                    className="w-full px-4 py-3 bg-dark-200/50 border border-dark-300 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary transition-colors duration-300"
                    placeholder="keyword1, keyword2, keyword3"
                  />
                </div>

                {/* SEO Preview */}
                <div className="bg-dark-200/30 border border-dark-300 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Search Engine Preview</h3>
                  <div className="bg-white p-4 rounded-lg">
                    <h4 className="text-blue-600 text-lg hover:underline cursor-pointer">
                      {formData.title || 'Your Blog Post Title'}
                    </h4>
                    <p className="text-green-700 text-sm">
                      https://maathmphepo.com/blog/{formData.slug || 'your-post-slug'}
                    </p>
                    <p className="text-gray-600 text-sm mt-1">
                      {formData.meta_description || formData.description || 'Your blog post description will appear here...'}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Publish Settings */}
          <div className="bg-dark-200/30 border border-dark-300 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Publish Settings</h3>
            
            <div className="space-y-4">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.is_published}
                  onChange={(e) => handleInputChange('is_published', e.target.checked)}
                  className="w-4 h-4 text-primary bg-dark-300 border-dark-300 rounded focus:ring-primary"
                />
                <span className="text-gray-300">Published</span>
                {formData.is_published ? (
                  <Globe className="w-4 h-4 text-green-400" />
                ) : (
                  <Lock className="w-4 h-4 text-gray-400" />
                )}
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) => handleInputChange('is_featured', e.target.checked)}
                  className="w-4 h-4 text-primary bg-dark-300 border-dark-300 rounded focus:ring-primary"
                />
                <span className="text-gray-300">Featured</span>
                <Star className="w-4 h-4 text-yellow-400" />
              </label>
            </div>
          </div>

          {/* Tags */}
          <div className="bg-dark-200/30 border border-dark-300 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Tags</h3>
            
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                  className="flex-1 px-3 py-2 bg-dark-300 border border-dark-300 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Add tag..."
                />
                <button
                  onClick={handleAddTag}
                  className="px-4 py-2 bg-primary text-white rounded hover:bg-green-600 transition-colors duration-300"
                >
                  <Tag className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-primary/20 text-primary rounded-full text-sm"
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="text-primary hover:text-red-400 transition-colors duration-300"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Author Info */}
          <div className="bg-dark-200/30 border border-dark-300 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Author</h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.author_name}
                  onChange={(e) => handleInputChange('author_name', e.target.value)}
                  className="w-full px-3 py-2 bg-dark-300 border border-dark-300 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Bio
                </label>
                <textarea
                  value={formData.author_bio}
                  onChange={(e) => handleInputChange('author_bio', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 bg-dark-300 border border-dark-300 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BlogEditor
