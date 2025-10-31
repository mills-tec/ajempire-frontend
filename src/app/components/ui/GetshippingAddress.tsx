"use client"
import axios from "axios";
import { useEffect, useState } from "react"
import ShippingAdressForm from "../ShippingAdressForm";

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

const GetshippingAddress = () => {
    const [address, setAddress] = useState<Address | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const token = localStorage.getItem("token");
        axios.get("https://ajempire-backend.vercel.app/api/shipping-address", {
            headers: { Authorization: `Bearer ${token}` }

        })

            .then(res => {
                setAddress(res.data.message)
                console.log("Fetched address:", res.data.message);
            })
            .catch(err => console.error("Error fetching address:", err));
    }, []);
    const styleadress = "font-semibold opacity-75"
    // console.log("Fetched address:", address);
    if (!mounted) {
        return (
            <div className="w-[350px] h-[280px] bg-gray-100  animate-pulse  rounded-md"></div>
        );
    }
    return (
        <div className="w-[350px]">
            {address && (
                <div className="w-full  px-4 py-4 font-poppins text-[15px] shadow-md rounded-md border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-[17px] font-semibold opacity-75">Shipping address</p>
                        <div className=" cursor-pointer" onClick={() => setIsEditing(true)}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M13 3C13.2549 3.00028 13.5 3.09788 13.6854 3.27285C13.8707 3.44782 13.9822 3.68695 13.9972 3.94139C14.0121 4.19584 13.9293 4.44638 13.7657 4.64183C13.6021 4.83729 13.3701 4.9629 13.117 4.993L13 5H5V19H19V11C19.0003 10.7451 19.0979 10.5 19.2728 10.3146C19.4478 10.1293 19.687 10.0178 19.9414 10.0028C20.1958 9.98789 20.4464 10.0707 20.6418 10.2343C20.8373 10.3979 20.9629 10.6299 20.993 10.883L21 11V19C21.0002 19.5046 20.8096 19.9906 20.4665 20.3605C20.1234 20.7305 19.6532 20.9572 19.15 20.995L19 21H5C4.49542 21.0002 4.00943 20.8096 3.63945 20.4665C3.26947 20.1234 3.04284 19.6532 3.005 19.15L3 19V5C2.99984 4.49542 3.19041 4.00943 3.5335 3.63945C3.87659 3.26947 4.34684 3.04284 4.85 3.005L5 3H13ZM19.243 3.343C19.423 3.16365 19.6644 3.05953 19.9184 3.05177C20.1723 3.04402 20.4197 3.13322 20.6103 3.30125C20.8008 3.46928 20.9203 3.70355 20.9444 3.95647C20.9685 4.2094 20.8954 4.46201 20.74 4.663L20.657 4.758L10.757 14.657C10.577 14.8363 10.3356 14.9405 10.0816 14.9482C9.82767 14.956 9.58029 14.8668 9.38972 14.6988C9.19916 14.5307 9.07969 14.2964 9.0556 14.0435C9.03151 13.7906 9.10459 13.538 9.26 13.337L9.343 13.243L19.243 3.343Z" fill="black" />
                            </svg>
                        </div>
                        {
                            isEditing && (
                                <div>
                                    {/* Render your ShippingAdressForm component here */}
                                    <ShippingAdressForm
                                        setIsadress={setIsEditing} // lets form close itself
                                        existingAddress={address || undefined}  // prefill with current info
                                    />
                                </div>
                            )
                        }
                    </div>
                    <div className="flex flex-col gap-2 text-[14px]">
                        <div className="flex items-center justify-between">
                            <p className="text-[#999999]">Name</p>
                            <p className={`${styleadress}`}>{address.fullName}</p>
                        </div>
                        <div className="flex items-center justify-between">
                            <p className="text-[#999999]">Phone</p>
                            <p className={`${styleadress}`}>{address.phone}</p>
                        </div>
                        <div className="flex items-center justify-between">
                            <p className="text-[#999999]">Street</p>
                            <p className={`${styleadress}`}>{address.street}</p>
                        </div>

                        <div className="flex items-center justify-between">
                            <p className="text-[#999999]">city/Iown</p>
                            <p className={`${styleadress}`}>{address.city}</p>
                        </div>

                        <div className="flex items-center justify-between">
                            <p className="text-[#999999]">State</p>
                            <p className={`${styleadress}`}>{address.state}</p>
                        </div>
                        <div className="flex items-center justify-between">
                            <p className="text-[#999999]">Country</p>
                            <p className={`${styleadress}`}>{address.country}</p>
                        </div>
                        <div className="flex items-center justify-between">
                            <p className="text-[#999999]">PostalCode</p>
                            <p className={`${styleadress}`}>{address.postalCode}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
export default GetshippingAddress;