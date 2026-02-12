"use client";
import NotificationTable from '@/app/pages/ordersandaccount/components/NotificationTable'
import { Notification as NotificationType } from '@/lib/types'
import { useEffect, useState } from 'react'
import EmptyNotification from '@/components/EmptyNotification'
import { timeAgo } from '@/lib/utils';
import { useParams } from 'next/navigation';
import FlashSaleNotificationCom from '@/app/pages/ordersandaccount/components/FlashSaleNotificationCom';
import { useNotification } from '@/api/customHooks';
import { useNotificationStore } from '@/lib/stores/notification-store';
import { Trash } from 'lucide-react';

export const TimerInterval = ({ date }: { date: string }) => {
    const [time, setTimer] = useState(timeAgo(date));

    useEffect(() => {
        const timer = setInterval(() => {
            setTimer(timeAgo(date));
        }, 60000);
        return () => clearInterval(timer);
    }, [date]);

    return <>{time}</>
}

export default function Notification() {
    const params = useParams();
    const { getNotifications, deleteNotificationFromDb } = useNotification();
    const { notifications, setNotifications, deleteNotification, markAsRead } = useNotificationStore();

    const handleDeleteNotification = async (id: string) => {
        deleteNotification(id);
        await deleteNotificationFromDb(id)
    }

    useEffect(() => {
        (async () => {
            let data = await getNotifications();
            setNotifications(data.filter((item: NotificationType) => {
                if (params.type === "all") {
                    return true;
                }
                return item.type === params.type;
            }));
        })()




    }, [params.type])
    return (
        <div className="px-5 lg:px-14 lg:mt-4 font-poppins">
            <NotificationTable />

            <div className="mt-10 h-[60vh] overflow-y-auto">


                {notifications.length === 0 ? <EmptyNotification /> : notifications.map((notification, index) => (

                    <div key={index} className="border p-4 mb-4  rounded-xl">

                        <div className="flex justify-between items-center">
                            <div className='grid gap-2'>

                                {notification.type === "flashsale" ? <FlashSaleNotificationCom notification={notification} /> : <>
                                    <h1 className="font-bold">{notification.title}</h1>
                                    <p className="text-sm">{notification.message}</p>
                                    <p className="text-xs capitalize">
                                        <TimerInterval date={notification.createdAt} />
                                    </p>
                                </>}

                            </div>
                            <Trash className='text-red-500 cursor-pointer' onClick={() => handleDeleteNotification(notification._id)} />
                        </div>


                    </div>
                ))}
            </div>
        </div >
    )
}
