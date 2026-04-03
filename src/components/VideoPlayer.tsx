import { Product } from '@/lib/types';
import { Pause, Play, Volume2, VolumeX } from 'lucide-react';
import React from 'react'

export default function VideoPlayer({ handleVideoPlay, item, video, playingMap, videoRefs, src, setPlayingMap, handleSetVideo, onLoadedData }: { handleVideoPlay: (id: string) => void, video: { showPlay: boolean, muted: boolean }, item: Product, playingMap: Record<string, boolean>, videoRefs: React.RefObject<Record<string, HTMLVideoElement | null>>, src: string, setPlayingMap: React.Dispatch<React.SetStateAction<Record<string, boolean>>>, handleSetVideo: (data: { showPlay: boolean, muted: boolean }) => void, onLoadedData?: () => void }) {
    return (
        <div className='h-full w-full'>

            {src && <video
                preload="metadata"
                src={src}
                autoPlay
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
            <div onClick={() => handleVideoPlay(item._id)} className={`absolute w-full h-full top-0 flex items-center justify-center cursor-pointer bg-[radial-gradient(circle,_rgba(0,_0,_0,_0.2),_rgba(0,_0,_0,_0.6))] duration-300 ${!video.showPlay ? "hidden opacity-0" : "opacity-100"}`}>
                <div className="w-20 h-20 rounded-full bg-primaryhover flex items-center justify-center">
                    {!playingMap[item._id] ? <Play size={40} color="white" /> : <Pause size={40} color="white" />}

                </div>

                <span className="absolute top-4 right-4 cursor-pointer" onClick={(e) => {
                    handleSetVideo({ showPlay: video.showPlay, muted: !video.muted })
                    e.stopPropagation();



                }} >
                    {video.muted ? <VolumeX color="white" size={16} /> : <Volume2 color="white" size={16} />}


                </span>
            </div>
        </div>
    )
}
