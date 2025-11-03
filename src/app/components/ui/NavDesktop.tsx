"use client";
import Link from "../../../../node_modules/next/link";
import Image from "../../../../node_modules/next/image";
import { useState, useRef } from "react";

import VideoIcon from "@/components/svgs/VideoIcon";
import { UserIcon } from "@/components/svgs/UserIcon";
import { SupportIcon } from "@/components/svgs/SupportIcon";
import { CartIcon } from "@/components/svgs/CartIcon";
import Logo from "@/assets/logo.png";

import AuthWrapper from "../auth-component/AuthWrapper";
import SearchBar from "./SearchBar";
import Userpopup from "./Userpopup";
import { useCartStore } from "@/lib/stores/cart-store";
import { motion, AnimatePresence } from 'framer-motion';


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
    const { items } = useCartStore();
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [showDropdown, setShowDropdown] = useState(false);

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
    return (
        <div className="w-full flex items-center gap-9 h-[100px] lg:px-[30px] text-[14px] font-poppins">
            {/* Logo */}
            <div className="hidden lg:flex lg:w-[10%]">
                <Link href="/" className="w-full">
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
                    <Link href="/" className={`opacity-80 ${isActive("/")} hover:text-[#FF008C] transition-all duration-300`}>
                        shop
                    </Link>
                </li>

                <li className="lg:block">
                    <Link
                        href="/pages/update"
                        className={`flex items-center gap-1 opacity-80 ${isActive("/pages/update")} hover:text-[#FF008C] transition-all duration-300`}
                    >
                        <VideoIcon className="mt-[0.5px] w-[17px] font-bold" />
                        <p>updates</p>
                    </Link>
                </li>

                <li className="w-[50%]">
                    <SearchBar />
                </li>

                <li>
                    <div className=" "
                    >
                        {isLoggedIn ? (
                            <Link
                                href="/pages/ordersandaccount"
                                className={`flex items-center gap-1 opacity-80 ${isActive("/pages/ordersandaccount")} hover:text-[#FF008C] transition-all duration-300`}
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
                        {
                            isLoggedIn && showDropdown &&
                            <AnimatePresence>
                                <motion.div
                                    key="userpopup"
                                    variants={stepVariants}
                                    initial="initial"
                                    animate="animate"
                                    exit="exit"
                                    onMouseEnter={cancelCloseTimer}
                                    onMouseLeave={startCloseTimer}
                                    className={`absolute right-8 top-[4.4rem]  duration-500 ease-out transform origin-top-right `} >
                                    <Userpopup />
                                </motion.div>
                            </AnimatePresence>
                        }
                    </div>
                    {showIntro && <AuthWrapper onClose={() => setShowIntro(false)} />}
                </li>

                <li>
                    <Link
                        href="/pages/support"
                        className={`flex items-center gap-1 opacity-80 ${isActive("/pages/support")} hover:text-[#FF008C] transition-all duration-300`}
                    >
                        <SupportIcon className="w-8" />
                        Support
                    </Link>
                </li>

                <li>
                    <Link
                        href="/pages/cart"
                        className={`flex items-center gap-1 opacity-80 ${isActive("/pages/cart")} hover:text-[#FF008C] transition-all duration-300`}
                    >
                        <CartIcon className="w-8 opacity-60" />
                    </Link>
                </li>
            </ul>
        </div>
    );
};

export default NavDesktop;
