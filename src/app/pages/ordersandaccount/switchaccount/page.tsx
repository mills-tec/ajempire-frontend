"use client"
import AuthWrapper from '@/app/components/auth-component/AuthWrapper'
import { useAuthStore } from '@/lib/stores/auth-store'
import { getInitials } from '@/lib/utils'
import { Check, Plus } from 'lucide-react'
import React, { useState } from 'react'

export default function SwitchAccount() {

    const savedAccounts = typeof window !== "undefined" ? localStorage.getItem("savedAccounts") : null
    const accounts = savedAccounts ? JSON.parse(savedAccounts) : []
    const [showIntro, setShowIntro] = useState(false);
    const { setUser, user } = useAuthStore()

    const handleSwitchAccount = (account: any) => {
        if (typeof window !== "undefined") {
            localStorage.setItem("ajempire_signin_user", JSON.stringify({ token: account.token, user: account.user }));
            setUser({ email: account.email, name: account.user.fullname })
        }
    }

    return (
        <div className='p-10'>
            <div className='bg-white font-poppins p-10'>
                <div className='flex items-center gap-4 mb-10'>
                    <p className='text-lg font-semibold'>Switch Account</p>
                </div>

                <div className='grid md:grid-cols-3 gap-6'>
                    {
                        accounts.map((account: any, index: number) => (
                            <div onClick={() => handleSwitchAccount(account)} key={index} className='md:col-span-2 p-4 bg-white border border-[#00000033] flex gap-5 items-center justify-between cursor-pointer'>
                                <div className='flex gap-5 items-center'>
                                    <div className='w-10 h-10 bg-[#D9D9D9]  rounded-full flex items-center justify-center'>
                                        <p className='text-lack text-sm font-semibold'>{getInitials(account.user.fullname)}</p>
                                    </div>
                                    <div className=''>
                                        <p className='font-semibold'>{account.user.fullname}</p>
                                        <p className='text-sm opacity-80'>{account.email}</p>
                                    </div>
                                </div>
                                {account.email === user?.email && (
                                    <Check />
                                )}
                            </div>
                        ))
                    }


                    <div onClick={() => setShowIntro(true)} className='md:col-span-2 p-4 bg-white border border-[#00000033] flex gap-5 items-center justify-between cursor-pointer'>
                        <div className='flex gap-5 items-center'>
                            <div className='w-10 h-10 bg-[#D9D9D9]  rounded-full flex items-center justify-center'>
                                <Plus />
                            </div>
                            <p className='text-sm opacity-80'>Add Account</p>

                        </div>


                    </div>

                    {showIntro && <AuthWrapper onClose={() => setShowIntro(false)} />}
                </div>


            </div>
        </div>
    )
}
