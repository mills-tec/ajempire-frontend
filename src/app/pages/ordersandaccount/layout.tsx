"use client";

import { useNotification } from "@/api/customHooks";
import ExploreInterest from "@/app/components/ExploreInterest";
import { getBearerToken } from "@/lib/api";
import { useNotificationStore } from "@/lib/stores/notification-store";
import dynamic from "next/dynamic";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";
import { SideBarItem, sidebarItems } from "./data/sidebarData";

// Desktop-only chrome (hidden lg:block) — split into its own chunk so mobile
// users don't download/parse/hydrate it as part of this layout's bundle.
const BreadCrumb = dynamic(() => import("./components/BreadCrumb"));
const SideNav = dynamic(() => import("./components/SideNav"));

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

  const activeItem = findActiveTitle(sidebarItems, pathname);
  const { setNotifications } = useNotificationStore();
  const { getNotifications } = useNotification();

  useEffect(() => {
    const token = getBearerToken();
    if (!token) {
      router.replace("/");
      return;
    }
    // setCheckingAuth(false);
  }, [router]);

  useEffect(() => {
    // if (checkingAuth) return;
    (async () => {
      const req = await getNotifications();
      setNotifications(req)
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
