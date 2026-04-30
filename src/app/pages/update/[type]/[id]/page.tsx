import FeedItem from "@/components/FeedItem";
import Gallery from "@/components/Gallery";
import { getUpdates } from "@/lib/api";
import { ITEMS_TO_APPEND } from "@/lib/utils";
import { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "";

export function buildFeedMetadata(
    feed: {
        _id: string;
        title: string;
        description: string;
        mediaUrl?: string;
        mediaType?: string;
        thumbnailUrl?: string;
    },
    url: string,
): Metadata {
    const image = feed.mediaType === "video" ? feed.thumbnailUrl : feed.mediaUrl;
    const description = feed.description?.slice(0, 155);

    return {
        title: feed.title,
        description,
        alternates: { canonical: url },
        robots: { index: true, follow: true },
        openGraph: {
            title: feed.title,
            description,
            url,
            siteName: "Aj Empire",
            type: "article",
            locale: "en_US",
            images: image ? [{ url: image, width: 1200, height: 630, alt: feed.title }] : [],
        },
        twitter: {
            card: "summary_large_image",
            title: feed.title,
            description,
            images: image ? [image] : [],
        },
        other: { "theme-color": "#ffffff" },
    };
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ type: string; id: string }>;
}): Promise<Metadata> {
    const { type, id } = await params;
    const url = `${BASE_URL}/pages/update/${type}/${id}`;

    const req = await getUpdates(type, "", ITEMS_TO_APPEND);
    const feed = req?.data?.find((f) => f._id === id);

    if (!feed) return {};

    return buildFeedMetadata(feed, url);
}

export default async function Page({
    params,
}: {
    params: Promise<{ type: string; id: string }>;
}) {
    const { type } = await params;

   

    return (
        <div>
            {type !== "gallery" ? <FeedItem  /> : <Gallery />}
        </div>
    );
}
