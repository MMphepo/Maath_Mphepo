'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, Reply, Send, User } from 'lucide-react'
import { Comment } from '@/types/blog'
import { formatRelativeTime } from '@/lib/blog-utils'

interface BlogCommentsProps {
  postSlug: string
}

const BlogComments = ({ postSlug }: BlogCommentsProps) => {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    content: ''
  })

  // Fetch comments
  const fetchComments = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/blog/${postSlug}/comments`)
      const data = await response.json()
      
      if (data.success) {
        setComments(data.data)
      }
    } catch (error) {
      console.error('Error fetching comments:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchComments()
  }, [postSlug])

  // Submit comment
  const handleSubmit = async (e: React.FormEvent, parentId?: string) => {
    e.preventDefault()
    
    if (!formData.name || !formData.email || !formData.content) {
      return
    }

    try {
      setSubmitting(true)
      const response = await fetch(`/api/blog/${postSlug}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          parentId
        }),
      })

      const data = await response.json()
      
      if (data.success) {
        setFormData({ name: '', email: '', content: '' })
        setReplyingTo(null)
        fetchComments() // Refresh comments
      }
    } catch (error) {
      console.error('Error submitting comment:', error)
    } finally {
      setSubmitting(false)
    }
  }

  // Render comment form
  const renderCommentForm = (parentId?: string) => (
    <motion.form
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      onSubmit={(e) => handleSubmit(e, parentId)}
      className="space-y-4"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Your name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="px-4 py-3 bg-dark-200 border border-dark-300 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary transition-colors duration-300"
          required
        />
        <input
          type="email"
          placeholder="Your email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="px-4 py-3 bg-dark-200 border border-dark-300 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary transition-colors duration-300"
          required
        />
      </div>
      
      <textarea
        placeholder={parentId ? "Write your reply..." : "Share your thoughts..."}
        value={formData.content}
        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
        rows={4}
        className="w-full px-4 py-3 bg-dark-200 border border-dark-300 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary transition-colors duration-300 resize-none"
        required
      />
      
      <div className="flex items-center gap-3">
        <motion.button
          type="submit"
          disabled={submitting}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
        >
          <Send className="w-4 h-4" />
          {submitting ? 'Posting...' : parentId ? 'Post Reply' : 'Post Comment'}
        </motion.button>
        
        {parentId && (
          <button
            type="button"
            onClick={() => setReplyingTo(null)}
            className="px-4 py-3 text-gray-400 hover:text-white transition-colors duration-300"
          >
            Cancel
          </button>
        )}
      </div>
    </motion.form>
  )

  // Render single comment
  const renderComment = (comment: Comment, depth = 0) => (
    <motion.div
      key={comment.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`${depth > 0 ? 'ml-8 mt-4' : 'mb-6'}`}
    >
      <div className="glass rounded-lg p-6">
        {/* Comment Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-primary" />
          </div>
          <div>
            <div className="text-white font-medium">{comment.name}</div>
            <div className="text-gray-400 text-sm">{formatRelativeTime(comment.createdAt)}</div>
          </div>
        </div>

        {/* Comment Content */}
        <p className="text-gray-300 mb-4 leading-relaxed">{comment.content}</p>

        {/* Comment Actions */}
        <div className="flex items-center gap-4">
          <motion.button
            onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-primary transition-colors duration-300"
          >
            <Reply className="w-3 h-3" />
            Reply
          </motion.button>
        </div>

        {/* Reply Form */}
        <AnimatePresence>
          {replyingTo === comment.id && (
            <div className="mt-6">
              {renderCommentForm(comment.id)}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Nested Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4">
          {comment.replies.map((reply) => renderComment(reply, depth + 1))}
        </div>
      )}
    </motion.div>
  )

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mt-16"
    >
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-8">
        <MessageCircle className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold text-white">
          Comments ({comments.length})
        </h2>
      </div>

      {/* Comment Form */}
      <div className="glass rounded-xl p-6 mb-8">
        <h3 className="text-white font-semibold mb-6">Leave a Comment</h3>
        {renderCommentForm()}
      </div>

      {/* Comments List */}
      <div>
        {loading ? (
          <div className="text-center py-8">
            <div className="text-gray-400">Loading comments...</div>
          </div>
        ) : comments.length > 0 ? (
          <div>
            {comments.map((comment) => renderComment(comment))}
          </div>
        ) : (
          <div className="text-center py-12">
            <MessageCircle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-white font-semibold mb-2">No comments yet</h3>
            <p className="text-gray-400">Be the first to share your thoughts!</p>
          </div>
        )}
      </div>
    </motion.section>
  )
}

export default BlogComments
