"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import CartPopup from "./CartPopup";

export default function LayoutWrapper({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();


    // Routes where navbar & footer should be hidden
    const hideLayout =
        pathname.startsWith("/admin") ||
        pathname === "/admin-login";



    return (
        <div className="flex flex-col min-h-screen overflow-hidden">
            {/* Navbar */}
            {!hideLayout && (
                <header className="hidden lg:flex fixed top-0 left-0 w-full bg-white z-50 shadow-sm">
                    <Navbar />
                </header>
            )}

            {/* Main Content */}
            <main
                className={`pb-[90px] ${hideLayout ? "pt-0" : "lg:pt-[100px]"
                    }`}
            >
                {children}
            </main>

            {/* Footer */}
            {!hideLayout && (
                <footer>
                    {/* Mobile nav */}
                    <div className="lg:hidden w-full fixed bottom-0 left-0 bg-white z-50 shadow-sm h-[80px] px-[20px] flex items-center justify-center border-t border-gray-300">
                        <Navbar />
                    </div>

                    {/* Desktop footer */}
                    <div className="hidden lg:block bg-brand_gradient_dark">
                        <Footer />
                    </div>
                </footer>
            )}

            {typeof window !== "undefined" && <CartPopup />}

        </div>
    );
}
