import { readFileSync, readdirSync, existsSync } from 'fs'
import { join } from 'path'
import { BlogPost } from '@/types/blog'

const BLOG_DIR = join(process.cwd(), 'src', 'content', 'blog')

// Parse YAML frontmatter from markdown content
function parseFrontmatter(content: string): { frontmatter: Record<string, string>; body: string } {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n/
  const match = content.match(frontmatterRegex)

  if (!match) {
    return { frontmatter: {}, body: content }
  }

  const frontmatterText = match[1]
  const body = content.slice(match[0].length)
  const frontmatter: Record<string, string> = {}

  frontmatterText.split('\n').forEach((line) => {
    const colonIndex = line.indexOf(':')
    if (colonIndex > 0) {
      const key = line.slice(0, colonIndex).trim()
      let value = line.slice(colonIndex + 1).trim()
      // Remove surrounding quotes
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1)
      }
      frontmatter[key] = value
    }
  })

  return { frontmatter, body }
}

// Parse tags from frontmatter string
function parseTags(tagString: string): string[] {
  if (!tagString) return []
  // Handle YAML array format like [tag1, tag2]
  const cleaned = tagString.replace(/[\[\]]/g, '')
  return cleaned.split(',').map((t) => t.trim()).filter(Boolean)
}

// Calculate read time
function calculateReadTime(content: string): number {
  const wordsPerMinute = 200
  const wordCount = content.split(/\s+/).length
  return Math.ceil(wordCount / wordsPerMinute)
}

export function getAllBlogPosts(): BlogPost[] {
  if (!existsSync(BLOG_DIR)) return []

  const files = readdirSync(BLOG_DIR).filter((file) => file.endsWith('.md'))

  return files.map((file) => {
    const filePath = join(BLOG_DIR, file)
    const content = readFileSync(filePath, 'utf-8')
    const { frontmatter, body } = parseFrontmatter(content)
    const slug = frontmatter.slug || file.replace('.md', '')

    return {
      id: slug,
      title: frontmatter.title || slug,
      slug,
      description: frontmatter.description || '',
      content: body,
      tags: parseTags(frontmatter.tags),
      views: 0,
      likes: 0,
      createdAt: frontmatter.date || new Date().toISOString(),
      updatedAt: frontmatter.date || new Date().toISOString(),
      isPublished: true,
      readTime: parseInt(String(frontmatter.readTime || calculateReadTime(body)), 10),
      author: {
        name: frontmatter.author_name || 'Maath Mphepo',
        avatar: frontmatter.author_avatar || '/images/hero-profile.png',
        bio: frontmatter.author_bio || 'Backend Developer specializing in Django and Laravel'
      }
    }
  })
}

export function getBlogPostBySlug(slug: string): BlogPost | null {
  const filePath = join(BLOG_DIR, `${slug}.md`)

  if (!existsSync(filePath)) return null

  const content = readFileSync(filePath, 'utf-8')
  const { frontmatter, body } = parseFrontmatter(content)

  return {
    id: slug,
    title: frontmatter.title || slug,
    slug,
    description: frontmatter.description || '',
    content: body,
    tags: parseTags(frontmatter.tags),
    views: 0,
    likes: 0,
    createdAt: frontmatter.date || new Date().toISOString(),
    updatedAt: frontmatter.date || new Date().toISOString(),
    isPublished: true,
    readTime: parseInt(String(frontmatter.readTime || calculateReadTime(body)), 10),
    author: {
      name: frontmatter.author_name || 'Maath Mphepo',
      avatar: frontmatter.author_avatar || '/images/hero-profile.png',
      bio: frontmatter.author_bio || 'Backend Developer specializing in Django and Laravel'
    }
  }
}

export function getAllBlogSlugs(): string[] {
  if (!existsSync(BLOG_DIR)) return []
  return readdirSync(BLOG_DIR)
    .filter((file) => file.endsWith('.md'))
    .map((file) => file.replace('.md', ''))
}
