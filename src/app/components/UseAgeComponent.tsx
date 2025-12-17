'use client'
import React, { useEffect, useState } from 'react'
import UserUsageChart from './UserUsageChart'
import axios from 'axios'
import { getBearerToken } from '@/lib/api'
import ProfileName from './ui/ProfileName'
import RecentPurchases from './ui/RecentPurchases'
interface UsageStats {
  ordersThisMonth: number;
  totalSpentThisMonth: number;
  totalCoupons: number;
  spendingTrendData: any[];
  recentPurchases: any[];
}
export const UseAgeComponent = () => {
  const [usageData, setUsageData] = useState<UsageStats | null>(null);

  useEffect(() => {
    const useAgeData = async () => {
      const token = getBearerToken();
      try {
        const res = await axios.get('https://ajempire-backend.vercel.app/api/stats',
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
        if (res.data.message.stats) {
          console.log("Fetched usage data:", res.data.message.stats);
          setUsageData(res.data.message.stats);
        }
      } catch (err) {
        console.error("Error fetching usage data:", err);
      }
    }
    useAgeData();
  }, [])
  return (
    <div className='w-full relative'>
      <div className='font-poppins flex flex-col lg:flex-row justify-around '>
        <div className='flex flex-col items-start gap-5'>
          <h1 className='text-[24px] font-medium'>My Uage</h1>
          <div className='flex items-center gap-1 '>
            <ProfileName />
          </div>
          {
            usageData && (
              <div className='flex gap-3'>
                <div className='font-poppins bg-brand_light_pink w-[120px] h-[110px] flex flex-col items-center pt-3 gap-2  rounded-sm'>
                  <div className='text-center opacity-60'>
                    <p className='text-[14px]'>Orders </p>
                    <p className='text-[14px]'>this month</p>
                  </div>
                  <p className='text-primaryhover text-[30px]'>{usageData.ordersThisMonth}</p>
                </div>
                <div className='font-poppins bg-brand_light_pink w-[120px] h-[110px] flex flex-col items-center pt-3 gap-2 rounded-sm'>
                  <div className='text-center opacity-60'>
                    <p className='text-[14px]'>Total Spent </p>
                    <p className='text-[14px]'>this month</p>
                  </div>
                  <p className='text-primaryhover text-[30px]'>{usageData.totalSpentThisMonth}</p>
                </div>
                <div className='font-poppins bg-brand_light_pink w-[120px] h-[110px] flex flex-col items-center pt-3 gap-2 rounded-sm'>
                  <p className='text-center opacity-60 text-[14px]'>Coupons</p>
                  <p className='text-primaryhover text-[30px]'>{usageData.totalCoupons}</p>
                </div>
              </div>
            )
          }
        </div>

        <div className=''>
          <UserUsageChart trendData={usageData?.spendingTrendData} />
        </div>
      </div>
      <div className='absolute w-full top-72'>
        <RecentPurchases recentPurchases={usageData?.recentPurchases} />
      </div>
    </div>
  )
}
