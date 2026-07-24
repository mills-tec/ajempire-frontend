import FeedItem from "@/components/FeedItem";
import Gallery from "@/components/Gallery";
import { getFeedById } from "@/lib/api";
import { buildFeedMetadata } from "@/lib/feedMetadata"; // ✅ import only
import { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "";

// ❌ DELETE the entire buildFeedMetadata function definition from here

export async function generateMetadata({
    params,
}: {
    params: Promise<{ type: string; id: string }>;
}): Promise<Metadata> {
    const { type, id } = await params;
    const url = `${BASE_URL}/pages/update/${type}/${id}`;

    const feed = await getFeedById(type, id);

    if (!feed) return {};
    console.log(feed);
    return buildFeedMetadata(feed, url); // ✅ just call it as normal
}

export default async function Page({
    params,
}: {
    params: Promise<{ type: string; id: string }>;
}) {
    const { type } = await params;

    return (
        <div>

            {type !== "gallery" ? <FeedItem /> : <Gallery />}
        </div>
    );
}