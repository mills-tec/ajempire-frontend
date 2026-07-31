"use client";

import { useVideoUploadStore } from "@/lib/stores/video-upload-store";
import { retryVideoUpload } from "@/lib/videoUploadManager";
import { AlertCircle, CheckCircle, Loader2, X } from "lucide-react";

// A minimal, ambient indicator — mounted once in the admin layout so it sits
// in a consistent spot regardless of which admin page is active. Deliberately
// not a detailed progress view: no filename, no percentage, just a count and
// a status. The admin isn't blocked and didn't ask to babysit this upload, so
// it stays quiet in the success case and only escalates on failure.
export default function VideoUploadPill() {
    const uploads = useVideoUploadStore((state) => state.uploads);
    const dismissed = useVideoUploadStore((state) => state.dismissed);
    const dismiss = useVideoUploadStore((state) => state.dismiss);

    const list = Object.values(uploads);
    const errorIds = list.filter((u) => u.status === "error").map((u) => u.id);
    const uploadingCount = list.filter((u) => u.status === "uploading").length;
    const compressingCount = list.filter((u) => u.status === "compressing").length;
    const successCount = list.filter((u) => u.status === "success").length;

    const hasError = errorIds.length > 0;
    const hasActive = uploadingCount + compressingCount > 0;

    if (!hasError && !hasActive && successCount === 0) return null;
    // A failure always overrides dismissal (handled in the store), but this
    // guard covers the ordinary case: the admin hid the pill and nothing new
    // has happened since.
    if (dismissed && !hasError) return null;

    const label = hasError
        ? `${errorIds.length} video${errorIds.length > 1 ? 's' : ''} failed to upload`
        : uploadingCount > 0
            ? `${uploadingCount} video${uploadingCount > 1 ? 's' : ''} uploading`
            : compressingCount > 0
                ? `${compressingCount} video${compressingCount > 1 ? 's' : ''} compressing`
                : `${successCount} video${successCount > 1 ? 's' : ''} uploaded`;

    return (
        <div
            className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full pl-3 pr-2 py-2 border shadow-lg backdrop-blur-xl transition-colors ${hasError ? 'bg-red-50/95 border-red-200' : hasActive ? 'bg-white/90 border-black/5' : 'bg-green-50/95 border-green-200'
                }`}
        >
            {hasError ? (
                <AlertCircle size={14} className="shrink-0 text-red-500" />
            ) : hasActive ? (
                <Loader2 size={14} className="shrink-0 text-brand_pink animate-spin" />
            ) : (
                <CheckCircle size={14} className="shrink-0 text-green-500" />
            )}

            <span className={`text-xs font-medium ${hasError ? 'text-red-700' : 'text-gray-700'}`}>
                {label}
            </span>

            {hasError && (
                <button
                    type="button"
                    onClick={() => errorIds.forEach((id) => retryVideoUpload(id))}
                    className="px-1.5 text-xs font-semibold text-red-600 hover:text-red-700"
                >
                    Retry
                </button>
            )}

            <button
                type="button"
                onClick={dismiss}
                title="Hide"
                className="p-0.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-black/5 transition-colors"
            >
                <X size={12} />
            </button>
        </div>
    );
}
