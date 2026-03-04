import { FeedSkeleton } from './FeedItem'
import { GallerySkeleton } from './Gallery'

export default function UpdatesSkeleton({ type }: { type: string }) {
    return (
        type === "gallery" ? <div className='columns-2 gap-4 p-5'>
            <GallerySkeleton />
        </div> : <div className=' md:w-[59%] md:pl-[20%]'>
            <FeedSkeleton />
        </div>
    )
}
