"use client";
import React, { useState } from 'react'

export default function OptimizedMedia({ src, alt, mediaType, attributes, onLoadData }: { src: string, alt: string, mediaType: "image" | "video", attributes?: any, onLoadData?: () => void }) {
    const [isLoading, setIsLoading] = useState(true);
    console.log(isLoading)
    return (
        <>
            {/* Skeleton */}
            {isLoading && (
                <div className="absolute inset-0 animate-pulse bg-gray-300" />
            )}

            {mediaType === "image" ? (
                <img
                    src={src || ""}
                    alt={alt}
                    onLoad={() => setIsLoading(false)}
                    onError={() => setIsLoading(false)}
                    {...attributes}
                />
            ) : (
                <video
                    src={src || ""}
                    onLoadedData={() => {
                        setIsLoading(false);
                        onLoadData?.();
                        console.log("loaded")
                    }}
                    onError={() => setIsLoading(false)}
                    {...attributes}
                />
            )}

        </>
    )
}
