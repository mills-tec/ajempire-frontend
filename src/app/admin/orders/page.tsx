'use client'

import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, Trash2, ChevronLeft, ChevronRight, ShoppingBag, TrendingUp, Package, Users, RotateCcw, X, ShoppingCart, MoreHorizontal } from 'lucide-react';
import { getUserOrders, deleteOrder } from '@/lib/adminapi';
import { useRouter } from 'next/navigation';

const OrdersPage = () => {
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState('This Week');
  const [searchTerm, setSearchTerm] = useState('');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await getUserOrders();
      
      if (response.message && Array.isArray(response.message)) {
        // Transform API data to match our table structure
        const transformedOrders = response.message.map((order: any) => ({
          id: order.order_id || 'Unknown',
          customer: order.shippingAddress?.fullName || 'Unknown Customer',
          products: order.items?.length || 0,
          total: `N${order.totalPrice?.toLocaleString?.() || '0'}.00`,
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

  const handleDeleteClick = (order: any) => {
    setSelectedOrder(order);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (selectedOrder) {
      try {
        await deleteOrder(selectedOrder.id);
        // Remove from local state
        setOrders(prev => prev.filter(o => o.id !== selectedOrder.id));
        setShowDeleteModal(false);
        setSelectedOrder(null);
      } catch (error) {
        console.error('Error deleting order:', error);
      }
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setSelectedOrder(null);
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

  // Calculate stats dynamically with safe defaults
  const totalOrders = orders?.length || 0;
  const processingOrders = orders?.filter(o => o.status === 'processing').length || 0;
  const deliveredOrders = orders?.filter(o => o.status === 'delivered').length || 0;
  const canceledOrders = orders?.filter(o => o.status === 'canceled').length || 0;
  const shippingOrders = orders?.filter(o => o.status === 'shipping').length || 0;

  // Filter orders based on search with safe checks
  const filteredOrders = orders?.filter(order => 
    order?.id?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
    order?.customer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order?.status?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Processing': return 'bg-orange-50 text-orange-500 border-orange-100';
      case 'Shipping': return 'bg-blue-50 text-blue-500 border-blue-100';
      case 'Delivered': return 'bg-green-50 text-green-500 border-green-100';
      case 'Canceled': return 'bg-red-50 text-red-500 border-red-100';
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
                <option>This Week</option>
                <option>This Month</option>
                <option>This Year</option>
              </select>

            </div>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-brand_gray_dark/60 text-xs font-medium mb-1">Returned</p>
                <h3 className="text-2xl font-bold text-brand_gray_dark">{orders.filter(o => o.status === 'Returned').length}</h3>
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
                <h3 className="text-2xl font-bold text-brand_gray_dark">{new Set(orders.map(o => o.customer)).size}</h3>
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
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-gray-50 border border-gray-100 text-brand_gray_dark px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-100 transition-colors">
              <Filter size={16} />
              Filter
            </button>
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-gray-50 border border-gray-100 text-brand_gray_dark px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-100 transition-colors">
              <MoreHorizontal size={16} />
              More
            </button>
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
                {filteredOrders.map((order, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="p-4 text-center">
                      <input type="checkbox" className="rounded-md border-gray-300 text-brand_pink focus:ring-brand_pink w-4 h-4 cursor-pointer" />
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
                          onClick={() => handleDeleteClick(order)}
                          className="text-brand_gray hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      <button 
                        onClick={() => handleViewOrder(order.id)}
                        className="text-brand_gray hover:text-brand_pink transition-colors"
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Delete Order</h3>
              <button 
                onClick={cancelDelete}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-gray-600 mb-2">
                Are you sure you want to delete this order?
              </p>
              <p className="font-medium text-gray-900">
                Order #{selectedOrder.id}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Customer: {selectedOrder.customer}
              </p>
              <p className="text-sm text-gray-600">
                Total: {selectedOrder.total}
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button 
                onClick={cancelDelete}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete Order
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default OrdersPage;
