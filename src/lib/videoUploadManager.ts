import * as tus from "tus-js-client";
import { getVideoPresignedUpload, updateEducation, updateProduct } from "./adminapi";
import { useOrphanedVideoUploadStore, type VideoUploadResourceType } from "./stores/orphaned-video-upload-store";
import { useVideoUploadStore } from "./stores/video-upload-store";

// Only what's needed to retry — there is no cancel feature (dismissing the
// pill never affects the underlying upload), so no tus.Upload/reject handle
// needs to be kept around.
interface TrackedUpload {
  file: File;
  resourceType: VideoUploadResourceType;
  resourceId: string;
}

const trackedUploads = new Map<string, TrackedUpload>();

async function attachVideo(resourceType: VideoUploadResourceType, resourceId: string, videoId: string): Promise<void> {
  if (resourceType === "product") {
    await updateProduct(resourceId, { video: videoId });
  } else {
    await updateEducation(resourceId, { video: videoId });
  }
}

function runTusUpload(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    (async () => {
      const presigned = await getVideoPresignedUpload(file);
      if (!presigned.status || !presigned.message) {
        throw new Error("Failed to get upload URL");
      }
      const { signature, expirationTime, videoId, libraryId } = presigned.message;

      const upload = new tus.Upload(file, {
        endpoint: "https://video.bunnycdn.com/tusupload",
        retryDelays: [0, 3000, 5000, 10000, 20000, 60000, 60000],
        storeFingerprintForResuming: true, // saves progress to localStorage
        removeFingerprintOnSuccess: true,
        headers: {
          AuthorizationSignature: signature,
          AuthorizationExpire: expirationTime,
          VideoId: videoId,
          LibraryId: libraryId,
        },
        metadata: {
          filetype: file.type,
          title: file.name,
        },
        onError: (error) => reject(error),
        onSuccess: () => resolve(videoId),
      });

      const previousUploads = await upload.findPreviousUploads();
      if (previousUploads.length) {
        upload.resumeFromPreviousUpload(previousUploads[0]);
      }
      upload.start();
    })().catch(reject);
  });
}

// Runs (or re-runs) the upload + attach sequence for an id that's already
// registered in both the reactive store and trackedUploads.
async function runJob(id: string): Promise<void> {
  const tracked = trackedUploads.get(id);
  if (!tracked) return;

  try {
    const videoId = await runTusUpload(tracked.file);
    await attachVideo(tracked.resourceType, tracked.resourceId, videoId);

    trackedUploads.delete(id);
    useOrphanedVideoUploadStore.getState().clearPending(id);
    useVideoUploadStore.getState().updateUpload(id, { status: "success" });
    setTimeout(() => {
      if (useVideoUploadStore.getState().uploads[id]?.status === "success") {
        useVideoUploadStore.getState().removeUpload(id);
      }
    }, 2000);
  } catch (err) {
    console.error("Background video upload failed:", err);
    useVideoUploadStore.getState().updateUpload(id, {
      status: "error",
      error: err instanceof Error ? err.message : "Video upload failed",
    });
  }
}

/**
 * Uploads a video in the background and attaches it to the given resource
 * once done. Deliberately not awaited by callers — creating/saving the
 * resource must not block on this. Progress is reported through the global
 * useVideoUploadStore (as a minimal pill — no per-file detail), which the
 * admin-layout renders regardless of which admin page is currently active,
 * so it survives navigating away (e.g. router.push right after creation).
 * Multiple calls can be in flight at once — each gets its own id and is
 * tracked independently.
 */
async function uploadVideoInBackground(
  file: File,
  resourceType: VideoUploadResourceType,
  resourceId: string,
): Promise<void> {
  const id = crypto.randomUUID();
  trackedUploads.set(id, { file, resourceType, resourceId });

  useVideoUploadStore.getState().addUpload({ id, status: "uploading" });

  // Durable record of "this upload hasn't finished" — survives a reload/tab
  // close, unlike the state above. Cleared on success or explicit discard.
  useOrphanedVideoUploadStore.getState().setPending(id, {
    resourceType,
    resourceId,
    fileName: file.name,
    startedAt: Date.now(),
  });

  await runJob(id);
}

export function uploadProductVideoInBackground(file: File, productId: string): Promise<void> {
  return uploadVideoInBackground(file, "product", productId);
}

export function uploadEducationVideoInBackground(file: File, educationId: string): Promise<void> {
  return uploadVideoInBackground(file, "education", educationId);
}

export function isVideoUploadInFlight(): boolean {
  return Object.values(useVideoUploadStore.getState().uploads).some(
    (u) => u.status === "uploading" || u.status === "compressing",
  );
}

// Re-runs a failed upload from scratch. tus's own fingerprint storage
// (storeFingerprintForResuming) still applies, so this resumes from the last
// acknowledged byte offset rather than re-uploading the whole file.
export function retryVideoUpload(id: string): void {
  const tracked = trackedUploads.get(id);
  const current = useVideoUploadStore.getState().uploads[id];
  if (!tracked || current?.status !== "error") return;

  useVideoUploadStore.getState().updateUpload(id, { status: "uploading", error: undefined });
  void runJob(id);
}

// Best-effort cleanup of tus's own localStorage fingerprint entries for a
// discarded upload, so a stray entry doesn't sit around forever. Matched by
// the filename we set as metadata.title when the upload started — not a
// perfect key, but nothing else is available without the original File.
async function cleanupTusFingerprintsByFileName(fileName: string): Promise<void> {
  try {
    const storage = tus.defaultOptions.urlStorage;
    const uploads = await storage.findAllUploads();
    await Promise.all(
      uploads
        .filter((u) => u.metadata?.title === fileName)
        .map((u) => storage.removeUpload(u.urlStorageKey)),
    );
  } catch {
    // Best-effort only — a leftover fingerprint entry is harmless.
  }
}

// Admin explicitly declined to resume an orphaned upload detected on load.
export function discardOrphanedVideoUpload(id: string): void {
  const entry = useOrphanedVideoUploadStore.getState().pending[id];
  useOrphanedVideoUploadStore.getState().clearPending(id);
  if (entry) {
    void cleanupTusFingerprintsByFileName(entry.fileName);
  }
}

// Admin re-selected a file to resume an orphaned upload detected on load.
// tus's own fingerprint matching (name/size/type/lastModified + endpoint)
// decides whether this actually resumes from a byte offset or starts fresh —
// there is no way to verify it's "the same file" without that mechanism,
// since the original File object cannot survive a reload on its own.
export function resumeOrphanedVideoUpload(id: string, file: File): void {
  const entry = useOrphanedVideoUploadStore.getState().pending[id];
  if (!entry) return;
  useOrphanedVideoUploadStore.getState().clearPending(id);
  void uploadVideoInBackground(file, entry.resourceType, entry.resourceId);
}

if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", (event) => {
    if (isVideoUploadInFlight()) {
      event.preventDefault();
      event.returnValue = "";
    }
  });
}
