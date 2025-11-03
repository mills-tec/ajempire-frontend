"use client"
import CheckoutSummeryCard from "@/app/components/CheckoutSummeryCard";
import GetshippingAddress from "@/app/components/ui/GetshippingAddress";
import SelectedpaymentMethod from "./SelectedpaymentMethod";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import Spinner from "../Spinner";
import { useCartStore } from "@/lib/stores/cart-store";


export default function OrderSummaryPage() {
    const [isLoading, setIsLoading] = useState(true);
    const { items, getSelectedItems } = useCartStore();
    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 600);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {

    })

    const initiateCheckout = async () => {
        setIsLoading(true);
        const token = localStorage.getItem("token");
        const paymentMethod = localStorage.getItem("paymentMethod");
        if (!token) {
            toast.error("Please log in to continue", { position: 'top-right' });
            setIsLoading(false);
            return;
        }
        if (!paymentMethod) {
            toast.error("Please select a payment method", { position: 'top-right' });
            setIsLoading(false);
            return;
        }
        if (!items || items.length === 0) {
            toast.error("Your cart is empty", { position: "top-right" });
            setIsLoading(false);
            return;
        }
        try {
            const response = await axios.post(
                "https://ajempire-backend.vercel.app/api/checkout",
                {
                    paymentMethod: paymentMethod,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );
            if (response?.data?.message?.url) {
                window.location.href = response.data.message.url; // Redirect to payment URL
                console.log("Payment URL set to:", response.data.message.url);
            } else {
                toast.error("Failed to initiate checkout. Please try again.", { position: 'top-right' });
            }
        } catch (error) {
            // console.error("Checkout error:", error.response?.data || error.message);
            toast.error("An error occurred during checkout. Please try again.", { position: 'top-right' });
        } finally {
            setTimeout(() => {
                setIsLoading(false);
            }, 800);
        }
    };

    return (
        <div className="w-full flex flex-col lg:flex-row items-start justify-between lg:px-[30px] lg:py-[30px] pt-6 px-4 font-poppins">
            {
                isLoading && <Spinner />
            }
            <div className="lg:hidden w-full flex items-center text-center">
                <div>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15.5302 18.9698C15.5999 19.0395 15.6552 19.1222 15.6929 19.2132C15.7306 19.3043 15.75 19.4019 15.75 19.5004C15.75 19.599 15.7306 19.6965 15.6929 19.7876C15.6552 19.8786 15.5999 19.9614 15.5302 20.031C15.4606 20.1007 15.3778 20.156 15.2868 20.1937C15.1957 20.2314 15.0982 20.2508 14.9996 20.2508C14.9011 20.2508 14.8035 20.2314 14.7124 20.1937C14.6214 20.156 14.5387 20.1007 14.469 20.031L6.96899 12.531C6.89926 12.4614 6.84394 12.3787 6.80619 12.2876C6.76845 12.1966 6.74902 12.099 6.74902 12.0004C6.74902 11.9019 6.76845 11.8043 6.80619 11.7132C6.84394 11.6222 6.89926 11.5394 6.96899 11.4698L14.469 3.96979C14.6097 3.82906 14.8006 3.75 14.9996 3.75C15.1986 3.75 15.3895 3.82906 15.5302 3.96979C15.671 4.11052 15.75 4.30139 15.75 4.50042C15.75 4.69944 15.671 4.89031 15.5302 5.03104L8.55993 12.0004L15.5302 18.9698Z" fill="black" />
                    </svg>
                </div>
                <p className="lg:hidden text-[20px]  w-full text-center">Order Summary </p>
            </div>
            <div className="lg:hidden w-full flex items-center justify-between gap-1 mb-5 mt-5">
                <div className="flex items-center gap-1">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 0C5.4 0 0 5.4 0 12C0 18.6 5.4 24 12 24C18.6 24 24 18.6 24 12C24 5.4 18.6 0 12 0ZM9.6 18L3.6 12L5.292 10.308L9.6 14.604L18.708 5.496L20.4 7.2L9.6 18Z" fill="#0085FF" />
                    </svg>
                    <p>Shipping</p>
                </div>
                <div>
                    <svg width="22" height="1" viewBox="0 0 22 1" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0.5 0.5H21.5" stroke="#CFCFCF" stroke-linecap="square" />
                    </svg>
                </div>

                <div className="flex items-center gap-1">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 0C5.4 0 0 5.4 0 12C0 18.6 5.4 24 12 24C18.6 24 24 18.6 24 12C24 5.4 18.6 0 12 0ZM9.6 18L3.6 12L5.292 10.308L9.6 14.604L18.708 5.496L20.4 7.2L9.6 18Z" fill="#A600FF" />
                    </svg>

                    <p className="text-[#A3A3A3]">Payment</p>
                </div>
                <div>
                    <svg width="22" height="1" viewBox="0 0 22 1" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0.5 0.5H21.5" stroke="#CFCFCF" stroke-linecap="square" />
                    </svg>
                </div>
                <div className="flex items-center gap-1">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect width="24" height="24" rx="12" fill="#FF008C" />
                        <path d="M11 7V13.6667L14 17" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>

                    <p className="text-[#A3A3A3]">Review</p>
                </div>
            </div>
            <p className="lg:hidden  text-[16px] mb-6 mt-5">Please Confirm and submit your order</p>
            <div className="w-full flex flex-col lg:flex-row  lg:items-start justify-center lg:gap-6 gap-8">
                <GetshippingAddress />
                <SelectedpaymentMethod />
                <CheckoutSummeryCard initiateCheckout={initiateCheckout} />
            </div>
        </div>
    )
}
