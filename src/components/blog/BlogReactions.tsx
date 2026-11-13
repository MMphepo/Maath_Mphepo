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
      className="flex items-center justify-center py-12 border-y border-border"
    >
      <div className="text-center">
        <p className="text-muted mb-6">Did you find this article helpful?</p>
        
        <motion.button
          onClick={onLike}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`flex items-center gap-3 px-8 py-4 rounded-xl font-medium transition-all duration-300 ${
            isLiked
              ? 'bg-blue text-white shadow-lg shadow-blue/25'
              : 'bg-stone text-muted hover:bg-blue hover:text-white hover:shadow-lg hover:shadow-blue/25'
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
            <span className="px-2 py-1 bg-stone/50 rounded-full text-sm">
              {likeCount}
            </span>
          )}
        </motion.button>

        {isLiked && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-blue text-sm mt-3"
          >
            Thank you for your feedback! 🎉
          </motion.p>
        )}
      </div>
    </motion.div>
  )
}

export default BlogReactions
