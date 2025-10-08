import { AddressIcon } from "@/components/svgs/AddressIcon"
import { ChatStarIcon } from "@/components/svgs/ChatStarIcon"
import { CouponsIcon } from "@/components/svgs/CouponsIcon"
import DeliveredIcon from "@/components/svgs/DeliveredIcon"
import { DocumentIcon } from "@/components/svgs/DocumentIcon"
import HelpIcon from "@/components/svgs/HelpIcon"
import MyUsageIcon from "@/components/svgs/MyUsageIcon"
import ProcessingIcon from "@/components/svgs/ProcessingIcon"
import ReviewsIcon from "@/components/svgs/ReviewsIcon"
import ShippingIcon from "@/components/svgs/ShippingIcon"
import WishListIcon from "@/components/svgs/WishListIcon"
import Link from "next/link"

export default function MobileAccountLinks() {
    const Accountlinks = [
        {
            title: "All Orders",
            url: "/pages/ordersandaccount/orders/all",
            icon: <DocumentIcon className="w-4 h-4 text-primaryhover" />
        },
        {
            title: "Processing",
            url: "/pages/ordersandaccount/orders/processing",
            icon: <ProcessingIcon className="w-4 h-4 text-primaryhover" />
        },
        {
            title: "Shipped",
            url: "/pages/ordersandaccount/orders/shipping",
            icon: <ShippingIcon className="w-4 h-4 text-primaryhover" />
        },
        {
            title: "Delivered",
            url: "/pages/ordersandaccount/orders/delivered",
            icon: <DeliveredIcon className="w-4 h-4 text-primaryhover" />
        },
        {
            title: "Returns",
            url: "/pages/ordersandaccount/returns",
            icon: <ChatStarIcon className="text-primaryhover" />
        },
        {
            title: "Address",
            url: "/pages/ordersandaccount/address",
            icon: <AddressIcon className="text-primaryhover" />
        },
        {
            title: "Coupons",
            url: "/pages/ordersandaccount/coupoonsandoffers",
            icon: <CouponsIcon className="text-primaryhover" />
        },
        {
            title: "Support",
            url: "/pages/ordersandaccount/help",
            icon: <HelpIcon />
        },
        {
            title: "Reviews",
            url: "/pages/ordersandaccount/orders/reviews",
            icon: <ReviewsIcon className="w-4 h-4 text-primaryhover" />
        },
        {
            title: "My Usage",
            url: "/pages/ordersandaccount/myuseage",
            icon: <MyUsageIcon className="text-primaryhover" />
        },
        {
            title: "Wish List",
            url: "/pages/ordersandaccount/wishlist",
            icon: <WishListIcon className="text-primaryhover" />
        },
    ]

    return (
        <div className="space-y-4 font-poppins">
            {/* Row 1 */}
            <div className="bg-[#FFF9FC] p-4 rounded-xl">
                <p className="mb-3 font-semibold text-gray-700 text-[13px]">My Orders</p>
                <div className="grid grid-cols-4 gap-4">
                    {Accountlinks.slice(0, 4).map(({ title, url, icon }, index) => (
                        <Link
                            href={url}
                            key={index}
                            className="flex flex-col items-center justify-center gap-1"
                        >
                            <div className="w-9 h-9 flex items-center justify-center bg-[#FFD9EE] rounded-lg mb-1">
                                {icon}
                            </div>
                            <span className="text-[10px] opacity-80 text-center">
                                {title}
                            </span>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Row 2 */}
            <div className="bg-[#FFF9FC] p-4 rounded-xl">
                <div className="grid grid-cols-4 gap-4">
                    {Accountlinks.slice(4, 8).map(({ title, url, icon }, index) => (
                        <Link
                            href={url}
                            key={index}
                            className="flex flex-col items-center justify-center gap-1"
                        >
                            <div className="w-9 h-9 flex items-center justify-center bg-[#FFD9EE] rounded-lg mb-1">
                                {icon}
                            </div>
                            <span className="text-[10px] opacity-80 text-center">
                                {title}
                            </span>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Row 3 */}
            <div className="bg-[#FFF9FC] p-4 rounded-xl">
                <div className="grid grid-cols-3 gap-4">
                    {Accountlinks.slice(8, 11).map(({ title, url, icon }, index) => (
                        <Link
                            href={url}
                            key={index}
                            className="flex flex-col items-center justify-center gap-1"
                        >
                            <div className="w-9 h-9 flex items-center justify-center bg-[#FFD9EE] rounded-lg mb-1">
                                {icon}
                            </div>
                            <span className="text-[10px] opacity-80 text-center">
                                {title}
                            </span>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}
