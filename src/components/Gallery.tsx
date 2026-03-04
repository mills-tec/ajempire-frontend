"use client"
import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react'
import { CartRounded, Elipsis, ShareIconGallery, WishListAdd } from './svgs/Icons';
import { useWishlistStore } from '@/lib/stores/wishlist-store';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/stores/cart-store';
import ShareModal from './ShareModal';
import useInfiniteScroll from 'react-infinite-scroll-hook';
import { getUpdates } from '@/lib/api';
import { ITEMS_TO_APPEND, shuffleArray } from '@/lib/utils';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export function GallerySkeleton() {
    return (
        Array.from({ length: ITEMS_TO_APPEND }).map((_, index) => (
            <div key={index} className='cursor-pointer mb-10 bg-gray-200 animate-pulse p-4 rounded-lg' >
                <div
                    className={`relative overflow-hidden rounded-lg mb-4 break-inside-avoid shadow-sm bg-gray-200 animate-pulse ${index % 2 === 0 ? "md:h-[300px] h-[150px]" : "md:h-[400px] h-[250px]"}`}
                >

                </div>

                <div className="space-y-1">
                    <h2 className="text-sm truncate  h-10 bg-gray-300 animate-pulse rounded-sm w-[60%]"></h2>
                    <div>
                        <p className=" lg:text-xs text-black/60 h-6 bg-gray-300 animate-pulse w-[40%]"> </p>
                    </div>

                    <div className="flex items-center gap-2  pr-2 text-[7px] lg:text-[10px] rounded-sm h-12 bg-gray-300 animate-pulse w-[80%] ">


                    </div>


                </div>
            </div>
        ))
    )
}

export default function Gallery() {
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ["gallery"],
        queryFn: () => getUpdates("gallery", "", 10),
        onSuccess: (data) => {
            setApiData({
                nextCursor: data?.nextCursor || "",
                hasMore: data?.hasMore || false,
            });
        },
    });

    const gallery = data?.data ?? [];

    const [apiData, setApiData] = useState({ nextCursor: "", hasMore: true });
    const { addItem: addWishlistItem, removeItem: removeWishlistItem, isInWishlist } = useWishlistStore();
    const { addItem: addCartItem, removeItem: removeCartItem, getItem, } = useCartStore();
    const [mounted, setMounted] = useState(false);
    const lastItemRef = useRef<HTMLDivElement | null>(null);
    const [isDuplicating, setIsDuplicating] = useState(false);
    const originalGalleryRef = useRef<any[]>([]);
    const [showOption, setShowOption] = useState<number | null>(null);
    const [showShare, setShowShare] = useState({
        show: false,
        id: ""
    });
    const router = useRouter();

    const [infiniteRef] = useInfiniteScroll({
        loading: false,
        hasNextPage: apiData.hasMore,
        onLoadMore: async () => {
            if (apiData.hasMore) {
                try {
                    const newData = await getUpdates("gallery", apiData.nextCursor || "", 10);

                    setApiData(prev => ({ ...prev, nextCursor: newData!.nextCursor, hasMore: newData!.hasMore }))

                } catch (err) {
                    console.error("Error loading more feeds:", err);
                }
            }
        },
    });

    // Store original dataset ONLY ONCE (prevents exponential duplication)
    useEffect(() => {
        if (data?.data && originalGalleryRef.current.length === 0) {
            originalGalleryRef.current = data.data;
        }
    }, [data]);


    // Effects
    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (apiData.hasMore) return; // only duplicate after API is finished
        if (!lastItemRef.current) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !isDuplicating) {
                    setIsDuplicating(true);
                }
            },
            {
                root: null, // viewport
                rootMargin: "0px",
                threshold: 0.1, // 50% of the item is visible
            }
        );

        observer.observe(lastItemRef.current);

        return () => observer.disconnect();
    }, [apiData.hasMore, isDuplicating]);

    // 👇 Duplicate logic
    useEffect(() => {
        if (!isDuplicating) return;
        if (!originalGalleryRef.current.length) return;

        const timer = setTimeout(() => {
            appendProducts(shuffleArray(originalGalleryRef.current));
            setIsDuplicating(false);
        }, 500);

        return () => clearTimeout(timer);
    }, [isDuplicating]);


    // 👇 Correctly append to React Query cache
    const appendProducts = (newProducts: any[]) => {
        queryClient.setQueryData(["gallery"], (oldData: any) => {
            if (!oldData) return oldData;

            return {
                ...oldData,
                data: [
                    ...(oldData.data ?? []),
                    ...newProducts,
                ],
            };
        });
    };



    return (
        <div className='h-screen overflow-y-auto'>
            {/* Masonry Layout using CSS Columns */}
            <div className='columns-2 gap-4 p-5'>
                {gallery?.map((feed, index) => (
                    <div key={index}>

                        <div key={index} className='cursor-pointer mb-10' ref={(gallery.length - 1 === index) && !apiData.hasMore ? lastItemRef : null}>
                            <div
                                onClick={() => {
                                    router.push(`/product/${feed.product._id}`)
                                }}
                                className='relative overflow-hidden rounded-lg mb-4 break-inside-avoid shadow-sm'
                                style={{ height: index % 2 === 0 ? "300px" : "400px" }}
                            >
                                {feed.mediaType === "video" ? (
                                    <video
                                        src={feed.mediaUrl}
                                        muted
                                        loop
                                        playsInline
                                        className="absolute inset-0 w-full h-full object-cover"
                                    />
                                ) : (
                                    <Image
                                        src={feed.mediaUrl}
                                        alt={feed.title}
                                        fill
                                        sizes="(max-width: 768px) 50vw, 33vw"
                                        className='object-cover transition-transform duration-300 hover:scale-105'
                                    />
                                )}

                                <div className={`absolute bg-white right-3 bottom-[10%] rounded-xl border border-primaryhover text-xs font-poppins px-4 py-6 flex flex-col justify-center items-center gap-4 ${showOption === index ? "scale-100" : "scale-0"} transition-all duration-300`} onClick={(e) => {
                                    e.stopPropagation()
                                }}>
                                    <div className='grid grid-cols-4 gap-3 w-full text-left items-center' onClick={() => {
                                        if (getItem(feed.product._id)) {
                                            removeCartItem(feed.product._id);
                                        } else {
                                            addCartItem({
                                                ...feed.product,
                                                quantity: 1,
                                                selectedVariants: [],
                                                selected: false
                                            });
                                        }
                                    }}>
                                        {getItem(feed.product._id) ? (
                                            <CartRounded scale={1} color="#383838" />
                                        ) : (
                                            <CartRounded scale={1} color="#383838" />
                                        )}
                                        {getItem(feed.product._id) ? (
                                            <span className='col-span-3'>In Cart</span>
                                        ) : (
                                            <span className='col-span-3'>Add To Cart</span>
                                        )}

                                    </div>

                                    <div className='grid grid-cols-4 gap-3 w-full text-left items-center border-t border-b border-[#838383] py-4' onClick={() => {
                                        if (isInWishlist(feed.product._id)) {
                                            removeWishlistItem(feed.product._id);
                                        } else {
                                            addWishlistItem(feed.product);
                                        }
                                    }}>
                                        <WishListAdd scale={1} color="#383838" />
                                        <span className='col-span-3'>{mounted && isInWishlist(feed.product._id) ? "Remove" : "Add To Wishlist"}</span>

                                    </div>

                                    <div className='grid grid-cols-4 gap-3 w-full text-left items-center' onClick={() => setShowShare(prev => ({ ...prev, show: true, id: feed.product._id }))}>
                                        <ShareIconGallery scale={1} color="#383838" />
                                        <span className='col-span-3'>Share</span>

                                    </div>

                                </div>
                            </div>

                            <div className='flex justify-end items-center'>
                                <span className=" w-fit h-fit hover:bg-primaryhover/10 rounded-xl" onClick={() => {
                                    setShowOption(prev => prev === index ? null : index);
                                }}>
                                    <Elipsis color="black" scale={0.8} />
                                </span>
                            </div>

                        </div>

                        {isDuplicating && <GallerySkeleton />}


                    </div>

                ))}

                {isLoading && <GallerySkeleton />}


                <div ref={infiniteRef}>
                    {data?.hasMore && (
                        <GallerySkeleton />
                    )}
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
