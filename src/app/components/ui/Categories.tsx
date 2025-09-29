"use client";
import { useRef } from "react";
import Link from "next/link";
import ArrowRightIcon from "@/components/svgs/ArrowRightIcon"

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
        <div className="flex items-center gap-4 px-[30px] font-poppins">
            {/* Left Arrow */}
            <button onClick={() => scroll("left")} className="p-2">
                <ArrowRightIcon className="w-4 h-4 rotate-180 text-gray-600" />
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
                        className="whitespace-nowrap text-[14px] opacity-80 hover:opacity-100 transition "
                    >
                        {category.name}
                    </Link>
                ))}
            </div>

            {/* Right Arrow */}
            <button onClick={() => scroll("right")} className="p-2">
                <ArrowRightIcon className="w-4 h-4 text-gray-600" />
            </button>
        </div>
    );
};

export default Categories;
