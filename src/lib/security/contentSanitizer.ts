// Content sanitization utilities for blog posts

import DOMPurify from 'isomorphic-dompurify'

// Configuration for DOMPurify
const ALLOWED_TAGS = [
  // Text formatting
  'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'mark', 'small', 'sub', 'sup',
  
  // Headings
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  
  // Lists
  'ul', 'ol', 'li',
  
  // Links and media
  'a', 'img',
  
  // Code
  'code', 'pre',
  
  // Quotes and citations
  'blockquote', 'cite',
  
  // Tables
  'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td',
  
  // Divs and spans for styling
  'div', 'span',
  
  // Horizontal rule
  'hr'
]

const ALLOWED_ATTRIBUTES = {
  'a': ['href', 'title', 'target', 'rel'],
  'img': ['src', 'alt', 'title', 'width', 'height', 'loading'],
  'blockquote': ['cite'],
  'code': ['class'],
  'pre': ['class'],
  'div': ['class', 'id'],
  'span': ['class'],
  'h1': ['id'],
  'h2': ['id'],
  'h3': ['id'],
  'h4': ['id'],
  'h5': ['id'],
  'h6': ['id'],
  'table': ['class'],
  'th': ['scope', 'colspan', 'rowspan'],
  'td': ['colspan', 'rowspan']
}

// URL validation patterns
const ALLOWED_PROTOCOLS = ['http:', 'https:', 'mailto:', 'tel:']
const ALLOWED_DOMAINS = [
  'localhost',
  'maathmphepo.com',
  'github.com',
  'linkedin.com',
  'twitter.com',
  'youtube.com',
  'vimeo.com'
]

class ContentSanitizer {
  private purifyConfig: any

  constructor() {
    this.purifyConfig = {
      ALLOWED_TAGS,
      ALLOWED_ATTR: ALLOWED_ATTRIBUTES,
      ALLOW_DATA_ATTR: false,
      ALLOW_UNKNOWN_PROTOCOLS: false,
      ALLOWED_URI_REGEXP: this.createAllowedUriRegexp(),
      FORBID_SCRIPT: true,
      FORBID_TAGS: ['script', 'object', 'embed', 'form', 'input', 'button'],
      FORBID_ATTR: ['onclick', 'onload', 'onerror', 'onmouseover', 'onfocus', 'onblur'],
      KEEP_CONTENT: true,
      RETURN_DOM: false,
      RETURN_DOM_FRAGMENT: false,
      RETURN_DOM_IMPORT: false,
      SANITIZE_DOM: true,
      WHOLE_DOCUMENT: false,
      IN_PLACE: false
    }
  }

  private createAllowedUriRegexp(): RegExp {
    const protocolPattern = ALLOWED_PROTOCOLS.map(p => p.replace(':', '')).join('|')
    return new RegExp(`^(${protocolPattern})://`, 'i')
  }

  /**
   * Sanitize HTML content for safe display
   */
  sanitizeContent(content: string): string {
    if (!content) return ''

    // First pass: Basic sanitization
    let sanitized = DOMPurify.sanitize(content, this.purifyConfig)

    // Second pass: Additional security checks
    sanitized = this.validateLinks(sanitized)
    sanitized = this.validateImages(sanitized)
    sanitized = this.addSecurityAttributes(sanitized)

    return sanitized
  }

  /**
   * Validate and secure links
   */
  private validateLinks(content: string): string {
    return content.replace(/<a\s+([^>]*?)href=["']([^"']*?)["']([^>]*?)>/gi, (match, before, href, after) => {
      try {
        const url = new URL(href, 'https://maathmphepo.com')
        
        // Check protocol
        if (!ALLOWED_PROTOCOLS.includes(url.protocol)) {
          return `<span class="invalid-link">${match.replace(/<\/?a[^>]*>/gi, '')}</span>`
        }

        // Check for external links
        const isExternal = !ALLOWED_DOMAINS.some(domain => 
          url.hostname === domain || url.hostname.endsWith(`.${domain}`)
        )

        if (isExternal) {
          // Add security attributes for external links
          const secureAttrs = 'target="_blank" rel="noopener noreferrer nofollow"'
          return `<a ${before}href="${href}" ${secureAttrs} ${after}>`
        }

        return match
      } catch (error) {
        // Invalid URL, remove the link but keep the text
        return `<span class="invalid-link">${match.replace(/<\/?a[^>]*>/gi, '')}</span>`
      }
    })
  }

  /**
   * Validate and secure images
   */
  private validateImages(content: string): string {
    return content.replace(/<img\s+([^>]*?)src=["']([^"']*?)["']([^>]*?)>/gi, (match, before, src, after) => {
      try {
        const url = new URL(src, 'https://maathmphepo.com')
        
        // Only allow HTTPS images (except localhost for development)
        if (url.protocol !== 'https:' && url.hostname !== 'localhost') {
          return `<span class="invalid-image">Image removed for security</span>`
        }

        // Add security attributes
        const secureAttrs = 'loading="lazy" referrerpolicy="no-referrer"'
        return `<img ${before}src="${src}" ${secureAttrs} ${after}>`
      } catch (error) {
        return `<span class="invalid-image">Invalid image URL</span>`
      }
    })
  }

  /**
   * Add security attributes to elements
   */
  private addSecurityAttributes(content: string): string {
    // Add IDs to headings for table of contents (but sanitize them)
    content = content.replace(/<(h[1-6])([^>]*?)>(.*?)<\/h[1-6]>/gi, (match, tag, attrs, text) => {
      const cleanText = text.replace(/<[^>]*>/g, '').trim()
      const id = this.generateSecureId(cleanText)
      
      // Check if ID already exists in attributes
      if (attrs.includes('id=')) {
        return match
      }
      
      return `<${tag}${attrs} id="${id}">${text}</${tag}>`
    })

    return content
  }

  /**
   * Generate secure ID for headings
   */
  private generateSecureId(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
      .substring(0, 50) // Limit length
  }

  /**
   * Sanitize user input (for comments, etc.)
   */
  sanitizeUserInput(input: string): string {
    const userConfig = {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a', 'code'],
      ALLOWED_ATTR: {
        'a': ['href'],
        'code': []
      },
      ALLOW_DATA_ATTR: false,
      FORBID_SCRIPT: true,
      FORBID_TAGS: ['script', 'object', 'embed', 'form', 'input', 'button', 'img'],
      KEEP_CONTENT: true
    }

    return DOMPurify.sanitize(input, userConfig)
  }

  /**
   * Validate content before saving (server-side validation)
   */
  validateContent(content: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!content || content.trim().length === 0) {
      errors.push('Content cannot be empty')
      return { isValid: false, errors }
    }

    // Check for suspicious patterns
    const suspiciousPatterns = [
      /<script[^>]*>/i,
      /javascript:/i,
      /vbscript:/i,
      /data:text\/html/i,
      /on\w+\s*=/i, // Event handlers
      /<iframe[^>]*>/i,
      /<object[^>]*>/i,
      /<embed[^>]*>/i
    ]

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(content)) {
        errors.push('Content contains potentially unsafe elements')
        break
      }
    }

    // Check content length
    if (content.length > 100000) { // 100KB limit
      errors.push('Content is too long (maximum 100KB)')
    }

    // Check for excessive nesting
    const nestingLevel = this.checkNestingLevel(content)
    if (nestingLevel > 10) {
      errors.push('Content has excessive HTML nesting')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Check HTML nesting level
   */
  private checkNestingLevel(html: string): number {
    let maxLevel = 0
    let currentLevel = 0

    const tagRegex = /<\/?([a-zA-Z][a-zA-Z0-9]*)[^>]*>/g
    let match

    while ((match = tagRegex.exec(html)) !== null) {
      const tagName = match[1].toLowerCase()
      const isClosing = match[0].startsWith('</')

      if (isClosing) {
        currentLevel--
      } else {
        // Self-closing tags don't increase nesting
        if (!match[0].endsWith('/>') && !['br', 'hr', 'img', 'input'].includes(tagName)) {
          currentLevel++
          maxLevel = Math.max(maxLevel, currentLevel)
        }
      }
    }

    return maxLevel
  }

  /**
   * Extract and validate metadata from content
   */
  extractMetadata(content: string): {
    wordCount: number
    readingTime: number
    headingCount: number
    imageCount: number
    linkCount: number
  } {
    const cleanContent = content.replace(/<[^>]*>/g, ' ')
    const words = cleanContent.trim().split(/\s+/).filter(word => word.length > 0)
    
    return {
      wordCount: words.length,
      readingTime: Math.max(1, Math.ceil(words.length / 200)),
      headingCount: (content.match(/<h[1-6][^>]*>/gi) || []).length,
      imageCount: (content.match(/<img[^>]*>/gi) || []).length,
      linkCount: (content.match(/<a[^>]*>/gi) || []).length
    }
  }
}

// Export singleton instance
export const contentSanitizer = new ContentSanitizer()

// Export utility functions
export const sanitizeContent = (content: string) => contentSanitizer.sanitizeContent(content)
export const sanitizeUserInput = (input: string) => contentSanitizer.sanitizeUserInput(input)
export const validateContent = (content: string) => contentSanitizer.validateContent(content)
export const extractMetadata = (content: string) => contentSanitizer.extractMetadata(content)
