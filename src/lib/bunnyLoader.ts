type LoaderProps = {
    src: string;
    width: number;
    quality?: number;
};
export function bunnyLoader({ src, width, quality }: LoaderProps): string {
    if (!src.startsWith("https:")) return src;
    const url = new URL(src);
    url.searchParams.set("width", width.toString());
    url.searchParams.set("height", width.toString());
    url.searchParams.set("quality", (quality ?? 80).toString());
    return url.toString();

}