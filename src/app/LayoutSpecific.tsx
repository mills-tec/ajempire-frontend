"use client";

import NotificationWrapper from "@/components/NotificationWrapper";
import SplashScreenWrapper from "@/components/SplashScreenWrapper";
import TawkToWidget from "@/components/TawkToWidget";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { usePathname } from "next/navigation";
import LayoutWrapper from "./components/LayoutWrapper";
import ModalProvider from "./components/providers/ModalProvider";
import { SocketProvider } from "./components/providers/SocketProvider";
import { CartIconProvider } from "./contextanimation/CartIconContext";
import FetchUserData from "./fetchUserData";
import { Providers } from "./provider";

// No admin/shop branch here: Providers, SocketProvider, NotificationWrapper,
// SplashScreenWrapper and ModalProvider each already no-op their own
// admin-only side effects/UI internally (see the isAdminRoute guard in every
// one of them). Skipping this tree for admin routes broke admin pages that
// need what it provides — Providers is what supplies react-query's
// QueryClientProvider, and e.g. admin/inventory uses react-query hooks, so
// without it those pages threw "No QueryClient set".
export default function LayoutSpecific({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAdminRoute = pathname.includes("admin");
    return <Providers>
        <SocketProvider>
            {isAdminRoute ? <> {children}</> : (

                <>

                    {/* Must live INSIDE SocketProvider — it consumes the shared
                connection via useSocket(). As a sibling of <Providers> it
                only ever saw SocketContext's default value (null), so its
                socket effect bailed immediately and user notifications
                never arrived over the wire. */}
                    <NotificationWrapper />
                    <FetchUserData />
                    <TooltipProvider>
                        <CartIconProvider>
                            {/* Splash Screen - Shows on app load */}
                            <SplashScreenWrapper>
                                {/* App Layout */}
                                <LayoutWrapper>{children}</LayoutWrapper>
                                <TawkToWidget />
                            </SplashScreenWrapper>
                            {/* GLOBAL UI LAYER (IMPORTANT POSITION) */}
                            <ModalProvider />
                        </CartIconProvider>
                    </TooltipProvider>
                </>

            )
            }
        </SocketProvider>
    </Providers>
}
