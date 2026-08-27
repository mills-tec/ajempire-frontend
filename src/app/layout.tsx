import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import TawkToWidget from "@/components/TawkToWidget";
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import React from "react";
import { Toaster } from "sonner";
import "./globals.css";
import LayoutSpecific from "./LayoutSpecific";
export const dynamic = "force-dynamic";

const SafeLayoutSpecific = LayoutSpecific as unknown as React.ComponentType<{
  children: React.ReactNode;
}>;

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const viewport = {
  themeColor: "#E91E63",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "AJ Empire - Premium Cosmetics & Beauty Products",
  description:
    "Discover premium cosmetics, makeup, and beauty products at AJ Empire. Shop our curated collection of eye-catching eyeshadows, long-lasting lipsticks, and skincare essentials. Quality beauty products with competitive prices, secure payments, and fast worldwide shipping.",
  manifest: "/manifest.json",
  applicationName: "AJ Empire",
  keywords: [
    "cosmetics",
    "makeup",
    "beauty products",
    "eyeshadow",
    "lipstick",
    "skincare",
    "online cosmetics store",
    "premium beauty",
    "AJ Empire",
  ],
  icons: {
    icon: [{ url: "/favicon.png", type: "image/png" }],
    shortcut: "/favicon.png",
    apple: [{ url: "/favicon.png" }],
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
    description:
      "Discover premium cosmetics, makeup, and beauty products at AJ Empire. Shop our curated collection of eye-catching eyeshadows, long-lasting lipsticks, and skincare essentials.",
  },
  twitter: {
    card: "summary",
    title: "AJ Empire - Premium Cosmetics & Beauty Products",
    description:
      "Discover premium cosmetics, makeup, and beauty products at AJ Empire. Shop our curated collection of eye-catching eyeshadows, long-lasting lipsticks, and skincare essentials.",
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
      <body className={`${poppins.variable}  antialiased`}>
        {/* System UI */}
        <Toaster />
        <PWAInstallPrompt />

        <SafeLayoutSpecific>
          {children}
        </SafeLayoutSpecific>
        <TawkToWidget />
      </body>
    </html>
  );
}