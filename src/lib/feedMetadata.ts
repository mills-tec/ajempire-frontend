import { Metadata } from "next";

export function buildFeedMetadata(
    feed: {
        _id: string;
        title: string;
        description: string;
        mediaUrl?: string;
        mediaType?: string;
        thumbnailUrl?: string;
        image?: string;
    },
    url: string,
): Metadata {
    // `image` is the backend's thumbnail/cover for every post type (including
    // videos). `thumbnailUrl` was never part of the Feed type so it was always
    // undefined, producing an empty OG image array for every video post.
    const image = feed.image ?? (feed.mediaType === "video" ? feed.thumbnailUrl : feed.mediaUrl);
    const description = feed.description?.slice(0, 155);

    return {
        title: `Aj Empire - ${feed.title}`,
        description,
        alternates: { canonical: url },
        robots: { index: true, follow: true },
        openGraph: {
            title: `Aj Empire - ${feed.title}`,
            description,
            url,
            siteName: "Aj Empire",
            type: "article",
            locale: "en_US",
            images: image ? [{ url: image, width: 1200, height: 630, alt: `Aj Empire - ${feed.title}` }] : [],
        },
        twitter: {
            card: "summary_large_image",
            title: `Aj Empire - ${feed.title}`,
            description,
            images: image ? [image] : [],
        },
        other: { "theme-color": "#ffffff" },
    };
}