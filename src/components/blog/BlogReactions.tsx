'use client'

import { motion } from 'framer-motion'
import { Heart, ThumbsUp } from 'lucide-react'

interface BlogReactionsProps {
  isLiked: boolean
  likeCount: number
  onLike: () => void
}

const BlogReactions = ({ isLiked, likeCount, onLike }: BlogReactionsProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="flex items-center justify-center py-12 border-y border-dark-300"
    >
      <div className="text-center">
        <p className="text-gray-400 mb-6">Did you find this article helpful?</p>
        
        <motion.button
          onClick={onLike}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`flex items-center gap-3 px-8 py-4 rounded-xl font-medium transition-all duration-300 ${
            isLiked
              ? 'bg-primary text-white shadow-lg shadow-primary/25'
              : 'bg-dark-200 text-gray-300 hover:bg-primary hover:text-white hover:shadow-lg hover:shadow-primary/25'
          }`}
        >
          <motion.div
            animate={isLiked ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            <Heart 
              className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} 
            />
          </motion.div>
          
          <span>
            {isLiked ? 'Liked!' : 'Like this article'}
          </span>
          
          {likeCount > 0 && (
            <span className="px-2 py-1 bg-white/20 rounded-full text-sm">
              {likeCount}
            </span>
          )}
        </motion.button>

        {isLiked && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-primary text-sm mt-3"
          >
            Thank you for your feedback! 🎉
          </motion.p>
        )}
      </div>
    </motion.div>
  )
}

export default BlogReactions
