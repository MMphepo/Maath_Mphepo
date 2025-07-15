'use client'

import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  Loader2, 
  AlertCircle, 
  CheckCircle,
  Copy,
  ExternalLink
} from 'lucide-react'

interface ImageUploadProps {
  onUpload: (file: File) => Promise<string>
  onSuccess?: (url: string) => void
  onError?: (error: string) => void
  accept?: string
  maxSize?: number // in MB
  className?: string
  multiple?: boolean
}

interface UploadedImage {
  id: string
  file: File
  url: string
  status: 'uploading' | 'success' | 'error'
  error?: string
  progress?: number
}

const ImageUpload = ({
  onUpload,
  onSuccess,
  onError,
  accept = "image/*",
  maxSize = 10,
  className = "",
  multiple = false
}: ImageUploadProps) => {
  const [images, setImages] = useState<UploadedImage[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): string | null => {
    // Check file type
    if (!file.type.startsWith('image/')) {
      return 'Please select a valid image file'
    }

    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      return `File size must be less than ${maxSize}MB`
    }

    // Check supported formats
    const supportedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!supportedFormats.includes(file.type)) {
      return 'Supported formats: JPEG, PNG, WebP, GIF'
    }

    return null
  }

  const processFiles = useCallback(async (files: FileList) => {
    const fileArray = Array.from(files)
    
    if (!multiple && fileArray.length > 1) {
      onError?.('Please select only one image')
      return
    }

    for (const file of fileArray) {
      const validationError = validateFile(file)
      if (validationError) {
        onError?.(validationError)
        continue
      }

      const imageId = Math.random().toString(36).substr(2, 9)
      const newImage: UploadedImage = {
        id: imageId,
        file,
        url: URL.createObjectURL(file),
        status: 'uploading',
        progress: 0
      }

      setImages(prev => [...prev, newImage])

      try {
        // Simulate upload progress
        const progressInterval = setInterval(() => {
          setImages(prev => prev.map(img => 
            img.id === imageId 
              ? { ...img, progress: Math.min((img.progress || 0) + 10, 90) }
              : img
          ))
        }, 200)

        const uploadedUrl = await onUpload(file)
        
        clearInterval(progressInterval)
        
        setImages(prev => prev.map(img => 
          img.id === imageId 
            ? { ...img, status: 'success', progress: 100, url: uploadedUrl }
            : img
        ))

        onSuccess?.(uploadedUrl)
      } catch (error) {
        setImages(prev => prev.map(img => 
          img.id === imageId 
            ? { ...img, status: 'error', error: error instanceof Error ? error.message : 'Upload failed' }
            : img
        ))
        
        onError?.(error instanceof Error ? error.message : 'Upload failed')
      }
    }
  }, [onUpload, onSuccess, onError, multiple, maxSize])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      processFiles(files)
    }
  }, [processFiles])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      processFiles(files)
    }
    // Reset input value to allow selecting the same file again
    e.target.value = ''
  }, [processFiles])

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const removeImage = (imageId: string) => {
    setImages(prev => {
      const imageToRemove = prev.find(img => img.id === imageId)
      if (imageToRemove && imageToRemove.url.startsWith('blob:')) {
        URL.revokeObjectURL(imageToRemove.url)
      }
      return prev.filter(img => img.id !== imageId)
    })
  }

  const copyImageUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      // You could add a toast notification here
    } catch (error) {
      console.error('Failed to copy URL:', error)
    }
  }

  const retryUpload = async (imageId: string) => {
    const image = images.find(img => img.id === imageId)
    if (!image) return

    setImages(prev => prev.map(img => 
      img.id === imageId 
        ? { ...img, status: 'uploading', progress: 0, error: undefined }
        : img
    ))

    try {
      const progressInterval = setInterval(() => {
        setImages(prev => prev.map(img => 
          img.id === imageId 
            ? { ...img, progress: Math.min((img.progress || 0) + 10, 90) }
            : img
        ))
      }, 200)

      const uploadedUrl = await onUpload(image.file)
      
      clearInterval(progressInterval)
      
      setImages(prev => prev.map(img => 
        img.id === imageId 
          ? { ...img, status: 'success', progress: 100, url: uploadedUrl }
          : img
      ))

      onSuccess?.(uploadedUrl)
    } catch (error) {
      setImages(prev => prev.map(img => 
        img.id === imageId 
          ? { ...img, status: 'error', error: error instanceof Error ? error.message : 'Upload failed' }
          : img
      ))
      
      onError?.(error instanceof Error ? error.message : 'Upload failed')
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
        className={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-300 ${
          isDragOver
            ? 'border-primary bg-primary/10'
            : 'border-dark-300 hover:border-primary/50 hover:bg-dark-200/30'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="flex flex-col items-center gap-4">
          <div className={`p-4 rounded-full transition-colors duration-300 ${
            isDragOver ? 'bg-primary/20' : 'bg-dark-300/50'
          }`}>
            <Upload className={`w-8 h-8 transition-colors duration-300 ${
              isDragOver ? 'text-primary' : 'text-gray-400'
            }`} />
          </div>

          <div>
            <p className="text-lg font-medium text-white mb-2">
              {isDragOver ? 'Drop images here' : 'Upload Images'}
            </p>
            <p className="text-gray-400 text-sm">
              Drag and drop images here, or click to select files
            </p>
            <p className="text-gray-500 text-xs mt-1">
              Supports JPEG, PNG, WebP, GIF (max {maxSize}MB each)
            </p>
          </div>
        </div>

        {isDragOver && (
          <div className="absolute inset-0 bg-primary/5 rounded-lg pointer-events-none" />
        )}
      </div>

      {/* Uploaded Images */}
      <AnimatePresence>
        {images.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3"
          >
            {images.map((image) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex items-center gap-4 p-4 bg-dark-200/30 border border-dark-300 rounded-lg"
              >
                {/* Image Preview */}
                <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-dark-300">
                  <img
                    src={image.url}
                    alt={image.file.name}
                    className="w-full h-full object-cover"
                  />
                  {image.status === 'uploading' && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Loader2 className="w-6 h-6 text-white animate-spin" />
                    </div>
                  )}
                </div>

                {/* Image Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{image.file.name}</p>
                  <p className="text-gray-400 text-sm">
                    {(image.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>

                  {/* Progress Bar */}
                  {image.status === 'uploading' && (
                    <div className="mt-2">
                      <div className="w-full bg-dark-300 rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${image.progress || 0}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        Uploading... {image.progress || 0}%
                      </p>
                    </div>
                  )}

                  {/* Error Message */}
                  {image.status === 'error' && (
                    <div className="mt-2 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-400" />
                      <p className="text-red-400 text-sm">{image.error}</p>
                    </div>
                  )}

                  {/* Success Message */}
                  {image.status === 'success' && (
                    <div className="mt-2 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <p className="text-green-400 text-sm">Upload successful</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {image.status === 'success' && (
                    <>
                      <button
                        onClick={() => copyImageUrl(image.url)}
                        className="p-2 text-gray-400 hover:text-white hover:bg-dark-300 rounded-lg transition-colors duration-300"
                        title="Copy URL"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => window.open(image.url, '_blank')}
                        className="p-2 text-gray-400 hover:text-white hover:bg-dark-300 rounded-lg transition-colors duration-300"
                        title="Open in new tab"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </>
                  )}

                  {image.status === 'error' && (
                    <button
                      onClick={() => retryUpload(image.id)}
                      className="px-3 py-1 bg-primary text-white text-sm rounded hover:bg-green-600 transition-colors duration-300"
                    >
                      Retry
                    </button>
                  )}

                  <button
                    onClick={() => removeImage(image.id)}
                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors duration-300"
                    title="Remove"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ImageUpload
