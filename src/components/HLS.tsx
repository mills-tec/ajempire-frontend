import { useVideoControlsStore } from "@/lib/stores/video-controls-store";
import Hls from "hls.js";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import { memo, useCallback, useEffect, useRef, useState } from "react";

interface HlsPlayerProps {
  src: string;
  className?: string;
  controls?: boolean;
  /**
   * Reels-style orchestration. true (default): buffer normally and autoplay.
   * false: warm standby — load the manifest and a few seconds of the lowest
   * rendition, then hold PAUSED. Flipping to true on a warm player starts
   * playback in milliseconds instead of re-running the whole manifest chain,
   * and standby players' capped buffers stop them stealing bandwidth from
   * the video actually being watched.
   */
  active?: boolean;
  /** Shown instantly while the first frame loads (e.g. Bunny thumbnail). */
  poster?: string;
}

// Buffer targets for the playing video vs. a warm standby neighbor.
const applyBufferProfile = (hls: Hls, active: boolean) => {
  hls.config.maxBufferLength = active ? 15 : 5;
  hls.config.maxMaxBufferLength = active ? 30 : 10;
};

function HlsPlayerImpl({
  src,
  className,
  controls = false,
  active = true,
  poster,
}: HlsPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const activeRef = useRef(active);
  activeRef.current = active;

  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [muted, setMuted] = useState(true);

  // Chrome visibility is GLOBAL (one inactivity countdown for the whole
  // feed, see video-controls-store): a freshly mounted player inherits the
  // current hidden/shown state instead of resetting it, so scrolling from
  // video to video never makes the controls reappear on their own. Only real
  // user interactions (pointer movement, tapping, control presses) show them.
  const controlsVisible = useVideoControlsStore((s) => s.visible);
  const showControls = useVideoControlsStore((s) => s.show);
  const hideControls = useVideoControlsStore((s) => s.hide);
  const acquireHold = useVideoControlsStore((s) => s.acquireHold);
  const releaseHold = useVideoControlsStore((s) => s.releaseHold);

  // While THIS player is the displayed one and paused, suspend the global
  // countdown so the chrome — once the user has revealed it — stays up (a
  // paused video whose play button melts away reads as broken). It never
  // reveals anything by itself, and standby players (active=false) are
  // paused too but never hold.
  useEffect(() => {
    if (!controls || !active || isPlaying) return;
    acquireHold();
    return releaseHold;
  }, [controls, active, isPlaying, acquireHold, releaseHold]);

  const attemptPlay = useCallback((video: HTMLVideoElement) => {
    video.play().catch(() => {
      const retry = () => {
        video.play().catch(() => {
          /* autoplay blocked by browser policy — leave paused */
        });
        video.removeEventListener("canplay", retry);
      };
      video.addEventListener("canplay", retry, { once: true });
    });
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setIsPlaying(false);

    if (video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
      setIsLoading(false);
    }

    // Guard against double-init (Strict Mode double effect, or src churn)
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    let cancelled = false;
    let safariListener: (() => void) | null = null;

    const handleCanPlay = () => {
      if (!cancelled) setIsLoading(false);
    };

    const handleWaiting = () => {
      if (!cancelled) setIsLoading(true);
    };

    // Reels pattern: call play() the moment the manifest is parsed instead of
    // waiting for canplay — the browser queues the request and starts on the
    // first appended frame (attemptPlay's canplay retry still covers autoplay-
    // policy rejections). Standby players (active=false) skip this entirely:
    // they buffer a capped few seconds and hold paused, first frame visible.
    const startPlaybackWhenReady = () => {
      if (cancelled || !activeRef.current) return;
      attemptPlay(video);
    };

    const onPlay = () => {
      if (!cancelled) setIsPlaying(true);
    };

    const onPause = () => {
      if (!cancelled) setIsPlaying(false);
    };

    video.addEventListener("waiting", handleWaiting);
    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("playing", handleCanPlay);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);

    if (Hls.isSupported()) {
      const hls = new Hls({
        // Lowest rendition first — the single biggest time-to-first-frame win
        // for short-form video; ABR upshifts within a couple of segments.
        startLevel: 0,
        // Fetch the first fragment concurrently with the level playlist
        // instead of sequentially.
        startFragPrefetch: true,
        // Never pull renditions larger than the element actually displays.
        capLevelToPlayerSize: true,
        maxBufferLength: activeRef.current ? 15 : 5,
        maxMaxBufferLength: activeRef.current ? 30 : 10,
        enableWorker: true,
        backBufferLength: 10,
      });
      hlsRef.current = hls;

      hls.on(Hls.Events.MANIFEST_PARSED, startPlaybackWhenReady);

      hls.on(Hls.Events.ERROR, (_evt, data) => {
        if (!data.fatal) return;
        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            hls.startLoad();
            break;
          case Hls.ErrorTypes.MEDIA_ERROR:
            hls.recoverMediaError();
            break;
          default:
            hls.destroy();
            hlsRef.current = null;
        }
      });

      hls.attachMedia(video);
      hls.loadSource(src);
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // Safari native HLS — let the active player buffer ahead, keep
      // standbys at metadata-only.
      video.preload = activeRef.current ? "auto" : "metadata";
      video.src = src;
      const onLoadedMetadata = () => startPlaybackWhenReady();
      safariListener = onLoadedMetadata;
      video.addEventListener("loadedmetadata", onLoadedMetadata, { once: true });
    }

    return () => {
      cancelled = true;
      video.removeEventListener("waiting", handleWaiting);
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("playing", handleCanPlay);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      if (safariListener) {
        video.removeEventListener("loadedmetadata", safariListener);
      }
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [src, attemptPlay]);

  // Active-state transitions live OUTSIDE the main effect on purpose: putting
  // `active` in that effect's deps would destroy and rebuild the hls session
  // on every flip — the exact cold start this component exists to avoid. A
  // warm standby flipping active just raises its buffer target and plays.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const hls = hlsRef.current;
    if (hls) applyBufferProfile(hls, active);
    if (active) {
      video.preload = "auto";
      attemptPlay(video);
    } else {
      video.preload = "metadata";
      if (!video.paused) video.pause();
    }
  }, [active, attemptPlay]);

  const handleVideoClick = useCallback(() => {
    // A tap is a user interaction — reveal the chrome and restart the
    // global countdown regardless of whether the toggle below goes through.
    showControls();
    const video = videoRef.current;
    if (!video || video.readyState < HTMLMediaElement.HAVE_FUTURE_DATA) return;
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  }, [showControls]);

  const handleToggleMute = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation(); // prevent triggering play/pause
      showControls();
      setMuted((prev) => !prev);
    },
    [showControls],
  );

  return (
    <div
      className="relative h-full w-full"
      onMouseMove={controls ? showControls : undefined}
      onMouseLeave={controls ? hideControls : undefined}
    >
      <video
        ref={videoRef}
        preload="metadata"
        playsInline
        muted={muted}
        loop
        poster={poster}
        className={className}
      />
      {/* With a poster the cover art is already on screen at 0ms — the gray
          pulse is only a fallback for posterless sources. */}
      {isLoading && !poster && (
        <div className="absolute inset-0 bg-gray-200 animate-fast-pulse" />
      )}

      {controls && !isLoading && (
        <>
          {/* Full-area click target for play/pause. Stays interactive even
              while the chrome is faded out — tapping a clean playing video
              pauses it (which also brings the chrome back), exactly like
              Reels. Only the visuals fade. */}
          <div
            role="button"
            aria-label={isPlaying ? "Pause video" : "Play video"}
            onClick={handleVideoClick}
            className={`absolute inset-0 flex items-center justify-center cursor-pointer bg-[radial-gradient(circle,rgba(0,0,0,0.2),rgba(0,0,0,0.6))] transition-opacity duration-300 ${controlsVisible ? "opacity-100" : "opacity-0"
              }`}
          >
            <div className="w-20 h-20 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center backdrop-blur-sm transition-colors">
              {isPlaying ? (
                <Pause size={40} color="white" />
              ) : (
                <Play size={40} color="white" className="ml-1" />
              )}
            </div>
          </div>

          {/* Mute button — sibling so it stays clickable over the click
              target; unclickable while invisible so a hidden button can't
              swallow taps meant for play/pause. */}
          <button
            type="button"
            aria-label={muted ? "Unmute video" : "Mute video"}
            className={`absolute top-4 right-4 p-2 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm transition-all duration-300 ${controlsVisible ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
            onClick={handleToggleMute}
          >
            {muted ? (
              <VolumeX color="white" size={20} />
            ) : (
              <Volume2 color="white" size={20} />
            )}
          </button>
        </>
      )}
    </div>
  );
}

export const HlsPlayer = memo(HlsPlayerImpl);