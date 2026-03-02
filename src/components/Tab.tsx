"use client";
import { SearchIcon } from "@/components/svgs/SearchIcon";

import MobileHeader from "@/components/MobileHeader";
import { usePathname } from "next/navigation";
import { useRouter } from "next/router";
import Link from "next/link";

export default function Tabs({
    handleSearchInputChange,
    text,
    showFilterTabs = true,
    tabs
}: {
    handleSearchInputChange: (value: string) => void;
    text: string;
    showFilterTabs?: boolean;
    tabs: { name: string; path: string; includes: string }[]
}) {
    const pathname = usePathname();

    const router = useRouter();
    return (
        <div className="mb-5">
            <MobileHeader text={text} handleBack={() => router.back()} />
            {showFilterTabs && <ul className="lg:w-full flex items-center lg:justify-between justify-around font-poppins lg:text-[14px] text-[12px]">
                {tabs.map((tab) => (
                    <li key={tab.includes}>
                        <Link
                            href={tab.path}
                            className={`relative pb-2 transition-colors lg:mr-6  duration-200 ${pathname.includes(tab.includes)
                                ? "text-primary"
                                : "text-[#525252] hover:text-primary"
                                }`}
                        >
                            {tab.name}
                            {pathname.includes(tab.includes) && (
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
                            placeholder=" Product Name/Order Id"
                            onChange={(e) => {
                                handleSearchInputChange(e.target.value);
                            }}
                        />
                        <div>
                            <SearchIcon className="w-5 text-primaryhover" />
                        </div>
                    </div>
                </li>
            </ul>}
        </div>
    );
}
