import { motion, AnimatePresence } from 'framer-motion'
import { useState, useRef } from 'react'
import { BarChart3, Users, X, Settings, Trash2 } from 'lucide-react'
import { StoryInsights, Story } from '../types'

interface Props {
  isOpen: boolean
  onClose: () => void
  insights?: StoryInsights
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
const MOCK_INSIGHTS: StoryInsights = {
  totalViews: 1243,
  reach: 980,
  impressions: 1560,
  uniqueViewers: 870,
  followersReach: 780,
  nonFollowersReach: 200,
  viewsTimeline: [
    { time: '0-1h', count: 300 },
    { time: '1-2h', count: 250 },
  ],
  viewers: [
    { id: 1, name: 'ali_dev', avatarUrl: '' },
    { id: 2, name: 'sara_ui', avatarUrl: '' },
    { id: 3, name: 'mohammad.codes', avatarUrl: '' },
    { id: 4, name: 'parisa.design', avatarUrl: '' },
    { id: 5, name: 'test_user', avatarUrl: '' },
  ],
}
// const safeInsights: StoryInsights = insights ?? MOCK_INSIGHTS
const safeInsights: StoryInsights = MOCK_INSIGHTS
  const [page, setPage] = useState<'insights' | 'viewers'>('insights')
  const containerRef = useRef<HTMLDivElement>(null)



  const formatViews = (v?: number) => {
    const n = v || 0
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
    return n
  }

  const overviewSections = [
    {
      title: 'Overview',
      items: [
        { label: 'Views', value: safeInsights.totalViews },
        { label: 'Accounts Reached', value: safeInsights.reach },
        { label: 'Impressions', value: safeInsights.impressions },
      ],
    },
    {
      title: 'Viewers',
      items: [
        { label: 'Total Viewers', value: safeInsights.uniqueViewers },
      ],
    },
    {
      title: 'Reach Breakdown',
      items: [
        { label: 'Followers', value: safeInsights.followersReach },
        { label: 'Non-Followers', value: safeInsights.nonFollowersReach },
      ],
    },
    {
      title: 'Interactions',
      items: [
        { label: 'Likes', value: 24 },
        { label: 'Replies', value: 6 },
        { label: 'Shares', value: 3 },
      ],
    },
    {
      title: 'Navigation',
      items: [
        { label: 'Forward', value: 110 },
        { label: 'Back', value: 18 },
        { label: 'Next Story', value: 9 },
        { label: 'Exited', value: 14 },
      ],
    },
    {
      title: 'Profile Activity',
      items: [
        { label: 'Profile Visits', value: 32 },
        { label: 'Follows', value: 4 },
      ],
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

            {/* Story Thumbnails */}
            <div className="px-4 border-b min-h-36 border-zinc-800">
              <div className="flex gap-3 justify-center min-h-36 scrollbar-hide">
                {stories.map((s) => {
                  const active = s.id === activeStoryId
                  return (
                    <button key={s.id} onClick={() => onSelectStory?.(s.id)}>
                      <div
                        className={`w-9 h-16 scale-125 rounded-md overflow-hidden bg-zinc-800 ${
                          active ? 'scale-150' : ''
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
                className={`flex items-center gap-2 py-3 ${
                  page === 'insights'
                    ? 'text-white border-b-2 border-white'
                    : 'text-zinc-500'
                }`}
              >
                <BarChart3 size={20} />
              </button>

              <button
                onClick={() => setPage('viewers')}
                className={`flex items-center gap-2 py-3 ml-6 ${
                  page === 'viewers'
                    ? 'text-white border-b-2 border-white'
                    : 'text-zinc-500'
                }`}
              >
                <Users size={20} />
                <span className="text-sm font-semibold">
                  {formatViews(safeInsights.totalViews)}
                </span>
              </button>

              <Trash2 size={20} className="ml-auto text-zinc-500" />
            </div>

            {/* Pages Wrapper */}
            <div className="relative w-full h-full overflow-hidden">
  <motion.div
    animate={{ x: page === 'insights' ? '0%' : '-50%' }}
    transition={{ duration: 0.35 }}
    className="flex w-[200%] h-full"
  >
                {/* Insights Page */}
                <div className="w-1/2 flex-shrink-0 px-4 py-4 pb-8 overflow-y-auto">
              <div className="space-y-6">
                {overviewSections.map((section) => (
                  <div key={section.title}>
                    <h3 className="text-sm font-semibold mb-3 text-black">
                      {section.title}
                    </h3>
                    <div className="space-y-2 ml-2">
                      {section.items.map((item) => (
                        <div
                          key={item.label}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="text-gray-500">{item.label}</span>
                          <span className="font-semibold text-gray-200">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              </div>

                {/* Viewers Page */}
                <div className="w-1/2 flex-shrink-0 px-4 py-4 pb-8 overflow-y-auto">
                  {safeInsights.viewers.map((v, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="flex items-center justify-between py-3 border-b border-zinc-800"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden" />
                        <span className="text-sm font-semibold">
                          {v.name}
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

function Section({ title, children }: any) {
  return (
    <div>
      <h3 className="text-sm font-semibold mb-4 text-zinc-300">
        {title}
      </h3>
      <div className="space-y-3">{children}</div>
    </div>
  )
}

function Row({ label, value }: any) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-zinc-400">{label}</span>
      <span className="font-semibold">{value || 0}</span>
    </div>
  )
}