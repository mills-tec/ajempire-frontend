"use client"
import { CameraIcon } from "@/components/svgs/CameraIcon"
import { CameraSnap } from "@/components/svgs/CameraSnap"
import { SearchIcon } from "@/components/svgs/SearchIcon"
import { SupportIcon } from "@/components/svgs/SupportIcon"
import { useRef } from "react"

const SearchBar = () => {
    const inputRef = useRef<HTMLInputElement>(null);
    const handleSearchClick = () => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };
    return (
        <div className="w-full flex gap-2 items-center border border-gradientmix  rounded-full  h-[40px] px-[14px] ">

            <input type="text" className="w-full outline-none bg-transparent placeholder:text-[13px] opacity-80 text-[14px]" placeholder="Search Product" ref={inputRef} />
            <div className="">
                <div className="hidden lg:block">
                    <CameraIcon className="w-6" />
                </div>
                <CameraSnap className="w-6 lg:hidden" />
            </div>

            <div className="bg-brand_gradient_dark w-[50px] h-[30px] flex items-center justify-center  rounded-[20px]" onClick={handleSearchClick}>
                <SearchIcon className="w-5 text-[#FFFFFF]" />
            </div>
        </div>
    )
}

export default SearchBar;