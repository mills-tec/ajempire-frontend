import { HomeIcon } from "@/components/svgs/HomeIcon";
import Link from "next/link";
import Categories from "./Categories";
import { CategoryIcon } from "@/components/svgs/CategoryIcon";
import { CustomImgLogo } from "@/components/svgs/CustomImgLogo";
import { CartIcon } from "@/components/svgs/CartIcon";
import { UserIcon } from "@/components/svgs/UserIcon";
import AuthWrapper from "../auth-component/AuthWrapper";
import { useCartStore } from "@/lib/stores/cart-store";

type NavResponsiveProps = {
  isLoggedIn: boolean;
  isActive: (path: string) => string;
  showIntro: boolean;
  setShowIntro: (val: boolean) => void;
};
const NavResponsive = ({
  isLoggedIn,
  isActive,
  showIntro,
  setShowIntro,
}: NavResponsiveProps) => {
  const { items } = useCartStore();
  return (
    <div className="w-full h-[70px]  text-[11px] font-poppins flex items-center">
      <ul className="w-full  flex items-center  justify-between ">
        <li>
          <Link
            href="/"
            className={` ${isActive("/")} flex flex-col items-center`}
          >
            <HomeIcon size={30} className="opacity-80" />
            <p className="mt-[-5px]">Home</p>
          </Link>
        </li>

        <li>
          <Link
            href={"/pages/categories"}
            className={` ${isActive(
              "/pages/categories"
            )} flex flex-col items-center`}
          >
            <CategoryIcon size={30} className="opacity-75" />
            <p className="mt-[-3px]">Categories</p>
          </Link>
        </li>
        <li>
          {isActive("/pages/update") ? (
            <Link
              href="/pages/update"
              className={`flex flex-col items-center ${isActive(
                "/pages/update"
              )}`}
            >
              <div
                className={` w-[40px] h-[40px] flex items-center justify-center rounded-sm  bg-brand_gradient_dark "
                                        }`}
              >
                <CustomImgLogo size={30} />
              </div>
            </Link>
          ) : (
            <div
              className={` w-[40px] h-[40px] flex items-center justify-center rounded-sm  bg-brand_gradient_light opacity-0
                                    }`}
            >
              <CustomImgLogo size={30} />
            </div>
          )}
        </li>

        <li>
          <Link
            href={"/pages/cart"}
            className={` ${isActive(
              "/pages/cart"
            )} flex relative flex-col items-center`}
          >
            {items && (
              <div className="absolute size-4 rounded-full left-3 bottom-6 z-10 bg-brand_pink text-white text-xs font-semibold flex items-center justify-center">
                <p>{items.length}</p>
              </div>
            )}
            <CartIcon className="w-6" />
            <p className="mt-[-3px]">Cart</p>
          </Link>
        </li>
        <li>
          {isLoggedIn ? (
            <Link
              href={"/pages/ordersandaccount"}
              className={` ${isActive(
                "/pages/ordersandaccount"
              )} flex flex-col items-center`}
            >
              <UserIcon className="w-6" />
              <p className="mt-[-2px]">profile</p>
            </Link>
          ) : (
            <button
              className="flex flex-col items-center opacity-80"
              onClick={() => setShowIntro(true)}
            >
              <UserIcon className="w-6" />
              <p className="mt-[-2px]">profile</p>
            </button>
          )}
          {showIntro && <AuthWrapper onClose={() => setShowIntro(false)} />}
        </li>
      </ul>
    </div>
  );
};

export default NavResponsive;
