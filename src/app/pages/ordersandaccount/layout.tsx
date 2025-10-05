"use client"

import { ReactNode } from "react";
import SideNav from "./components/SideNav";
import BreadCrumb from "./components/BreadCrumb";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { SideBarItem, sidebarItems } from "./data/sidebarData";

interface LayoutProps {
    children: ReactNode;
}
function findActiveTitle(items: SideBarItem[], pathname: string): string {
    for (const item of items) {
        if (item.route === pathname) {
            return item.title;
        }
        if (item.children) {
            const childTitle = findActiveTitle(item.children, pathname);
            if (childTitle) return childTitle;
        }
    }
    return "";
}

export default function Layout({ children }: LayoutProps) {
    const pathname = usePathname();
    const activeItem = findActiveTitle(sidebarItems, pathname);

    return (
        <div className="px-[30px] bg-[#F9F9F9] py-[30px]">
            <div>
                <div className="hidden mb-2 lg:flex">
                    <BreadCrumb activeItem={activeItem} />
                </div>
            </div>
            <main className="w-full flex py-1">
                <div className="w-[23%] hidden lg:block">
                    <SideNav />
                </div>
                <div className="w-[88%]">
                    {children}
                </div>
            </main>
        </div>
    );
}
