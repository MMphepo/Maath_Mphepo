'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, Clock, Eye, Heart, Tag, ArrowRight } from 'lucide-react'
import { BlogPost } from '@/types/blog'
import { formatDate, extractExcerpt } from '@/lib/blog-utils'

interface BlogCardProps {
  post: BlogPost
  index: number
}

const BlogCard = ({ post, index }: BlogCardProps) => {
  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      className="glass rounded-xl overflow-hidden group"
    >
      {/* Banner Image */}
      <div className="relative h-48 overflow-hidden">
        {post.bannerImage ? (
          <Image
            src={post.bannerImage}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
            <div className="text-4xl">📝</div>
          </div>
        )}
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-200/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Read Time Badge */}
        <div className="absolute top-4 right-4">
          <div className="flex items-center gap-1 px-3 py-1 bg-dark-200/90 backdrop-blur-sm rounded-full text-xs text-white">
            <Clock className="w-3 h-3" />
            {post.readTime} min read
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-md text-xs font-medium"
            >
              <Tag className="w-3 h-3" />
              {tag}
            </span>
          ))}
          {post.tags.length > 3 && (
            <span className="px-2 py-1 bg-dark-300 text-gray-400 rounded-md text-xs">
              +{post.tags.length - 3} more
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 group-hover:text-primary transition-colors duration-300">
          {post.title}
        </h3>

        {/* Description */}
        <p className="text-gray-400 text-sm mb-4 line-clamp-3">
          {extractExcerpt(post.description, 120)}
        </p>

        {/* Meta Info */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDate(post.createdAt)}
            </div>
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {post.views.toLocaleString()}
            </div>
            <div className="flex items-center gap-1">
              <Heart className="w-3 h-3" />
              {post.likes}
            </div>
          </div>
        </div>

        {/* Author */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full overflow-hidden">
            {post.author.avatar ? (
              <Image
                src={post.author.avatar}
                alt={post.author.name}
                width={32}
                height={32}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                {post.author.name.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <div className="text-white text-sm font-medium">{post.author.name}</div>
            <div className="text-gray-400 text-xs">{post.author.bio}</div>
          </div>
        </div>

        {/* Read More Button */}
        <Link href={`/blog/${post.slug}`}>
          <motion.div
            whileHover={{ x: 5 }}
            className="flex items-center gap-2 text-primary hover:text-secondary transition-colors duration-300 font-medium text-sm group/link"
          >
            Read Full Article
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/link:translate-x-1" />
          </motion.div>
        </Link>
      </div>

      {/* Hover Effect Border */}
      <div className="absolute inset-0 rounded-xl border border-transparent group-hover:border-primary/20 transition-colors duration-300 pointer-events-none" />
    </motion.article>
  )
}

export default BlogCard
