import { create } from "zustand";

export type VideoUploadStatus = "compressing" | "uploading" | "success" | "error";

export interface VideoUploadState {
  id: string;
  status: VideoUploadStatus;
  error?: string;
}

interface VideoUploadStore {
  uploads: Record<string, VideoUploadState>;
  // Hides the ambient pill only — the uploads keep running/tracked
  // underneath regardless of this flag. Deliberately a single pill-level
  // flag rather than per-upload: the pill is one ambient indicator, not a
  // list of dismissible rows.
  dismissed: boolean;

  addUpload: (upload: VideoUploadState) => void;
  updateUpload: (id: string, patch: Partial<VideoUploadState>) => void;
  removeUpload: (id: string) => void;
  dismiss: () => void;
}

// Plain module-scoped Zustand store (no React Context) — state here is a
// singleton independent of the component tree, so it survives client-side
// navigation between any pages that share this module.
export const useVideoUploadStore = create<VideoUploadStore>((set) => ({
  uploads: {},
  dismissed: false,

  // A new upload always makes the pill visible again, even if the admin
  // previously dismissed it while an earlier upload was running.
  addUpload: (upload) =>
    set((state) => ({
      uploads: { ...state.uploads, [upload.id]: upload },
      dismissed: false,
    })),

  updateUpload: (id, patch) =>
    set((state) => {
      const existing = state.uploads[id];
      if (!existing) return state;
      return {
        uploads: { ...state.uploads, [id]: { ...existing, ...patch } },
        // A failure demands attention regardless of a prior dismissal.
        dismissed: patch.status === "error" ? false : state.dismissed,
      };
    }),

  removeUpload: (id) =>
    set((state) => {
      const { [id]: _removed, ...rest } = state.uploads;
      return { uploads: rest };
    }),

  dismiss: () => set({ dismissed: true }),
}));
