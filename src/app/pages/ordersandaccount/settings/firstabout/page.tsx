import Link from "next/link"

export default function FirstAboutPage() {
    return (
        <div className="font-poppins text-[15px] lg:px-5 w-full mt-3 lg:mt-0  lg:flex lg:flex-col lg:gap-10 lg:pt-10 overflow-hidden  bg-white rounded-sm h-96">
            <p className="font-semibold text-[26px]">About </p>
            <div className="flex flex-col gap-9">
                <Link href={"/pages/ordersandaccount/support/about"} >
                    <p className="border border-gray-500 rounded-sm w-[70%] h-[60px] flex items-center px-4">About this app</p>
                </Link>
                <Link href="/pages/ordersandaccount/support/aboutthisapp" >
                    <p className="border border-gray-500 rounded-sm w-[70%] h-[60px]  flex items-center px-4">About us</p>
                </Link>
            </div>
        </div>
    );
}