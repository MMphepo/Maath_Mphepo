'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Calendar, Clock, Eye, Heart, Share2, Tag } from 'lucide-react'
import { BlogPost } from '@/types/blog'
import { formatDate } from '@/lib/blog-utils'
import { api } from '@/lib/api-config'
import BlogTableOfContents from './BlogTableOfContents'
import BlogSocialShare from './BlogSocialShare'
import BlogComments from './BlogComments'
import BlogReactions from './BlogReactions'
import BlogScrollProgress from './BlogScrollProgress'

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
            <div className="prose prose-invert prose-lg max-w-none mb-12">
              {/* This would be rendered markdown in a real app */}
              <div 
                className="text-gray-300 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br />') }}
              />
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
