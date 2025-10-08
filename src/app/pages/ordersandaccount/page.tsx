"use client"
import { useEffect } from "react";
import { usePathname, useRouter, redirect } from "next/navigation";
import Profile from "./components/Profile";
import MobileAccountLinks from "./components/MobileAccountLinks";

export default function OrdersAndAccountPage() {
    const isWorking = false
    const router = useRouter();
    const pathname = usePathname();
    useEffect(() => {
        const handleRedirect = () => {
            const isDesktop = window.innerWidth >= 1024; // lg breakpoint
            console.log("DEBUG → pathname:", pathname, "isDesktop:", isDesktop);

            if (pathname === "/pages/ordersandaccount" && isDesktop) {
                console.log("✅ Redirecting to /orders/all");
                router.replace("/pages/ordersandaccount/orders/all");
            } else if (pathname === "/pages/ordersandaccount" && !isDesktop) {
                console.log("📱 Mobile view detected, staying on /ordersandaccount");
            }
        };

        handleRedirect();
        window.addEventListener("resize", handleRedirect);

        return () => window.removeEventListener("resize", handleRedirect);
    }, [pathname, router]);

    return (
        <div className="w-full flex flex-col gap-[20px]">
            <div>
                <Profile />
            </div>
            <div>
                <MobileAccountLinks />
            </div>
        </div>
    );
}
