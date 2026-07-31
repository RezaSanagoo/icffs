import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Link2,
  MoreHorizontal,
  X,
} from "lucide-react";

import {
  useArchiveStories,
  useStoryInsights,
  useStoryView,
} from "../hooks/useStories";
import { useActiveProfile } from "../hooks/useProfile";

import StoryInsightsDrawer from "./StoryInsightsDrawer";

const DEFAULT_STORY_DURATION = 5000;
const LONG_PRESS_DELAY = 200;
const SWIPE_UP_THRESHOLD = 100;
const HORIZONTAL_SWIPE_THRESHOLD = 50;

interface StoryMentionTarget {
  id: string;
  username: string;
  display_name: string;
  avatarUrl: string;
  url: string;
}

interface StoryInteractiveElement {
  id: string;
  elementType: "link" | "mention";
  title: string;
  url: string;
  mentionTarget: StoryMentionTarget | null;
  x: number;
  y: number;
  width: number;
  height: number;
  popupX: number;
  popupY: number;
  order: number;
}

interface ActiveStoryPopupProps {
  element: StoryInteractiveElement;
}
const getStoryDateKey = (dateString?: string) => {
  if (!dateString) return null;

  // اگر createdAt به شکل ISO باشد:
  // 2026-07-30T12:30:00Z
  return dateString.slice(0, 10);
};
export default function StoryViewer() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const storyId = searchParams.get("story");

  const { data: storiesData, isLoading, isError } = useArchiveStories();
  const { data: activeProfile } = useActiveProfile();
  const viewMutation = useStoryView();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [swipeY, setSwipeY] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [insightsStoryId, setInsightsStoryId] = useState<string | null>(null);
  const [activePopup, setActivePopup] = useState<{
    element: StoryInteractiveElement;
    x: number;
    y: number;
  } | null>(null);

  const [showHitboxes, setShowHitboxes] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const progressRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);
  const timerStartedAtRef = useRef<number | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const longPressTimerRef = useRef<number | null>(null);
  const viewedStoriesRef = useRef<Set<string>>(new Set());
  const navigationLockedRef = useRef(false);

  const LINK_HITBOX_SIZE = {
    width: 76,
    height: 10,
  };

  const MENTION_HITBOX_SIZE = {
    width: 68,
    height: 12,
  };

  const getHitboxSize = (elementType: "link" | "mention") => {
    if (elementType === "mention") return MENTION_HITBOX_SIZE;
    return LINK_HITBOX_SIZE;
  };

  const allStories = storiesData?.stories ?? [];

  const stories = useMemo(() => {
    if (!activeProfile?.id) return allStories;
    return allStories.filter((story) => story.profileId === activeProfile.id);
  }, [allStories, activeProfile?.id]);

  useEffect(() => {
    if (!storyId || stories.length === 0) return;

    const index = stories.findIndex((story) => story.id === storyId);

    if (index !== -1 && index !== currentIndex) {
      setCurrentIndex(index);
    }
  }, [storyId, stories, currentIndex]);

  useEffect(() => {
    if (stories.length === 0) return;
    if (currentIndex < stories.length) return;

    setCurrentIndex(0);
    navigate(`/stories?story=${stories[0].id}`, { replace: true });
  }, [stories, currentIndex, navigate]);

  const currentStory = stories[currentIndex];
  const activeInsightsStoryId = insightsStoryId ?? currentStory?.id;

  const currentDayStories = useMemo(() => {
    if (!currentStory?.createdAt) return [];

    const currentDateKey = getStoryDateKey(currentStory.createdAt);
    if (!currentDateKey) return [];

    return stories.filter(
      (story) => getStoryDateKey(story.createdAt) === currentDateKey,
    );
  }, [stories, currentStory?.createdAt]);
  const currentDayIndex = useMemo(() => {
    if (!currentStory) return -1;

    return currentDayStories.findIndex((story) => story.id === currentStory.id);
  }, [currentDayStories, currentStory?.id]);

  const getDateKey = (dateString?: string) => {
    if (!dateString) return null;

    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return null;

    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  };

  const insightsStories = useMemo(() => {
    if (!activeInsightsStoryId) return [];

    const selectedStory = stories.find(
      (story) => story.id === activeInsightsStoryId,
    );
    if (!selectedStory) return [];

    const selectedDateKey = getDateKey(selectedStory.createdAt);
    if (!selectedDateKey) return [];

    return stories.filter(
      (story) => getDateKey(story.createdAt) === selectedDateKey,
    );
  }, [stories, activeInsightsStoryId]);

  const { data: insightsData, isLoading: isInsightsLoading } = useStoryInsights(
    activeInsightsStoryId || "",
  );

  const getStoryDurationMs = useCallback(() => {
    if (!currentStory) return DEFAULT_STORY_DURATION;

    if (currentStory.mediaType === "video") {
      const video = videoRef.current;

      if (video && Number.isFinite(video.duration) && video.duration > 0) {
        return video.duration * 1000;
      }

      return DEFAULT_STORY_DURATION;
    }

    if (typeof currentStory.duration === "number") {
      return currentStory.duration > 0
        ? currentStory.duration * 1000
        : DEFAULT_STORY_DURATION;
    }

    if (typeof currentStory.duration === "string") {
      const parsed = Number(currentStory.duration);

      return Number.isFinite(parsed) && parsed > 0
        ? parsed
        : DEFAULT_STORY_DURATION;
    }

    return DEFAULT_STORY_DURATION;
  }, [currentStory]);

  const handleClose = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const handleNext = useCallback(() => {
    if (navigationLockedRef.current || stories.length === 0) return;

    navigationLockedRef.current = true;
    setActivePopup(null);
    setShowHitboxes(false);
    progressRef.current = 0;
    setProgress(0);

    if (currentIndex < stories.length - 1) {
      const nextIndex = currentIndex + 1;

      setCurrentIndex(nextIndex);
      navigate(`/stories?story=${stories[nextIndex].id}`, { replace: true });

      window.setTimeout(() => {
        navigationLockedRef.current = false;
      }, 250);

      return;
    }

    handleClose();
  }, [currentIndex, stories, navigate, handleClose]);

  const handlePrev = useCallback(() => {
    if (
      navigationLockedRef.current ||
      stories.length === 0 ||
      currentIndex <= 0
    ) {
      return;
    }

    navigationLockedRef.current = true;
    setActivePopup(null);
    setShowHitboxes(false);
    progressRef.current = 0;
    setProgress(0);

    const prevIndex = currentIndex - 1;

    setCurrentIndex(prevIndex);
    navigate(`/stories?story=${stories[prevIndex].id}`, { replace: true });

    window.setTimeout(() => {
      navigationLockedRef.current = false;
    }, 250);
  }, [currentIndex, stories, navigate]);

  useEffect(() => {
    if (!currentStory) return;

    setActivePopup(null);
    setShowHitboxes(false);
    progressRef.current = 0;
    setProgress(0);

    const storyKey = currentStory.id;

    if (!viewedStoriesRef.current.has(storyKey)) {
      viewedStoriesRef.current.add(storyKey);

      viewMutation.mutate(storyKey);
    }
  }, [currentStory?.id]);

  useEffect(() => {
    if (!currentStory) return;

    const cancelAnimation = () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };

    cancelAnimation();

    if (isPaused || showInsights || activePopup) {
      timerStartedAtRef.current = null;
      return cancelAnimation;
    }

    const isVideo = currentStory.mediaType === "video";
    const storyDuration = getStoryDurationMs();

    if (!isVideo) {
      const alreadyElapsed = (progressRef.current / 100) * storyDuration;
      timerStartedAtRef.current = performance.now() - alreadyElapsed;
    }

    const updateProgress = (timestamp: number) => {
      let nextProgress = progressRef.current;

      if (isVideo && videoRef.current) {
        const video = videoRef.current;
        const duration = video.duration;

        if (Number.isFinite(duration) && duration > 0) {
          nextProgress = Math.min((video.currentTime / duration) * 100, 100);
        }
      } else if (timerStartedAtRef.current !== null) {
        const elapsed = timestamp - timerStartedAtRef.current;
        nextProgress = Math.min((elapsed / storyDuration) * 100, 100);
      }

      progressRef.current = nextProgress;
      setProgress(nextProgress);

      if (nextProgress >= 100) {
        handleNext();
        return;
      }

      animationFrameRef.current = requestAnimationFrame(updateProgress);
    };

    animationFrameRef.current = requestAnimationFrame(updateProgress);

    return cancelAnimation;
  }, [
    currentStory?.id,
    currentStory?.mediaType,
    isPaused,
    showInsights,
    activePopup,
    handleNext,
    getStoryDurationMs,
  ]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPaused || showInsights || activePopup) {
      video.pause();
      return;
    }

    void video.play().catch(() => undefined);
  }, [isPaused, showInsights, activePopup, currentStory?.id]);

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "touch") return;

    longPressTimerRef.current = window.setTimeout(() => {
      setIsPaused(true);
    }, LONG_PRESS_DELAY);
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "touch") return;

    if (longPressTimerRef.current !== null) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    if (!activePopup) {
      setIsPaused(false);
    }
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    const touch = event.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };

    longPressTimerRef.current = window.setTimeout(() => {
      setIsPaused(true);
    }, LONG_PRESS_DELAY);
  };

  const handleTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    if (!touchStartRef.current) return;

    const touch = event.touches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touchStartRef.current.y - touch.clientY;

    if (deltaY > 20 && Math.abs(deltaX) < 50) {
      setIsSwiping(true);
      setSwipeY(Math.min(deltaY, 240));
    }
  };

  const resetTouchState = useCallback(() => {
    if (longPressTimerRef.current !== null) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    if (!activePopup) {
      setIsPaused(false);
    }

    setIsSwiping(false);
    setSwipeY(0);
    touchStartRef.current = null;
  }, [activePopup]);

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (longPressTimerRef.current !== null) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    if (!touchStartRef.current) {
      resetTouchState();
      return;
    }

    const touch = event.changedTouches[0];
    const deltaX = touchStartRef.current.x - touch.clientX;
    const deltaY = touchStartRef.current.y - touch.clientY;

    if (isSwiping && deltaY > SWIPE_UP_THRESHOLD && insightsData) {
      setShowInsights(true);
      setIsPaused(true);
      setIsSwiping(false);
      setSwipeY(0);
      touchStartRef.current = null;
      return;
    }

    const isHorizontalSwipe =
      Math.abs(deltaX) > HORIZONTAL_SWIPE_THRESHOLD &&
      Math.abs(deltaY) < HORIZONTAL_SWIPE_THRESHOLD;

    resetTouchState();

    if (!isHorizontalSwipe) return;

    if (deltaX > 0) {
      handleNext();
    } else {
      handlePrev();
    }
  };

  const handleContentClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (isSwiping || showInsights) return;

    const target = event.target as HTMLElement;
    if (target.closest('[data-story-control="true"]')) return;

    if (activePopup) {
      setActivePopup(null);
      setIsPaused(false);
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - rect.left;

    if (clickX < rect.width * 0.35) {
      handlePrev();
      return;
    }

    if (clickX > rect.width * 0.65) {
      handleNext();
    }
  };

  const openInsights = () => {
    if (!insightsData || !currentStory) return;

    setInsightsStoryId(currentStory.id);
    setIsPaused(true);
    setShowInsights(true);
  };

  const handleInsightsClose = () => {
    setShowInsights(false);
    setIsPaused(false);
    setInsightsStoryId(null);
  };

  const openInteractiveElement = (
    event: ReactMouseEvent<HTMLButtonElement>,
    element: StoryInteractiveElement,
  ) => {
    event.stopPropagation();

    const storyContainer = event.currentTarget.closest(
      '[data-story-canvas="true"]',
    ) as HTMLElement | null;

    if (!storyContainer) return;

    const rect = storyContainer.getBoundingClientRect();

    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    const safeX = Math.min(Math.max(clickX, 110), rect.width - 60);
    const safeY = Math.max(clickY, 110);

    setActivePopup({
      element,
      x: safeX,
      y: safeY,
    });

    setIsPaused(true);
  };

  const closeInteractivePopup = () => {
    setActivePopup(null);
    setIsPaused(false);
  };

  const formatStoryTime = (dateString?: string) => {
    if (!dateString) return "";

    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "";

    const diffMs = Date.now() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 1000 / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) return "now";
    if (diffMinutes < 60) return `${diffMinutes}m`;
    if (diffHours < 24) return `${diffHours}h`;

    return `${diffDays}d`;
  };

  if (isLoading) {
    return (
      <ViewerState>
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      </ViewerState>
    );
  }

  if (isError) {
    return (
      <ViewerState>
        <div className="px-6 text-center text-white">
          <p className="mb-2 text-lg font-semibold">Failed to load stories</p>
          <p className="mb-5 text-sm text-white/55">
            Please check backend/API and try again.
          </p>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-white/90"
          >
            Close
          </button>
        </div>
      </ViewerState>
    );
  }

  if (stories.length === 0) {
    return (
      <ViewerState>
        <div className="px-6 text-center text-white">
          <p className="mb-5 text-lg font-semibold">No stories available</p>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-white/90"
          >
            Close
          </button>
        </div>
      </ViewerState>
    );
  }

  if (!currentStory) {
    return (
      <ViewerState>
        <div className="px-6 text-center text-white">
          <p className="mb-5 text-lg font-semibold">Story not found</p>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-white/90"
          >
            Close
          </button>
        </div>
      </ViewerState>
    );
  }

  const storyTime = formatStoryTime(currentStory.createdAt);
  const displayName = activeProfile?.username || activeProfile?.fullName || "";
  const avatar = activeProfile?.avatar || "";
  const interactiveElements = (currentStory.interactiveElements ??
    []) as StoryInteractiveElement[];

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 overflow-hidden bg-[#0a0a0a]"
      >
        <div className="pointer-events-none absolute inset-0 hidden sm:block">
          <div
            className="absolute inset-0 scale-110 bg-cover bg-center opacity-25 blur-3xl"
            style={{
              backgroundImage: currentStory.thumbnailUrl
                ? `url("${currentStory.thumbnailUrl}")`
                : currentStory.mediaType === "image"
                  ? `url("${currentStory.mediaUrl}")`
                  : undefined,
            }}
          />
          <div className="absolute inset-0 bg-black/70" />
        </div>

        <div className="relative flex h-full w-full items-center justify-center">
          <button
            type="button"
            data-story-control="true"
            aria-label="Close stories"
            onClick={handleClose}
            className="absolute right-5 top-5 z-40 hidden h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-xl transition hover:bg-white/20 sm:flex"
          >
            <X size={26} />
          </button>

          {currentIndex > 0 && (
            <button
              type="button"
              data-story-control="true"
              aria-label="Previous story"
              onClick={handlePrev}
              className="absolute left-5 z-30 hidden h-11 w-11 items-center justify-center rounded-full bg-white text-black shadow-2xl transition hover:scale-105 sm:flex lg:left-[calc(50%-280px)]"
            >
              <ChevronLeft size={25} />
            </button>
          )}

          {currentIndex < stories.length - 1 && (
            <button
              type="button"
              data-story-control="true"
              aria-label="Next story"
              onClick={handleNext}
              className="absolute right-5 z-30 hidden h-11 w-11 items-center justify-center rounded-full bg-white text-black shadow-2xl transition hover:scale-105 sm:flex lg:right-[calc(50%-280px)]"
            >
              <ChevronRight size={25} />
            </button>
          )}

          <motion.div
            animate={{
              y: showInsights ? -64 : -swipeY * 0.3,
              scale: showInsights ? 0.92 : 1,
              borderRadius: showInsights ? 24 : 0,
            }}
            transition={{
              type: "spring",
              stiffness: 320,
              damping: 30,
            }}
            className="relative h-full w-full overflow-hidden bg-black shadow-2xl sm:h-[min(94dvh,920px)] sm:w-auto sm:aspect-[9/16] sm:rounded-2xl"
          >
            <div
              className="absolute inset-0 select-none overflow-hidden bg-black"
              onClick={handleContentClick}
              onPointerDown={handlePointerDown}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              onPointerLeave={handlePointerUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onTouchCancel={resetTouchState}
              data-story-canvas="true"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStory.id}
                  initial={{ opacity: 0, scale: 1.015 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.985 }}
                  transition={{ duration: 0.22 }}
                  className="absolute inset-0 flex h-[calc(100vw*1.777)] w-full items-center justify-center bg-black"
                >
                  {currentStory.mediaType === "image" ? (
                    <img
                      src={currentStory.mediaUrl}
                      alt="Story"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <video
                      ref={videoRef}
                      src={currentStory.mediaUrl}
                      poster={currentStory.thumbnailUrl || undefined}
                      className="h-full w-full object-cover"
                      autoPlay
                      playsInline
                      muted
                      preload="auto"
                      onLoadedMetadata={() => {
                        if (!isPaused && !showInsights && !activePopup) {
                          void videoRef.current?.play().catch(() => undefined);
                        }
                      }}
                      onEnded={handleNext}
                    />
                  )}
                </motion.div>
              </AnimatePresence>

              <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-40 bg-gradient-to-b from-black/65 via-black/25 to-transparent" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-48 bg-gradient-to-t from-black/90 via-black/45 to-transparent" />

<div
  data-story-control="true"
  className="absolute inset-x-0 top-0 z-50 flex gap-[3px] px-2 pt-[max(8px,env(safe-area-inset-top))]"
>
  {currentDayStories.map((story, index) => {
    const isCurrentStory = story.id === currentStory.id
    const isPassedStory = currentDayIndex !== -1 && index < currentDayIndex

    return (
      <div
        key={story.id}
        className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/35"
      >
        <div
          className="h-full rounded-full bg-white"
          style={{
            width: isCurrentStory
              ? `${progress}%`
              : isPassedStory
                ? '100%'
                : '0%',
          }}
        />
      </div>
    )
  })}
</div>


              <header
                data-story-control="true"
                className="absolute inset-x-0 top-0 z-30 flex items-center gap-3 px-3 pt-[max(22px,calc(env(safe-area-inset-top)+18px))]"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full border border-white/80 bg-white/15">
                  {avatar ? (
                    <img
                      src={avatar}
                      alt={displayName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs font-bold uppercase text-white">
                      {displayName.slice(0, 1)}
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex min-w-0 items-center gap-2">
                    {displayName && (
                      <span className="truncate text-[13px] font-semibold text-white drop-shadow-md">
                        {displayName}
                      </span>
                    )}

                    {storyTime && (
                      <span className="shrink-0 text-xs text-white/65">
                        {storyTime}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  aria-label="Show interactive areas"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowHitboxes((prev) => !prev);
                  }}
                  className={[
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white transition",
                    showHitboxes ? "bg-white/20" : "hover:bg-white/10",
                  ].join(" ")}
                >
                  <MoreHorizontal size={24} />
                </button>

                <button
                  type="button"
                  aria-label="Close stories"
                  onClick={handleClose}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white transition hover:bg-white/10 sm:hidden"
                >
                  <X size={27} />
                </button>
              </header>

              <AnimatePresence>
                {isPaused && !showInsights && !activePopup && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center"
                  >
                    <div className="flex h-14 w-14 items-center justify-center gap-1.5 rounded-full bg-black/35 backdrop-blur-md">
                      <span className="h-6 w-1.5 rounded-full bg-white" />
                      <span className="h-6 w-1.5 rounded-full bg-white" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              {interactiveElements.map((element) => {
                const size = getHitboxSize(element.elementType);

                return (
                  <button
                    key={element.id}
                    type="button"
                    data-story-control="true"
                    aria-label="Open story popup"
                    onClick={(event) => openInteractiveElement(event, element)}
                    className={[
                      "absolute z-30 rounded-2xl outline-none transition",
                      showHitboxes
                        ? "bg-sky-400/20 ring-2 ring-sky-300/80 backdrop-blur-[1px]"
                        : "bg-transparent",
                    ].join(" ")}
                    style={{
                      left: `${element.x}%`,
                      top: `${element.y}%`,
                      width: `${size.width}%`,
                      height: `${size.height}%`,
                    }}
                  >
                    {showHitboxes && (
                      <span className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full bg-black/65 px-3 py-1 text-[11px] font-semibold text-white shadow-xl backdrop-blur-md">
                        {element.elementType === "link"
                          ? "Visit Link"
                          : "Mention"}
                      </span>
                    )}
                  </button>
                );
              })}

              <AnimatePresence>
                {activePopup && (
                  <motion.div
                    data-story-control="true"
                    className="absolute z-50"
                    style={{
                      left: activePopup.x,
                      top: activePopup.y - 10,
                      transform: "translate(-50%, calc(-100% - 14px))",
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <StoryInteractivePopup element={activePopup.element} />
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {insightsData && !showInsights && swipeY === 0 && (
                  <motion.button
                    type="button"
                    data-story-control="true"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      openInsights();
                    }}
                    className="absolute bottom-[104px] left-[calc(50%-31px)] z-30 -translate-x-1/2"
                  >
                    {/* <motion.div
                      animate={{ y: [0, -4, 0] }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                      className="flex flex-col items-center text-white"
                    >
                      <ChevronRight size={17} className="-mb-1 -rotate-90" />
                      <span className="whitespace-nowrap text-[11px] font-medium drop-shadow-lg">
                        View activity
                      </span>
                    </motion.div> */}
                  </motion.button>
                )}
              </AnimatePresence>

              <div
                data-story-control="true"
                className="absolute inset-x-0 bottom-0 z-30 flex items-end justify-between px-5 pb-[max(13px,env(safe-area-inset-bottom))]"
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
                onPointerUp={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                onTouchEnd={(e) => e.stopPropagation()}
              >
                <StoryActionButton
                  label="Activity"
                  onClick={openInsights}
                  disabled={!insightsData}
                  icon={
                    avatar ? (
                      <div className="h-7 w-7 overflow-hidden rounded-full border border-white/75">
                        <img
                          src={avatar}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <Activity size={25} strokeWidth={1.8} />
                    )
                  }
                />

                <div className="flex items-end gap-6">
                  <StoryActionButton
                    label="Boost"
                    icon={
                      <a
                        href={`https://be.1nsta.ir/admin/stories/story/${storyId}`}
                      >
                        <img src="/5.png" alt="" className="w-6 p-0.5" />
                      </a>
                    }
                  />

                  <StoryActionButton
                    label="Highlight"
                    icon={
                      <span className="flex h-7 w-7 items-center justify-center rounded-full">
                        <img src="/4.png" alt="" className="p-0.5" />
                      </span>
                    }
                  />

                  <StoryActionButton
                    label="More"
                    icon={<MoreHorizontal size={26} strokeWidth={1.8} />}
                  />
                </div>
              </div>

              <button
                type="button"
                tabIndex={-1}
                aria-label="Previous story"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
                className="absolute bottom-24 left-0 top-20 z-10 w-[30%] bg-transparent"
              />

              <button
                type="button"
                tabIndex={-1}
                aria-label="Next story"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                className="absolute bottom-24 right-0 top-20 z-10 w-[30%] bg-transparent"
              />
            </div>
          </motion.div>
        </div>
      </motion.div>

      <StoryInsightsDrawer
        isOpen={showInsights}
        onClose={handleInsightsClose}
        insights={insightsData}
        isInsightsLoading={isInsightsLoading}
        stories={insightsStories}
        activeStoryId={activeInsightsStoryId}
        viewers={activeProfile?.viewerImage}
        viewers2={activeProfile?.viewerImage2}
        onSelectStory={(id) => {
          if (id === activeInsightsStoryId) return;
          setInsightsStoryId(id);
        }}
      />
    </>
  );
}

function StoryInteractivePopup({ element }: ActiveStoryPopupProps) {
  if (element.elementType === "mention") {
    const target = element.mentionTarget;

    if (!target) return null;

    const displayName = target.display_name || target.username;
    const href = target.url || undefined;

    const content = (
      <>
        <div className="relative flex items-center justify-center gap-2  min-w-[10px]   rounded-[10px]  px-2 py-2 bg-black/10 text-white backdrop-blur-lg z-10">
          <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full mr-1">
            {target.avatarUrl ? (
              <img
                src={target.avatarUrl}
                alt={displayName}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm font-bold uppercase">
                {displayName.slice(0, 1)}
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold leading-tight">
              {displayName}
            </div>
            {/* <div className="truncate text-xs text-white/70">
            @{target.username}
          </div> */}
          </div>

          <div className="flex h-8 shrink-0 items-center justify-center rounded-full bg-white/12">
            <ChevronRight size={18} />
          </div>
        </div>
        <div className="absolute block bottom-0 left-1/2 h-10 w-10 -translate-x-1/2 rotate-45  backdrop-blur-2xl rounded bg-black/40" />
      </>
    );

    if (href) {
      return (
        <a href={href} target="_blank" rel="noreferrer">
          {content}
        </a>
      );
    }

    return content;
  }

  const href = element.url;
  const urlLabel = href
    ? href.replace(/^https?:\/\//, "").replace(/\/$/, "")
    : "";

  return (
    <>
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="relative block min-w-[110px]  rounded-[10px]  px-3 py-3 bg-black/10 drop-shadow-lg text-white backdrop-blur-lg z-10"
      >
        <div className="flex items-center gap-1">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-.5 text-[12px]">
              {element.title || "Visit Link"}
            </div>

            {urlLabel && (
              <div className=" truncate text-[10px] text-white/70">
                {urlLabel}
              </div>
            )}
          </div>

          <ChevronRight size={20} className="shrink-0 opacity-80" />
        </div>
      </a>
      <div className="absolute block bottom-0 left-1/2 h-12 w-12 -translate-x-1/2 rotate-45  backdrop-blur-2xl rounded bg-black/40" />
    </>
  );
}

interface StoryActionButtonProps {
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

function StoryActionButton({
  label,
  icon,
  onClick,
  disabled = false,
}: StoryActionButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="group flex min-w-[45px] flex-col items-center gap-1.5 text-white transition active:scale-95 disabled:cursor-default disabled:opacity-45"
    >
      <span className="flex h-7 items-center justify-center drop-shadow-lg transition-transform group-hover:scale-105">
        {icon}
      </span>
      <span className="text-[11px] font-medium leading-none drop-shadow-lg">
        {label}
      </span>
    </button>
  );
}

function ViewerState({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black"
    >
      {children}
    </motion.div>
  );
}
