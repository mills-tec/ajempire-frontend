'use client'

import { useState, useEffect } from 'react';
import { ChartPie, CornerDownLeft, FolderMinus, Megaphone, ShoppingBagIcon, UsersRound } from "lucide-react";
import LineChart from "../components/admin/LineChart";
import DoughnutChart from "../components/admin/DoughnutChart";
import WebsiteTrafficChart from "../components/admin/WebsiteTrafficChart";
import RealTimeInsight from "../components/admin/RealTimeInsight";
import TopSellingProducts from "../components/admin/TopSellingProducts";
import TopSellingCategory from "../components/admin/TopSellingCategory";
import InventoryAlert from "../components/admin/InventoryAlert";
import { getUserOrders, getProducts, getAllCategories, getReturns } from '@/lib/adminapi';

export default function AdminPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [returns, setReturns] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPeriod, setSelectedPeriod] = useState('This week');

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [ordersResponse, productsResponse, categoriesResponse, returnsResponse] = await Promise.all([
                getUserOrders(),
                getProducts(),
                getAllCategories(),
                getReturns()
            ]);

            // Transform orders data
            if (ordersResponse.message && Array.isArray(ordersResponse.message)) {
                setOrders(ordersResponse.message);
            }

            // Transform products data
            const productsData = productsResponse.message as any;
            if (productsData && productsData.products && Array.isArray(productsData.products)) {
                setProducts(productsData.products);
            } else if (productsResponse.message && Array.isArray(productsResponse.message)) {
                setProducts(productsResponse.message);
            }

            // Transform categories data
            if (categoriesResponse.message && Array.isArray(categoriesResponse.message)) {
                setCategories(categoriesResponse.message);
            }

            // Transform returns data
            if (returnsResponse.message && Array.isArray(returnsResponse.message)) {
                setReturns(returnsResponse.message);
            } else if (returnsResponse.data && Array.isArray(returnsResponse.data)) {
                setReturns(returnsResponse.data);
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Calculate dynamic statistics
    const totalSales = orders?.reduce((sum, order) => sum + (order.totalPrice || 0), 0) || 0;
    const totalCustomers = new Set(orders?.map(order => order.shippingAddress?.fullName).filter(Boolean)).size || 0;
    const totalOrders = orders?.length || 0;
    const totalProducts = products?.length || 0;
    const totalCategories = categories?.length || 0;
    const totalReturns = returns?.length || 0;
    
    // Calculate order status breakdown
    const processingOrders = orders?.filter(o => o.orderStatus === 'processing').length || 0;
    const shippingOrders = orders?.filter(o => o.orderStatus === 'shipping').length || 0;
    const deliveredOrders = orders?.filter(o => o.orderStatus === 'delivered').length || 0;
    const canceledOrders = orders?.filter(o => o.orderStatus === 'canceled').length || 0;
    
    // Calculate returns statistics
    const pendingReturns = returns?.filter(r => r.status === 'pending').length || 0;
    const approvedReturns = returns?.filter(r => r.status === 'approved').length || 0;
    const rejectedReturns = returns?.filter(r => r.status === 'rejected').length || 0;
    const completedReturns = returns?.filter(r => r.status === 'completed').length || 0;
    
    // Calculate product statistics
    const lowStockProducts = products?.filter(p => p.stock > 0 && p.stock <= 10).length || 0;
    const outOfStockProducts = products?.filter(p => p.stock === 0).length || 0;
    const featuredProducts = products?.filter(p => p.isFeatured).length || 0;
    
    // Calculate sales by category
    const salesByCategory = orders?.reduce((acc, order) => {
        const category = order.items?.[0]?.category || 'Unknown';
        acc[category] = (acc[category] || 0) + (order.totalPrice || 0);
        return acc;
    }, {} as Record<string, number>);
    
    // Top selling products
    const topSellingProducts = orders?.reduce((acc, order) => {
        order.items?.forEach((item: any) => {
            const productId = item.productId || item._id;
            if (productId) {
                acc[productId] = (acc[productId] || 0) + (item.quantity || 1);
            }
        });
        return acc;
    }, {} as Record<string, number>);
    
    // Chart data
    const orderStatusData = [
        { name: 'Processing', value: processingOrders, color: '#FFA500' },
        { name: 'Shipping', value: shippingOrders, color: '#3B82F6' },
        { name: 'Delivered', value: deliveredOrders, color: '#10B981' },
        { name: 'Canceled', value: canceledOrders, color: '#EF4444' }
    ];
    
    const salesData = orders?.map(order => ({
        date: new Date(order.createdAt).toLocaleDateString(),
        sales: order.totalPrice || 0
    })) || [];
    
    const categoryData = Object.entries(salesByCategory).map(([name, value]) => ({
        name,
        value: Number(value) || 0
    }));

    return (
        <main className="w-full h-screen overflow-y-auto">
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-white border p-4 rounded-xl flex-1">
                    <div className="flex items-center justify-between">
                        <div className='bg-brand_pink/10 p-2 rounded-xl border'>
                            <ChartPie size={18} color="#ff008c" />
                        </div>
                        <select 
                            value={selectedPeriod}
                            onChange={(e) => setSelectedPeriod(e.target.value)}
                            className="bg-transparent rounded-xl text-brand_gray font-poppins text-xs outline-none"
                        >
                            <option value="This week">This week</option>
                            <option value="This month">This month</option>
                            <option value="This year">This year</option>
                        </select>
                    </div>

                    <h4 className="mt-6 text-brand_gray_dark text-xs">Sales</h4>
                    <div className="flex items-center gap-2">
                        <p className="text-lg font-bold">₦{totalSales.toLocaleString()}</p>
                        <p className="text-green-500 text-xs">+{((totalSales / 100000) * 100).toFixed(2)}%</p>
                    </div>
                </div>

                <div className="bg-white border p-4 rounded-xl flex-1">
                    <div className="flex items-center justify-between">
                        <div className='bg-yellow-500/10 p-2 rounded-xl border'>
                            <UsersRound size={18} />
                        </div>
                        <select 
                            value={selectedPeriod}
                            onChange={(e) => setSelectedPeriod(e.target.value)}
                            className="bg-transparent rounded-xl text-brand_gray font-poppins text-xs outline-none"
                        >
                            <option value="This week">This week</option>
                            <option value="This month">This month</option>
                            <option value="This year">This year</option>
                        </select>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-12">
                        <div>
                            <h4 className="mt-6 text-brand_gray_dark text-xs">Customers</h4>
                            <div className="flex items-center gap-2">
                                <p className="text-lg font-bold">{totalCustomers}</p>
                                <p className="text-green-500 text-xs">+{((totalCustomers / 100) * 100).toFixed(2)}%</p>
                            </div>
                        </div>

                        <div>
                            <h4 className="mt-6 text-brand_gray_dark text-xs">Orders</h4>
                            <div className="flex items-center gap-2">
                                <p className="text-lg font-bold">{totalOrders}</p>
                                <p className="text-green-500 text-xs">+{((totalOrders / 100) * 100).toFixed(2)}%</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white border p-4 rounded-xl flex-1">
                    <div className="flex items-center justify-between">
                        <div className='bg-blue-500/10 p-2 rounded-xl border'>
                            <ShoppingBagIcon size={18} />
                        </div>
                        <select 
                            value={selectedPeriod}
                            onChange={(e) => setSelectedPeriod(e.target.value)}
                            className="bg-transparent rounded-xl text-brand_gray font-poppins text-xs outline-none"
                        >
                            <option value="This week">This week</option>
                            <option value="This month">This month</option>
                            <option value="This year">This year</option>
                        </select>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-12">
                        <div>
                            <h4 className="mt-6 text-brand_gray_dark text-xs">Products</h4>
                            <div className="flex items-center gap-2">
                                <p className="text-lg font-bold">{totalProducts}</p>
                                <p className="text-green-500 text-xs">+{((totalProducts / 100) * 100).toFixed(2)}%</p>
                            </div>
                        </div>

                        <div>
                            <h4 className="mt-6 text-brand_gray_dark text-xs">Categories</h4>
                            <div className="flex items-center gap-2">
                                <p className="text-lg font-bold">{totalCategories}</p>
                                <p className="text-green-500 text-xs">+{((totalCategories / 10) * 100).toFixed(2)}%</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section with chart */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
                <div className="flex flex-col gap-y-3 lg:col-span-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-gradient-to-t from-brand_solid_gradient/10 to-white border p-4 rounded-xl">
                            <div className="flex items-center justify-between">
                                <div className='bg-brand_pink/10 p-2 rounded-xl border'>
                                    <FolderMinus size={18} color="#ff008c" />
                                </div>
                            </div>

                            <h4 className="mt-6 text-brand_gray_dark text-xs">All Products</h4>
                            <div className="flex items-center gap-2">
                                <p className="text-lg font-bold">{totalProducts}</p>
                                <p className="text-green-500 text-xs">+{((totalProducts / 100) * 100).toFixed(2)}%</p>
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-xl border">
                            <div className="flex items-center justify-between">
                                <div className='bg-yellow-500/10 p-2 rounded-xl'>
                                    <CornerDownLeft size={18} />
                                </div>
                                <select 
                                    value={selectedPeriod}
                                    onChange={(e) => setSelectedPeriod(e.target.value)}
                                    className="bg-transparent rounded-xl text-brand_gray font-poppins text-xs outline-none"
                                >
                                    <option value="This week">This week</option>
                                    <option value="This month">This month</option>
                                    <option value="This year">This year</option>
                                </select>
                            </div>

                            <h4 className="mt-6 text-red-500 text-xs">Returns</h4>
                            <div className="flex items-center gap-2">
                                <p className="text-lg font-bold">{totalReturns}</p>
                                <p className="text-red-500 text-xs">{pendingReturns > 0 ? `(${pendingReturns} pending)` : ''}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border p-4 rounded-xl flex-1 flex flex-col h-full">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className='flex flex-col sm:flex-row sm:items-center gap-3'>
                                <h4 className="text-brand_gray_dark font-medium text-xs">Summary</h4>
                                <select className="bg-brand_pink/10 px-3 py-2 text-brand_pink rounded-lg font-poppins text-xs outline-none">
                                    <option value="Sales">Sales</option>
                                    <option value="Orders">Orders</option>
                                    <option value="Returns">Returns</option>
                                </select>

                                <div className="flex items-center gap-2 sm:ml-4">
                                    <p className="text-brand_pink font-bold text-sm">N{totalSales.toLocaleString()}</p>
                                </div>
                            </div>
                            <select 
                                value={selectedPeriod}
                                onChange={(e) => setSelectedPeriod(e.target.value)}
                                className="bg-transparent rounded-xl text-brand_gray font-poppins text-xs outline-none"
                            >
                                <option value="This week">Last 7 days</option>
                                <option value="This month">This month</option>
                                <option value="This year">This year</option>
                            </select>
                        </div>

                        <div className="mt-8 flex-1 h-[180px] relative">
                            <LineChart data={salesData} />
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-5">
                    <div className="bg-white p-4 rounded-xl border h-full">
                        <div className="flex items-center justify-between">
                            <h4 className="font-medium text-brand_gray_dark text-sm">Inventory Values</h4>
                            <select 
                                value={selectedPeriod}
                                onChange={(e) => setSelectedPeriod(e.target.value)}
                                className="bg-transparent rounded-xl text-brand_gray font-poppins text-xs outline-none"
                            >
                                <option value="This week">This week</option>
                                <option value="This month">This month</option>
                                <option value="This year">This year</option>
                            </select>
                        </div>
                        <div className="flex flex-col gap-2 mt-5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-brand_pink" />
                                    <p className="text-brand_gray text-sm">In Stock</p>
                                </div>
                                <p className="text-brand_gray text-sm font-medium">{products?.filter(p => p.stock > 0).length || 0}</p>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-brand_purple" />
                                    <p className="text-brand_gray text-sm">Low Stock</p>
                                </div>
                                <p className="text-brand_gray text-sm font-medium">{lowStockProducts}</p>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-red-500" />
                                    <p className="text-brand_gray text-sm">Out of Stock</p>
                                </div>
                                <p className="text-brand_gray text-sm font-medium">{outOfStockProducts}</p>
                            </div>
                        </div>

                        {/* chart placeholder fix */}
                        <div className="flex justify-center items-center mt-10">
                            <div className="relative w-32 h-32">
                                <DoughnutChart data={orderStatusData} />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-xl flex flex-col gap-4 border h-full">
                        <h4 className="font-medium text-brand_gray_dark text-sm">Recent Orders</h4>
                        <div className="flex flex-col gap-y-4 overflow-y-auto max-h-[400px]">
                            {loading ? (
                                <div className="flex justify-center items-center py-8">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand_pink"></div>
                                </div>
                            ) : orders?.slice(0, 6).map((order, idx) => (
                                <div key={idx} className="flex items-center justify-between border-b border-gray-50 pb-3 last:border-0">
                                    <div className="flex w-full gap-x-3">
                                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex-shrink-0 relative overflow-hidden">
                                            {order.items?.[0]?.image ? (
                                                <img src={order.items[0].image} alt="Product" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="absolute inset-0 flex items-center justify-center text-[8px] text-gray-400 font-bold">IMG</div>
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[10px] font-medium truncate sm:w-24 w-20">{order.items?.[0]?.name || 'Unknown Product'}</p>
                                            <p className="text-[9px] text-brand_gray_dark font-bold">N{order.totalPrice?.toLocaleString() || '0'} x {order.items?.length || 1}</p>
                                        </div>
                                    </div>
                                    <div className="text-right flex-shrink-0 ml-2">
                                        <p className="text-[8px] text-brand_gray mb-1">{new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</p>
                                        <span className={`text-[8px] px-2 py-0.5 rounded-full ${
                                            order.orderStatus === 'delivered' ? 'bg-green-100 text-green-600' : 
                                            order.orderStatus === 'processing' ? 'bg-orange-100 text-orange-600' : 
                                            'bg-gray-100 text-gray-600'
                                        }`}>
                                            {order.orderStatus === 'delivered' ? 'Done' : 
                                             order.orderStatus === 'processing' ? 'Pending' : 
                                             order.orderStatus}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* New Design Section */}
            <section className="mt-8 flex flex-col gap-8">
                <div className="flex flex-col lg:flex-row gap-6">
                    <WebsiteTrafficChart data={salesData} />
                    <RealTimeInsight orders={orders} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                    <TopSellingProducts orders={orders} />
                    <TopSellingCategory orders={orders} />
                    <InventoryAlert products={products} />
                </div>
            </section>
        </main>
    )
}