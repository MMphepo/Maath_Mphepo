'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import {
  Image as ImageIcon,
  Code,
  Table,
  Eye,
  EyeOff,
  Upload,
  Loader2,
  AlertCircle
} from 'lucide-react'

// Extend Window interface for hljs
declare global {
  interface Window {
    hljs?: any
  }
}

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(
  async () => {
    // Import Quill modules
    const { default: ReactQuill } = await import('react-quill')

    // Register Quill modules if not already registered
    if (typeof window !== 'undefined') {
      const Quill = (await import('quill')).default

      // Only register if not already registered
      if (!Quill.imports['modules/syntax']) {
        // Import and register syntax highlighting (optional)
        try {
          const { default: hljs } = await import('highlight.js')
          window.hljs = hljs
        } catch (e) {
          console.warn('highlight.js not available, syntax highlighting disabled')
        }
      }
    }

    return ReactQuill
  },
  {
    ssr: false,
    loading: () => <div className="h-96 bg-dark-200/50 rounded-lg animate-pulse" />
  }
)

import 'react-quill/dist/quill.snow.css'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  height?: number
  onImageUpload?: (file: File) => Promise<string>
  className?: string
}

const RichTextEditor = ({
  value,
  onChange,
  placeholder = "Start writing your blog post...",
  height = 400,
  onImageUpload,
  className = ""
}: RichTextEditorProps) => {
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  // Custom toolbar configuration (simplified to avoid module issues)
  const toolbarOptions = [
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    [{ 'size': ['small', false, 'large', 'huge'] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'script': 'sub'}, { 'script': 'super' }],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'indent': '-1'}, { 'indent': '+1' }],
    [{ 'align': [] }],
    ['blockquote', 'code-block'],
    ['link', 'image'],
    ['clean']
  ]

  // Quill modules configuration (simplified)
  const modules = {
    toolbar: {
      container: toolbarOptions,
      handlers: {
        image: handleImageUpload
      }
    },
    clipboard: {
      matchVisual: false,
    },
    history: {
      delay: 1000,
      maxStack: 100,
      userOnly: true
    }
  }

  // Quill formats (simplified)
  const formats = [
    'header', 'size',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'script',
    'list', 'bullet', 'indent',
    'align',
    'blockquote', 'code-block',
    'link', 'image'
  ]

  // Handle image upload
  async function handleImageUpload() {
    if (!onImageUpload) {
      alert('Image upload is not configured')
      return
    }

    const input = document.createElement('input')
    input.setAttribute('type', 'file')
    input.setAttribute('accept', 'image/*')
    input.click()

    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) return

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setUploadError('Please select a valid image file')
        return
      }

      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        setUploadError('Image size must be less than 10MB')
        return
      }

      setIsUploading(true)
      setUploadError(null)

      try {
        const imageUrl = await onImageUpload(file)

        // Insert image into editor by updating the content
        const imageMarkup = `<img src="${imageUrl}" alt="${file.name}" style="max-width: 100%; height: auto;" />`
        onChange(value + imageMarkup)
      } catch (error) {
        console.error('Image upload failed:', error)
        setUploadError('Failed to upload image. Please try again.')
      } finally {
        setIsUploading(false)
      }
    }
  }



  // Handle drag and drop
  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    
    if (!onImageUpload) return

    const files = Array.from(e.dataTransfer.files)
    const imageFiles = files.filter(file => file.type.startsWith('image/'))

    if (imageFiles.length === 0) return

    setIsUploading(true)
    setUploadError(null)

    try {
      for (const file of imageFiles) {
        if (file.size > 10 * 1024 * 1024) {
          setUploadError(`${file.name} is too large (max 10MB)`)
          continue
        }

        const imageUrl = await onImageUpload(file)

        // Insert image into editor by updating the content
        const imageMarkup = `<img src="${imageUrl}" alt="${file.name}" style="max-width: 100%; height: auto;" />`
        onChange(value + imageMarkup)
      }
    } catch (error) {
      console.error('Image upload failed:', error)
      setUploadError('Failed to upload images. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }, [onImageUpload])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  // Preview content rendering
  const renderPreview = () => {
    return (
      <div 
        className="prose prose-invert prose-lg max-w-none p-6 min-h-[400px] bg-dark-200/50 rounded-lg border border-dark-300"
        dangerouslySetInnerHTML={{ __html: value }}
      />
    )
  }

  return (
    <div className={`rich-text-editor ${className}`}>
      {/* Editor Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-white">Content Editor</h3>
          {isUploading && (
            <div className="flex items-center gap-2 text-primary">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Uploading...</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-300 ${
              isPreviewMode 
                ? 'bg-primary text-white' 
                : 'bg-dark-300 text-gray-300 hover:bg-dark-200'
            }`}
          >
            {isPreviewMode ? (
              <>
                <EyeOff className="w-4 h-4" />
                Edit
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                Preview
              </>
            )}
          </button>
        </div>
      </div>

      {/* Upload Error */}
      {uploadError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-3 mb-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400"
        >
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">{uploadError}</span>
          <button
            onClick={() => setUploadError(null)}
            className="ml-auto text-red-400 hover:text-red-300"
          >
            ×
          </button>
        </motion.div>
      )}

      {/* Editor/Preview Container */}
      <div 
        className="relative"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {isPreviewMode ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {renderPreview()}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="quill-container"
          >
            <ReactQuill
              theme="snow"
              value={value}
              onChange={onChange}
              placeholder={placeholder}
              modules={modules}
              formats={formats}
              style={{ height: `${height}px` }}
            />
          </motion.div>
        )}

        {/* Drag overlay */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="w-full h-full border-2 border-dashed border-transparent transition-colors duration-300 rounded-lg" />
        </div> 
      </div>

      {/* Editor Tips */}
      <div className="mt-4 p-4 bg-dark-300/30 rounded-lg border border-dark-300">
        <h4 className="text-sm font-medium text-white mb-2">Editor Tips:</h4>
        <ul className="text-xs text-gray-400 space-y-1">
          <li>• Drag and drop images directly into the editor</li>
          <li>• Use Ctrl+Z/Cmd+Z to undo changes</li>
          <li>• Use the preview mode to see how your content will look</li>
          <li>• Supported image formats: JPEG, PNG, WebP (max 10MB)</li>
          <li>• Use the toolbar for text formatting and styling</li>
        </ul>
      </div>
    </div>
  )
}

export default RichTextEditor
