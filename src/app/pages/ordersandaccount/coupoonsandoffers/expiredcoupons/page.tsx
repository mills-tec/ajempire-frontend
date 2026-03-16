"use client";

import { mapCouponToDeal } from "@/lib/couponMapper";
import CouponsTab from "../../components/CouponsTab";
import FlashDealCard from "../../components/FlashDealCard";
import { Coupon, getCoupons } from "@/lib/api";
import { useEffect, useState } from "react";
import { ICoupon } from "../page";
import FlashDealSkeleton from "@/components/FlashDealSkeleton";
import EmptyList from "@/components/EmptyList";
import { Store } from "lucide-react";


export default function ExpiredCoupons() {
    const [deals, setDeals] = useState<ICoupon[]>([])
    const [loading, setLoading] = useState<boolean>(true);
    useEffect(() => {
        const fetchCoupons = async () => {
            try {
                const res = await getCoupons("expired");
                if (!res) return;


                setDeals(res.message.map(item => ({ ...item, status: "expired" })))

            } catch (err) {

            } finally {
                setLoading(false)
            }
        };

        fetchCoupons();
    }, []);

    return (
        <div className="w-full px-6  lg:block  font-poppins">
            <CouponsTab />
            <div className="mt-11 text-[15px] flex flex-col gap-4">

                {loading ?
                    <>

                        <FlashDealSkeleton />   </> : <>

                        {deals.length > 0 ? <>   <p>Your Expired Coupons will appear here</p>
                            <FlashDealCard deals={deals} /> </> : <EmptyList message="No expired coupons" writeup="There are currently no coupons that have passed their expiration date." Icon={<Store size={40} className="text-brand_solid_gradient" />} />}

                    </>}
            </div>
        </div>
    )
}