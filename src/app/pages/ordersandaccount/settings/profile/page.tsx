"use client"
import ProfileName from "@/app/components/ui/ProfileName";
import { getBearerToken } from "@/lib/api";
import axios from "axios"
import Link from "next/link";
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
        <div className="w-full px-6 lg:mt-6 mt-1 font-poppins">

            <div>
                <h2 className="hidden lg:block text-[18px] font-semibold mb-6">Profile Settings</h2>
                <div className="lg:hidden pb-3  flex items-center  mb-[10px] ">
                    <Link href={"/pages/ordersandaccount/settings"}>
                        <svg width="9" height="17" viewBox="0 0 9 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8.78122 15.2198C8.8509 15.2895 8.90617 15.3722 8.94388 15.4632C8.9816 15.5543 9.00101 15.6519 9.00101 15.7504C9.00101 15.849 8.9816 15.9465 8.94388 16.0376C8.90617 16.1286 8.8509 16.2114 8.78122 16.281C8.71153 16.3507 8.62881 16.406 8.53776 16.4437C8.44672 16.4814 8.34914 16.5008 8.25059 16.5008C8.15204 16.5008 8.05446 16.4814 7.96342 16.4437C7.87237 16.406 7.78965 16.3507 7.71996 16.281L0.219965 8.78104C0.150232 8.71139 0.0949136 8.62867 0.0571704 8.53762C0.0194272 8.44657 0 8.34898 0 8.25042C0 8.15186 0.0194272 8.05426 0.0571704 7.96321C0.0949136 7.87216 0.150232 7.78945 0.219965 7.71979L7.71996 0.219792C7.8607 0.0790615 8.05157 -3.92322e-09 8.25059 0C8.44961 3.92322e-09 8.64048 0.0790615 8.78122 0.219792C8.92195 0.360523 9.00101 0.551394 9.00101 0.750417C9.00101 0.94944 8.92195 1.14031 8.78122 1.28104L1.8109 8.25042L8.78122 15.2198Z" fill="black" />
                        </svg>
                    </Link>
                    <div className=" w-full text-center font-semibold text-black/70">
                        <p>Profile page</p>
                    </div>
                </div>
            </div>

            <div className="flex  flex-col gap-6 w-full ">

                {/* LEFT – PROFILE SUMMARY */}
                {profileData && (
                    <div className=" w-full lg:w-[45%] bg-white p-5 rounded-md border">
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
                    <div className="lg:w-[55%] w-full bg-white p-5 rounded-md border">
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

