import React from 'react'

export default function EmptyList({ message }: { message: string }) {
    return (
        <div className="h-[60vh] flex items-center justify-center">
            <h1>
                {message}
            </h1>
        </div>
    )
}
