'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { BlogPost } from '@/types/blog'
import { blogAPI } from '@/lib/api/blog'
import BlogPostLayout from './BlogPostLayout'
import BlogComments from './BlogComments'
import BlogScrollProgress from './BlogScrollProgress'

// Import highlight.js styles and custom markdown styles
import 'highlight.js/styles/github-dark.css'
import '@/styles/markdown.css'

interface BlogPostContentProps {
  post: BlogPost
}

const BlogPostContent = ({ post }: BlogPostContentProps) => {
  const [enrichedPost, setEnrichedPost] = useState<any>(post)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch enriched post data with processed content
  useEffect(() => {
    const fetchEnrichedPost = async () => {
      try {
        setIsLoading(true)
        const response = await blogAPI.getPost(post.slug)

        if (response.success) {
          setEnrichedPost({
            ...post,
            ...response.data,
            // Map the response to match BlogPostLayout expectations
            content_metadata: response.data.content_metadata,
            table_of_contents: response.data.table_of_contents,
            processed_content: response.data.processed_content,
            author: {
              name: response.data.author?.name || post.author || 'Maath Mphepo',
              bio: response.data.author?.bio || 'Backend Developer & Software Engineer',
              avatar: response.data.author?.avatar
            }
          })
        }
      } catch (error) {
        console.error('Error fetching enriched post:', error)
        // Use original post data as fallback
        setEnrichedPost({
          ...post,
          author: {
            name: post.author || 'Maath Mphepo',
            bio: 'Backend Developer & Software Engineer'
          }
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchEnrichedPost()
  }, [post])

  const handleLike = async () => {
    try {
      const response = await blogAPI.likePost(post.slug)
      if (response.success) {
        setEnrichedPost((prev: any) => ({
          ...prev,
          likes: response.data.likes
        }))
      }
    } catch (error) {
      console.error('Error liking post:', error)
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.description,
        url: `https://maathmphepo.com/blog/${post.slug}`
      })
    } else {
      // Fallback to copying URL
      navigator.clipboard.writeText(`https://maathmphepo.com/blog/${post.slug}`)
    }
  }

  const handleBookmark = () => {
    // Add to localStorage bookmarks
    const bookmarks = JSON.parse(localStorage.getItem('bookmarked-posts') || '[]')
    const isBookmarked = bookmarks.includes(post.slug)

    if (isBookmarked) {
      const updated = bookmarks.filter((slug: string) => slug !== post.slug)
      localStorage.setItem('bookmarked-posts', JSON.stringify(updated))
    } else {
      bookmarks.push(post.slug)
      localStorage.setItem('bookmarked-posts', JSON.stringify(bookmarks))
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-dark-300 rounded w-3/4"></div>
          <div className="h-4 bg-dark-300 rounded w-1/2"></div>
          <div className="space-y-3">
            <div className="h-4 bg-dark-300 rounded"></div>
            <div className="h-4 bg-dark-300 rounded w-5/6"></div>
            <div className="h-4 bg-dark-300 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <BlogScrollProgress />

      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-primary transition-colors duration-300"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Blog
        </Link>
      </div>

      {/* Main Blog Post Layout */}
      <BlogPostLayout
        post={enrichedPost}
        onLike={handleLike}
        onShare={handleShare}
        onBookmark={handleBookmark}
        className="px-4 sm:px-6 lg:px-8 pb-16"
      />

      {/* Comments Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BlogComments postSlug={post.slug} />
      </div>
    </>
  )
}

export default BlogPostContent
