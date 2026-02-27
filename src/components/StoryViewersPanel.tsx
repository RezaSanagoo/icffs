import { motion, AnimatePresence } from 'framer-motion'
import { X, MoreHorizontal, Reply, BarChart3, Users, Settings, Trash2 } from 'lucide-react'
import { Story, StoryInsights } from '../types'

interface StoryViewersPanelProps {
  isOpen: boolean
  onClose: () => void
  insights: StoryInsights
  storyPreview?: string
  onSwitchToInsights?: () => void
  stories?: Story[]
  activeStoryId?: string
  onSelectStory?: (storyId: string) => void
}

export default function StoryViewersPanel({
  isOpen,
  onClose,
  insights,
  storyPreview,
  onSwitchToInsights,
  stories = [],
  activeStoryId,
  onSelectStory,
}: StoryViewersPanelProps) {
  const formatViews = (value?: number) => {
    const num = value || 0
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`
    if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`
    return `${num}`
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 z-50"
          />

          {/* Panel */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-0 bg-black text-white z-50 overflow-y-auto"
          >
            {/* Header */}
            <div className="px-4 pt-3 pb-2 flex items-center justify-between">
              <button className="text-black" aria-label="Settings">
                <Settings size={22} />
              </button>
              <button onClick={onClose} className="text-black" aria-label="Close">
                <X size={24} />
              </button>
            </div>

            {/* Story thumbnails row */}
            <div className="px-4 pb-2">
              <div className="flex gap-3 overflow-x-auto scrollbar-hide py-2">
                {stories.map((s) => {
                  const isActive = !!activeStoryId && s.id === activeStoryId
                  return (
                    <button
                      key={s.id}
                      className="relative flex-shrink-0"
                      onClick={() => onSelectStory?.(s.id)}
                    >
                      <div
                        className={`w-14 h-20 rounded-md overflow-hidden bg-gray-200 ${
                          isActive ? 'ring-2 ring-black' : ''
                        }`}
                      >
                        {s.thumbnailUrl ? (
                          <img
                            src={s.thumbnailUrl}
                            alt="Story thumbnail"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-300" />
                        )}
                      </div>
                      {isActive && (
                        <div className="absolute left-1/2 -bottom-2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-gray-50 drop-shadow" />
                      )}
                    </button>
                  )
                })}
                {stories.length === 0 && storyPreview && (
                  <div className="w-14 h-20 rounded-md overflow-hidden bg-gray-200">
                    <img src={storyPreview} alt="Story" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            {/* Tabs / insights & viewers toggle */}
            <div className="flex items-center px-4 border-b border-gray-200">
              <button
                className="flex items-center gap-2 py-3 text-gray-500"
                onClick={onSwitchToInsights}
              >
                <BarChart3 size={20} className="text-gray-400" />
              </button>
              <button className="flex items-center gap-2 py-3 border-b-2 border-blue-500 text-blue-600">
                <Users size={20} className="text-blue-600" />
                <span className="text-sm font-semibold">
                  {formatViews(insights.totalViews)}
                </span>
              </button>
              <div className="ml-auto py-3 text-gray-500">
                <Trash2 size={20} />
              </div>
            </div>

            {/* Content */}
            <div className="px-4 py-3">
              
              <div className="space-y-3">
                {insights.viewers.map((viewer, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between py-2"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                        {viewer.avatarUrl ? (
                          <img
                            src={viewer.avatarUrl}
                            alt={viewer.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                        ) : (
                          <span className="text-gray-500 text-sm font-semibold">
                            {(viewer.name || '?').charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col leading-tight">
                        <span className="text-sm font-semibold text-black">
                          {viewer.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {viewer.name}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MoreHorizontal size={20} className="text-gray-400" />
                      <Reply size={20} className="text-gray-400 rotate-180" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

