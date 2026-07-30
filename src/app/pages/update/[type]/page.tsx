
export default async function Page({
    params,
}: {
    params: Promise<{ type: string }>;
}) {
    const { type } = await params;

    return (
        type != "gallery" && <div className="h-[85vh] flex items-center justify-center">
            No data found
        </div>
    );
}
