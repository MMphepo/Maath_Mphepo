'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Eye, Code, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react'
import BlogPostLayout from '@/components/blog/BlogPostLayout'
import RichTextEditor from '@/components/admin/RichTextEditor'
import { adminBlogAPI } from '@/lib/api/blog'
import { sanitizeContent, validateContent } from '@/lib/security/contentSanitizer'

const BlogTestPage = () => {
  const [testContent, setTestContent] = useState(`
    <h1>Test Blog Post</h1>
    <p>This is a <strong>test blog post</strong> to verify that content appears <em>identically</em> between the admin editor and public display.</p>
    
    <h2>Features to Test</h2>
    <ul>
      <li>Rich text formatting (bold, italic, underline)</li>
      <li>Headings (H1 through H6)</li>
      <li>Lists (ordered and unordered)</li>
      <li>Links and images</li>
      <li>Code blocks and inline code</li>
      <li>Tables and blockquotes</li>
    </ul>
    
    <h3>Code Example</h3>
    <pre><code class="language-javascript">
function hello() {
  console.log("Hello, World!");
  return "success";
}
    </code></pre>
    
    <p>Here's some <code>inline code</code> for testing.</p>
    
    <blockquote>
      <p>This is a blockquote to test quote formatting and styling consistency.</p>
    </blockquote>
    
    <h3>Table Example</h3>
    <table>
      <thead>
        <tr>
          <th>Feature</th>
          <th>Admin Editor</th>
          <th>Public Display</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Text Formatting</td>
          <td>✅ Working</td>
          <td>✅ Working</td>
          <td>✅ Consistent</td>
        </tr>
        <tr>
          <td>Code Highlighting</td>
          <td>✅ Working</td>
          <td>✅ Working</td>
          <td>✅ Consistent</td>
        </tr>
      </tbody>
    </table>
    
    <p>This test page helps ensure that what you see in the admin editor matches exactly what visitors see on the public blog.</p>
  `)

  const [testPost, setTestPost] = useState<any>(null)
  const [validationResult, setValidationResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [activeView, setActiveView] = useState<'editor' | 'preview' | 'comparison'>('editor')

  // Create test post object
  useEffect(() => {
    const createTestPost = () => {
      const sanitized = sanitizeContent(testContent)
      const validation = validateContent(testContent)
      
      setValidationResult(validation)
      setTestPost({
        id: 999,
        title: 'Content Consistency Test Post',
        slug: 'content-consistency-test',
        description: 'This is a test post to verify content consistency between admin editor and public display.',
        content: testContent,
        processed_content: sanitized,
        banner_image: null,
        tags: ['test', 'consistency', 'admin'],
        is_published: false,
        is_featured: false,
        views: 0,
        likes: 0,
        read_time: 3,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        author: {
          name: 'Test Author',
          bio: 'Testing content consistency',
          avatar: null
        },
        content_metadata: {
          word_count: testContent.replace(/<[^>]*>/g, '').split(/\s+/).length,
          reading_time: 3,
          image_count: 0,
          link_count: 0,
          heading_count: 3
        },
        table_of_contents: [
          { level: 1, id: 'test-blog-post', title: 'Test Blog Post' },
          { level: 2, id: 'features-to-test', title: 'Features to Test' },
          { level: 3, id: 'code-example', title: 'Code Example' },
          { level: 3, id: 'table-example', title: 'Table Example' }
        ]
      })
    }

    createTestPost()
  }, [testContent])

  const handleImageUpload = async (file: File): Promise<string> => {
    try {
      return await adminBlogAPI.uploadImage(file)
    } catch (error) {
      console.error('Image upload failed:', error)
      throw error
    }
  }

  const runConsistencyTest = async () => {
    setIsLoading(true)
    
    try {
      // Simulate API call to test content processing
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Validate content
      const validation = validateContent(testContent)
      setValidationResult(validation)
      
      // Update test post
      const sanitized = sanitizeContent(testContent)
      setTestPost((prev: any) => ({
        ...prev,
        content: testContent,
        processed_content: sanitized
      }))
      
    } catch (error) {
      console.error('Consistency test failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const views = [
    { id: 'editor', label: 'Rich Text Editor', icon: <Code className="w-4 h-4" /> },
    { id: 'preview', label: 'Public Preview', icon: <Eye className="w-4 h-4" /> },
    { id: 'comparison', label: 'Side by Side', icon: <CheckCircle className="w-4 h-4" /> }
  ]

  return (
    <div className="min-h-screen bg-dark-100">
      {/* Header */}
      <div className="bg-dark-200/50 border-b border-dark-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Content Consistency Test</h1>
              <p className="text-gray-400 mt-1">Verify that content appears identically in admin and public views</p>
            </div>

            <button
              onClick={runConsistencyTest}
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-green-600 transition-colors duration-300 disabled:opacity-50"
            >
              {isLoading ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <CheckCircle className="w-5 h-5" />
              )}
              Run Test
            </button>
          </div>
        </div>
      </div>

      {/* Validation Status */}
      {validationResult && (
        <div className="bg-dark-200/30 border-b border-dark-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className={`flex items-center gap-3 ${
              validationResult.isValid ? 'text-green-400' : 'text-red-400'
            }`}>
              {validationResult.isValid ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <span className="font-medium">
                {validationResult.isValid ? 'Content validation passed' : 'Content validation failed'}
              </span>
              {!validationResult.isValid && (
                <span className="text-sm">
                  ({validationResult.errors.length} errors)
                </span>
              )}
            </div>
            
            {!validationResult.isValid && (
              <div className="mt-2 space-y-1">
                {validationResult.errors.map((error: string, index: number) => (
                  <div key={index} className="text-sm text-red-300 ml-8">
                    • {error}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* View Tabs */}
      <div className="bg-dark-200/30 border-b border-dark-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {views.map((view) => (
              <button
                key={view.id}
                onClick={() => setActiveView(view.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-300 ${
                  activeView === view.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  {view.icon}
                  {view.label}
                </div>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          key={activeView}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeView === 'editor' && (
            <div className="space-y-6">
              <div className="bg-dark-200/30 border border-dark-300 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Rich Text Editor View</h2>
                <p className="text-gray-400 mb-6">
                  This is how content appears in the admin editor. Edit the content below to test consistency.
                </p>
                
                <RichTextEditor
                  value={testContent}
                  onChange={setTestContent}
                  onImageUpload={handleImageUpload}
                  height={600}
                />
              </div>
            </div>
          )}

          {activeView === 'preview' && testPost && (
            <div className="space-y-6">
              <div className="bg-dark-200/30 border border-dark-300 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Public Display View</h2>
                <p className="text-gray-400 mb-6">
                  This is how the content will appear to visitors on the public blog.
                </p>
              </div>
              
              <BlogPostLayout
                post={testPost}
                isPreview={true}
                showTOC={true}
                showStats={true}
              />
            </div>
          )}

          {activeView === 'comparison' && testPost && (
            <div className="space-y-6">
              <div className="bg-dark-200/30 border border-dark-300 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Side-by-Side Comparison</h2>
                <p className="text-gray-400 mb-6">
                  Compare the admin editor view with the public display to ensure consistency.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Editor View */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Admin Editor</h3>
                  <div className="bg-dark-200/30 border border-dark-300 rounded-lg overflow-hidden">
                    <RichTextEditor
                      value={testContent}
                      onChange={setTestContent}
                      onImageUpload={handleImageUpload}
                      height={500}
                    />
                  </div>
                </div>

                {/* Preview View */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Public Display</h3>
                  <div className="bg-dark-200/30 border border-dark-300 rounded-lg p-6 max-h-[500px] overflow-y-auto">
                    <BlogPostLayout
                      post={testPost}
                      isPreview={true}
                      showTOC={false}
                      showStats={false}
                      className="scale-75 origin-top-left"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default BlogTestPage
