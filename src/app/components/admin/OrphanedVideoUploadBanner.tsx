"use client";

import { useOrphanedVideoUploadStore } from "@/lib/stores/orphaned-video-upload-store";
import { useVideoUploadStore } from "@/lib/stores/video-upload-store";
import { discardOrphanedVideoUpload, resumeOrphanedVideoUpload } from "@/lib/videoUploadManager";
import { AlertTriangle, Trash2, Upload } from "lucide-react";
import { useRef, type ChangeEvent } from "react";

// Mounted once in the admin layout (alongside VideoUploadPill). Detects
// uploads that never finished before the tab was closed/refreshed — the
// original File object can't survive that, so this can only offer "pick the
// file again" rather than silently auto-resuming; tus's own fingerprint
// matching then decides whether that reselected file actually continues
// from where it left off. Multiple orphaned uploads (if more than one was in
// flight at once) are each listed and resolved independently.
export default function OrphanedVideoUploadBanner() {
    const pending = useOrphanedVideoUploadStore((state) => state.pending);
    const liveUploads = useVideoUploadStore((state) => state.uploads);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const resumeTargetIdRef = useRef<string | null>(null);

    // A pending record is written for every upload the moment it starts (so
    // it's there to detect if the tab closes mid-upload) — but as long as
    // its id is still live in useVideoUploadStore, the pill is already
    // showing it and nothing has actually been lost. Only an id whose live
    // entry is gone (wiped by a reload) is genuinely orphaned.
    const entries = Object.entries(pending).filter(([id]) => !liveUploads[id]);
    if (entries.length === 0) return null;

    const handleResumeClick = (id: string) => {
        resumeTargetIdRef.current = id;
        fileInputRef.current?.click();
    };

    const handleFileSelected = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        const id = resumeTargetIdRef.current;
        e.target.value = '';
        resumeTargetIdRef.current = null;
        if (file && id) resumeOrphanedVideoUpload(id, file);
    };

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[24rem] max-w-[calc(100vw-2rem)] space-y-2">
            {entries.map(([id, entry]) => (
                <div
                    key={id}
                    className="rounded-2xl bg-white/90 backdrop-blur-xl border border-amber-200 shadow-[0_10px_40px_rgba(0,0,0,0.15)] p-4"
                >
                    <div className="flex items-start gap-3">
                        <div className="shrink-0 w-9 h-9 rounded-full bg-amber-500/10 flex items-center justify-center">
                            <AlertTriangle size={16} className="text-amber-500" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900">Unfinished video upload</p>
                            <p className="text-xs text-gray-500 mt-0.5">
                                &quot;{entry.fileName}&quot; didn&apos;t finish uploading before you left. Select that file again to resume it.
                            </p>
                        </div>
                    </div>

                    <div className="mt-3 flex gap-2">
                        <button
                            type="button"
                            onClick={() => discardOrphanedVideoUpload(id)}
                            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                            <Trash2 size={12} />
                            Discard
                        </button>
                        <button
                            type="button"
                            onClick={() => handleResumeClick(id)}
                            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand_pink text-white text-xs font-medium hover:bg-brand_pink/90 transition-colors"
                        >
                            <Upload size={12} />
                            Select file to resume
                        </button>
                    </div>
                </div>
            ))}

            <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleFileSelected}
                className="hidden"
            />
        </div>
    );
}
