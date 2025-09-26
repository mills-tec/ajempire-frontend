import Image from "next/image";
import React from "react";
import { IoIosSearch } from "react-icons/io";
import { MdKeyboardArrowDown } from "react-icons/md";
import { FaRegUserCircle } from "react-icons/fa";
import { BsChatDots } from "react-icons/bs";
import { FiShoppingCart } from "react-icons/fi";

// internal imports
import CameraSVGIcon from "./components/CameraSVG";

type Props = {};

const Navbar = (props: Props) => {
  return (
    <div className="flex md:grid grid-cols-3 gap-3 p-4 items-center">
      {/* Left section */}
      <div className="hidden md:grid grid-cols-3 gap-2 place-items-center">
        <Image
          src={"/assets/logo-light.png"}
          alt="logo"
          width={150}
          height={100}
          quality={100}
        />
        <p className="hover:cursor-pointer hover:text-highlight font-medium">
          Shop
        </p>
        <p className="flex items-center font-medium hover:cursor-pointer hover:text-highlight">
          Categories
          <span className="ml-2">
            <MdKeyboardArrowDown />
          </span>
        </p>
      </div>

      {/* Middle section */}
      <form role="search" className="flex items-center w-full justify-center">
        <div className="relative w-full max-w-lg rounded-[50px] p-[1.5px] bg-gradient-to-r from-[#A600FF] to-[#FF008C]">
          <input
            type="search"
            placeholder="Search for products"
            className="w-full py-2 pl-4 pr-20 rounded-[50px] text-black 
                 bg-white focus:outline-none text-ellipsis"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-2">
            <button
              type="button"
              className="p-2 rounded-full hover:bg-gray-100 transition"
              aria-label="Search by image"
            >
              <CameraSVGIcon />
            </button>
            <button
              type="submit"
              className="p-1.5 rounded-full bg-gradient-to-b from-[#A600FF] to-[#FF008C] hover:opacity-90 transition"
              aria-label="Search"
            >
              <IoIosSearch size={23} className="text-white font-semibold" />
            </button>
          </div>
        </div>
      </form>
      {/* Right section */}
      <div className="hidden md:grid grid-cols-[auto_auto_auto] gap-2 place-content-around">
        <p className="flex items-center font-medium hover:cursor-pointer hover:text-highlight">
          <span>
            <FaRegUserCircle className="mr-1" size={25} />
          </span>{" "}
          User Profile
        </p>
        <p className="flex items-center font-medium hover:cursor-pointer hover:text-highlight">
          <span>
            <BsChatDots className="mr-1" size={25} />
          </span>
          Support
        </p>
        <p className="flex items-center font-medium hover:cursor-pointer hover:text-highlight">
          <FiShoppingCart size={25} />
        </p>
      </div>
    </div>
  );
};

export default Navbar;
