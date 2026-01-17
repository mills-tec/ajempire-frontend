"use client";

import { StaticImageData } from "next/image";

interface Prop {
  items: {
    id: number;
    image: StaticImageData;
    title: string;
    description: string;
  }[];
}

export default function UpdateGallery({ items }: Prop) {
  return (
    <div className="columns-1 md:columns-2 gap-4">
      {items.map((item) => (
        <div
          key={item.id}
          className="break-inside-avoid mb-4 rounded overflow-hidden"
        >
          {/* Image with unknown size */}
          {item.image && (
            <img
              src={item.image.src}
              alt={item.title}
              className="w-full h-auto"
            />
          )}

          {/* content */}
          <div className="p-4">
            <div className="flex relative float-right">
              <svg
                width="45"
                height="45"
                viewBox="0 0 45 45"
                className="size-6 cursor-pointer"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9.375 18.75C7.3125 18.75 5.625 20.4375 5.625 22.5C5.625 24.5625 7.3125 26.25 9.375 26.25C11.4375 26.25 13.125 24.5625 13.125 22.5C13.125 20.4375 11.4375 18.75 9.375 18.75ZM35.625 18.75C33.5625 18.75 31.875 20.4375 31.875 22.5C31.875 24.5625 33.5625 26.25 35.625 26.25C37.6875 26.25 39.375 24.5625 39.375 22.5C39.375 20.4375 37.6875 18.75 35.625 18.75ZM22.5 18.75C20.4375 18.75 18.75 20.4375 18.75 22.5C18.75 24.5625 20.4375 26.25 22.5 26.25C24.5625 26.25 26.25 24.5625 26.25 22.5C26.25 20.4375 24.5625 18.75 22.5 18.75Z"
                  fill="black"
                />
              </svg>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
