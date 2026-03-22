"use client";

import { useNetworkStatus } from "@/lib/stores/useNetworkStatus";



export default function NetworkStatus() {
    const isOnline = useNetworkStatus();

    if (isOnline) return null;

    return (
        <div className="fixed top-0 left-0 w-full bg-red-600 text-white text-center py-2 z-50">
            No internet connection. Please check your network.
        </div>
    );
}