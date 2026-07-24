"use client";
import { Product } from '@/lib/types';
import Hls from 'hls.js';
import React, { useEffect, useRef } from 'react';

export default function VideoPlayer({ handleVideoPlay, item, video, playingMap, videoRefs, src, setPlayingMap, handleSetVideo, onLoadedData }: { handleVideoPlay: (id: string) => void, video: { showPlay: boolean, muted: boolean }, item: Product, playingMap: Record<string, boolean>, videoRefs: React.RefObject<Record<string, HTMLVideoElement | null>>, src: string, setPlayingMap: React.Dispatch<React.SetStateAction<Record<string, boolean>>>, handleSetVideo: (data: { showPlay: boolean, muted: boolean }) => void, onLoadedData?: () => void }) {
    const hlsRef = useRef<Hls | null>(null);

    useEffect(() => {
        const videoEl = videoRefs.current[item._id];
        if (!videoEl || !src) return;

        // Clean up any previous instance before attaching a new source —
        // this effect re-runs on src change even though the component
        // instance (and its item._id-keyed ref) may be reused across videos.
        if (hlsRef.current) {
            hlsRef.current.destroy();
            hlsRef.current = null;
        }

        const tryPlay = () => {
            videoEl.play().catch(() => {
                // Autoplay can still be blocked by the browser (e.g. unmuted,
                // or no user gesture yet) — that's fine, the play/pause
                // overlay lets the user start it manually.
            });
        };

        if (videoEl.canPlayType('application/vnd.apple.mpegurl')) {
            // Safari/iOS: native HLS support, no hls.js needed.
            videoEl.src = src;
            videoEl.addEventListener('loadedmetadata', tryPlay, { once: true });
        } else if (Hls.isSupported()) {
            const hls = new Hls({
                // Keep buffering modest — this is a single product video,
                // not a feed, but there's no reason to over-fetch either.
                maxBufferLength: 15,
            });
            hlsRef.current = hls;

            hls.on(Hls.Events.MANIFEST_PARSED, tryPlay);
            hls.on(Hls.Events.ERROR, (_event, data) => {
                if (data.fatal) {
                    console.error('Fatal HLS error, destroying instance:', data);
                    hls.destroy();
                    hlsRef.current = null;
                }
            });

            hls.loadSource(src);
            hls.attachMedia(videoEl);
        } else {
            console.warn('HLS is not supported in this browser and no fallback source is available.');
        }

        return () => {
            if (hlsRef.current) {
                hlsRef.current.destroy();
                hlsRef.current = null;
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [src, item._id]);

    return (
        <div className='h-full w-full'>

            {src && <video
                preload="metadata"
                loop
                muted={video.muted}
                className=" object-cover h-full w-full"
                ref={(el) => {
                    videoRefs.current[item._id] = el;
                }}
                onPlay={() => {
                    setPlayingMap((prev) => ({ ...prev, [item._id]: true }));
                }}
                onPause={() => {
                    setPlayingMap((prev) => ({ ...prev, [item._id]: false }));
                }}
                onLoadedData={onLoadedData}

            />}
            {/* <div onClick={() => handleVideoPlay(item._id)} className={`absolute w-full h-full top-0 flex items-center justify-center cursor-pointer bg-[radial-gradient(circle,_rgba(0,_0,_0,_0.2),_rgba(0,_0,_0,_0.6))] duration-300 ${!video.showPlay ? "hidden opacity-0" : "opacity-100"}`}>
                <div className="w-20 h-20 rounded-full bg-primaryhover flex items-center justify-center">
                    {!playingMap[item._id] ? <Play size={40} color="white" /> : <Pause size={40} color="white" />}

                </div>

                <span className="absolute top-4 right-4 cursor-pointer" onClick={(e) => {
                    handleSetVideo({ showPlay: video.showPlay, muted: !video.muted })
                    e.stopPropagation();



                }} >
                    {video.muted ? <VolumeX color="white" size={16} /> : <Volume2 color="white" size={16} />}


                </span>
            </div> */}
        </div>
    )
}