'use client';

import { HomeIcon } from '@/components/svgs/HomeIcon';
import { useAuth } from '@/contexts/AuthContext';
import { AdminNotification, buildAdminNotifications } from '@/lib/admin-notifications';
import { getProducts, getReturns, getUserOrders } from '@/lib/adminapi';
import { Bell, LogOut, Menu, Package, RotateCcw, ShoppingBag, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';

interface HeaderProps {
    onMenuClick?: () => void;
}

const Header = ({ onMenuClick }: HeaderProps) => {
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout } = useAuth();
    const adminRole = user?.role || 'Administrator';
    const [notifications, setNotifications] = useState<AdminNotification[]>([]);
    const [readNotificationIds, setReadNotificationIds] = useState<string[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const notificationRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const stored = localStorage.getItem('readAdminNotifications');
        if (stored) {
            try {
                setReadNotificationIds(JSON.parse(stored));
            } catch {
                setReadNotificationIds([]);
            }
        }
    }, []);

    const markAsRead = (id: string) => {
        if (!readNotificationIds.includes(id)) {
            const updated = [...readNotificationIds, id];
            setReadNotificationIds(updated);
            localStorage.setItem('readAdminNotifications', JSON.stringify(updated));
        }
    };

    const markAllAsRead = () => {
        const allIds = notifications.map(n => n.id);
        const updated = Array.from(new Set([...readNotificationIds, ...allIds]));
        setReadNotificationIds(updated);
        localStorage.setItem('readAdminNotifications', JSON.stringify(updated));
    };

    useEffect(() => {
        const loadNotifications = async () => {
            try {
                const [ordersRes, returnsRes, productsRes] = await Promise.all([
                    getUserOrders(),
                    getReturns(),
                    getProducts(),
                ]);

                const orders = Array.isArray(ordersRes.message) ? ordersRes.message : [];
                const returns = Array.isArray(returnsRes.message)
                    ? returnsRes.message
                    : Array.isArray(returnsRes.data)
                        ? returnsRes.data
                        : [];

                const productsData = productsRes.message as unknown as { products?: unknown[] };
                const products = productsData?.products
                    ? productsData.products
                    : Array.isArray(productsRes.message)
                        ? productsRes.message
                        : [];

                setNotifications(buildAdminNotifications(orders, returns, products));
            } catch {
                setNotifications([]);
            }
        };
        loadNotifications();
    }, []);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (notificationRef.current && !notificationRef.current.contains(e.target as Node)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getPageTitle = () => {
        const pathSegments = pathname.split('/').filter(segment => segment);
        const currentPage = pathSegments[pathSegments.length - 1];

        switch (currentPage) {
            case 'admin':
                return 'Dashboard';
            case 'orders':
                return 'Order';
            case 'inventory':
                return 'Inventory';
            default:
                return currentPage ? currentPage.charAt(0).toUpperCase() + currentPage.slice(1) : 'Dashboard';
        }
    };

    const getBreadcrumbs = () => {
        const pathSegments = pathname.split('/').filter(segment => segment);
        return pathSegments.map((segment, index) => {
            const formattedSegment = segment === 'admin' ? 'Home' :
                segment === 'orders' ? 'Order' :
                    segment.charAt(0).toUpperCase() + segment.slice(1);
            return {
                name: formattedSegment,
                isLast: index === pathSegments.length - 1
            };
        });
    };

    const pageTitle = getPageTitle();
    const breadcrumbs = getBreadcrumbs();
    const unreadCount = notifications.filter(n => !readNotificationIds.includes(n.id)).length;

    const notificationIcon = (type: AdminNotification['type']) => {
        switch (type) {
            case 'order': return <ShoppingBag size={14} className="text-blue-500" />;
            case 'return': return <RotateCcw size={14} className="text-orange-500" />;
            case 'inventory': return <Package size={14} className="text-red-500" />;
            default: return <Bell size={14} className="text-gray-500" />;
        }
    };

    const handleLogout = () => {
        logout();
    };

    return (
        <header className='w-full bg-white flex justify-between p-4 items-center border'>
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className='lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors'
                >
                    <Menu size={20} className="text-gray-600" />
                </button>

                <div>
                    <h2 className='text-xl font-medium mb-1'>{pageTitle}</h2>
                    <div className='flex items-center gap-2 text-sm text-gray-600'>
                        {breadcrumbs.map((crumb, index) => (
                            <React.Fragment key={index}>
                                {index > 0 && <span>/</span>}
                                {crumb.name === 'Home' ? (
                                    <span>
                                        <HomeIcon size={16} color='#ff008c' />
                                    </span>
                                ) : (
                                    <span className={crumb.isLast ? 'text-pink-500' : ''}>
                                        {crumb.name}
                                    </span>
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </div>

            <div className='flex items-center gap-3'>
                <div className='relative' ref={notificationRef}>
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className='bg-gray-50 p-2 rounded-xl border relative hover:bg-gray-100 transition-colors'
                        aria-label="Notifications"
                    >
                        <Bell size={18} />
                        {unreadCount > 0 && (
                            <div className='w-4 h-4 bg-brand_pink rounded-full absolute -top-1 -right-1 flex items-center justify-center animate-pulse'>
                                <span className='text-white text-[8px] font-bold'>{unreadCount > 9 ? '9+' : unreadCount}</span>
                            </div>
                        )}
                    </button>

                    {showNotifications && (
                        <div className='absolute right-0 top-full mt-2 w-80 bg-white border rounded-xl shadow-lg z-50 overflow-hidden'>
                            <div className='px-4 py-3 border-b flex justify-between items-center bg-gray-50/30'>
                                <div>
                                    <h3 className='font-semibold text-sm text-gray-800'>Notifications</h3>
                                    <p className='text-[10px] text-gray-400'>{unreadCount} unread alert{unreadCount !== 1 ? 's' : ''}</p>
                                </div>
                                {unreadCount > 0 && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            markAllAsRead();
                                        }}
                                        className='text-[10px] text-brand_pink hover:underline font-bold transition-all'
                                    >
                                        Mark all as read
                                    </button>
                                )}
                            </div>
                            <div className='max-h-72 overflow-y-auto divide-y divide-gray-50'>
                                {notifications.length === 0 ? (
                                    <p className='px-4 py-6 text-sm text-gray-400 text-center'>No notifications</p>
                                ) : (
                                    notifications.map((notification) => {
                                        const isUnread = !readNotificationIds.includes(notification.id);
                                        return (
                                            <button
                                                key={notification.id}
                                                onClick={() => {
                                                    markAsRead(notification.id);
                                                    setShowNotifications(false);
                                                    if (notification.link) router.push(notification.link);
                                                }}
                                                className={`w-full px-4 py-3 flex items-start gap-3 hover:bg-gray-50 text-left transition-colors relative ${
                                                    isUnread ? 'bg-brand_pink/[0.01]' : 'opacity-70 hover:opacity-100'
                                                }`}
                                            >
                                                <div className='mt-0.5 p-1.5 bg-gray-50 rounded-lg'>
                                                    {notificationIcon(notification.type)}
                                                </div>
                                                <div className='flex-1 min-w-0'>
                                                    <p className={`text-xs text-gray-800 ${isUnread ? 'font-bold' : 'font-medium'}`}>{notification.title}</p>
                                                    <p className='text-[10px] text-gray-500 truncate'>{notification.message}</p>
                                                    <p className='text-[9px] text-gray-400 mt-1'>
                                                        {new Date(notification.createdAt).toLocaleDateString('en-GB', {
                                                            day: 'numeric',
                                                            month: 'short',
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                        })}
                                                    </p>
                                                </div>
                                                {isUnread && (
                                                    <div className='w-2 h-2 bg-brand_pink rounded-full self-center flex-shrink-0' />
                                                )}
                                            </button>
                                        );
                                    })
                                )}
                            </div>
                            {notifications.length > 0 && (
                                <div className='px-4 py-2 border-t'>
                                    <Link
                                        href='/admin/orders'
                                        onClick={() => setShowNotifications(false)}
                                        className='text-xs text-brand_pink font-medium hover:underline'
                                    >
                                        View all orders
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className='hidden sm:flex bg-gray-50 p-1.5 pr-12 rounded-2xl border gap-2 items-center'>
                    <div className='rounded-full w-10 h-10 bg-black/10 flex items-center justify-center text-white' >
                    <User/>
                    </div>
                    <div className='flex-col'>
                        <h2 className='font-semibold text-xs'>Administrator</h2>
                        <p className='text-gray-500 text-[10px] capitalize'>{adminRole}</p>
                    </div>
                </div>

                <button
                    onClick={handleLogout}
                    className='bg-gray-50 p-2 rounded-xl border hover:bg-gray-100 transition-colors'
                    title='Logout'
                >
                    <LogOut size={18} className='text-gray-600' />
                </button>
            </div>
        </header>
    )
}

export default Header
