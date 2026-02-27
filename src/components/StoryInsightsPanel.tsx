import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { BarChart3, Users, X, Settings, Trash2 } from 'lucide-react'
import { StoryInsights, Story } from '../types'

interface Props {
  isOpen: boolean
  onClose: () => void
  insights: StoryInsights
  stories: Story[]
  activeStoryId?: string
  onSelectStory?: (id: string) => void
}

export default function StoryInsightsDrawer({
  isOpen,
  onClose,
  insights,
  stories,
  activeStoryId,
  onSelectStory,
}: Props) {
  const [page, setPage] = useState<'insights' | 'viewers'>('insights')

  const formatViews = (value?: number) => {
    const num = value || 0
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`
    if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`
    return `${num}`
  }

  // 👇 دقیقا از کد خودت
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
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28 }}
            className="fixed inset-0 bg-black text-white z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 pt-4 pb-3 flex items-center justify-between border-b border-zinc-800">
              <Settings size={22} className="text-zinc-400" />
              <X onClick={onClose} size={24} className="text-white" />
            </div>

            {/* Thumbnails */}
            <div className="px-4 py-3 border-b border-zinc-800">
              <div className="flex gap-3 overflow-x-auto">
                {stories.map((s) => {
                  const active = s.id === activeStoryId
                  return (
                    <button key={s.id} onClick={() => onSelectStory?.(s.id)}>
                      <div
                        className={`w-14 h-20 rounded-md overflow-hidden bg-zinc-800 ${
                          active ? 'ring-2 ring-white' : ''
                        }`}
                      >
                        {s.thumbnailUrl && (
                          <img
                            src={s.thumbnailUrl}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center px-4 border-b border-zinc-800">
              <button
                onClick={() => setPage('insights')}
                className={`py-3 ${
                  page === 'insights'
                    ? 'border-b-2 border-white text-white'
                    : 'text-zinc-500'
                }`}
              >
                <BarChart3 size={20} />
              </button>

              <button
                onClick={() => setPage('viewers')}
                className={`flex items-center gap-2 py-3 ml-6 ${
                  page === 'viewers'
                    ? 'border-b-2 border-white text-white'
                    : 'text-zinc-500'
                }`}
              >
                <Users size={20} />
                <span className="text-sm font-semibold">
                  {formatViews(insights.totalViews)}
                </span>
              </button>

              <Trash2 size={20} className="ml-auto text-zinc-500" />
            </div>

            {/* Pages */}
            <div className="relative w-full h-full overflow-hidden">
              <motion.div
                animate={{ x: page === 'insights' ? '0%' : '-100%' }}
                transition={{ duration: 0.35 }}
                className="flex w-[200%] h-full"
              >
                {/* INSIGHTS PAGE */}
                <div className="w-full overflow-y-auto px-4 py-6 pb-24">
                  <div className="space-y-6">
                    {overviewSections.map((section) => (
                      <div key={section.title}>
                        <h3 className="text-sm font-semibold mb-3 text-zinc-300">
                          {section.title}
                        </h3>
                        <div className="space-y-2 ml-2">
                          {section.items.map((item) => (
                            <div
                              key={item.label}
                              className="flex items-center justify-between text-sm"
                            >
                              <span className="text-zinc-400">
                                {item.label}
                              </span>
                              <span className="font-semibold text-white">
                                {item.value}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* VIEWERS PAGE */}
                <div className="w-full overflow-y-auto px-4 py-6 pb-24">
                  {insights.viewers.map((viewer, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="flex items-center justify-between py-3 border-b border-zinc-800"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden flex items-center justify-center">
                          {viewer.avatarUrl ? (
                            <img
                              src={viewer.avatarUrl}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-sm font-semibold text-zinc-400">
                              {viewer.name?.charAt(0)?.toUpperCase()}
                            </span>
                          )}
                        </div>

                        <span className="text-sm font-semibold">
                          {viewer.name}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}