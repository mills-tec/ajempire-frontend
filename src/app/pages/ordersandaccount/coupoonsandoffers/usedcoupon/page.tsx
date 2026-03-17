"use client";
import { mapCouponToDeal } from "@/lib/couponMapper";
import CouponsTab from "../../components/CouponsTab";
import FlashDealCard from "../../components/FlashDealCard";
import { useEffect, useState } from "react";
import { getCoupons } from "@/lib/api";
import { ICoupon } from "../page";
import FlashDealSkeleton from "@/components/FlashDealSkeleton";


export default function UsedCouPon() {
    const [deals, setDeals] = useState<ICoupon[]>([]);
    const [loading, setLoading] = useState<boolean>(true)
    useEffect(() => {
        const fetchCoupons = async () => {
            try {
                const res = await getCoupons("used");
                console.log(res);
                if (!res) return;

                setDeals(res.message.map(item => ({ ...item, status: "used" })));
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

            <div className="mt-11 text-[15px] flex flex-col gap-4">
                {loading ? <>


                    <FlashDealSkeleton />
                </> : <> <p>Your Used Coupons will appear here</p> <FlashDealCard deals={deals} /></>}

            </div>
        </div>
    )
}