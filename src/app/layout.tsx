import type { Metadata } from "next";
import React from "react";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Providers } from "./provider";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import LayoutWrapper from "./components/LayoutWrapper";
import { CartIconProvider } from "./contextanimation/CartIconContext";
import ModalProvider from "./components/providers/ModalProvider";
import NetworkStatus from "./components/NetworkStatus";
import Head from "./Head";
import NotificationWrapper from "@/components/NotificationWrapper";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import SplashScreenWrapper from "@/components/SplashScreenWrapper";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const viewport = {
  themeColor: "#E91E63",
};

export const metadata: Metadata = {
  title: "AJ Empire - Premium Cosmetics & Beauty Products",
  description: "Discover premium cosmetics, makeup, and beauty products at AJ Empire. Shop our curated collection of eye-catching eyeshadows, long-lasting lipsticks, and skincare essentials. Quality beauty products with competitive prices, secure payments, and fast worldwide shipping.",
  manifest: "/manifest.json",
  keywords: ["cosmetics", "makeup", "beauty products", "eyeshadow", "lipstick", "skincare", "online cosmetics store", "premium beauty", "AJ Empire"],
  openGraph: {
    type: "website",
    siteName: "AJ Empire",
    title: "AJ Empire - Premium Cosmetics & Beauty Products",
    description: "Discover premium cosmetics, makeup, and beauty products at AJ Empire. Shop our curated collection of eye-catching eyeshadows, long-lasting lipsticks, and skincare essentials.",
  },
  twitter: {
    card: "summary",
    title: "AJ Empire - Premium Cosmetics & Beauty Products",
    description: "Discover premium cosmetics, makeup, and beauty products at AJ Empire. Shop our curated collection of eye-catching eyeshadows, long-lasting lipsticks, and skincare essentials.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <Head />
      </head>
      <body className={`${poppins.variable} antialiased`}>
        {/* System UI */}
        <Toaster />
        <NotificationWrapper />
        <PWAInstallPrompt />

        <Providers>
          <TooltipProvider>
            <CartIconProvider>
              <NetworkStatus />
              {/* Splash Screen - Shows on app load */}
              <SplashScreenWrapper >
                {/* App Layout */}
                <LayoutWrapper>
                  {children}
                </LayoutWrapper>
              </SplashScreenWrapper>
              {/* GLOBAL UI LAYER (IMPORTANT POSITION) */}
              <ModalProvider />
            </CartIconProvider>
          </TooltipProvider>
        </Providers>
      </body>
    </html>
  );
}
