"use client";

import { getBearerToken } from "@/lib/api";
import { useAuthStore } from "@/lib/stores/auth-store";
import { usePathname } from "next/navigation";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

type SocketContextType = {
  socket: Socket | null;
};

const SocketContext = createContext<SocketContextType>({ socket: null });

// Single Socket.IO connection shared by the whole app. Mounted once at the
// root layout — individual components must consume it via useSocket()
// instead of calling io() themselves, so we never open more than one
// connection per browser tab.
export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const user = useAuthStore((s) => s.user);
  // Bumped by AuthContext.login()/logout() — admin auth lives in a React
  // context this provider isn't nested under, so this is what makes the
  // effect below re-run on admin sign-in/out instead of only next reload.
  const adminTokenTick = useAuthStore((s) => s.adminTokenTick);
  const pathname = usePathname();
  const isAdminRoute = pathname.includes("admin");

  // Create the one connection for the app's lifetime. autoConnect is off so
  // the auth effect below (which runs right after, with the real token) is
  // the single place that actually opens it — avoids connecting once
  // unauthenticated and immediately reconnecting.
  useEffect(() => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backendUrl) return;

    const instance = io(backendUrl, {
      transports: ["websocket"],
      reconnection: true,
      autoConnect: false,
    });

    setSocket(instance);

    return () => {
      instance.disconnect();
      setSocket(null);
    };
  }, []);

  // Socket.IO only reads `auth` at (re)connect time, so logging in/out has
  // to force a reconnect on this same instance to pick up the new token —
  // that's still one socket, just re-authenticated, not a second connection.
  // On admin routes we authenticate with the admin token instead of the
  // shopper token, so the same shared connection serves both notification
  // scopes (mirrors the isAdminRoute branching NotificationWrapper already
  // does for push-token registration).
  useEffect(() => {
    if (!socket) return;
    const adminToken = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;
    const token = isAdminRoute ? (adminToken ?? undefined) : (getBearerToken() ?? undefined);
    socket.auth = { token };
    if (socket.connected) {
      socket.disconnect();
    }
    socket.connect();
  }, [socket, user, isAdminRoute, adminTokenTick]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext).socket;
}
