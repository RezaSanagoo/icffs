import { motion, AnimatePresence } from 'framer-motion'
import {
  useMemo,
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
} from 'react'
import { X, Info, Camera } from 'lucide-react'
import { StoryInsights, Story } from '../types'
import { BiBarChart } from 'react-icons/bi'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from 'recharts'

interface Props {
  isOpen: boolean
  onClose: () => void
  insights?: StoryInsights
  isInsightsLoading?: boolean
  viewers?: string
  viewers2?: string
  stories: Story[]
  activeStoryId?: string
  onSelectStory?: (id: string) => void
}

const EMPTY_INSIGHTS: StoryInsights = {
  totalViews: 0,
  reach: 0,
  impressions: 0,
  uniqueViewers: 0,
  followersReach: 0,
  nonFollowersReach: 0,
  viewsTimeline: [],
  viewers: [],
}
const clamp = (value: number, min: number, max: number) => {
  return Math.min(Math.max(value, min), max)
}

const round1 = (value: number) => {
  return Math.round(value * 10) / 10
}

const roundInt = (value: number) => {
  return Math.max(0, Math.round(value))
}

/**
 * Stable pseudo random based on story id + salt
 * خروجی این تابع برای هر استوری ثابت می‌ماند
 */
const seededRandom = (seed: string) => {
  let hash = 2166136261

  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }

  hash += hash << 13
  hash ^= hash >>> 7
  hash += hash << 3
  hash ^= hash >>> 17
  hash += hash << 5

  return (hash >>> 0) / 4294967295
}

const randomRange = (
  seed: string,
  min: number,
  max: number,
  precision: number = 4
) => {
  const r = seededRandom(seed)
  const value = min + r * (max - min)
  const p = Math.pow(10, precision)

  return Math.round(value * p) / p
}

export default function StoryInsightsDrawer({
  isOpen,
  onClose,
  insights,
  isInsightsLoading = false,
  viewers,
  viewers2,
  stories,
  activeStoryId,
  onSelectStory,
}: Props) {
  const [page, setPage] = useState<'insights' | 'viewers'>('insights')

  const [showEntryHero, setShowEntryHero] = useState(false)
  const [entryStoryId, setEntryStoryId] = useState<string | null>(null)
  const [hasPlayedOpenAnimation, setHasPlayedOpenAnimation] = useState(false)

  const [visualActiveStoryId, setVisualActiveStoryId] = useState<
    string | undefined
  >(activeStoryId || stories[0]?.id)

  const thumbnailsContainerRef = useRef<HTMLDivElement | null>(null)
  const storyRefs = useRef<Record<string, HTMLButtonElement | null>>({})

  const safeInsights: StoryInsights = insights ?? EMPTY_INSIGHTS

  const activeStory = stories.find((s) => s.id === activeStoryId)

  useEffect(() => {
    if (activeStoryId) {
      setVisualActiveStoryId(activeStoryId)
    }
  }, [activeStoryId])

  useEffect(() => {
    if (!visualActiveStoryId && stories[0]?.id) {
      setVisualActiveStoryId(stories[0].id)
    }
  }, [stories, visualActiveStoryId])

  const getStoryViews = (story?: Story) => {
    if (!story) return 0
    return Number((story as any).viewcount ?? (story as any).views ?? 0)
  }

  const getStoryTag = (story?: Story) => {
    if (!story) return ''
    return (story as any).tag || (story as any).storyTag || ''
  }

  const activeStoryViews = getStoryViews(activeStory)

  const formatCompact = (value?: number) => {
    const n = Number(value || 0)

    if (n >= 1000000) {
      return `${(n / 1000000).toFixed(n % 1000000 === 0 ? 0 : 1)}M`
    }

    if (n >= 1000) {
      return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K`
    }

    return String(n)
  }

  const formatNumber = (value?: number) => {
    return Number(value || 0).toLocaleString('en-US')
  }

  const getStoryThumbnail = (story: Story) => {
    return (
      (story as any).thumbnailUrl ||
      (story as any).thumbnail ||
      (story as any).mediaUrl ||
      (story as any).file ||
      ''
    )
  }

  const getStoryViewer = (story: Story) => {
    return (story as any).viewerImage || (story as any).viewverImage || ''
  }

  const getStoryUsername = (story?: Story) => {
    if (!story) return 'story'

    return (
      (story as any).username ||
      (story as any).profile?.username ||
      (story as any).profileUsername ||
      'story'
    )
  }

  const centerStoryById = (
    storyId?: string,
    behavior: ScrollBehavior = 'smooth'
  ) => {
    const id = storyId || visualActiveStoryId || activeStoryId
    if (!id) return

    const container = thumbnailsContainerRef.current
    const target = storyRefs.current[id]

    if (!container || !target) return

    const containerRect = container.getBoundingClientRect()
    const targetRect = target.getBoundingClientRect()

    const currentScrollLeft = container.scrollLeft

    const targetCenter =
      targetRect.left -
      containerRect.left +
      currentScrollLeft +
      targetRect.width / 2

    const nextScrollLeft = targetCenter - container.clientWidth / 2

    container.scrollTo({
      left: Math.max(0, nextScrollLeft),
      behavior,
    })
  }

  const handleSelectThumbnail = (storyId: string) => {
    setVisualActiveStoryId(storyId)
    onSelectStory?.(storyId)

    requestAnimationFrame(() => {
      centerStoryById(storyId, 'smooth')
    })

    window.setTimeout(() => {
      centerStoryById(storyId, 'smooth')
    }, 340)
  }

  useEffect(() => {
    if (!isOpen) {
      setShowEntryHero(false)
      setEntryStoryId(null)
      setHasPlayedOpenAnimation(false)
      return
    }

    if (activeStoryId && !hasPlayedOpenAnimation) {
      setVisualActiveStoryId(activeStoryId)
      setEntryStoryId(activeStoryId)
      setShowEntryHero(true)
      setHasPlayedOpenAnimation(true)

      const t = window.setTimeout(() => {
        setShowEntryHero(false)

        requestAnimationFrame(() => {
          centerStoryById(activeStoryId, 'auto')

          requestAnimationFrame(() => {
            centerStoryById(activeStoryId, 'smooth')
          })
        })
      }, 520)

      return () => {
        window.clearTimeout(t)
      }
    }
  }, [isOpen, activeStoryId, hasPlayedOpenAnimation])

  useLayoutEffect(() => {
    if (!isOpen || !visualActiveStoryId || showEntryHero) return

    const raf = requestAnimationFrame(() => {
      centerStoryById(visualActiveStoryId, 'instant')
    })

    const t = window.setTimeout(() => {
      centerStoryById(visualActiveStoryId, 'instant')
    }, 340)

    return () => {
      cancelAnimationFrame(raf)
      window.clearTimeout(t)
    }
  }, [visualActiveStoryId, isOpen, showEntryHero, stories.length])

const metrics = useMemo(() => {
  const storySeed = String(
    activeStory?.id ||
      activeStoryId ||
      visualActiveStoryId ||
      'fallback-story'
  )

  /**
   * فقط عدد views از خود استوری خوانده می‌شود.
   * تمام اعداد دیگر فقط از همین عدد ساخته می‌شوند.
   */
  const views = Math.max(
    0,
    Number(
      (activeStory as any)?.viewcount ??
        (activeStory as any)?.views ??
        0
    )
  )

  /**
   * Views audience split
   * Followers همیشه بین 98.2 تا 99.7
   */
  const followersPercent = round1(
    randomRange(`${storySeed}-views-followers-percent`, 98.2, 99.7, 3)
  )

  const nonFollowersPercent = round1(100 - followersPercent)

  /**
   * Interaction audience split
   * در Interactions نسبت Followers کمی بالاتر از Views است.
   */
  const interactionFollowersPercent = round1(
    clamp(
      followersPercent +
        randomRange(`${storySeed}-interactions-followers-boost`, 0.1, 0.25, 3),
      98.4,
      99.9
    )
  )

  const interactionNonFollowersPercent = round1(
    100 - interactionFollowersPercent
  )

  /**
   * Accounts reached
   * معمولاً reach از views کمتر است.
   */
  const accountsReached = roundInt(
    views * randomRange(`${storySeed}-accounts-reached`, 0.82, 0.94, 4)
  )

  /**
   * Interactions
   * همه از views ساخته می‌شوند.
   */
  const likes = roundInt(
    views * randomRange(`${storySeed}-likes`, 0.012, 0.032, 4)
  )

  const replies = roundInt(
    views * randomRange(`${storySeed}-replies`, 0.001, 0.006, 4)
  )

  const shares = roundInt(
    views * randomRange(`${storySeed}-shares`, 0.006, 0.022, 4)
  )

  /**
   * اگر لینک/استیکر داری، عددش باز هم از views ساخته می‌شود.
   * اگر نمی‌خواهی همیشه نمایش داده شوند، پایین‌تر condition دارد.
   */
  const linkClicks = roundInt(
    views * randomRange(`${storySeed}-link-clicks`, 0.002, 0.014, 4)
  )

  const stickerTaps = roundInt(
    views * randomRange(`${storySeed}-sticker-taps`, 0.001, 0.011, 4)
  )

  const interactions =
    likes + replies + shares + linkClicks + stickerTaps

  /**
   * Navigation
   * همه بر اساس views ساخته می‌شوند.
   */
  const forward = roundInt(
    views * randomRange(`${storySeed}-forward`, 0.58, 0.82, 4)
  )

  const exited = roundInt(
    views * randomRange(`${storySeed}-exited`, 0.08, 0.18, 4)
  )

  const nextStory = roundInt(
    views * randomRange(`${storySeed}-next-story`, 0.04, 0.12, 4)
  )

  const back = roundInt(
    views * randomRange(`${storySeed}-back`, 0.002, 0.018, 4)
  )

  const navigation = forward + exited + nextStory + back

  /**
   * Profile activity
   */
  const profileVisits = roundInt(
    views * randomRange(`${storySeed}-profile-visits`, 0.002, 0.012, 4)
  )

  const follows = roundInt(
    profileVisits *
      randomRange(`${storySeed}-follows`, 0.02, 0.16, 4)
  )

  const profileActivity = profileVisits + follows

  return {
    views,

    followersPercent,
    nonFollowersPercent,
    interactionFollowersPercent,
    interactionNonFollowersPercent,

    accountsReached,

    interactions,
    likes,
    replies,
    shares,
    linkClicks,
    stickerTaps,

    navigation,
    forward,
    exited,
    nextStory,
    back,

    profileVisits,
    follows,
    profileActivity,
  }
}, [activeStory, activeStoryId, visualActiveStoryId])

  const viewsChartData = useMemo(
    () => [
      {
        name: 'Followers',
        value: Number(metrics.followersPercent || 0),
        color: '#d946ef',
      },
      {
        name: 'Non-followers',
        value: Number(metrics.nonFollowersPercent || 0),
        color: '#7c3aed',
      },
    ],
    [metrics.followersPercent, metrics.nonFollowersPercent]
  )

const interactionsChartData = useMemo(
  () => [
    {
      name: 'Followers',
      value:
        metrics.interactions > 0
          ? Number(metrics.interactionFollowersPercent  || 0)
          : 0,
      color: '#d946ef',
    },
    {
      name: 'Non-followers',
      value:
        metrics.interactions > 0
          ? Number(metrics.interactionNonFollowersPercent || 0)
          : 0,
      color: '#7c3aed',
    },
  ],
  [
    metrics.interactions,
    metrics.interactionFollowersPercent,
    metrics.interactionNonFollowersPercent,
  ]
)



  const activeStoryTag = getStoryTag(activeStory)

  const entryStory =
    stories.find((s) => s.id === entryStoryId) || activeStory || stories[0]

  const entryThumb = entryStory ? getStoryThumbnail(entryStory) : ''
  const entryViewerImage = entryStory ? getStoryViewer(entryStory) : ''
  const entryViews = entryStory ? getStoryViews(entryStory) : 0

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.08 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
          />

          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{
              duration: 0.12,
              ease: [0.4, 0, 1, 1],
            }}
            className="fixed inset-0 z-50 overflow-hidden bg-[#050505] text-white"
          >
            <div className="flex h-full flex-col bg-[#050505]">
              <div className="relative bg-[#111111]">
                <div className="relative z-20 flex items-center justify-between px-3 pt-3 pb-3">
                  <button
                    type="button"
                    className="flex h-7 w-7 items-center justify-center rounded-full text-white active:scale-95"
                  >
                    <img src="/6.png" alt="" />
                  </button>

                  <button
                    type="button"
                    onClick={onClose}
                    className="flex h-9 w-9 items-center justify-center rounded-full text-white active:scale-95"
                  >
                    <X size={32} strokeWidth={2.1} />
                  </button>
                </div>

                <AnimatePresence>
                  {showEntryHero && entryStory && (
                    <motion.div
                      initial={{
                        opacity: 1,
                        x: '-50%',
                        y: 0,
                        left: '50%',
                        top: 0,
                        width: '100vw',
                        height: '100vh',
                        borderRadius: 0,
                        scale: 1,
                      }}
                      animate={{
                        opacity: 0,
                        x: '-50%',
                        y: 0,
                        left: '50%',
                        top: 78,
                        width: 56,
                        height: 100,
                        borderRadius: 8,
                        scale: 1,
                      }}
                      exit={{
                        opacity: 0,
                        scale: 0.98,
                      }}
                      transition={{
                        duration: 0.5,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      className="pointer-events-none absolute z-30 overflow-hidden bg-black shadow-2xl"
                    >
                      {entryThumb ? (
                        <img
                          src={entryThumb}
                          alt=""
                          draggable={false}
                          className="h-full w-full select-none object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-[#050505]">
                          <Camera size={36} className="text-white" />
                        </div>
                      )}

                      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent px-2 pb-2 pt-8">
                        <div className="flex items-center justify-center gap-1 text-xs font-semibold text-white">
                          <img src="/7.png" className="w-[14px] grayscale brightness-200" alt="" />
                          <span>{entryViews}</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="relative px-4 pb-6">
                  <div
                    ref={thumbnailsContainerRef}
                    className="flex min-h-[135px] items-center justify-start gap-3 overflow-x-auto scrollbar-hide px-[calc(50vw-28px)]"
                  >
                    <AnimatePresence initial={false}>
                      {stories.map((story) => {
                        const active = story.id === visualActiveStoryId
                        const thumb = getStoryThumbnail(story)
                        const storyViews = getStoryViews(story)

                        return (
                          <motion.button
                            key={story.id}
                            ref={(el) => {
                              storyRefs.current[story.id] = el
                            }}
                            type="button"
                            onClick={() => handleSelectThumbnail(story.id)}
                            initial={{
                              opacity: 0,
                              scale: 0.92,
                              width: active ? 56 : 48,
                            }}
                            animate={{
                              opacity: 1,
                              scale: 1,
                              width: active ? 56 : 48,
                            }}
                            exit={{
                              opacity: 0,
                              scale: 0.92,
                              width: 0,
                              marginRight: 0,
                            }}
                            transition={{
                              duration: 0.24,
                              ease: [0.22, 1, 0.36, 1],
                            }}
                            className="relative shrink-0 pt-4 active:scale-95"
                          >
                            <motion.div
                              initial={false}
                              animate={{
                                width: active ? 56 : 48,
                                height: active ? 100 : 84,
                                scale: active ? 1.1 : 1,
                                opacity: active ? 1 : 0.8,
                              }}
                              transition={{
                                width: {
                                  duration: 0.28,
                                  ease: [0.22, 1, 0.36, 1],
                                },
                                height: {
                                  duration: 0.28,
                                  ease: [0.22, 1, 0.36, 1],
                                },
                                scale: {
                                  duration: 0.28,
                                  ease: [0.22, 1, 0.36, 1],
                                },
                                opacity: {
                                  duration: 0.18,
                                  ease: 'easeOut',
                                },
                              }}
                              className={[
                                'relative overflow-hidden rounded-md bg-black shadow-sm will-change-transform',
                                active ? 'ring-2 ring-[#3a3a3a]' : '',
                              ].join(' ')}
                            >
                              {thumb ? (
                                <img
                                  src={thumb}
                                  alt=""
                                  draggable={false}
                                  className="h-full w-full select-none object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center bg-[#050505]">
                                  <Camera size={24} className="text-white" />
                                </div>
                              )}

                              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent px-1 pb-1 pt-5">
                                <div className="flex items-center justify-center gap-0.5 text-[10px] font-semibold text-white">
                                  <img src="/7.png" className="w-[11px] grayscale brightness-200" alt="" />
                                  <span className="text-[10px]">{storyViews}</span>
                                </div>
                              </div>
                            </motion.div>
                          </motion.button>
                        )
                      })}
                    </AnimatePresence>

                    <button
                      type="button"
                      className="relative shrink-0 pt-4 active:scale-95"
                    >
                      <div className="flex h-[84px] w-[48px] items-center justify-center rounded-md bg-black ring-1 ring-white/10">
                        <Camera size={25} className="text-white" />
                      </div>
                    </button>
                  </div>

                  <div className="absolute bottom-0 left-1/2 h-0 w-0 -translate-x-1/2 border-x-[12px] border-b-[12px] border-x-transparent border-b-[#050505]" />
                </div>
              </div>

              <div className="flex h-[58px] items-center border-b border-white/10 bg-[#050505] px-3">
                <button
                  type="button"
                  onClick={() => setPage('insights')}
                  className={[
                    'relative flex h-full min-w-[58px] items-center justify-center',
                    page === 'insights' ? 'text-[#1f81c7]' : 'text-zinc-400',
                  ].join(' ')}
                >
                  <BiBarChart size={27} />

                  {page === 'insights' && (
                    <motion.div
                      layoutId="insights-tab-indicator"
                      className="absolute bottom-0 left-0 right-0 mx-auto h-[2px] w-full rounded-full bg-[#1f81c7]"
                    />
                  )}
                </button>

<button
  type="button"
  onClick={() => setPage('viewers')}
  className={[
    'relative ml-4 flex h-full items-center gap-2 px-1 transition-colors duration-200',
    page === 'viewers' ? 'text-[#1f81c7]' : 'text-zinc-400',
  ].join(' ')}
>
  <img
    src="/7.png"
    className={[
      'w-[23px] transition-all duration-200',
      page === 'viewers' 
        ? 'opacity-100 ' 
        : 'opacity-70 grayscale brightness-200',
    ].join(' ')}
    alt=""
  />
  <span
    className={[
      'text-[13px] font-bold',
      page === 'viewers' ? 'text-[#1f81c7]' : 'text-zinc-400',
    ].join(' ')}
  >
    {formatCompact(metrics.views)}
  </span>

  {page === 'viewers' && (
    <motion.div
      layoutId="insights-tab-indicator"
      className="absolute bottom-0 left-0 right-0 mx-auto h-[2px] w-full rounded-full bg-[#1f81c7]"
    />
  )}
</button>


                <button
                  type="button"
                  className="ml-auto flex h-8 w-8 items-center justify-center text-white active:scale-95"
                >
                  <img src="/8.png" alt="" />
                </button>
              </div>

              <div className="relative min-h-0 flex-1 overflow-hidden bg-[#050505]">
                <motion.div
                  animate={{ x: page === 'insights' ? '0%' : '-50%' }}
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                  className="flex h-full w-[200%]"
                >
                  <div className="h-full w-1/2 flex-shrink-0 overflow-y-auto bg-[#050505] pb-10">
                    <AnimatePresence mode="wait">
                      {isInsightsLoading ? (
                        <motion.div
                          key="insights-skeleton"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.01 }}
                          className="px-4 pt-4"
                        >
                          <div className="space-y-3">
                            <div className="h-4 rounded bg-white/10" />
                            <div className="h-4 rounded bg-white/10" />
                            <div className="h-4 rounded bg-white/10" />
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div
                          key={`insights-${activeStoryId}`}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            duration: 0.22,
                            ease: [0.22, 1, 0.36, 1],
                          }}
                        >
                          <div className="px-4 pt-4">
                            <div className="space-y-3">
                              <MetricSummaryRow
                                label="Views"
                                value={metrics.views}
                              />
                              <MetricSummaryRow
                                label="Interactions"
                                value={metrics.interactions}
                              />
                              <MetricSummaryRow
                                label="Profile activity"
                                value={metrics.profileActivity}
                              />
                            </div>
                          </div>

                          <Divider />

                          <div className="px-4 pt-5">
                            <SectionTitle title="Views" />

                            <DonutInsightChart
                              title="Views"
                              value={metrics.views}
                              data={viewsChartData}
                            />

                            <div className="mt-5">
                              <MetricSummaryRow
                                label="Accounts reached"
                                value={metrics.accountsReached}
                              />
                            </div>
                          </div>

                          <Divider />

                          <div className="px-4 pt-5">
                            <SectionTitle title="Interactions" />

                            <DonutInsightChart
                              title="Interactions"
                              value={metrics.interactions}
                              data={interactionsChartData}
                            />

                            <div className="mt-6 space-y-4">
                              <MetricSummaryRow
                                label="Likes"
                                value={metrics.likes}
                              />
                              <MetricSummaryRow
                                label="Replies"
                                value={metrics.replies}
                              />
                              <MetricSummaryRow
                                label="Shares"
                                value={metrics.shares}
                              />

                              {metrics.linkClicks > 0 && (
                                <MetricSummaryRow
                                  label="Link clicks"
                                  value={metrics.linkClicks}
                                />
                              )}

                              {metrics.stickerTaps > 0 && (
                                <MetricSummaryRow
                                  label="Sticker taps"
                                  value={metrics.stickerTaps}
                                />
                              )}
                            </div>
                          </div>

                          <Divider />

                          <div className="px-4 pt-5">
                            <SectionTitle title="Navigation" />

                            <div className="mt-6 space-y-4">
                              <MetricSummaryRow
                                label="Forward"
                                value={metrics.forward}
                              />
                              <MetricSummaryRow
                                label="Exited"
                                value={metrics.exited}
                              />
                              <MetricSummaryRow
                                label="Next story"
                                value={metrics.nextStory}
                              />
                              <MetricSummaryRow
                                label="Back"
                                value={metrics.back}
                              />
                            </div>
                          </div>

                          <Divider />

                          <div className="px-4 pt-5">
                            <SectionTitle title="Profile activity" />

                            <div className="mt-6 space-y-4">
                              <MetricSummaryRow
                                label="Profile visits"
                                value={metrics.profileVisits}
                              />
                              <MetricSummaryRow
                                label="Follows"
                                value={metrics.follows}
                              />
                            </div>
                          </div>

                          {activeStoryTag ? (
                            <>
                              <Divider />
                              <div className="px-4 pt-5">
                                <SectionTitle title="Mention" />
                                <div className="mt-6 space-y-4">
                                  <MetricSummaryRow
                                    label={`@${activeStoryTag}`}
                                    value={metrics.stickerTaps}
                                  />
                                </div>
                              </div>
                            </>
                          ) : null}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="h-full w-1/2 flex-shrink-0 overflow-y-auto bg-[#050505] pb-10">
                    <motion.div
                      key={`viewers-${activeStoryId}`}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                      className="pt-4"
                    >
                      <div className="mb-3 flex items-center justify-between px-4">
                        <h3 className="text-[16px] font-semibold ">
                          Viewers
                        </h3>

                        <span className="text-[13px] font-semibold ">
                          {formatNumber(metrics.views)}
                        </span>
                      </div>

                      {viewers ? (
                        <img src={viewers} alt="" className="w-full" />
                        
                      ) : (
                        <div className="px-4 pt-6 text-center text-sm text-zinc-500">
                          No viewers image found
                        </div>
                      )}
                      {viewers2 ? (
                        <img src={viewers2} alt="" className="w-full" />
                        
                      ) : (
                        <div className="px-4 pt-6 text-center text-sm text-zinc-500">
                          No viewers image found
                        </div>
                      )}
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function SectionTitle({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <h2 className="text-[19px] font-bold leading-none text-white">
        {title}
      </h2>
      <Info size={18} strokeWidth={2.2} className="text-zinc-400" />
    </div>
  )
}

function InsightRow({
  label,
  value,
  muted = false,
}: {
  label: string
  value: number
  muted?: boolean
}) {
  return (
    <div className="flex items-center justify-between">
      <span
        className={[
          'text-[16px] font-medium',
          muted ? 'text-zinc-500' : 'text-zinc-200',
        ].join(' ')}
      >
        {label}
      </span>

      <span
        className={[
          'text-[15px] font-semibold',
          muted ? 'text-zinc-500' : 'text-white',
        ].join(' ')}
      >
        {Number(value || 0).toLocaleString('en-US')}
      </span>
    </div>
  )
}

function MetricSummaryRow({
  label,
  value,
}: {
  label: string
  value: number | string
}) {
  return (
    <div className="flex items-center justify-between py-0.5">
      <span className="text-[15px] text-zinc-200">{label}</span>
      <span className="text-[15px] font-semibold text-white">
        {typeof value === 'number' ? value.toLocaleString('en-US') : value}
      </span>
    </div>
  )
}

function DonutInsightChart({
  title,
  value,
  data,
}: {
  title: string
  value: number
  data: { name: string; value: number; color: string }[]
}) {
    const chartData = data.map((item) => ({
    ...item,
    // اگر Non-followers است، حداقل ۳٪ برای نمایش در چارت، در غیر این صورت مقدار واقعی
    displayValue: item.name === 'Non-followers' ? Math.max(item.value, 2.2) : item.value
  }));
  return (
    <div className="pt-4">
      <div className="relative mx-auto h-[230px] w-[230px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="displayValue" // استفاده از مقدار تغییر یافته برای ظاهر
              innerRadius={88}
              outerRadius={103}
              startAngle={90}
              endAngle={-270}
              stroke="none"
              cornerRadius={6}
              animationDuration={400} // سرعت انیمیشن اینجا تنظیم شد
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} radius={4} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[12px] text-zinc-500">{title}</span>
          <span className="mt-1 text-[22px] font-bold text-white">
            {Number(value || 0).toLocaleString('en-US')}
          </span>
        </div>
      </div>

      <div className="mt-3 space-y-2">
{data.map((item) => (
          <div key={item.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-[14px] text-zinc-200">{item.name}</span>
            </div>
            {/* اینجا همچنان از item.value واقعی استفاده می‌کنیم */}
            <span className="text-[14px] text-white">
              {Number(item.value || 0).toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function Divider() {
  return <div className="mt-8 h-[1px] w-full bg-white/10" />
}
