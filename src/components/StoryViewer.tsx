import { useEffect, useState, useRef, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useArchiveStories, useStoryView, useStoryInsights } from '../hooks/useStories'
import { useActiveProfile } from '../hooks/useProfile'

import StoryInsightsPanel from './StoryInsightsPanel'
import StoryViewersPanel from './StoryViewersPanel'
import ImageWithInstagramLoader from './ImageWithInstagramLoader'
import StoryInsightsDrawer from './StoryInsightsDrawer'

const STORY_DURATION = 5000 // 5 seconds

export default function StoryViewer() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const storyId = searchParams.get('story')
  const { data: storiesData, isLoading, isError } = useArchiveStories()
  const { data: activeProfile } = useActiveProfile()
  const viewMutation = useStoryView()
  const { data: insightsData } = useStoryInsights(storyId || '')

  const [currentIndex, setCurrentIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [showInsights, setShowInsights] = useState(false)
  const [showViewers, setShowViewers] = useState(false)
  const [swipeY, setSwipeY] = useState(0)
  const [isSwiping, setIsSwiping] = useState(false)
  
  const intervalRef = useRef<number | null>(null)
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)
  const longPressTimerRef = useRef<number | null>(null)
  const viewedStoriesRef = useRef<Set<string>>(new Set())

  const allStories = storiesData?.stories || []
  const stories =
    activeProfile?.id
      ? allStories.filter((s) => s.profileId === activeProfile.id)
      : allStories
  const storyById = storyId ? stories.find((s) => s.id === storyId) : undefined
  const currentStory = storyById ?? stories[currentIndex] ?? stories[0]

  useEffect(() => {
    if (storyId && stories.length > 0) {
      const index = stories.findIndex((s) => s.id === storyId)
      if (index !== -1) {
        setCurrentIndex(index)
      }
    }
  }, [storyId, stories])

  useEffect(() => {
    if (stories.length > 0 && currentIndex > stories.length - 1) {
      setCurrentIndex(0)
    }
  }, [stories.length, currentIndex])

  useEffect(() => {
    if (!currentStory) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    // Register view (only once per story)
    if (!viewedStoriesRef.current.has(currentStory.id)) {
      viewedStoriesRef.current.add(currentStory.id)
      viewMutation.mutate(currentStory.id)
    }

    // Reset progress when story changes
    setProgress(0)
  }, [currentStory?.id, viewMutation])

  useEffect(() => {
    if (!currentStory || isPaused || showInsights || showViewers) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    // Start progress
    const startTime = Date.now()
    intervalRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startTime
      const newProgress = Math.min((elapsed / STORY_DURATION) * 100, 100)
      setProgress(newProgress)

      if (newProgress >= 100) {
        handleNext()
      }
    }, 16) // ~60fps

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [currentStory, isPaused, showInsights, showViewers])

  const handleNext = useCallback(() => {
    if (currentIndex < stories.length - 1) {
      const nextIndex = currentIndex + 1
      setCurrentIndex(nextIndex)
      navigate(`/stories?story=${stories[nextIndex].id}`, {
        replace: true,
      })
    } else {
      navigate(-1)
    }
  }, [currentIndex, stories, navigate])

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1
      setCurrentIndex(prevIndex)
      navigate(`/stories?story=${stories[prevIndex].id}`, {
        replace: true,
      })
    }
  }, [currentIndex, stories, navigate])

  const handleClose = useCallback(() => {
    navigate(-1)
  }, [navigate])

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    touchStartRef.current = { x: touch.clientX, y: touch.clientY }
    
    // Start long press timer
    longPressTimerRef.current = window.setTimeout(() => {
      setIsPaused(true)
    }, 200) // 200ms for long press
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return
    
    const touch = e.touches[0]
    const deltaY = touchStartRef.current.y - touch.clientY
    
    // Swipe up detection
    if (deltaY > 20 && Math.abs(touch.clientX - touchStartRef.current.x) < 50) {
      setIsSwiping(true)
      setSwipeY(Math.min(deltaY, 300))
    }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    // Clear long press timer
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }

    if (!touchStartRef.current) return

    const touch = e.changedTouches[0]
    const deltaX = touchStartRef.current.x - touch.clientX
    const deltaY = touchStartRef.current.y - touch.clientY

    // Handle swipe up for viewers/insights panel
    if (isSwiping && deltaY > 100) {
      if (insightsData) {
        setShowInsights(true) 
      }
      setIsSwiping(false)
      setSwipeY(0)
      touchStartRef.current = null
      return
    }

    setIsSwiping(false)
    setSwipeY(0)
    setIsPaused(false)

    // Handle horizontal swipe
    if (Math.abs(deltaX) > 50 && Math.abs(deltaY) < 50) {
      if (deltaX > 0) {
        handleNext()
      } else {
        handlePrev()
      }
    }

    touchStartRef.current = null
  }

  const handleTouchCancel = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
    setIsPaused(false)
    setIsSwiping(false)
    setSwipeY(0)
    touchStartRef.current = null
  }

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black z-50 flex items-center justify-center"
      >
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </motion.div>
    )
  }

  if (isError) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black z-50 flex items-center justify-center"
      >
        <div className="text-white text-center px-6">
          <p className="text-lg mb-2">Failed to load stories</p>
          <p className="text-sm text-gray-400 mb-4">
            Please check backend/API and try again.
          </p>
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-instagram-blue rounded-lg"
          >
            Close
          </button>
        </div>
      </motion.div>
    )
  }

  if (stories.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black z-50 flex items-center justify-center"
      >
        <div className="text-white text-center">
          <p className="text-lg mb-4">No stories available</p>
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-instagram-blue rounded-lg"
          >
            Close
          </button>
        </div>
      </motion.div>
    )
  }

  if (!currentStory) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black z-50 flex items-center justify-center"
      >
        <div className="text-white text-center px-6">
          <p className="text-lg mb-2">Story not found</p>
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-instagram-blue rounded-lg"
          >
            Close
          </button>
        </div>
      </motion.div>
    )
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black z-50"
      >
        {/* Progress bars */}
        <div className="absolute top-0 left-0 right-0 flex gap-1 p-2 z-10">
          {stories.map((_, index) => (
            <div
              key={index}
              className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden"
            >
              <motion.div
                className="h-full bg-white"
                initial={{ width: 0 }}
                animate={{
                  width:
                    index === currentIndex
                      ? `${progress}%`
                      : index < currentIndex
                      ? '100%'
                      : '0%',
                }}
                transition={{ duration: 0.1 }}
              />
            </div>
          ))}
        </div>

        {/* Close button */}
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={handleClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/30 backdrop-blur-sm"
        >
          <X size={24} className="text-white" />
        </motion.button>

        {/* Story content */}
        <motion.div
          className="w-full h-full flex items-center justify-center bg-black"
          style={{
            y: showInsights || showViewers ? -80 : -swipeY,
            scale: showInsights || showViewers ? 0.85 : 1,
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchCancel}
          onClick={(e: React.MouseEvent) => {
            if (isSwiping) return
            const rect = e.currentTarget.getBoundingClientRect()
            const clickX = e.clientX - rect.left
            const width = rect.width
            if (clickX < width / 2) {
              handlePrev()
            } else {
              handleNext()
            }
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStory.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{ duration: 0.2 }}
              className="w-full h-full flex items-center justify-center bg-black"
            >

              {currentStory.mediaType === 'image' ? (
                  <ImageWithInstagramLoader src={currentStory.mediaUrl} />
              ) : (
                <video
                  src={currentStory.mediaUrl}
                  poster={currentStory.thumbnailUrl || undefined}
                  className="max-w-full max-h-full object-contain"
                  autoPlay
                  playsInline
                  muted
                  loop={false}
                  onEnded={handleNext}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Swipe up hint */}
        {insightsData && !showInsights && !showViewers && swipeY === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-20 left-0 right-0 flex justify-center pointer-events-none z-10"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="bg-black/50 rounded-full px-4 py-2"
            >
              <span className="text-white text-xs">
                Swipe up to see viewers & insights
              </span>
            </motion.div>
          </motion.div>
        )}
      </motion.div>

      {/* Insights Panel */}
<StoryInsightsDrawer
  isOpen={showInsights}
  onClose={() => {
    setShowInsights(false)
    setIsPaused(false)
  }}
  insights={insightsData}
  stories={stories}
  activeStoryId={currentStory.id}
  onSelectStory={(id) => {
    navigate(`/stories?story=${id}`, { replace: true })
  }}
/>
    </>
  )
}
