"""
Management command to test content processing functionality
"""

from django.core.management.base import BaseCommand
from django.utils import timezone
from blog.models import BlogPost
from blog.content_processors import process_blog_content, generate_table_of_contents, extract_content_metadata


class Command(BaseCommand):
    help = 'Test content processing functionality'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--post-id',
            type=int,
            help='Test specific blog post by ID'
        )
        parser.add_argument(
            '--create-sample',
            action='store_true',
            help='Create a sample blog post with rich content'
        )
        parser.add_argument(
            '--output-format',
            choices=['html', 'markdown'],
            default='html',
            help='Output format for processed content'
        )
    
    def handle(self, *args, **options):
        if options['create_sample']:
            self.create_sample_post()
        
        if options['post_id']:
            self.test_specific_post(options['post_id'], options['output_format'])
        else:
            self.test_all_posts(options['output_format'])
    
    def create_sample_post(self):
        """Create a sample blog post with rich content"""
        sample_content = """
        <h1>Welcome to My Blog</h1>
        <p>This is a <strong>sample blog post</strong> with <em>rich content</em> to test our content processing system.</p>
        
        <h2>Code Examples</h2>
        <p>Here's some Python code:</p>
        <pre><code class="language-python">
def hello_world():
    print("Hello, World!")
    return "success"
        </code></pre>
        
        <p>And some inline code: <code>console.log('Hello')</code></p>
        
        <h2>Lists and Links</h2>
        <ul>
            <li>First item with <a href="https://example.com">external link</a></li>
            <li>Second item with <a href="/internal">internal link</a></li>
            <li>Third item</li>
        </ul>
        
        <h3>Blockquote</h3>
        <blockquote>
            <p>This is a blockquote with some important information.</p>
        </blockquote>
        
        <h3>Table</h3>
        <table>
            <thead>
                <tr>
                    <th>Feature</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Rich Text Editor</td>
                    <td>✅ Complete</td>
                </tr>
                <tr>
                    <td>Content Processing</td>
                    <td>✅ Complete</td>
                </tr>
            </tbody>
        </table>
        
        <h2>Images</h2>
        <p>Here would be an image:</p>
        <img src="/media/sample-image.jpg" alt="Sample Image" title="This is a sample image" />
        
        <hr />
        
        <p>That's all for this sample post!</p>
        """
        
        post = BlogPost.objects.create(
            title="Sample Rich Content Post",
            slug="sample-rich-content-post",
            description="A sample blog post demonstrating rich content processing capabilities.",
            content=sample_content,
            meta_description="Test post for content processing system",
            is_published=True,
            author_name="Test Author"
        )
        
        self.stdout.write(
            self.style.SUCCESS(f'Created sample post with ID: {post.id}')
        )
        
        return post
    
    def test_specific_post(self, post_id, output_format):
        """Test content processing for a specific post"""
        try:
            post = BlogPost.objects.get(id=post_id)
            self.stdout.write(f'Testing post: {post.title}')
            self.process_and_display(post, output_format)
        except BlogPost.DoesNotExist:
            self.stdout.write(
                self.style.ERROR(f'Blog post with ID {post_id} not found')
            )
    
    def test_all_posts(self, output_format):
        """Test content processing for all posts"""
        posts = BlogPost.objects.all()[:5]  # Limit to first 5 posts
        
        if not posts:
            self.stdout.write(
                self.style.WARNING('No blog posts found. Use --create-sample to create one.')
            )
            return
        
        for post in posts:
            self.stdout.write(f'\n{"="*50}')
            self.stdout.write(f'Testing post: {post.title}')
            self.stdout.write(f'{"="*50}')
            self.process_and_display(post, output_format)
    
    def process_and_display(self, post, output_format):
        """Process and display content for a blog post"""
        if not post.content:
            self.stdout.write(
                self.style.WARNING('Post has no content to process')
            )
            return
        
        # Process content
        processed_content = process_blog_content(post.content, output_format=output_format)
        
        # Generate table of contents
        toc = generate_table_of_contents(post.content)
        
        # Extract metadata
        metadata = extract_content_metadata(post.content)
        
        # Display results
        self.stdout.write(f'\nOriginal content length: {len(post.content)} characters')
        self.stdout.write(f'Processed content length: {len(processed_content)} characters')
        
        self.stdout.write(f'\nContent Metadata:')
        for key, value in metadata.items():
            self.stdout.write(f'  {key}: {value}')
        
        if toc:
            self.stdout.write(f'\nTable of Contents:')
            for item in toc:
                indent = '  ' * (item['level'] - 1)
                self.stdout.write(f'{indent}- {item["title"]} (#{item["id"]})')
        else:
            self.stdout.write('\nNo headings found for table of contents')
        
        # Show first 200 characters of processed content
        self.stdout.write(f'\nProcessed content preview ({output_format}):')
        self.stdout.write('-' * 40)
        preview = processed_content[:200]
        if len(processed_content) > 200:
            preview += '...'
        self.stdout.write(preview)
        self.stdout.write('-' * 40)
        
        # Test serialization compatibility
        self.test_serialization_compatibility(post)
    
    def test_serialization_compatibility(self, post):
        """Test that the content works with serializers"""
        try:
            from blog.serializers import BlogPostDetailSerializer
            
            # Test serialization
            serializer = BlogPostDetailSerializer(post, context={'output_format': 'html'})
            data = serializer.data
            
            self.stdout.write(f'\nSerialization test: ✅ SUCCESS')
            self.stdout.write(f'Serialized fields: {list(data.keys())}')
            
            # Check specific fields
            if 'processed_content' in data:
                self.stdout.write(f'Processed content field: ✅ Present')
            if 'table_of_contents' in data:
                self.stdout.write(f'TOC field: ✅ Present ({len(data["table_of_contents"])} items)')
            if 'content_metadata' in data:
                self.stdout.write(f'Metadata field: ✅ Present')
                
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Serialization test failed: {str(e)}')
            )
