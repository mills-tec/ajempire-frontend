"use client";
import { useUpdates } from "@/api/customHooks";
import { useAuthStore } from "@/lib/stores/auth-store";
import { updatesQueryKey } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { useState } from "react";
import NavDesktop from "./ui/NavDesktop";
import NavResponsive from "./ui/NavResponsive";

const Navbar = () => {
  const [showIntro, setShowIntro] = useState(false);


  // const [isLoggedIn, setIsLoggedIn] = useState(false);
  const pathname = usePathname();


  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/" ? "text-[#FF008C] opacity-100" : "opacity-70";
    }
    return pathname.startsWith(path)
      ? "text-[#FF008C] opacity-100"
      : "opacity-70";
  };

  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const { getFeeds } = useUpdates();
  const { data: latestUpdatesPage } = useQuery({
    queryKey: updatesQueryKey("all", ""),
    queryFn: () => getFeeds("all", ""),
  });
  const latestUpdateId = latestUpdatesPage?.data?.[0]?._id;

  return (
    <div className=" w-full text-[14px] font-poppins">
      <div className="hidden lg:flex">

        <NavDesktop
          isLoggedIn={isLoggedIn}
          isActive={isActive}
          showIntro={showIntro}
          setShowIntro={setShowIntro}
          updateId={latestUpdateId}
        />
      </div>

      <div className="flex lg:hidden ">
        <NavResponsive
          isLoggedIn={isLoggedIn}
          isActive={isActive}
          showIntro={showIntro}
          updateId={latestUpdateId}
          setShowIntro={setShowIntro}
        />
      </div>
    </div>
  );
};

export default Navbar;
