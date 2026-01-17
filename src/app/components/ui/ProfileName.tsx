"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { getBearerToken } from "@/lib/api";

function getInitials(name?: string) {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    const first = parts[0]?.[0] || "";
    const second = parts[1]?.[0] || "";
    return (first + second).toUpperCase();
}
interface ProfileNameProps {
    email?: string;
}

export default function ProfileName({ email }: ProfileNameProps) {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = getBearerToken();
        if (!token) {
            setLoading(false);
            return;
        }

        axios
            .get("https://ajempire-backend.vercel.app/api/profile", {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => setProfile(res.data.message))
            .catch((err) => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="flex items-center gap-3 font-poppins animate-pulse">
        <div className="w-[60px] h-[60px] rounded-full bg-gray-200 flex items-center justify-center font-semibold cursor-pointer">

        </div>
        <p className=" bg-gray-50 w-[100px] h-[10px]"></p>
    </div>;

    const fullName = profile.fullname || profile?.shippingAddress?.fullName;
    const initials = getInitials(fullName);
    console.log(profile);
    return (
        <div className="flex items-center gap-3 font-poppins">
            <div className="w-[65px] h-[65px] rounded-full bg-brand_solid_gradient flex items-center justify-center font-semibold cursor-pointer">
                {initials}
            </div>
            <div className="flex flex-col  gap-0">
                <p className="capitalize text-[14px]">{fullName}</p>
                <p className="text-[15px] font-medium">{email}</p>
            </div>
        </div>
    );
}
