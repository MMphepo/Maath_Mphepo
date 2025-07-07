import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import BlogPostContent from '@/components/blog/BlogPostContent'
import { API_BASE_URL, API_ENDPOINTS } from '@/lib/api-config'
import { BlogPost } from '@/types/blog'

interface BlogPostPageProps {
  params: {
    slug: string
  }
}

// Fetch blog post from Django backend (server-side)
async function getBlogPost(slug: string): Promise<BlogPost | null> {
  try {
    const url = `${API_BASE_URL}${API_ENDPOINTS.BLOG.DETAIL(slug)}`
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      // Add cache revalidation for production
      next: { revalidate: 3600 } // Revalidate every hour
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    if (data.success && data.data) {
      return data.data
    }
    return null
  } catch (error) {
    console.error('Error fetching blog post:', error)
    return null
  }
}

// Fetch blog posts list from Django backend (server-side)
async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    const url = `${API_BASE_URL}${API_ENDPOINTS.BLOG.LIST}`
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      // Add cache revalidation for production
      next: { revalidate: 3600 } // Revalidate every hour
    })

    if (!response.ok) {
      return []
    }

    const data = await response.json()
    if (data.success && data.data && data.data.posts) {
      return data.data.posts
    }
    return []
  } catch (error) {
    console.error('Error fetching blog posts:', error)
    return []
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const post = await getBlogPost(params.slug)

  if (!post) {
    return {
      title: 'Post Not Found - Maath Mphepo',
      description: 'The requested blog post could not be found.'
    }
  }

  // Convert tags to strings for metadata
  const tagStrings = post.tags.map(tag =>
    typeof tag === 'string' ? tag : tag.name
  )

  return {
    title: `${post.title} - Maath Mphepo Blog`,
    description: post.description,
    keywords: tagStrings,
    authors: [{ name: post.author.name }],
    creator: post.author.name,
    publisher: 'Maath Mphepo',
    openGraph: {
      title: post.title,
      description: post.description,
      url: `https://maathmphepo.com/blog/${post.slug}`,
      siteName: 'Maath Mphepo Portfolio',
      images: [
        {
          url: post.bannerImage || '/images/blog-default-og.jpg',
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
      locale: 'en_US',
      type: 'article',
      publishedTime: post.createdAt,
      modifiedTime: post.updatedAt,
      authors: [post.author.name],
      tags: tagStrings,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      images: [post.bannerImage || '/images/blog-default-twitter.jpg'],
      creator: '@maathmphepo',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    alternates: {
      canonical: `https://maathmphepo.com/blog/${post.slug}`,
    },
  }
}

// Generate static params for static generation
export async function generateStaticParams() {
  try {
    const posts = await getBlogPosts()
    return posts.map((post: BlogPost) => ({
      slug: post.slug,
    }))
  } catch (error) {
    console.error('Error generating static params:', error)
  }

  // Return empty array if API fails
  return []
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = await getBlogPost(params.slug)

  if (!post) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-dark-100">
      <Navigation />
      <BlogPostContent post={post} />
      <Footer />
    </main>
  )
}
