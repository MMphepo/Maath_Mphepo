import { NextRequest, NextResponse } from 'next/server'
import { mockBlogPosts, mockReactions } from '@/lib/blog-data'

// POST /api/blog/[slug]/like - Like/unlike a blog post
export async function POST(
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

    // Get user identifier (in production, use proper user ID or session)
    const userIP = request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'anonymous'
    
    const userIdentifier = `ip_${userIP.split(',')[0]}`

    // Check if user already liked this post
    const existingReaction = mockReactions.find(
      reaction => reaction.blogId === post.id && 
                 reaction.userIdentifier === userIdentifier &&
                 reaction.type === 'like'
    )

    if (existingReaction) {
      // Unlike - remove reaction
      const reactionIndex = mockReactions.findIndex(r => r.id === existingReaction.id)
      mockReactions.splice(reactionIndex, 1)
      
      // Decrease like count
      post.likes = Math.max(0, post.likes - 1)

      return NextResponse.json({
        success: true,
        data: {
          liked: false,
          likes: post.likes
        },
        message: 'Post unliked'
      })
    } else {
      // Like - add reaction
      const newReaction = {
        id: Date.now().toString(),
        blogId: post.id,
        type: 'like' as const,
        userIdentifier,
        createdAt: new Date().toISOString()
      }

      mockReactions.push(newReaction)
      
      // Increase like count
      post.likes += 1

      return NextResponse.json({
        success: true,
        data: {
          liked: true,
          likes: post.likes
        },
        message: 'Post liked'
      })
    }
  } catch (error) {
    console.error('Error handling like:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process like' },
      { status: 500 }
    )
  }
}

// GET /api/blog/[slug]/like - Check if user has liked the post
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

    // Get user identifier
    const userIP = request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'anonymous'
    
    const userIdentifier = `ip_${userIP.split(',')[0]}`

    // Check if user has liked this post
    const hasLiked = mockReactions.some(
      reaction => reaction.blogId === post.id && 
                 reaction.userIdentifier === userIdentifier &&
                 reaction.type === 'like'
    )

    return NextResponse.json({
      success: true,
      data: {
        liked: hasLiked,
        likes: post.likes
      }
    })
  } catch (error) {
    console.error('Error checking like status:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to check like status' },
      { status: 500 }
    )
  }
}
