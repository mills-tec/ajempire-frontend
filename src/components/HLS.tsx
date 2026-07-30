import Hls from "hls.js";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import { memo, useCallback, useEffect, useRef, useState } from "react";

interface HlsPlayerProps {
  src: string;
  className?: string;
  controls?: boolean;
}

function HlsPlayerImpl({ src, className, controls = false }: HlsPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [muted, setMuted] = useState(true);

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

    const startPlaybackWhenReady = () => {
      if (cancelled) return;
      if (video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
        setIsLoading(false);
        attemptPlay(video);
      } else {
        const onCanPlay = () => {
          if (!cancelled) {
            setIsLoading(false);
            attemptPlay(video);
          }
          video.removeEventListener("canplay", onCanPlay);
        };
        video.addEventListener("canplay", onCanPlay, { once: true });
      }
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
        maxBufferLength: 15,
        startLevel: -1,
        enableWorker: true,
        backBufferLength: 30,
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
      // Safari native HLS
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

  const handleVideoClick = useCallback(() => {
    const video = videoRef.current;
    if (!video || video.readyState < HTMLMediaElement.HAVE_FUTURE_DATA) return;
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  }, []);

  const handleToggleMute = useCallback((e: React.MouseEvent) => {
    e.stopPropagation(); // prevent triggering play/pause
    setMuted((prev) => !prev);
  }, []);

  return (
    <div className="relative h-full w-full">
      <video
        ref={videoRef}
        preload="metadata"
        playsInline
        muted={muted}
        loop
        className={className}
      />
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-fast-pulse" />
      )}

      {controls && !isLoading && (
        <>
          {/* Full-area click target for play/pause */}
          <div
            role="button"
            aria-label={isPlaying ? "Pause video" : "Play video"}
            onClick={handleVideoClick}
            className="absolute inset-0 flex items-center justify-center cursor-pointer bg-[radial-gradient(circle,rgba(0,0,0,0.2),rgba(0,0,0,0.6))]"
          >
            <div className="w-20 h-20 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center backdrop-blur-sm transition-colors">
              {isPlaying ? (
                <Pause size={40} color="white" />
              ) : (
                <Play size={40} color="white" className="ml-1" />
              )}
            </div>
          </div>

          {/* Mute button — sibling so it stays visible and clickable */}
          <button
            type="button"
            aria-label={muted ? "Unmute video" : "Mute video"}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm transition-colors"
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