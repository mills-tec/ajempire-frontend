import Spinner from '@/app/components/Spinner'
import React from 'react'

export default function Loading() {
    return (
        <div className="h-[60vh]  flex items-center justify-center">
            <Spinner />
        </div>
    )
}
