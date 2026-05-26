import FeedItem from "@/components/FeedItem";
import Gallery from "@/components/Gallery";
import { getUpdates } from "@/lib/api";
import { ITEMS_TO_APPEND } from "@/lib/utils";
import { Metadata } from "next";
import { buildFeedMetadata } from "@/lib/feedMetadata"; // ✅ import only

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "";

// ❌ DELETE the entire buildFeedMetadata function definition from here

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
            
            {type !== "gallery" ? <FeedItem  /> : <Gallery />}
        </div>
    );
}