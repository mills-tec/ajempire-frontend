"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Profile from "./components/Profile";
import MobileAccountLinks from "./components/MobileAccountLinks";
import Spinner from "@/app/components/Spinner";

export default function OrdersAndAccountPage() {
    const router = useRouter();
    const pathname = usePathname();
    const [isLoading, setIsLoading] = useState(true); // start with spinner showing

    useEffect(() => {
        const handleRedirect = () => {
            const isDesktop = window.innerWidth >= 1024;

            // Always start spinner when we mount
            setIsLoading(true);

            if (pathname === "/pages/ordersandaccount" && isDesktop) {
                // Wait 1 second before redirecting
                setTimeout(() => {
                    router.replace("/pages/ordersandaccount/orders/all");
                }, 1000);
            } else if (pathname === "/pages/ordersandaccount" && !isDesktop) {
                // For mobile, stop spinner after small delay
                setTimeout(() => {
                    setIsLoading(false);
                }, 500);
            } else {
                setIsLoading(false);
            }
        };

        handleRedirect();
        window.addEventListener("resize", handleRedirect);

        return () => window.removeEventListener("resize", handleRedirect);
    }, [pathname, router]);

    // If loading, show spinner only
    if (isLoading) {
        return <Spinner />;
    }

    // Once loaded or redirected (for mobile)
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
