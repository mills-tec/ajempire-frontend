import React from 'react'


export default function EndlessScrollLoading({ infiniteRef, hasNextPage }: { infiniteRef: any, hasNextPage: boolean }) {
    return (
        <div ref={infiniteRef}>
            {hasNextPage && <h1 >Loading...</h1>}
        </div>
    )
}
