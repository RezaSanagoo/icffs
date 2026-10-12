import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Camera, Info, X } from "lucide-react";
import { BiBarChart } from "react-icons/bi";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { Story, StoryInsights } from "../types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  insights?: StoryInsights;
  isInsightsLoading?: boolean;
  viewers?: string;
  viewers2?: string;
  viewers3?: string;
  stories: Story[];
  activeStoryId?: string;
  onSelectStory?: (id: string) => void;
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
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const round1 = (value: number) => Math.round(value * 10) / 10;

const roundInt = (value: number) => Math.max(0, Math.round(value));

const seededRandom = (seed: string) => {
  let hash = 2166136261;

  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  hash += hash << 13;
  hash ^= hash >>> 7;
  hash += hash << 3;
  hash ^= hash >>> 17;
  hash += hash << 5;

  return (hash >>> 0) / 4294967295;
};

const randomRange = (seed: string, min: number, max: number, precision = 4) => {
  const randomValue = seededRandom(seed);
  const value = min + randomValue * (max - min);
  const multiplier = 10 ** precision;

  return Math.round(value * multiplier) / multiplier;
};

export default function StoryInsightsDrawer({
  isOpen,
  onClose,
  insights,
  isInsightsLoading = false,
  viewers,
  viewers2,
  viewers3,
  stories,
  activeStoryId,
  onSelectStory,
}: Props) {
  const [page, setPage] = useState<"insights" | "viewers">("insights");
  const [showEntryHero, setShowEntryHero] = useState(false);
  const [entryStoryId, setEntryStoryId] = useState<string | null>(null);
  const [hasPlayedOpenAnimation, setHasPlayedOpenAnimation] = useState(false);

  const [visualActiveStoryId, setVisualActiveStoryId] = useState<
    string | undefined
  >(activeStoryId || stories[0]?.id);

  const thumbnailsContainerRef = useRef<HTMLDivElement | null>(null);
  const storyRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  // نگه داشته شده تا اگر بعداً از اطلاعات واقعی backend استفاده شد آماده باشد.
  const safeInsights = insights ?? EMPTY_INSIGHTS;
  void safeInsights;

  const activeStory = stories.find((story) => story.id === activeStoryId);
  const selectedStoryId =
    visualActiveStoryId || activeStoryId || stories[0]?.id;

  const selectedStoryIndex = Math.max(
    0,
    stories.findIndex((story) => story.id === selectedStoryId),
  );

  // استوری‌های زوج از تصویر دوم و استوری‌های فرد از تصویر سوم استفاده می‌کنند.
  // استوری اول index=0 است، بنابراین تصویر دوم را نمایش می‌دهد.
  const alternatingViewerImage =
    selectedStoryIndex % 2 === 0 ? viewers2 : viewers3;

  /**
   * فقط ویوی خام backend را برمی‌گرداند.
   */
  const getRawStoryViews = (story?: Story) => {
    if (!story) return 0;

    const rawValue = (story as any).viewcount ?? (story as any).views ?? 0;
    const numericValue = Number(rawValue);

    return Number.isFinite(numericValue) && numericValue > 0 ? numericValue : 0;
  };

  /**
   * ویوی نهایی استوری را محاسبه می‌کند.
   *
   * اگر استوری ویوی واقعی داشته باشد:
   *     همان مقدار واقعی برگردانده می‌شود.
   *
   * اگر ویوی استوری صفر باشد:
   *     ویوی نهایی استوری قبلی گرفته می‌شود،
   *     سپس مقدار deterministic بین 190 تا 310 از آن کم می‌شود.
   *
   * این تابع recursive است؛ بنابراین چند استوری صفر پشت‌سرهم
   * نیز به‌صورت زنجیره‌ای محاسبه می‌شوند.
   */
  function getResolvedStoryViews(story?: Story): number {
    if (!story) return 0;

    const rawViews = getRawStoryViews(story);

    // اگر backend مقدار معتبر دارد، همان مقدار استفاده می‌شود.
    if (rawViews > 0) {
      return rawViews;
    }

    const currentIndex = stories.findIndex(
      (currentStory) => currentStory.id === story.id,
    );

    // استوری اول، استوری قبلی ندارد.
    if (currentIndex <= 0) {
      return 0;
    }

    const previousStory = stories[currentIndex - 1];

    // نکته مهم:
    // اینجا از getResolvedStoryViews استفاده شده، نه getRawStoryViews.
    // بنابراین اگر استوری قبلی هم صفر باشد، مقدار محاسبه‌شده‌ی آن استفاده می‌شود.
    const previousResolvedViews = getResolvedStoryViews(previousStory);

    if (previousResolvedViews <= 0) {
      return 0;
    }

    const storySeed = String(
      story.id || activeStoryId || `story-${currentIndex}`,
    );

    const subtractAmount = roundInt(
      randomRange(`${storySeed}-zero-view-fallback`, 190, 310, 3),
    );

    return Math.max(0, previousResolvedViews - subtractAmount);
  }

  const getStoryTag = (story?: Story) => {
    if (!story) return "";

    return (
      (story as any).tag ||
      (story as any).storyTag ||
      (story as any).mention ||
      ""
    );
  };

  const getStoryThumbnail = (story: Story) => {
    return (
      (story as any).thumbnailUrl ||
      (story as any).thumbnail ||
      (story as any).mediaUrl ||
      (story as any).file ||
      ""
    );
  };

  const getStoryViewerImage = (story: Story) => {
    return (story as any).viewerImage || (story as any).viewverImage || "";
  };

  const formatCompact = (value?: number) => {
    const numberValue = Number(value || 0);

    if (numberValue >= 1_000_000) {
      return `${(numberValue / 1_000_000).toFixed(
        numberValue % 1_000_000 === 0 ? 0 : 1,
      )}M`;
    }

    if (numberValue >= 1_000) {
      return `${(numberValue / 1_000).toFixed(
        numberValue % 1_000 === 0 ? 0 : 1,
      )}K`;
    }

    return String(numberValue);
  };

  const formatNumber = (value?: number) => {
    return Number(value || 0).toLocaleString("en-US");
  };

  const centerStoryById = (
    storyId?: string,
    behavior: ScrollBehavior = "smooth",
  ) => {
    const id = storyId || visualActiveStoryId || activeStoryId;

    if (!id) return;

    const container = thumbnailsContainerRef.current;
    const target = storyRefs.current[id];

    if (!container || !target) return;

    const containerRect = container.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();

    const targetCenter =
      targetRect.left -
      containerRect.left +
      container.scrollLeft +
      targetRect.width / 2;

    const nextScrollLeft = targetCenter - container.clientWidth / 2;

    container.scrollTo({
      left: Math.max(0, nextScrollLeft),
      behavior,
    });
  };

  const handleSelectThumbnail = (storyId: string) => {
    setVisualActiveStoryId(storyId);
    onSelectStory?.(storyId);

    requestAnimationFrame(() => {
      centerStoryById(storyId, "smooth");
    });

    window.setTimeout(() => {
      centerStoryById(storyId, "smooth");
    }, 340);
  };

  useEffect(() => {
    if (activeStoryId) {
      setVisualActiveStoryId(activeStoryId);
    }
  }, [activeStoryId]);

  useEffect(() => {
    if (!visualActiveStoryId && stories[0]?.id) {
      setVisualActiveStoryId(stories[0].id);
    }
  }, [stories, visualActiveStoryId]);

  useEffect(() => {
    if (!isOpen) {
      setShowEntryHero(false);
      setEntryStoryId(null);
      setHasPlayedOpenAnimation(false);
      return;
    }

    if (activeStoryId && !hasPlayedOpenAnimation) {
      setVisualActiveStoryId(activeStoryId);
      setEntryStoryId(activeStoryId);
      setShowEntryHero(true);
      setHasPlayedOpenAnimation(true);

      const timeoutId = window.setTimeout(() => {
        setShowEntryHero(false);

        requestAnimationFrame(() => {
          centerStoryById(activeStoryId, "auto");

          requestAnimationFrame(() => {
            centerStoryById(activeStoryId, "smooth");
          });
        });
      }, 520);

      return () => {
        window.clearTimeout(timeoutId);
      };
    }

    return undefined;
  }, [isOpen, activeStoryId, hasPlayedOpenAnimation]);

  useLayoutEffect(() => {
    if (!isOpen || !visualActiveStoryId || showEntryHero) return;

    const animationFrameId = requestAnimationFrame(() => {
      centerStoryById(visualActiveStoryId, "auto");
    });

    const timeoutId = window.setTimeout(() => {
      centerStoryById(visualActiveStoryId, "auto");
    }, 340);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.clearTimeout(timeoutId);
    };
  }, [visualActiveStoryId, isOpen, showEntryHero, stories.length]);

  /**
   * تمام Insights فقط از views نهایی محاسبه می‌شوند.
   */
  const metrics = useMemo(() => {
    const storySeed = String(
      activeStory?.id ||
        activeStoryId ||
        visualActiveStoryId ||
        "fallback-story",
    );

    const views = Math.max(0, getResolvedStoryViews(activeStory));

    const followersPercent = round1(
      randomRange(`${storySeed}-views-followers-percent`, 98.2, 99.7, 3),
    );

    const nonFollowersPercent = round1(100 - followersPercent);

    const interactionFollowersPercent = round1(
      clamp(
        followersPercent +
          randomRange(
            `${storySeed}-interactions-followers-boost`,
            0.1,
            0.25,
            3,
          ),
        98.4,
        99.9,
      ),
    );

    const interactionNonFollowersPercent = round1(
      100 - interactionFollowersPercent,
    );

    const accountsReached = roundInt(
      views * randomRange(`${storySeed}-accounts-reached`, 0.82, 0.94),
    );

    const likes = roundInt(
      views * randomRange(`${storySeed}-likes`, 0.0029, 0.0027),
    );

    const replies = roundInt(
      views * randomRange(`${storySeed}-replies`, 0.001, 0.002),
    );

    const shares = roundInt(
      views * randomRange(`${storySeed}-shares`, 0.006, 0.022),
    );

    const linkClicks = roundInt(
      views * randomRange(`${storySeed}-link-clicks`, 0.002, 0.014),
    );

    const stickerTaps = roundInt(
      views * randomRange(`${storySeed}-sticker-taps`, 0.001, 0.011),
    );

    const interactions = likes + replies + shares + linkClicks + stickerTaps;

    const forward = roundInt(
      views * randomRange(`${storySeed}-forward`, 0.58, 0.82),
    );

    const exited = roundInt(
      views * randomRange(`${storySeed}-exited`, 0.08, 0.18),
    );

    const nextStory = roundInt(
      views * randomRange(`${storySeed}-next-story`, 0.04, 0.12),
    );

    const back = roundInt(
      views * randomRange(`${storySeed}-back`, 0.002, 0.018),
    );

    const navigation = forward + exited + nextStory + back;

    const profileVisits = roundInt(
      views * randomRange(`${storySeed}-profile-visits`, 0.002, 0.012),
    );

    const follows = roundInt(
      profileVisits * randomRange(`${storySeed}-follows`, 0.02, 0.16),
    );

    const profileActivity = profileVisits + follows;

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
    };
  }, [activeStory, activeStoryId, visualActiveStoryId, stories]);

  const viewsChartData = useMemo(
    () => [
      {
        name: "Followers",
        value: metrics.followersPercent,
        color: "#d946ef",
      },
      {
        name: "Non-followers",
        value: metrics.nonFollowersPercent,
        color: "#7c3aed",
      },
    ],
    [metrics.followersPercent, metrics.nonFollowersPercent],
  );

  const interactionsChartData = useMemo(
    () => [
      {
        name: "Followers",
        value:
          metrics.interactions > 0 ? metrics.interactionFollowersPercent : 0,
        color: "#d946ef",
      },
      {
        name: "Non-followers",
        value:
          metrics.interactions > 0 ? metrics.interactionNonFollowersPercent : 0,
        color: "#7c3aed",
      },
    ],
    [
      metrics.interactions,
      metrics.interactionFollowersPercent,
      metrics.interactionNonFollowersPercent,
    ],
  );

  const activeStoryExtras = activeStory as any;
  const activeStoryTag = getStoryTag(activeStory);

  const entryStory =
    stories.find((story) => story.id === entryStoryId) ||
    activeStory ||
    stories[0];

  const entryThumbnail = entryStory ? getStoryThumbnail(entryStory) : "";

  const entryViews = entryStory ? getResolvedStoryViews(entryStory) : 0;

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
            className="fixed inset-0 z-50 bg-[#0C0F14]/80 backdrop-blur-sm"
          />

          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{
              duration: 0.12,
              ease: [0.4, 0, 1, 1],
            }}
            className="fixed inset-0 z-50 overflow-hidden bg-[#0C0F14] text-white"
          >
            <div className="flex h-full flex-col bg-[#0C0F14]">
              <div className="relative app-insights-header bg-[#111111]">
                <div className="relative z-20 flex items-center justify-between px-3 pb-3 pt-3">
                  <button
                    type="button"
                    className="flex h-7 w-7 items-center justify-center rounded-full text-white active:scale-95"
                  >
                    <img src="/6.png" alt="" className="app-insights-icon" />
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
                        x: "-50%",
                        y: 0,
                        left: "50%",
                        top: 0,
                        width: "100vw",
                        height: "100vh",
                        borderRadius: 0,
                        scale: 1,
                      }}
                      animate={{
                        opacity: 0,
                        x: "-50%",
                        y: 0,
                        left: "50%",
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
                      className="pointer-events-none absolute z-30 overflow-hidden bg-[#0C0F14] shadow-2xl"
                    >
                      {entryThumbnail ? (
                        <img
                          src={entryThumbnail}
                          alt=""
                          draggable={false}
                          className="h-full w-full select-none object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-[#0C0F14]">
                          <Camera size={36} className="text-white" />
                        </div>
                      )}

                      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent px-2 pb-2 pt-8">
                        <div className="flex items-center justify-center gap-1 text-xs font-semibold text-white">
                          <img
                            src="/7.png"
                            className="w-[14px] grayscale brightness-200"
                            alt=""
                          />
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
                        const isActive = story.id === visualActiveStoryId;

                        const thumbnail = getStoryThumbnail(story);
                        const storyViews = getResolvedStoryViews(story);

                        return (
                          <motion.button
                            key={story.id}
                            ref={(element) => {
                              storyRefs.current[story.id] = element;
                            }}
                            type="button"
                            onClick={() => handleSelectThumbnail(story.id)}
                            initial={{
                              opacity: 0,
                              scale: 0.92,
                              width: isActive ? 56 : 48,
                            }}
                            animate={{
                              opacity: 1,
                              scale: 1,
                              width: isActive ? 56 : 48,
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
                                width: isActive ? 56 : 48,
                                height: isActive ? 100 : 84,
                                scale: isActive ? 1.1 : 1,
                                opacity: isActive ? 1 : 0.8,
                              }}
                              transition={{
                                duration: 0.28,
                                ease: [0.22, 1, 0.36, 1],
                              }}
                              className={[
                                "relative overflow-hidden rounded-md bg-[#0C0F14] shadow-sm will-change-transform",
                                isActive ? "ring-2 ring-[#3a3a3a]" : "",
                              ].join(" ")}
                            >
                              {thumbnail ? (
                                <img
                                  src={thumbnail}
                                  alt=""
                                  draggable={false}
                                  className="h-full w-full select-none object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center bg-[#0C0F14]">
                                  <Camera size={24} className="text-white" />
                                </div>
                              )}

                              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent px-1 pb-1 pt-5">
                                <div className="flex items-center justify-center gap-0.5 text-[10px] font-semibold !text-white">
                                  <img
                                    src="/7.png"
                                    className="w-[11px] grayscale brightness-200"
                                    alt=""
                                  />
                                  <span className=" !text-white">{storyViews}</span>
                                </div>
                              </div>
                            </motion.div>
                          </motion.button>
                        );
                      })}
                    </AnimatePresence>

                    <button
                      type="button"
                      className="relative shrink-0 pt-4 active:scale-95"
                    >
                      <div className="flex h-[84px] w-[48px] items-center justify-center rounded-md bg-[#0C0F14] ring-1 ring-white/10">
                        <Camera size={25} className="text-white" />
                      </div>
                    </button>
                  </div>

                  <div className="app-insights-pointer absolute bottom-0 left-1/2 h-0 w-0 -translate-x-1/2 border-x-[12px] border-x-transparent" />
                </div>
              </div>

              <div className="flex h-[58px] items-center border-b border-white/10 bg-[#0C0F14] px-3">
                <button
                  type="button"
                  onClick={() => setPage("insights")}
                  className={[
                    "relative flex h-full min-w-[58px] items-center justify-center",
                    page === "insights" ? "text-[#1f81c7]" : "text-zinc-400",
                  ].join(" ")}
                >
                  <BiBarChart size={27} />

                  {page === "insights" && (
                    <motion.div
                      layoutId="insights-tab-indicator"
                      className="absolute bottom-0 left-0 right-0 mx-auto h-[2px] w-full rounded-full bg-[#1f81c7]"
                    />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setPage("viewers")}
                  className={[
                    "relative ml-4 flex h-full items-center gap-2 px-1 transition-colors duration-200",
                    page === "viewers" ? "text-[#1f81c7]" : "text-zinc-400",
                  ].join(" ")}
                >
                  <img
                    src="/7.png"
                    className={[
                      "w-[23px] transition-all duration-200",
                      page === "viewers"
                        ? "opacity-100"
                        : "opacity-70 grayscale brightness-200",
                    ].join(" ")}
                    alt=""
                  />

                  <span
                    className={[
                      "text-[13px] font-bold",
                      page === "viewers" ? "text-[#1f81c7]" : "text-zinc-400",
                    ].join(" ")}
                  >
                    {formatCompact(metrics.views)}
                  </span>

                  {page === "viewers" && (
                    <motion.div
                      layoutId="viewers-tab-indicator"
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

              <div className="relative min-h-0 flex-1 overflow-hidden bg-[#0C0F14]">
                <motion.div
                  animate={{
                    x: page === "insights" ? "0%" : "-50%",
                  }}
                  transition={{
                    duration: 0.22,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="flex h-full w-[200%]"
                >
                  <div className="h-full w-1/2 flex-shrink-0 overflow-y-auto bg-[#0C0F14] pb-10">
                    <AnimatePresence mode="wait">
                      {isInsightsLoading ? (
                        <motion.div
                          key="insights-skeleton"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
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

                              {activeStoryExtras?.LinkClicks ? (
                                <MetricSummaryRow
                                  label="Link clicks"
                                  value={metrics.linkClicks}
                                />
                              ) : null}

                              {activeStoryExtras?.stickerTaps ? (
                                <MetricSummaryRow
                                  label="Sticker taps"
                                  value={metrics.stickerTaps}
                                />
                              ) : null}
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

                  <div className="h-full w-1/2 flex-shrink-0 overflow-y-auto bg-[#0C0F14] pb-10">
                    <motion.div
                      key={`viewers-${activeStoryId}`}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.22,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      className="pt-4"
                    >
                      <div className="mb-3 flex items-center justify-between px-4">
                        <h3 className="text-[16px] font-semibold">Viewers</h3>

                        <span className="text-[13px] font-semibold">
                          {formatNumber(metrics.views)}
                        </span>
                      </div>

                      {viewers ? (
                        <img src={viewers} alt="Viewers" className="w-full" />
                      ) : (
                        <div className="px-4 pt-6 text-center text-sm text-zinc-500">
                          No viewers image found
                        </div>
                      )}

                      {alternatingViewerImage ? (
                        <img
                          src={alternatingViewerImage}
                          alt={
                            selectedStoryIndex % 2 === 0
                              ? "Viewers image 2"
                              : "Viewers image 3"
                          }
                          className="w-full"
                        />
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
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <h2 className="text-[19px] font-bold leading-none text-white">{title}</h2>

      <Info size={18} strokeWidth={2.2} className="text-zinc-400" />
    </div>
  );
}

function MetricSummaryRow({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div className="flex items-center justify-between py-0.5">
      <span className="text-[15px] text-zinc-200">{label}</span>

      <span className="text-[15px] font-semibold text-white">
        {typeof value === "number" ? value.toLocaleString("en-US") : value}
      </span>
    </div>
  );
}

function DonutInsightChart({
  title,
  value,
  data,
}: {
  title: string;
  value: number;
  data: {
    name: string;
    value: number;
    color: string;
  }[];
}) {
  const chartData = data.map((item) => ({
    ...item,

    // فقط برای نمایش slice نمودار است.
    // مقدار نوشته‌شده پایین نمودار همچنان مقدار واقعی است.
    displayValue:
      item.name === "Non-followers" ? Math.max(item.value, 3) : item.value,
  }));

  return (
    <div className="pt-4">
      <div className="relative mx-auto h-[230px] w-[230px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="displayValue"
              innerRadius={88}
              outerRadius={103}
              startAngle={90}
              endAngle={-270}
              stroke="none"
              cornerRadius={6}
              animationDuration={400}
            >
              {chartData.map((entry, index) => (
                <Cell key={`chart-cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[12px] text-zinc-500">{title}</span>

          <span className="mt-1 text-[22px] font-bold text-white">
            {Number(value || 0).toLocaleString("en-US")}
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

            <span className="text-[14px] text-white">
              {Number(item.value || 0).toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Divider() {
  return <div className="mt-8 h-[1px] w-full bg-white/10" />;
}
