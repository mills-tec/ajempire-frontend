import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type VideoUploadResourceType = "product" | "education";

export interface OrphanedVideoUpload {
  resourceType: VideoUploadResourceType;
  resourceId: string;
  fileName: string;
  startedAt: number;
}

interface OrphanedVideoUploadStore {
  pending: Record<string, OrphanedVideoUpload>;
  setPending: (id: string, entry: OrphanedVideoUpload) => void;
  clearPending: (id: string) => void;
}

function isValidEntry(value: unknown): value is OrphanedVideoUpload {
  if (!value || typeof value !== "object") return false;
  const entry = value as Partial<OrphanedVideoUpload>;
  return (
    (entry.resourceType === "product" || entry.resourceType === "education") &&
    typeof entry.resourceId === "string" &&
    typeof entry.fileName === "string" &&
    typeof entry.startedAt === "number"
  );
}

// Persisted separately from the ephemeral live-progress store: progress/status
// are meaningless after a reload (the in-memory File and tus.Upload are gone),
// but "there was an unfinished upload for resource X, file Y" is worth
// remembering so a returning admin can be told about it and choose to
// re-select the file to resume, or discard it. Keyed so multiple uploads that
// were in flight at once are each tracked independently.
export const useOrphanedVideoUploadStore = create<OrphanedVideoUploadStore>()(
  persist(
    (set) => ({
      pending: {},
      setPending: (id, entry) =>
        set((state) => ({ pending: { ...state.pending, [id]: entry } })),
      clearPending: (id) =>
        set((state) => {
          const { [id]: _removed, ...rest } = state.pending;
          return { pending: rest };
        }),
    }),
    {
      name: "orphaned-video-upload",
      storage: createJSONStorage(() => localStorage),
      // Guards against a pre-existing localStorage entry from an older shape
      // (this has changed twice now: single nullable object → keyed
      // collection → resourceType/resourceId instead of productId) — without
      // this, rehydrating a stale shape crashes or silently misbehaves for
      // every consumer.
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<OrphanedVideoUploadStore> | undefined;
        const pending = persisted?.pending;
        if (!pending || typeof pending !== "object" || Array.isArray(pending)) {
          return { ...currentState, pending: {} };
        }
        const validEntries = Object.entries(pending).filter(([, entry]) => isValidEntry(entry));
        return { ...currentState, pending: Object.fromEntries(validEntries) };
      },
    },
  ),
);
