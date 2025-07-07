'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Calendar, Clock, Eye, Heart, Share2, Tag } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import rehypeRaw from 'rehype-raw'
import { BlogPost } from '@/types/blog'
import { formatDate } from '@/lib/blog-utils'
import { api } from '@/lib/api-config'
import BlogTableOfContents from './BlogTableOfContents'
import BlogSocialShare from './BlogSocialShare'
import BlogComments from './BlogComments'
import BlogReactions from './BlogReactions'
import BlogScrollProgress from './BlogScrollProgress'

// Import highlight.js styles and custom markdown styles
import 'highlight.js/styles/github-dark.css'
import '@/styles/markdown.css'

// Helper function to generate slug from text
const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .trim()
}

interface BlogPostContentProps {
  post: BlogPost
}

const BlogPostContent = ({ post }: BlogPostContentProps) => {
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(post.likes)

  // Check if user has liked the post
  useEffect(() => {
    const checkLikeStatus = async () => {
      try {
        // Note: Django backend doesn't have a GET endpoint for like status
        // We'll handle this in the like action itself
        setIsLiked(false) // Default to not liked
        setLikeCount(post.likes)
      } catch (error) {
        console.error('Error checking like status:', error)
      }
    }

    checkLikeStatus()
  }, [post.slug, post.likes])

  const handleLike = async () => {
    try {
      const response = await api.blog.like(post.slug)

      if (response.success && response.data) {
        setIsLiked(response.data.liked)
        setLikeCount(response.data.likes)
      } else {
        console.error('Error liking post:', response.error)
      }
    } catch (error) {
      console.error('Error handling like:', error)
    }
  }

  return (
    <>
      <BlogScrollProgress />
      
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-primary hover:text-secondary transition-colors duration-300"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>
        </motion.div>

        {/* Article Header */}
        <motion.header
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-12"
        >
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {post.tags.map((tag) => (
              <span
                key={typeof tag === 'string' ? tag : tag.id}
                className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
              >
                <Tag className="w-3 h-3" />
                {typeof tag === 'string' ? tag : tag.name}
              </span>
            ))}
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6 leading-tight">
            {post.title}
          </h1>

          {/* Description */}
          <p className="text-xl text-gray-300 mb-8 leading-relaxed">
            {post.description}
          </p>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-6 text-gray-400 mb-8">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {formatDate(post.createdAt)}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {post.readTime} min read
            </div>
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              {post.views.toLocaleString()} views
            </div>
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              {likeCount} likes
            </div>
          </div>

          {/* Author */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-full overflow-hidden">
              {post.author.avatar ? (
                <Image
                  src={post.author.avatar}
                  alt={post.author.name}
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-primary/20 flex items-center justify-center text-primary text-lg font-bold">
                  {post.author.name.charAt(0)}
                </div>
              )}
            </div>
            <div>
              <div className="text-white font-semibold">{post.author.name}</div>
              <div className="text-gray-400 text-sm">{post.author.bio}</div>
            </div>
          </div>

          {/* Banner Image */}
          {post.bannerImage && (
            <div className="relative h-64 sm:h-80 lg:h-96 rounded-xl overflow-hidden mb-8">
              <Image
                src={post.bannerImage}
                alt={post.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}
        </motion.header>

        {/* Article Content with TOC */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Table of Contents - Desktop */}
          <div className="hidden lg:block">
            <BlogTableOfContents content={post.content} />
          </div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-3"
          >
            {/* Article Body */}
            <div className="prose prose-invert prose-lg max-w-none mb-12 markdown-content">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight, rehypeRaw]}
                components={{
                  // Custom styling for different elements
                  h1: ({ children }) => {
                    const text = typeof children === 'string' ? children : children?.toString() || ''
                    const id = generateSlug(text)
                    return (
                      <h1 id={id} className="text-4xl font-bold text-white mb-6 mt-8 border-b border-dark-300 pb-4">
                        {children}
                      </h1>
                    )
                  },
                  h2: ({ children }) => {
                    const text = typeof children === 'string' ? children : children?.toString() || ''
                    const id = generateSlug(text)
                    return (
                      <h2 id={id} className="text-3xl font-semibold text-white mb-4 mt-8">
                        {children}
                      </h2>
                    )
                  },
                  h3: ({ children }) => {
                    const text = typeof children === 'string' ? children : children?.toString() || ''
                    const id = generateSlug(text)
                    return (
                      <h3 id={id} className="text-2xl font-semibold text-gray-200 mb-3 mt-6">
                        {children}
                      </h3>
                    )
                  },
                  h4: ({ children }) => {
                    const text = typeof children === 'string' ? children : children?.toString() || ''
                    const id = generateSlug(text)
                    return (
                      <h4 id={id} className="text-xl font-semibold text-gray-200 mb-2 mt-4">
                        {children}
                      </h4>
                    )
                  },
                  p: ({ children }) => (
                    <p className="text-gray-300 leading-relaxed mb-4">
                      {children}
                    </p>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2 ml-4">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal list-inside text-gray-300 mb-4 space-y-2 ml-4">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => (
                    <li className="text-gray-300">
                      {children}
                    </li>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-primary pl-4 italic text-gray-400 my-6 bg-dark-200/30 py-4 rounded-r-lg">
                      {children}
                    </blockquote>
                  ),
                  code: ({ children, ...props }) => {
                    const { className } = props as any
                    const isInline = !className
                    return isInline ? (
                      <code className="bg-dark-200 text-primary px-2 py-1 rounded text-sm font-mono" {...props}>
                        {children}
                      </code>
                    ) : (
                      <code className="block bg-dark-200 text-gray-300 p-4 rounded-lg overflow-x-auto font-mono text-sm" {...props}>
                        {children}
                      </code>
                    )
                  },
                  pre: ({ children }) => (
                    <pre className="bg-dark-200 rounded-lg overflow-x-auto mb-6 border border-dark-300">
                      {children}
                    </pre>
                  ),
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      className="text-primary hover:text-primary/80 underline transition-colors duration-300"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {children}
                    </a>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-semibold text-white">
                      {children}
                    </strong>
                  ),
                  em: ({ children }) => (
                    <em className="italic text-gray-200">
                      {children}
                    </em>
                  ),
                  table: ({ children }) => (
                    <div className="overflow-x-auto mb-6">
                      <table className="min-w-full border border-dark-300 rounded-lg">
                        {children}
                      </table>
                    </div>
                  ),
                  thead: ({ children }) => (
                    <thead className="bg-dark-200">
                      {children}
                    </thead>
                  ),
                  tbody: ({ children }) => (
                    <tbody className="bg-dark-100">
                      {children}
                    </tbody>
                  ),
                  tr: ({ children }) => (
                    <tr className="border-b border-dark-300">
                      {children}
                    </tr>
                  ),
                  th: ({ children }) => (
                    <th className="px-4 py-3 text-left text-white font-semibold">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="px-4 py-3 text-gray-300">
                      {children}
                    </td>
                  ),
                  hr: () => (
                    <hr className="border-dark-300 my-8" />
                  ),
                }}
              >
                {post.content}
              </ReactMarkdown>
            </div>

            {/* Reactions */}
            <BlogReactions
              isLiked={isLiked}
              likeCount={likeCount}
              onLike={handleLike}
            />

            {/* Social Share */}
            <BlogSocialShare
              title={post.title}
              url={`https://maathmphepo.com/blog/${post.slug}`}
            />

            {/* Comments */}
            <BlogComments postSlug={post.slug} />
          </motion.div>
        </div>
      </article>
    </>
  )
}

export default BlogPostContent
