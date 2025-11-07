"use client";
import { useEffect, useState } from "react";
import { useEffect, useState } from "react";
import { usePathname } from "../../../node_modules/next/navigation";
import NavDesktop from "./ui/NavDesktop";
import NavResponsive from "./ui/NavResponsive";
import { useAuthStore } from "@/lib/stores/auth-store";

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

  const { isLoggedIn } = useAuthStore();

  return (
    <div className=" w-full text-[14px] font-poppins">
      <div className="hidden lg:flex">
        <NavDesktop
          isLoggedIn={isLoggedIn}
          isActive={isActive}
          showIntro={showIntro}
          setShowIntro={setShowIntro}
        />
      </div>
      <div className="flex lg:hidden ">
        <NavResponsive
          isLoggedIn={isLoggedIn}
          isActive={isActive}
          showIntro={showIntro}
          setShowIntro={setShowIntro}
        />
      </div>
    </div>
  );
};

export default Navbar;
