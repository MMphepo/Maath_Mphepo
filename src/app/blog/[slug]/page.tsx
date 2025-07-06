import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import BlogPostContent from '@/components/blog/BlogPostContent'
import { mockBlogPosts } from '@/lib/blog-data'

interface BlogPostPageProps {
  params: {
    slug: string
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const post = mockBlogPosts.find(p => p.slug === params.slug && p.isPublished)
  
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
      tags: post.tags,
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
  const publishedPosts = mockBlogPosts.filter(post => post.isPublished)
  
  return publishedPosts.map((post) => ({
    slug: post.slug,
  }))
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const post = mockBlogPosts.find(p => p.slug === params.slug && p.isPublished)

  if (!post) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-dark-100">
      <BlogPostContent post={post} />
    </main>
  )
}
