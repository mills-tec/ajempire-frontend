'use client'

import { getAllCategories, getProducts, getReturns, getUserOrders } from '@/lib/adminapi';
import { aggregateOrdersByDate, calculatePercentChange, filterByDateRange, filterByPeriod, getPreviousPeriodRange } from '@/lib/dashboard-utils';
import { ChartPie, CornerDownLeft, FolderMinus, ShoppingBagIcon, UsersRound } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from 'react';
import DoughnutChart from "../components/admin/DoughnutChart";
import InventoryAlert from "../components/admin/InventoryAlert";
import LineChart from "../components/admin/LineChart";
import RealTimeInsight from "../components/admin/RealTimeInsight";
import TopSellingCategory from "../components/admin/TopSellingCategory";
import TopSellingProducts from "../components/admin/TopSellingProducts";
import WebsiteTrafficChart from "../components/admin/WebsiteTrafficChart";

export default function AdminPage() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [orders, setOrders] = useState<any[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [products, setProducts] = useState<any[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [categories, setCategories] = useState<any[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [returns, setReturns] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [salesPeriod, setSalesPeriod] = useState('All time');
    const [customersPeriod, setCustomersPeriod] = useState('All time');
    const [productsPeriod, setProductsPeriod] = useState('All time');
    const [returnsPeriod, setReturnsPeriod] = useState('All time');
    const [summaryPeriod, setSummaryPeriod] = useState('All time');
    const [inventoryPeriod, setInventoryPeriod] = useState('All time');

    const fetchDashboardData = useCallback(async () => {
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
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    }, []);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    // Sales Card calculations — recomputed only when orders or salesPeriod change,
    // not on every render triggered by one of the other 5 unrelated period selectors.
    const sales = useMemo(() => {
        const filteredOrders = filterByPeriod(orders, salesPeriod, (o) => o.createdAt);
        const prevRange = getPreviousPeriodRange(salesPeriod);
        const prevOrders = filterByDateRange(orders, prevRange.start, prevRange.end, (o) => o.createdAt);
        const totalSales = filteredOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
        const prevSales = prevOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
        return {
            filteredOrders,
            totalSales,
            change: calculatePercentChange(totalSales, prevSales),
        };
    }, [orders, salesPeriod]);

    // Customers & Orders Card calculations
    const customersAndOrders = useMemo(() => {
        const filteredOrders = filterByPeriod(orders, customersPeriod, (o) => o.createdAt);
        const prevRange = getPreviousPeriodRange(customersPeriod);
        const prevOrders = filterByDateRange(orders, prevRange.start, prevRange.end, (o) => o.createdAt);
        const totalCustomers = new Set(filteredOrders.map(order => order.shippingAddress?.fullName).filter(Boolean)).size;
        const prevCustomers = new Set(prevOrders.map(order => order.shippingAddress?.fullName).filter(Boolean)).size;
        const totalOrders = filteredOrders.length;
        const prevOrdersCount = prevOrders.length;
        return {
            totalCustomers,
            customersChange: calculatePercentChange(totalCustomers, prevCustomers),
            totalOrders,
            ordersChange: calculatePercentChange(totalOrders, prevOrdersCount),
        };
    }, [orders, customersPeriod]);

    // Products & Categories stats
    const catalogStats = useMemo(() => ({
        totalProducts: products?.length || 0,
        totalCategories: categories?.length || 0,
        inStockProducts: products?.filter(p => p.stock > 0).length || 0,
        lowStockProducts: products?.filter(p => p.stock > 0 && p.stock <= 10).length || 0,
        outOfStockProducts: products?.filter(p => p.stock === 0).length || 0,
    }), [products, categories]);

    // Returns Card calculations
    const returnsStats = useMemo(() => {
        const filteredReturns = filterByPeriod(returns, returnsPeriod, (r) => r.createdAt);
        const prevRange = getPreviousPeriodRange(returnsPeriod);
        const prevReturns = filterByDateRange(returns, prevRange.start, prevRange.end, (r) => r.createdAt);
        const totalReturns = filteredReturns.length;
        const prevReturnsCount = prevReturns.length;
        return {
            totalReturns,
            change: calculatePercentChange(totalReturns, prevReturnsCount),
            pendingReturns: filteredReturns.filter(r => r.status === 'pending').length,
        };
    }, [returns, returnsPeriod]);

    // Summary Card calculations
    const summary = useMemo(() => {
        const filteredOrders = filterByPeriod(orders, summaryPeriod, (o) => o.createdAt);
        const totalSales = filteredOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
        const salesData = aggregateOrdersByDate(filteredOrders).map(item => ({
            date: item.date,
            sales: item.sales
        }));
        return { filteredOrders, totalSales, salesData };
    }, [orders, summaryPeriod]);

    // Inventory Values Card calculations
    const inventory = useMemo(() => {
        const filteredOrders = filterByPeriod(orders, inventoryPeriod, (o) => o.createdAt);
        const processingOrders = filteredOrders.filter(o => o.orderStatus === 'processing').length;
        const shippingOrders = filteredOrders.filter(o => o.orderStatus === 'shipping' || o.orderStatus === 'shipped').length;
        const deliveredOrders = filteredOrders.filter(o => o.orderStatus === 'delivered').length;
        const canceledOrders = filteredOrders.filter(o => o.orderStatus === 'canceled' || o.orderStatus === 'cancelled').length;

        return {
            orderStatusData: [
                { name: 'Processing', value: processingOrders, color: '#FFA500' },
                { name: 'Shipping', value: shippingOrders, color: '#3B82F6' },
                { name: 'Delivered', value: deliveredOrders, color: '#10B981' },
                { name: 'Canceled', value: canceledOrders, color: '#EF4444' }
            ],
        };
    }, [orders, inventoryPeriod]);

    if (loading) {
        return <AdminDashboardSkeleton />;
    }

    return (
        <div className="w-full pb-10">
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-white border p-4 rounded-xl flex-1">
                    <div className="flex items-center justify-between">
                        <div className='bg-brand_pink/10 p-2 rounded-xl border'>
                            <ChartPie size={18} color="#ff008c" />
                        </div>
                        <select
                            value={salesPeriod}
                            onChange={(e) => setSalesPeriod(e.target.value)}
                            className="bg-transparent rounded-xl text-brand_gray font-poppins text-xs outline-none"
                        >
                            <option value="All time">All time</option>
                            <option value="This week">This week</option>
                            <option value="This month">This month</option>
                            <option value="This year">This year</option>
                        </select>
                    </div>

                    <h4 className="mt-6 text-brand_gray_dark text-xs">Sales</h4>
                    <div className="flex items-center gap-2">
                        <p className="text-lg font-bold">₦{sales.totalSales.toLocaleString()}</p>
                        <p className={`text-xs ${sales.change.startsWith('+') || sales.change === '0%' ? 'text-green-500' : 'text-red-500'}`}>{sales.change}</p>
                    </div>
                </div>

                <div className="bg-white border p-4 rounded-xl flex-1">
                    <div className="flex items-center justify-between">
                        <div className='bg-yellow-500/10 p-2 rounded-xl border'>
                            <UsersRound size={18} />
                        </div>
                        <select
                            value={customersPeriod}
                            onChange={(e) => setCustomersPeriod(e.target.value)}
                            className="bg-transparent rounded-xl text-brand_gray font-poppins text-xs outline-none"
                        >
                            <option value="All time">All time</option>
                            <option value="This week">This week</option>
                            <option value="This month">This month</option>
                            <option value="This year">This year</option>
                        </select>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-12">
                        <div>
                            <h4 className="mt-6 text-brand_gray_dark text-xs">Customers</h4>
                            <div className="flex items-center gap-2">
                                <p className="text-lg font-bold">{customersAndOrders.totalCustomers}</p>
                                <p className={`text-xs ${customersAndOrders.customersChange.startsWith('+') || customersAndOrders.customersChange === '0%' ? 'text-green-500' : 'text-red-500'}`}>{customersAndOrders.customersChange}</p>
                            </div>
                        </div>

                        <div>
                            <h4 className="mt-6 text-brand_gray_dark text-xs">Orders</h4>
                            <div className="flex items-center gap-2">
                                <p className="text-lg font-bold">{customersAndOrders.totalOrders}</p>
                                <p className={`text-xs ${customersAndOrders.ordersChange.startsWith('+') || customersAndOrders.ordersChange === '0%' ? 'text-green-500' : 'text-red-500'}`}>{customersAndOrders.ordersChange}</p>
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
                            value={productsPeriod}
                            onChange={(e) => setProductsPeriod(e.target.value)}
                            className="bg-transparent rounded-xl text-brand_gray font-poppins text-xs outline-none"
                        >
                            <option value="All time">All time</option>
                            <option value="This week">This week</option>
                            <option value="This month">This month</option>
                            <option value="This year">This year</option>
                        </select>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-12">
                        <div>
                            <h4 className="mt-6 text-brand_gray_dark text-xs">Products</h4>
                            <div className="flex items-center gap-2">
                                <p className="text-lg font-bold">{catalogStats.totalProducts}</p>
                                <p className="text-gray-400 text-xs">in catalog</p>
                            </div>
                        </div>

                        <div>
                            <h4 className="mt-6 text-brand_gray_dark text-xs">Categories</h4>
                            <div className="flex items-center gap-2">
                                <p className="text-lg font-bold">{catalogStats.totalCategories}</p>
                                <p className="text-gray-400 text-xs">active</p>
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
                                <p className="text-lg font-bold">{catalogStats.totalProducts}</p>
                                <p className="text-gray-400 text-xs">in catalog</p>
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-xl border">
                            <div className="flex items-center justify-between">
                                <div className='bg-yellow-500/10 p-2 rounded-xl'>
                                    <CornerDownLeft size={18} />
                                </div>
                                <select
                                    value={returnsPeriod}
                                    onChange={(e) => setReturnsPeriod(e.target.value)}
                                    className="bg-transparent rounded-xl text-brand_gray font-poppins text-xs outline-none"
                                >
                                    <option value="All time">All time</option>
                                    <option value="This week">This week</option>
                                    <option value="This month">This month</option>
                                    <option value="This year">This year</option>
                                </select>
                            </div>

                            <h4 className="mt-6 text-red-500 text-xs">Returns</h4>
                            <div className="flex items-center gap-2">
                                <p className="text-lg font-bold">{returnsStats.totalReturns}</p>
                                <p className={`text-xs ${returnsStats.change.startsWith('+') ? 'text-red-500' : 'text-green-500'}`}>{returnsStats.change}{returnsStats.pendingReturns > 0 ? ` · ${returnsStats.pendingReturns} pending` : ''}</p>
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
                                    <p className="text-brand_pink font-bold text-sm">N{summary.totalSales.toLocaleString()}</p>
                                </div>
                            </div>
                            <select
                                value={summaryPeriod}
                                onChange={(e) => setSummaryPeriod(e.target.value)}
                                className="bg-transparent rounded-xl text-brand_gray font-poppins text-xs outline-none"
                            >
                                <option value="All time">All time</option>
                                <option value="This week">This week</option>
                                <option value="This month">This month</option>
                                <option value="This year">This year</option>
                            </select>
                        </div>

                        <div className="mt-8 flex-1 h-[180px] relative">
                            <LineChart data={summary.salesData} />
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-5">
                    <div className="bg-white p-4 rounded-xl border h-full">
                        <div className="flex items-center justify-between">
                            <h4 className="font-medium text-brand_gray_dark text-sm">Inventory Values</h4>
                            <select
                                value={inventoryPeriod}
                                onChange={(e) => setInventoryPeriod(e.target.value)}
                                className="bg-transparent rounded-xl text-brand_gray font-poppins text-xs outline-none"
                            >
                                <option value="All time">All time</option>
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
                                <p className="text-brand_gray text-sm font-medium">{catalogStats.inStockProducts}</p>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-brand_purple" />
                                    <p className="text-brand_gray text-sm">Low Stock</p>
                                </div>
                                <p className="text-brand_gray text-sm font-medium">{catalogStats.lowStockProducts}</p>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-red-500" />
                                    <p className="text-brand_gray text-sm">Out of Stock</p>
                                </div>
                                <p className="text-brand_gray text-sm font-medium">{catalogStats.outOfStockProducts}</p>
                            </div>
                        </div>

                        {/* chart placeholder fix */}
                        <div className="flex justify-center items-center mt-10">
                            <div className="relative w-32 h-32">
                                <DoughnutChart data={inventory.orderStatusData} />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-xl flex flex-col gap-4 border h-full">
                        <h4 className="font-medium text-brand_gray_dark text-sm">Recent Orders</h4>
                        <div className="flex flex-col gap-y-4 overflow-y-auto max-h-[400px]">
                            {orders?.slice(0, 6).map((order, idx) => (
                                <div key={order._id || order.id || idx} className="flex items-center justify-between border-b border-gray-50 pb-3 last:border-0">
                                    <div className="flex w-full gap-x-3">
                                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex-shrink-0 relative overflow-hidden">
                                            {order.items?.[0]?.image ? (
                                                // eslint-disable-next-line @next/next/no-img-element
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
                    <WebsiteTrafficChart orders={summary.filteredOrders} />
                    <RealTimeInsight orders={orders} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                    <TopSellingProducts orders={sales.filteredOrders} period={salesPeriod} />
                    <TopSellingCategory orders={sales.filteredOrders} period={salesPeriod} />
                    <InventoryAlert products={products} />
                </div>
            </section>
        </div>
    )
}

function AdminDashboardSkeleton() {
    return (
        <div className="w-full pb-10 animate-pulse">
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[0, 1, 2].map((i) => (
                    <div key={i} className="bg-white border p-4 rounded-xl flex-1">
                        <div className="flex items-center justify-between">
                            <div className="w-8 h-8 rounded-xl bg-gray-200" />
                            <div className="h-4 w-16 bg-gray-200 rounded" />
                        </div>
                        <div className="h-3 w-14 bg-gray-200 rounded mt-6" />
                        <div className="flex items-center gap-2 mt-2">
                            <div className="h-5 w-20 bg-gray-200 rounded" />
                            <div className="h-3 w-8 bg-gray-200 rounded" />
                        </div>
                    </div>
                ))}
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
                <div className="flex flex-col gap-y-3 lg:col-span-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[0, 1].map((i) => (
                            <div key={i} className="bg-white border p-4 rounded-xl">
                                <div className="w-8 h-8 rounded-xl bg-gray-200" />
                                <div className="h-3 w-16 bg-gray-200 rounded mt-6" />
                                <div className="flex items-center gap-2 mt-2">
                                    <div className="h-5 w-12 bg-gray-200 rounded" />
                                    <div className="h-3 w-16 bg-gray-200 rounded" />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="bg-white border p-4 rounded-xl flex-1 flex flex-col h-full">
                        <div className="flex items-center justify-between gap-4">
                            <div className="h-4 w-40 bg-gray-200 rounded" />
                            <div className="h-4 w-20 bg-gray-200 rounded" />
                        </div>
                        <div className="mt-8 flex-1 h-[180px] bg-gray-100 rounded-lg" />
                    </div>
                </div>

                <div className="flex flex-col gap-5">
                    <div className="bg-white p-4 rounded-xl border h-full">
                        <div className="flex items-center justify-between">
                            <div className="h-4 w-28 bg-gray-200 rounded" />
                            <div className="h-4 w-16 bg-gray-200 rounded" />
                        </div>
                        <div className="flex flex-col gap-3 mt-5">
                            {[0, 1, 2].map((i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="h-3 w-16 bg-gray-200 rounded" />
                                    <div className="h-3 w-6 bg-gray-200 rounded" />
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-center items-center mt-10">
                            <div className="w-32 h-32 rounded-full bg-gray-100" />
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-xl flex flex-col gap-4 border h-full">
                        <div className="h-4 w-24 bg-gray-200 rounded" />
                        <div className="flex flex-col gap-y-4">
                            {[0, 1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center justify-between border-b border-gray-50 pb-3 last:border-0">
                                    <div className="flex w-full gap-x-3">
                                        <div className="w-8 h-8 bg-gray-200 rounded-lg flex-shrink-0" />
                                        <div className="min-w-0 flex-1 flex flex-col gap-1.5">
                                            <div className="h-2.5 w-20 bg-gray-200 rounded" />
                                            <div className="h-2.5 w-14 bg-gray-200 rounded" />
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0 ml-2">
                                        <div className="h-2 w-10 bg-gray-200 rounded" />
                                        <div className="h-3 w-12 bg-gray-200 rounded-full" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section className="mt-8 flex flex-col gap-8">
                <div className="flex flex-col lg:flex-row gap-6">
                    <div className="bg-white border p-4 rounded-xl flex-1 h-[260px]">
                        <div className="h-4 w-40 bg-gray-200 rounded" />
                        <div className="mt-6 h-[180px] bg-gray-100 rounded-lg" />
                    </div>
                    <div className="bg-white border p-4 rounded-xl w-full lg:w-[320px] h-[260px]">
                        <div className="h-4 w-32 bg-gray-200 rounded" />
                        <div className="mt-6 h-[180px] bg-gray-100 rounded-lg" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                    {[0, 1, 2].map((i) => (
                        <div key={i} className="bg-white border p-4 rounded-xl h-[220px]">
                            <div className="h-4 w-32 bg-gray-200 rounded" />
                            <div className="flex flex-col gap-4 mt-6">
                                {[0, 1, 2].map((j) => (
                                    <div key={j} className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-gray-200 rounded-lg flex-shrink-0" />
                                        <div className="flex-1 flex flex-col gap-1.5">
                                            <div className="h-2.5 w-3/4 bg-gray-200 rounded" />
                                            <div className="h-2.5 w-1/2 bg-gray-200 rounded" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
