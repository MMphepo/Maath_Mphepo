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
import 'highlight.js/styles/github.css'
import '@/styles/markdown.css'

interface BlogPostContentProps {
  post?: BlogPost
}

const BlogPostContent = ({ post: initialPost }: BlogPostContentProps) => {
  const slug = initialPost?.slug
  const initialAuthor = initialPost?.author
  const [enrichedPost, setEnrichedPost] = useState<BlogPost | null>(initialPost ?? null)
  const [isLoading, setIsLoading] = useState(!initialPost)

  // Fetch enriched post data with processed content
  useEffect(() => {
    if (initialPost) {
      setEnrichedPost(initialPost)
      setIsLoading(false)
      return
    }

    const fetchEnrichedPost = async () => {
      try {
        setIsLoading(true)
        const response = await blogAPI.getPost(slug || '')

        if (response.success) {
          setEnrichedPost({
            ...response.data,
            // Map the response to match BlogPostLayout expectations
            content_metadata: response.data.content_metadata,
            table_of_contents: response.data.table_of_contents,
            processed_content: response.data.processed_content,
            author: {
              name: response.data.author?.name || initialAuthor?.name || 'Maath Mphepo',
              bio: response.data.author?.bio || 'Backend Developer & Software Engineer',
              avatar: response.data.author?.avatar
            }
          })
        }
      } catch (error) {
        console.error('Error fetching enriched post:', error)
        // Use original post data as fallback
        setEnrichedPost({
          id: slug || '',
          title: '',
          slug: slug || '',
          description: '',
          content: '',
          tags: [],
          views: 0,
          likes: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isPublished: true,
          readTime: 0,
          author: {
            name: initialAuthor?.name || 'Maath Mphepo',
            bio: 'Backend Developer & Software Engineer'
          }
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchEnrichedPost()
  }, [initialPost, slug, initialAuthor])

  if (!enrichedPost) {
    return null
  }

  const post = enrichedPost

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
      <div className="portfolio-site">
        <div className="portfolio-container" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
          <div className="animate-pulse space-y-8 max-w-3xl mx-auto">
            <div className="h-8 bg-stone rounded w-3/4"></div>
            <div className="h-4 bg-stone rounded w-1/2"></div>
            <div className="space-y-3">
              <div className="h-4 bg-stone rounded"></div>
              <div className="h-4 bg-stone rounded w-5/6"></div>
              <div className="h-4 bg-stone rounded w-4/6"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="portfolio-site">
      <BlogScrollProgress />

      {/* Back Button */}
      <div className="portfolio-container py-4">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-muted hover:text-blue transition-colors duration-300"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Writing
        </Link>
      </div>

      {/* Main Blog Post Layout */}
      <BlogPostLayout
        post={post}
        onLike={handleLike}
        onShare={handleShare}
        onBookmark={handleBookmark}
        className="pb-16"
      />

      {/* Comments Section */}
      <div className="portfolio-container py-8">
        <BlogComments postSlug={post.slug} />
      </div>
    </div>
  )
}

export default BlogPostContent
