// sidebarItems.ts
"use client";


import { AddressIcon } from "@/components/svgs/AddressIcon";
import { ChatStarIcon } from "@/components/svgs/ChatStarIcon";
import { CouponsIcon } from "@/components/svgs/CouponsIcon";
import { DocumentIcon } from "@/components/svgs/DocumentIcon";
import MyUsageIcon from "@/components/svgs/MyUsageIcon";
import { NotificationsIcon } from "@/components/svgs/NotificationsIcon";
import {
  registerPushToken
} from "@/lib/pushNotifications";
import React, { ReactNode } from "react";


import HelpIcon from "@/components/svgs/HelpIcon";
import SettingsIcon from "@/components/svgs/SettingIcon";
import WishListIcon from "@/components/svgs/WishListIcon";
import { toast } from "sonner";

export type SideBarItem = {
  title: string;
  route?: string;
  icon?: ReactNode;
  children?: SideBarItem[];
  onClick?: () => void;
  action?: "logout";
};

// Turning on push notifications from the account sidebar. The whole
// permission → token → save flow lives in one place (see
// src/lib/pushNotifications.ts), shared with the automatic registration in
// NotificationWrapper, so this only has to decide what to say afterwards.
export const handleEnableNotifications = async (e: React.MouseEvent) => {
  // The icon sits inside the "Notifications" nav link — don't navigate away
  // while the browser's permission prompt is up.
  // e.preventDefault();
  e.stopPropagation();


  // "always" — this is an explicit tap on Notifications, so go through the
  // permission request every time rather than only when undecided. (The
  // browser still only draws a dialog while permission is "default"; once
  // granted or blocked it answers instantly and no site can re-ask, which is
  // what the "denied" toast below exists to explain.)
  await registerPushToken({ prompt: "if-needed" });

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
    title: "Notifications",
    route: "/pages/ordersandaccount/notifications/all",
    icon: (
      <NotificationsIcon
        className="text-primaryhover cursor-pointer"
        role="button"
        aria-label="Enable push notifications"
        onClick={handleEnableNotifications}
      />
    ),
    children: [
      {
        title: "All",
        route: "/pages/ordersandaccount/notifications/all"
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
        action: "logout"

      }
    ],
  },
];
