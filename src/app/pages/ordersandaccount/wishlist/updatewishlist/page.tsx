"use client";

import { useUpdates } from "@/api/customHooks";
import EmptyList from "@/components/EmptyList";
import { bunnyLoader } from "@/lib/bunnyLoader";
import { WatchlistEntry } from "@/lib/types";
import { Bookmark, Heart, MessageCircle, Play } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import useInfiniteScroll from "react-infinite-scroll-hook";

// Multiple of 3 so every fetched page fills whole grid rows.
const PAGE_SIZE = 21;

const compactCount = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 1,
});

function TileSkeletonRow({ count }: { count: number }) {
  return (
    <div className="grid grid-cols-3 gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="relative aspect-square overflow-hidden bg-gray-200">
          <div
            className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent"
            style={{ animationDelay: `${(i % 3) * 90}ms` }}
          />
        </div>
      ))}
    </div>
  );
}

export default function UpdatesWatchlistPage() {
  const { getWatchlist, loading } = useUpdates();
  const [items, setItems] = useState<WatchlistEntry[]>([]);
  const [cursor, setCursor] = useState("");
  const [hasMore, setHasMore] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await getWatchlist("", PAGE_SIZE);
      if (cancelled) return;
      setItems(res?.data ?? []);
      setCursor(res?.cursor ?? "");
      setHasMore(res?.hasMore ?? false);
      setInitialLoading(false);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [infiniteRef] = useInfiniteScroll({
    loading,
    hasNextPage: hasMore,
    onLoadMore: async () => {
      if (!cursor) return;
      const res = await getWatchlist(cursor, PAGE_SIZE);
      if (!res) return;
      setItems((prev) => [...prev, ...res.data]);
      setCursor(res.cursor ?? "");
      setHasMore(res.hasMore);
    },
    disabled: loading,
  });

  if (initialLoading) return <TileSkeletonRow count={9} />;

  if (items.length === 0) {
    return (
      <EmptyList
        message="Nothing saved yet"
        writeup="Posts and videos you bookmark will show up here."
        Icon={<Bookmark size={40} className="text-brand_solid_gradient" />}
      />
    );
  }

  return (
    <div>
      <div className="grid grid-cols-3 gap-0.5">
        {items.map((entry) => {
          const { media } = entry;
          return (
            <Link
              key={entry._id}
              href={`/pages/update/all/${media._id}`}
              className="relative block aspect-square overflow-hidden bg-gray-100 transition-transform duration-150 active:scale-[0.97]"
            >
              <Image
                src={media.image}
                alt={media.title}
                fill
                sizes="33vw"
                loader={bunnyLoader}
                className="object-cover"
              />

              {media.mediaType === "video" && (
                <span className="absolute top-1.5 right-1.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
                  <Play size={13} fill="white" color="white" strokeWidth={0} />
                </span>
              )}

              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-9 bg-gradient-to-t from-black/70 to-transparent" />

              <div className="absolute bottom-4 left-4  flex items-center gap-2.5 text-white">
                <span className="flex items-center gap-0.5 text-sm font-medium [text-shadow:0_1px_2px_rgba(0,0,0,0.6)]">
                  <Heart size={20} fill="white" color="white" strokeWidth={0} />
                  {compactCount.format(media.likeCount ?? media.likes?.length ?? 0)}
                </span>
                <span className="flex items-center gap-0.5 text-sm font-medium [text-shadow:0_1px_2px_rgba(0,0,0,0.6)]">
                  <MessageCircle size={20} fill="white" color="white" strokeWidth={0} />
                  {compactCount.format(media.commentCount ?? 0)}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {hasMore && (
        <div ref={infiniteRef} className="pt-0.5">
          <TileSkeletonRow count={3} />
        </div>
      )}
    </div>
  );
}
