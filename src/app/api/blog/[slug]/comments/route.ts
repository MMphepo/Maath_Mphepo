import { NextRequest, NextResponse } from 'next/server'
import { mockComments, mockBlogPosts } from '@/lib/blog-data'
import { buildCommentTree } from '@/lib/blog-utils'

// GET /api/blog/[slug]/comments - Get comments for a blog post
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params

    // Find blog post
    const post = mockBlogPosts.find(p => p.slug === slug)
    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Blog post not found' },
        { status: 404 }
      )
    }

    // Get approved comments for this blog post
    const postComments = mockComments.filter(
      comment => comment.blogId === post.id && comment.isApproved
    )

    // Build nested comment tree
    const commentTree = buildCommentTree(postComments)

    return NextResponse.json({
      success: true,
      data: commentTree
    })
  } catch (error) {
    console.error('Error fetching comments:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch comments' },
      { status: 500 }
    )
  }
}

// POST /api/blog/[slug]/comments - Add new comment
export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params
    const body = await request.json()
    const { name, email, content, parentId } = body

    // Validate required fields
    if (!name || !email || !content) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Find blog post
    const post = mockBlogPosts.find(p => p.slug === slug)
    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Blog post not found' },
        { status: 404 }
      )
    }

    // If parentId is provided, validate parent comment exists
    if (parentId) {
      const parentComment = mockComments.find(c => c.id === parentId)
      if (!parentComment || parentComment.blogId !== post.id) {
        return NextResponse.json(
          { success: false, error: 'Parent comment not found' },
          { status: 400 }
        )
      }
    }

    // Create new comment
    const newComment = {
      id: Date.now().toString(),
      blogId: post.id,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      content: content.trim(),
      parentId: parentId || undefined,
      isApproved: true, // In production, you might want manual approval
      createdAt: new Date().toISOString()
    }

    // Add to mock data (in production, save to database)
    mockComments.push(newComment)

    return NextResponse.json({
      success: true,
      data: newComment,
      message: 'Comment added successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('Error adding comment:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to add comment' },
      { status: 500 }
    )
  }
}
