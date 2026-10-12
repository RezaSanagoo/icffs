import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ChevronDown, MoreVertical, Heart, Calendar, MapPin, RefreshCw } from 'lucide-react'
import { motion } from 'framer-motion'
import { useArchiveStories } from '../hooks/useStories'
import { useActiveProfile } from '../hooks/useProfile'
import { Story } from '../types'
import { useLayoutEffect, useRef } from 'react'

const formatDuration = (duration?: number | string) => {
  const totalSeconds = Number(duration)
  if (!Number.isFinite(totalSeconds)) return ''

  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

export default function StoriesArchive() {
  const navigate = useNavigate()
  const { data: response, isLoading } = useArchiveStories()
  const { data: activeProfile } = useActiveProfile()

  const scrollRef = useRef<HTMLDivElement>(null)

  const archivedStories: (Story & {
    date: string
    day: string
    month: string
    showDate: boolean
    durationLabel: string
  })[] = (response?.stories || [])
    .filter(story => story.profileId === activeProfile?.id)
    .map((story, index, stories) => {
      const createdDate = new Date(story.createdAt)
      const currentDateKey = createdDate.toDateString()
      const previousDateKey =
        index > 0 ? new Date(stories[index - 1].createdAt).toDateString() : null

      return {
        ...story,
        date: createdDate.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        }),
        day: createdDate.getDate().toString(),
        month: createdDate.toLocaleDateString('en-US', { month: 'short' }),
        showDate: index === 0 || currentDateKey !== previousDateKey,
        durationLabel: formatDuration(story.duration),
      }
    })

  useLayoutEffect(() => {
    if (isLoading || archivedStories.length === 0) return

    const container = scrollRef.current
    if (!container) return

    container.scrollTop = container.scrollHeight
  }, [isLoading, archivedStories.length])

  return (
    <div className="app-bg h-dvh flex flex-col overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 app-bg border-b app-border z-10 shrink-0">
        <div className="px-4 py-3 flex items-center justify-between">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft size={24} />
          </button>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-semibold">Stories archive</h1>
            <ChevronDown size={16} className="app-muted" />
          </div>
          <MoreVertical size={24} />
        </div>
      </header>

      {/* Filter Bar */}
      <div className="flex sticky top-12 z-50 app-bg items-center justify-around border-b app-border shrink-0">
        <img src="/3.png" alt="" className="absolute app-theme-image" />
        <button className="w-16 py-3 border-b-2 app-border app-text">
          <RefreshCw size={20} className='text-transparent' />
        </button>
        <button className="w-16 py-3">
          <Heart size={20} className="app-muted !text-transparent" />
        </button>
        <button className="w-16 py-3">
          <Calendar size={20} className="app-muted !text-transparent" />
        </button>
        <button className="w-16 py-3">
          <MapPin size={20} className="app-muted !text-transparent" />
        </button>
      </div>

      {/* Scrollable Content */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : archivedStories.length === 0 ? (
          <div className="flex items-center justify-center h-96 app-muted">
            <p>No archived stories</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-0.5 p-0.5">
            {archivedStories.map((story, index) => (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05, duration: 0.2 }}
                className="aspect-[9/16] app-story-card relative overflow-hidden cursor-pointer"
                onClick={() => navigate(`/stories?story=${story.id}`)}
              >
                <img
                  src={story.thumbnailUrl || story.mediaUrl}
                  alt="Story"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />

                {story.showDate && (
                  <div className="absolute top-2 left-2 flex flex-col items-center justify-center min-w-[40px] rounded-lg app-story-overlay px-2 py-1.5">
                    <span className="app-text text-sm font-semibold leading-none">
                      {story.day}
                    </span>
                    <span className="app-muted text-[10px] uppercase tracking-[0.2em] mt-1 leading-none">
                      {story.month}
                    </span>
                  </div>
                )}

                {story.durationLabel && (
                  <div className="absolute bottom-1 left-2">
                    <span className="app-text text-[11px] font-medium">
                      {story.durationLabel}
                    </span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
