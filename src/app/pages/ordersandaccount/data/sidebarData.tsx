// sidebarItems.ts

import { ReactNode } from "react";
import { DocumentIcon } from "@/components/svgs/DocumentIcon";
import { AddressIcon } from "@/components/svgs/AddressIcon";
import { ChatStarIcon } from "@/components/svgs/ChatStarIcon";
import { CouponsIcon } from "@/components/svgs/CouponsIcon";
import MyUsageIcon from "@/components/svgs/MyUsageIcon";
import { NotificationsIcon } from "@/components/svgs/NotificationsIcon";


import SettingsIcon from "@/components/svgs/SettingIcon";
import HelpIcon from "@/components/svgs/HelpIcon";
import WishListIcon from "@/components/svgs/WishListIcon";
import { icons } from "lucide-react";


export type SideBarItem = {
  title: string;
  route?: string;
  icon?: ReactNode;
  children?: SideBarItem[];
};

export const sidebarItems: SideBarItem[] = [
  {
    title: "Your Orders",
    icon: <DocumentIcon className="text-primaryhover" />,
    route: "/pages/ordersandaccount/orders/all",
    children: [
      { title: "All Orders", route: "/pages/ordersandaccount/orders/all" },
      { title: "Processing", route: "/pages/ordersandaccount/orders/processing" },
      { title: "Shipped", route: "/pages/ordersandaccount/orders/shipping" },
      { title: "Delivered", route: "/pages/ordersandaccount/orders/delivered" },
      { title: "Reviews", route: "/pages/ordersandaccount/orders/reviews" },
    ],
  },
  { title: "Returns", route: "/pages/ordersandaccount/returns", icon: <ChatStarIcon className="text-primaryhover" /> },
  { title: "Coupons & Offers", route: "/pages/ordersandaccount/coupoonsandoffers", icon: <CouponsIcon className="text-primaryhover" /> },
  { title: "Address", route: "/pages/ordersandaccount/address", icon: <AddressIcon className="text-primaryhover" /> },
  { title: "My Usage", route: "/pages/ordersandaccount/myuseage", icon: <MyUsageIcon className="text-primaryhover" /> },
  { title: "Wish List", route: "/pages/ordersandaccount/wishlist", icon: <WishListIcon className="text-primaryhover" /> },
  { title: "Notifications", route: "/pages/ordersandaccount/notifications", icon: <NotificationsIcon className="text-primaryhover" /> },
  {
    title: "Help & Support",
    route: "/pages/ordersandaccount/support",
    icon: <HelpIcon />,
    children: [
      {
        title: "About",
        route: "/pages/ordersandaccount/support/about"
      },
      {
        title: "Contact Us",
        route: "/pages/ordersandaccount/support/contact"
      },
      {
        title: "Share this App",
        route: ""
      },
      {
        title: "Legal terms and priorities",
        route: ""
      }
    ]
  },
  {
    title: "Settings",
    icon: <SettingsIcon />,
    route: "/pages/ordersandaccount/support/settings",
    children: [
      { title: "Profile Settings", route: "/settings/profile" },
      { title: "Security", route: "/settings/security" },
    ],
  },

];
