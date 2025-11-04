"use client";

import { ReactNode, useEffect, useState } from "react";
import SideNav from "./components/SideNav";
import BreadCrumb from "./components/BreadCrumb";
import { usePathname, useRouter } from "next/navigation";
import { SideBarItem, sidebarItems } from "./data/sidebarData";
import Spinner from "@/app/components/Spinner"; // Import your Spinner component
import { ToastContainer } from "react-toastify";

interface LayoutProps {
  children: ReactNode;
}

function findActiveTitle(items: SideBarItem[], pathname: string): string {
  for (const item of items) {
    if (item.route === pathname) return item.title;
    if (item.children) {
      const childTitle = findActiveTitle(item.children, pathname);
      if (childTitle) return childTitle;
    }
  }
  return "";
}

export default function Layout({ children }: LayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const activeItem = findActiveTitle(sidebarItems, pathname);

  useEffect(() => {
    const handleStart = () => setIsLoading(true);
    const handleComplete = () => setIsLoading(false);

    // When a link is clicked, start loading
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("a")) handleStart();
    };

    // Add listener for clicks
    document.addEventListener("click", handleClick);

    // Turn off spinner when pathname changes
    handleComplete();
    const timeout = setTimeout(() => setIsLoading(false), 50);

    return () => {
      document.removeEventListener("click", handleClick);
      clearTimeout(timeout);
    };
  }, [pathname]);

  return (
    <div className="relative">

      <div className=" py-[20px] lg:bg-[#F9F9F9] lg:py-[30px] lg:px-4 h-auto bg-[#ffffff]">
        <div>
          <div className="hidden mb-2 lg:flex">
            <BreadCrumb activeItem={activeItem} />
          </div>
        </div>

        <main className="w-full flex py-1">
          <div className="w-[23%] hidden lg:block">
            <SideNav />
          </div>
          <div className="lg:w-[88%] w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
