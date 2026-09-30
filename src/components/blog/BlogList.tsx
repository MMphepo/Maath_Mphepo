'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { BlogPost, BlogTag } from '@/types/blog'
import { formatDate, extractExcerpt } from '@/lib/blog-utils'
import { api } from '@/lib/api-config'

type SortBy = 'createdAt' | 'views' | 'likes'

export default function BlogList() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [tags, setTags] = useState<BlogTag[]>([])
  const [loading, setLoading] = useState(true)
  const [unavailable, setUnavailable] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedTag, setSelectedTag] = useState('')
  const [sortBy, setSortBy] = useState<SortBy>('createdAt')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    let active = true

    const loadTags = async () => {
      try {
        const response = await api.blog.tags()
        if (active && response.success && Array.isArray(response.data)) {
          setTags(response.data)
        }
      } catch (error) {
        console.error('Unable to load blog tags:', error)
      }
    }

    loadTags()
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let active = true

    const loadPosts = async () => {
      setLoading(true)
      setUnavailable(false)

      try {
        const response = await api.blog.list({
          page: page.toString(),
          limit: '6',
          ...(search.trim() ? { search: search.trim() } : {}),
          ...(selectedTag ? { tag: selectedTag } : {}),
          sortBy,
          sortOrder: 'desc',
        })

        if (!response.success || !response.data) {
          if (active) {
            setPosts([])
            setUnavailable(true)
          }
          return
        }

        if (active) {
          setPosts(response.data.posts ?? [])
          setTotalPages(response.data.totalPages ?? 1)
        }
      } catch (error) {
        console.error('Unable to load blog posts:', error)
        if (active) {
          setPosts([])
          setUnavailable(true)
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    loadPosts()
    return () => {
      active = false
    }
  }, [page, search, selectedTag, sortBy])

  const resetFilters = () => {
    setSearch('')
    setSelectedTag('')
    setPage(1)
  }

  return (
    <section className="portfolio-section portfolio-section--compact">
      <div className="portfolio-container">
        <div className="blog-controls">
          <label>
            <span>Search articles</span>
            <input
              onChange={(event) => {
                setSearch(event.target.value)
                setPage(1)
              }}
              placeholder="Search by title or topic"
              type="search"
              value={search}
            />
          </label>
          <label>
            <span>Topic</span>
            <select
              onChange={(event) => {
                setSelectedTag(event.target.value)
                setPage(1)
              }}
              value={selectedTag}
            >
              <option value="">All topics</option>
              {tags.map((tag) => (
                <option key={tag.id} value={tag.slug}>{tag.name}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Order</span>
            <select
              onChange={(event) => {
                const value = event.target.value
                if (value === 'createdAt' || value === 'views' || value === 'likes') {
                  setSortBy(value)
                }
                setPage(1)
              }}
              value={sortBy}
            >
              <option value="createdAt">Newest</option>
              <option value="views">Most viewed</option>
              <option value="likes">Most liked</option>
            </select>
          </label>
        </div>

        <div aria-live="polite" className="blog-results">
          {loading ? (
            <p className="blog-message">Loading writing…</p>
          ) : unavailable ? (
            <div className="blog-message">
              <p className="portfolio-eyebrow">Publication</p>
              <h2>Articles are temporarily unavailable.</h2>
              <p>
                The writing service could not be reached. The project directory is available while
                articles are offline.
              </p>
              <Link className="portfolio-text-link" href="/work">
                Explore the work <span aria-hidden="true">↗</span>
              </Link>
            </div>
          ) : posts.length ? (
            <div className="article-list">
              {posts.map((post) => (
                <article className="article-row" key={post.id}>
                  <div>
                    <p className="project-row__category">
                      {post.tags
                        .slice(0, 2)
                        .map((tag) => (typeof tag === 'string' ? tag : tag.name))
                        .join(' · ')}
                    </p>
                    <h2><Link href={`/blog/${post.slug}`}>{post.title}</Link></h2>
                    <p>{extractExcerpt(post.description, 220)}</p>
                  </div>
                  <div className="article-row__meta">
                    <time dateTime={post.createdAt}>{formatDate(post.createdAt)}</time>
                    <span>{post.readTime} min read</span>
                    <Link aria-label={`Read ${post.title}`} href={`/blog/${post.slug}`}>
                      Read article <span aria-hidden="true">↗</span>
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="blog-message">
              <p className="portfolio-eyebrow">Field notes</p>
              <h2>{search || selectedTag ? 'No matching articles.' : 'Writing will appear here.'}</h2>
              <p>
                {search || selectedTag
                  ? 'Try a different search or clear the selected topic.'
                  : 'This publication is reserved for practical notes on systems, software and delivery.'}
              </p>
              {(search || selectedTag) && (
                <button className="portfolio-text-link" onClick={resetFilters} type="button">
                  Clear search and topic
                </button>
              )}
            </div>
          )}
        </div>

        {!loading && !unavailable && totalPages > 1 && (
          <nav aria-label="Article pages" className="blog-pagination">
            <button disabled={page <= 1} onClick={() => setPage((current) => current - 1)} type="button">
              Previous
            </button>
            <span aria-live="polite">Page {page} of {totalPages}</span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((current) => current + 1)}
              type="button"
            >
              Next
            </button>
          </nav>
        )}
      </div>
    </section>
  )
}
