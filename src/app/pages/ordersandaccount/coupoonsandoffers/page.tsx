"use client";
import { useEffect, useState } from "react";
import CouponsTab from "../components/CouponsTab";
import FlashDealCard from "../components/FlashDealCard";
import { getCoupons } from "@/lib/api";
import { mapCouponToDeal } from "@/lib/couponMapper";
import FlashDealSkeleton from "@/components/FlashDealSkeleton";
import EmptyList from "@/components/EmptyList";
import { Store } from "lucide-react";
export interface ICoupon {
    id: string | number;
    title: string;
    description?: string;
    validUntil?: string;
    code: string;
    ctaText?: string;
    status: "unused" | "used" | "expired";
    discountType: "fixed" | "percentage";
    discountValue: number;
    expiry: string; // ISO date string
    isExpired: boolean;
    __v: number;
};



export default function CouponsAndOffers() {
    const [deals, setDeals] = useState<ICoupon[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    useEffect(() => {
        const fetchCoupons = async () => {
            try {
                const res = await getCoupons("");

                if (!res) return;
                setDeals(res.message.map(item => ({ ...item, status: "unused" })));
            } catch (err) {

            } finally {
                setLoading(false);
            }
        };

        fetchCoupons();
    }, []);

    return (
        <div className="w-full px-6  lg:block  font-poppins">
            <CouponsTab />

            {/* <div className="mt-8 flex items-center gap-4">
                <div className="w-[300px] h-[40px] border-2 border-gray-300 px-3 rounded-md focus-within:border-brand_solid_gradient transition-all duration-200">
                    <input
                        type="text"
                        placeholder="Enter Coupon Code"
                        className="w-full h-full bg-transparent text-[12px] border-none outline-none"
                    />
                </div>
                <button className="bg-[#D3D3D3] w-[100px] h-[40px] rounded-full hover:bg-brand_solid_gradient hover:text-white transition-all duration-200">
                    <p className="text-[14px]">Apply</p>
                </button>
            </div> */}

            <div className="mt-11 text-[15px] flex flex-col gap-4">
                {
                    loading ? <FlashDealSkeleton /> : <>
                        {deals.length > 0 ? <>
                            <p className="font-semibold text-[17px]">Special offers for you</p>

                            <FlashDealCard deals={deals} />
                        </> : <EmptyList message="No expired coupons" writeup="There are currently no coupons that have passed their expiration date." Icon={<Store size={40} className="text-brand_solid_gradient" />} />}
                    </>
                }
            </div>
        </div>
    );
}
