export interface BlogPost {
  id: string
  title: string
  slug: string
  description: string
  content: string
  tags: (string | BlogTag)[] // Can be either strings or tag objects
  bannerImage?: string
  views: number
  likes: number
  createdAt: string
  updatedAt: string
  isPublished: boolean
  readTime: number // estimated read time in minutes
  author: {
    name: string
    avatar?: string
    bio?: string
  }
}

export interface Comment {
  id: string
  blogId: string
  name: string
  email: string
  content: string
  parentId?: string // for nested replies
  isApproved: boolean
  createdAt: string
  replies?: Comment[]
}

export interface BlogReaction {
  id: string
  blogId: string
  type: 'like' | 'clap'
  userIdentifier: string // IP or session ID for anonymous users
  createdAt: string
}

export interface BlogTag {
  id: string
  name: string
  slug: string
  count: number // number of posts with this tag
}

export interface BlogStats {
  totalPosts: number
  totalViews: number
  totalLikes: number
  totalComments: number
  popularTags: BlogTag[]
  recentPosts: BlogPost[]
}

// API Response types
export interface BlogListResponse {
  posts: BlogPost[]
  totalCount: number
  currentPage: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export interface BlogSearchParams {
  page?: number
  limit?: number
  tag?: string
  search?: string
  sortBy?: 'createdAt' | 'views' | 'likes'
  sortOrder?: 'asc' | 'desc'
}

// Admin types
export interface AdminUser {
  id: string
  username: string
  email: string
  role: 'admin' | 'editor'
  createdAt: string
}

export interface CreateBlogPostRequest {
  title: string
  description: string
  content: string
  tags: string[]
  bannerImage?: string
  isPublished: boolean
}

export interface UpdateBlogPostRequest extends Partial<CreateBlogPostRequest> {
  id: string
}

export interface CreateCommentRequest {
  blogId: string
  name: string
  email: string
  content: string
  parentId?: string
}

export interface BlogFormData {
  title: string
  description: string
  content: string
  tags: string[]
  bannerImage?: File | string
  isPublished: boolean
}

// Table of Contents type for blog detail page
export interface TOCItem {
  id: string
  title: string
  level: number // h1=1, h2=2, etc.
  children?: TOCItem[]
}

// Social sharing types
export interface ShareData {
  title: string
  text: string
  url: string
}

export interface SocialShareButton {
  platform: 'twitter' | 'linkedin' | 'facebook' | 'whatsapp' | 'copy'
  label: string
  icon: string
  color: string
  shareUrl: (data: ShareData) => string
}
