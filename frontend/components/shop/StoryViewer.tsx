"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight, Volume2, VolumeX, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { StoryProgressBar } from "@/components/shop/StoryProgressBar";
import type { ContentBlock, ContentBlockMedia } from "@/types";
import { assetUrl } from "@/lib/utils/assetUrl";

interface StoryViewerProps {
  stories: ContentBlock[];
  initialIndex: number;
  onClose: () => void;
  onViewed?: (storyId: string) => void;
}

type StoryMedia = ContentBlockMedia;

const imageDuration = 5000;
const tickMs = 50;

export function StoryViewer({ initialIndex, onClose, onViewed, stories }: Readonly<StoryViewerProps>) {
  const [storyIndex, setStoryIndex] = useState(initialIndex);
  const [mediaIndex, setMediaIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const currentStory = stories[storyIndex];
  const media = useMemo(() => getStoryMedia(currentStory), [currentStory]);
  const currentMedia = media[mediaIndex] ?? media[0];
  const closeTimerRef = useRef<number | null>(null);

  const closeWithFade = useCallback(() => {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
    }
    closeTimerRef.current = window.setTimeout(onClose, 160);
  }, [onClose]);

  const goToNext = useCallback(() => {
    setProgress(0);
    if (mediaIndex < media.length - 1) {
      setMediaIndex((current) => current + 1);
      return;
    }
    if (storyIndex < stories.length - 1) {
      setStoryIndex((current) => current + 1);
      setMediaIndex(0);
      return;
    }
    closeWithFade();
  }, [closeWithFade, media.length, mediaIndex, stories.length, storyIndex]);

  const goToPrev = useCallback(() => {
    setProgress(0);
    if (mediaIndex > 0) {
      setMediaIndex((current) => current - 1);
      return;
    }
    if (storyIndex > 0) {
      const previousStory = stories[storyIndex - 1];
      setStoryIndex((current) => current - 1);
      setMediaIndex(Math.max(getStoryMedia(previousStory).length - 1, 0));
    }
  }, [mediaIndex, stories, storyIndex]);

  useEffect(() => {
    setStoryIndex(Math.min(Math.max(initialIndex, 0), stories.length - 1));
    setMediaIndex(0);
    setProgress(0);
  }, [initialIndex, stories.length]);

  useEffect(() => {
    if (currentStory) {
      onViewed?.(currentStory.id);
    }
  }, [currentStory, onViewed]);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
      if (closeTimerRef.current) {
        window.clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowRight") goToNext();
      if (event.key === "ArrowLeft") goToPrev();
      if (event.key === "Escape") closeWithFade();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closeWithFade, goToNext, goToPrev]);

  useEffect(() => {
    if (isPaused || isVideo(currentMedia)) {
      return;
    }

    let elapsed = 0;
    const timer = window.setInterval(() => {
      elapsed += tickMs;
      setProgress((elapsed / imageDuration) * 100);
      if (elapsed >= imageDuration) {
        window.clearInterval(timer);
        goToNext();
      }
    }, tickMs);

    return () => window.clearInterval(timer);
  }, [currentMedia, goToNext, isPaused]);

  if (!currentStory || !currentMedia) {
    return null;
  }

  const handleTouchEnd = (x: number) => {
    if (touchStartX === null) return;
    const delta = touchStartX - x;
    setTouchStartX(null);
    if (Math.abs(delta) < 50) return;
    if (delta > 0) {
      goToNext();
    } else {
      goToPrev();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 animate-in fade-in duration-200 bg-black text-white"
      onMouseLeave={() => setIsPaused(false)}
      onTouchCancel={() => setIsPaused(false)}
      onTouchStart={(event) => {
        setTouchStartX(event.touches[0]?.clientX ?? null);
        setIsPaused(true);
      }}
      onTouchEnd={(event) => {
        setIsPaused(false);
        handleTouchEnd(event.changedTouches[0]?.clientX ?? 0);
      }}
    >
      <div className="absolute left-0 right-0 top-0 z-30 bg-gradient-to-b from-black/70 to-transparent pb-12">
        <StoryProgressBar count={media.length} current={mediaIndex} progress={progress} />
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex min-w-0 items-center gap-3">
            <img alt={currentStory.title} className="size-9 rounded-full border border-white/40 object-cover" src={assetUrl(currentStory.imageUrl)} />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white">{currentStory.title}</p>
              <p className="text-xs text-white/55">{formatStoryDate(currentStory.createdAt)}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {isVideo(currentMedia) ? (
              <button className="inline-flex size-10 items-center justify-center rounded-full text-white/80 hover:bg-white/10 hover:text-white" type="button" onClick={() => setIsMuted((current) => !current)}>
                {isMuted ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
              </button>
            ) : null}
            <button className="inline-flex size-10 items-center justify-center rounded-full text-white/80 hover:bg-white/10 hover:text-white" type="button" onClick={closeWithFade} aria-label="Close story">
              <X className="size-6" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex size-full items-center justify-center px-0 sm:px-20">
        {isVideo(currentMedia) ? (
          <video
            key={currentMedia.id}
            autoPlay
            className="max-h-full max-w-full object-contain"
            muted={isMuted}
            playsInline
            src={assetUrl(currentMedia.mediaUrl)}
            onEnded={goToNext}
            onTimeUpdate={(event) => {
              const video = event.currentTarget;
              if (!video.duration || Number.isNaN(video.duration)) return;
              setProgress((video.currentTime / video.duration) * 100);
            }}
          />
        ) : (
          <img alt={currentStory.title} className="max-h-full max-w-full object-contain" src={assetUrl(currentMedia.mediaUrl)} />
        )}
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/75 to-transparent px-5 pb-8 pt-24">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-lg font-semibold text-white">{currentStory.title}</h2>
          {currentStory.subtitle ? <p className="mt-2 text-sm leading-6 text-white/70">{currentStory.subtitle}</p> : null}
          {currentStory.linkUrl ? (
            <Link className="pointer-events-auto mt-4 inline-flex h-9 items-center rounded-full border border-white/30 px-4 text-sm text-white hover:bg-white hover:text-black" href={currentStory.linkUrl}>
              了解更多
            </Link>
          ) : null}
        </div>
      </div>

      <button className="absolute left-0 top-0 z-10 h-full w-1/2 cursor-default" type="button" aria-label="Previous story media" onClick={goToPrev} onMouseDown={() => setIsPaused(true)} onMouseUp={() => setIsPaused(false)} />
      <button className="absolute right-0 top-0 z-10 h-full w-1/2 cursor-default" type="button" aria-label="Next story media" onClick={goToNext} onMouseDown={() => setIsPaused(true)} onMouseUp={() => setIsPaused(false)} />
      <button className="absolute left-4 top-1/2 z-20 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white/80 backdrop-blur hover:bg-white/20 hover:text-white sm:inline-flex" type="button" onClick={goToPrev}>
        <ChevronLeft className="size-6" />
      </button>
      <button className="absolute right-4 top-1/2 z-20 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white/80 backdrop-blur hover:bg-white/20 hover:text-white sm:inline-flex" type="button" onClick={goToNext}>
        <ChevronRight className="size-6" />
      </button>
    </div>
  );
}

function getStoryMedia(story?: ContentBlock): StoryMedia[] {
  if (!story) {
    return [];
  }
  if (story.media?.length) {
    return [...story.media].sort((a, b) => a.position - b.position);
  }
  return [{ id: story.id, mediaType: "Image", mediaUrl: story.imageUrl, position: 0 }];
}

function isVideo(media?: StoryMedia) {
  return media?.mediaType?.toLowerCase() === "video";
}

function formatStoryDate(value: string) {
  return new Intl.DateTimeFormat("zh-TW", { month: "short", day: "numeric" }).format(new Date(value));
}
