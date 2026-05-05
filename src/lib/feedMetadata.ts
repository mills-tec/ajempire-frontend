import { Metadata } from "next";

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