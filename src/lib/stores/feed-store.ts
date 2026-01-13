import { create } from "zustand";
import { likeFeedCommentPost, likeFeedPost } from "../api";
import { toast } from "sonner";
import { IFeed } from "../types";

interface FeedStore {
  posts: IFeed[];
  setPosts: (posts: IFeed[]) => void;
  toggleViewReply: (postId: string, commentId: string) => void;

  toggleLikeOptimistic: (postId: string, userId: string) => Promise<void>;
  toggleCommentLikeOptimistic: (
    postId: string,
    commentId: string,
    userId: string
  ) => Promise<void>;
}

export const useFeedStore = create<FeedStore>((set, get) => ({
  posts: [],

  setPosts: (posts) => set({ posts }),

  toggleViewReply: (postId: string, commentId: string) =>
    set((state) => ({
      posts: state.posts.map((post) =>
        post._id === postId
          ? {
              ...post,
              comments: post.comments.map((comment) =>
                comment._id === commentId
                  ? {
                      ...comment,
                      viewReply: !comment.viewReply ? true : false,
                    }
                  : comment
              ),
            }
          : post
      ),
    })),

  toggleLikeOptimistic: async (postId, userId) => {
    const { posts, setPosts } = get();

    const post = posts.find((p) => p._id === postId);
    if (!post) return;

    const userHasLiked = post.likes.includes(userId);

    // 1️⃣ Optimistic state update
    const optimisticPosts = posts.map((p) =>
      p._id === postId
        ? {
            ...p,
            likes: userHasLiked
              ? p.likes.filter((id) => id !== userId)
              : [...p.likes, userId],
          }
        : p
    );

    setPosts(optimisticPosts);

    // 2️⃣ Try API update (3 retries max)
    let success = false;
    let tries = 0;

    while (!success && tries < 3) {
      tries++;
      try {
        await likeFeedPost(postId); // your API toggles it
        success = true;
        toast.success("Post liked successfully");
      } catch (err) {
        toast.error("Couldn't like post. Retrying...");
        await new Promise((res) => setTimeout(res, 500));
      }
    }

    // 3️⃣ Revert if failed after retries
    if (!success) {
      const revertedPosts = posts.map((p) =>
        p._id === postId
          ? {
              ...p,
              likes: userHasLiked
                ? [...p.likes, userId] // revert removal
                : p.likes.filter((id) => id !== userId), // revert add
            }
          : p
      );

      setPosts(revertedPosts);

      toast.error("Failed to update like. Please try again.");
    }
  },

  toggleCommentLikeOptimistic: async (postId, commentId, userId) => {
    const { posts, setPosts } = get();

    const post = posts.find((p) => p._id === postId);
    if (!post) return;

    // --- find target comment ---
    const comment = post.comments.find((c) => c._id === commentId);
    if (!comment) return;

    const userHasLiked = comment.likes.includes(userId);

    // 1️⃣ Optimistically update
    const optimisticPosts = posts.map((p) =>
      p._id === postId
        ? {
            ...p,
            comments: p.comments.map((c) =>
              c._id === commentId
                ? {
                    ...c,
                    likes: userHasLiked
                      ? c.likes.filter((id) => id !== userId)
                      : [...c.likes, userId],
                  }
                : c
            ),
          }
        : p
    );

    setPosts(optimisticPosts);

    // 2️⃣ Try API update (3 retries)
    let success = false;
    let tries = 0;

    while (!success && tries < 3) {
      tries++;
      try {
        await likeFeedCommentPost(commentId);
        success = true;
        toast.success("Comment liked");
      } catch {
        if (tries < 3) {
          toast.error("Retrying...");
          await new Promise((res) => setTimeout(res, 500));
        }
      }
    }

    // 3️⃣ Revert if failed
    if (!success) {
      const revertedPosts = posts.map((p) =>
        p._id === postId
          ? {
              ...p,
              comments: p.comments.map((c) =>
                c._id === commentId
                  ? {
                      ...c,
                      likes: userHasLiked
                        ? [...c.likes, userId] // revert unlike
                        : c.likes.filter((id) => id !== userId), // revert like
                    }
                  : c
              ),
            }
          : p
      );

      setPosts(revertedPosts);

      toast.error("Failed to update like. Please try again.");
    }
  },
}));
