import type { Metadata } from 'next'
import Navigation from '@/components/Navigation'
import PortfolioFooter from '@/components/PortfolioFooter'
import BlogList from '@/components/blog/BlogList'
import BlogHero from '@/components/blog/BlogHero'
import { getAllBlogPosts } from '@/lib/blog-files'

export const metadata: Metadata = {
  title: 'Writing — Maath Mphepo',
  description: 'Notes on systems, software and the work between a real-world need and delivery.',
  authors: [{ name: 'Maath Mphepo' }],
  creator: 'Maath Mphepo',
  publisher: 'Maath Mphepo',
}

const posts = getAllBlogPosts()

export default function BlogPage() {
  return (
    <div className="portfolio-site">
      <Navigation />
      <main>
        <BlogHero />
        <BlogList posts={posts} />
      </main>
      <PortfolioFooter />
    </div>
  )
}
