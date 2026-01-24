// sidebarItems.ts
"use client";


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
import { toast, Toaster } from "sonner";

export type SideBarItem = {
  title: string;
  route?: string;
  icon?: ReactNode;
  children?: SideBarItem[];
  onClick?: () => void;
};

const handleShareApp = async () => {
  const url = window.location.origin;

  if (navigator.share) {
    await navigator.share({
      title: "Check out this app!",
      text: "Discover premium cosmetics and beauty essentials at AJ Empire ✨ Shop original products, great prices, and fast delivery. Try it now 👇",
      url,
    });
  } else {
    await navigator.clipboard.writeText(url);
    toast.success("copied app link", { position: "top-right" })
  }
};


export const sidebarItems: SideBarItem[] = [
  {
    title: "Your Orders",
    icon: <DocumentIcon className="text-primaryhover" />,
    route: "/pages/ordersandaccount/orders/all",
    children: [
      { title: "All Orders", route: "/pages/ordersandaccount/orders/all" },
      { title: "Processing", route: "/pages/ordersandaccount/orders/processing" },
      { title: "Shipped", route: "/pages/ordersandaccount/orders/shipped" },
      { title: "Delivered", route: "/pages/ordersandaccount/orders/delivered" },
      { title: "Reviews", route: "/pages/ordersandaccount/orders/reviews" },
    ],
  },
  { title: "Returns", route: "/pages/ordersandaccount/returns", icon: <ChatStarIcon className="text-primaryhover" /> },
  {
    title: "Coupons & Offers",
    route: "/pages/ordersandaccount/coupoonsandoffers",
    icon: <CouponsIcon className="text-primaryhover" />,
    children: [
      {
        title: "Unused",
        route: "/pages/ordersandaccount/coupoonsandoffers"
      },
      {
        title: "Used",
        route: "/pages/ordersandaccount/coupoonsandoffers/usedcoupon"
      },
      {
        title: "Expired",
        route: "/pages/ordersandaccount/coupoonsandoffers/expiredcoupons"
      }
    ]
  },
  { title: "Address", route: "/pages/ordersandaccount/address", icon: <AddressIcon className="text-primaryhover" /> },
  { title: "My Usage", route: "/pages/ordersandaccount/myuseage", icon: <MyUsageIcon className="text-primaryhover" /> },
  { title: "Wish List", route: "/pages/ordersandaccount/wishlist", icon: <WishListIcon className="text-primaryhover" /> },
  {
    title: "Notifications", route: "/pages/ordersandaccount/notifications", icon: <NotificationsIcon className="text-primaryhover" />,
    children: [
      {
        title: "All",
        route: "/pages/ordersandaccount/notifications"
      },
      {
        title: "Flash Sales",
        route: "/pages/ordersandaccount/notifications/flashsale"
      },
      {
        title: "Order",
        route: "/pages/ordersandaccount/notifications/order"
      },
      {
        title: "System",
        route: "/pages/ordersandaccount/notifications/system"
      }
    ]
  },
  {
    title: "Help & Support",
    route: "/pages/support",
    icon: <HelpIcon />,
  },
  {
    title: "Settings",
    icon: <SettingsIcon />,
    route: "/pages/ordersandaccount/settings/profile",
    children: [
      { title: "Profile Settings", route: "/pages/ordersandaccount/settings/profile" },
      { title: "About ", route: "/pages/ordersandaccount/settings/firstabout" },
      {
        title: "Contact Us",
        route: "/pages/ordersandaccount/support/contact"
      },
      {
        title: "Legal terms",
        route: "/pages/ordersandaccount/settings/legalterms"
      },
      {
        title: "Share this app",
        onClick: handleShareApp,
      },
      {
        title: "Switch accounts",
        route: "/pages/ordersandaccount/switchaccount"
      },
      {
        title: "Logout",
        route: "/signout"
      }
    ],
  },
];
