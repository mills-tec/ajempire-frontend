'use client'
import PullToRefresh from 'react-simple-pull-to-refresh'
import { useQueryClient } from '@tanstack/react-query'
import React from 'react'

type Props = {
    children: React.ReactNode
}

export default function RefreshWrapper({ children }: Props) {
    const queryClient = useQueryClient()

    const handleRefresh = async () => {
        await queryClient.invalidateQueries()
    }

    return (
        <PullToRefresh onRefresh={handleRefresh}>
            {children}
        </PullToRefresh>
    )
}
