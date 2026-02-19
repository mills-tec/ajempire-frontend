"use client";
import NotificationTable from '@/app/pages/ordersandaccount/components/NotificationTable'
import { useEffect, useState } from 'react'
import EmptyNotification from '@/components/EmptyNotification'
import { timeAgo } from '@/lib/utils';
import { useParams } from 'next/navigation';
import FlashSaleNotificationCom from '@/app/pages/ordersandaccount/components/FlashSaleNotificationCom';
import { useNotification } from '@/api/customHooks';
import { useNotificationStore } from '@/lib/stores/notification-store';
import { Trash } from 'lucide-react';
import { getUser } from '@/lib/api';
import Pusher from 'pusher-js';
import { Notification as NotificationTYpe } from '@/lib/types';

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
    const { deleteNotificationFromDb, markAsReadFromDb } = useNotification();
    const { notifications, deleteNotification, markAsRead, updateNotifications } = useNotificationStore();

    const handleDeleteNotification = async (id: string) => {
        deleteNotification(id);
        await deleteNotificationFromDb(id)
    }

    const handleMarkRead = async () => {
        const user = getUser()?._id
        markAsRead(user!);

        await markAsReadFromDb();
    }


    useEffect(() => {
        if (!notifications.length) return

        (async () => {
            await handleMarkRead();
        })()
    }, [notifications.length])

    useEffect(() => {
        const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_APP_KEY!, {
            cluster: process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER!,
            forceTLS: true,
        });

        const channel = pusher.subscribe('public-channel');

        channel.bind('new-notification', (data: { message: NotificationTYpe }) => {
            updateNotifications(data.message)
        });
    }, [])


    return (
        <div className="px-5 lg:px-14 lg:mt-4 font-poppins">
            <NotificationTable />

            <div className="mt-10 h-[60vh] overflow-y-auto">


                {notifications.length === 0 || notifications.filter((notification) => params.type === "all" ? true : notification.type === params.type).length === 0 ? <EmptyNotification /> : notifications.filter((notification) => params.type === "all" ? true : notification.type === params.type).map((notification, index) => (

                    <div key={index} className="border p-4 mb-4  rounded-xl">

                        <div className="flex justify-between items-center">
                            <div className='grid gap-2'>

                                {notification.type === "flashsale" ? <FlashSaleNotificationCom notification={notification} /> : <>
                                    <h1 className="font-bold w-[80%] md:w-full">{notification.title}</h1>
                                    <p className="text-sm w-[80%] md:w-full">{notification.message}</p>
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
