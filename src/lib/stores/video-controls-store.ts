import { create } from "zustand";

// One inactivity countdown for the whole app's video chrome. Every HlsPlayer
// with controls enabled reads `visible` from here instead of running its own
// timer, so the feed behaves like a single continuous video experience:
// scrolling to the next video inherits the current hidden/shown state rather
// than resetting it (TikTok/Reels/Shorts behavior).
//
// The chrome starts HIDDEN and only ever appears through a real user
// interaction (pointer movement, tapping the video, pressing a control) —
// never because a new player mounted, autoplay started, or a video paused.
// The countdown starts from that interaction.

export const CONTROLS_HIDE_DELAY_MS = 3000;

// Timer + hold bookkeeping live in module scope, not in reactive state —
// subscribers only care about `visible` flips, not timer churn.
let hideTimer: ReturnType<typeof setTimeout> | null = null;
// While > 0 the countdown never hides the chrome. Used by the displayed
// player while it's paused: a paused video with no play button reads as
// broken. Standby (inactive) players are paused too but never hold.
let holds = 0;

const clearTimer = () => {
  if (hideTimer) {
    clearTimeout(hideTimer);
    hideTimer = null;
  }
};

type VideoControlsStore = {
  visible: boolean;

  /** User interaction: reveal the chrome and restart the single countdown. */
  show: () => void;
  /** Immediate hide (e.g. pointer left the player). No-op while held. */
  hide: () => void;
  /**
   * Suspend the countdown (displayed player is paused). Does NOT reveal the
   * chrome by itself — it only keeps it up once the user has shown it.
   */
  acquireHold: () => void;
  /** Release a hold; when the last one goes, the countdown restarts. */
  releaseHold: () => void;
};

export const useVideoControlsStore = create<VideoControlsStore>((set, get) => {
  const startCountdown = () => {
    clearTimer();
    hideTimer = setTimeout(() => {
      hideTimer = null;
      if (holds === 0) set({ visible: false });
    }, CONTROLS_HIDE_DELAY_MS);
  };

  return {
    visible: false,

    show: () => {
      set({ visible: true });
      startCountdown();
    },

    hide: () => {
      if (holds > 0) return;
      clearTimer();
      set({ visible: false });
    },

    acquireHold: () => {
      holds++;
      clearTimer();
    },

    releaseHold: () => {
      holds = Math.max(0, holds - 1);
      if (holds === 0 && get().visible) startCountdown();
    },
  };
});
