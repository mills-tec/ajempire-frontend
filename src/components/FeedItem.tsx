"use client";
import CommentItem from "@/components/CommentItem";
import { CommentIcon, Favorite, GoBack, HeartFill, ShareIcon } from "@/components/svgs/Icons";
import { getUser } from "@/lib/api";
import { CommentData, Feed, Product } from "@/lib/types";
import { Heart, Pause, Play, SendHorizonal, Volume, Volume2, VolumeOff, VolumeX } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { useParams } from "next/navigation";
import { useWishlistStore } from "@/lib/stores/wishlist-store";

import ShareModal from "./ShareModal";
import { useUpdates } from "@/api/customHooks";


function getCountdown(targetDate: string | Date) {
    const now = new Date().getTime();
    const target = new Date(targetDate).getTime();
    const diffMs = target - now;

    const totalSeconds = Math.max(Math.floor(diffMs / 1000), 0);

    const seconds = totalSeconds % 60;
    const minutes = Math.floor(totalSeconds / 60) % 60;
    const hours = Math.floor(totalSeconds / (60 * 60)) % 24;
    const days = Math.floor(totalSeconds / (60 * 60 * 24));

    return { days, hours, minutes, seconds };
}

function Countdown({ targetDate }: { targetDate: string }) {
    const [mounted, setMounted] = useState(false);
    const [timeLeft, setTimeLeft] = useState(() => ({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    }));

    useEffect(() => {
        setMounted(true);
        setTimeLeft(getCountdown(targetDate));

        const timer = setInterval(() => {
            setTimeLeft(getCountdown(targetDate));
        }, 1000);

        return () => clearInterval(timer);
    }, [targetDate]);

    if (!mounted) return null; // 👈 key line

    return (
        <span className="text-[10px]">
            {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
        </span>
    );
}

export default function FeedItem({ feeds }: { feeds: Feed[] }) {
    const params = useParams();
    const { id: idParam, type } = params;
    const [id, setId] = useState(idParam);
    const [href, setHref] = useState("");
    const { addComments, likeUpdate, likeUpdateComment, deleteUpdateComment } = useUpdates();
    const [data, setData] = useState<{ feeds: Feed[]; nextCursor: string }>({ feeds: [...feeds], nextCursor: "" });
    const [playingMap, setPlayingMap] = useState<Record<string, boolean>>({});
    const [currentIndex, setCurrentIndex] = useState(0);
    const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
    const [user, setUser] = useState<{
        _id: string;
        email: string;
        fullname: string;
    } | null>({ _id: "", email: "", fullname: "" });

    const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});


    const { addItem, isInWishlist, removeItem } = useWishlistStore();
    const [inWishlist, setInWishlist] = useState(false);
    const [showDesc, setShowDesc] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const [comment, setComment] = useState<{ show: boolean; commentText: string, parent: { parentId: string, fullname: string, email: string } }>({
        show: false, commentText: "", parent: { parentId: "", fullname: "", email: "" }

    })

    const [share, setShare] = useState({
        show: false,
    })


    const [video, setVideo] = useState<{ muted: boolean, showPlay: boolean }>({
        muted: true,
        showPlay: false
    });

    const isLooping = feeds.length > 0;

    const loopedFeeds = useMemo(() => {
        if (!isLooping) return feeds;
        // Create 3 copies for seamless scroll
        return [...feeds, ...feeds, ...feeds];
    }, [feeds, isLooping]);



    const smoothScrollTo = (direction: "next" | "prev") => {
        const length = data.feeds.length;
        if (length === 0) return;

        let nextIndex =
            direction === "next"
                ? currentIndex + 1
                : currentIndex - 1;

        const el = itemRefs.current[nextIndex];

        if (!el) return;


        scrollToWithOffset(el, 60)

        setCurrentIndex(nextIndex);

        const feed = data.feeds[nextIndex];

        // keep URL + state in sync
        // window.history.replaceState(
        //     null,
        //     "",
        //     `/pages/update/${type}/${feed._id}`
        // );



        if (feed.product && type === "flashsales") {
            setInWishlist(isInWishlist(feed.product._id));
        }
    };


    const handleToggle = (targetId: string) => {
        const updateNested = (list: CommentData[]): CommentData[] => {
            return list.map((node) => {
                if (node._id === targetId) {
                    return { ...node, showReplies: !node.showReplies };
                }
                if (node.replies.length > 0) {
                    return { ...node, replies: updateNested(node.replies) };
                }
                return node;
            });
        };

        const feed = data.feeds.find(item => item._id === id);
        if (feed && feed.comments) {
            setData(prev => ({
                ...prev,
                feeds: prev.feeds.map(item =>
                    item._id === id
                        ? { ...item, comments: updateNested(item.comments!) }
                        : item
                )
            }));
        }

    };


    const sendComment = async (parentId: string | null) => {
        if (!comment.commentText) return;


        const newComment: CommentData = {
            _id: "",
            text: comment.commentText,
            user: {
                _id: user?._id!,
                fullname: user?.fullname!,
                email: user?.email!
            },
            parentId: parentId,
            likes: [],
            replies: [],
            showReplies: true,

            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),

        }

        const feedType = feeds.find(item => item._id === id)?.type;

        if (parentId) {
            setData(prev => ({
                ...prev,
                feeds: prev.feeds.map(feed =>
                    feed._id === id
                        ? { ...feed, comments: addReplyRecursive(feed.comments!, parentId, newComment) }
                        : feed
                )
            }));
        } else {
            setData(prev => ({
                ...prev,
                feeds: prev.feeds.map(feed =>
                    feed._id === id
                        ? { ...feed, comments: [...feed.comments!, newComment] }
                        : feed
                )
            }));
        }

        setComment(prev => ({ ...prev, commentText: "", parent: { parentId: "", fullname: "", email: "" } }))

        await addComments({ feedId: id as string, type: feedType as string, comment: newComment.text, parentId: parentId as string })

    }


    const replyComment = (parent: { parentId: string, fullname: string, email: string }) => {
        setComment(prev => ({ ...prev, parent }));
    }

    const addReplyRecursive = (list: CommentData[], targetId: string, reply: CommentData): CommentData[] => {
        return list.map((node) => {
            if (node._id === targetId) {
                return { ...node, replies: [...node.replies, { ...reply, showReplies: true }] };
            }
            if (node.replies && node.replies.length > 0) {
                return { ...node, replies: addReplyRecursive(node.replies, targetId, { ...reply, showReplies: true }) };
            }
            return node;
        });
    };

    const likePost = async (_id: string) => {

        setData(prev => ({ ...prev, feeds: prev.feeds.map(feed => feed._id === _id ? { ...feed, likes: feed.likes!.some(item => item === user?._id) ? feed.likes!.filter(item => item != user!._id) : [...feed.likes!, user!._id] } : feed) }));

        await likeUpdate({ feedId: _id, type: type as string });

    }


    const likeComment = async (_id: string) => {
        const feed = data.feeds.find(feed => feed._id === id);
        setData(prev => ({ ...prev, feeds: prev.feeds.map(feed => feed._id === id ? { ...feed, comments: addRecursiveLike(feed.comments!, _id, user!._id) } : feed) }))
        await likeUpdateComment({ feedId: id as string, type: feed?.type as string, commentId: _id });
    }

    const addRecursiveLike = (list: CommentData[], targetId: string, userId: string): CommentData[] => {
        return list.map((node) => {
            if (node._id === targetId) {
                return { ...node, likes: node.likes.some(item => item === userId) ? node.likes.filter(item => item != userId) : [...node.likes, userId] };
            }
            if (node.replies && node.replies.length > 0) {
                return { ...node, replies: addRecursiveLike(node.replies, targetId, userId) };
            }
            return node;
        });
    }

    const recursiveDeleteComment = (list: CommentData[], targetId: string): CommentData[] => {
        return list.map((node) => {
            if (node._id === targetId) {
                return { ...node, replies: node.replies.filter(reply => reply._id !== targetId) };
            }
            if (node.replies && node.replies.length > 0) {
                return { ...node, replies: recursiveDeleteComment(node.replies, targetId) };
            }
            return node;
        });
    }
    const deleteComment = async (item: CommentData) => {
        const selectedFeed = data.feeds.find(feed => feed._id === id);
        if (item.parentId) {
            setData(prev => ({ ...prev, feeds: prev.feeds.map(feed => feed._id === id ? { ...feed, comments: recursiveDeleteComment(feed.comments!, item._id) } : feed) }))
        } else {
            setData(prev => ({ ...prev, feeds: prev.feeds.map(feed => feed._id === id ? { ...feed, comments: feed.comments!.filter(comment => comment._id !== item._id) } : feed) }))
        }

        let req = await deleteUpdateComment({ feedId: id as string, commentId: item._id, type: selectedFeed?.type as string });

    }
    const hidePlayTimeout = useRef<NodeJS.Timeout | null>(null);


    // handling video play for feeds 
    const handleVideoPlay = (id: string) => {
        const video = videoRefs.current[id];
        if (video?.paused) {
            video.play();
        } else {
            video?.pause()
        }


    }

    const showPlayTemporarily = () => {
        setVideo(prev => ({ ...prev, showPlay: true }));

        if (hidePlayTimeout.current) {
            clearTimeout(hidePlayTimeout.current);
        }

        hidePlayTimeout.current = setTimeout(() => {
            setVideo(prev => ({ ...prev, showPlay: false }));
        }, 5000);
    };

    const scrollToWithOffset = (
        el: HTMLElement,
        offset = 80 // 👈 add or subtract px here
    ) => {
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

        container.scrollTo({
            top: scrollTop,
            behavior: "smooth",
        });
    };


    useEffect(() => {

        setUser(getUser());
        // setting href
        setHref(window.location.href);

        const focusedIndex = feeds.findIndex(feed => feed._id === id);
        const sections = document.querySelectorAll(".section");

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const index = Number(entry.target.id.replace("feed-", ""));
                        const id = feeds[index]._id;

                        // Update URL without refreshing
                        setShowDesc(false);
                        setId(id);
                        window.history.replaceState(null, "", `/pages/update/${type}/${id}`);
                    }
                });
            },
            {
                threshold: 0.6,
            }
        );

        sections.forEach((section) => {
            observer.observe(section);
        });

        if (!focusedIndex) return;
        const el = itemRefs.current[focusedIndex];
        if (!el) return;
        setCurrentIndex(focusedIndex);
        scrollToWithOffset(el, 60);

        if (feeds[focusedIndex].comments) {
            setComment(prev => ({ ...prev, comments: feeds[focusedIndex].comments! }));
        }
        // checking wish liit if ifeed has product
        if (feeds[focusedIndex].product) {
            setInWishlist(isInWishlist(feeds[focusedIndex].product._id));
        }





        return () => {
            if (hidePlayTimeout.current) {
                clearTimeout(hidePlayTimeout.current);
            }
        };

    }, [])


    return (
        <section className="md:flex w-full pb-10">
            <div
                ref={containerRef}
                className="w-full h-screen   grid gap-3 overflow-y-auto no-scrollbar md:overflow-y-hidden"
                style={{ scrollSnapType: "y mandatory" }}

            >

                {data.feeds.map((item, index) => {

                    return <div
                        className={`flex gap-4 relative  items-center duration-300 h-[75vh]  md:h-[88vh] ${comment.show ? "md:pl-[10%]" : "md:pl-[20%]"}   section`}
                        ref={(e) => { itemRefs.current[index] = e }}
                        key={index} id={`feed-${index}`}
                        style={{ scrollSnapAlign: "start" }}
                    >
                        <div className="md:w-[45%] h-full relative overflow-hidden md:rounded-2xl selection:bg-transparent">
                            {item.type === "flashsale" && <span className="absolute top-10 left-4 shadow-2xl py-2 px-5 rounded-full  text-sm font-poppins  bg-primaryhover text-white  z-10">Flashsale</span>}
                            {item.mediaType === "image" ? (
                                <img src={item.mediaUrl} alt="" className="w-full h-full object-cover " />
                            ) : (
                                <>

                                    <video
                                        ref={el => {
                                            videoRefs.current[item._id] = el;
                                        }}
                                        autoPlay
                                        onPlay={() => setPlayingMap(prev => ({ ...prev, [item._id]: true }))}
                                        onPause={() => setPlayingMap(prev => ({ ...prev, [item._id]: false }))}
                                        src={item.mediaUrl} loop muted={video.muted}
                                        className="w-full h-full object-cover cursor-pointer"
                                        onLoadedData={() => setPlayingMap(prev => ({ ...prev, [item._id]: true }))}
                                        onClick={showPlayTemporarily}

                                        onMouseMove={showPlayTemporarily}


                                    />

                                    <div onClick={() => handleVideoPlay(item._id)} className={`absolute w-full h-full top-0 flex items-center justify-center cursor-pointer bg-[radial-gradient(circle,_rgba(0,_0,_0,_0.2),_rgba(0,_0,_0,_0.6))] duration-300 ${!video.showPlay ? "hidden opacity-0" : "opacity-100"}`}>
                                        <div className="w-20 h-20 rounded-full bg-primaryhover flex items-center justify-center">
                                            {!playingMap[item._id] ? <Play size={40} color="white" /> : <Pause size={40} color="white" />}

                                        </div>

                                        <span className="absolute top-12 right-4 cursor-pointer" onClick={(e) => {
                                            e.stopPropagation();
                                            setVideo(prev => ({ ...prev, muted: !prev.muted }))

                                        }} >
                                            {video.muted ? <VolumeX color="white" size={16} /> : <Volume2 color="white" size={16} />}


                                        </span>
                                    </div>


                                </>
                            )}
                            <div className="absolute bottom-10  left-0 right-0  bg-gradient-to-t  px-5 text-white flex flex-col gap-4">
                                <div onClick={() => setShowDesc(prev => (!prev))} className="w-[80%]">
                                    <p className="text-xl md:text-sm font-medium  mb-2">{item.title}</p>
                                    <p className="text-sm md:text-xs ">
                                        {showDesc ? item.description : item.description.slice(0, 80)} <span className="text-[#aaa] cursor-pointer" >{showDesc ? "less..." : "more..."}</span>
                                    </p>
                                </div>

                                {
                                    item.product && (<div className="flex items-center gap-4">
                                        <span className="flex items-center gap-1">
                                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path fillRule="evenodd" clipRule="evenodd" d="M0.0821635 7.21058C0.273497 7.87924 0.78883 8.39391 1.81883 9.42391L3.03883 10.6439C4.83216 12.4379 5.72816 13.3332 6.8415 13.3332C7.9555 13.3332 8.8515 12.4372 10.6442 10.6446C12.4375 8.85124 13.3335 7.95524 13.3335 6.84124C13.3335 5.72791 12.4375 4.83124 10.6448 3.03858L9.42483 1.81858C8.39416 0.788578 7.8795 0.273244 7.21083 0.0819108C6.54216 -0.110089 5.83216 0.0539108 4.41283 0.381911L3.59416 0.570578C2.3995 0.845911 1.80216 0.983911 1.39283 1.39258C0.983497 1.80124 0.84683 2.39991 0.57083 3.59391L0.381497 4.41258C0.0541636 5.83258 -0.10917 6.54191 0.0821635 7.21058ZM5.41483 3.51391C5.54341 3.63791 5.646 3.7863 5.7166 3.95039C5.7872 4.11448 5.82439 4.291 5.82601 4.46963C5.82763 4.64825 5.79364 4.82541 5.72603 4.99076C5.65842 5.15611 5.55854 5.30632 5.43222 5.43264C5.30591 5.55895 5.15569 5.65883 4.99035 5.72644C4.825 5.79406 4.64784 5.82805 4.46921 5.82643C4.29058 5.82481 4.11407 5.78761 3.94998 5.71701C3.78588 5.64641 3.6375 5.54383 3.5135 5.41524C3.26887 5.16158 3.13359 4.82202 3.13679 4.46963C3.13998 4.11723 3.28139 3.78018 3.53058 3.53099C3.77977 3.2818 4.11682 3.1404 4.46921 3.1372C4.8216 3.13401 5.16116 3.26928 5.41483 3.51391ZM11.3668 6.70058L6.71416 11.3539C6.61982 11.4449 6.49349 11.4953 6.3624 11.4941C6.2313 11.4929 6.10592 11.4402 6.01325 11.3475C5.92059 11.2547 5.86807 11.1293 5.86699 10.9982C5.86591 10.8671 5.91637 10.7408 6.0075 10.6466L10.6595 5.99324C10.7533 5.89945 10.8805 5.84675 11.0132 5.84675C11.1458 5.84675 11.273 5.89945 11.3668 5.99324C11.4606 6.08704 11.5133 6.21426 11.5133 6.34691C11.5133 6.47956 11.4606 6.60678 11.3668 6.70058Z" fill="white" />
                                            </svg>
                                            {
                                                item.flashPrice ? <div className="flex items-center text-xs gap-2 ">
                                                    <span className="">
                                                        {Number(item.flashPrice).toLocaleString("en-NG", {
                                                            style: "currency",
                                                            currency: "NGN",
                                                        })}
                                                    </span>

                                                    <small className=" line-through">
                                                        {Number(item.product.price).toLocaleString("en-NG", {
                                                            style: "currency",
                                                            currency: "NGN",
                                                        })}
                                                    </small>
                                                </div> : <p className="text-xs">{Number(item.product.price).toLocaleString("en-NG", { style: "currency", currency: "NGN" })}</p>
                                            }

                                        </span>
                                        <Link href={"/product/" + item.product._id} className="text-xs bg-primaryhover flex items-center justify-center h-7 md:w-[40%]">View Product</Link>
                                    </div>)
                                }

                                {
                                    item.type === "flashsale" && item.endDate && <Countdown targetDate={item.endDate} />
                                }

                            </div>
                        </div>

                        {/* Comments and Likes */}
                        <div className="flex flex-col  gap-7 absolute md:relative md:right-0 right-6 md:text-black text-white">
                            {item.likes && (<div className="flex flex-col items-center gap-2">
                                <div className="w-10 h-10 bg-white rounded-full flex cursor-pointer items-center justify-center duration-300 scale-90 hover:scale-100 text-[#FF81C6]" onClick={() => likePost(item._id)}>
                                    {item.likes!.some(item => item === user?._id) ? <HeartFill /> : <Heart size={26} />
                                    }
                                </div>
                                <p className="text-xs ">{item.likes!.length}</p>
                            </div>)}



                            {item.comments && (<div className="flex flex-col items-center gap-2" onClick={() => setComment(prev => ({ ...prev, show: !prev.show }))}>
                                <div className="w-10 h-10 bg-white rounded-full flex cursor-pointer items-center justify-center duration-300 scale-90 hover:scale-100 text-[#FF81C6]" >
                                    <CommentIcon />
                                </div>
                                <p className="text-xs ">{item.comments.length}</p>
                            </div>)}


                            <div className="w-10 h-10 bg-white rounded-full flex cursor-pointer items-center justify-center duration-300 scale-90 hover:scale-100" onClick={() => setShare({ ...share, show: true })}>
                                <ShareIcon />

                            </div>
                            {
                                item.product && (
                                    <div onClick={() => {
                                        if (inWishlist) {
                                            removeItem(item.product._id);
                                            setInWishlist(false);
                                        } else {
                                            addItem(item.product as Product);
                                            setInWishlist(true);
                                        }
                                    }} className={`w-10 h-10 ${inWishlist ? "bg-primaryhover" : "bg-white"} rounded-full flex cursor-pointer items-center justify-center duration-300 scale-90 hover:scale-100`} >
                                        <Favorite fill={inWishlist ? "#FFF" : "#FF81C6"} />

                                    </div>
                                )
                            }
                        </div>
                    </div>
                })}
                <div className="h-[30vh] md:h-[10vh]" />
            </div>




            <div onClick={() => setComment(prev => ({ ...prev, show: false }))} className={`fixed right-0 h-screen flex  items-end md:items-center md:top-[5%] top-0     justify-center   w-screen md:w-auto  overflow-hidden duration-300   gap-3 ${comment.show ? "" : "translate-y-full md:translate-y-0 "}`}>

                <div className="pr-4 gap-6 hidden md:grid" onClick={(e) => e.stopPropagation()}>

                    <div className={`w-10 h-10 cursor-pointer bg-white rounded-full duration-300 flex items-center justify-center rotate-180 scale-90 hover:scale-100 `} onClick={() => smoothScrollTo('prev')}>
                        <svg width="20" height="14" viewBox="0 0 24 14" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ transform: "scale(0.8)" }}>
                            <path fillRule="evenodd" clipRule="evenodd" d="M13.2158 13.2158C12.8799 13.5517 12.4242 13.7404 11.9491 13.7404C11.4741 13.7404 11.0184 13.5517 10.6824 13.2158L0.546975 3.08039C0.375853 2.91512 0.239359 2.71742 0.14546 2.49882C0.0515603 2.28023 0.0021349 2.04513 6.76468e-05 1.80724C-0.00199961 1.56934 0.0433331 1.33341 0.13342 1.11322C0.223506 0.893035 0.356543 0.692991 0.524768 0.524767C0.692992 0.356542 0.893034 0.223505 1.11322 0.133419C1.33341 0.0433322 1.56934 -0.00199961 1.80724 6.7648e-05C2.04513 0.0021349 2.28023 0.0515603 2.49882 0.14546C2.71741 0.239359 2.91512 0.375852 3.08039 0.546974L11.9491 9.41572L20.8179 0.546974C21.1558 0.220608 21.6084 0.0400178 22.0781 0.0441C22.5479 0.0481822 22.9973 0.236609 23.3295 0.568799C23.6617 0.900989 23.8501 1.35036 23.8542 1.82013C23.8583 2.2899 23.6777 2.74248 23.3513 3.08039L13.2158 13.2158Z" fill="#FF008C" />
                        </svg>

                    </div>

                    <div className="w-10 h-10 bg-white rounded-full flex cursor-pointer items-center justify-center duration-300 scale-90 hover:scale-100" onClick={() => smoothScrollTo('next')}>

                        <svg width="20" height="14" viewBox="0 0 24 14" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ transform: "scale(0.8)" }}>
                            <path fillRule="evenodd" clipRule="evenodd" d="M13.2158 13.2158C12.8799 13.5517 12.4242 13.7404 11.9491 13.7404C11.4741 13.7404 11.0184 13.5517 10.6824 13.2158L0.546975 3.08039C0.375853 2.91512 0.239359 2.71742 0.14546 2.49882C0.0515603 2.28023 0.0021349 2.04513 6.76468e-05 1.80724C-0.00199961 1.56934 0.0433331 1.33341 0.13342 1.11322C0.223506 0.893035 0.356543 0.692991 0.524768 0.524767C0.692992 0.356542 0.893034 0.223505 1.11322 0.133419C1.33341 0.0433322 1.56934 -0.00199961 1.80724 6.7648e-05C2.04513 0.0021349 2.28023 0.0515603 2.49882 0.14546C2.71741 0.239359 2.91512 0.375852 3.08039 0.546974L11.9491 9.41572L20.8179 0.546974C21.1558 0.220608 21.6084 0.0400178 22.0781 0.0441C22.5479 0.0481822 22.9973 0.236609 23.3295 0.568799C23.6617 0.900989 23.8501 1.35036 23.8542 1.82013C23.8583 2.2899 23.6777 2.74248 23.3513 3.08039L13.2158 13.2158Z" fill="#FF008C" />
                        </svg>
                    </div>
                </div>

                <div className={` w-screen md:w-[350px] bg-[#FBE8FD]  relative  outline outline-white duration-300 rounded-tl-2xl rounded-bl-2xl  ${comment.show ? "translate-y-0  md:translate-y-0" : "translate-y-0  md:translate-y-0  md:translate-x-full hidden"}`} onClick={(e) => e.stopPropagation()}>

                    <div className={`p-5  h-[60vh] md:h-[70vh]`}>
                        <div className="flex items-center mb-6">
                            <span className="cursor-pointer" onClick={() => setComment(prev => ({ ...prev, show: false }))}>
                                <GoBack />
                            </span>
                            <p className="text-sm px-[30%]">Comments</p>
                        </div>

                        <div className="overflow-y-auto h-[40vh] scrollbar-hide ">
                            {data.feeds.find(item => item._id === id)?.comments?.length! > 0 ? (
                                <div className="grid gap-5">
                                    {data.feeds.find(item => item._id === id)?.comments?.map((item, key) => {
                                        return <CommentItem
                                            comments={data.feeds.find(item => item._id === id)?.comments!}
                                            key={key}
                                            item={item}
                                            onToggle={(id: string) => { handleToggle(id) }}
                                            onReply={(parent: any) => { replyComment(parent) }}
                                            onLike={(id: string) => { likeComment(id) }}
                                            deleteComment={deleteComment}
                                            user={user!}
                                        />
                                    })}

                                </div>
                            ) : (
                                <p className="text-xs text-center">This post has no comments</p>
                            )}
                        </div>

                    </div>

                    <div className={`absolute bottom-20 md:bottom-0 w-full  px-2 `}>

                        <textarea name="" id="" className="w-full h-32 md:h-20 text-xs outline-none p-3 font-poppins resize-none rounded-2xl border border-transparent focus:border-primaryhover transition duration-300"
                            placeholder={!comment.parent.parentId ? "Write a comment" : `Replying to @${comment.parent.fullname.replaceAll(" ", "").toLowerCase()}`} onChange={(e) => setComment(prev => ({ ...prev, commentText: e.target.value }))} value={comment.commentText} onKeyDown={(e) => {
                                if (e.key === "Enter") { sendComment(comment.parent.parentId) }
                            }}></textarea>
                        <button className={`w-6 h-6 bg-primaryhover rounded-full flex items-center justify-center absolute right-3 bottom-3 transition duration-300 ${comment.show ? "" : "hidden"}`} onClick={() => { sendComment(comment.parent.parentId) }}>
                            <SendHorizonal size={10} color="white" />
                        </button>
                    </div>
                </div>
            </div>

            <ShareModal share={share.show} href={href} hideShare={() => { setShare({ ...share, show: false }) }} />


        </section>
    );
}
