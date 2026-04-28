"use client";
import React, { useEffect, useState } from "react";
import UserUsageChart from "./UserUsageChart";
import ProfileName from "./ui/ProfileName";
import RecentPurchases from "./ui/RecentPurchases";
import UsageSkeleton from "./UsageSkeleton";
import { API_URL, getBearerToken } from "@/lib/api";
import axios from "axios";
interface UsageStats {
  ordersThisMonth: number;
  totalSpentThisMonth: number;
  totalCoupons: number;
  spendingTrendData: any[];
  recentPurchases: any[];
}

const useAgeData = async (setUsageData: React.Dispatch<React.SetStateAction<UsageStats | null>>, setLoading: React.Dispatch<React.SetStateAction<boolean>>) => {
  const token = getBearerToken();
  try {
    const res = await axios.get(`${API_URL}/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.data.message.stats) {
      setUsageData(res.data.message.stats);
    }
  } catch (err) {
    console.error("Error fetching usage data:", err);
  } finally {
    setLoading(false);
  }
};

export const UseAgeComponent = () => {
  const [usageData, setUsageData] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    useAgeData(setUsageData, setLoading);
  }, []);

  if (loading) return <UsageSkeleton />;

  console.log(usageData);
  return (
    <div className="w-full lg:relative lg:flex-row lg:gap-0 flex flex-col gap-10">
      <div className="w-full font-poppins flex flex-col gap-16 lg:flex-row justify-around ">
        <div className="flex flex-col items-start gap-5">
          <h1 className="text-[24px] font-medium">My Usage</h1>
          <div className="flex items-center gap-1 w-full ">
            <ProfileName />
          </div>
          {usageData && (
            <div className="flex gap-3 w-full ">
              <div className="font-poppins bg-brand_light_pink w-[120px] h-[110px] flex flex-col items-center pt-3 gap-2  rounded-sm">
                <div className="text-center opacity-60">
                  <p className="text-[14px]">Orders </p>
                  <p className="text-[14px]">this month</p>
                </div>
                <p className="text-primaryhover text-[30px]">
                  {usageData.ordersThisMonth}
                </p>
              </div>
              <div className="font-poppins bg-brand_light_pink w-fit px-5 h-[110px] flex flex-col items-center pt-3 gap-2 rounded-sm">
                <div className="text-center opacity-60">
                  <p className="text-[14px]">Total Spent </p>
                  <p className="text-[14px]">this month</p>
                </div>
                <p className="text-primaryhover text-[30px]">
                  {Number(usageData.totalSpentThisMonth).toLocaleString(
                    "en-NG",
                    { style: "currency", currency: "NGN" },
                  )}
                </p>
              </div>
              <div className="font-poppins bg-brand_light_pink w-[120px] h-[110px] flex flex-col items-center  pt-3 gap-2 rounded-sm">
                <p className="text-center opacity-60 text-[14px]">Coupons</p>
                <p className="text-primaryhover text-[30px]">
                  {usageData.totalCoupons}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="w-full">
          <UserUsageChart trendData={usageData?.spendingTrendData} />
        </div>
      </div>

      <div className="lg:absolute w-full lg:top-72">
        <RecentPurchases recentPurchases={usageData?.recentPurchases} />
      </div>
    </div>
  );
};
