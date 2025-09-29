"use client";
import { Progress } from "@/components/ui/progress";
import React from "react";

export default function ProductReview() {
  const [rating, setRating] = React.useState(3);

  const filledStar = (
    <svg
      width="16"
      height="16"
      className="size-4"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8.16382 0.828125L9.99671 6.46919H15.9281L11.1295 9.95557L12.9624 15.5966L8.16382 12.1103L3.36525 15.5966L5.19814 9.95557L0.399566 6.46919H6.33092L8.16382 0.828125Z"
        fill="#403C39"
      />
    </svg>
  );
  const unfilledStar = (
    <svg
      width="16"
      height="16"
      className="size-4"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M9.40625 6.55859L9.4707 6.75781H14.7236L10.6436 9.72168L10.4736 9.8457L10.5381 10.0449L12.0967 14.8408L8.0166 11.877L7.84766 11.7539L7.67773 11.877L3.59668 14.8408L5.15625 10.0449L5.2207 9.8457L5.05176 9.72168L0.97168 6.75781H6.22461L6.28906 6.55859L7.84766 1.76074L9.40625 6.55859Z"
        stroke="#403C39"
        strokeWidth="0.57732"
      />
    </svg>
  );
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <h3 className="font-medium">Reviews</h3>
        <div className="flex items-center gap-2">
          {
            <div className="flex text-brand_gray_dark">
              {[...Array(5)].map((_, i) =>
                i < rating ? (
                  <span key={i}>{filledStar}</span>
                ) : (
                  <span key={i}>{unfilledStar}</span>
                )
              )}
            </div>
          }
          <p className="text-black/60 text-xs">(1K)</p>
        </div>
      </div>
      <div className="flex gap-8 w-[80%]">
        <h1 className="text-[4rem] font-medium">
          4.5<span className="text-lg text-brand_gray">/5</span>
        </h1>
        <div className="border-2 w-full">
          {[
            { lvl: 5, progress: 100 },
            { lvl: 4, progress: 40 },
            { lvl: 3, progress: 10 },
            { lvl: 2, progress: 3 },
            { lvl: 1, progress: 0 },
          ].map((val, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <svg
                  width="18"
                  height="16"
                  viewBox="0 0 18 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M8.66396 0.570681C8.80861 0.125478 9.43846 0.125479 9.58311 0.570682L11.1849 5.50039C11.2496 5.69949 11.4351 5.83429 11.6444 5.83429H16.8278C17.296 5.83429 17.4906 6.43331 17.1119 6.70846L12.9184 9.75518C12.7491 9.87823 12.6782 10.0963 12.7429 10.2954L14.3446 15.2252C14.4893 15.6704 13.9797 16.0406 13.601 15.7654L9.40757 12.7187C9.2382 12.5956 9.00887 12.5956 8.8395 12.7187L4.64604 15.7654C4.26733 16.0406 3.75778 15.6704 3.90243 15.2252L5.50419 10.2954C5.56888 10.0963 5.49801 9.87823 5.32865 9.75518L1.13519 6.70846C0.756476 6.43331 0.951109 5.83429 1.41922 5.83429H6.60262C6.81197 5.83429 6.99751 5.69949 7.0622 5.50039L8.66396 0.570681Z"
                    fill="#FEBC2F"
                  />
                </svg>
                <p>{val.lvl}</p>
              </div>

              <Progress value={val.progress} className="!h-1" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
