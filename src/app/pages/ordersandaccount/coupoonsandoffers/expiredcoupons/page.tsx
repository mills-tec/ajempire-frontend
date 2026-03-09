"use client";

import { mapCouponToDeal } from "@/lib/couponMapper";
import CouponsTab from "../../components/CouponsTab";
import FlashDealCard from "../../components/FlashDealCard";
import { getCoupons } from "@/lib/api";
import { useEffect, useState } from "react";
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

export default function ExpiredCoupons() {
    const [deals, setDeals] = useState<Deal[]>([])
    useEffect(() => {
        const fetchCoupons = async () => {
            const res = await getCoupons();
            if (!res) return;

            const allDeals = res.message.map(mapCouponToDeal);

            // UNUSED = not expired
            const unusedDeals = allDeals.filter(
                (deal) => deal.status === "expired"
            );

            setDeals(unusedDeals);
        };

        fetchCoupons();
    }, []);
    console.log(deals, "deals");
    return (
        <div className="w-full px-6  lg:block  font-poppins">
            <CouponsTab />
            <div className="mt-11 text-[15px] flex flex-col gap-4">
                <p>Your Expired Coupons will appear here</p>
                <FlashDealCard deals={deals} />
            </div>
        </div>
    )
}