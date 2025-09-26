"use client"
import { ArrowDown } from "../svgs/ArrowDown";
import { CameraIcon } from "../svgs/CameraIcon";
import { SearchIcon } from "../svgs/SearchIcon";
import { UserIcon } from "../svgs/UserIcon";
import { CartIcon } from "../svgs/CartIcon";
import { SupportIcon } from "../svgs/SupportIcon";
import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const Navbar = () => {
    const pathname = usePathname();
    const isActive = (path: string) =>
        pathname === path ? "text-[#FF008C] font-semibold opacity-100" : "opacity-80";


    const handleSearchClick = () => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };
    const inputRef = useRef<HTMLInputElement>(null);
    return (
        <div className="w-full flex items-center gap-9 h-[100px] px-[30px] text-[14px] font-poppins">
            {/* Logo */}
            <div className="w-[10%]">
                <Link href="/" className="w-full">
                    <div className="mt-[-7px]">
                        <Image src="/aj-gredientlogo.png" alt="logo" width={120} height={40} className="object-contain" />
                    </div>
                </Link>
            </div>
            <ul className="w-[90%] flex items-center justify-between ">
                <li>
                    <Link href="/" className="opacity-80">
                        shop
                    </Link>
                </li>
                <li>
                    <Link href="#" className="flex items-center gap-2 opacity-80">
                        <p>categories</p>
                        <ArrowDown size={14} className="mt-[0.5px]" />
                    </Link>
                </li>
                <li>
                    <div className="w-[470px] flex gap-2 items-center border border-gradientmix  rounded-full  h-[40px] px-[14px] ">
                        <input type="text" className="w-full outline-none bg-transparent placeholder:text-[13px] opacity-80 text-[14px]" placeholder="Search Product" ref={inputRef} />
                        <CameraIcon className="w-6" />

                        <div className="bg-brand_gradient_dark w-[50px] h-[30px] flex items-center justify-center  rounded-[20px]" onClick={handleSearchClick}>
                            <SearchIcon className="w-5 text-[#FFFFFF]" />
                        </div>
                    </div>
                </li>
                <li>
                    <Link href="" className="flex items-center gap-1 text-[12.8px] opacity-80">
                        <UserIcon className="w-8" />
                        <div>
                            <p>Orders &</p>
                            <p className="mt-[-5px]">Account</p>
                        </div>
                    </Link>
                </li>
                <li>
                    <Link href="" className="flex items-center gap-1 opacity-80">
                        <SupportIcon className="w-8" />
                        Support
                    </Link>
                </li>
                <li>
                    <Link href="">
                        <CartIcon className="w-8 opacity-60" />
                    </Link>
                </li>
            </ul>

        </div>
    );
};

export default Navbar;