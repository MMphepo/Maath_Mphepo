'use client'

import { motion } from 'framer-motion'
import { 
  Clock, 
  Type, 
  Image as ImageIcon, 
  Link, 
  Hash,
  BarChart3
} from 'lucide-react'

interface ContentMetadata {
  word_count: number
  reading_time: number
  image_count: number
  link_count: number
  heading_count: number
}

interface ContentStatsProps {
  metadata: ContentMetadata
  className?: string
  showDetailed?: boolean
}

const ContentStats = ({ 
  metadata, 
  className = "",
  showDetailed = false 
}: ContentStatsProps) => {
  const stats = [
    {
      icon: <Type className="w-4 h-4" />,
      label: 'Words',
      value: metadata.word_count.toLocaleString(),
      color: 'text-blue',
      bgColor: 'bg-blue/20'
    },
    {
      icon: <Clock className="w-4 h-4" />,
      label: 'Read Time',
      value: `${metadata.reading_time} min`,
      color: 'text-blue',
      bgColor: 'bg-blue/20'
    },
    {
      icon: <ImageIcon className="w-4 h-4" />,
      label: 'Images',
      value: metadata.image_count.toString(),
      color: 'text-blue',
      bgColor: 'bg-blue/20'
    },
    {
      icon: <Link className="w-4 h-4" />,
      label: 'Links',
      value: metadata.link_count.toString(),
      color: 'text-blue',
      bgColor: 'bg-blue/20'
    },
    {
      icon: <Hash className="w-4 h-4" />,
      label: 'Headings',
      value: metadata.heading_count.toString(),
      color: 'text-blue',
      bgColor: 'bg-blue/20'
    }
  ]

  if (!showDetailed) {
    // Simple inline stats
    return (
      <div className={`flex items-center gap-6 text-sm text-muted ${className}`}>
        <span className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          {metadata.reading_time} min read
        </span>
        <span className="flex items-center gap-1">
          <Type className="w-4 h-4" />
          {metadata.word_count.toLocaleString()} words
        </span>
        {metadata.image_count > 0 && (
          <span className="flex items-center gap-1">
            <ImageIcon className="w-4 h-4" />
            {metadata.image_count} images
          </span>
        )}
      </div>
    )
  }

  // Detailed stats card
  return (
    <div className={`bg-stone border border-border rounded-lg ${className}`}>
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue" />
          <h3 className="font-semibold text-ink">Content Statistics</h3>
        </div>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="flex items-center gap-3 p-3 bg-stone/30 rounded-lg"
            >
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <div className={stat.color}>
                  {stat.icon}
                </div>
              </div>
              
              <div>
                <p className="text-lg font-semibold text-ink">{stat.value}</p>
                <p className="text-sm text-muted">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Reading difficulty indicator */}
        <div className="mt-6 p-4 bg-stone/30 rounded-lg">
          <h4 className="text-sm font-medium text-ink mb-3">Reading Analysis</h4>
          
          <div className="space-y-3">
            {/* Reading level */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">Reading Level</span>
              <span className="text-sm text-ink">
                {metadata.word_count < 500 ? 'Quick Read' :
                 metadata.word_count < 1500 ? 'Medium Read' : 'Long Read'}
              </span>
            </div>

            {/* Content density */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">Content Density</span>
              <span className="text-sm text-ink">
                {metadata.heading_count / Math.max(1, Math.ceil(metadata.word_count / 100)) > 0.1 
                  ? 'Well Structured' : 'Dense'}
              </span>
            </div>

            {/* Visual content */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">Visual Content</span>
              <span className="text-sm text-ink">
                {metadata.image_count === 0 ? 'Text Only' :
                 metadata.image_count < 3 ? 'Light Visual' : 'Rich Visual'}
              </span>
            </div>
          </div>
        </div>

        {/* Engagement prediction */}
        <div className="mt-4 p-4 bg-blue/10 border border-blue/20 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-blue rounded-full"></div>
            <span className="text-sm font-medium text-blue">Engagement Prediction</span>
          </div>
          
          <p className="text-sm text-muted">
            {getEngagementPrediction(metadata)}
          </p>
        </div>
      </div>
    </div>
  )
}

// Helper function to predict engagement based on content stats
const getEngagementPrediction = (metadata: ContentMetadata): string => {
  const { word_count, reading_time, image_count, heading_count } = metadata
  
  let score = 0
  let factors = []

  // Optimal word count (800-2000 words)
  if (word_count >= 800 && word_count <= 2000) {
    score += 2
    factors.push('optimal length')
  } else if (word_count < 500) {
    score -= 1
    factors.push('might be too short')
  } else if (word_count > 3000) {
    score -= 1
    factors.push('might be too long')
  }

  // Good structure (headings every 200-300 words)
  const headingRatio = word_count / Math.max(1, heading_count)
  if (headingRatio >= 200 && headingRatio <= 400) {
    score += 2
    factors.push('well structured')
  } else if (headingRatio > 500) {
    score -= 1
    factors.push('needs more headings')
  }

  // Visual content
  if (image_count > 0) {
    score += 1
    factors.push('includes visuals')
  }

  // Reading time sweet spot (3-8 minutes)
  if (reading_time >= 3 && reading_time <= 8) {
    score += 1
    factors.push('good reading time')
  }

  // Generate prediction
  if (score >= 4) {
    return `High engagement potential! This post has ${factors.slice(0, 2).join(' and ')}.`
  } else if (score >= 2) {
    return `Good engagement potential. Consider ${factors.includes('needs more headings') ? 'adding more headings' : 'optimizing structure'}.`
  } else {
    return `Moderate engagement potential. ${factors.includes('might be too short') ? 'Consider expanding the content' : 'Consider restructuring for better readability'}.`
  }
}

export default ContentStats
