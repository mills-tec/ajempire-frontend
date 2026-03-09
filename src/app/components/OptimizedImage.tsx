import Image from 'next/image'
import React, { useState } from 'react'

export default function OptimizedImage({ src, alt, }: { src: string, alt: string, }) {
    const [loaded, setLoaded] = useState(false);
    return (
        <Image
            src={src || "/placeholder.png"}
            alt={alt}
            fill
            className={`absolute object-cover ${!loaded ? "bg-gray-200 animate-pulse duration-300" : ""}`}
            onLoad={() => {
                setLoaded(true)
            }}
        />

    )
}
