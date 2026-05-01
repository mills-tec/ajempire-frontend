"use client";

import CommentItem from "@/components/CommentItem";
import {
  CommentIcon,
  Favorite,
  GoBack,
  HeartFill,
  ShareIcon,
} from "@/components/svgs/Icons";
import { getUser } from "@/lib/api";
import { CommentData, Feed, Product } from "@/lib/types";
import { getCountdown, ITEMS_TO_APPEND, shuffleArray } from "@/lib/utils";
import {
  Heart,
  Pause,
  Play,
  SendHorizonal,
  Volume2,
  VolumeX,
} from "lucide-react";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { useParams } from "next/navigation";
import { useWishlistStore } from "@/lib/stores/wishlist-store";
import useInfiniteScroll from "react-infinite-scroll-hook";
import { useUpdates } from "@/api/customHooks";
import EndlessScrollLoading from "./EndlessScrollLoading";
import ShareModal from "./ShareModal";
import Image from "next/image";
import { toast } from "sonner";
import { useModalStore } from "@/lib/stores/modal-store";

// ─── FeedSkeleton ─────────────────────────────────────────────────────────────

export function FeedSkeleton() {
  return Array.from({ length: ITEMS_TO_APPEND }).map((_, i) => (
    <div
      className="space-y-1 h-screen bg-gray-200 flex flex-col relative md:rounded-2xl"
      key={i}
    >
      <span className="absolute top-10 left-4 shadow-2xl bg-gray-300 animate-pulse h-10 w-32 py-2 px-5 rounded-full text-sm font-poppins text-white z-10" />
      <div className="flex flex-col gap-4 translate-y-[55%] h-full pl-4">
        <h2 className="text-sm truncate h-10 bg-gray-300 animate-pulse rounded-sm w-[60%]" />
        <div>
          <p className="lg:text-xs text-black/60 h-12 bg-gray-300 animate-pulse w-[40%]" />
        </div>
        <div className="flex items-center gap-2 pr-2 text-[7px] lg:text-[10px] rounded-sm h-12 bg-gray-300 animate-pulse w-[80%]" />
      </div>
    </div>
  ));
}

// ─── Countdown ───────────────────────────────────────────────────────────────

function Countdown({ targetDate }: { targetDate: string }) {
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    setMounted(true);
    setTimeLeft(getCountdown(targetDate));
    const timer = setInterval(
      () => setTimeLeft(getCountdown(targetDate)),
      1000,
    );
    return () => clearInterval(timer);
  }, [targetDate]);

  if (!mounted) return null;

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

// ─── Types ────────────────────────────────────────────────────────────────────

type CommentState = {
  show: boolean;
  commentText: string;
  parent: { parentId: string; fullname: string; email: string };
  focus: boolean;
};

// ─── FeedItem ─────────────────────────────────────────────────────────────────

export default function FeedItem() {
  const params = useParams();
  const { id: idParam, type } = params;

  // ── Refs ────────────────────────────────────────────────────────────────
  const originalFeedsRef = useRef<Feed[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});
  const hidePlayTimeout = useRef<NodeJS.Timeout | null>(null);
  // Keeps feeds accessible inside the observer without re-subscribing
  const feedsRef = useRef<Feed[]>([]);
  // Prevents focus-scroll from running more than once
  const hasFocusedRef = useRef(false);

  // ── Custom hooks — declared BEFORE any useEffect that references them ───
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

  // ── State ───────────────────────────────────────────────────────────────
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [, startDuplicateTransition] = useTransition();
  // isLoading drives the initial skeleton — separate from `loading` (infinite scroll)
  const [isLoading, setIsLoading] = useState(true);
  const [id, setId] = useState(idParam);
  const [href, setHref] = useState("");
  const [data, setData] = useState<{
    feeds: Feed[];
    nextCursor: string;
    hasMore: boolean;
  }>({ feeds: [], nextCursor: "", hasMore: false });
  const [playingMap, setPlayingMap] = useState<Record<string, boolean>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [inWishlist, setInWishlist] = useState(false);
  const [showDesc, setShowDesc] = useState(false);
  const [isLastItem, setLastItem] = useState(false);
  const [share, setShare] = useState(false);
  const [loadedIndex, setLoadedIndex] = useState<number[]>([]);
  const [videoState, setVideoState] = useState({ muted: true, showPlay: false });
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
  } | null>({ _id: "", email: "", fullname: "" });

  // Keep feedsRef in sync without triggering observer re-subscription
  useEffect(() => {
    feedsRef.current = data.feeds;
  }, [data.feeds]);

  // ── Initial fetch ───────────────────────────────────────────────────────
  useEffect(() => {
    const fetchInitialFeeds = async () => {
      try {
        const result = await getFeeds(type as string, "");
        setData({
          feeds: result.data,
          nextCursor: result.nextCursor,
          hasMore: result.hasMore,
        });
        originalFeedsRef.current = result.data;
      } catch (err) {
        console.error("Error fetching initial feeds:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialFeeds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

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

  const smoothScrollTo = useCallback(
    (direction: "next" | "prev") => {
      if (feedsRef.current.length === 0) return;
      const nextIndex =
        direction === "next" ? currentIndex + 1 : currentIndex - 1;
      const el = itemRefs.current[nextIndex];
      if (!el) return;
      scrollToWithOffset(el, 60);
      setCurrentIndex(nextIndex);
      const feed = feedsRef.current[nextIndex];
      if (feed?.product) setInWishlist(isInWishlist(feed.product._id));
    },
    [currentIndex, isInWishlist, scrollToWithOffset],
  );

  // ── Video helpers ───────────────────────────────────────────────────────

  const handleVideoPlay = useCallback((index: number) => {
    const video = videoRefs.current[index];
    if (video?.paused) video.play();
    else video?.pause();
  }, []);

  const showPlayTemporarily = useCallback(() => {
    setVideoState((prev) => ({ ...prev, showPlay: true }));
    if (hidePlayTimeout.current) clearTimeout(hidePlayTimeout.current);
    hidePlayTimeout.current = setTimeout(() => {
      setVideoState((prev) => ({ ...prev, showPlay: false }));
    }, 5000);
  }, []);

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

  // ── Comment helpers ─────────────────────────────────────────────────────

  const updateFeedComments = useCallback(
    (
      feedId: string | string[],
      updater: (comments: CommentData[]) => CommentData[],
    ) => {
      setData((prev) => ({
        ...prev,
        feeds: prev.feeds.map((feed) =>
          feed._id === feedId
            ? { ...feed, comments: updater(feed.comments!) }
            : feed,
        ),
      }));
    },
    [],
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
      const feed = feedsRef.current.find((f) => f._id === id);
      if (feed?.comments) updateFeedComments(id!, toggle);
    },
    [id, updateFeedComments],
  );

  const replyComment = useCallback((parent: CommentState["parent"]) => {
    setComment((prev) => ({ ...prev, parent }));
  }, []);

  const sendComment = useCallback(
    async (parentId: string | null) => {
      if (!checkIfUserLoggedIn("sends comment")) return;
      if (!comment.commentText) return;

      const newComment: CommentData = {
        _id: "",
        text: comment.commentText,
        user: { _id: user!._id, fullname: user!.fullname, email: user!.email },
        parentId,
        likes: [],
        replies: [],
        showReplies: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const feedType = feedsRef.current.find((f) => f._id === id)?.type;

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

      await addComments({
        feedId: id as string,
        type: feedType as string,
        comment: newComment.text,
        parentId: parentId as string,
      });
    },
    [
      comment.commentText,
      user,
      id,
      updateFeedComments,
      addReplyRecursive,
      addComments,
    ],
  );

  const likePost = useCallback(
    async (_id: string) => {
      if (!checkIfUserLoggedIn("like posts")) return;

      setData((prev) => ({
        ...prev,
        feeds: prev.feeds.map((feed) => {
          if (feed._id !== _id) return feed;
          const liked = feed.likes!.some((l) => l === user!._id);
          return {
            ...feed,
            likes: liked
              ? feed.likes!.filter((l) => l !== user!._id)
              : [...feed.likes!, user!._id],
          };
        }),
      }));

      await likeUpdate({ feedId: _id, type: type as string });
    },
    [checkIfUserLoggedIn, user, likeUpdate, type],
  );

  const likeComment = useCallback(
    async (_id: string) => {
      if (!checkIfUserLoggedIn("like comments")) return;
      const feed = feedsRef.current.find((f) => f._id === id);
      updateFeedComments(id!, (comments) =>
        addRecursiveLike(comments, _id, user!._id),
      );
      await likeUpdateComment({
        feedId: id as string,
        type: feed?.type as string,
        commentId: _id,
      });
    },
    [
      checkIfUserLoggedIn,
      id,
      user,
      updateFeedComments,
      addRecursiveLike,
      likeUpdateComment,
    ],
  );

  const deleteComment = useCallback(
    async (item: CommentData) => {
      const selectedFeed = feedsRef.current.find((f) => f._id === id);
      updateFeedComments(id!, (comments) =>
        recursiveDeleteComment(comments, item._id),
      );
      await deleteUpdateComment({
        feedId: id as string,
        commentId: item._id,
        type: selectedFeed?.type as string,
      });
    },
    [id, updateFeedComments, recursiveDeleteComment, deleteUpdateComment],
  );

  const handleWishlistToggle = useCallback(
    (product: Product) => {
      if (!checkIfUserLoggedIn("manage your wishlist")) return;

      if (inWishlist) {
        removeItem(product._id);
        setInWishlist(false);
        toast.success("Removed from wishlist", { position: "top-right" });
      } else {
        addItem(product);
        setInWishlist(true);
        toast.success("Added to wishlist", { position: "top-right" });
      }
    },
    [checkIfUserLoggedIn, inWishlist, removeItem, addItem],
  );

  // ── Effects ─────────────────────────────────────────────────────────────

  // Initialise browser-only values
  useEffect(() => {
    setUser(getUser());
    setHref(window.location.href);
  }, []);

  // Focus-scroll to the deep-linked item once data is ready — runs once
  useEffect(() => {
    if (isLoading || hasFocusedRef.current) return;
    const focusedIndex = data.feeds.findIndex((f) => f._id === idParam);
    if (focusedIndex === -1) return;
    const el = itemRefs.current[focusedIndex];
    if (!el) return;
    hasFocusedRef.current = true;
    setCurrentIndex(focusedIndex);
    scrollToWithOffset(el, 60);
    if (data.feeds[focusedIndex].product) {
      setInWishlist(isInWishlist(data.feeds[focusedIndex].product._id));
    }
  }, [isLoading, data.feeds, idParam, isInWishlist, scrollToWithOffset]);

  // Single persistent IntersectionObserver — reads feeds via ref, not closure
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const index = Number(entry.target.id.replace("feed-", ""));
          const feed = feedsRef.current[index];
          if (feed) {
            setShowDesc(false);
            setId(feed._id);
            window.history.replaceState(
              null,
              "",
              `/pages/update/${type}/${feed._id}`,
            );
          }
          if (index === feedsRef.current.length - 1) {
            setLastItem(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 },
    );

    document.querySelectorAll(".section").forEach((s) => observer.observe(s));
    return () => observer.disconnect();
    // Only re-run if type changes or new items are appended (to observe new .section nodes)
  }, [type, data.feeds.length]);

  // Duplication trigger
  useEffect(() => {
    if (!isLastItem) return;
    if (data.hasMore) return;
    if (isDuplicating) return;
    setIsDuplicating(true);
    setLastItem(false);
  }, [isLastItem, data.hasMore, isDuplicating]);

  // Perform duplication via transition to avoid blocking the main thread
  useEffect(() => {
    if (!isDuplicating) return;
    if (!originalFeedsRef.current.length) return;
    startDuplicateTransition(() => {
      setData((prev) => ({
        ...prev,
        feeds: [...prev.feeds, ...shuffleArray(originalFeedsRef.current)],
      }));
    });
    setIsDuplicating(false);
  }, [isDuplicating]);

  // Lock body scroll when comment drawer is open; always restore on unmount
  useEffect(() => {
    document.body.style.overflow = comment.show ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [comment.show]);

  // Clear video play timeout on unmount to prevent state updates on unmounted component
  useEffect(() => {
    return () => {
      if (hidePlayTimeout.current) clearTimeout(hidePlayTimeout.current);
    };
  }, []);

  // ── Infinite scroll ─────────────────────────────────────────────────────

  const [infiniteRef] = useInfiniteScroll({
    loading,
    hasNextPage: data.hasMore,
    onLoadMore: async () => {
      if (data.hasMore) {
        try {
          const newData = await getFeeds(type as string, data.nextCursor || "");
          setData((prev) => ({
            ...prev,
            feeds: [...prev.feeds, ...newData.data],
            nextCursor: newData.nextCursor,
            hasMore: newData.hasMore,
          }));
        } catch (err) {
          console.error("Error loading more feeds:", err);
        }
      } else {
        setData((prev) => ({
          ...prev,
          feeds: [...prev.feeds, ...shuffleArray(originalFeedsRef.current)],
        }));
      }
    },
  });

  // ── Derived values ──────────────────────────────────────────────────────

  const activeFeed = useMemo(
    () => data.feeds.find((f) => f._id === id),
    [data.feeds, id],
  );
  const activeComments = activeFeed?.comments ?? [];

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <section className="md:flex w-full pb-10">
      {/* Feed scroll container */}
      <div
        ref={containerRef}
        className="w-full h-screen grid gap-3 overflow-y-auto no-scrollbar md:overflow-y-hidden"
        style={{ scrollSnapType: "y mandatory" }}
      >
        {/* FIX #3: use isLoading (initial fetch) not loading (infinite scroll) */}
        {isLoading ? (
          <div className="w-full h-screen grid gap-3 overflow-y-hidden no-scrollbar">
            <FeedSkeleton />
          </div>
        ) : data.feeds.length === 0 ? (
          <div className="h-screen flex items-center justify-center text-sm text-gray-500">
            No feeds available
          </div>
        ) : (
          <>
            {data.feeds.map((item, index) => (
              <div
                key={`${item._id}-${index}`}
                id={`feed-${index}`}
                ref={(el) => {
                  itemRefs.current[index] = el;
                }}
                className={`flex gap-4 relative items-center duration-300 h-[75vh] md:h-[88vh] w-full ${
                  comment.show
                    ? "md:justify-start md:pl-[10%]"
                    : "md:justify-center"
                } section`}
                style={{ scrollSnapAlign: "start" }}
              >
                {/* Media panel */}
                <div className="w-full md:w-[40%] h-full relative overflow-hidden md:rounded-2xl selection:bg-transparent">
                  {item.type === "flashsale" && (
                    <span className="absolute top-10 left-4 shadow-2xl py-2 px-5 rounded-full text-sm font-poppins bg-primaryhover text-white z-10">
                      Flashsale
                    </span>
                  )}

                  {item.mediaType === "image" ? (
                    <>
                      {!loadedIndex.includes(index) && (
                        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
                      )}
                      {/* FIX #11: added sizes prop to prevent oversized image downloads */}
                      <Image
                        src={item.mediaUrl}
                        alt={item.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 40vw"
                        className="object-cover"
                        onLoad={() =>
                          setLoadedIndex((prev) =>
                            prev.includes(index) ? prev : [...prev, index],
                          )
                        }
                      />
                    </>
                  ) : (
                    <>
                      {!loadedIndex.includes(index) && (
                        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
                      )}
                      <video
                        preload="none"
                        ref={(el) => {
                          videoRefs.current[index] = el;
                        }}
                        autoPlay
                        loop
                        muted={videoState.muted}
                        src={item.mediaUrl}
                        className="w-full h-full object-cover cursor-pointer"
                        onPlay={() =>
                          setPlayingMap((prev) => ({ ...prev, [index]: true }))
                        }
                        onPause={() =>
                          setPlayingMap((prev) => ({ ...prev, [index]: false }))
                        }
                        onLoadedData={() =>
                          setPlayingMap((prev) => ({ ...prev, [index]: true }))
                        }
                        onCanPlay={() =>
                          setLoadedIndex((prev) =>
                            prev.includes(index) ? prev : [...prev, index],
                          )
                        }
                        onClick={showPlayTemporarily}
                        onMouseMove={showPlayTemporarily}
                        playsInline
                      />

                      <div
                        onClick={() => handleVideoPlay(index)}
                        className={`absolute w-full h-full top-0 flex items-center justify-center cursor-pointer bg-[radial-gradient(circle,_rgba(0,_0,_0,_0.2),_rgba(0,_0,_0,_0.6))] duration-300 ${
                          videoState.showPlay
                            ? "opacity-100"
                            : "hidden opacity-0"
                        }`}
                      >
                        <div className="w-20 h-20 rounded-full bg-primaryhover flex items-center justify-center">
                          {playingMap[index] ? (
                            <Pause size={40} color="white" />
                          ) : (
                            <Play size={40} color="white" />
                          )}
                        </div>
                        <span
                          className="absolute top-12 right-4 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            setVideoState((prev) => ({
                              ...prev,
                              muted: !prev.muted,
                            }));
                          }}
                        >
                          {videoState.muted ? (
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
                    <div
                      onClick={() => setShowDesc((prev) => !prev)}
                      className="w-[80%]"
                    >
                      <p className="text-xl md:text-sm font-medium mb-2 [text-shadow:0_2px_4px_rgba(0,0,0,0.5)]">
                        {item.title}
                      </p>
                      <p className="text-sm md:text-xs [text-shadow:0_2px_4px_rgba(0,0,0,0.5)]">
                        {showDesc
                          ? item.description
                          : item.description.slice(0, 80)}
                        <span className="text-[#aaa] cursor-pointer">
                          {showDesc ? " less..." : " more..."}
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
                                {Number(item.product.price).toLocaleString(
                                  "en-NG",
                                  { style: "currency", currency: "NGN" },
                                )}
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
                        className="w-10 h-10 bg-white rounded-full flex cursor-pointer items-center justify-center duration-300 scale-90 hover:scale-100 text-[#FF81C6] "
                        onClick={() => likePost(item._id)}
                      >
                        {item.likes.some((l) => l === user?._id) ? (
                          <HeartFill />
                        ) : (
                          <Heart size={26} className=""/>
                        )}
                      </div>
                      <p className="text-xs [text-shadow:0_2px_4px_rgba(0,0,0,0.5)]">{item.likes.length}</p>
                    </div>
                  )}

                  {item.comments && (
                    <div
                      className="flex flex-col items-center gap-2"
                      onClick={() =>
                        setComment((prev) => ({ ...prev, show: !prev.show }))
                      }
                    >
                      <div className="w-10 h-10 bg-white rounded-full flex cursor-pointer items-center justify-center duration-300 scale-90 hover:scale-100 text-[#FF81C6]">
                        <CommentIcon />
                      </div>
                      <p className="text-xs [text-shadow:0_2px_4px_rgba(0,0,0,0.5)]">{item.comments.length}</p>
                    </div>
                  )}

                  <div
                    className="w-10 h-10 bg-white rounded-full flex cursor-pointer items-center justify-center duration-300 scale-90 hover:scale-100"
                    onClick={() => setShare(true)}
                  >
                    <ShareIcon />
                  </div>

                  {/* FIX #9: always route through handleWishlistToggle for auth guard */}
                  {item.product && (
                    <div
                      className={`w-10 h-10 ${
                        inWishlist ? "bg-primaryhover" : "bg-white"
                      } rounded-full flex cursor-pointer items-center justify-center duration-300 scale-90 hover:scale-100`}
                      onClick={() =>
                        handleWishlistToggle(item.product as Product)
                      }
                    >
                      <Favorite fill={inWishlist ? "#FFF" : "#FF81C6"} />
                    </div>
                  )}
                </div>
              </div>
            ))}

            <EndlessScrollLoading
              infiniteRef={infiniteRef}
              hasNextPage={data.hasMore}
              gridNumber="grid-cols-1"
            />

            <div className="h-[30vh] md:h-[10vh]" />
          </>
        )}
      </div>

      {/* Comments panel */}
      <div
        onClick={() => setComment((prev) => ({ ...prev, show: false }))}
        className={`fixed right-0 h-screen flex items-end md:items-center md:top-[5%] top-0 justify-center w-screen md:w-auto overflow-hidden duration-300 gap-3 ${
          comment.show ? "" : "translate-y-full md:translate-y-0"
        }`}
        style={{ zIndex: 100 }}
      >
        {/* Prev / Next navigation */}
        <div
          className="pr-4 gap-6 hidden md:grid"
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="w-10 h-10 cursor-pointer bg-white rounded-full duration-300 flex items-center justify-center rotate-180 scale-90 hover:scale-100"
            onClick={() => smoothScrollTo("prev")}
          >
            <ChevronDown />
          </div>
          <div
            className="w-10 h-10 bg-white rounded-full flex cursor-pointer items-center justify-center duration-300 scale-90 hover:scale-100"
            onClick={() => smoothScrollTo("next")}
          >
            <ChevronDown />
          </div>
        </div>

        {/* Comment drawer */}
        <div
          className={`w-screen md:w-[350px] bg-[#FBE8FD] relative outline outline-white duration-300 rounded-tl-2xl rounded-bl-2xl ${
            comment.show
              ? "translate-y-0 md:translate-y-0"
              : "translate-y-0 md:translate-y-0 md:translate-x-full hidden"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-5 flex-1 md:h-[70vh]">
            <div className="flex items-center mb-6">
              <span
                className="cursor-pointer"
                onClick={() =>
                  setComment((prev) => ({ ...prev, show: false }))
                }
              >
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
                <p className="text-xs text-center">This post has no comments</p>
              )}
            </div>
          </div>

          <div className="w-full px-5 md:px-2 pb-10">
            <div
              className={`bg-white relative rounded-2xl border ${
                comment.focus ? "border-primaryhover" : "border-transparent"
              }`}
            >
              <textarea
                className="w-full h-32 text-base md:h-20 outline-none p-3 font-poppins resize-none rounded-2xl border border-transparent transition duration-300 bg-transparent"
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
                  if (e.key === "Enter") sendComment(comment.parent.parentId);
                }}
              />
              <button
                className={`w-10 h-10 md:w-6 md:h-6 bg-primaryhover rounded-full flex items-center justify-center absolute right-3 bottom-3 transition duration-300 ${
                  comment.show ? "" : "hidden"
                }`}
                onClick={() => sendComment(comment.parent.parentId)}
              >
                <SendHorizonal color="white" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <ShareModal share={share} href={href} hideShare={() => setShare(false)} />
    </section>
  );
}