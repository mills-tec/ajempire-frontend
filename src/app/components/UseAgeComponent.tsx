'use client'
import React, { useEffect, useState } from 'react'
import UserUsageChart from './UserUsageChart'
import ProfileName from './ui/ProfileName'
import RecentPurchases from './ui/RecentPurchases'
import UsageSkeleton from './UsageSkeleton'
import { getUsageStats, UsageStats } from '@/lib/api'

export const UseAgeComponent = () => {
  const [usageData, setUsageData] = useState<UsageStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUsage = async () => {
      setLoading(true)
      const stats = await getUsageStats()
      setUsageData(stats)
      setLoading(false)
    }

    fetchUsage()
  }, [])

  if (loading) return <UsageSkeleton />

  return (
    <div className='w-full lg:relative lg:flex-row lg:gap-0 flex flex-col gap-10'>
      <div className='w-full font-poppins flex flex-col gap-16 lg:flex-row justify-around '>
        <div className='flex flex-col items-start gap-5'>
          <h1 className='text-[24px] font-medium'>My Usage</h1>
          <div className='flex items-center gap-1 w-full '>
            <ProfileName />
          </div>

          {usageData && (
            <div className='flex gap-3 w-full '>
              <div className='font-poppins bg-brand_light_pink w-[120px] h-[110px] flex flex-col items-center pt-3 gap-2 rounded-sm'>
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
          )}
        </div>

        <div className='w-full'>
          <UserUsageChart trendData={usageData?.spendingTrendData} />
        </div>
      </div>

      <div className='lg:absolute w-full lg:top-72'>
        <RecentPurchases recentPurchases={usageData?.recentPurchases} />
      </div>
    </div>
  )
}