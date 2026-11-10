import { Metadata } from 'next'
import Navigation from '@/components/Navigation'
import PortfolioFooter from '@/components/PortfolioFooter'
import Link from 'next/link'
import BlogPostContent from '@/components/blog/BlogPostContent'
import { getBlogPostBySlug, getAllBlogSlugs } from '@/lib/blog-files'

interface BlogPostPageProps {
  params: {
    slug: string
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const post = getBlogPostBySlug(params.slug)

  if (!post) {
    return {
      title: 'Post Not Found - Maath Mphepo',
      description: 'The requested blog post could not be found.'
    }
  }

  const tagStrings = Array.isArray(post.tags)
    ? post.tags.map((tag) => (typeof tag === 'string' ? tag : tag.name))
    : []

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
          url: '/images/blog-default-og.jpg',
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
      images: ['/images/blog-default-twitter.jpg'],
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
  return getAllBlogSlugs().map((slug) => ({
    slug,
  }))
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const post = getBlogPostBySlug(params.slug)

  if (!post) {
    return (
      <div className="portfolio-site">
        <Navigation />
        <main className="portfolio-container portfolio-missing">
          <p className="portfolio-eyebrow">Writing</p>
          <h1>This article is unavailable right now.</h1>
          <p>The article may no longer be available.</p>
          <Link className="portfolio-text-link" href="/blog">Return to writing</Link>
        </main>
        <PortfolioFooter />
      </div>
    )
  }

  return (
    <div className="portfolio-site">
      <Navigation />
      <main className="portfolio-blog-post">
        <BlogPostContent post={post} />
      </main>
      <PortfolioFooter />
    </div>
  )
}
