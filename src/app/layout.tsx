import NotificationWrapper from "@/components/NotificationWrapper";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import SplashScreenWrapper from "@/components/SplashScreenWrapper";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import React from "react";
import { Toaster } from "sonner";
import LayoutWrapper from "./components/LayoutWrapper";
import NetworkStatus from "./components/NetworkStatus";
import ModalProvider from "./components/providers/ModalProvider";
import { CartIconProvider } from "./contextanimation/CartIconContext";
import "./globals.css";
import { Providers } from "./provider";
export const dynamic = "force-dynamic";

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
  applicationName: "AJ Empire",
  keywords: ["cosmetics", "makeup", "beauty products", "eyeshadow", "lipstick", "skincare", "online cosmetics store", "premium beauty", "AJ Empire"],
  icons: {
    shortcut: "/favicon.png",
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icon-192.png", sizes: "192x192" },
      { url: "/icon-512.png", sizes: "512x512" },
      { url: "/icon-192.png" },
    ],
  },
  appleWebApp: {
    capable: true,
    title: "AJ Empire",
    statusBarStyle: "default",
  },
  other: {
    "msapplication-TileColor": "#FF008C",
  },
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
        <link rel="manifest" href="/manifest.json" />
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
        <SpeedInsights />
      </body>
    </html>
  );
}
