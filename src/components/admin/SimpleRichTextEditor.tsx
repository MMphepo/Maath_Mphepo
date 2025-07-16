'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Quote, 
  Code, 
  Link, 
  Image as ImageIcon,
  Eye, 
  EyeOff,
  Upload,
  Loader2,
  AlertCircle
} from 'lucide-react'
import BlogContentRenderer from '../blog/BlogContentRenderer'

interface SimpleRichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  height?: number
  onImageUpload?: (file: File) => Promise<string>
  className?: string
}

const SimpleRichTextEditor = ({
  value,
  onChange,
  placeholder = "Start writing your blog post...",
  height = 400,
  onImageUpload,
  className = ""
}: SimpleRichTextEditorProps) => {
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const insertText = useCallback((before: string, after: string = '') => {
    const textarea = document.getElementById('content-editor') as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)
    
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end)
    onChange(newText)

    // Restore cursor position
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length)
    }, 0)
  }, [value, onChange])

  const handleImageUpload = async (file: File) => {
    if (!onImageUpload) {
      alert('Image upload is not configured')
      return
    }

    setIsUploading(true)
    setUploadError(null)

    try {
      const imageUrl = await onImageUpload(file)
      const imageMarkup = `\n![${file.name}](${imageUrl})\n`
      onChange(value + imageMarkup)
    } catch (error) {
      console.error('Image upload failed:', error)
      setUploadError('Failed to upload image. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      handleImageUpload(file)
    }
    e.target.value = ''
  }

  const toolbarButtons = [
    {
      icon: <Bold className="w-4 h-4" />,
      label: 'Bold',
      action: () => insertText('**', '**'),
    },
    {
      icon: <Italic className="w-4 h-4" />,
      label: 'Italic',
      action: () => insertText('*', '*'),
    },
    {
      icon: <Underline className="w-4 h-4" />,
      label: 'Underline',
      action: () => insertText('<u>', '</u>'),
    },
    {
      icon: <List className="w-4 h-4" />,
      label: 'Bullet List',
      action: () => insertText('\n- '),
    },
    {
      icon: <ListOrdered className="w-4 h-4" />,
      label: 'Numbered List',
      action: () => insertText('\n1. '),
    },
    {
      icon: <Quote className="w-4 h-4" />,
      label: 'Quote',
      action: () => insertText('\n> '),
    },
    {
      icon: <Code className="w-4 h-4" />,
      label: 'Code',
      action: () => insertText('`', '`'),
    },
    {
      icon: <Link className="w-4 h-4" />,
      label: 'Link',
      action: () => insertText('[', '](url)'),
    },
  ]

  const processContent = (content: string) => {
    // Convert markdown-like syntax to HTML
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      .replace(/^#### (.*$)/gm, '<h4>$1</h4>')
      .replace(/^##### (.*$)/gm, '<h5>$1</h5>')
      .replace(/^###### (.*$)/gm, '<h6>$1</h6>')
      .replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>')
      .replace(/^- (.*$)/gm, '<li>$1</li>')
      .replace(/^1\. (.*$)/gm, '<li>$1</li>')
      .replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" style="max-width: 100%; height: auto;" />')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>')
      .replace(/\n/g, '<br>')
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
      <div className="relative">
        {isPreviewMode ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="min-h-[400px] p-6 bg-dark-200/50 rounded-lg border border-dark-300"
          >
            <BlogContentRenderer content={processContent(value)} isPreview />
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-dark-200/50 border border-dark-300 rounded-lg overflow-hidden"
          >
            {/* Toolbar */}
            <div className="flex items-center gap-1 p-3 border-b border-dark-300 bg-dark-300/50">
              {toolbarButtons.map((button, index) => (
                <button
                  key={index}
                  onClick={button.action}
                  className="p-2 text-gray-400 hover:text-white hover:bg-dark-200 rounded transition-colors duration-300"
                  title={button.label}
                >
                  {button.icon}
                </button>
              ))}
              
              <div className="w-px h-6 bg-dark-300 mx-2" />
              
              <label className="p-2 text-gray-400 hover:text-white hover:bg-dark-200 rounded transition-colors duration-300 cursor-pointer">
                <ImageIcon className="w-4 h-4" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
            </div>

            {/* Text Area */}
            <textarea
              id="content-editor"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className="w-full p-4 bg-transparent text-white placeholder-gray-400 resize-none focus:outline-none"
              style={{ height: `${height}px` }}
            />
          </motion.div>
        )}
      </div>

      {/* Editor Tips */}
      <div className="mt-4 p-4 bg-dark-300/30 rounded-lg border border-dark-300">
        <h4 className="text-sm font-medium text-white mb-2">Formatting Tips:</h4>
        <ul className="text-xs text-gray-400 space-y-1">
          <li>• **bold text** for bold formatting</li>
          <li>• *italic text* for italic formatting</li>
          <li>• `code` for inline code</li>
          <li>• # Heading 1, ## Heading 2, etc.</li>
          <li>•  Quote for blockquotes</li>
          <li>• - List item for bullet lists</li>
          <li>• 1. List item for numbered lists</li>
          <li>• [Link text](URL) for links</li>
        </ul>
      </div>
    </div>
  )
}

export default SimpleRichTextEditor
