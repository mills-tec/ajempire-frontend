"use client"
import ProfileName from "@/app/components/ui/ProfileName";
import { getBearerToken } from "@/lib/api";
import axios from "axios"
import { useEffect, useState } from "react"
interface UserProfile {
    _id: string;
    email: string;
    authProvider: "google" | "email";
    isVerified: boolean;
    googleId?: string;
    agreeToReceiveEmails: boolean;
    shippingAddress?: {
        fullName: string;
        phone: string;
        street: string;
        city: string;
        state: string;
        country: string;
        postalCode: string;
    };
}



export default function ProfileSettingsPage() {
    const [profileData, setProfileData] = useState<UserProfile | null>(null);
    console.log("ProfileSettingsPage loaded", profileData?.shippingAddress?.fullName);
    const styleadress = "font-semibold opacity-75";
    useEffect(() => {
        const token = getBearerToken();
        const profileSettingsPage = async () => {
            // Fetch user profile settings data here if needed
            try {
                const res = await axios.get("https://ajempire-backend.vercel.app/api/profile",
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                )
                console.log("Fetched profile settings:", res.data.message);
                setProfileData(res.data.message);
            }
            catch (err) {
                console.error("Error fetching profile settings:", err);
            }
        }
        profileSettingsPage();
    }, [])
    return (
        <div className="w-full lg:px-6 mt-6 font-poppins">
            <h2 className="text-[18px] font-semibold mb-6">Profile Settings</h2>

            <div className="flex gap-6">

                {/* LEFT – PROFILE SUMMARY */}
                {profileData && (
                    <div className="w-[45%] bg-white p-5 rounded-md border">
                        <ProfileName email={profileData.email} />
                        <p className="text-[13px] text-gray-500 mt-2">
                            Manage your personal information and delivery details. Your data is safe and secure.
                        </p>

                        <button className="mt-4 text-sm text-pink-600 font-medium hover:underline">
                            Edit Profile
                        </button>
                    </div>
                )}

                {/* RIGHT – DETAILS */}
                {profileData?.shippingAddress && (
                    <div className="w-[55%] bg-white p-5 rounded-md border">
                        <h3 className="text-[15px] font-semibold mb-4">Personal Information</h3>

                        <div className="flex flex-col gap-3 text-[14px]">
                            {[
                                ["Full Name", profileData.shippingAddress.fullName],
                                ["Phone", profileData.shippingAddress.phone],
                                ["Email", profileData.email],
                                ["Street", profileData.shippingAddress.street],
                                ["City / Town", profileData.shippingAddress.city],
                                ["State", profileData.shippingAddress.state],
                                ["Country", profileData.shippingAddress.country],
                                ["Postal Code", profileData.shippingAddress.postalCode],
                            ].map(([label, value]) => (
                                <div key={label} className="flex justify-between border-b pb-2">
                                    <p className="text-gray-500">{label}</p>
                                    <p className="font-medium text-gray-800">{value}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>

    )
}

