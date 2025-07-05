import { NextRequest, NextResponse } from 'next/server'
import { mockBlogPosts } from '@/lib/blog-data'

// GET /api/blog/[slug] - Get single blog post by slug
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params

    // Find blog post by slug
    const post = mockBlogPosts.find(p => p.slug === slug && p.isPublished)

    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Blog post not found' },
        { status: 404 }
      )
    }

    // Increment view count (in a real app, you'd update the database)
    post.views += 1

    return NextResponse.json({
      success: true,
      data: post
    })
  } catch (error) {
    console.error('Error fetching blog post:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch blog post' },
      { status: 500 }
    )
  }
}

// PUT /api/blog/[slug] - Update blog post (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // Check authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { slug } = params
    const body = await request.json()

    // Find blog post
    const postIndex = mockBlogPosts.findIndex(p => p.slug === slug)
    if (postIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Blog post not found' },
        { status: 404 }
      )
    }

    // Update blog post
    const updatedPost = {
      ...mockBlogPosts[postIndex],
      ...body,
      updatedAt: new Date().toISOString()
    }

    // Update slug if title changed
    if (body.title && body.title !== mockBlogPosts[postIndex].title) {
      updatedPost.slug = body.title.toLowerCase().replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-')
    }

    // Update read time if content changed
    if (body.content) {
      updatedPost.readTime = Math.ceil(body.content.split(/\s+/).length / 200)
    }

    mockBlogPosts[postIndex] = updatedPost

    return NextResponse.json({
      success: true,
      data: updatedPost
    })
  } catch (error) {
    console.error('Error updating blog post:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update blog post' },
      { status: 500 }
    )
  }
}

// DELETE /api/blog/[slug] - Delete blog post (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // Check authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { slug } = params

    // Find and remove blog post
    const postIndex = mockBlogPosts.findIndex(p => p.slug === slug)
    if (postIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Blog post not found' },
        { status: 404 }
      )
    }

    const deletedPost = mockBlogPosts.splice(postIndex, 1)[0]

    return NextResponse.json({
      success: true,
      data: deletedPost
    })
  } catch (error) {
    console.error('Error deleting blog post:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete blog post' },
      { status: 500 }
    )
  }
}
