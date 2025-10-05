"use client"
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

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

    // Auto-open parent if pathname matches its route or a child’s route
    useEffect(() => {
        items.forEach((item) => {
            if (item.route && pathname.startsWith(item.route)) {
                setOpenRoute(item.route);
            }
            if (
                item.children &&
                item.children.some((child) => pathname.startsWith(child.route ?? ""))
            ) {
                setOpenRoute(item.route ?? null);
            }
        });
    }, [pathname, items]);

    const toggleDropdown = (route?: string) => {
        setOpenRoute(openRoute === route ? null : route ?? null);
    };

    return (
        <div className="w-64 p-4 font-poppins text-[14px]">
            <ul className="space-y-2">
                {items.map((item) => (
                    <li key={item.title}>
                        {item.children ? (
                            <div>
                                <Link href={item.route ?? "#"}>
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault(); // prevent Link from firing first
                                            toggleDropdown(item.route);
                                        }}
                                        className={`flex w-full justify-between items-center p-2 rounded-md ${openRoute === item.route ? "bg-[#F9F9F9]" : "bg-white"
                                            } transition-all duration-300`}
                                    >
                                        <span className="flex items-center gap-3">
                                            {item.icon}
                                            {item.title}
                                        </span>
                                        <span>{openRoute === item.route ? "-" : "+"}</span>
                                    </button>
                                </Link>

                                {openRoute === item.route && (
                                    <ul className="ml-4 mt-1 space-y-1">
                                        {item.children.map((child) => (
                                            <li key={child.title}>
                                                <Link
                                                    href={child.route || "#"}
                                                    className={`block p-2 px-6 rounded-md transition-all duration-300 ${pathname === child.route
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
                                {item.icon}
                                {item.title}
                            </Link>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default SideBarComp;
