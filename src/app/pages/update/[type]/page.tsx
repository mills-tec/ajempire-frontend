import { getUpdates } from "@/lib/api";
import { ITEMS_TO_APPEND } from "@/lib/utils";
import { redirect } from "next/navigation";

export default async function Page({
    params,
}: {
    params: Promise<{ type: string }>;
}) {
    const { type } = await params;
    const req = await getUpdates(type, "", ITEMS_TO_APPEND);

    if (!req?.data?.length) {
        return (
            <div className="h-[85vh] flex items-center justify-center">
                No data found
            </div>
        );
    }

    redirect(`/pages/update/${type}/${req.data[0]._id}`);
}
