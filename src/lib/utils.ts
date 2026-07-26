import { getImagePresignedUpload, uploadFile } from "./adminapi";
import { Review } from "./types";

export function cn(...inputs: (string | undefined | null | false)[]) {
  return inputs.filter(Boolean).join(" ");
}

// this is the new price after discount is applied
export function calcDiscountPrice(
  originalPrice: number,
  discount: number,
  discountType: "percent" | "fixed",
) {
  // discount is expected as a percentage e.g. 20 for 20%
  if (typeof originalPrice !== "number" || typeof discount !== "number")
    return 0;
  const discountedAmount =
    discountType === "percent" ? (discount / 100) * originalPrice : discount;
  return Math.round(originalPrice - discountedAmount);
}

// this is the removed price after discount is applied
export function calcDiscount(
  originalPrice: number,
  discount: number,
  discountType: "percent" | "fixed",
) {
  // discount is expected as a percentage e.g. 20 for 20%
  if (typeof originalPrice !== "number" || typeof discount !== "number")
    return 0;
  const discountedAmount =
    discountType === "percent" ? (discount / 100) * originalPrice : discount;
  return Math.round(discountedAmount);
}

export function getRatingStats(arr: Review[]) {
  type Rating = 1 | 2 | 3 | 4 | 5;
  const counts: Record<Rating, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  arr.forEach(({ rating }) => {
    if (rating! >= 1 && rating! <= 5) counts[rating as Rating]++;
  });

  const normalized: Record<Rating, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (let r: Rating = 1; r <= 5; r++) {
    normalized[r as Rating] =
      (counts[r as Rating] / Math.max(...Object.values(counts))) * 100; // proportional normalization
  }

  return { counts, normalized };
}

export const saveAccounts = (account: {
  token: string;
  user: { id: string; name: string; email: string };
  email: string;
}) => {
  if (localStorage.getItem("savedAccounts")) {
    const savedAccounts: { token: string; user: { id: string; name: string; email: string }; email: string }[] =
      JSON.parse(localStorage.getItem("savedAccounts")!);
    if (
      !savedAccounts.some((savedAccount) => savedAccount.email == account.email)
    ) {
      localStorage.setItem(
        "savedAccounts",
        JSON.stringify([...savedAccounts, account]),
      );
    }
  } else {
    localStorage.setItem("savedAccounts", JSON.stringify([account]));
  }
};

export function getInitials(name?: string) {
  if (!name) return "U";
  const parts = name.trim().split(" ");
  const first = parts[0]?.[0] || "";
  const second = parts[1]?.[0] || "";
  return (first + second).toUpperCase();
}

const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

const units: [number, Intl.RelativeTimeFormatUnit][] = [
  [60, "second"],
  [60, "minute"],
  [24, "hour"],
  [7, "day"],
  [4.345, "week"],
  [12, "month"],
  [Number.POSITIVE_INFINITY, "year"],
];

export function timeAgo(date: string | Date | undefined) {
  if (!date) return null;

  const diffInSeconds = Math.floor(
    (new Date(date).getTime() - Date.now()) / 1000,
  );

  let duration = diffInSeconds;

  for (const [amount, unit] of units) {
    if (Math.abs(duration) < amount) {
      const val = rtf.format(Math.round(duration), unit);
      return val;
    }
    duration /= amount;
  }
}

export const openSocialApp = (type: string, href: string) => {
  switch (type) {
    case "telegram":
      window.open(
        `https://t.me/share/url?url=${href}`,
        "_blank",
        "noopener,noreferrer",
      );
      break;
    case "whatsapp":
      window.open(
        `https://wa.me/?text=${href}`,
        "_blank",
        "noopener,noreferrer",
      );
      break;
    case "facebook":
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${href}`,
        "_blank",
        "noopener,noreferrer",
      );
      break;
    case "twitter":
      window.open(
        `https://twitter.com/intent/tweet?url=${href}`,
        "_blank",
        "noopener,noreferrer",
      );
      break;
    default:
      break;
  }
};

export function getCountdown(targetDate: string | Date) {
  const now = new Date().getTime();
  const target = new Date(targetDate).getTime();
  const diffMs = target - now;

  const totalSeconds = Math.max(Math.floor(diffMs / 1000), 0);

  const seconds = totalSeconds % 60;
  const minutes = Math.floor(totalSeconds / 60) % 60;
  const hours = Math.floor(totalSeconds / (60 * 60)) % 24;
  const days = Math.floor(totalSeconds / (60 * 60 * 24));

  return { days, hours, minutes, seconds };
}
export type CompressionType = "low" | "medium" | "high";

const COMPRESSION_PRESETS: Record<CompressionType, { maxWidth: number; maxHeight: number; quality: number }> = {
  low: { maxWidth: 800, maxHeight: 800, quality: 0.5 },
  medium: { maxWidth: 1280, maxHeight: 1280, quality: 0.7 },
  high: { maxWidth: 1920, maxHeight: 1920, quality: 0.9 },
};

// Resizes/re-encodes an image client-side before upload to cut payload size.
// Skips gif/svg (canvas re-encoding would drop animation / rasterize vectors)
// and falls back to the original file if the compressed result isn't smaller.
export async function compressImage(
  file: File,
  compressionType: CompressionType = "medium",
): Promise<File> {
  const { maxWidth, maxHeight, quality } = COMPRESSION_PRESETS[compressionType];
  if (!file.type.startsWith("image/") || file.type === "image/gif" || file.type === "image/svg+xml") {
    return file;
  }

  try {
    const bitmap = await createImageBitmap(file);

    let { width, height } = bitmap;
    const ratio = Math.min(maxWidth / width, maxHeight / height, 1);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;

    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob(resolve, file.type, quality),
    );

    if (!blob || blob.size >= file.size) return file;

    return new File([blob], file.name, { type: file.type, lastModified: Date.now() });
  } catch {
    return file;
  }
}

export const ITEMS_TO_APPEND = 10;
export function shuffleArray<T>(array: T[]) {
  const arr = [...array]; // copy so original isn't mutated
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); // pick a random index
    [arr[i], arr[j]] = [arr[j], arr[i]]; // swap
  }
  const startIndex = Math.floor(Math.random() * arr.length);
  const endIndex = Math.min(startIndex + ITEMS_TO_APPEND * 2, arr.length);
  return arr.slice(startIndex, endIndex);
}


export const uploadImageFileToStorage = async (file: File): Promise<string> => {
        const fileToUpload = file.type.startsWith("image")
            ? await compressImage(file, "medium")
            : file;

        const tr = await getImagePresignedUpload(fileToUpload);
        if (!tr.status || !tr.message) {
            throw new Error("Failed to get upload URL");
        }

        const uploadResult = await uploadFile(fileToUpload, tr.message.uploadUrl);
        if (uploadResult.status < 200 || uploadResult.status >= 300) {
            throw new Error("Upload failed");
        }


        return tr.message.objectKey;
    };