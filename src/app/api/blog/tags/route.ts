import { NextRequest, NextResponse } from 'next/server'
import { mockTags } from '@/lib/blog-data'

// GET /api/blog/tags - Get all blog tags
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sortBy = searchParams.get('sortBy') || 'count' // 'count' or 'name'
    const order = searchParams.get('order') || 'desc' // 'asc' or 'desc'

    // Sort tags
    const sortedTags = [...mockTags].sort((a, b) => {
      let comparison = 0
      
      if (sortBy === 'count') {
        comparison = a.count - b.count
      } else {
        comparison = a.name.localeCompare(b.name)
      }
      
      return order === 'desc' ? -comparison : comparison
    })

    return NextResponse.json({
      success: true,
      data: sortedTags
    })
  } catch (error) {
    console.error('Error fetching tags:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tags' },
      { status: 500 }
    )
  }
}
