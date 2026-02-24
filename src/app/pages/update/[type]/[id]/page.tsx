import { getData } from "@/api/api";
import FeedItem from "@/components/FeedItem";
import Gallery from "@/components/Gallery";
import { getFeeds, getProducts } from "@/lib/api";
import { Feed } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { Metadata } from "next";




export function buildFeedMetadata(feed: {
    _id: string
    title: string
    description: string
    mediaUrl?: string
}): Metadata {
    const url = `${window.location}`
    const image = feed.mediaUrl || "https://yourdomain.com/og-default.jpg"
    const description = feed.description?.slice(0, 155)

    return {
        title: feed.title,
        description,

        alternates: {
            canonical: url,
        },

        robots: {
            index: true,
            follow: true,
        },

        openGraph: {
            title: feed.title,
            description,
            url,
            siteName: "Aj Empire",
            type: "article",
            locale: "en_US",

            images: [
                {
                    url: image,
                    width: 1200,
                    height: 630,
                    alt: feed.title,
                },
            ],
        },

        twitter: {
            card: "summary_large_image",
            title: feed.title,
            description,
            images: [image],
            // site: "@yourhandle", // optional
            // creator: "@yourhandle", // optional
        },

        other: {
            "theme-color": "#ffffff",
        },
    }
}
export async function generateMetaData({ params }: { params: Promise<{ type: string, id: string }> }) {
    const { id } = await params;
    const req = await getData("/feeds/", {});
    const feeds: Feed[] = req.data.message.feeds;
    const feed = feeds.find((feed) => feed._id === id);
    return buildFeedMetadata(feed!);
}


export default async function Page({ params }: { params: Promise<{ type: string, id: string }> }) {
    const { type } = await params;
    const req = await getData(`/updates/${type}`, {});
    const feeds: { data: Feed[], nextCursor: string, hasMore: boolean } = req.data.message;

    return (
        <div>
            {type !== "gallery" ? <FeedItem feeds={feeds} /> : <Gallery feeds={feeds.data} />}


        </div>
    )
}
