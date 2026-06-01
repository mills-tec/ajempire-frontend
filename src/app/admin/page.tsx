'use client'

import { getAllCategories, getProducts, getReturns, getUserOrders } from '@/lib/adminapi';
import { aggregateOrdersByDate, calculatePercentChange, filterByDateRange, filterByPeriod, getPreviousPeriodRange } from '@/lib/dashboard-utils';
import { ChartPie, CornerDownLeft, FolderMinus, ShoppingBagIcon, UsersRound } from "lucide-react";
import { useEffect, useState } from 'react';
import DoughnutChart from "../components/admin/DoughnutChart";
import InventoryAlert from "../components/admin/InventoryAlert";
import LineChart from "../components/admin/LineChart";
import RealTimeInsight from "../components/admin/RealTimeInsight";
import TopSellingCategory from "../components/admin/TopSellingCategory";
import TopSellingProducts from "../components/admin/TopSellingProducts";
import WebsiteTrafficChart from "../components/admin/WebsiteTrafficChart";

export default function AdminPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<unknown[]>([]);
    const [returns, setReturns] = useState<ReturnItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [salesPeriod, setSalesPeriod] = useState('All time');
    const [customersPeriod, setCustomersPeriod] = useState('All time');
    const [productsPeriod, setProductsPeriod] = useState('All time');
    const [returnsPeriod, setReturnsPeriod] = useState('All time');
    const [summaryPeriod, setSummaryPeriod] = useState('All time');
    const [inventoryPeriod, setInventoryPeriod] = useState('All time');

    useEffect(() => {
        fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

            if (ordersResponse.message && Array.isArray(ordersResponse.message)) {
                setOrders(ordersResponse.message);
            }

            const productsData = productsResponse.message as { products?: Product[] };
            if (productsData && productsData.products && Array.isArray(productsData.products)) {
                setProducts(productsData.products);
            } else if (productsResponse.message && Array.isArray(productsResponse.message)) {
                setProducts(productsResponse.message);
            }

            if (categoriesResponse.message && Array.isArray(categoriesResponse.message)) {
                setCategories(categoriesResponse.message);
            }

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

    // Sales Card calculations
    const salesFilteredOrders = filterByPeriod(orders, salesPeriod, (o) => o.createdAt);
    const salesPrevRange = getPreviousPeriodRange(salesPeriod);
    const salesPrevOrders = filterByDateRange(orders, salesPrevRange.start, salesPrevRange.end, (o) => o.createdAt);
    const totalSales = salesFilteredOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
    const prevSales = salesPrevOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
    const salesChange = calculatePercentChange(totalSales, prevSales);

    // Customers & Orders Card calculations
    const customersFilteredOrders = filterByPeriod(orders, customersPeriod, (o) => o.createdAt);
    const customersPrevRange = getPreviousPeriodRange(customersPeriod);
    const customersPrevOrders = filterByDateRange(orders, customersPrevRange.start, customersPrevRange.end, (o) => o.createdAt);
    const totalCustomers = new Set(customersFilteredOrders.map(order => order.shippingAddress?.fullName).filter(Boolean)).size;
    const prevCustomers = new Set(customersPrevOrders.map(order => order.shippingAddress?.fullName).filter(Boolean)).size;
    const customersChange = calculatePercentChange(totalCustomers, prevCustomers);
    const totalOrders = customersFilteredOrders.length;
    const prevOrdersCount = customersPrevOrders.length;
    const ordersChange = calculatePercentChange(totalOrders, prevOrdersCount);

    // Products & Categories stats
    const totalProducts = products?.length || 0;
    const totalCategories = categories?.length || 0;

    // Returns Card calculations
    const returnsFilteredReturns = filterByPeriod(returns, returnsPeriod, (r) => r.createdAt);
    const returnsPrevRange = getPreviousPeriodRange(returnsPeriod);
    const returnsPrevReturns = filterByDateRange(returns, returnsPrevRange.start, returnsPrevRange.end, (r) => r.createdAt);
    const totalReturns = returnsFilteredReturns.length;
    const prevReturnsCount = returnsPrevReturns.length;
    const returnsChange = calculatePercentChange(totalReturns, prevReturnsCount);
    const pendingReturns = returnsFilteredReturns.filter(r => r.status === 'pending').length;

    // Summary Card calculations
    const summaryFilteredOrders = filterByPeriod(orders, summaryPeriod, (o) => o.createdAt);
    const summaryTotalSales = summaryFilteredOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
    const salesData = aggregateOrdersByDate(summaryFilteredOrders).map(item => ({
        date: item.date,
        sales: item.sales
    }));

    // Inventory Values Card calculations
    const inventoryFilteredOrders = filterByPeriod(orders, inventoryPeriod, (o) => o.createdAt);
    const processingOrders = inventoryFilteredOrders.filter(o => o.orderStatus === 'processing').length;
    const shippingOrders = inventoryFilteredOrders.filter(o => o.orderStatus === 'shipping' || o.orderStatus === 'shipped').length;
    const deliveredOrders = inventoryFilteredOrders.filter(o => o.orderStatus === 'delivered').length;
    const canceledOrders = inventoryFilteredOrders.filter(o => o.orderStatus === 'canceled' || o.orderStatus === 'cancelled').length;

    const orderStatusData = [
        { name: 'Processing', value: processingOrders, color: '#FFA500' },
        { name: 'Shipping', value: shippingOrders, color: '#3B82F6' },
        { name: 'Delivered', value: deliveredOrders, color: '#10B981' },
        { name: 'Canceled', value: canceledOrders, color: '#EF4444' }
    ];

    const lowStockProducts = products?.filter(p => p.stock > 0 && p.stock <= 10).length || 0;
    const outOfStockProducts = products?.filter(p => p.stock === 0).length || 0;

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
                        <p className="text-lg font-bold">₦{totalSales.toLocaleString()}</p>
                        <p className={`text-xs ${salesChange.startsWith('+') || salesChange === '0%' ? 'text-green-500' : 'text-red-500'}`}>{salesChange}</p>
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
                                <p className="text-lg font-bold">{totalCustomers}</p>
                                <p className={`text-xs ${customersChange.startsWith('+') || customersChange === '0%' ? 'text-green-500' : 'text-red-500'}`}>{customersChange}</p>
                            </div>
                        </div>

                        <div>
                            <h4 className="mt-6 text-brand_gray_dark text-xs">Orders</h4>
                            <div className="flex items-center gap-2">
                                <p className="text-lg font-bold">{totalOrders}</p>
                                <p className={`text-xs ${ordersChange.startsWith('+') || ordersChange === '0%' ? 'text-green-500' : 'text-red-500'}`}>{ordersChange}</p>
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
                                <p className="text-lg font-bold">{totalProducts}</p>
                                <p className="text-gray-400 text-xs">in catalog</p>
                            </div>
                        </div>

                        <div>
                            <h4 className="mt-6 text-brand_gray_dark text-xs">Categories</h4>
                            <div className="flex items-center gap-2">
                                <p className="text-lg font-bold">{totalCategories}</p>
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
                                <p className="text-lg font-bold">{totalProducts}</p>
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
                                <p className="text-lg font-bold">{totalReturns}</p>
                                <p className={`text-xs ${returnsChange.startsWith('+') ? 'text-red-500' : 'text-green-500'}`}>{returnsChange}{pendingReturns > 0 ? ` · ${pendingReturns} pending` : ''}</p>
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
                                    <p className="text-brand_pink font-bold text-sm">N{summaryTotalSales.toLocaleString()}</p>
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
                            <LineChart data={salesData} />
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
                                <p className="text-brand_gray text-sm font-medium">{products?.filter(p => (p.stock ?? 0) > 0).length || 0}</p>
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
                                                <Image
                                                    src={order.items[0].image}
                                                    alt="Product"
                                                    fill
                                                    className="object-cover"
                                                    sizes="32px"
                                                />
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
                    <WebsiteTrafficChart orders={summaryFilteredOrders} />
                    <RealTimeInsight orders={orders} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                    <TopSellingProducts orders={orders} period={salesPeriod} />
                    <TopSellingCategory orders={salesFilteredOrders} period={salesPeriod} />
                    <InventoryAlert products={products} />
                </div>
            </section>
        </div>
    )
}