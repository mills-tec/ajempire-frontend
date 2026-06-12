"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SideNav from "./components/SideNav";
import BreadCrumb from "./components/BreadCrumb";
import { usePathname } from "next/navigation";
import { SideBarItem, sidebarItems } from "./data/sidebarData";
import { useNotificationStore } from "@/lib/stores/notification-store";
import { useNotification } from "@/api/customHooks";
import ExploreInterest from "@/app/components/ExploreInterest";

import Spinner from "@/app/components/Spinner";
import { getBearerToken } from "@/lib/api";

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
  const [checkingAuth, setCheckingAuth] = useState(true);
  const activeItem = findActiveTitle(sidebarItems, pathname);
  const { setNotifications } = useNotificationStore();
  const { getNotifications } = useNotification();

  useEffect(() => {
    const token = getBearerToken();
    if (!token) {
      router.replace("/");
      return;
    }
    setCheckingAuth(false);
  }, [router]);

  useEffect(() => {
    const handleStart = () => setIsLoading(true);
    const handleComplete = () => setIsLoading(false);

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("a")) handleStart();
    };

    document.addEventListener("click", handleClick);

    handleComplete();
    const timeout = setTimeout(() => setIsLoading(false), 50);

    return () => {
      document.removeEventListener("click", handleClick);
      clearTimeout(timeout);
    };
  }, [pathname]);

  useEffect(() => {
    if (checkingAuth) return;
    (async () => {
      const req = await getNotifications();
      setNotifications(req);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkingAuth]);

  if (checkingAuth) return <Spinner />;

  return (
    <div className="relative ">
      <div className=" py-[20px] lg:bg-[#F9F9F9]  lg:px-4 h-auto bg-[#ffffff]">
        <main className="w-full flex ">
          <div className="w-[23%] hidden lg:block">
            <div className="hidden mb-2 lg:flex">
              <BreadCrumb activeItem={activeItem} />
            </div>
            <SideNav />
          </div>
          <div className="lg:w-[88%] w-full max-h-full lg:mb-10 lg:px-0">
            <div>{children}</div>
          </div>
        </main>
        <ExploreInterest />
      </div>
    </div>
  );
}
