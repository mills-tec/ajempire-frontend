"use client";
import { useRef } from "react";
import Link from "next/link";
import ArrowRightIcon from "@/components/svgs/ArrowRightIcon";
import Image from "next/image";
import NewArr from "@/assets/newarr.png";

const Categories = () => {
  const categories = [
    { name: "Gel Polishes", slug: "gel-polishes" },
    { name: "Nail Decorations", slug: "nail-decorations" },
    { name: "Prep Solutions", slug: "prep-solutions" },
    { name: "Removers", slug: "removers" },
    { name: "Nail Tools", slug: "nail-tools" },
    { name: "Artificial Nails", slug: "artificial-nails" },
    { name: "Acrylic Powders", slug: "acrylic-powders" },
    { name: "Filing Tools", slug: "filing-tools" },
    { name: "Nail Drills", slug: "nail-drills" },
    { name: "Lamps", slug: "lamps" },
    { name: "Storage Items", slug: "storage-items" },
    { name: "Workstation Gear", slug: "workstation-gear" },
    { name: "Adhesives", slug: "adhesives" },
    { name: "Pedicure Items", slug: "pedicure-items" },
    { name: "Tooth Gems", slug: "tooth-gems" },
    { name: "Practice Aids", slug: "practice-aids" },
    { name: "Liquid Cups", slug: "liquid-cups" },
    { name: "Press-On Supplies", slug: "press-on-supplies" },
    { name: "Hygiene Essentials", slug: "hygiene-essentials" },
    { name: "Acrylic Liquids", slug: "acrylic-liquids" },
    { name: "Airbrush", slug: "airbrush" },
    { name: "Phone Items", slug: "phone-items" },
  ];

  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="">
      <div className="flex items-start pt-4 lg:pt-8 gap-4 px-4 lg:px-[30px] font-poppins lg:bg-brand_gradient_darker lg:h-[20rem] rounded-b-[150px]">
        {/* Left Arrow */}
        <button onClick={() => scroll("left")} className="p-2 hidden lg:block">
          <ArrowRightIcon className="w-4 h-4 mt-3 rotate-180 text-white" />
        </button>

        {/* Scrollable Categories */}
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide  scroll-smooth flex-1"
        >
          {categories.map((category) => (
            <Link
              href={`/category/${category.slug}`}
              key={category.slug}
              className="whitespace-nowrap text-xs flex flex-col items-center opacity-80 hover:opacity-100 transition "
            >
              <div className="size-[3rem] rounded-full border flex items-center justify-center relative bg-white">
                <Image
                  src={NewArr}
                  alt=""
                  className="object-cover size-[2.4rem] absolute"
                  height={44}
                  width={44}
                />
              </div>
              <p className="mt-1 text-[10px] lg:text-base text-black lg:text-white">
                {category.name}
              </p>
            </Link>
          ))}
        </div>

        {/* Right Arrow */}
        <button
          onClick={() => scroll("right")}
          className="p-2 mt-3 hidden lg:block"
        >
          <ArrowRightIcon className="hidden lg:block w-4 h-4 text-white" />
        </button>
      </div>
    </div>
  );
};

export default Categories;
