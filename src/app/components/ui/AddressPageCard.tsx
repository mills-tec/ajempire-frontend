"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { getBearerToken } from "@/lib/api";
import ShippingAdressForm from "../ShippingAdressForm";
import { toast } from "sonner";

interface Address {
    fullName: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    _id?: string;
}

const AddressPageCard = () => {
    const [address, setAddress] = useState<Address | null>(null);
    const [isEditing, setIsEditing] = useState(false);

    const fetchAddress = async () => {
        try {
            const token = getBearerToken();
            const res = await axios.get(
                "https://ajempire-backend.vercel.app/api/shipping-address",
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setAddress(res.data.message);
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        fetchAddress();
    }, []);

    if (!address) {
        return (
            <div className="w-full h-[180px] bg-gray-100 animate-pulse rounded-lg"></div>
        );
    }

    return (
        <div className="w-full border border-gray-300 rounded-xl p-5 font-poppins shadow-sm">
            <div className="text-[15px] flex">
                <p className="font-semibold">{address.fullName}</p>
                <span className="text-gray-600 text-[15px] ml-2">{address.phone}</span>
            </div>

            <div className="text-[15px] mt-3 leading-[22px] text-gray-700">
                {address.street}, {address.city}, {address.state}, {address.country}
                <br />
                {address.postalCode}
            </div>

            <div className="flex items-center justify-between  mt-5 text-[13px] text-gray-500 font-medium">
                <div className="flex items-center gap-1 ">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect width="14" height="14" rx="7" fill="black" />
                        <circle cx="6.99978" cy="6.99978" r="3.11111" fill="white" />
                    </svg>
                    <p className="mt-[0px]">Defult</p>
                </div>
                <div className="flex items-center justify-center gap-5">
                    <button
                        className="hover:underline cursor-pointer"
                        onClick={() => setIsEditing(true)}
                    >
                        Edit
                    </button>
                    <span>|</span>
                    <button
                        className="hover:underline cursor-pointer"
                        onClick={() => {
                            navigator.clipboard.writeText(
                                `${address.fullName}, ${address.phone}, ${address.street}, ${address.city}, ${address.state}, ${address.country}, ${address.postalCode}`
                            );
                            toast.success("Copied to clipboard!", { position: "bottom-right" });
                        }}
                    >
                        Copy
                    </button>
                </div>
            </div>

            {/* EDIT FORM */}
            {isEditing && (
                <ShippingAdressForm
                    setIsadress={setIsEditing}
                    existingAddress={address}
                    onAddressUpdated={fetchAddress}
                />
            )}
        </div>
    );
};

export default AddressPageCard;
