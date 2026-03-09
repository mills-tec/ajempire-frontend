"use client";
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react'
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/stores/auth-store';

export default function SignOut() {
    const { setIsLoggedIn } = useAuthStore();
    const router = useRouter();
    if (typeof window !== "undefined") {
        localStorage.clear();
    }

    useEffect(() => {
        setIsLoggedIn(false);
        router.push("/");
        toast.success("Signout successful");
    }, []);
    return (
        <></>
    )
}
