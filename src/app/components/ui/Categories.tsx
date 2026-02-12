"use client";
import { useRef } from "react";
import Link from "next/link";
import ArrowRightIcon from "@/components/svgs/ArrowRightIcon";
import Image from "next/image";
import NewArr from "@/assets/newarr.png";
import { useQuery } from "@tanstack/react-query";
import { getCategories } from "@/lib/api";
import { Category } from "@/lib/types";

const Categories = () => {
  const { data, isLoading } = useQuery<{ message: Category[] }>({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  console.log("categories: ", data);
  // const categories = [
  //   { name: "Gel Polishes", slug: "gel-polishes" },
  //   { name: "Nail Decorations", slug: "nail-decorations" },
  //   { name: "Prep Solutions", slug: "prep-solutions" },
  //   { name: "Removers", slug: "removers" },
  //   { name: "Nail Tools", slug: "nail-tools" },
  //   { name: "Artificial Nails", slug: "artificial-nails" },
  //   { name: "Acrylic Powders", slug: "acrylic-powders" },
  //   { name: "Filing Tools", slug: "filing-tools" },
  //   { name: "Nail Drills", slug: "nail-drills" },
  //   { name: "Lamps", slug: "lamps" },
  //   { name: "Storage Items", slug: "storage-items" },
  //   { name: "Workstation Gear", slug: "workstation-gear" },
  //   { name: "Adhesives", slug: "adhesives" },
  //   { name: "Pedicure Items", slug: "pedicure-items" },
  //   { name: "Tooth Gems", slug: "tooth-gems" },
  //   { name: "Practice Aids", slug: "practice-aids" },
  //   { name: "Liquid Cups", slug: "liquid-cups" },
  //   { name: "Press-On Supplies", slug: "press-on-supplies" },
  //   { name: "Hygiene Essentials", slug: "hygiene-essentials" },
  //   { name: "Acrylic Liquids", slug: "acrylic-liquids" },
  //   { name: "Airbrush", slug: "airbrush" },
  //   { name: "Phone Items", slug: "phone-items" },
  // ];

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
    <div className="lg:pt-4">
      <div className="flex items-center gap-2">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14.4885 10.125H11.5823C11.197 10.1246 10.8273 10.277 10.5543 10.5488C10.2813 10.8205 10.1271 11.1895 10.1258 11.5748V14.481C10.1256 14.6723 10.1631 14.8618 10.2362 15.0386C10.3093 15.2154 10.4166 15.3761 10.5519 15.5113C10.6872 15.6466 10.8478 15.7539 11.0246 15.827C11.2014 15.9002 11.3909 15.9377 11.5823 15.9375H14.4885C14.8736 15.9359 15.2424 15.7817 15.514 15.5087C15.7856 15.2357 15.9379 14.8661 15.9375 14.481V11.5748C15.9377 11.3844 15.9004 11.1959 15.8276 11.02C15.7549 10.8441 15.6481 10.6843 15.5135 10.5497C15.3789 10.4151 15.2191 10.3084 15.0432 10.2356C14.8674 10.1629 14.6788 10.1256 14.4885 10.1258M6.41775 10.125H3.5115C3.12645 10.1272 2.7579 10.2817 2.4864 10.5547C2.21489 10.8278 2.06249 11.1972 2.0625 11.5823V14.4885C2.0623 14.6788 2.09965 14.8674 2.1724 15.0432C2.24515 15.2191 2.35187 15.3789 2.48646 15.5135C2.62105 15.6481 2.78087 15.7549 2.95676 15.8276C3.13265 15.9004 3.32116 15.9377 3.5115 15.9375H6.41775C6.80286 15.9379 7.17243 15.7856 7.44544 15.514C7.71846 15.2424 7.87266 14.8736 7.87425 14.4885V11.5823C7.87445 11.3909 7.83691 11.2014 7.76378 11.0246C7.69066 10.8478 7.58338 10.6872 7.44809 10.5519C7.3128 10.4166 7.15216 10.3093 6.97536 10.2362C6.79856 10.1631 6.60908 10.1256 6.41775 10.1258M6.41775 2.0625H3.5115C3.32116 2.0623 3.13265 2.09965 2.95676 2.1724C2.78087 2.24515 2.62105 2.35187 2.48646 2.48646C2.35187 2.62105 2.24515 2.78087 2.1724 2.95676C2.09965 3.13265 2.0623 3.32116 2.0625 3.5115V6.41775C2.0621 6.80286 2.2144 7.17243 2.48601 7.44544C2.75762 7.71846 3.12639 7.87266 3.5115 7.87425H6.41775C6.60908 7.87445 6.79856 7.83691 6.97536 7.76378C7.15216 7.69066 7.3128 7.58338 7.44809 7.44809C7.58338 7.3128 7.69066 7.15216 7.76378 6.97536C7.83691 6.79856 7.87445 6.60908 7.87425 6.41775V3.5115C7.87266 3.12639 7.71846 2.75762 7.44544 2.48601C7.17243 2.2144 6.80286 2.0621 6.41775 2.0625ZM14.4885 2.0625H11.5823C11.1971 2.0621 10.8276 2.2144 10.5546 2.48601C10.2815 2.75762 10.1273 3.12639 10.1258 3.5115V6.41775C10.1259 6.80398 10.2795 7.17433 10.5526 7.44743C10.8257 7.72054 11.196 7.87405 11.5823 7.87425H14.4885C14.8736 7.87266 15.2424 7.71846 15.514 7.44544C15.7856 7.17243 15.9379 6.80286 15.9375 6.41775V3.5115C15.9377 3.32116 15.9004 3.13265 15.8276 2.95676C15.7549 2.78087 15.6481 2.62105 15.5135 2.48646C15.3789 2.35187 15.2191 2.24515 15.0432 2.1724C14.8674 2.09965 14.6788 2.0623 14.4885 2.0625Z" stroke="#303030" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <p className="text-[16px] font-poppins font-medium">Categories</p>
      </div>
      {data && data.message && (
        <div className="flex items-start  pt-4  gap-4 px-4 lg:px-[30px] font-poppins">
          {/* Left Arrow */}
          <button
            onClick={() => scroll("left")}
            className="p-2 hidden lg:block"
          >
            <ArrowRightIcon className="w-4 h-4 mt-3 rotate-180 text-black" />
          </button>

          {/* Scrollable Categories */}
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto scrollbar-hide justify-between  scroll-smooth flex-1"
          >
            {data.message.map((category) => (
              <Link
                href={`/category/${category.name}`}
                key={category._id}
                className="whitespace-nowrap text-xs flex flex-col items-center opacity-80 hover:opacity-100 transition "
              >
                <div className="size-[3rem] rounded-full border flex items-center justify-center object-cover relative bg-white">
                  <Image
                    src={category.image}
                    alt=""
                    className="object-cover size-full absolute rounded-full"
                    height={44}
                    width={44}
                  />
                </div>
                <p className="mt-1 text-[10px] lg:text-base text-black capitalize ">
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
            <ArrowRightIcon className="hidden lg:block w-4 h-4 text-black" />
          </button>
        </div>
      )}
    </div>
  );
};

export default Categories;
