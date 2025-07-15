// Blog API utilities

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// Get auth token from localStorage
const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token')
  }
  return null
}

// Create headers with auth token
const createHeaders = (includeAuth = true) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  
  if (includeAuth) {
    const token = getAuthToken()
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
  }
  
  return headers
}

// Handle API response
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || errorData.error || `HTTP ${response.status}`)
  }
  
  return response.json()
}

// Blog Post API
export const blogAPI = {
  // Get all posts (public)
  async getPosts(params?: {
    page?: number
    search?: string
    tag?: string
    published?: boolean
  }) {
    const searchParams = new URLSearchParams()
    
    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.search) searchParams.append('search', params.search)
    if (params?.tag) searchParams.append('tag', params.tag)
    if (params?.published !== undefined) searchParams.append('published', params.published.toString())
    
    const url = `${API_BASE_URL}/api/blog/?${searchParams.toString()}`
    const response = await fetch(url)
    return handleResponse(response)
  },

  // Get single post (public)
  async getPost(slug: string) {
    const response = await fetch(`${API_BASE_URL}/api/blog/${slug}/`)
    return handleResponse(response)
  },

  // Get tags (public)
  async getTags() {
    const response = await fetch(`${API_BASE_URL}/api/blog/tags/`)
    return handleResponse(response)
  },

  // Like a post
  async likePost(slug: string) {
    const response = await fetch(`${API_BASE_URL}/api/blog/${slug}/like/`, {
      method: 'POST',
      headers: createHeaders(false),
    })
    return handleResponse(response)
  },

  // Add comment
  async addComment(slug: string, commentData: {
    name: string
    email: string
    content: string
    parent?: number
  }) {
    const response = await fetch(`${API_BASE_URL}/api/blog/${slug}/comments/`, {
      method: 'POST',
      headers: createHeaders(false),
      body: JSON.stringify(commentData),
    })
    return handleResponse(response)
  }
}

// Admin Blog API
export const adminBlogAPI = {
  // Get all posts (admin)
  async getPosts(params?: {
    page?: number
    search?: string
    status?: string
    ordering?: string
  }) {
    const searchParams = new URLSearchParams()
    
    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.search) searchParams.append('search', params.search)
    if (params?.status) searchParams.append('status', params.status)
    if (params?.ordering) searchParams.append('ordering', params.ordering)
    
    const url = `${API_BASE_URL}/api/blog/admin/posts/?${searchParams.toString()}`
    const response = await fetch(url, {
      headers: createHeaders(),
    })
    return handleResponse(response)
  },

  // Get single post (admin)
  async getPost(id: number) {
    const response = await fetch(`${API_BASE_URL}/api/blog/admin/posts/${id}/`, {
      headers: createHeaders(),
    })
    return handleResponse(response)
  },

  // Create post
  async createPost(postData: any) {
    const response = await fetch(`${API_BASE_URL}/api/blog/admin/posts/`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify(postData),
    })
    return handleResponse(response)
  },

  // Update post
  async updatePost(id: number, postData: any) {
    const response = await fetch(`${API_BASE_URL}/api/blog/admin/posts/${id}/`, {
      method: 'PUT',
      headers: createHeaders(),
      body: JSON.stringify(postData),
    })
    return handleResponse(response)
  },

  // Partial update post
  async patchPost(id: number, postData: any) {
    const response = await fetch(`${API_BASE_URL}/api/blog/admin/posts/${id}/`, {
      method: 'PATCH',
      headers: createHeaders(),
      body: JSON.stringify(postData),
    })
    return handleResponse(response)
  },

  // Delete post
  async deletePost(id: number) {
    const response = await fetch(`${API_BASE_URL}/api/blog/admin/posts/${id}/`, {
      method: 'DELETE',
      headers: createHeaders(),
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || errorData.error || `HTTP ${response.status}`)
    }
    
    return response.status === 204 ? { success: true } : response.json()
  },

  // Toggle publish status
  async togglePublish(id: number) {
    const response = await fetch(`${API_BASE_URL}/api/blog/admin/posts/${id}/toggle_publish/`, {
      method: 'POST',
      headers: createHeaders(),
    })
    return handleResponse(response)
  },

  // Toggle featured status
  async toggleFeatured(id: number) {
    const response = await fetch(`${API_BASE_URL}/api/blog/admin/posts/${id}/toggle_featured/`, {
      method: 'POST',
      headers: createHeaders(),
    })
    return handleResponse(response)
  },

  // Get post preview
  async getPreview(id: number) {
    const response = await fetch(`${API_BASE_URL}/api/blog/admin/posts/${id}/preview/`, {
      headers: createHeaders(),
    })
    return handleResponse(response)
  },

  // Upload image
  async uploadImage(file: File): Promise<string> {
    const formData = new FormData()
    formData.append('image', file)

    const token = getAuthToken()
    const headers: Record<string, string> = {}
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(`${API_BASE_URL}/api/blog/admin/upload-image/`, {
      method: 'POST',
      headers,
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `Upload failed: HTTP ${response.status}`)
    }

    const data = await response.json()
    if (data.success) {
      return data.data.url
    } else {
      throw new Error(data.error || 'Upload failed')
    }
  },

  // Get dashboard stats
  async getDashboardStats() {
    const response = await fetch(`${API_BASE_URL}/api/blog/admin/dashboard-stats/`, {
      headers: createHeaders(),
    })
    return handleResponse(response)
  }
}

// Export types for TypeScript
export interface BlogPost {
  id: number
  title: string
  slug: string
  description: string
  content: string
  processed_content?: string
  banner_image?: string
  banner_image_alt?: string
  meta_description?: string
  meta_keywords?: string
  tags: string[]
  is_published: boolean
  is_featured: boolean
  views: number
  likes: number
  read_time: number
  created_at: string
  updated_at: string
  published_at?: string
  author: {
    name: string
    bio: string
    avatar?: string
  }
  comments?: Comment[]
  table_of_contents?: TOCItem[]
  content_metadata?: ContentMetadata
}

export interface Comment {
  id: number
  name: string
  email: string
  content: string
  is_approved: boolean
  parent?: number
  replies: Comment[]
  created_at: string
}

export interface Tag {
  id: number
  name: string
  slug: string
  usage_count: number
}

export interface TOCItem {
  level: number
  id: string
  title: string
}

export interface ContentMetadata {
  word_count: number
  reading_time: number
  image_count: number
  link_count: number
  heading_count: number
}

export interface DashboardStats {
  stats: {
    total_posts: number
    published_posts: number
    draft_posts: number
    featured_posts: number
    total_views: number
    total_likes: number
    total_comments: number
  }
  recent_posts: BlogPost[]
  popular_tags: Tag[]
}
