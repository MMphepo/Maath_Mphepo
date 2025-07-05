import { BlogPost, Comment, TOCItem, ShareData, SocialShareButton } from '@/types/blog'

// Generate slug from title
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim()
}

// Calculate estimated read time
export function calculateReadTime(content: string): number {
  const wordsPerMinute = 200
  const wordCount = content.split(/\s+/).length
  return Math.ceil(wordCount / wordsPerMinute)
}

// Format date for display
export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Format relative time (e.g., "2 days ago")
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`
  return `${Math.floor(diffInSeconds / 31536000)} years ago`
}

// Extract excerpt from content
export function extractExcerpt(content: string, maxLength: number = 150): string {
  // Remove markdown formatting
  const plainText = content
    .replace(/#{1,6}\s+/g, '') // Remove headers
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.*?)\*/g, '$1') // Remove italic
    .replace(/`(.*?)`/g, '$1') // Remove inline code
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links, keep text
    .replace(/\n+/g, ' ') // Replace newlines with spaces
    .trim()

  if (plainText.length <= maxLength) return plainText
  
  const truncated = plainText.substring(0, maxLength)
  const lastSpaceIndex = truncated.lastIndexOf(' ')
  
  return lastSpaceIndex > 0 
    ? truncated.substring(0, lastSpaceIndex) + '...'
    : truncated + '...'
}

// Generate table of contents from markdown content
export function generateTableOfContents(content: string): TOCItem[] {
  const headingRegex = /^(#{1,6})\s+(.+)$/gm
  const headings: TOCItem[] = []
  let match

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length
    const title = match[2].trim()
    const id = generateSlug(title)

    headings.push({
      id,
      title,
      level
    })
  }

  // Build nested structure
  const buildNestedTOC = (items: TOCItem[], startIndex = 0, parentLevel = 0): TOCItem[] => {
    const result: TOCItem[] = []
    
    for (let i = startIndex; i < items.length; i++) {
      const item = items[i]
      
      if (item.level <= parentLevel && i > startIndex) {
        break
      }
      
      if (item.level === parentLevel + 1) {
        const nextIndex = i + 1
        const children = buildNestedTOC(items, nextIndex, item.level)
        
        result.push({
          ...item,
          children: children.length > 0 ? children : undefined
        })
        
        // Skip processed children
        i += children.length
      }
    }
    
    return result
  }

  return buildNestedTOC(headings)
}

// Process markdown content and add IDs to headings
export function processMarkdownContent(content: string): string {
  return content.replace(/^(#{1,6})\s+(.+)$/gm, (match, hashes, title) => {
    const id = generateSlug(title.trim())
    return `${hashes} ${title.trim()} {#${id}}`
  })
}

// Build nested comments structure
export function buildCommentTree(comments: Comment[]): Comment[] {
  const commentMap = new Map<string, Comment>()
  const rootComments: Comment[] = []

  // First pass: create map of all comments
  comments.forEach(comment => {
    commentMap.set(comment.id, { ...comment, replies: [] })
  })

  // Second pass: build tree structure
  comments.forEach(comment => {
    const commentWithReplies = commentMap.get(comment.id)!
    
    if (comment.parentId) {
      const parent = commentMap.get(comment.parentId)
      if (parent) {
        parent.replies = parent.replies || []
        parent.replies.push(commentWithReplies)
      }
    } else {
      rootComments.push(commentWithReplies)
    }
  })

  return rootComments
}

// Social sharing configuration
export const socialShareButtons: SocialShareButton[] = [
  {
    platform: 'twitter',
    label: 'Share on Twitter',
    icon: 'Twitter',
    color: '#1DA1F2',
    shareUrl: (data: ShareData) => 
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(data.text)}&url=${encodeURIComponent(data.url)}`
  },
  {
    platform: 'linkedin',
    label: 'Share on LinkedIn',
    icon: 'Linkedin',
    color: '#0077B5',
    shareUrl: (data: ShareData) => 
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(data.url)}`
  },
  {
    platform: 'facebook',
    label: 'Share on Facebook',
    icon: 'Facebook',
    color: '#1877F2',
    shareUrl: (data: ShareData) => 
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(data.url)}`
  },
  {
    platform: 'whatsapp',
    label: 'Share on WhatsApp',
    icon: 'MessageCircle',
    color: '#25D366',
    shareUrl: (data: ShareData) => 
      `https://wa.me/?text=${encodeURIComponent(`${data.text} ${data.url}`)}`
  },
  {
    platform: 'copy',
    label: 'Copy Link',
    icon: 'Copy',
    color: '#6B7280',
    shareUrl: (data: ShareData) => data.url
  }
]

// Search and filter utilities
export function searchBlogPosts(posts: BlogPost[], query: string): BlogPost[] {
  if (!query.trim()) return posts

  const searchTerm = query.toLowerCase()
  
  return posts.filter(post => 
    post.title.toLowerCase().includes(searchTerm) ||
    post.description.toLowerCase().includes(searchTerm) ||
    post.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
    post.content.toLowerCase().includes(searchTerm)
  )
}

export function filterBlogPostsByTag(posts: BlogPost[], tag: string): BlogPost[] {
  if (!tag) return posts
  return posts.filter(post => 
    post.tags.some(postTag => postTag.toLowerCase() === tag.toLowerCase())
  )
}

export function sortBlogPosts(posts: BlogPost[], sortBy: 'createdAt' | 'views' | 'likes', order: 'asc' | 'desc' = 'desc'): BlogPost[] {
  return [...posts].sort((a, b) => {
    let comparison = 0
    
    switch (sortBy) {
      case 'createdAt':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        break
      case 'views':
        comparison = a.views - b.views
        break
      case 'likes':
        comparison = a.likes - b.likes
        break
    }
    
    return order === 'desc' ? -comparison : comparison
  })
}

// Pagination utility
export function paginateArray<T>(array: T[], page: number, limit: number) {
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit
  
  return {
    items: array.slice(startIndex, endIndex),
    totalCount: array.length,
    currentPage: page,
    totalPages: Math.ceil(array.length / limit),
    hasNextPage: endIndex < array.length,
    hasPrevPage: page > 1
  }
}
