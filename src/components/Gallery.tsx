"use client"
import { getUpdates } from '@/lib/api';
import { bunnyLoader } from '@/lib/bunnyLoader';
import { useCartStore } from '@/lib/stores/cart-store';
import { useWishlistStore } from '@/lib/stores/wishlist-store';
import { Feed } from '@/lib/types';
import { ITEMS_TO_APPEND } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { forwardRef, memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { HlsPlayer } from './HLS';
import ShareModal from './ShareModal';
import { CartRounded, Elipsis, ShareIconGallery, WishListAdd } from './svgs/Icons';

// Once a media URL has finished loading once, it never shows a skeleton
// again — module scope so the cache survives remounts (e.g. navigating away
// and back) for the lifetime of the tab, not just this component instance.
// Bounded by design, not a leak: recycling reuses the same underlying media
// URLs over and over rather than introducing new ones, so this only grows
// with the total size of the real (fetched) gallery, never with how long
// the user keeps scrolling.
const loadedMediaCache = new Set<string>();

// Hard cap on how many cards stay mounted at once. Once the API runs out of
// real pages, older items are recycled: new (reshuffled, same underlying
// objects — nothing is cloned) items are appended at the back, and once the
// cap is exceeded the oldest ones are trimmed from the front. Memory stays
// bounded no matter how long the user scrolls, and native CSS scroll
// anchoring (on by default) keeps the viewport visually stable when
// off-screen items above it are removed.
const MAX_GALLERY_ITEMS = 60;

// How far ahead of the visible viewport the "near the bottom" trigger fires
// (IntersectionObserver rootMargin). This is what actually eliminates the
// pause at the end of the list: a page fetch normally takes a few hundred
// ms, and at typical scroll speeds a user can't cover ~1000px in that time,
// so the buffer (see bufferRef below) is reliably full by the time they
// physically arrive.
const PREFETCH_ROOT_MARGIN = "1000px 0px";

// How far ahead a video card's own visibility is checked before it's
// allowed to mount a real HlsPlayer (see GalleryCard) — deliberately much
// tighter than PREFETCH_ROOT_MARGIN, since this gates live video decoders,
// not a cheap data fetch.
const VIDEO_ROOT_MARGIN = "200px 0px";

let slotCounter = 0;

// A slot's column is decided once, at creation, and baked into the slot
// itself — never recomputed from its position in `slots`. That's what makes
// this immune to front-trimming: removing old slots from the front shifts
// every remaining item's *array index*, so deriving column from index (e.g.
// `index % 2`, or native CSS `columns-2`) would silently flip which column
// survivors land in — which is exactly what reads to a user as "the feed
// reordered itself" once recycling starts replaying already-seen cards.
type GallerySlot = { key: string; feed: Feed; column: 0 | 1 };

const mediaHeightForVariant = (variant: 0 | 1) => (variant === 0 ? 300 : 400);

// Greedy shortest-column-first placement — mirrors real masonry layout
// (better balanced than strict alternation) while still being a one-shot,
// never-revisited decision per item, so already-placed cards are never
// moved once a later batch is appended.
function createSlot(feed: Feed, columnHeights: [number, number]): GallerySlot {
    const column: 0 | 1 = columnHeights[0] <= columnHeights[1] ? 0 : 1;
    columnHeights[column] += mediaHeightForVariant(heightVariantFor(feed._id));
    return { key: `${feed._id}::${slotCounter++}`, feed, column };
}

// Pure Fisher-Yates over the whole array — distinct from lib/utils'
// shuffleArray, which shuffles-then-slices a window for a different caller
// (FeedItem's pull-to-refresh). This one needs the *entire* shuffled order,
// since it becomes the recycle order consumed a slice at a time below.
function shuffleFull<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// Deterministic per-post height variant, derived from the post's own id —
// replaces the old `index % 2`. Index is the item's *position in the
// rendered array*, which shifts by a constant offset every time the front
// gets trimmed (MAX_GALLERY_ITEMS), so every remaining mounted card used to
// receive a "new" index — and therefore fail GalleryCard's memo() and fully
// re-render — on every single trim. This is a property of the post, not of
// where it currently sits in the list, so it never changes.
function heightVariantFor(id: string): 0 | 1 {
    let hash = 0;
    for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0;
    return (hash & 1) as 0 | 1;
}

// A handful of placeholders for the rare "buffer wasn't ready yet" fallback
// — see isWaitingForMore below. Deliberately smaller than the initial-load
// skeleton count: with prefetching working, this path is the exception, not
// the steady state, so there's no reason to mount as many animated shimmer
// cards for it.
const FALLBACK_SKELETON_COUNT = 4;

export function GallerySkeleton({ count = ITEMS_TO_APPEND }: { count?: number }) {
    return (
        Array.from({ length: count }).map((_, index) => (
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
// re-render. Cart/wishlist membership is read here via per-card zustand
// selectors (feed.product._id-scoped) rather than being computed by the
// parent for all ~60 mounted cards and passed down — a mutation to one
// product's cart/wishlist status now only re-renders the one card that
// actually cares, instead of re-running Gallery's whole render (and all 60
// child prop computations) on every unrelated cart/wishlist change anywhere
// on the page.

type GalleryCardProps = {
    feed: Feed;
    slotKey: string;
    priority: boolean;
    isOptionOpen: boolean;
    onNavigate: (productId: string) => void;
    onToggleOption: (slotKey: string) => void;
    onShare: (productId: string) => void;
};

const GalleryCard = memo(forwardRef<HTMLDivElement, GalleryCardProps>(function GalleryCard({
    feed,
    slotKey,
    priority,
    isOptionOpen,
    onNavigate,
    onToggleOption,
    onShare,
}, ref) {
    // Seeded synchronously from the cache so a recycled/duplicate card whose
    // media URL was already loaded elsewhere never flashes a skeleton.
    const [isLoaded, setIsLoaded] = useState(() => loadedMediaCache.has(feed.mediaUrl));
    const heightVariant = heightVariantFor(feed._id);

    const inCart = useCartStore((s) => !!s.getItem(feed.product._id));
    const inWishlist = useWishlistStore((s) => s.isInWishlist(feed.product._id));
    const removeCartItem = useCartStore((s) => s.removeItem);
    const addCartItem = useCartStore((s) => s.addItem);
    const addWishlistItem = useWishlistStore((s) => s.addItem);
    const removeWishlistItem = useWishlistStore((s) => s.removeItem);

    // Gates whether a video card mounts a real HlsPlayer (a live hls.js
    // instance + <video> decoder) or just its static poster. Unlike images
    // — which Next/Image already lazy-loads natively — nothing was
    // previously limiting how many *videos* could be simultaneously
    // decoding: with up to MAX_GALLERY_ITEMS cards mounted at once, a
    // video-heavy gallery could have dozens of concurrent hls.js instances
    // alive at a time. iOS Safari in particular has hard limits on
    // concurrent video decoders and will kill the tab past them.
    const [isVideoNearViewport, setIsVideoNearViewport] = useState(false);
    const mediaWrapperRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (feed.mediaType !== "video") return;
        const el = mediaWrapperRef.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => setIsVideoNearViewport(entry.isIntersecting),
            { rootMargin: VIDEO_ROOT_MARGIN },
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, [feed.mediaType]);

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
            if (inCart) {
                removeCartItem(feed.product._id);
            } else {
                const selectedVariants = feed.product.variantCombinations?.[0]?.options ?? [];

                addCartItem([
                    {
                        product: feed.product,
                        quantity: 1,
                        selectedVariants,
                    },
                ]);
            }
            // Adding to cart from the gallery isn't wired up yet (pre-existing).
        },
        [inCart, removeCartItem, addCartItem, feed.product],
    );
    const handleToggleWishlist = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            if (inWishlist) {
                removeWishlistItem(feed.product._id);
            } else {
                addWishlistItem(feed.product);
            }
        },
        [inWishlist, removeWishlistItem, addWishlistItem, feed.product],
    );
    const handleShare = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            onShare(feed.product._id);
        },
        [onShare, feed.product._id],
    );

    // Rough intrinsic-size hint for content-visibility below (media height +
    // an estimate for the title/price block under it) — doesn't need to be
    // exact, it only prevents a visible jump the moment this card scrolls
    // into range; a card whose real content differs just reflows once, on
    // entry, same as any content-visibility: auto usage.
    const mediaHeightPx = mediaHeightForVariant(heightVariant);

    return (
        <div
            ref={ref}
            className='cursor-pointer mb-10'
            style={{
                // Skips layout/paint/style work entirely for cards currently
                // off-screen — up to MAX_GALLERY_ITEMS (60) can be mounted at
                // once, most of them scrolled well out of view at any given
                // moment. This is what "DO NOT use a virtualization library"
                // doesn't have to mean "no virtualization benefit" — the
                // browser does the equivalent work for free here.
                contentVisibility: 'auto',
                containIntrinsicSize: `auto ${mediaHeightPx + 100}px`,
            }}
        >
            <div
                ref={mediaWrapperRef}
                onClick={handleNavigate}
                className='relative overflow-hidden rounded-lg mb-4 break-inside-avoid shadow-sm'
                style={{ height: mediaHeightPx }}
            >
                {!isLoaded && (
                    <div className="absolute inset-0 bg-gray-200 overflow-hidden">
                        <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                    </div>
                )}

                {feed.mediaType === "video" ? (
                    isVideoNearViewport ? (
                        <HlsPlayer src={feed.mediaUrl} className='w-full h-full object-cover' />
                    ) : (
                        // Off-screen video: static poster only, zero decoders held.
                        feed.image && (
                            <Image
                                src={feed.image}
                                alt={feed.title}
                                loader={bunnyLoader}
                                fill
                                sizes="(max-width: 768px) 50vw, 33vw"
                                className="object-cover"
                            />
                        )
                    )
                ) : (
                    <Image
                        src={feed.mediaUrl}
                        alt={feed.title}
                        loader={bunnyLoader}
                        fill
                        sizes="(max-width: 768px) 50vw, 33vw"
                        className={`object-cover transition-opacity duration-500 hover:scale-105 ${isLoaded ? "opacity-100" : "opacity-0"}`}
                        onLoad={handleLoaded}
                        onError={handleLoaded}
                        priority={priority}
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
        // This query is only ever consumed once, to seed `slots` (see the
        // effect below, guarded by `slots.length > 0`) — every subsequent
        // page comes from the buffered fetch logic below instead. With the
        // default staleTime, remounting this component (e.g. navigating
        // away and back) would trigger a background refetch whose result the
        // seed guard can only ever throw away — pure wasted network traffic.
        staleTime: Infinity,
    });

    const [slots, setSlots] = useState<GallerySlot[]>([]);
    const [apiData, setApiData] = useState({ nextCursor: "", hasMore: true });
    // True only while a bottom-of-list append had to wait on a genuine
    // network round trip because the buffer wasn't ready yet (see
    // consumeNext) — the rare fallback path, not the steady state.
    const [isWaitingForMore, setIsWaitingForMore] = useState(false);
    const [mounted, setMounted] = useState(false);
    // Guards the on-demand append path specifically (draining the buffer,
    // or the network fallback) against overlapping invocations — separate
    // from isPrefetchingRef below, which guards the independent background
    // fill, since both can legitimately be "in flight" at different times.
    const isAppendingRef = useRef(false);
    const consumeNextRef = useRef<() => void>(() => { });
    // The actual last rendered card, not an auxiliary sentinel div — a
    // trailing sentinel would live in only one of the two column flex
    // containers and, depending on how the columns balance, can land short
    // of the visual bottom and never intersect. Anchoring to real content
    // (whichever card is last in creation order, see lastSlotKey below) is
    // what the "reached the end" trigger relies on instead.
    const [lastItemEl, setLastItemEl] = useState<HTMLDivElement | null>(null);
    // Full set of every real (non-recycled) item fetched so far — recycling
    // reshuffles a window of these (same object references, nothing cloned)
    // once the API has no more pages left.
    const originalGalleryRef = useRef<Feed[]>([]);
    // One shuffled pass through the pool, consumed a slice at a time via
    // recycleCursorRef, instead of a fresh O(n) shuffle of the whole pool on
    // every single recycle call (see getNextRecycleBatch) — the previous
    // approach re-shuffled the entire fetched history on every recycle
    // batch, a cost that only grew as the session went on.
    const recycleOrderRef = useRef<Feed[]>([]);
    const recycleCursorRef = useRef(0);
    // Holds one already-fetched-but-not-yet-appended batch, kept topped up
    // in the background (see the effect below) so consumeNext can append
    // instantly instead of waiting on a request the moment it's needed.
    const bufferRef = useRef<Feed[] | null>(null);
    const isPrefetchingRef = useRef(false);
    // Running total height per column — persists across renders/trims so
    // column placement for new slots always accounts for everything ever
    // placed, not just what's currently mounted (see createSlot above).
    const columnHeightsRef = useRef<[number, number]>([0, 0]);
    const [showOption, setShowOption] = useState<string | null>(null);
    const [showShare, setShowShare] = useState({
        show: false,
        id: ""
    });
    const router = useRouter();

    // Appends new feeds as fresh slots, then trims from the front if the
    // fixed-size window is exceeded — the only place the mounted item count
    // can grow, and it's always capped. A ring-buffer/pointer structure was
    // considered for this instead of the array copy below, but React's
    // state model requires a new array reference to signal a change either
    // way, and rendering still has to walk the window in visual order — so
    // a pointer structure wouldn't avoid the O(60) copy, just relocate it.
    // At a 60-item cap that copy (shallow — feed objects are reused, not
    // cloned) is negligible next to the actual DOM/render cost of the cards
    // themselves, so this is already the right shape for the constraint.
    const appendSlots = useCallback((feeds: Feed[]) => {
        if (!feeds.length) return;
        // Sequential — each createSlot call both reads and updates
        // columnHeightsRef, so later feeds in the same batch see earlier
        // ones' placement. That's required for greedy balancing to work.
        const newSlots = feeds.map((feed) => createSlot(feed, columnHeightsRef.current));
        setSlots((prev) => {
            const next = prev.concat(newSlots);
            if (next.length <= MAX_GALLERY_ITEMS) return next;
            return next.slice(next.length - MAX_GALLERY_ITEMS);
        });
    }, []);

    // Consumes a slice of the (lazily shuffled) recycle order, reshuffling
    // only once every item in the pool has been used — turns an O(n)
    // shuffle-per-recycle into an O(n) shuffle-per-full-pass plus an O(k)
    // slice per call.
    const getNextRecycleBatch = useCallback((count: number): Feed[] => {
        const pool = originalGalleryRef.current;
        if (!pool.length) return [];
        if (recycleCursorRef.current >= recycleOrderRef.current.length) {
            recycleOrderRef.current = shuffleFull(pool);
            recycleCursorRef.current = 0;
        }
        const start = recycleCursorRef.current;
        const end = Math.min(start + count, recycleOrderRef.current.length);
        recycleCursorRef.current = end;
        return recycleOrderRef.current.slice(start, end);
    }, []);

    // Pure "get the next batch of feeds" — fetch-or-recycle, same decision
    // the old onLoadMore made, but deliberately *not* appending anything
    // itself. Reused by both the background prefetch and the on-demand
    // fallback below, so there's exactly one place that decides what the
    // next batch looks like.
    const fetchNextBatch = useCallback(async (): Promise<Feed[]> => {
        if (apiData.hasMore) {
            // A couple of retries here, mirroring what React Query already
            // gives the initial fetch for free — a single dropped request
            // shouldn't be the thing that stalls the whole feed.
            let lastErr: unknown;
            for (let attempt = 0; attempt < 2; attempt++) {
                try {
                    const page = await getUpdates("gallery", apiData.nextCursor || "", ITEMS_TO_APPEND);
                    if (!page) return [];
                    originalGalleryRef.current = [...originalGalleryRef.current, ...page.data];
                    setApiData({ nextCursor: page.nextCursor, hasMore: page.hasMore });
                    return page.data;
                } catch (err) {
                    lastErr = err;
                    if (attempt === 0) await new Promise((r) => setTimeout(r, 400));
                }
            }
            console.error("Error fetching gallery page:", lastErr);
            return [];
        }
        return getNextRecycleBatch(ITEMS_TO_APPEND);
    }, [apiData.hasMore, apiData.nextCursor, getNextRecycleBatch]);
    const fetchNextBatchRef = useRef(fetchNextBatch);
    fetchNextBatchRef.current = fetchNextBatch;

    // Background prefetch — fills the buffer ahead of actual need. Guarded
    // against running again while already in flight or while a filled
    // buffer is still waiting to be consumed.
    const prefetchNext = useCallback(async () => {
        if (isPrefetchingRef.current || bufferRef.current) return;
        isPrefetchingRef.current = true;
        try {
            const feeds = await fetchNextBatchRef.current();
            bufferRef.current = feeds.length ? feeds : null;
        } catch (err) {
            console.error("Gallery prefetch failed:", err);
        } finally {
            isPrefetchingRef.current = false;
        }
    }, []);

    // Keeps the buffer topped up: fires once slots first exist, and again
    // after every append (appendSlots changes slots.length) — prefetchNext's
    // own guards make the redundant calls this produces (buffer already
    // full, or a prefetch already running) cheap no-ops, so there's no need
    // for separate "have I already primed this" bookkeeping.
    useEffect(() => {
        if (slots.length > 0) void prefetchNext();
    }, [slots.length, prefetchNext]);

    // Seed the initial window once the first page resolves.
    useEffect(() => {
        if (!data?.data || slots.length > 0) return;
        originalGalleryRef.current = data.data;
        setSlots(data.data.map((feed) => createSlot(feed, columnHeightsRef.current)));
        setApiData({ nextCursor: data.nextCursor || "", hasMore: data.hasMore || false });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data]);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Fires when the observer below decides the user is close enough to the
    // end that more content will be needed soon. If the buffer's already
    // filled, this is an instant, no-network append; the network fallback
    // only runs if the user scrolled faster than one page's fetch time.
    const consumeNext = useCallback(async () => {
        if (isAppendingRef.current) return;
        isAppendingRef.current = true;
        try {
            if (bufferRef.current) {
                const feeds = bufferRef.current;
                bufferRef.current = null;
                appendSlots(feeds);
            } else {
                setIsWaitingForMore(true);
                const feeds = await fetchNextBatchRef.current();
                appendSlots(feeds);
                setIsWaitingForMore(false);
            }
        } finally {
            isAppendingRef.current = false;
        }
    }, [appendSlots]);
    consumeNextRef.current = consumeNext;

    // Single observer instance, created once — retargeted (not recreated)
    // whenever the last rendered card changes, via the effect below. The
    // old version constructed a brand-new IntersectionObserver on every
    // single page append/recycle, which during continuous fast scrolling
    // could mean dozens of native observer objects allocated and thrown
    // away per minute.
    const observerRef = useRef<IntersectionObserver | null>(null);
    useEffect(() => {
        observerRef.current = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) consumeNextRef.current();
            },
            { threshold: 0, rootMargin: PREFETCH_ROOT_MARGIN },
        );
        return () => {
            observerRef.current?.disconnect();
            observerRef.current = null;
        };
    }, []);

    useEffect(() => {
        const observer = observerRef.current;
        if (!observer || !lastItemEl) return;
        observer.observe(lastItemEl);
        return () => observer.unobserve(lastItemEl);
    }, [lastItemEl]);

    const handleNavigate = useCallback((productId: string) => {
        router.push(`/product/${productId}`);
    }, [router]);

    const handleToggleOption = useCallback((slotKey: string) => {
        setShowOption((prev) => (prev === slotKey ? null : slotKey));
    }, []);

    const handleShareOpen = useCallback((productId: string) => {
        setShowShare((prev) => ({ ...prev, show: true, id: productId }));
    }, []);

    // Split into the two columns each slot was already assigned to at
    // creation (see createSlot). Deliberately NOT native CSS `columns-2` —
    // multi-column layout rebalances which column every child lands in
    // whenever content is appended, which silently relocates already-
    // rendered cards. Two plain flex columns, each in stable append order,
    // can't do that: a card's column and its position within that column
    // are fixed the moment it's created.
    const columns = useMemo(() => {
        const col0: { slot: GallerySlot; flatIndex: number }[] = [];
        const col1: { slot: GallerySlot; flatIndex: number }[] = [];
        slots.forEach((slot, flatIndex) => {
            (slot.column === 0 ? col0 : col1).push({ slot, flatIndex });
        });
        return [col0, col1];
    }, [slots]);

    const lastSlotKey = slots.length > 0 ? slots[slots.length - 1].key : null;

    return (
        <div className='h-screen overflow-y-auto' style={{ overflowAnchor: 'auto' }}>
            <div className='grid grid-cols-2 gap-4 p-5'>
                {columns.map((column, colIndex) => (
                    <div key={colIndex} className='flex flex-col'>
                        {column.map(({ slot, flatIndex }) => (
                            <GalleryCard
                                key={slot.key}
                                ref={slot.key === lastSlotKey ? setLastItemEl : undefined}
                                feed={slot.feed}
                                slotKey={slot.key}
                                priority={flatIndex < 4}
                                isOptionOpen={showOption === slot.key}
                                onNavigate={handleNavigate}
                                onToggleOption={handleToggleOption}
                                onShare={handleShareOpen}
                            />
                        ))}
                    </div>
                ))}

                {isLoading && slots.length === 0 && <GallerySkeleton />}

                {/* Only shown for the rare "buffer wasn't ready" fallback —
                    with prefetching working, this should almost never mount. */}
                {isWaitingForMore && <GallerySkeleton count={FALLBACK_SKELETON_COUNT} />}
            </div>

            <ShareModal
                share={showShare.show}
                href={`${mounted && window.location.origin}/product/${showShare.id}`}
                hideShare={() => { setShowShare({ show: false, id: "" }); setShowOption(null); }}
            />
        </div>
    )
}
