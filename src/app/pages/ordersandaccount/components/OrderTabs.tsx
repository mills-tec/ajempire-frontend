"use client"
import { SearchIcon } from "@/components/svgs/SearchIcon";
import Link from "../../../../../node_modules/next/link";
import { useRef } from "react";
import { usePathname } from "../../../../../node_modules/next/navigation";

export default function OrderTabs() {
    const pathname = usePathname();
    const inputRef = useRef<HTMLInputElement>(null);

    const handleSearchClick = () => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    const tabs = [
        { name: "All Orders", path: "/pages/ordersandaccount/orders/all" },
        { name: "Processing", path: "/pages/ordersandaccount/orders/processing" },
        { name: "Shipping", path: "/pages/ordersandaccount/orders/shipping" },
        { name: "Delivered", path: "/pages/ordersandaccount/orders/delivered" },
        { name: "Reviews", path: "/pages/ordersandaccount/orders/reviews" },
    ];

    return (
        <div className="hidden lg:block">
            <ul className="w-full flex items-center justify-around font-poppins text-[14px]">
                {tabs.map((tab) => (
                    <li key={tab.path}>
                        <Link
                            href={tab.path}
                            className={`relative pb-2 transition-colors mr-6 duration-200 ${pathname === tab.path
                                ? "text-primary"
                                : "text-[#525252] hover:text-primary"
                                }`}>
                            {tab.name}
                            {pathname === tab.path && (
                                <span className=" absolute left-8 -translate-x-1/2  bottom-0 w-7 border-b-4 border-primaryhover rounded-full"></span>
                            )}
                        </Link>

                    </li>
                ))}

                <li className="">
                    <div className="w-full flex gap-2 items-center border rounded-full h-[40px] px-[14px] focus-within:border-brand_solid_gradient transition-all duration-200 bg-white">
                        <input
                            type="text"
                            className="w-full outline-none bg-transparent placeholder:text-[13px] opacity-80 text-[14px]"
                            placeholder="Search Product"
                            ref={inputRef}
                        />
                        <div onClick={handleSearchClick}>
                            <SearchIcon className="w-5 text-primaryhover" />
                        </div>
                    </div>
                </li>
            </ul>
        </div>
    );
}
