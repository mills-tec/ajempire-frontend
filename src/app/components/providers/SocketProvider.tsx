"use client";

import { getBearerToken } from "@/lib/api";
import { useAuthStore } from "@/lib/stores/auth-store";
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
  useEffect(() => {
    if (!socket) return;
    socket.auth = { token: getBearerToken() ?? undefined };
    if (socket.connected) {
      socket.disconnect();
    }
    socket.connect();
  }, [socket, user]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext).socket;
}
