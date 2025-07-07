import { Metadata } from 'next'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import BlogList from '@/components/blog/BlogList'
import BlogHero from '@/components/blog/BlogHero'

export const metadata: Metadata = {
  title: 'Blog - Maath Mphepo | Backend Development Insights & Tutorials',
  description: 'Explore in-depth articles about backend development, Django, Laravel, API design, database optimization, and software engineering best practices.',
  keywords: [
    'Backend Development Blog',
    'Django Tutorials',
    'Laravel Articles',
    'API Development',
    'Database Design',
    'Python Programming',
    'PHP Development',
    'Software Engineering',
    'Web Development',
    'Technical Blog'
  ],
  authors: [{ name: 'Maath Mphepo' }],
  creator: 'Maath Mphepo',
  publisher: 'Maath Mphepo',
  openGraph: {
    title: 'Blog - Maath Mphepo | Backend Development Insights',
    description: 'Explore in-depth articles about backend development, Django, Laravel, API design, and software engineering best practices.',
    url: 'https://maathmphepo.com/blog',
    siteName: 'Maath Mphepo Portfolio',
    images: [
      {
        url: '/images/blog-og.jpg',
        width: 1200,
        height: 630,
        alt: 'Maath Mphepo Blog - Backend Development Insights',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog - Maath Mphepo | Backend Development Insights',
    description: 'Explore in-depth articles about backend development, Django, Laravel, API design, and software engineering best practices.',
    images: ['/images/blog-twitter.jpg'],
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
    canonical: 'https://maathmphepo.com/blog',
    types: {
      'application/rss+xml': [
        {
          url: 'https://maathmphepo.com/blog/rss.xml',
          title: 'Maath Mphepo Blog RSS Feed'
        }
      ]
    }
  },
}

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-dark-100">
      <Navigation />
      <BlogHero />
      <BlogList />
      <Footer />
    </main>
  )
}
