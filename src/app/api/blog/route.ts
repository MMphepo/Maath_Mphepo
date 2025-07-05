import { NextRequest, NextResponse } from 'next/server'
import { mockBlogPosts, mockTags } from '@/lib/blog-data'
import { searchBlogPosts, filterBlogPostsByTag, sortBlogPosts, paginateArray } from '@/lib/blog-utils'
import { BlogSearchParams } from '@/types/blog'

// GET /api/blog - Get all blog posts with filtering, search, and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const params: BlogSearchParams = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '10'),
      tag: searchParams.get('tag') || undefined,
      search: searchParams.get('search') || undefined,
      sortBy: (searchParams.get('sortBy') as 'createdAt' | 'views' | 'likes') || 'createdAt',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc'
    }

    // Start with published posts only
    let posts = mockBlogPosts.filter(post => post.isPublished)

    // Apply search filter
    if (params.search) {
      posts = searchBlogPosts(posts, params.search)
    }

    // Apply tag filter
    if (params.tag) {
      posts = filterBlogPostsByTag(posts, params.tag)
    }

    // Apply sorting
    posts = sortBlogPosts(posts, params.sortBy, params.sortOrder)

    // Apply pagination
    const paginatedResult = paginateArray(posts, params.page!, params.limit!)

    return NextResponse.json({
      success: true,
      data: {
        posts: paginatedResult.items,
        totalCount: paginatedResult.totalCount,
        currentPage: paginatedResult.currentPage,
        totalPages: paginatedResult.totalPages,
        hasNextPage: paginatedResult.hasNextPage,
        hasPrevPage: paginatedResult.hasPrevPage
      }
    })
  } catch (error) {
    console.error('Error fetching blog posts:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch blog posts' },
      { status: 500 }
    )
  }
}

// POST /api/blog - Create new blog post (admin only)
export async function POST(request: NextRequest) {
  try {
    // In a real app, you'd verify admin authentication here
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { title, description, content, tags, bannerImage, isPublished } = body

    // Validate required fields
    if (!title || !description || !content) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Generate new blog post
    const newPost = {
      id: Date.now().toString(),
      title,
      slug: title.toLowerCase().replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-'),
      description,
      content,
      tags: tags || [],
      bannerImage: bannerImage || null,
      views: 0,
      likes: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPublished: isPublished || false,
      readTime: Math.ceil(content.split(/\s+/).length / 200), // 200 words per minute
      author: {
        name: 'Maath Mphepo',
        avatar: '/images/author-avatar.jpg',
        bio: 'Backend Developer specializing in Django and Laravel'
      }
    }

    // In a real app, you'd save to database here
    mockBlogPosts.unshift(newPost)

    return NextResponse.json({
      success: true,
      data: newPost
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating blog post:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create blog post' },
      { status: 500 }
    )
  }
}
