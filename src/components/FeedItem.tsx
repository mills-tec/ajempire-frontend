"use client";

import { useUpdates } from "@/api/customHooks";
import { useSocket } from "@/app/components/providers/SocketProvider";
import PullToRefreshContainer from "@/app/components/pull-to-refresh/PullToRefreshContainer";
import PullToRefreshHeader from "@/app/components/pull-to-refresh/PullToRefreshHeader";
import {
  PullToRefreshProvider,
  usePullToRefresh,
} from "@/app/components/pull-to-refresh/PullToRefreshProvider";
import CommentItem from "@/components/CommentItem";
import {
  CommentIcon,
  Favorite,
  GoBack,
  HeartFill,
  ShareIcon,
} from "@/components/svgs/Icons";
import { getUser } from "@/lib/api";
import { bunnyLoader } from "@/lib/bunnyLoader";
import { useModalStore } from "@/lib/stores/modal-store";
import { useWishlistStore } from "@/lib/stores/wishlist-store";
import { CommentData, Feed, IUpdateSocketFeed, IUpdateSocketFeedComment, Product } from "@/lib/types";
import { getCountdown, ITEMS_TO_APPEND, shuffleArray } from "@/lib/utils";
import {
  Heart,
  LoaderCircle,
  Pause,
  Play, SendHorizonal, Volume2,
  VolumeX
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import ShareModal from "./ShareModal";

// ─── FeedSkeleton ─────────────────────────────────────────────────────────────
// Shimmer-swept placeholder cards, staggered per index so the loading state
// reads as a fluid wave instead of a flat, uniform pulse.

export function FeedSkeleton() {
  return (
    <>
      {Array.from({ length: ITEMS_TO_APPEND }).map((_, i) => (
        <div
          className="space-y-1 h-screen bg-gray-200 flex flex-col relative md:rounded-2xl overflow-hidden"
          key={i}
        >
          <div
            className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent"
            style={{ animationDelay: `${i * 90}ms` }}
          />
          <span className="absolute top-10 left-4 shadow-2xl bg-gray-300/80 h-10 w-32 py-2 px-5 rounded-full text-sm font-poppins text-white z-10" />
          <div className="flex flex-col gap-4 translate-y-[55%] h-full pl-4 pr-10">
            <div className="h-8 bg-gray-300/80 rounded-md w-[60%]" />
            <div className="h-4 bg-gray-300/70 rounded-md w-[75%]" />
            <div className="h-4 bg-gray-300/70 rounded-md w-[45%]" />
            <div className="flex items-center gap-3 mt-2">
              <div className="h-10 w-10 rounded-full bg-gray-300/80" />
              <div className="h-10 w-10 rounded-full bg-gray-300/80" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

// ─── Countdown ───────────────────────────────────────────────────────────────

function Countdown({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState(() => getCountdown(targetDate));

  useEffect(() => {
    const timer = setInterval(
      () => setTimeLeft(getCountdown(targetDate)),
      1000,
    );
    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <span className="text-[10px]">
      {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
    </span>
  );
}

// ─── Chevron SVG ─────────────────────────────────────────────────────────────

const ChevronDown = () => (
  <svg
    width="20"
    height="14"
    viewBox="0 0 24 14"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ transform: "scale(0.8)" }}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M13.2158 13.2158C12.8799 13.5517 12.4242 13.7404 11.9491 13.7404C11.4741 13.7404 11.0184 13.5517 10.6824 13.2158L0.546975 3.08039C0.375853 2.91512 0.239359 2.71742 0.14546 2.49882C0.0515603 2.28023 0.0021349 2.04513 6.76468e-05 1.80724C-0.00199961 1.56934 0.0433331 1.33341 0.13342 1.11322C0.223506 0.893035 0.356543 0.692991 0.524768 0.524767C0.692992 0.356542 0.893034 0.223505 1.11322 0.133419C1.33341 0.0433322 1.56934 -0.00199961 1.80724 6.7648e-05C2.04513 0.0021349 2.28023 0.0515603 2.49882 0.14546C2.71741 0.239359 2.91512 0.375852 3.08039 0.546974L11.9491 9.41572L20.8179 0.546974C21.1558 0.220608 21.6084 0.0400178 22.0781 0.0441C22.5479 0.0481822 22.9973 0.236609 23.3295 0.568799C23.6617 0.900989 23.8501 1.35036 23.8542 1.82013C23.8583 2.2899 23.6777 2.74248 23.3513 3.08039L13.2158 13.2158Z"
      fill="#FF008C"
    />
  </svg>
);

// How many items on either side of the currently-viewed one keep a real
// <Image> (or, for video, at least a poster thumbnail) mounted. Everything
// outside this window renders a cheap flat placeholder instead — the feed
// is designed to scroll forever, so without this every item ever scrolled
// past would stay mounted for the rest of the session.
const MEDIA_RENDER_WINDOW = 3;

// How many items on either side of the currently-viewed one keep a real
// <video> element mounted (src set, decoding). This is intentionally much
// tighter than MEDIA_RENDER_WINDOW — Instagram/TikTok/Shorts-style feeds
// only ever keep the current video plus its immediate neighbors alive:
//   distance 0 (current)        -> preload="auto", playing
//   distance 1 (prev/next)      -> preload="metadata", paused, ready to
//                                   resume instantly the moment it becomes
//                                   current
//   beyond this window          -> no <video> mounted at all, just the
//                                   poster thumbnail (still within
//                                   MEDIA_RENDER_WINDOW) or a flat
//                                   placeholder — zero network requests,
//                                   zero decoders held. iOS Safari in
//                                   particular has hard limits on
//                                   concurrent video decoders and will kill
//                                   the tab once too many are alive at once.
// Configurable independently of MEDIA_RENDER_WINDOW since a poster image is
// orders of magnitude cheaper to keep around than a live video decoder.
const VIDEO_ACTIVE_WINDOW = 1;

// Hard cap on how many cards stay mounted at once, in either direction.
// Once the API runs out of real pages, older items are recycled: new
// (reshuffled, same underlying objects — nothing is cloned) items are
// appended/prepended, and once the cap is exceeded the far end is trimmed.
// Memory stays bounded no matter how many times Next/Previous is clicked.
const MAX_RENDERED_ITEMS = 40;

// How many recycled items to splice in per extension, in either direction.
const RECYCLE_BATCH = 6;

let slotCounter = 0;
// Globally unique per mounted card, even when the same underlying feed._id
// is recycled multiple times — without this, React would confuse two
// on-screen copies of the same post that share a key.
const nextSlotKey = (feedId: string) => `${feedId}::${slotCounter++}`;

type FeedSlot = { key: string; feed: Feed };

// ─── Types ────────────────────────────────────────────────────────────────────

type CommentState = {
  show: boolean;
  commentText: string;
  parent: { parentId: string; fullname: string; email: string };
  focus: boolean;
};

// ─── FeedCard (memoized per-item media + actions) ──────────────────────────────
// Extracted so that state changes elsewhere in the feed (typing a comment,
// liking a different post, a video's play state) don't force every mounted
// item's image/video subtree to re-render — only the item whose own props
// actually changed re-renders.

type FeedCardProps = {
  item: Feed;
  index: number;
  isLoaded: boolean;
  isPlaying: boolean;
  hasLiked: boolean;
  commentCount: number;
  itemInWishlist: boolean;
  isDescExpanded: boolean;
  isMediaActive: boolean;
  isCurrent: boolean;
  isVideoActive: boolean;
  pull: number;
  muted: boolean;
  showPlayOverlay: boolean;
  registerVideoRef: (el: HTMLVideoElement | null) => void;
  onMediaLoaded: (index: number) => void;
  onVideoPlayStateChange: (index: number, playing: boolean) => void;
  onVideoClick: (index: number) => void;
  onShowPlayTemporarily: (index: number) => void;
  onToggleMute: (index: number) => void;
  onToggleDesc: (index: number) => void;
  onLike: (id: string) => void;
  onToggleComment: () => void;
  onShare: () => void;
  onWishlistToggle: (product: Product) => void;
};

const FeedCard = memo(function FeedCard({
  item,
  index,
  isLoaded,
  isPlaying,
  hasLiked,
  commentCount,
  itemInWishlist,
  isDescExpanded,
  isMediaActive,
  isCurrent,
  isVideoActive,
  pull,
  muted,
  showPlayOverlay,
  registerVideoRef,
  onMediaLoaded,
  onVideoPlayStateChange,
  onVideoClick,
  onShowPlayTemporarily,
  onToggleMute,
  onToggleDesc,
  onLike,
  onToggleComment,
  onShare,
  onWishlistToggle,
}: FeedCardProps) {
  const handleMediaLoaded = useCallback(() => onMediaLoaded(index), [onMediaLoaded, index]);
  const handlePlay = useCallback(() => onVideoPlayStateChange(index, true), [onVideoPlayStateChange, index]);
  const handlePause = useCallback(() => onVideoPlayStateChange(index, false), [onVideoPlayStateChange, index]);
  const handleVideoClick = useCallback(() => onVideoClick(index), [onVideoClick, index]);
  const handleShowPlay = useCallback(() => onShowPlayTemporarily(index), [onShowPlayTemporarily, index]);
  const handleToggleMute = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onToggleMute(index);
    },
    [onToggleMute, index],
  );
  const handleToggleDesc = useCallback(() => onToggleDesc(index), [onToggleDesc, index]);
  const handleLike = useCallback(() => onLike(item._id), [onLike, item._id]);
  const handleWishlist = useCallback(() => {
    if (item.product) onWishlistToggle(item.product);
  }, [onWishlistToggle, item.product]);

  return (
    <>
      {/* Media panel */}
      <div
        className="w-full md:w-[40%] h-full relative overflow-hidden md:rounded-2xl selection:bg-transparent"
        style={{
          transform: `translateY(-${pull * 0.7}px)`,
          opacity: 1 - Math.min(pull / 150, 1),
          transition: pull === 0 ? "all 0.25s ease" : "none",
        }}
      >
        {item.type === "flashsale" && (
          <span className="absolute top-10 left-4 shadow-2xl py-2 px-5 rounded-full text-sm font-poppins bg-primaryhover text-white z-10">
            Flashsale
          </span>
        )}

        {!isMediaActive ? (
          // Outside the render window: no <video>/<Image> mounted at all, so
          // nothing is decoding or holding a frame buffer for it. Same size
          // as the real media so scroll-snap positions don't shift.
          <div className="absolute inset-0 bg-gray-800" />
        ) : item.mediaType === "image" ? (
          <>
            {!isLoaded && (
              <div className="absolute inset-0 bg-gray-200 overflow-hidden">
                <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent" />
              </div>
            )}
            <Image
              src={item.mediaUrl}
              alt={item.title}
              fill
              sizes="300px"
              className={`object-cover transition-opacity duration-500 ${isLoaded ? "opacity-100" : "opacity-0"}`}
              onLoad={handleMediaLoaded}
              onError={handleMediaLoaded}
              loader={bunnyLoader}
              priority={index < 2}
            />
          </>
        ) : !isVideoActive ? (
          // Outside the tight video window (prev/next only): no <video> is
          // mounted at all — zero network request, zero decoder held. Show
          // the poster thumbnail instead of a flat box when we have one, so
          // the card still looks alive while it waits its turn.
          <div className="absolute inset-0 bg-gray-800">
            {item.image && (
              <Image
                src={item.image}
                alt={item.title}
                fill
                sizes="300px"
                className="object-cover"
                loader={bunnyLoader}
              />
            )}
          </div>
        ) : (
          <>
            {!isLoaded && (
              <div className="absolute inset-0 bg-gray-200 overflow-hidden">
                <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent" />
              </div>
            )}
            <video
              // Current video gets a full preload since it's playing right
              // now; prev/next only preload metadata — just enough to
              // resume instantly once it becomes current, without pulling
              // down the full file in the background.
              preload={isCurrent ? "auto" : "metadata"}
              ref={registerVideoRef}
              loop
              muted={muted}
              poster={item.image || undefined}
              src={item.mediaUrl}
              className={`w-full h-full object-cover cursor-pointer transition-opacity duration-500 ${isLoaded ? "opacity-100" : "opacity-0"}`}
              onPlay={handlePlay}
              onPause={handlePause}
              onCanPlay={handleMediaLoaded}
              onError={handleMediaLoaded}
              onClick={handleShowPlay}
              onMouseMove={handleShowPlay}
              playsInline
            />

            <div
              onClick={handleVideoClick}
              className={`absolute w-full h-full top-0 flex items-center justify-center cursor-pointer bg-[radial-gradient(circle,_rgba(0,_0,_0,_0.2),_rgba(0,_0,_0,_0.6))] duration-300 ${showPlayOverlay
                ? "opacity-100"
                : "hidden opacity-0"
                }`}
            >
              <div className="w-20 h-20 rounded-full bg-primaryhover flex items-center justify-center">
                {isPlaying ? (
                  <Pause size={40} color="white" />
                ) : (
                  <Play size={40} color="white" />
                )}
              </div>
              <span
                className="absolute top-12 right-4 cursor-pointer"
                onClick={handleToggleMute}
              >
                {muted ? (
                  <VolumeX color="white" size={16} />
                ) : (
                  <Volume2 color="white" size={16} />
                )}
              </span>
            </div>
          </>
        )}

        {/* Overlay info */}
        <div className="absolute bottom-10 left-0 right-0 bg-gradient-to-t px-5 text-white flex flex-col gap-4">
          <div onClick={handleToggleDesc} className="w-[80%]">
            <p className="text-xl md:text-sm font-medium mb-2 [text-shadow:0_2px_4px_rgba(0,0,0,0.5)]">
              {item.title}
            </p>
            <p className="text-sm md:text-xs [text-shadow:0_2px_4px_rgba(0,0,0,0.5)]">
              {isDescExpanded
                ? item.description
                : item.description.slice(0, 80)}
              <span className="text-[#aaa] cursor-pointer">
                {isDescExpanded ? " less..." : " more..."}
              </span>
            </p>
          </div>

          {item.product && (
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M0.0821635 7.21058C0.273497 7.87924 0.78883 8.39391 1.81883 9.42391L3.03883 10.6439C4.83216 12.4379 5.72816 13.3332 6.8415 13.3332C7.9555 13.3332 8.8515 12.4372 10.6442 10.6446C12.4375 8.85124 13.3335 7.95524 13.3335 6.84124C13.3335 5.72791 12.4375 4.83124 10.6448 3.03858L9.42483 1.81858C8.39416 0.788578 7.8795 0.273244 7.21083 0.0819108C6.54216 -0.110089 5.83216 0.0539108 4.41283 0.381911L3.59416 0.570578C2.3995 0.845911 1.80216 0.983911 1.39283 1.39258C0.983497 1.80124 0.84683 2.39991 0.57083 3.59391L0.381497 4.41258C0.0541636 5.83258 -0.10917 6.54191 0.0821635 7.21058ZM5.41483 3.51391C5.54341 3.63791 5.646 3.7863 5.7166 3.95039C5.7872 4.11448 5.82439 4.291 5.82601 4.46963C5.82763 4.64825 5.79364 4.82541 5.72603 4.99076C5.65842 5.15611 5.55854 5.30632 5.43222 5.43264C5.30591 5.55895 5.15569 5.65883 4.99035 5.72644C4.825 5.79406 4.64784 5.82805 4.46921 5.82643C4.29058 5.82481 4.11407 5.78761 3.94998 5.71701C3.78588 5.64641 3.6375 5.54383 3.5135 5.41524C3.26887 5.16158 3.13359 4.82202 3.13679 4.46963C3.13998 4.11723 3.28139 3.78018 3.53058 3.53099C3.77977 3.2818 4.11682 3.1404 4.46921 3.1372C4.8216 3.13401 5.16116 3.26928 5.41483 3.51391ZM11.3668 6.70058L6.71416 11.3539C6.61982 11.4449 6.49349 11.4953 6.3624 11.4941C6.2313 11.4929 6.10592 11.4402 6.01325 11.3475C5.92059 11.2547 5.86807 11.1293 5.86699 10.9982C5.86591 10.8671 5.91637 10.7408 6.0075 10.6466L10.6595 5.99324C10.7533 5.89945 10.8805 5.84675 11.0132 5.84675C11.1458 5.84675 11.273 5.89945 11.3668 5.99324C11.4606 6.08704 11.5133 6.21426 11.5133 6.34691C11.5133 6.47956 11.4606 6.60678 11.3668 6.70058Z"
                    fill="white"
                  />
                </svg>
                {item.flashPrice ? (
                  <div className="flex items-center text-xs gap-2">
                    <span>
                      {Number(item.flashPrice).toLocaleString(
                        "en-NG",
                        { style: "currency", currency: "NGN" },
                      )}
                    </span>
                    <small className="line-through">
                      {Number(
                        item.product.price,
                      ).toLocaleString("en-NG", {
                        style: "currency",
                        currency: "NGN",
                      })}
                    </small>
                  </div>
                ) : (
                  <p className="text-xs">
                    {Number(item.product.price).toLocaleString(
                      "en-NG",
                      { style: "currency", currency: "NGN" },
                    )}
                  </p>
                )}
              </span>
              <Link
                href={`/product/${item.product._id}`}
                className="text-xs bg-primaryhover flex items-center justify-center h-7 w-[40%]"
              >
                View Product
              </Link>
            </div>
          )}

          {item.type === "flashsale" && item.endDate && (
            <Countdown targetDate={item.endDate} />
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col gap-7 absolute right-3 bottom-24 md:relative md:right-0 md:bottom-auto md:text-black text-white">
        {item.likes && (
          <div className="flex flex-col items-center gap-2">
            <div
              className="w-10 h-10 bg-white rounded-full flex cursor-pointer items-center justify-center duration-300 scale-90 hover:scale-100 text-[#FF81C6]"
              onClick={handleLike}
            >
              {hasLiked ? <HeartFill /> : <Heart size={26} />}
            </div>
            <p className="text-xs [text-shadow:0_2px_4px_rgba(0,0,0,0.5)]">
              {item.likes.length}
            </p>
          </div>
        )}

        {item.comments && (
          <div className="flex flex-col items-center gap-2" onClick={onToggleComment}>
            <div className="w-10 h-10 bg-white rounded-full flex cursor-pointer items-center justify-center duration-300 scale-90 hover:scale-100 text-[#FF81C6]">
              <CommentIcon />
            </div>
            <p className="text-xs [text-shadow:0_2px_4px_rgba(0,0,0,0.5)]">
              {commentCount}
            </p>
          </div>
        )}

        <div
          className="w-10 h-10 bg-white rounded-full flex cursor-pointer items-center justify-center duration-300 scale-90 hover:scale-100"
          onClick={onShare}
        >
          <ShareIcon />
        </div>

        {item.product && (
          <div
            className={`w-10 h-10 ${itemInWishlist ? "bg-primaryhover" : "bg-white"
              } rounded-full flex cursor-pointer items-center justify-center duration-300 scale-90 hover:scale-100`}
            onClick={handleWishlist}
          >
            <Favorite fill={itemInWishlist ? "#FFF" : "#FF81C6"} />
          </div>
        )}
      </div>
    </>
  );
});

// ─── FeedItem (shell) ─────────────────────────────────────────────────────────

export default function FeedItem() {
  const feedsForRefreshRef = useRef<Feed[]>([]);
  const setFeedsExternallyRef = useRef<((feeds: Feed[]) => void) | null>(null);

  const handleRefresh = useCallback(async () => {
    try {
      if (
        feedsForRefreshRef.current.length === 0 ||
        !setFeedsExternallyRef.current
      )
        return;

      const shuffled = shuffleArray([...feedsForRefreshRef.current]);
      setFeedsExternallyRef.current(shuffled);
    } catch (error) {
      console.error("Pull-to-refresh error (feed):", error);
    }
  }, []);

  return (
    <PullToRefreshProvider onRefresh={handleRefresh}>
      <FeedContent
        feedsForRefreshRef={feedsForRefreshRef}
        setFeedsExternallyRef={setFeedsExternallyRef}
      />
    </PullToRefreshProvider>
  );
}

// ─── FeedContent ──────────────────────────────────────────────────────────────

function FeedContent({
  feedsForRefreshRef,
  setFeedsExternallyRef,
}: {
  feedsForRefreshRef: React.MutableRefObject<Feed[]>;
  setFeedsExternallyRef: React.MutableRefObject<
    ((feeds: Feed[]) => void) | null
  >;
}) {
  const params = useParams();
  const [addCommentLoading, setAddCommentLoading] = useState<boolean>(false);
  const { id: idParam, type } = params;

  const { pull } = usePullToRefresh();

  // ── Refs ────────────────────────────────────────────────────────────────
  const originalFeedsRef = useRef<Feed[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const itemRefCallbacks = useRef<Map<number, (el: HTMLDivElement | null) => void>>(new Map());
  const videoRefs = useRef<Record<number, HTMLVideoElement | null>>({});
  const videoRefCallbacks = useRef<Map<number, (el: HTMLVideoElement | null) => void>>(new Map());
  const hidePlayTimeouts = useRef<Record<number, NodeJS.Timeout>>({});
  const hasFocusedRef = useRef(false);
  const isFetchingRef = useRef(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  // Guards extendForward/extendBackward against overlapping invocations —
  // e.g. a fast burst of Next clicks, or a click racing the
  // IntersectionObserver's own edge-reached trigger for the same edge.
  const navLockRef = useRef(false);

  // ── Custom hooks ────────────────────────────────────────────────────────
  const {
    addComments,
    likeUpdate,
    likeUpdateComment,
    deleteUpdateComment,
    getFeeds,
    loading,
  } = useUpdates();
  const openModal = useModalStore((s) => s.openModal);
  const { addItem, isInWishlist, removeItem } = useWishlistStore();
  const socket = useSocket();

  // useUpdates() returns new function references on every render (it isn't
  // memoized internally), so any useCallback listing them as a dependency
  // gets a new identity every render too. That's mostly harmless — except
  // likePost is passed straight through as FeedCard's onLike prop, and an
  // unstable identity there silently defeats FeedCard's memo(), forcing
  // every card in the list to re-render on every unrelated state change.
  // Mirroring the latest functions in a ref keeps the callbacks that use
  // them stable across renders instead of recreating every time.
  const apiRef = useRef({ addComments, likeUpdate, likeUpdateComment, deleteUpdateComment, getFeeds });
  apiRef.current = { addComments, likeUpdate, likeUpdateComment, deleteUpdateComment, getFeeds };

  // ── State ───────────────────────────────────────────────────────────────
  const [isLoading, setIsLoading] = useState(true);
  // Gate the skeleton → real content swap on the first item's media actually
  // being ready, so we never flash an empty/broken-looking card.
  const [mediaReady, setMediaReady] = useState(false);
  const [href, setHref] = useState("");

  // Pagination cursor only — NOT the rendered list. `slots` (below) is the
  // bounded, recyclable window actually shown; `originalFeedsRef` is the
  // master pool of every real item ever fetched, used only as a source to
  // recycle from once hasMore is false. Recycled slots reference the same
  // Feed objects (nothing is cloned), so a like/comment mutation applied via
  // updateFeedById (below) is visible on every recycled copy at once.
  const [apiData, setApiData] = useState({ nextCursor: "", hasMore: true });
  const apiDataRef = useRef(apiData);
  apiDataRef.current = apiData;

  const [slots, setSlots] = useState<FeedSlot[]>([]);
  const slotsRef = useRef(slots);
  slotsRef.current = slots;

  const [currentIndex, setCurrentIndex] = useState(0);
  const currentIndexRef = useRef(currentIndex);
  currentIndexRef.current = currentIndex;

  // Anchor-based scroll compensation for prepend/append+trim: captured
  // immediately before any slots mutation that might shift content above
  // the current viewport, consumed by the layout effect below to hold the
  // previously-visible frame pixel-stable before (optionally) animating to
  // a new target. See captureAnchor's comment for why this is measured by
  // element position rather than inferred from scrollHeight deltas.
  const pendingAnchorRef = useRef<{ key: string; offsetTop: number } | null>(null);
  // A slot key to smooth-scroll to once it's actually in the DOM — set by
  // goNext/goPrev when the target isn't in the currently rendered window
  // yet, so we have to wait for the append/prepend to commit first.
  const pendingTargetKeyRef = useRef<string | null>(null);

  const [playingMap, setPlayingMap] = useState<Record<number, boolean>>({});

  const [wishlistMap, setWishlistMap] = useState<Record<string, boolean>>({});

  // Per-item description expansion & per-item video mute/play-overlay state —
  // these used to be single shared booleans, which meant expanding one
  // caption or muting one video affected every card in the feed.
  const [expandedDesc, setExpandedDesc] = useState<Set<number>>(new Set());
  const [mutedMap, setMutedMap] = useState<Record<number, boolean>>({});
  const [showPlayMap, setShowPlayMap] = useState<Record<number, boolean>>({});

  const [share, setShare] = useState(false);
  const [loadedIndex, setLoadedIndex] = useState<Set<number>>(new Set());
  const [comment, setComment] = useState<CommentState>({
    show: false,
    commentText: "",
    parent: { parentId: "", fullname: "", email: "" },
    focus: false,
  });
  const [user, setUser] = useState<{
    _id: string;
    email: string;
    fullname: string;
  } | null>(null);

  // ── Derived values ───────────────────────────────────────────────────────
  const activeFeed = slots[currentIndex]?.feed;
  const id = activeFeed?._id;
  const activeComments = activeFeed?.comments ?? [];

  const showSkeleton = isLoading || (slots.length > 0 && !mediaReady);

  // ── Sync refs with state ────────────────────────────────────────────────
  // feedsForRefreshRef mirrors the master pool (every real item fetched so
  // far), not the bounded/recycled `slots` window — pull-to-refresh needs
  // the full set to reshuffle from, not just whatever's currently rendered.
  useEffect(() => {
    feedsForRefreshRef.current = originalFeedsRef.current;
  }, [slots, feedsForRefreshRef]);

  useEffect(() => {
    setFeedsExternallyRef.current = (shuffled: Feed[]) => {
      originalFeedsRef.current = shuffled;
      setSlots(
        shuffled
          .slice(0, RECYCLE_BATCH * 3)
          .map((feed) => ({ key: nextSlotKey(feed._id), feed })),
      );
      setCurrentIndex(0);
      hasFocusedRef.current = true;
    };
  }, [setFeedsExternallyRef]);

  // ── Initial fetch (runs once per feed type, not on pull-to-refresh) ─────
  // Pull-to-refresh reshuffles the already-loaded feeds client-side (see
  // FeedItem's handleRefresh) — it never needs a server round trip, so this
  // effect no longer depends on `refreshing`. Re-fetching on every refresh
  // gesture was racing the client-side shuffle and forcing an unnecessary
  // full-skeleton flash.
  useEffect(() => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setIsLoading(true);
    setMediaReady(false);
    setLoadedIndex(new Set());

    const fetchInitialFeeds = async () => {
      try {
        const result = await apiRef.current.getFeeds(type as string, "");
        originalFeedsRef.current = result.data;
        setSlots(result.data.map((feed: Feed) => ({ key: nextSlotKey(feed._id), feed })));
        setApiData({ nextCursor: result.nextCursor, hasMore: result.hasMore });
        setCurrentIndex(0);
      } catch (err) {
        console.error("Error fetching initial feeds:", err);
      } finally {
        setIsLoading(false);
        isFetchingRef.current = false;
      }
    };

    fetchInitialFeeds();
  }, [type]);

  // ── Wait for the first item's media before revealing real content ───────
  useEffect(() => {
    if (isLoading || mediaReady || slots.length === 0) return;
    if (loadedIndex.has(0)) {
      setMediaReady(true);
      return;
    }
    // Fallback so a slow/broken first image never leaves the skeleton stuck.
    const timeout = setTimeout(() => setMediaReady(true), 4000);
    return () => clearTimeout(timeout);
  }, [isLoading, mediaReady, slots.length, loadedIndex]);

  // ── User initialization ──────────────────────────────────────────────────
  useEffect(() => {
    setUser(getUser());
  }, []);

  // ── Share URL ────────────────────────────────────────────────────────────
  // Was `window.location.href` read once on mount — meaning the Share
  // button always shared whatever post the page *first* loaded with, never
  // the one actually being viewed after scrolling. Built from type/id
  // instead so it stays correct as the active post changes, and doesn't
  // depend on the address-bar sync (below) having already caught up.
  useEffect(() => {
    if (!id || typeof window === "undefined") return;
    setHref(`${window.location.origin}/pages/update/${type}/${id}`);
  }, [id, type]);

  // ── Focus to initial feed ───────────────────────────────────────────────
  useEffect(() => {
    if (showSkeleton || hasFocusedRef.current || !slots.length) return;
    const focusedIndex = slots.findIndex((s) => s.feed._id === idParam);
    if (focusedIndex === -1) return;

    const el = itemRefs.current[focusedIndex];
    if (!el) return;

    hasFocusedRef.current = true;
    setCurrentIndex(focusedIndex);
    scrollToWithOffset(el, 60);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showSkeleton, slots, idParam]);

  // ── Anchor-based scroll compensation ─────────────────────────────────────
  // Core mechanic for the endless-in-both-directions feed: whenever slots
  // are prepended, or trimmed from the front to enforce MAX_RENDERED_ITEMS,
  // content shifts above the current viewport and the browser would
  // otherwise visibly jump. captureAnchor records exactly where the item
  // the user is currently looking at sits (by slot key, not index — indices
  // shift, keys don't), right before such a mutation. The layout effect
  // below runs synchronously after the DOM commits the new slots, before
  // the browser paints: it re-measures that same anchor's new position and
  // adjusts scrollTop by the delta, so the visible frame never moves. This
  // is measured directly (anchor position before vs. after) rather than
  // inferred from scrollHeight before/after, because a scrollHeight delta
  // conflates "content changed above the viewport" (needs compensation)
  // with "content changed below it" (a pure append — needs none); a plain
  // append+trim or prepend+trim mixes both in one mutation, and only the
  // anchor's own measured position is unambiguous about which happened.
  const captureAnchor = useCallback(() => {
    const container = containerRef.current;
    const slot = slotsRef.current[currentIndexRef.current];
    const el = itemRefs.current[currentIndexRef.current];
    if (!container || !slot || !el) return;
    pendingAnchorRef.current = {
      key: slot.key,
      offsetTop:
        el.getBoundingClientRect().top -
        container.getBoundingClientRect().top +
        container.scrollTop,
    };
  }, []);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (pendingAnchorRef.current) {
      const { key, offsetTop: oldOffsetTop } = pendingAnchorRef.current;
      pendingAnchorRef.current = null;
      const idx = slots.findIndex((s) => s.key === key);
      const el = idx !== -1 ? itemRefs.current[idx] : null;
      if (el) {
        const newOffsetTop =
          el.getBoundingClientRect().top -
          container.getBoundingClientRect().top +
          container.scrollTop;
        container.scrollTop += newOffsetTop - oldOffsetTop;
      }
    }

    if (pendingTargetKeyRef.current) {
      const targetKey = pendingTargetKeyRef.current;
      pendingTargetKeyRef.current = null;
      const idx = slots.findIndex((s) => s.key === targetKey);
      if (idx !== -1) {
        const el = itemRefs.current[idx];
        if (el) scrollToWithOffset(el, 60);
        setCurrentIndex(idx);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slots]);

  // Appends recycled/fetched feeds as fresh slots, trims from the front if
  // the window exceeds MAX_RENDERED_ITEMS (adjusting currentIndex so it
  // still points at the same conceptual item), and captures a scroll anchor
  // first since a front-trim shifts content above the viewport.
  const appendSlots = useCallback((feeds: Feed[]): FeedSlot[] => {
    const newSlots = feeds.map((feed) => ({ key: nextSlotKey(feed._id), feed }));
    if (!newSlots.length) return newSlots;
    captureAnchor();
    setSlots((prev) => {
      const next = [...prev, ...newSlots];
      if (next.length <= MAX_RENDERED_ITEMS) return next;
      const trimCount = next.length - MAX_RENDERED_ITEMS;
      setCurrentIndex((ci) => Math.max(0, ci - trimCount));
      return next.slice(trimCount);
    });
    return newSlots;
  }, [captureAnchor]);

  // Mirror of appendSlots for the backward direction: prepends, shifts
  // currentIndex forward by however many were added (everything after them
  // moved down), and trims from the back (below the viewport — no anchor
  // disturbance) if over the cap.
  const prependSlots = useCallback((feeds: Feed[]): FeedSlot[] => {
    const newSlots = feeds.map((feed) => ({ key: nextSlotKey(feed._id), feed }));
    if (!newSlots.length) return newSlots;
    captureAnchor();
    setSlots((prev) => {
      const next = [...newSlots, ...prev];
      setCurrentIndex((ci) => ci + newSlots.length);
      return next.length <= MAX_RENDERED_ITEMS ? next : next.slice(0, MAX_RENDERED_ITEMS);
    });
    return newSlots;
  }, [captureAnchor]);

  // Extends the feed forward: fetches the next real API page if one exists,
  // otherwise recycles a shuffled batch from the master pool. Shared by
  // goNext (button, at the end of the window) and the IntersectionObserver
  // (natural scroll reaching the last rendered item) — same "reached this
  // edge" event, same response, regardless of how the user got there.
  // autoScroll is only requested by the button handler: natural scroll
  // should silently top up the window (still anchor-compensated if a
  // front-trim happens), never hijack the user's own scroll with a forced
  // programmatic jump.
  const extendForward = useCallback(async (opts?: { autoScroll?: boolean }): Promise<FeedSlot[]> => {
    if (navLockRef.current) return [];
    navLockRef.current = true;
    try {
      let feeds: Feed[];
      if (apiDataRef.current.hasMore) {
        const page = await apiRef.current.getFeeds(type as string, apiDataRef.current.nextCursor || "");
        originalFeedsRef.current = [...originalFeedsRef.current, ...page.data];
        setApiData({ nextCursor: page.nextCursor, hasMore: page.hasMore });
        feeds = page.data;
      } else if (originalFeedsRef.current.length) {
        feeds = shuffleArray(originalFeedsRef.current).slice(0, RECYCLE_BATCH);
      } else {
        feeds = [];
      }
      if (!feeds.length) return [];
      const created = appendSlots(feeds);
      if (opts?.autoScroll && created.length) pendingTargetKeyRef.current = created[0].key;
      return created;
    } catch (err) {
      console.error("Error extending feed forward:", err);
      return [];
    } finally {
      navLockRef.current = false;
    }
  }, [type, appendSlots]);

  // Backward counterpart. Always synchronous/recycled — the API only
  // paginates forward, so there's no "earlier real page" to fetch; going
  // back just recycles from whatever's already in the master pool. The
  // autoScroll target is the *last* item of the newly prepended batch —
  // the one that now sits immediately before the old first item, i.e. one
  // step back from wherever the user was.
  const extendBackward = useCallback((opts?: { autoScroll?: boolean }): FeedSlot[] => {
    if (navLockRef.current) return [];
    if (!originalFeedsRef.current.length) return [];
    navLockRef.current = true;
    try {
      const created = prependSlots(shuffleArray(originalFeedsRef.current).slice(0, RECYCLE_BATCH));
      if (opts?.autoScroll && created.length) pendingTargetKeyRef.current = created[created.length - 1].key;
      return created;
    } finally {
      navLockRef.current = false;
    }
  }, [prependSlots]);

  // ── Stable per-index ref callbacks ──────────────────────────────────────
  // Cached so React doesn't detach/reattach every mounted item's ref on
  // every render (which an inline arrow function would otherwise cause).
  const getItemRefCallback = useCallback((index: number) => {
    let cb = itemRefCallbacks.current.get(index);
    if (!cb) {
      cb = (el: HTMLDivElement | null) => {
        itemRefs.current[index] = el;
        if (el) observerRef.current?.observe(el);
      };
      itemRefCallbacks.current.set(index, cb);
    }
    return cb;
  }, []);

  const getVideoRefCallback = useCallback((index: number) => {
    let cb = videoRefCallbacks.current.get(index);
    if (!cb) {
      cb = (el: HTMLVideoElement | null) => {
        videoRefs.current[index] = el;
      };
      videoRefCallbacks.current.set(index, cb);
    }
    return cb;
  }, []);

  // ── Intersection Observer for feed visibility ────────────────────────────
  // Only recreated when the feed type changes; individual items self-register
  // via getItemRefCallback as they mount, so liking/commenting (which
  // replace the `slots` array reference) no longer force a full disconnect +
  // re-query of every section in the list.
  //
  // Natural scroll/swipe is the primary way users move through a feed like
  // this — Next/Previous buttons are a secondary desktop affordance — so
  // reaching either edge here extends the feed exactly the way the buttons
  // do (same extendForward/extendBackward engine), just without an
  // autoScroll target: this should silently top up the window, never hijack
  // the user's own scroll with a forced jump.
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const index = Number(entry.target.id.replace("feed-", ""));
          if (!slotsRef.current[index]) return;

          // Never called for a button-driven change — those already scroll
          // and set currentIndex themselves — only for genuine user scroll,
          // so no programmatic scroll is triggered here.
          setCurrentIndex(index);

          if (index === slotsRef.current.length - 1) {
            void extendForward();
          } else if (index === 0) {
            extendBackward();
          }
        });
      },
      { threshold: 0.6 },
    );

    itemRefs.current.forEach((el) => {
      if (el) observerRef.current?.observe(el);
    });

    return () => {
      observerRef.current?.disconnect();
      observerRef.current = null;
    };
  }, [type, extendForward, extendBackward]);

  // ── URL sync ──────────────────────────────────────────────────────────────
  // Tried routing this through next/navigation's router.replace() so
  // generateMetadata() would re-run server-side and keep <title>/OG tags in
  // sync with the active post — verified live, and it reliably remounts this
  // component on every settled navigation (fresh isLoading/data.feeds, media
  // reloading, scroll/video state lost), not just during the initial
  // unsettled window a debounce guard could paper over. That's a worse
  // regression than the metadata staying static, so back to a plain
  // history.replaceState — cosmetic address-bar sync only, no App Router
  // involvement, no remount. generateMetadata() only reflects the post the
  // page was first loaded with; revisit if this needs solving without the
  // remount cost (e.g. a dedicated client-only metadata update, or filing
  // the remount behavior against this Next.js version).
  useEffect(() => {
    if (!id) return;
    window.history.replaceState(null, "", `/pages/update/${type}/${id}`);
  }, [id, type]);

  // ── Body scroll lock for comments ───────────────────────────────────────
  useEffect(() => {
    document.body.style.overflow = comment.show ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [comment.show]);

  // ── Cleanup timeouts ────────────────────────────────────────────────────
  useEffect(() => {
    const timeouts = hidePlayTimeouts.current;
    return () => {
      Object.values(timeouts).forEach(clearTimeout);
    };
  }, []);

  // ── Scroll helpers ──────────────────────────────────────────────────────
  const scrollToWithOffset = useCallback((el: HTMLElement, offset = 80) => {
    const container = containerRef.current;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    const scrollTop =
      container.scrollTop +
      (elRect.top - containerRect.top) -
      container.clientHeight / 2 +
      el.clientHeight / 2 +
      offset;

    container.scrollTo({ top: scrollTop, behavior: "smooth" });
  }, []);

  // Next/Previous never wrap and never dead-end: reaching either edge of
  // the currently rendered window extends the feed in that direction
  // (fetch-or-recycle) via the same extendForward/extendBackward engine
  // natural scroll uses, rather than looping back to an existing index —
  // that's what makes the feed feel like it has no beginning or end.
  const goNext = useCallback(async () => {
    const curIndex = currentIndexRef.current;
    const curSlots = slotsRef.current;

    if (curIndex < curSlots.length - 1) {
      const targetIndex = curIndex + 1;
      const el = itemRefs.current[targetIndex];
      if (el) scrollToWithOffset(el, 60);
      setCurrentIndex(targetIndex);
      return;
    }

    await extendForward({ autoScroll: true });
  }, [extendForward, scrollToWithOffset]);

  const goPrev = useCallback(() => {
    const curIndex = currentIndexRef.current;

    if (curIndex > 0) {
      const targetIndex = curIndex - 1;
      const el = itemRefs.current[targetIndex];
      if (el) scrollToWithOffset(el, 60);
      setCurrentIndex(targetIndex);
      return;
    }

    extendBackward({ autoScroll: true });
  }, [extendBackward, scrollToWithOffset]);

  // ── Video helpers ───────────────────────────────────────────────────────
  const handleVideoPlay = useCallback((index: number) => {
    const video = videoRefs.current[index];
    if (!video) return;

    if (video.paused) video.play().catch(() => { });
    else video.pause();
  }, []);

  const showPlayTemporarily = useCallback((index: number) => {
    // onMouseMove fires continuously while the cursor moves over an active
    // video — without this bail-out (same pattern setVideoPlaying already
    // uses), every single mousemove event was triggering a state update and
    // re-rendering the whole feed list, even though the overlay was already
    // showing and nothing visible actually changed.
    setShowPlayMap((prev) => (prev[index] ? prev : { ...prev, [index]: true }));

    const existing = hidePlayTimeouts.current[index];
    if (existing) clearTimeout(existing);
    hidePlayTimeouts.current[index] = setTimeout(() => {
      setShowPlayMap((prev) => ({ ...prev, [index]: false }));
    }, 5000);
  }, []);

  const toggleMute = useCallback((index: number) => {
    setMutedMap((prev) => ({ ...prev, [index]: !(prev[index] ?? true) }));
  }, []);

  const setVideoPlaying = useCallback((index: number, playing: boolean) => {
    setPlayingMap((prev) => (prev[index] === playing ? prev : { ...prev, [index]: playing }));
  }, []);

  // Drives play/pause for every mounted <video>, the single source of
  // truth for which one is actually decoding/playing. The old `autoPlay`
  // attribute only fires once on mount, so it can't pause a video once it
  // stops being current — combined with a wide render window, that let up
  // to MEDIA_RENDER_WINDOW*2+1 videos play simultaneously. Now only the
  // current index ever plays; every other mounted video (the prev/next
  // preload tier) stays paused, ready to resume instantly once it becomes
  // current.
  useEffect(() => {
    Object.entries(videoRefs.current).forEach(([key, video]) => {
      if (!video) return;
      const idx = Number(key);
      if (idx === currentIndex) {
        if (video.paused) video.play().catch(() => { });
      } else if (!video.paused) {
        video.pause();
      }
    });
  }, [currentIndex, slots]);

  // ── Auth helper ─────────────────────────────────────────────────────────
  const checkIfUserLoggedIn = useCallback(
    (action = "perform this action"): boolean => {
      if (!user?._id) {
        openModal("authwrapper");
        toast.error(`You must be logged in to ${action}`, {
          position: "top-right",
        });
        return false;
      }
      return true;
    },
    [user?._id, openModal],
  );

  // Patches a feed by _id everywhere it currently appears — potentially
  // several recycled slots at once — plus the master pool, so any future
  // recycled copy reflects the update too. Necessary because recycling
  // means the same underlying post can be on screen more than once
  // simultaneously; without patching every occurrence, liking one copy
  // would leave the others showing stale data.
  const updateFeedById = useCallback(
    (feedId: string | string[], updater: (feed: Feed) => Feed) => {
      setSlots((prev) =>
        prev.map((slot) =>
          slot.feed._id === feedId ? { ...slot, feed: updater(slot.feed) } : slot,
        ),
      );
      originalFeedsRef.current = originalFeedsRef.current.map((feed) =>
        feed._id === feedId ? updater(feed) : feed,
      );
    },
    [],
  );

  // ── Comment helpers ─────────────────────────────────────────────────────
  const updateFeedComments = useCallback(
    (
      feedId: string | string[],
      updater: (comments: CommentData[]) => CommentData[],
    ) => {
      updateFeedById(feedId, (feed) => ({
        ...feed,
        comments: updater(feed.comments ?? []),
      }));
    },
    [updateFeedById],
  );

  const addReplyRecursive = useCallback(
    (
      list: CommentData[],
      targetId: string,
      reply: CommentData,
    ): CommentData[] =>
      list.map((node) => {
        if (node._id === targetId)
          return {
            ...node,
            replies: [...node.replies, { ...reply, showReplies: true }],
          };
        if (node.replies?.length)
          return {
            ...node,
            replies: addReplyRecursive(node.replies, targetId, {
              ...reply,
              showReplies: true,
            }),
          };
        return node;
      }),
    [],
  );

  const addRecursiveLike = useCallback(
    (list: CommentData[], targetId: string, userId: string): CommentData[] =>
      list.map((node) => {
        if (node._id === targetId) {
          const liked = node.likes.some((l) => l === userId);
          return {
            ...node,
            likes: liked
              ? node.likes.filter((l) => l !== userId)
              : [...node.likes, userId],
          };
        }
        if (node.replies?.length)
          return {
            ...node,
            replies: addRecursiveLike(node.replies, targetId, userId),
          };
        return node;
      }),
    [],
  );

  // Like addRecursiveLike, but sets the like to an explicit target state
  // instead of toggling it — needed for reconciling a remote user's
  // liked/unliked event, where blindly toggling could invert the wrong way
  // if events arrive out of order or get replayed.
  const setRecursiveLike = useCallback(
    (list: CommentData[], targetId: string, userId: string, liked: boolean): CommentData[] =>
      list.map((node) => {
        if (node._id === targetId) {
          const alreadyLiked = node.likes.some((l) => l === userId);
          if (alreadyLiked === liked) return node;
          return {
            ...node,
            likes: liked
              ? [...node.likes, userId]
              : node.likes.filter((l) => l !== userId),
          };
        }
        if (node.replies?.length)
          return {
            ...node,
            replies: setRecursiveLike(node.replies, targetId, userId, liked),
          };
        return node;
      }),
    [],
  );

  const recursiveDeleteComment = useCallback(
    (list: CommentData[], targetId: string): CommentData[] =>
      list
        .filter((node) => node._id !== targetId)
        .map((node) => ({
          ...node,
          replies: node.replies?.length
            ? recursiveDeleteComment(node.replies, targetId)
            : node.replies,
        })),
    [],
  );

  // ── Socket.IO — feed room + live event syncing ───────────────────────────
  // Joins the room for whichever post is currently in view, applies live
  // like/unlike (feed:post) and comment activity (feed:comment) from other
  // users to local state, and leaves the room again when the viewed post
  // changes or the component unmounts. Declared after the comment helpers
  // above (updateFeedComments/addReplyRecursive/recursiveDeleteComment/
  // setRecursiveLike) since it closes over them.
  const activePostId = activeFeed?._id;
  const activePostType = activeFeed?.type;

  useEffect(() => {
    if (!socket || loading || !activePostId) return;

    // The shared socket also reconnects for reasons that have nothing to do
    // with the feed (e.g. SocketProvider re-authenticating after login), so
    // re-join on every "connect" rather than just once — otherwise a
    // reconnect would silently drop this room server-side.
    const join = () => {
      socket.emit("feed:join", {
        postId: activePostId,
        type: activePostType,
      });
    };
    // Live like/unlike from other users viewing this same post. Whoever
    // actually clicked the heart already got their own optimistic update
    // from likePost() below, so re-applying their own echoed event here
    // would be redundant — only other users' actions need to land here.
    const handleFeedPost = (payload: IUpdateSocketFeed) => {
      if (payload.postId !== activePostId) return;
      if (payload.userId === user?._id) return;

      updateFeedById(payload.postId, (feed) => {
        const alreadyLiked = feed.likes?.some((l) => l === payload.userId) ?? false;
        if (payload.liked === alreadyLiked) return feed;

        const likes = payload.liked
          ? [...(feed.likes ?? []), payload.userId]
          : (feed.likes ?? []).filter((l) => l !== payload.userId);

        return { ...feed, likes };
      });
    };
    // Live comment activity from other users viewing this same post —
    // mirrors the local optimistic updates sendComment/deleteComment/
    // likeComment already apply to the acting user's own view.
    const handleFeedComment = (payload: IUpdateSocketFeedComment) => {
      if (payload.postId !== activePostId) return;

      if (payload.action === "created") {
        const comment = payload.comment as CommentData;
        if (comment.user?._id === user?._id) return; // already added optimistically

        updateFeedComments(payload.postId, (comments) =>
          comment.parentId
            ? addReplyRecursive(comments, comment.parentId, comment)
            : [...comments, comment],
        );
        return;
      }

      if (payload.action === "deleted") {
        updateFeedComments(payload.postId, (comments) =>
          recursiveDeleteComment(comments, payload.commentId),
        );
        return;
      }

      // action is "liked" | "unliked"
      if (payload.userId === user?._id) return; // already applied optimistically
      updateFeedComments(payload.postId, (comments) =>
        setRecursiveLike(comments, payload.commentId, payload.userId, payload.liked),
      );
    };

    if (socket.connected) join();
    socket.on("connect", join);
    socket.on("feed:post", handleFeedPost);
    socket.on("feed:comment", handleFeedComment);

    return () => {
      socket.off("connect", join);
      socket.off("feed:post", handleFeedPost);
      socket.off("feed:comment", handleFeedComment);
      if (socket.connected) {
        socket.emit("feed:leave", {
          postId: activePostId,
          type: activePostType,
        });
      }
    };
  }, [
    socket,
    activePostId,
    activePostType,
    loading,
    user?._id,
    updateFeedById,
    updateFeedComments,
    addReplyRecursive,
    recursiveDeleteComment,
    setRecursiveLike,
  ]);

  const handleToggle = useCallback(
    (targetId: string) => {
      const toggle = (list: CommentData[]): CommentData[] =>
        list.map((node) => {
          if (node._id === targetId)
            return { ...node, showReplies: !node.showReplies };
          if (node.replies.length)
            return { ...node, replies: toggle(node.replies) };
          return node;
        });

      if (id) updateFeedComments(id, toggle);
    },
    [id, updateFeedComments],
  );

  const replyComment = useCallback((parent: CommentState["parent"]) => {
    setComment((prev) => ({
      ...prev,
      parent: {
        ...parent,
        fullname: parent.fullname ?? "", // ✅ FIX: guard against undefined fullname
      },
    }));
  }, []);

  const sendComment = useCallback(
    async (parentId: string | null) => {
      if (!checkIfUserLoggedIn("send a comment")) return;
      if (!comment.commentText.trim()) return;

      setAddCommentLoading(true);

      try {
        const newComment: CommentData = {
          _id: "",
          text: comment.commentText.trim(),
          user: { _id: user!._id, fullname: user!.fullname, email: user!.email },
          parentId,
          likes: [],
          replies: [],
          showReplies: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const feedType = originalFeedsRef.current.find((f) => f._id === id)?.type;

        const req = await apiRef.current.addComments({
          feedId: id as string,
          type: feedType as string,
          comment: newComment.text,
          parentId: parentId as string,
        });
        newComment._id = req._id;

        if (parentId) {
          updateFeedComments(id!, (comments) =>
            addReplyRecursive(comments, parentId, newComment),
          );
        } else {
          updateFeedComments(id!, (comments) => [...comments, newComment]);
        }

        setComment((prev) => ({
          ...prev,
          commentText: "",
          parent: { parentId: "", fullname: "", email: "" },
        }));
      } catch (err) {
        console.error("Failed to add comment:", err);
        toast.error("Failed to post comment");
      } finally {
        setAddCommentLoading(false);
      }
    },
    [
      comment.commentText,
      user,
      id,
      updateFeedComments,
      addReplyRecursive,
      checkIfUserLoggedIn,
    ],
  );

  const likePost = useCallback(
    async (_id: string) => {
      if (!checkIfUserLoggedIn("like posts")) return;

      const targetFeed = originalFeedsRef.current.find((f) => f._id === _id);
      if (!targetFeed) return;

      const liked = targetFeed.likes?.some((l) => l === user!._id);
      const newLikes = liked
        ? targetFeed.likes!.filter((l) => l !== user!._id)
        : [...(targetFeed.likes ?? []), user!._id];
      const previousLikes = targetFeed.likes;

      updateFeedById(_id, (feed) => ({ ...feed, likes: newLikes }));

      try {
        await apiRef.current.likeUpdate({
          feedId: _id,
          type: targetFeed.type,
        });
      } catch (err) {
        updateFeedById(_id, (feed) => ({ ...feed, likes: previousLikes }));
        console.error("Failed to like post:", err);
      }
    },
    [checkIfUserLoggedIn, user, updateFeedById],
  );

  const likeComment = useCallback(
    async (_id: string) => {
      if (!checkIfUserLoggedIn("like comments")) return;

      const feed = originalFeedsRef.current.find((f) => f._id === id);
      if (!feed) return;

      updateFeedComments(id!, (comments) =>
        addRecursiveLike(comments, _id, user!._id),
      );

      try {
        await apiRef.current.likeUpdateComment({
          feedId: id as string,
          type: feed.type,
          commentId: _id,
        });
      } catch (err) {
        console.error("Failed to like comment:", err);
      }
    },
    [checkIfUserLoggedIn, id, user, updateFeedComments, addRecursiveLike],
  );

  const deleteComment = useCallback(
    async (item: CommentData) => {
      const selectedFeed = originalFeedsRef.current.find((f) => f._id === id);
      if (!selectedFeed) return;

      updateFeedComments(id!, (comments) =>
        recursiveDeleteComment(comments, item._id),
      );
      try {
        await apiRef.current.deleteUpdateComment({
          feedId: id as string,
          commentId: item._id,
          type: selectedFeed.type,
        });
      } catch (err) {
        console.error("Failed to delete comment:", err);
        toast.error("Failed to delete comment");
      }
    },
    [id, updateFeedComments, recursiveDeleteComment],
  );

  const handleWishlistToggle = useCallback(
    (product: Product) => {
      if (!checkIfUserLoggedIn("manage your wishlist")) return;

      const currentlyIn = wishlistMap[product._id] ?? isInWishlist(product._id);

      if (currentlyIn) {
        removeItem(product._id);
        setWishlistMap((prev) => ({ ...prev, [product._id]: false }));
        toast.success("Removed from wishlist", { position: "top-right" });
      } else {
        addItem(product);
        setWishlistMap((prev) => ({ ...prev, [product._id]: true }));
        toast.success("Added to wishlist", { position: "top-right" });
      }
    },
    [checkIfUserLoggedIn, wishlistMap, isInWishlist, removeItem, addItem],
  );

  const toggleDesc = useCallback((index: number) => {
    setExpandedDesc((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }, []);

  const toggleCommentPanel = useCallback(() => {
    setComment((prev) => ({ ...prev, show: !prev.show }));
  }, []);

  const openShare = useCallback(() => setShare(true), []);
  const closeCommentPanel = useCallback(() => setComment((prev) => ({ ...prev, show: false })), []);

  // ── Comment count helper ────────────────────────────────────────────────
  const getNumberOfComments = useCallback((comments: CommentData[]) => {
    let number = 0;
    comments.forEach((comment) => {
      number++;
      if (comment.replies) {
        number += getNumberOfComments(comment.replies);
      }
    });
    return number;
  }, []);

  // ── Media loaded handler ────────────────────────────────────────────────
  const handleMediaLoaded = useCallback((index: number) => {
    setLoadedIndex((prev) => {
      if (prev.has(index)) return prev;
      const next = new Set(prev);
      next.add(index);
      return next;
    });
  }, []);

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <>
      <PullToRefreshHeader />

      <PullToRefreshContainer>
        <section className="md:flex w-full pb-10">
          {/* Feed scroll container */}
          <div
            ref={containerRef}
            className="w-full h-screen grid gap-3 overflow-y-auto no-scrollbar md:overflow-y-hidden"
            style={{ scrollSnapType: "y mandatory" }}
          >
            {showSkeleton ? (
              <div className="w-full h-screen flex flex-col justify-center items-center gap-3 overflow-y-hidden no-scrollbar">
                <div className="w-full md:w-[40%] h-full">
                  <FeedSkeleton />
                </div>

              </div>
            ) : slots.length === 0 ? (
              <div className="h-screen flex items-center justify-center text-sm text-gray-500">
                No feeds available
              </div>
            ) : (
              <div className="grid gap-3 animate-placeholderFromBottom">
                {slots.map((slot, index) => {
                  const item = slot.feed;
                  const isLoaded = loadedIndex.has(index);
                  const isPlaying = playingMap[index] ?? false;
                  const hasLiked =
                    item.likes?.some((l) => l === user?._id) ?? false;
                  const commentCount = item.comments
                    ? getNumberOfComments(item.comments)
                    : 0;
                  const itemInWishlist = item.product
                    ? (wishlistMap[item.product._id] ??
                      isInWishlist(item.product._id))
                    : false;
                  const isMediaActive = Math.abs(index - currentIndex) <= MEDIA_RENDER_WINDOW;
                  const isCurrent = index === currentIndex;
                  const isVideoActive = Math.abs(index - currentIndex) <= VIDEO_ACTIVE_WINDOW;

                  return (
                    <div
                      key={slot.key}
                      id={`feed-${index}`}
                      ref={getItemRefCallback(index)}
                      className={`flex gap-4 relative items-center duration-300 h-[75vh] md:h-[88vh] w-full ${comment.show
                        ? "md:justify-start md:pl-[10%]"
                        : "md:justify-center"
                        } section`}
                      style={{ scrollSnapAlign: "start" }}
                    >
                      <FeedCard
                        item={item}
                        index={index}
                        isLoaded={isLoaded}
                        isPlaying={isPlaying}
                        hasLiked={hasLiked}
                        commentCount={commentCount}
                        itemInWishlist={itemInWishlist}
                        isDescExpanded={expandedDesc.has(index)}
                        isMediaActive={isMediaActive}
                        isCurrent={isCurrent}
                        isVideoActive={isVideoActive}
                        pull={pull}
                        muted={mutedMap[index] ?? true}
                        showPlayOverlay={showPlayMap[index] ?? false}
                        registerVideoRef={getVideoRefCallback(index)}
                        onMediaLoaded={handleMediaLoaded}
                        onVideoPlayStateChange={setVideoPlaying}
                        onVideoClick={handleVideoPlay}
                        onShowPlayTemporarily={showPlayTemporarily}
                        onToggleMute={toggleMute}
                        onToggleDesc={toggleDesc}
                        onLike={likePost}
                        onToggleComment={toggleCommentPanel}
                        onShare={openShare}
                        onWishlistToggle={handleWishlistToggle}
                      />
                    </div>
                  );
                })}

                <div className="h-[30vh] md:h-[10vh]" />
              </div>
            )}
          </div>

          {/* Comments panel */}
          <div
            onClick={closeCommentPanel}
            className={`fixed right-0 h-screen flex items-end md:items-center md:top-[5%] top-0 justify-center w-screen md:w-auto overflow-hidden duration-300 gap-3 ${comment.show ? "" : "translate-y-full md:translate-y-0"
              }`}
            style={{ zIndex: 100 }}
          >
            {/* Prev / Next navigation */}
            {
              !showSkeleton && <div
                className="pr-4 gap-6 hidden md:grid md:-translate-y-[10vh]"
                onClick={(e) => e.stopPropagation()}
              >
                <div
                  className="w-10 h-10 cursor-pointer bg-white rounded-full duration-300 flex items-center justify-center rotate-180 scale-90 hover:scale-100"
                  onClick={() => goPrev()}
                >
                  <ChevronDown />
                </div>
                <div
                  className="w-10 h-10 bg-white rounded-full flex cursor-pointer items-center justify-center duration-300 scale-90 hover:scale-100"
                  onClick={() => goNext()}
                >
                  <ChevronDown />
                </div>
              </div>
            }

            {/* Comment drawer */}
            <div
              className={`w-screen md:w-[350px] bg-[#FBE8FD] relative outline outline-white duration-300 rounded-tl-2xl rounded-bl-2xl ${comment.show
                ? "-translate-y-[22vh] md:-translate-y-[10vh]"
                : "translate-y-0 md:translate-y-0 md:translate-x-full hidden"
                }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-5 h-[50vh] flex-1 ">
                <div className="flex items-center mb-6">
                  <span className="cursor-pointer" onClick={closeCommentPanel}>
                    <GoBack />
                  </span>
                  <p className="text-sm px-[30%]">Comments</p>
                </div>

                <div className="overflow-y-auto h-[20vh] scrollbar-hide">
                  {activeComments.length > 0 ? (
                    <div className="grid gap-5">
                      {activeComments.map((item, key) => (
                        <CommentItem
                          key={item._id || key}
                          comments={activeComments}
                          item={item}
                          onToggle={handleToggle}
                          onReply={replyComment}
                          onLike={likeComment}
                          deleteComment={deleteComment}
                          user={user!}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-center">
                      This post has no comments
                    </p>
                  )}
                </div>
              </div>

              <div className="w-full px-2 md:px-2 pb-10 md:pb-3">
                <div
                  className={`bg-white relative rounded-2xl border ${comment.focus ? "border-primaryhover" : "border-transparent"
                    }`}
                >
                  <textarea
                    className="w-full h-32 text-base md:text-sm md:h-20 outline-none p-3 font-poppins resize-none rounded-2xl border border-transparent transition duration-300 bg-transparent"
                    placeholder={
                      comment.parent.parentId
                        ? `Replying to @${comment.parent.fullname
                          .replaceAll(" ", "")
                          .toLowerCase()}`
                        : "Write a comment"
                    }
                    value={comment.commentText}
                    onChange={(e) =>
                      setComment((prev) => ({
                        ...prev,
                        commentText: e.target.value,
                      }))
                    }
                    onFocus={() =>
                      setComment((prev) => ({ ...prev, focus: true }))
                    }
                    onBlur={() =>
                      setComment((prev) => ({ ...prev, focus: false }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendComment(comment.parent.parentId);
                      }
                    }}
                  />
                  <button
                    className={`w-10 h-10 md:w-6 md:h-6 bg-primaryhover rounded-full flex items-center justify-center absolute right-3 bottom-3 transition duration-300 ${comment.show ? "" : "hidden"
                      }`}
                    onClick={() => {
                      if (addCommentLoading) return;
                      sendComment(comment.parent.parentId)
                    }}
                  >

                    {addCommentLoading ? <LoaderCircle className="animate-spin text-white" /> : <SendHorizonal color="white" size={13} />}

                  </button>
                </div>
              </div>
            </div>
          </div>

          <ShareModal
            share={share}
            href={href}
            hideShare={() => setShare(false)}
          />
        </section>
      </PullToRefreshContainer>
    </>
  );
}
