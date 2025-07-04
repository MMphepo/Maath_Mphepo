'use client'

import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'

interface BlogPaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

const BlogPagination = ({ currentPage, totalPages, onPageChange }: BlogPaginationProps) => {
  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisiblePages = 5

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Always show first page
      pages.push(1)

      if (currentPage > 3) {
        pages.push('...')
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) {
          pages.push(i)
        }
      }

      if (currentPage < totalPages - 2) {
        pages.push('...')
      }

      // Always show last page
      if (!pages.includes(totalPages)) {
        pages.push(totalPages)
      }
    }

    return pages
  }

  const pageNumbers = getPageNumbers()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="flex justify-center items-center gap-2 mt-12"
    >
      {/* Previous Button */}
      <motion.button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        whileHover={{ scale: currentPage === 1 ? 1 : 1.05 }}
        whileTap={{ scale: currentPage === 1 ? 1 : 0.95 }}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
          currentPage === 1
            ? 'bg-dark-300 text-gray-500 cursor-not-allowed'
            : 'bg-dark-200 text-white hover:bg-primary hover:shadow-lg hover:shadow-primary/25'
        }`}
      >
        <ChevronLeft className="w-4 h-4" />
        Previous
      </motion.button>

      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {pageNumbers.map((page, index) => (
          <motion.div key={`${page}-${index}`}>
            {page === '...' ? (
              <div className="flex items-center justify-center w-10 h-10 text-gray-500">
                <MoreHorizontal className="w-4 h-4" />
              </div>
            ) : (
              <motion.button
                onClick={() => onPageChange(page as number)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`w-10 h-10 rounded-lg font-medium transition-all duration-300 ${
                  currentPage === page
                    ? 'bg-primary text-white shadow-lg shadow-primary/25'
                    : 'bg-dark-200 text-gray-300 hover:bg-dark-100 hover:text-white'
                }`}
              >
                {page}
              </motion.button>
            )}
          </motion.div>
        ))}
      </div>

      {/* Next Button */}
      <motion.button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        whileHover={{ scale: currentPage === totalPages ? 1 : 1.05 }}
        whileTap={{ scale: currentPage === totalPages ? 1 : 0.95 }}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
          currentPage === totalPages
            ? 'bg-dark-300 text-gray-500 cursor-not-allowed'
            : 'bg-dark-200 text-white hover:bg-primary hover:shadow-lg hover:shadow-primary/25'
        }`}
      >
        Next
        <ChevronRight className="w-4 h-4" />
      </motion.button>

      {/* Page Info */}
      <div className="ml-4 text-sm text-gray-400">
        Page {currentPage} of {totalPages}
      </div>
    </motion.div>
  )
}

export default BlogPagination
