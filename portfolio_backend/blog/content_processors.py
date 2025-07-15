"""
Content processors for ensuring compatibility between admin rich text editor and frontend display
"""

import re
import html
from django.utils.safestring import mark_safe
from django.conf import settings
import logging

logger = logging.getLogger(__name__)


class ContentProcessor:
    """
    Process blog content for frontend compatibility
    """
    
    def __init__(self):
        self.processors = [
            self.process_headings,
            self.process_code_blocks,
            self.process_images,
            self.process_links,
            self.process_tables,
            self.process_lists,
            self.process_blockquotes,
            self.clean_html,
        ]
    
    def process(self, content):
        """
        Process content through all processors
        
        Args:
            content (str): Raw HTML content from CKEditor
            
        Returns:
            str: Processed content compatible with frontend
        """
        if not content:
            return ""
        
        processed_content = content
        
        for processor in self.processors:
            try:
                processed_content = processor(processed_content)
            except Exception as e:
                logger.error(f"Error in content processor {processor.__name__}: {str(e)}")
        
        return processed_content
    
    def process_headings(self, content):
        """
        Process headings to add IDs for table of contents
        """
        def add_heading_id(match):
            level = match.group(1)
            text = match.group(2).strip()
            
            # Generate ID from text
            heading_id = self.generate_slug(text)
            
            return f'<h{level} id="{heading_id}">{text}</h{level}>'
        
        # Process h1-h6 tags
        content = re.sub(r'<h([1-6])([^>]*)>(.*?)</h[1-6]>', add_heading_id, content)
        
        return content
    
    def process_code_blocks(self, content):
        """
        Process code blocks for syntax highlighting compatibility
        """
        # Convert CKEditor code blocks to format expected by highlight.js
        def process_code_block(match):
            language = match.group(1) if match.group(1) else 'text'
            code_content = match.group(2)
            
            # Escape HTML entities in code
            code_content = html.escape(code_content)
            
            return f'<pre><code class="language-{language}">{code_content}</code></pre>'
        
        # Process code blocks with language specification
        content = re.sub(
            r'<pre[^>]*><code[^>]*class="language-([^"]*)"[^>]*>(.*?)</code></pre>',
            process_code_block,
            content,
            flags=re.DOTALL
        )
        
        # Process generic code blocks
        content = re.sub(
            r'<pre[^>]*><code[^>]*>(.*?)</code></pre>',
            lambda m: f'<pre><code class="language-text">{html.escape(m.group(1))}</code></pre>',
            content,
            flags=re.DOTALL
        )
        
        # Process inline code
        content = re.sub(
            r'<code[^>]*>(.*?)</code>',
            lambda m: f'<code class="inline-code">{html.escape(m.group(1))}</code>',
            content
        )
        
        return content
    
    def process_images(self, content):
        """
        Process images for responsive display and proper attributes
        """
        def process_image(match):
            # Extract attributes
            attrs = match.group(1)
            
            # Parse existing attributes
            src_match = re.search(r'src="([^"]*)"', attrs)
            alt_match = re.search(r'alt="([^"]*)"', attrs)
            title_match = re.search(r'title="([^"]*)"', attrs)
            
            if not src_match:
                return match.group(0)  # Return original if no src
            
            src = src_match.group(1)
            alt = alt_match.group(1) if alt_match else ""
            title = title_match.group(1) if title_match else ""
            
            # Build new image tag with responsive classes
            img_attrs = [
                f'src="{src}"',
                f'alt="{alt}"',
                'class="blog-image responsive-image"',
                'loading="lazy"'
            ]
            
            if title:
                img_attrs.append(f'title="{title}"')
            
            return f'<img {" ".join(img_attrs)} />'
        
        # Process img tags
        content = re.sub(r'<img([^>]*)>', process_image, content)
        
        return content
    
    def process_links(self, content):
        """
        Process links for security and proper attributes
        """
        def process_link(match):
            href = match.group(1)
            attrs = match.group(2) if match.group(2) else ""
            link_text = match.group(3)
            
            # Check if it's an external link
            is_external = (
                href.startswith('http://') or 
                href.startswith('https://') or
                href.startswith('//')
            ) and not any(domain in href for domain in ['maathmphepo.com', 'localhost'])
            
            # Build new link attributes
            link_attrs = [f'href="{href}"']
            
            if is_external:
                link_attrs.extend([
                    'target="_blank"',
                    'rel="noopener noreferrer"',
                    'class="external-link"'
                ])
            else:
                link_attrs.append('class="internal-link"')
            
            # Preserve existing classes if any
            class_match = re.search(r'class="([^"]*)"', attrs)
            if class_match:
                existing_classes = class_match.group(1)
                # Update class attribute
                for i, attr in enumerate(link_attrs):
                    if attr.startswith('class='):
                        current_class = attr.split('"')[1]
                        link_attrs[i] = f'class="{existing_classes} {current_class}"'
                        break
            
            return f'<a {" ".join(link_attrs)}>{link_text}</a>'
        
        # Process a tags
        content = re.sub(r'<a\s+href="([^"]*)"([^>]*)>(.*?)</a>', process_link, content)
        
        return content
    
    def process_tables(self, content):
        """
        Process tables for responsive display
        """
        # Wrap tables in responsive container
        content = re.sub(
            r'<table([^>]*)>',
            r'<div class="table-responsive"><table\1 class="blog-table">',
            content
        )
        
        content = re.sub(
            r'</table>',
            r'</table></div>',
            content
        )
        
        return content
    
    def process_lists(self, content):
        """
        Process lists for consistent styling
        """
        # Add classes to lists
        content = re.sub(r'<ul([^>]*)>', r'<ul\1 class="blog-list">', content)
        content = re.sub(r'<ol([^>]*)>', r'<ol\1 class="blog-list numbered">', content)
        
        return content
    
    def process_blockquotes(self, content):
        """
        Process blockquotes for enhanced styling
        """
        content = re.sub(
            r'<blockquote([^>]*)>',
            r'<blockquote\1 class="blog-blockquote">',
            content
        )
        
        return content
    
    def clean_html(self, content):
        """
        Clean and sanitize HTML content
        """
        # Remove empty paragraphs
        content = re.sub(r'<p[^>]*>\s*</p>', '', content)
        
        # Remove excessive whitespace
        content = re.sub(r'\s+', ' ', content)
        
        # Remove comments
        content = re.sub(r'<!--.*?-->', '', content, flags=re.DOTALL)
        
        # Clean up spacing around block elements
        content = re.sub(r'>\s+<', '><', content)
        
        return content.strip()
    
    def generate_slug(self, text):
        """
        Generate URL-friendly slug from text
        """
        # Remove HTML tags
        text = re.sub(r'<[^>]+>', '', text)
        
        # Convert to lowercase and replace spaces/special chars with hyphens
        slug = re.sub(r'[^\w\s-]', '', text.lower())
        slug = re.sub(r'[-\s]+', '-', slug)
        
        return slug.strip('-')


class MarkdownCompatibilityProcessor:
    """
    Process content to be compatible with ReactMarkdown on the frontend
    """
    
    def __init__(self):
        self.content_processor = ContentProcessor()
    
    def html_to_markdown_compatible(self, html_content):
        """
        Convert HTML content to markdown-compatible format
        
        Args:
            html_content (str): HTML content from CKEditor
            
        Returns:
            str: Markdown-compatible content
        """
        if not html_content:
            return ""
        
        # First process with content processor
        processed = self.content_processor.process(html_content)
        
        # Convert specific HTML elements to markdown
        markdown_content = processed
        
        # Convert headings
        for i in range(6, 0, -1):
            markdown_content = re.sub(
                f'<h{i}[^>]*id="([^"]*)"[^>]*>(.*?)</h{i}>',
                f'{"#" * i} \\2 {{#\\1}}',
                markdown_content
            )
            markdown_content = re.sub(
                f'<h{i}[^>]*>(.*?)</h{i}>',
                f'{"#" * i} \\1',
                markdown_content
            )
        
        # Convert bold and italic
        markdown_content = re.sub(r'<strong[^>]*>(.*?)</strong>', r'**\1**', markdown_content)
        markdown_content = re.sub(r'<b[^>]*>(.*?)</b>', r'**\1**', markdown_content)
        markdown_content = re.sub(r'<em[^>]*>(.*?)</em>', r'*\1*', markdown_content)
        markdown_content = re.sub(r'<i[^>]*>(.*?)</i>', r'*\1*', markdown_content)
        
        # Convert links
        markdown_content = re.sub(
            r'<a[^>]*href="([^"]*)"[^>]*>(.*?)</a>',
            r'[\2](\1)',
            markdown_content
        )
        
        # Convert images
        markdown_content = re.sub(
            r'<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*>',
            r'![\2](\1)',
            markdown_content
        )
        markdown_content = re.sub(
            r'<img[^>]*src="([^"]*)"[^>]*>',
            r'![](\1)',
            markdown_content
        )
        
        # Convert code blocks
        markdown_content = re.sub(
            r'<pre><code class="language-([^"]*)">(.*?)</code></pre>',
            r'```\1\n\2\n```',
            markdown_content,
            flags=re.DOTALL
        )
        
        # Convert inline code
        markdown_content = re.sub(r'<code[^>]*>(.*?)</code>', r'`\1`', markdown_content)
        
        # Convert blockquotes
        markdown_content = re.sub(
            r'<blockquote[^>]*>(.*?)</blockquote>',
            lambda m: '\n'.join(f'> {line}' for line in m.group(1).strip().split('\n')),
            markdown_content,
            flags=re.DOTALL
        )
        
        # Convert lists
        markdown_content = self._convert_lists(markdown_content)
        
        # Clean up
        markdown_content = re.sub(r'<p[^>]*>(.*?)</p>', r'\1\n\n', markdown_content)
        markdown_content = re.sub(r'<br[^>]*>', '\n', markdown_content)
        markdown_content = re.sub(r'\n{3,}', '\n\n', markdown_content)
        
        return markdown_content.strip()
    
    def _convert_lists(self, content):
        """
        Convert HTML lists to markdown
        """
        # Convert unordered lists
        def convert_ul(match):
            list_content = match.group(1)
            items = re.findall(r'<li[^>]*>(.*?)</li>', list_content, re.DOTALL)
            return '\n'.join(f'- {item.strip()}' for item in items) + '\n'
        
        content = re.sub(r'<ul[^>]*>(.*?)</ul>', convert_ul, content, flags=re.DOTALL)
        
        # Convert ordered lists
        def convert_ol(match):
            list_content = match.group(1)
            items = re.findall(r'<li[^>]*>(.*?)</li>', list_content, re.DOTALL)
            return '\n'.join(f'{i+1}. {item.strip()}' for i, item in enumerate(items)) + '\n'
        
        content = re.sub(r'<ol[^>]*>(.*?)</ol>', convert_ol, content, flags=re.DOTALL)
        
        return content


# Global instances
content_processor = ContentProcessor()
markdown_processor = MarkdownCompatibilityProcessor()


def process_blog_content(content, output_format='html'):
    """
    Process blog content for frontend display
    
    Args:
        content (str): Raw content from CKEditor
        output_format (str): 'html' or 'markdown'
        
    Returns:
        str: Processed content
    """
    if output_format == 'markdown':
        return markdown_processor.html_to_markdown_compatible(content)
    else:
        return content_processor.process(content)


def generate_table_of_contents(content):
    """
    Generate table of contents from processed content
    
    Args:
        content (str): Processed HTML content
        
    Returns:
        list: List of TOC items
    """
    headings = re.findall(r'<h([1-6])[^>]*id="([^"]*)"[^>]*>(.*?)</h[1-6]>', content)
    
    toc = []
    for level, heading_id, text in headings:
        # Clean text (remove HTML tags)
        clean_text = re.sub(r'<[^>]+>', '', text).strip()
        if clean_text:
            toc.append({
                'level': int(level),
                'id': heading_id,
                'title': clean_text
            })
    
    return toc


def extract_content_metadata(content):
    """
    Extract metadata from content
    
    Args:
        content (str): HTML content
        
    Returns:
        dict: Content metadata
    """
    if not content:
        return {
            'word_count': 0,
            'reading_time': 0,
            'image_count': 0,
            'link_count': 0,
            'heading_count': 0
        }
    
    # Strip HTML for word count
    clean_content = re.sub(r'<[^>]+>', '', content)
    words = clean_content.split()
    word_count = len(words)
    
    # Calculate reading time (200 words per minute)
    reading_time = max(1, word_count // 200)
    
    # Count elements
    image_count = len(re.findall(r'<img[^>]*>', content))
    link_count = len(re.findall(r'<a[^>]*>', content))
    heading_count = len(re.findall(r'<h[1-6][^>]*>', content))
    
    return {
        'word_count': word_count,
        'reading_time': reading_time,
        'image_count': image_count,
        'link_count': link_count,
        'heading_count': heading_count
    }
