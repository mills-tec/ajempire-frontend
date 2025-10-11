"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

type SideBarItem = {
    title: string;
    route?: string;
    icon?: React.ReactNode;
    children?: SideBarItem[];
};

type SideBarCompProps = {
    items: SideBarItem[];
};

const SideBarComp = ({ items }: SideBarCompProps) => {
    const [openRoute, setOpenRoute] = useState<string | null>(null);
    const pathname = usePathname();
    const router = useRouter();

    // Automatically open the parent that matches current pathname
    useEffect(() => {
        const foundParent = items.find(
            (item) =>
                (item.route && pathname.startsWith(item.route)) ||
                (item.children &&
                    item.children.some((child) =>
                        pathname.startsWith(child.route ?? "")
                    ))
        );
        setOpenRoute(foundParent?.route ?? null);
    }, [pathname, items]);

    const handleParentClick = (e: React.MouseEvent, item: SideBarItem) => {
        e.preventDefault();
        if (openRoute === item.route) {
            // toggle close
            setOpenRoute(null);
        } else {
            // open and navigate
            setOpenRoute(item.route ?? null);
            if (item.route) router.push(item.route);
        }
    };

    return (<div className="w-64 p-4 font-poppins text-[14px]"> <ul className="space-y-3">
        {items.map((item) => (<li key={item.title}>
            {item.children ? (<div>
                <Link href={item.route ?? "#"} onClick={(e) => handleParentClick(e, item)}>
                    <div
                        className={`flex w-full justify-between items-center p-2 rounded-md cursor-pointer transition-all duration-300 ${openRoute === item.route
                            ? "bg-[#F9F9F9]"
                            : "bg-white hover:bg-pink-50"
                            }`}
                    > <span className="flex items-center gap-3">
                            {item.icon} {item.title} </span> <span>
                            {openRoute === item.route ? (<svg
                                width="11"
                                height="10"
                                viewBox="0 0 14 10"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            > <path
                                    d="M2.58942 3.20312L6.7742 7.5L10.959 3.20312"
                                    stroke="black"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                /> </svg>
                            ) : (<svg
                                width="12"
                                height="10"
                                viewBox="0 0 16 12"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            > <path
                                    d="M3.49905 7.56585L7.90298 3.49388L11.8572 8.00388"
                                    stroke="black"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                /> </svg>
                            )} </span> </div> </Link>


                {openRoute === item.route && (
                    <ul className="ml-4 mt-1 space-y-1">
                        {item.children.map((child) => (
                            <li key={child.title}>
                                <Link
                                    href={child.route || "#"}
                                    className={`block text-[13px] p-2 px-6 rounded-md transition-all duration-300 ${pathname === child.route
                                        ? "bg-[#FFD9EE] text-[#525252]"
                                        : "hover:bg-pink-50 text-[#525252]"
                                        }`}
                                >
                                    {child.title}
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            ) : (
                <Link
                    href={item.route || "#"}
                    onClick={() => setOpenRoute(item.route ?? null)}
                    className={`p-2 rounded-md flex items-center gap-3 transition-all duration-300 ${openRoute === item.route
                        ? "bg-[#F9F9F9] hover:bg-[#FFD9EE]"
                        : "bg-white hover:bg-pink-50"
                        }`}
                >
                    {item.icon} {item.title}
                </Link>
            )}
        </li>
        ))}
    </ul>
    </div>
    );
};

export default SideBarComp;
