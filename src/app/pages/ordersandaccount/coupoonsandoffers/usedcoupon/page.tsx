"use client";
import CouponsTab from "../../components/CouponsTab";
import FlashDealCard from "../../components/FlashDealCard";
import { useEffect, useState } from "react";
import { getCoupons } from "@/lib/api";
import { ICoupon } from "../page";
import FlashDealSkeleton from "@/components/FlashDealSkeleton";
import EmptyList from "@/components/EmptyList";
import { Store } from "lucide-react";


export default function UsedCouPon() {
    const [deals, setDeals] = useState<ICoupon[]>([]);
    const [loading, setLoading] = useState<boolean>(true)
    useEffect(() => {
        const fetchCoupons = async () => {
            try {
                const res = await getCoupons("used");
                if (!res) return;

                setDeals(res.message.map(item => ({ ...item, status: "used" })));
            } catch {

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
                {
                    loading ? <FlashDealSkeleton /> : <>
                        {deals.length > 0 ? <>
                            <p className="font-semibold text-[17px]">Special offers for you</p>

                            <FlashDealCard deals={deals} />
                        </> : <EmptyList message="No used coupons" writeup="There are currently no coupons that have been used by you." Icon={<Store size={40} className="text-brand_solid_gradient" />} />}
                    </>
                }
            </div>
        </div>
    )
}