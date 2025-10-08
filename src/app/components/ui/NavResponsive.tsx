import { HomeIcon } from "@/components/svgs/HomeIcon";
import Link from "next/link";
import Categories from "./Categories";
import { CategoryIcon } from "@/components/svgs/CategoryIcon";
import { CustomImgLogo } from "@/components/svgs/CustomImgLogo";
import { CartIcon } from "@/components/svgs/CartIcon";
import { UserIcon } from "@/components/svgs/UserIcon";
import AuthWrapper from "../auth-component/AuthWrapper";

type NavResponsiveProps = {
    isLoggedIn: boolean;
    isActive: (path: string) => string;
    showIntro: boolean;
    setShowIntro: (val: boolean) => void;
}
const NavResponsive = ({ isLoggedIn, isActive, showIntro, setShowIntro }: NavResponsiveProps) => {
    return (
        <div className="w-full h-[70px]  text-[11px] font-poppins flex items-center">
            <ul className="w-full  flex items-center  justify-between ">
                <li>
                    <Link href="/" className={` ${isActive("/")} flex flex-col items-center`}>
                        <HomeIcon size={26} className="opacity-75" />
                        <p className="mt-[-5px]">Home</p>
                    </Link>
                </li>

                <li>
                    <Link href={"/pages/categories"} className={` ${isActive("/pages/categories")} flex flex-col items-center`}>
                        <CategoryIcon size={26} className="opacity-75" />
                        <p className="mt-[-3px]">Categories</p>
                    </Link>
                </li>
                <li>
                    <Link
                        href="/pages/update"
                        className={`flex flex-col items-center ${isActive("/pages/update")
                            }`}
                    >
                        <div
                            className={` w-[40px] h-[40px] flex items-center justify-center rounded-sm ${isActive("/pages/update") ? "bg-brand_gradient_dark" : "bg-brand_gradient_light opacity-70"
                                }`}
                        >
                            <CustomImgLogo size={30} />
                        </div>
                    </Link>
                </li>

                <li>
                    <Link href={"/pages/cart"} className={` ${isActive("/pages/cart")} flex flex-col items-center`}>
                        <CartIcon className="w-6" />
                        <p className="mt-[-3px]">Cart</p>
                    </Link>
                </li>
                <li>
                    {
                        isLoggedIn ? (
                            <Link href={"/pages/ordersandaccount"} className={` ${isActive("/pages/ordersandaccount")} flex flex-col items-center`}>
                                <UserIcon className="w-6" />
                                <p className="mt-[-2px]">profile</p>
                            </Link>
                        )
                            : (
                                <button className="flex flex-col items-center" onClick={() => setShowIntro(true)}>
                                    <UserIcon className="w-6" />
                                    <p className="mt-[-2px]">profile</p>
                                </button>
                            )
                    }
                    {showIntro && <AuthWrapper onClose={() => setShowIntro(false)} />}
                </li>
            </ul>
        </div>
    )
}

export default NavResponsive;