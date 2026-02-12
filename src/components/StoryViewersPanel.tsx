import { motion, AnimatePresence } from 'framer-motion'
import { X, MoreHorizontal, Reply, BarChart3, Users } from 'lucide-react'
import { StoryInsights } from '../types'

interface StoryViewersPanelProps {
  isOpen: boolean
  onClose: () => void
  insights: StoryInsights
  storyPreview?: string
}

export default function StoryViewersPanel({
  isOpen,
  onClose,
  insights,
  storyPreview,
}: StoryViewersPanelProps) {
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
            className="fixed bottom-0 left-0 right-0 bg-black rounded-t-3xl z-50 max-h-[90vh] overflow-y-auto"
          >
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1 bg-gray-700 rounded-full" />
            </div>

            {/* Header */}
            <div className="px-4 py-3 flex items-center justify-between border-b border-gray-800">
              <div className="flex items-center gap-3">
                <button onClick={onClose}>
                  <X size={24} />
                </button>
                {storyPreview && (
                  <div className="w-12 h-20 rounded bg-gray-800 overflow-hidden">
                    <img src={storyPreview} alt="Story" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="w-12 h-20 rounded bg-gray-800 flex items-center justify-center border-2 border-dashed border-gray-600">
                  <span className="text-2xl">📷</span>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-6 px-4 py-3 border-b border-gray-800">
              <button className="flex items-center gap-2">
                <BarChart3 size={20} className="text-gray-400" />
              </button>
              <button className="flex items-center gap-2">
                <Users size={20} className="text-white" />
                <span className="text-sm text-white">1</span>
              </button>
            </div>

            {/* Content */}
            <div className="px-4 py-4">
              <h2 className="text-lg font-semibold mb-4">Who viewed this story</h2>
              
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
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-instagram-purple to-instagram-pink flex items-center justify-center overflow-hidden">
                        {viewer.name === 'anonymous' ? (
                          <span className="text-white text-sm">?</span>
                        ) : viewer.name === 'yasinorca' ? (
                          <div className="w-full h-full bg-gradient-to-br from-green-500 via-white to-red-500 flex items-center justify-center">
                            <span className="text-xs">🇮🇷</span>
                          </div>
                        ) : (
                          <span className="text-white text-sm font-semibold">
                            {viewer.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <span className="text-sm font-medium">{viewer.name}</span>
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

