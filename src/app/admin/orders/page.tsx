'use client'

import EmptyTable from '@/components/EmptyTable';
import { getUserOrders } from '@/lib/adminapi';
import { filterByPeriod } from '@/lib/dashboard-utils';
import { ChevronLeft, ChevronRight, Eye, Filter, Search, ShoppingBag } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const OrdersPage = () => {
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState('All Time');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await getUserOrders();

      if (response.message && Array.isArray(response.message)) {
        // Transform API data to match our table structure
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const transformedOrders = response.message.map((order: any) => ({
          
          id: order.order_id || 'Unknown',
          customer: order.shippingAddress?.fullName || 'Unknown Customer',
          products: order.items?.length || 0,
          total: `N${order.amountPaid?.toLocaleString?.() || '0'}.00`,
          status: order.orderStatus || 'Unknown',
          date: order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          }).replace(/\//g, '-') : 'Unknown',
          // Store full order data for detailed view
          fullOrder: order
        }));
        setOrders(transformedOrders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = (orderId: string) => {
    router.push(`/admin/orders/${orderId}`);
  };

  const handleExportOrders = () => {
    // Create CSV content from filtered orders
    const headers = ['Order ID', 'Customer', 'Products', 'Total Price', 'Status', 'Date'];
    const csvContent = [
      headers.join(','),
      ...filteredOrders.map(order => [
        order.id,
        `"${order.customer}"`,
        order.products,
        order.total,
        order.status,
        order.date
      ].join(','))
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    // Generate filename with current date
    const currentDate = new Date().toISOString().split('T')[0];
    link.setAttribute('href', url);
    link.setAttribute('download', `orders_export_${currentDate}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter orders by selected period
  const periodFilteredOrders = filterByPeriod(orders, selectedPeriod, (o) => o.fullOrder?.createdAt);

  // Calculate stats dynamically with safe defaults
  const totalOrders = periodFilteredOrders?.length || 0;
  const processingOrders = periodFilteredOrders?.filter(o => o.status?.toLowerCase() === 'processing').length || 0;
  const deliveredOrders = periodFilteredOrders?.filter(o => o.status?.toLowerCase() === 'delivered').length || 0;
  const canceledOrders = periodFilteredOrders?.filter(o => o.status?.toLowerCase() === 'canceled' || o.status?.toLowerCase() === 'cancelled').length || 0;
  const shippingOrders = periodFilteredOrders?.filter(o => o.status?.toLowerCase() === 'shipping' || o.status?.toLowerCase() === 'shipped').length || 0;

  // Filter orders based on search and status filter with safe checks
  const filteredOrders = periodFilteredOrders?.filter(order => {
    const matchesSearch =
      order?.id?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      order?.customer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order?.status?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      order?.status?.toLowerCase() === statusFilter.toLowerCase() ||
      (statusFilter.toLowerCase() === 'shipping' && order?.status?.toLowerCase() === 'shipped') ||
      (statusFilter.toLowerCase() === 'canceled' && order?.status?.toLowerCase() === 'cancelled');

    return matchesSearch && matchesStatus;
  }) || [];

  const getStatusStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'processing': return 'bg-orange-50 text-orange-500 border-orange-100';
      case 'shipping':
      case 'shipped': return 'bg-blue-50 text-blue-500 border-blue-100';
      case 'delivered': return 'bg-green-50 text-green-500 border-green-100';
      case 'canceled':
      case 'cancelled': return 'bg-red-50 text-red-500 border-red-100';
      default: return 'bg-gray-50 text-gray-500 border-gray-100';
    }
  };

  return (
    <main className="w-full bg-gray-50/30 font-poppins pr-5 ">
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 ">
        <div className="bg-gradient-to-t from-brand_solid_gradient/10 border border-brand_light_pink/30 rounded-2xl p-6 flex items-start justify-between shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-brand_pink opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex flex-col gap-6 w-full">
            <div className="bg-brand_pink/10 w-10 h-10 rounded-xl flex items-center justify-center">
              <ShoppingBag size={20} className="text-brand_pink" />
            </div>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-brand_gray_dark/60 text-xs font-medium mb-1">All Orders</p>
                <h3 className="text-2xl font-bold text-brand_gray_dark">{totalOrders}</h3>
              </div>

              <div className="text-left">
                <p className="text-brand_gray_dark/60 text-xs font-medium mb-1">Processing</p>
                <h3 className="text-2xl font-bold text-brand_gray_dark">{processingOrders}</h3>
              </div>

              <div>
                <p className="text-brand_gray_dark/60 text-xs font-medium mb-1">Delivered</p>
                <h3 className="text-2xl font-bold text-brand_gray_dark">{deliveredOrders}</h3>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-t from-brand_solid_gradient/10 border border-brand_light_pink/30 rounded-2xl p-6 flex items-start justify-between shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-brand_pink opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex flex-col gap-6 w-full">
            <div className='flex items-center justify-between mb-4'>
              <div className="bg-brand_pink/10 w-10 h-10 rounded-xl flex items-center justify-center">
                <ShoppingBag size={20} className="text-brand_pink" />
              </div>

              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="bg-transparent text-[10px] text-brand_gray border-none outline-none cursor-pointer"
              >
                <option>All Time</option>
                <option>This Week</option>
                <option>This Month</option>
                <option>This Year</option>
              </select>

            </div>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-brand_gray_dark/60 text-xs font-medium mb-1">Returned</p>
                <h3 className="text-2xl font-bold text-brand_gray_dark">{periodFilteredOrders.filter(o => o.status?.toLowerCase() === 'returned').length}</h3>
              </div>

              <div className="text-left">
                <p className="text-brand_gray_dark/60 text-xs font-medium mb-1">Canceled</p>
                <h3 className="text-2xl font-bold text-brand_gray_dark">{canceledOrders}</h3>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-t from-brand_solid_gradient/10 border border-brand_light_pink/30 rounded-2xl p-6 flex items-start justify-between shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-brand_pink opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex flex-col gap-6 w-full">
            <div className='flex items-center justify-between mb-4'>
              <div className="bg-brand_pink/10 w-10 h-10 rounded-xl flex items-center justify-center">
                <ShoppingBag size={20} className="text-brand_pink" />
              </div>

              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="bg-transparent text-[10px] text-brand_gray border-none outline-none cursor-pointer"
              >
                <option>All Time</option>
                <option>This Week</option>
                <option>This Month</option>
                <option>This Year</option>
              </select>

            </div>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-red-500 text-xs font-medium mb-1">Shipping</p>
                <h3 className="text-2xl font-bold text-brand_gray_dark">{shippingOrders}</h3>
              </div>

              <div className="text-left">
                <p className="text-brand_gray_dark/60 text-xs font-medium mb-1">Customers</p>
                <h3 className="text-2xl font-bold text-brand_gray_dark">{new Set(periodFilteredOrders.map(o => o.customer)).size}</h3>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex justify-end mb-6">
        <button
          onClick={handleExportOrders}
          className="bg-brand_pink hover:bg-brand_pink/90 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 text-sm font-semibold transition-all shadow-md active:scale-95"
        >
          <Filter size={18} />
          Export Orders
        </button>
      </div>

      {/* Table Container */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden mb-10">
        {/* Search and Filters */}
        <div className="p-4 flex flex-col md:flex-row items-center justify-between gap-4 border-b border-gray-50">
          <div className="relative w-full md:w-96 group">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand_gray group-focus-within:text-brand_pink transition-colors" />
            <input
              type="text"
              placeholder="Search Order ID, Customer, Status"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50/50 border border-gray-100 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:border-brand_pink/30 focus:bg-white transition-all font-medium"
            />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none">
              <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand_gray_dark pointer-events-none" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 text-brand_gray_dark pl-9 pr-8 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-100 transition-colors outline-none cursor-pointer appearance-none"
              >
                <option value="all">Filter</option>
                <option value="all">All Statuses</option>
                <option value="processing">Processing</option>
                <option value="shipping">Shipping</option>
                <option value="delivered">Delivered</option>
                <option value="canceled">Canceled</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-brand_gray_dark flex items-center">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto scrollbar-hide">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand_pink"></div>
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="p-4 w-12 text-center">
                    <input type="checkbox" className="rounded-md border-gray-300 text-brand_pink focus:ring-brand_pink w-4 h-4 cursor-pointer" />
                  </th>
                  <th className="p-4 text-xs font-bold text-brand_gray_dark uppercase tracking-wider">Order ID</th>
                  <th className="p-4 text-xs font-bold text-brand_gray_dark uppercase tracking-wider">Customer</th>
                  <th className="p-4 text-xs font-bold text-brand_gray_dark uppercase tracking-wider text-center">Product(s)</th>
                  <th className="p-4 text-xs font-bold text-brand_gray_dark uppercase tracking-wider">Total Price</th>
                  <th className="p-4 text-xs font-bold text-brand_gray_dark uppercase tracking-wider">Status</th>
                  <th className="p-4 text-xs font-bold text-brand_gray_dark uppercase tracking-wider">Date</th>
                  <th className="p-4 text-xs font-bold text-brand_gray_dark uppercase tracking-wider text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredOrders.length === 0 && <EmptyTable tableType='Orders' searchTerm={searchTerm} colSpan={8}/> }
                
                {filteredOrders.map((order, idx) => (
                  <tr
                    key={idx}
                    onClick={() => handleViewOrder(order.id)}
                    className="hover:bg-gray-50/50 transition-colors group cursor-pointer"
                  >
                    <td className="p-4 text-center">
                      <input
                        type="checkbox"
                        onClick={(e) => e.stopPropagation()}
                        className="rounded-md border-gray-300 text-brand_pink focus:ring-brand_pink w-4 h-4 cursor-pointer"
                      />
                    </td>
                    <td className="p-4 text-sm font-medium text-brand_gray_dark/80">{order.id}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-brand_pink/5 rounded-lg flex-shrink-0 flex items-center justify-center">
                          <ShoppingBag size={16} className="text-brand_pink/20" />
                        </div>
                        <span className="font-semibold text-sm text-brand_gray_dark">{order.customer}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm font-bold text-brand_gray_dark/80 text-center">{order.products}</td>
                    <td className="p-4 text-sm font-bold text-brand_gray_dark">{order.total}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${getStatusStyle(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm font-medium text-brand_gray_dark/80">{order.date}</td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleViewOrder(order.id); }}
                          className="text-brand_gray hover:text-brand_pink transition-colors"
                          title="View Order"
                        >
                          <Eye size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        <div className="p-4 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-gray-50 bg-gray-50/20">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <select className="bg-gray-100 border-none rounded-lg text-xs font-bold px-2 py-1 outline-none">
                <option>8</option>
                <option>16</option>
                <option>32</option>
              </select>
              <span className="text-xs text-brand_gray font-medium">Items per page</span>
            </div>
            <span className="text-xs text-brand_gray font-medium">1-8 of 200 items</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <select className="bg-gray-100 border-none rounded-lg text-xs font-bold px-2 py-1 outline-none">
                <option>1</option>
                <option>2</option>
                <option>3</option>
              </select>
              <span className="text-xs text-brand_gray font-medium">of 25 pages</span>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-1 rounded-md text-brand_gray hover:bg-gray-100"><ChevronLeft className="w-4 h-4" /></button>
              <button className="p-1 rounded-md text-brand_gray hover:bg-gray-100"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal removed */}
    </main>
  );
};

export default OrdersPage;
