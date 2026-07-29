"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import Logo from "@/assets/logo.png";
import { CartIcon } from "@/components/svgs/CartIcon";
import { SupportIcon } from "@/components/svgs/SupportIcon";
import { UserIcon } from "@/components/svgs/UserIcon";
import VideoIcon from "@/components/svgs/VideoIcon";

import { useCartIcon } from "@/app/contextanimation/CartIconContext";
import { getUpdates } from "@/lib/api";
import { useSearchStore } from "@/lib/search-store";
import { useCartStore } from "@/lib/stores/cart-store";
import { AnimatePresence, motion } from "framer-motion";
import AuthWrapper from "../auth-component/AuthWrapper";
import SearchBar from "./SearchBar";
import Userpopup from "./Userpopup";

type NavDesktopProps = {
  isLoggedIn: boolean;
  isActive: (path: string) => string;
  showIntro: boolean;
  setShowIntro: (val: boolean) => void;
};

const NavDesktop: React.FC<NavDesktopProps> = ({
  isLoggedIn,
  isActive,
  showIntro,
  setShowIntro,
}) => {
  // Selector — whole-store destructure re-rendered the nav on every cart
  // store mutation (selectedItem, checkout step, logistics, ...).
  const items = useCartStore((s) => s.items);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [href, setHref] = useState<string | undefined>("");
  const [showDropdown, setShowDropdown] = useState(false);
  const { cartRef } = useCartIcon();

  const startCloseTimer = () => {
    timeoutRef.current = setTimeout(() => {
      setShowDropdown(false);
    }, 300); // 5 seconds
  };

  const cancelCloseTimer = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };
  const stepVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.4, delay: 0.1 } },
    exit: { opacity: 0, transition: { duration: 0.3 } },
  };

  const { clearSearch } = useSearchStore();

  useEffect(() => {
    (async () => {
      // Only the id of the single most recent update is used (to build the
      // "updates" nav link) — this used to request a full ITEMS_TO_APPEND
      // (10-item) feed page, each with its own media/likes/comments/product
      // payload, just to read data[0]._id. limit=1 asks for exactly what's
      // used.
      const req = await getUpdates("all", "", 1);
      setHref(req?.data[0]?._id)
    })()
  }, [])
  return (
    <div className="w-full flex items-center gap-9 h-[100px] lg:px-[30px] text-[14px] font-poppins">
      {/* Logo */}
      <div className="hidden lg:flex lg:w-[10%]">
        <Link href="/" className="w-full" onClick={clearSearch}>
          <div className="mt-[-7px]">
            <Image
              src={Logo}
              alt="logo"
              width={120}
              height={40}
              className="object-contain"
            />
          </div>
        </Link>
      </div>

      <ul className="hidden w-[100%] lg:w-[90%] lg:flex items-center justify-between">
        <li className="hidden lg:block">
          <Link
            href="/"
            className={`opacity-80 ${isActive(
              "/",
            )} hover:text-[#FF008C] transition-all duration-300`}
            onClick={clearSearch}
          >
            shop
          </Link>
        </li>

        <li className="lg:block">
          <Link
            href={"/pages/update/all/" + href}
            className={`flex items-center gap-1 opacity-80 ${isActive(
              "/pages/update",
            )} hover:text-[#FF008C] transition-all duration-300`}
          >
            <VideoIcon className="mt-[0.5px] w-[17px] font-bold" />
            <p>updates</p>
          </Link>
        </li>

        <li className="w-[50%]">
          <SearchBar />
        </li>

        <li>
          <div className=" ">
            {isLoggedIn ? (
              <Link
                href="/pages/ordersandaccount/orders/all"
                className={`flex items-center gap-1 opacity-80 ${isActive(
                  "/pages/ordersandaccount",
                )} hover:text-[#FF008C] transition-all duration-300`}
                onMouseEnter={() => {
                  cancelCloseTimer();
                  setShowDropdown(true);
                }}
                onMouseLeave={startCloseTimer}
              >
                <UserIcon className="w-8" />
                <div>
                  <p>Orders &</p>
                  <p className="mt-[-5px]">Account</p>
                </div>
              </Link>
            ) : (
              <button
                onClick={() => setShowIntro(true)}
                className="flex items-center gap-1 text-[12.8px] opacity-80 hover:text-[#FF008C] transition-all duration-300"
              >
                <UserIcon className="w-8" />
                <div>
                  <p>Sign Up</p>
                </div>
              </button>
            )}
            {isLoggedIn && showDropdown && (
              <AnimatePresence>
                <motion.div
                  key="userpopup"
                  variants={stepVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  onMouseEnter={cancelCloseTimer}
                  onMouseLeave={startCloseTimer}
                  className={`absolute right-8 top-[4.4rem]  duration-500 ease-out transform origin-top-right `}
                >
                  <Userpopup />
                </motion.div>
              </AnimatePresence>
            )}
          </div>
          {showIntro && <AuthWrapper onClose={() => setShowIntro(false)} />}
        </li>

        <li>
          <Link
            href="/pages/support"
            className={`flex items-center gap-1 opacity-80 ${isActive(
              "/pages/support",
            )} hover:text-[#FF008C] transition-all duration-300`}
          >
            <SupportIcon className="w-8" />
            Support
          </Link>
        </li>

        <li>
          <Link
            href="/pages/cart"
            className={`flex items-center gap-1 relative opacity-80 ${isActive(
              "/pages/cart",
            )} hover:text-[#FF008C] transition-all duration-300`}
            ref={cartRef}
          >
            {items && (
              <div className="absolute size-4 rounded-full left-5 bottom-5 z-10 bg-brand_pink text-white text-xs font-semibold flex items-center justify-center">
                <p>{items.length}</p>
              </div>
            )}
            <CartIcon className="w-8 opacity-60" />
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default NavDesktop;
