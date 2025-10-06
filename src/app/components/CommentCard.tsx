"use client";
import React from "react";
import Profile from "@/assets/profile.png";
import Image from "next/image";

export default function CommentCard() {
  const [rating, setRating] = React.useState(3);
  const filledStar = (
    <svg
      width="22"
      height="21"
      viewBox="0 0 22 21"
      className="size-4"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M11 0.226562L13.4697 7.82738H21.4616L14.996 12.5249L17.4656 20.1257L11 15.4282L4.53436 20.1257L7.00402 12.5249L0.538379 7.82738H8.53035L11 0.226562Z"
        fill="#FEBC2F"
      />
    </svg>
  );
  const unfilledStar = (
    <svg
      width="22"
      height="21"
      viewBox="0 0 22 21"
      className="size-4"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M13.667 7.90918L13.7266 8.09277H21.0947L15.2891 12.3105L15.1338 12.4238L15.1934 12.6064L17.4102 19.4316L11.6055 15.2139L11.4492 15.1006L11.293 15.2139L5.4873 19.4316L7.70508 12.6064L7.76465 12.4238L7.60938 12.3105L1.80371 8.09277H9.17188L9.23145 7.90918L11.4492 1.08301L13.667 7.90918Z"
        stroke="#FEBC2F"
        strokeWidth="0.530208"
      />
    </svg>
  );
  return (
    <div className="space-y-2">
      <h3>Alex Mathio</h3>
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
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
          <p className="text-black/60 text-xs">13th Oct 2025</p>
        </div>
        <p className="text-sm">
          Absolutely love these nail kits! The quality is top-notch and very
          affordable. My clients keep complimenting the colors.
        </p>
        <div className="size-8 rounded-full relative overflow-clip">
          <Image src={Profile} alt="" className="object-cover absolute" fill />
        </div>
      </div>
    </div>
  );
}
