"use client"
import { getUpdates } from '@/lib/api';
import { useCartStore } from '@/lib/stores/cart-store';
import { useWishlistStore } from '@/lib/stores/wishlist-store';
import { Feed, Product } from '@/lib/types';
import { ITEMS_TO_APPEND, shuffleArray } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { forwardRef, memo, useCallback, useEffect, useRef, useState } from 'react';
import ShareModal from './ShareModal';
import { CartRounded, Elipsis, ShareIconGallery, WishListAdd } from './svgs/Icons';

// Once a media URL has finished loading once, it never shows a skeleton
// again — module scope so the cache survives remounts (e.g. navigating away
// and back) for the lifetime of the tab, not just this component instance.
const loadedMediaCache = new Set<string>();

// Hard cap on how many cards stay mounted at once. Once the API runs out of
// real pages, older items are recycled: new (reshuffled, same underlying
// objects — nothing is cloned) items are appended at the back, and once the
// cap is exceeded the oldest ones are trimmed from the front. Memory stays
// bounded no matter how long the user scrolls, and native CSS scroll
// anchoring (on by default) keeps the viewport visually stable when
// off-screen items above it are removed.
const MAX_GALLERY_ITEMS = 60;

let slotCounter = 0;
const nextSlotKey = (feedId: string) => `${feedId}::${slotCounter++}`;

type GallerySlot = { key: string; feed: Feed };

export function GallerySkeleton() {
    return (
        Array.from({ length: ITEMS_TO_APPEND }).map((_, index) => (
            <div key={index} className='cursor-pointer mb-10 bg-gray-200 overflow-hidden p-4 rounded-lg relative'>
                <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                <div
                    className={`relative overflow-hidden rounded-lg mb-4 break-inside-avoid shadow-sm bg-gray-300/70 ${index % 2 === 0 ? "md:h-[300px] h-[150px]" : "md:h-[400px] h-[250px]"}`}
                >
                </div>

                <div className="space-y-1">
                    <h2 className="text-sm truncate h-10 bg-gray-300/70 rounded-sm w-[60%]"></h2>
                    <div>
                        <p className="lg:text-xs text-black/60 h-6 bg-gray-300/70 w-[40%]"> </p>
                    </div>

                    <div className="flex items-center gap-2 pr-2 text-[7px] lg:text-[10px] rounded-sm h-12 bg-gray-300/70 w-[80%]">
                    </div>
                </div>
            </div>
        ))
    )
}

// ─── GalleryCard (memoized) ─────────────────────────────────────────────────
// Extracted so toggling one card's option menu, cart state, or wishlist
// state doesn't force every other mounted card in the masonry grid to
// re-render.

type GalleryCardProps = {
    feed: Feed;
    slotKey: string;
    index: number;
    isOptionOpen: boolean;
    inCart: boolean;
    inWishlist: boolean;
    onNavigate: (productId: string) => void;
    onToggleOption: (slotKey: string) => void;
    onToggleCart: (productId: string) => void;
    onToggleWishlist: (product: Product) => void;
    onShare: (productId: string) => void;
};

const GalleryCard = memo(forwardRef<HTMLDivElement, GalleryCardProps>(function GalleryCard({
    feed,
    slotKey,
    index,
    isOptionOpen,
    inCart,
    inWishlist,
    onNavigate,
    onToggleOption,
    onToggleCart,
    onToggleWishlist,
    onShare,
}, ref) {
    // Seeded synchronously from the cache so a recycled/duplicate card whose
    // media URL was already loaded elsewhere never flashes a skeleton.
    const [isLoaded, setIsLoaded] = useState(() => loadedMediaCache.has(feed.mediaUrl));

    const handleLoaded = useCallback(() => {
        loadedMediaCache.add(feed.mediaUrl);
        setIsLoaded(true);
    }, [feed.mediaUrl]);

    const handleNavigate = useCallback(() => onNavigate(feed.product._id), [onNavigate, feed.product._id]);
    const handleToggleOption = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            onToggleOption(slotKey);
        },
        [onToggleOption, slotKey],
    );
    const handleToggleCart = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            onToggleCart(feed.product._id);
        },
        [onToggleCart, feed.product._id],
    );
    const handleToggleWishlist = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            onToggleWishlist(feed.product);
        },
        [onToggleWishlist, feed.product],
    );
    const handleShare = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            onShare(feed.product._id);
        },
        [onShare, feed.product._id],
    );

    return (
        <div ref={ref} className='cursor-pointer mb-10'>
            <div
                onClick={handleNavigate}
                className='relative overflow-hidden rounded-lg mb-4 break-inside-avoid shadow-sm'
                style={{ height: index % 2 === 0 ? "300px" : "400px" }}
            >
                {!isLoaded && (
                    <div className="absolute inset-0 bg-gray-200 overflow-hidden">
                        <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                    </div>
                )}

                {feed.mediaType === "video" ? (
                    <video
                        preload="none"
                        src={feed.mediaUrl}
                        muted
                        loop
                        playsInline
                        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${isLoaded ? "opacity-100" : "opacity-0"}`}
                        onLoadedData={handleLoaded}
                        onError={handleLoaded}
                    />
                ) : (
                    <Image
                        src={feed.mediaUrl}
                        alt={feed.title}
                        fill
                        sizes="(max-width: 768px) 50vw, 33vw"
                        className={`object-cover transition-opacity duration-500 hover:scale-105 ${isLoaded ? "opacity-100" : "opacity-0"}`}
                        onLoad={handleLoaded}
                        onError={handleLoaded}
                    />
                )}

                <div
                    className={`absolute bg-white right-3 bottom-[10%] rounded-xl border border-primaryhover text-xs font-poppins px-4 py-6 flex flex-col justify-center items-center gap-4 ${isOptionOpen ? "scale-100" : "scale-0"} transition-all duration-300`}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className='grid grid-cols-4 gap-3 w-full text-left items-center' onClick={handleToggleCart}>
                        <CartRounded scale={1} color="#383838" />
                        <span className='col-span-3'>{inCart ? "In Cart" : "Add To Cart"}</span>
                    </div>

                    <div className='grid grid-cols-4 gap-3 w-full text-left items-center border-t border-b border-[#838383] py-4' onClick={handleToggleWishlist}>
                        <WishListAdd scale={1} color="#383838" />
                        <span className='col-span-3'>{inWishlist ? "Remove" : "Add To Wishlist"}</span>
                    </div>

                    <div className='grid grid-cols-4 gap-3 w-full text-left items-center' onClick={handleShare}>
                        <ShareIconGallery scale={1} color="#383838" />
                        <span className='col-span-3'>Share</span>
                    </div>
                </div>
            </div>

            <div className='flex justify-end items-center'>
                <span className="w-fit h-fit hover:bg-primaryhover/10 rounded-xl" onClick={handleToggleOption}>
                    <Elipsis color="black" scale={0.8} />
                </span>
            </div>
        </div>
    );
}));
GalleryCard.displayName = "GalleryCard";

export default function Gallery() {
    const { data, isLoading } = useQuery({
        queryKey: ["gallery"],
        queryFn: () => getUpdates("gallery", "", ITEMS_TO_APPEND),
    });

    const [slots, setSlots] = useState<GallerySlot[]>([]);
    const [apiData, setApiData] = useState({ nextCursor: "", hasMore: true });
    const { addItem: addWishlistItem, removeItem: removeWishlistItem, isInWishlist } = useWishlistStore();
    const { removeItem: removeCartItem, getItem } = useCartStore();
    const [mounted, setMounted] = useState(false);
    const isFetchingRef = useRef(false);
    const onLoadMoreRef = useRef<() => void>(() => { });
    // The actual last rendered card, not an auxiliary sentinel div — CSS
    // multi-column layout (`columns-2`) balances content across columns, so
    // a plain trailing sentinel can land short of the visual bottom and
    // never intersect. Anchoring to real content is what the "reached the
    // end" trigger below relies on.
    const [lastItemEl, setLastItemEl] = useState<HTMLDivElement | null>(null);
    // Full set of every real (non-recycled) item fetched so far — recycling
    // reshuffles a window of these (same object references, nothing cloned)
    // once the API has no more pages left.
    const originalGalleryRef = useRef<Feed[]>([]);
    const [showOption, setShowOption] = useState<string | null>(null);
    const [showShare, setShowShare] = useState({
        show: false,
        id: ""
    });
    const router = useRouter();

    // Appends new feeds as fresh slots, then trims from the front if the
    // fixed-size window is exceeded — the only place the mounted item count
    // can grow, and it's always capped.
    const appendSlots = useCallback((feeds: Feed[]) => {
        if (!feeds.length) return;
        setSlots((prev) => {
            const next = [...prev, ...feeds.map((feed) => ({ key: nextSlotKey(feed._id), feed }))];
            if (next.length <= MAX_GALLERY_ITEMS) return next;
            return next.slice(next.length - MAX_GALLERY_ITEMS);
        });
    }, []);

    // Seed the initial window once the first page resolves.
    useEffect(() => {
        if (!data?.data || slots.length > 0) return;
        originalGalleryRef.current = data.data;
        setSlots(data.data.map((feed) => ({ key: nextSlotKey(feed._id), feed })));
        setApiData({ nextCursor: data.nextCursor || "", hasMore: data.hasMore || false });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data]);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Both "fetch the next real page" and "recycle what we already have"
    // live in a single onLoadMore, guarded by isFetchingRef so a fast
    // re-intersection (e.g. re-observing after the last item changes)
    // can't trigger overlapping/duplicate appends.
    const onLoadMore = useCallback(async () => {
        if (isFetchingRef.current) return;
        isFetchingRef.current = true;
        try {
            if (apiData.hasMore) {
                const newData = await getUpdates("gallery", apiData.nextCursor || "", ITEMS_TO_APPEND);
                if (newData) {
                    originalGalleryRef.current = [...originalGalleryRef.current, ...newData.data];
                    appendSlots(newData.data);
                    setApiData({ nextCursor: newData.nextCursor, hasMore: newData.hasMore });
                }
            } else if (originalGalleryRef.current.length) {
                appendSlots(shuffleArray(originalGalleryRef.current));
            }
        } catch (err) {
            console.error("Error loading more gallery items:", err);
        } finally {
            isFetchingRef.current = false;
        }
    }, [apiData.hasMore, apiData.nextCursor, appendSlots]);
    onLoadMoreRef.current = onLoadMore;

    // Fires onLoadMore whenever the last rendered card scrolls into view —
    // re-attached every time the last card changes (new page fetched, or a
    // recycled batch appended), so it's always watching the true tail.
    useEffect(() => {
        if (!lastItemEl) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) onLoadMoreRef.current();
            },
            { threshold: 0.1 },
        );
        observer.observe(lastItemEl);
        return () => observer.disconnect();
    }, [lastItemEl]);

    const handleNavigate = useCallback((productId: string) => {
        router.push(`/product/${productId}`);
    }, [router]);

    const handleToggleOption = useCallback((slotKey: string) => {
        setShowOption((prev) => (prev === slotKey ? null : slotKey));
    }, []);

    const handleToggleCart = useCallback((productId: string) => {
        if (getItem(productId)) {
            removeCartItem(productId);
        }
        // Adding to cart from the gallery isn't wired up yet (pre-existing).
    }, [getItem, removeCartItem]);

    const handleToggleWishlist = useCallback((product: Product) => {
        if (isInWishlist(product._id)) {
            removeWishlistItem(product._id);
        } else {
            addWishlistItem(product);
        }
    }, [isInWishlist, removeWishlistItem, addWishlistItem]);

    const handleShareOpen = useCallback((productId: string) => {
        setShowShare((prev) => ({ ...prev, show: true, id: productId }));
    }, []);

    return (
        <div className='h-screen overflow-y-auto' style={{ overflowAnchor: 'auto' }}>
            {/* Masonry Layout using CSS Columns */}
            <div className='columns-2 gap-4 p-5'>
                {slots.map((slot, index) => (
                    <GalleryCard
                        key={slot.key}
                        ref={index === slots.length - 1 ? setLastItemEl : undefined}
                        feed={slot.feed}
                        slotKey={slot.key}
                        index={index}
                        isOptionOpen={showOption === slot.key}
                        inCart={!!getItem(slot.feed.product._id)}
                        inWishlist={mounted && isInWishlist(slot.feed.product._id)}
                        onNavigate={handleNavigate}
                        onToggleOption={handleToggleOption}
                        onToggleCart={handleToggleCart}
                        onToggleWishlist={handleToggleWishlist}
                        onShare={handleShareOpen}
                    />
                ))}

                {isLoading && slots.length === 0 && <GallerySkeleton />}

                <div>
                    {apiData.hasMore && <GallerySkeleton />}
                </div>
            </div>

            <ShareModal
                share={showShare.show}
                href={`${mounted && window.location.origin}/product/${showShare.id}`}
                hideShare={() => { setShowShare({ show: false, id: "" }); setShowOption(null); }}
            />
        </div>
    )
}
