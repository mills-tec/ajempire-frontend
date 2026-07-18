'use client'
import { useAuth } from '@/contexts/AuthContext'
import { FileText, Folder, Gift, ImagePlay, LayoutDashboard, LogOut, Package, RotateCcw, Settings, ShoppingBag, Truck, Users, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

interface SidebarProps {
    onClose?: () => void;
}

const Sidebar = ({ onClose }: SidebarProps) => {
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout } = useAuth();
    const isJunior = user?.role?.toLowerCase() === 'junior';

    const currentPath = (_path: string) => {
        if (_path === "/admin") {
            return pathname === "/admin";
        }
        return pathname.startsWith(_path);
    }

    const handleLogout = () => {
        logout();
        router.push('/admin/login');
        onClose?.();
    };

    const handleLinkClick = () => {
        onClose?.();
    };

    const links = [
        {
            href: "/admin",
            icon: <LayoutDashboard size={18} color={currentPath("/admin") ? "white" : "black"} />,
            label: "Dashboard"
        },
        {
            href: "/admin/orders",
            icon: <ShoppingBag size={18} color={currentPath("/admin/orders") ? "white" : "black"} />,
            label: "Orders"
        },
        {
            href: "/admin/categories",
            icon: <Folder size={18} color={currentPath("/admin/categories") ? "white" : "black"} />,
            label: "Categories"
        },
        {
            href: "/admin/inventory",
            icon: <Package size={18} color={currentPath("/admin/inventory") ? "white" : "black"} />,
            label: "Inventory"
        },
        {
            href: "/admin/customers",
            icon: <Users size={18} color={currentPath("/admin/customers") ? "white" : "black"} />,
            label: "Customers"
        },
        {
            href: "/admin/returns",
            icon: <RotateCcw size={18} color={currentPath("/admin/returns") ? "white" : "black"} />,
            label: "Return"
        },
        {
            href: "/admin/delivery",
            icon: <Truck size={18} color={currentPath("/admin/delivery") ? "white" : "black"} />,
            label: "Delivery"
        },
        {
            href: "/admin/content-management",
            icon: <FileText size={18} color={currentPath("/admin/content-management") ? "white" : "black"} />,
            label: "Content Management"
        },
        {
            href: "/admin/promotions",
            icon: <Gift size={18} color={currentPath("/admin/promotions") ? "white" : "black"} />,
            label: "Promotions"
        },
        {
            href: "/admin/banners",
            icon: <ImagePlay size={18} color={currentPath("/admin/banners") ? "white" : "black"} />,
            label: "Banners"
        },
        {
            href: "/admin/settings",
            icon: <Settings size={18} color={currentPath("/admin/settings") ? "white" : "black"} />,
            label: "Settings"
        },
    ]

    const filteredLinks = isJunior
        ? links.filter(link => link.href === "/admin" || link.href === "/admin/inventory")
        : links;

    return (
        <aside className='bg-white w-[240px] h-screen px-4 pt-4 flex flex-col'>
            {/* Mobile close button */}
            <div className="flex justify-between items-center lg:hidden">
                <div className="relative w-20 h-12">
                    <Image
                        src="/aj-gredientlogo.png"
                        alt="Company Logo"
                        fill
                        priority
                        className="object-contain"
                         sizes="(max-width: 640px) 50vw,
         (max-width: 1024px) 33vw,
         25vw"
                    />
                </div>
                <button
                    onClick={onClose}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                    <X size={20} className="text-gray-600" />
                </button>
            </div>

            {/* Desktop logo */}
            <div className="hidden lg:block relative w-20 h-12">
                <Image
                    src="/aj-gredientlogo.png"
                    alt="Company Logo"
                    fill
                    priority
                    className="object-contain"
                    sizes="80px"
                />
            </div>

            <ul className='mt-6 flex flex-col gap-y-1'>
                {filteredLinks.map((link, index) => (
                    <Link
                        key={index}
                        href={link.href}
                        onClick={handleLinkClick}
                        className={`flex items-center gap-2 ${currentPath(link.href) ? "bg-brand_solid_gradient text-white" : "text-black"} p-2.5 rounded-xl transition-all`}
                    >
                        {link.icon}
                        <li className={`text-xs`}>{link.label}</li>
                    </Link>
                ))}
            </ul>

            <div className="mt-auto mb-6">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 p-2.5 text-brand_pink hover:bg-brand_pink/5 w-full rounded-xl transition-colors"
                >
                    <LogOut size={18} />
                    <span className="text-xs font-medium">Logout</span>
                </button>
            </div>
        </aside>
    )
}

export default Sidebar
