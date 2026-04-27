'use client';

import { HomeIcon } from '@/components/svgs/HomeIcon'
import { Bell, LogOut, Menu } from 'lucide-react'
import React from 'react'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

interface HeaderProps {
    onMenuClick?: () => void;
}

const Header = ({ onMenuClick }: HeaderProps) => {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    
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

    const handleLogout = () => {
        logout();
    };

    return (
        <header className='w-full bg-white flex justify-between p-4 items-center border'>
            <div className="flex items-center gap-4">
                {/* Mobile menu button */}
                <button
                    onClick={onMenuClick}
                    className='lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors'
                >
                    <Menu size={20} className="text-gray-600" />
                </button>
                
                <div>
                    <h2 className='text-xl font-medium mb-1'>{pageTitle}</h2>
                    {/* Breadcrumb */}
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
                <div className='bg-gray-50 p-2 rounded-xl border relative'>
                    <Bell size={18} />
                    <div className='w-2 h-2 bg-brand_pink rounded-full absolute -top-1 right-0' />
                </div>
                
                {/* User info - hide on smaller mobile screens */}
                <div className='hidden sm:flex bg-gray-50 p-1.5 pr-12 rounded-2xl border gap-2 items-center'>
                    <div className='rounded-full w-10 h-10 bg-black/10' />
                    <div className='flex-col'>
                        <h2 className='font-semibold text-xs'>{user?.name || 'Admin User'}</h2>
                        <p className='text-gray-500 text-[10px]'>{user?.role || 'Administrator'}</p>
                    </div>
                </div>
                
                {/* Logout button - always visible */}
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