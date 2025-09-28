"use client"
import { ArrowDown } from "@/components/svgs/ArrowDown";
import { CameraIcon } from "@/components/svgs/CameraIcon";
import { SearchIcon } from "@/components/svgs/SearchIcon";
import { UserIcon } from "@/components/svgs/UserIcon";
import { CartIcon } from "@/components/svgs/CartIcon";
import { SupportIcon } from "@/components/svgs/SupportIcon";
import Logo from "../../../src/assets/logo.png";
import { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import VideoIcon from "@/components/svgs/VideoIcon";
import IntroComp from "./auth-component/IntroComp"; import AuthWrapper from "./auth-component/AuthWrapper";
import SearchBar from "./ui/SearchBar";
``

const Navbar = () => {
    const [showIntro, setShowIntro] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const pathname = usePathname();
    const isActive = (path: string) =>
        pathname === path ? "text-[#FF008C]  opacity-100" : "opacity-80";

    return (
        <div className="w-full flex items-center gap-9 h-[100px] lg:px-[30px] text-[14px] font-poppins">
            {/* Logo */}
            <div className="hidden lg:flex lg:w-[10%]">
                <Link href="/" className="w-full">
                    <div className="mt-[-7px]">
                        <Image src={Logo} alt="logo" width={120} height={40} className="object-contain" />
                    </div>
                </Link>
            </div>
            <ul className="w-[100%] lg:w-[90%] flex items-center justify-between ">
                <li className="hidden lg:block">
                    <Link href="/" className={`opacity-80  ${isActive("/")}`}>
                        shop
                    </Link>
                </li>
                <li className=" lg:block">
                    <Link href="/pages/update" className={`flex items-center gap-1 opacity-80  ${isActive("/pages/update")}`}>
                        <VideoIcon className={`mt-[0.5px] w-[17px] font-bold`} />
                        <p>updates</p>
                    </Link>
                </li>
                <li className="w-[50%]">
                    <SearchBar />
                </li>
                <li className="">
                    {isLoggedIn ? (
                        <Link
                            href="/pages/ordersandaccount"
                            className="flex items-center gap-1 text-[12.8px] opacity-80"
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
                            className="flex items-center gap-1 text-[12.8px] opacity-80"
                        >
                            <UserIcon className="w-8" />
                            <div>
                                <p>Orders &</p>
                                <p className="mt-[-5px]">Account</p>
                            </div>
                        </button>
                    )}

                    {showIntro && <AuthWrapper onClose={() => setShowIntro(false)} />}
                </li>
                <li>
                    <Link href="/pages/support" className={`flex items-center gap-1 opacity-80  ${isActive("/pages/support")}`}>
                        <SupportIcon className="w-8" />
                        Support
                    </Link>
                </li>
                <li>
                    <Link href="/pages/cart" className={`flex items-center gap-1 opacity-80  ${isActive("/pages/cart")}`}>
                        <CartIcon className="w-8 opacity-60" />
                    </Link>
                </li>
            </ul>
        </div>
    );
};

export default Navbar;