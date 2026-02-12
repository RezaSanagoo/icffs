import { motion, AnimatePresence } from 'framer-motion'
import { BarChart3, Users } from 'lucide-react'
import { useState } from 'react'
import { StoryInsights } from '../types'

interface StoryInsightsPanelProps {
  isOpen: boolean
  onClose: () => void
  insights: StoryInsights
  storyPreview?: string
}

export default function StoryInsightsPanel({
  isOpen,
  onClose,
  insights,
  storyPreview,
}: StoryInsightsPanelProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'viewers'>('overview')

  const overviewSections = [
    {
      title: 'Overview',
      items: [
        { label: 'Views', value: insights.totalViews || 0 },
        { label: 'Accounts Reached', value: insights.reach || 0 },
        { label: 'Impressions', value: insights.impressions || 0 },
      ]
    },
    {
      title: 'Viewers',
      items: [
        { label: 'Total Viewers', value: insights.uniqueViewers || 0 },
      ]
    },
    {
      title: 'Reach Breakdown',
      items: [
        { label: 'Followers', value: insights.followersReach || Math.floor((insights.reach || 0) * 0.8) },
        { label: 'Non-Followers', value: insights.nonFollowersReach || Math.floor((insights.reach || 0) * 0.2) },
      ]
    },
    {
      title: 'Interactions',
      items: [
        { label: 'Likes', value: 0 },
        { label: 'Replies', value: 0 },
        { label: 'Shares', value: 0 },
      ]
    },
    {
      title: 'Navigation',
      items: [
        { label: 'Forward', value: 0 },
        { label: 'Back', value: 0 },
        { label: 'Next Story', value: 0 },
        { label: 'Exited', value: 0 },
      ]
    },
    {
      title: 'Profile Activity',
      items: [
        { label: 'Profile Visits', value: 0 },
        { label: 'Follows', value: 0 },
      ]
    },
  ]

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
            className="fixed bottom-0 left-0 right-0 bg-black rounded-t-3xl z-50 max-h-[80vh] overflow-y-auto"
          >
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1 bg-gray-700 rounded-full" />
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-8 px-4 py-3 border-b border-gray-800 sticky top-0 bg-black">
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex items-center gap-2 pb-3 transition ${
                  activeTab === 'overview'
                    ? 'border-b-2 border-blue-500 text-blue-500'
                    : 'text-gray-400'
                }`}
              >
                <BarChart3 size={20} />
                <span className="text-sm">Insights</span>
              </button>
              <button
                onClick={() => setActiveTab('viewers')}
                className={`flex items-center gap-2 pb-3 transition ${
                  activeTab === 'viewers'
                    ? 'border-b-2 border-blue-500 text-blue-500'
                    : 'text-gray-400'
                }`}
              >
                <Users size={20} />
                <span className="text-sm">Viewers</span>
              </button>
            </div>

            {/* Content */}
            <div className="px-4 py-4 pb-8">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {overviewSections.map((section) => (
                    <div key={section.title}>
                      <h3 className="text-sm font-semibold mb-3 text-white">{section.title}</h3>
                      <div className="space-y-2 ml-2">
                        {section.items.map((item) => (
                          <div
                            key={item.label}
                            className="flex items-center justify-between text-sm"
                          >
                            <span className="text-gray-400">{item.label}</span>
                            <span className="font-semibold text-white">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Viewers Tab */}
              {activeTab === 'viewers' && (
                <div>
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold mb-2 text-white">
                      Total Viewers ({insights.uniqueViewers || 0})
                    </h3>
                  </div>

                  {insights.viewers && insights.viewers.length > 0 ? (
                    <div className="space-y-3">
                      {insights.viewers.map((viewer) => (
                        <div
                          key={viewer.id}
                          className="flex items-center gap-3 py-2 border-b border-gray-800/50"
                        >
                          {viewer.avatarUrl ? (
                            <img
                              src={viewer.avatarUrl}
                              alt={viewer.name}
                              className="w-10 h-10 rounded-full flex-shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
                              <span className="text-xs text-gray-400">
                                {viewer.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <div className="flex-1">
                            <p className="text-sm text-white font-medium">{viewer.name}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-400 text-sm">No viewers yet</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
