import { BlogPost, Comment, BlogReaction, BlogTag } from '@/types/blog'

// Mock data store (blog posts now served from local markdown files)
export const mockBlogPosts: BlogPost[] = []

export const mockComments: Comment[] = []

export const mockReactions: BlogReaction[] = [
  { id: '1', blogId: '1', type: 'like', userIdentifier: 'user1', createdAt: '2024-01-16T10:00:00Z' },
  { id: '2', blogId: '1', type: 'clap', userIdentifier: 'user2', createdAt: '2024-01-16T11:00:00Z' },
  { id: '3', blogId: '2', type: 'like', userIdentifier: 'user1', createdAt: '2024-01-11T09:00:00Z' }
]

export const mockTags: BlogTag[] = [
  { id: '1', name: 'Django', slug: 'django', count: 2 },
  { id: '2', name: 'Laravel', slug: 'laravel', count: 1 },
  { id: '3', name: 'Python', slug: 'python', count: 2 },
  { id: '4', name: 'PHP', slug: 'php', count: 1 },
  { id: '5', name: 'API', slug: 'api', count: 1 },
  { id: '6', name: 'Backend', slug: 'backend', count: 3 },
  { id: '7', name: 'Database', slug: 'database', count: 1 }
]
