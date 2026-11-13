'use client'

import { motion } from 'framer-motion'
import { 
  Calendar, 
  User, 
  Tag as TagIcon, 
  Heart, 
  Eye, 
  Share2,
  Bookmark
} from 'lucide-react'
import BlogContentRenderer from './BlogContentRenderer'
import TableOfContents from './TableOfContents'
import ContentStats from './ContentStats'
import { BlogPost } from '@/types/blog'

interface BlogPostLayoutProps {
  post: BlogPost
  isPreview?: boolean
  showTOC?: boolean
  showStats?: boolean
  onLike?: () => void
  onShare?: () => void
  onBookmark?: () => void
  className?: string
}

const BlogPostLayout = ({
  post,
  isPreview = false,
  showTOC = true,
  showStats = true,
  onLike,
  onShare,
  onBookmark,
  className = ""
}: BlogPostLayoutProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className={`portfolio-container ${className}`}>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3">
          <article className="space-y-8">
            {/* Header */}
            <header className="space-y-6">
              {/* Preview Notice */}
              {isPreview && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-blue/10 border border-blue/20 rounded-lg p-4"
                >
                  <div className="flex items-center gap-2 text-blue">
                    <Eye className="w-4 h-4" />
                    <span className="font-medium">Preview Mode</span>
                  </div>
                  <p className="text-blue/80 text-sm mt-1">
                    This is how your blog post will appear to visitors
                  </p>
                </motion.div>
              )}

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="flex flex-wrap gap-2"
                >
                  {post.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue/10 text-blue rounded-full text-sm font-medium"
                    >
                      <TagIcon className="w-3 h-3" />
                      {typeof tag === 'string' ? tag : tag.name}
                    </span>
                  ))}
                </motion.div>
              )}

              {/* Title */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl sm:text-5xl font-bold text-ink leading-tight"
              >
                {post.title}
              </motion.h1>

              {/* Description */}
              {post.description && (
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="text-xl text-muted leading-relaxed"
                >
                  {post.description}
                </motion.p>
              )}

              {/* Meta Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-wrap items-center gap-6 text-muted text-sm"
              >
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {formatDate(post.createdAt || post.updatedAt)}
                </div>
                
                {(post as any).content_metadata && (
                  <ContentStats 
                    metadata={(post as any).content_metadata} 
                    showDetailed={false}
                  />
                )}

                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  {post.views?.toLocaleString() || 0} views
                </div>

                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  {post.likes?.toLocaleString() || 0} likes
                </div>
              </motion.div>

              {/* Author Info */}
              {post.author && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="flex items-center gap-4 p-4 bg-stone border border-border rounded-lg"
                >
                  <div className="w-12 h-12 bg-blue/10 rounded-full flex items-center justify-center">
                    {post.author.avatar ? (
                      <img
                        src={post.author.avatar}
                        alt={post.author.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-6 h-6 text-blue" />
                    )}
                  </div>
                  <div>
                    <div className="text-ink font-semibold">{post.author.name}</div>
                    {post.author.bio && (
                      <div className="text-muted text-sm">{post.author.bio}</div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Banner Image */}
              {post.bannerImage && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="relative h-64 sm:h-80 lg:h-96 rounded-lg overflow-hidden"
                >
                  <img
                    src={post.bannerImage}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-graphite/20 to-transparent" />
                </motion.div>
              )}

              {/* Action Buttons */}
              {!isPreview && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className="flex items-center gap-3"
                >
                  {onLike && (
                    <button
                      onClick={onLike}
                      className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors duration-300"
                    >
                      <Heart className="w-4 h-4" />
                      Like
                    </button>
                  )}

                  {onShare && (
                    <button
                      onClick={onShare}
                      className="flex items-center gap-2 px-4 py-2 bg-blue/10 text-blue rounded-lg hover:bg-blue/20 transition-colors duration-300"
                    >
                      <Share2 className="w-4 h-4" />
                      Share
                    </button>
                  )}

                  {onBookmark && (
                    <button
                      onClick={onBookmark}
                      className="flex items-center gap-2 px-4 py-2 bg-yellow-500/10 text-yellow-600 rounded-lg hover:bg-yellow-500/20 transition-colors duration-300"
                    >
                      <Bookmark className="w-4 h-4" />
                      Bookmark
                    </button>
                  )}
                </motion.div>
              )}
            </header>

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              <BlogContentRenderer 
                content={post.content} 
                isPreview={isPreview}
              />
            </motion.div>
          </article>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Table of Contents */}
          {showTOC && (post as any).table_of_contents && (post as any).table_of_contents.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <TableOfContents items={(post as any).table_of_contents} />
            </motion.div>
          )}

          {/* Content Statistics */}
          {showStats && (post as any).content_metadata && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.9 }}
            >
              <ContentStats 
                metadata={(post as any).content_metadata} 
                showDetailed={true}
              />
            </motion.div>
          )}

          {/* Related Tags */}
          {post.tags && post.tags.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1.0 }}
              className="bg-stone border border-border rounded-lg p-6"
            >
              <h3 className="text-lg font-semibold text-ink mb-4">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue/10 text-blue rounded-full text-sm hover:bg-blue/20 transition-colors duration-300 cursor-pointer"
                  >
                    {typeof tag === 'string' ? tag : tag.name}
                  </span>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

export default BlogPostLayout
