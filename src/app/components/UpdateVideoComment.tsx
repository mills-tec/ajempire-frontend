import { useFeedStore } from "@/lib/stores/feed-store";
import { Comment } from "@/lib/types";
import React from "react";

export default function UpdateVideoComment({
  isReply = false,
  comment,
  reply_count,
  post_id,
}: {
  isReply?: boolean;
  comment: Comment;
  reply_count?: number;
  post_id: string;
}) {
  const { toggleViewReply } = useFeedStore();
  return (
    <div className="w-full flex gap-2">
      <div className="size-8 min-w-8 rounded-full bg-black"></div>
      <div>
        <h1
          className="text-sm text-black/70 overflow-hidden text-ellipsis whitespace-nowrap w-[8rem]"
          title={comment._id}
        >
          {comment._id}
        </h1>
        <p className="text-sm">{comment.text}</p>
        <div className="flex items-center gap-6 text-xs mt-1">
          <p>3d</p>
          <button>Reply</button>
        </div>
        {!isReply && !comment.viewReply && (
          <div
            onClick={() => toggleViewReply(post_id, comment._id)}
            className="flex items-center cursor-pointer text-xs gap-2 mt-1"
          >
            <svg
              width="39"
              height="1"
              viewBox="0 0 39 1"
              className="cursor-pointer"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <line
                y1="0.25"
                x2="39"
                y2="0.25"
                stroke="#787878"
                strokeWidth="0.5"
              />
            </svg>
            <p>View {reply_count} replies</p>
          </div>
        )}
      </div>
    </div>
  );
}
