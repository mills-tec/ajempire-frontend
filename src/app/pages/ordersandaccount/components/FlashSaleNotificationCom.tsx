"use client"
import { Notification } from "@/lib/types";
import Link from "next/link";
import { useEffect, useState } from "react";

const CountdownTimer = ({ endDate }: { endDate: string }) => {
    const calculateTimeLeft = () => {
        const difference = +new Date(endDate) - +new Date();
        let timeLeft = {};

        if (difference > 0) {
            timeLeft = {
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
            };
        }
        return timeLeft;
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setTimeout(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearTimeout(timer);
    }, [timeLeft]);




    return (
        <div className="w-16 h-[20px] text-primaryhover text-[13.33px] bg-[#FFD9EE] text-center rounded-sm flex justify-between items-center p-2">
            {Object.entries(timeLeft).map(([unit, value], index) => {
                console.log(unit)
                return <span key={unit} className="">
                    {value!.toString().padStart(2, "0")}
                    {index !== Object.keys(timeLeft).length - 1 && ":"}
                </span>
            })}
        </div>

    );
};

export default function FlashSaleNotificationCom({ notification }: { notification: Notification }) {

    return (
        <div className="flex justify-between  ">
            <div className="flex items-center gap-4">
                <div className="w-26 h-20">
                    <img src={notification.data?.product.cover_image} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col gap-2">
                    <p className="text-[#2B2B2B] text-[16px]" >{notification.title}</p>
                    <p className="text-[13px] text-primaryhover capitalize">{notification.message}</p>
                    <div className="flex items-center gap-2">
                        <p className="bg-[#FFD9EE] w-[38px] h-[20px] text-center flex items-center justify-center text-[11.11px] border border-primaryhover rounded-sm">-{notification.data?.discount}%</p>
                        <p className="text-[#2B2B2B] text-[11.11px] line-through">{Number(notification.data?.product.price).toLocaleString("en-ng", { style: "currency", currency: "NGN" })}</p>

                        <p className="text-[#2B2B2B] text-[11.11px]">{Number(notification.data?.product.price! - (notification.data?.product.price! * notification.data?.discount! / 100)).toLocaleString("en-ng", { style: "currency", currency: "NGN" })}</p>
                    </div>
                    <Link href={`/product/${notification.data?.product._id}`} className="bg-brand_solid_gradient w-[92px] h-[30px] text-[13px] text-white rounded-sm flex items-center justify-center">Shop Now</Link>
                </div>
            </div>
            <div className="flex  items-end">
                <CountdownTimer endDate={notification.data?.endTime!} />

            </div>
        </div>
    )
}