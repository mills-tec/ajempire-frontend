"use client"
import axios from "axios";
import { useEffect, useState } from "react";

interface CheckoutSummeryCardProps {
    initiateCheckout: () => void;

}
export default function CheckoutSummeryCard({ initiateCheckout }: CheckoutSummeryCardProps) {
    const styleadress = "font-semibold opacity-75"
    const [mounted, setMounted] = useState(false);
    const [totals, setTotals] = useState({ subtotal: 0, discount: 0, total: 0 });

    useEffect(() => {
        setMounted(true);
        const fetchTotal = async () => {
            const token = localStorage.getItem("token")
            if (!token) return;
            try {
                const res = await axios.get("https://ajempire-backend.vercel.app/api/cart/", {
                    headers: { Authorization: `Bearer ${token}` },
                })
                if (res?.data?.message) {
                    console.log(res.data.message)
                    setTotals({
                        subtotal: res.data.message.total,
                        discount: res.data.message.discountedPrice,
                        total: res.data.message.totalPrice,
                    })
                }
            } catch (err) {
                console.error("Error fetching totals:", err);
            }
        }

        fetchTotal();
    }, []);

    console.log("Totals:", totals);

    if (!mounted) {
        return (
            <div className="w-[350px] h-[280px] bg-gray-100  animate-pulse  rounded-md"></div>
        );
    }
    return (
        <div className="w-[350px] font-poppins text-[14px]">
            <div className="w-full shadow-md rounded-md border border-gray-200 px-4  py-4">
                <p className="text-[17px] font-semibold opacity-75 mb-4">Order Summary</p>
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-[250px] h-[35px] border-2 border-gray-300 px-3 rounded-md focus-within:border-brand_solid_gradient transition-all duration-200">
                        <input
                            type="text"
                            placeholder="Enter Coupon Code"
                            className="w-full h-full bg-transparent text-[12px] border-none outline-none"
                        />
                    </div>
                    <button className="bg-[#D3D3D3] w-[100px] h-[35px] rounded-full hover:bg-brand_solid_gradient hover:text-white transition-all duration-200">
                        <p className="text-[14px]">Apply</p>
                    </button>
                </div>
                <div className="flex flex-col gap-2 text-[14px]">
                    <div className="flex items-center justify-between">
                        <p className="text-[#999999]">Subtotal</p>
                        <p className={`${styleadress}`}>₦{totals.subtotal}</p>
                    </div>
                    <div className="flex items-center justify-between">
                        <p className="text-[#999999]">Shipping Charge</p>
                        <p className={`${styleadress}`}>₦0</p>
                    </div>
                    <div className="flex items-center justify-between">
                        <p className="text-[#999999]">Discount</p>
                        <p className={`${styleadress}`}>₦{totals.discount}</p>
                    </div>
                    <hr />
                    <div className="flex items-center justify-between">
                        <p className={`${styleadress}`}>Total</p>
                        <p className={`${styleadress}`}>₦{totals.total}</p>
                    </div>
                </div>
            </div>
            <button className="w-full text-center mt-4 bg-primaryhover text-white h-[35px] rounded-full" onClick={initiateCheckout}>Checkout</button>
        </div>
    )
}