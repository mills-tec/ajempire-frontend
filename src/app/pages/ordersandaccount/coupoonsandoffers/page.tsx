"use client";
import { useEffect, useState } from "react";
import CouponsTab from "../components/CouponsTab";
import FlashDealCard from "../components/FlashDealCard";
import { getCoupons } from "@/lib/api";
import { mapCouponToDeal } from "@/lib/couponMapper";
type Deal = {
    id: string | number;
    title: string;
    description?: string;
    discountPercent: number;
    validUntil?: string;
    code: string;
    ctaText?: string;
    status: "unused" | "used" | "expired";
};



export default function CouponsAndOffers() {
    const [deals, setDeals] = useState<Deal[]>([])
    useEffect(() => {
        const fetchCoupons = async () => {
            const res = await getCoupons();
            if (!res) return;

            const allDeals = res.message.map(mapCouponToDeal);

            // UNUSED = not expired
            const unusedDeals = allDeals.filter(
                (deal) => deal.status === "unused"
            );

            setDeals(unusedDeals);
        };

        fetchCoupons();
    }, []);
    console.log(deals, "deals");

    const unusedDeals: Deal[] = [
        {
            id: 1,
            title: "30% off Nail Kits",
            description: "Applicable on nail kits only",
            discountPercent: 30,
            validUntil: "01-06-2025",
            code: "NAIL30",
            ctaText: "Get",
            status: "unused",
        },
        {
            id: 2,
            title: "20% off Orders above ₦10,000",
            description: "Valid for 24 hours only",
            discountPercent: 20,
            validUntil: "01-06-2025",
            code: "BIG20",
            ctaText: "Get Code",
            status: "unused",
        },
    ];

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
                <p className="font-semibold text-[17px]">Special offers for you</p>
                <FlashDealCard deals={deals} />
            </div>
        </div>
    );
}
