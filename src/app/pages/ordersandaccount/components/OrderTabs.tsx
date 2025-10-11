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
        <div className="">
            <div className="lg:hidden flex items-center px-4 mb-[20px]">
                <Link href={"/pages/ordersandaccount"}>
                    <svg width="9" height="17" viewBox="0 0 9 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8.78122 15.2198C8.8509 15.2895 8.90617 15.3722 8.94388 15.4632C8.9816 15.5543 9.00101 15.6519 9.00101 15.7504C9.00101 15.849 8.9816 15.9465 8.94388 16.0376C8.90617 16.1286 8.8509 16.2114 8.78122 16.281C8.71153 16.3507 8.62881 16.406 8.53776 16.4437C8.44672 16.4814 8.34914 16.5008 8.25059 16.5008C8.15204 16.5008 8.05446 16.4814 7.96342 16.4437C7.87237 16.406 7.78965 16.3507 7.71996 16.281L0.219965 8.78104C0.150232 8.71139 0.0949136 8.62867 0.0571704 8.53762C0.0194272 8.44657 0 8.34898 0 8.25042C0 8.15186 0.0194272 8.05426 0.0571704 7.96321C0.0949136 7.87216 0.150232 7.78945 0.219965 7.71979L7.71996 0.219792C7.8607 0.0790615 8.05157 -3.92322e-09 8.25059 0C8.44961 3.92322e-09 8.64048 0.0790615 8.78122 0.219792C8.92195 0.360523 9.00101 0.551394 9.00101 0.750417C9.00101 0.94944 8.92195 1.14031 8.78122 1.28104L1.8109 8.25042L8.78122 15.2198Z" fill="black" />
                    </svg>
                </Link>
                <div className=" w-full text-center font-semibold text-black/70">
                    <p>Your Oders</p>
                </div>

            </div>
            <ul className="lg:w-full flex items-center lg:justify-between justify-around font-poppins lg:text-[14px] text-[12px]">
                {tabs.map((tab) => (
                    <li key={tab.path}>
                        <Link
                            href={tab.path}
                            className={`relative pb-2 transition-colors lg:mr-6  duration-200 ${pathname === tab.path
                                ? "text-primary"
                                : "text-[#525252] hover:text-primary"
                                }`}>
                            {tab.name}
                            {pathname === tab.path && (
                                <span className=" absolute lg:left-8 left-7 -translate-x-1/2  bottom-0 w-7 border-b-4 border-primaryhover rounded-full"></span>
                            )}
                        </Link>

                    </li>
                ))}

                <li className="hidden lg:block">
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
