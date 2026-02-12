"use client";
import NotificationTable from '@/app/pages/ordersandaccount/components/NotificationTable'
import { Notification as NotificationType } from '@/lib/types'
import { useEffect, useState } from 'react'
import EmptyNotification from './EmptyNotification'
import { timeAgo } from '@/lib/utils';
import { useParams } from 'next/navigation';
import FlashSaleNotificationCom from '@/app/pages/ordersandaccount/components/FlashSaleNotificationCom';

export default function Notification({ data }: { data: NotificationType[] }) {
    const [notifications, setNotifications] = useState<NotificationType[]>([]);
    const params = useParams();

    useEffect(() => {
        if (params.type !== "all") {
            setNotifications(data.filter((notification) => notification.type === params.type));
            return;
        }

        setNotifications(data);

    }, [params.type])
    return (
        <div className="px-5 lg:px-14 lg:mt-4 font-poppins">
            <NotificationTable />

            <div className="mt-10 h-[60vh] overflow-y-auto">


                {notifications.length === 0 ? <EmptyNotification /> : notifications.map((notification, index) => (

                    <div key={index} className="border p-4 mb-4 grid gap-2 rounded-xl">
                        {
                            params.type === "order" || params.type === "all" ? <>
                                <h1 className="font-bold">{notification.title}</h1>
                                <p className="text-sm">{notification.message}</p>
                                <p className="text-xs capitalize">{timeAgo(notification.createdAt)}</p>
                            </> : <FlashSaleNotificationCom />
                        }

                    </div>
                ))}
            </div>
        </div>
    )
}
