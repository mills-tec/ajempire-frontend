// bunnyLoader.ts — one place, handles all sizing automatically
export default function bunnyLoader({ url, width, quality }: { url: string; width: string; quality: number }) {
    return `${url}?width=${width}&quality=${quality || 80}`
}