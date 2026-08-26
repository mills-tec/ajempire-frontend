"use client";

import NotificationWrapper from "@/components/NotificationWrapper";
import SplashScreenWrapper from "@/components/SplashScreenWrapper";
import { TooltipProvider } from "@/components/ui/tooltip";
import React from "react";
import LayoutWrapper from "../components/LayoutWrapper";
import { SocketProvider } from "../components/providers/SocketProvider";
import { CartIconProvider } from "../contextanimation/CartIconContext";
import { Providers } from "../provider";

/**
 * User Layout
 *
 * This layout wraps all user-facing routes and includes:
 * - User authentication (Providers with GoogleOAuth)
 * - Socket connection for real-time notifications
 * - Cart management and UI
 * - User-specific splash screen and layout
 *
 * Admin routes are completely separate at /admin/* with their own AuthProvider
 * and admin-specific components.
 */
export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* USER-SPECIFIC PROVIDERS
          These are isolated from admin routes and only affect user pages. */}
      <Providers>
        <SocketProvider>
          {/* NotificationWrapper: Handles real-time user notifications
              - Checks for admin routes and skips socket logic if on /admin/*
              - Manages Firebase push notifications
              - Syncs with Socket.IO for real-time updates */}
          <NotificationWrapper />
          <TooltipProvider>
            {/* CartIconProvider: User cart animation and state context */}
            <CartIconProvider>
              {/* SplashScreenWrapper: Shows loading screen on first app load (user only) */}
              <SplashScreenWrapper>
                {/* LayoutWrapper: Renders user navbar, footer, and cart popup
                    - Hides navbar/footer for product pages
                    - Includes mobile navigation */}
                <LayoutWrapper>{children}</LayoutWrapper>
              </SplashScreenWrapper>
            </CartIconProvider>
          </TooltipProvider>
        </SocketProvider>
      </Providers>
    </>
  );
}