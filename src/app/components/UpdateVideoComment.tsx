import React from "react";

export default function UpdateVideoComment({
  reply = false,
}: {
  reply?: boolean;
}) {
  return (
    <div className="w-full flex gap-2">
      <div className="size-8 min-w-8 rounded-full bg-black"></div>
      <div>
        <h1 className="text-sm text-black/70">Ebere Divine Favour</h1>
        <p className="text-sm">
          I really love this product! This is literally the best I’ve gotten
          from any online store.
        </p>
        <div className="flex items-center gap-6 text-xs mt-1">
          <p>3d</p>
          <button>Reply</button>
        </div>
        {!reply && (
          <div className="flex items-center text-xs gap-2 mt-1">
            <svg
              width="39"
              height="1"
              viewBox="0 0 39 1"
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
            <p>View 8 replies</p>
          </div>
        )}
      </div>
    </div>
  );
}
