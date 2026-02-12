"use client"
import { Feed } from '@/lib/types'
import Image from 'next/image';
import { useState } from 'react'
import { CartRounded, Elipsis, ShareIconGallery, WishListAdd } from './svgs/Icons';
import { useWishlistStore } from '@/lib/stores/wishlist-store';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/stores/cart-store';
import ShareModal from './ShareModal';

export default function Gallery({ feeds }: { feeds: Feed[] }) {

    const [data, setData] = useState({ feeds: feeds.map(feed => ({ ...feeds, showOption: false })) });
    const { addItem: addWishlistItem, removeItem: removeWishlistItem, isInWishlist } = useWishlistStore();
    const { addItem: addCartItem, removeItem: removeCartItem, getItem, } = useCartStore();
    const [showShare, setShowShare] = useState({
        show: false,
        id: ""
    });
    const router = useRouter();
    console.log(showShare.id)
    return (
        <div className='h-screen overflow-y-auto'>
            {/* Masonry Layout using CSS Columns */}
            <div className='columns-2 gap-4 p-5'>
                {feeds.map((feed, index) => (
                    <div key={index} className='cursor-pointer mb-10' >
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

                            <div className={`absolute bg-white right-3 bottom-[10%] rounded-xl border border-primaryhover text-xs font-poppins px-4 py-6 flex flex-col justify-center items-center gap-4 ${data.feeds[index].showOption ? "scale-100" : "scale-0"} transition-all duration-300`} onClick={(e) => {
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
                                    <span className='col-span-3'>{isInWishlist(feed.product._id) ? "Remove" : "Add To Wishlist"}</span>

                                </div>

                                <div className='grid grid-cols-4 gap-3 w-full text-left items-center' onClick={() => setShowShare(prev => ({ ...prev, show: true, id: feed.product._id }))}>
                                    <ShareIconGallery scale={1} color="#383838" />
                                    <span className='col-span-3'>Share</span>

                                </div>
                                {/* <div className='flex items-center gap-4 py-4  border-t border-b border-[#838383]text-left '>
                                    <WishListAdd scale={1} color="#383838" />
                                    <span>Add To Wishlist</span>

                                </div>

                                <div className='flex items-center gap-4   text-left '>
                                    <ShareIconGallery scale={1} color="#383838" />
                                    <span>Share</span>

                                </div> */}
                            </div>
                        </div>

                        <div className='flex justify-end items-center'>
                            <span className=" w-fit h-fit hover:bg-primaryhover/10 rounded-xl" onClick={() => setData({ feeds: data.feeds.map((feed, i) => i === index ? { ...feed, showOption: !feed.showOption } : { ...feed, showOption: false }) })}>
                                <Elipsis color="black" scale={0.8} />
                            </span>
                        </div>

                    </div>
                ))}
            </div>

            <ShareModal share={showShare.show} href={`${window.location.host}/product/${showShare.id}`} hideShare={() => setShowShare({ show: false, id: "" })} />
        </div >
    )
}
